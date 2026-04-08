import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '../../lib/supabase';
import { parseIRacingCSV } from '../../lib/csvParser';
import {
  getPositionPoints,
  calculateBonuses,
  calculateIncidentPenalty,
} from '../../lib/points';
import {
  Upload,
  AlertCircle,
  CheckCircle,
  FileText,
  Loader,
  X,
  ChevronDown,
} from 'lucide-react';

export default function UploadRace() {
  const [file, setFile] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stages, setStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState('');
  const [raceNumber, setRaceNumber] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status, setStatus] = useState('idle'); // idle, parsing, previewing, uploading, success

  useEffect(() => {
    fetchStagesAndDrivers();
  }, []);

  const fetchStagesAndDrivers = async () => {
    try {
      const { data: stagesData } = await supabase
        .from('stages')
        .select('*')
        .eq('is_active', true)
        .order('stage_number', { ascending: true });

      const { data: driversData } = await supabase
        .from('drivers')
        .select('id, name, cust_id')
        .eq('active', true);

      setStages(stagesData || []);
      setDrivers(driversData || []);
    } catch (err) {
      console.error('Error fetching stages/drivers:', err);
      setError('Failed to load stages and drivers');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      readFile(dropped);
    } else {
      setError('Please drop a CSV file');
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.name.endsWith('.csv')) {
      readFile(selected);
    } else {
      setError('Please select a CSV file');
    }
  };

  const readFile = (fileToRead) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setCsvText(text);
      setFile(fileToRead);
      setError('');
      setStatus('parsing');
      parseCSV(text);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(fileToRead);
  };

  const parseCSV = (text) => {
    try {
      const result = parseIRacingCSV(text);
      setParsed(result);
      generatePreview(result);
      setStatus('previewing');
    } catch (err) {
      setError(`Failed to parse CSV: ${err.message}`);
      setStatus('idle');
    }
  };

  const generatePreview = (result) => {
    if (!result.results || result.results.length === 0) {
      setError('No race results found in CSV');
      return;
    }

    // Calculate points for preview
    const previewResults = result.results.slice(0, 10).map((r) => {
      const positionPts = getPositionPoints(r.finPos);
      const bonuses = calculateBonuses(r, result.results);
      const incidentPts = calculateIncidentPenalty(r.incidents || 0);
      return {
        ...r,
        positionPts,
        bonuses,
        incidentPts,
        totalPts: positionPts + Object.values(bonuses).reduce((a, b) => a + b, 0) + incidentPts,
      };
    });

    setPreview({
      metadata: result.metadata,
      totalResults: result.results.length,
      previewResults,
    });
  };

  const handleUpload = async () => {
    if (!parsed || !selectedStage || !raceNumber) {
      setError('Please select stage, enter race number, and parse CSV');
      return;
    }

    setLoading(true);
    setStatus('uploading');
    setError('');

    try {
      // Create race record
      const { data: race, error: raceError } = await supabase
        .from('races')
        .insert({
          stage_id: selectedStage,
          race_number: parseInt(raceNumber),
          race_date: parsed.metadata.startTime || new Date().toISOString().split('T')[0],
          track_name: parsed.metadata.track || 'Unknown Track',
          series: parsed.metadata.series || '',
          status: 'completed',
          total_laps: 0,
        })
        .select()
        .single();

      if (raceError) throw raceError;

      // Create driver map from cust_id to driver id
      const driverMap = {};
      drivers.forEach((d) => {
        if (d.cust_id) {
          driverMap[d.cust_id] = d.id;
        }
      });

      // Insert race results
      const raceResults = parsed.results
        .map((result) => {
          const driverId = driverMap[result.custId];
          if (!driverId) return null;

          const positionPts = getPositionPoints(result.finPos);
          const bonusObj = calculateBonuses(result, parsed.results);
          const bonusPts = Object.values(bonusObj).reduce((a, b) => a + b, 0);
          const incidentPts = calculateIncidentPenalty(result.incidents || 0);

          return {
            race_id: race.id,
            driver_id: driverId,
            finish_position: result.finPos,
            start_position: result.startPos || 0,
            car_class: result.carClass || '',
            car_number: result.carNumber || 0,
            laps_completed: result.lapsCompleted || 0,
            laps_led: result.lapsLed || 0,
            incidents: result.incidents || 0,
            dnf_reason: result.outReason || '',
            qualify_time: result.qualifyTime || null,
            avg_lap_time: result.avgLapTime || null,
            fastest_lap_time: result.fastestLapTime || null,
            fastest_lap_number: result.fastestLapNumber || null,
            interval: result.interval || '',
            race_points: positionPts,
            bonus_points: bonusPts,
            penalty_points: incidentPts,
            total_points: positionPts + bonusPts + incidentPts,
          };
        })
        .filter((r) => r !== null);

      if (raceResults.length === 0) {
        throw new Error('No drivers matched in the CSV. Check cust_id mapping.');
      }

      const { error: resultsError } = await supabase
        .from('race_results')
        .insert(raceResults);

      if (resultsError) throw resultsError;

      // TODO: Recalculate standings here in a production app
      // This would typically be done with a database trigger or function

      setStatus('success');
      setSuccess(
        `Race uploaded successfully! ${raceResults.length} drivers recorded.`
      );
      setParsed(null);
      setPreview(null);
      setFile(null);
      setCsvText('');
      setRaceNumber('');
      setSelectedStage('');

      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload race');
      setStatus('previewing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#0a0a0f] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Upload Race Results</h1>
          <p className="text-[#8a8a9a]">
            Upload iRacing CSV export to add race results to the league
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#1a1a2e] border border-[#e63946] rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#e63946] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#e63946] font-medium">Error</p>
              <p className="text-[#e63946] text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[#1a1a2e] border border-[#2ec4b6] rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#2ec4b6] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#2ec4b6] font-medium">Success</p>
              <p className="text-[#2ec4b6] text-sm mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* File Upload Area */}
        {!parsed && (
          <div className="bg-[#14141f] border-2 border-dashed border-[#2a2a3e] rounded-lg p-12 text-center mb-8 hover:border-[#f5a623] transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csvInput"
            />
            <label htmlFor="csvInput" className="cursor-pointer">
              <Upload className="w-12 h-12 text-[#f5a623] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Drag & drop CSV file here
              </h3>
              <p className="text-[#8a8a9a] mb-4">or click to browse</p>
              <p className="text-[#8a8a9a] text-sm">
                {file?.name || 'iRacing CSV export format'}
              </p>
            </label>
          </div>
        )}

        {/* Parsed Metadata */}
        {parsed && (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#f5a623]" />
              <h2 className="text-lg font-semibold text-white">Race Metadata</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[#8a8a9a] text-sm mb-2">Track</label>
                <p className="text-white font-medium">{parsed.metadata.track || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-[#8a8a9a] text-sm mb-2">Series</label>
                <p className="text-white font-medium">{parsed.metadata.series || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-[#8a8a9a] text-sm mb-2">Start Time</label>
                <p className="text-white font-medium">
                  {parsed.metadata.startTime || 'Unknown'}
                </p>
              </div>
              <div>
                <label className="block text-[#8a8a9a] text-sm mb-2">Drivers</label>
                <p className="text-white font-medium">{preview?.totalResults || 0} drivers</p>
              </div>
            </div>

            {/* Stage and Race Number Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-[#2a2a3e]">
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-white mb-2">
                  Stage <span className="text-[#e63946]">*</span>
                </label>
                <select
                  id="stage"
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                >
                  <option value="">Select stage...</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="raceNum" className="block text-sm font-medium text-white mb-2">
                  Race Number <span className="text-[#e63946]">*</span>
                </label>
                <input
                  id="raceNum"
                  type="number"
                  min="1"
                  max="36"
                  value={raceNumber}
                  onChange={(e) => setRaceNumber(e.target.value)}
                  placeholder="1-12"
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                />
              </div>
            </div>

            {/* Clear button */}
            <button
              onClick={() => {
                setParsed(null);
                setPreview(null);
                setCsvText('');
                setFile(null);
                setError('');
              }}
              className="text-[#8a8a9a] hover:text-white flex items-center gap-2 text-sm"
            >
              <X className="w-4 h-4" />
              Clear and upload different file
            </button>
          </div>
        )}

        {/* Results Preview */}
        {preview && (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden mb-6">
            <div className="p-6 border-b border-[#2a2a3e]">
              <h2 className="text-lg font-semibold text-white">
                Results Preview ({preview.previewResults.length} of {preview.totalResults})
              </h2>
              <p className="text-[#8a8a9a] text-sm mt-1">
                Showing first 10 results. All {preview.totalResults} drivers will be uploaded.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a2e] border-b border-[#2a2a3e]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                      Car
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                      Laps
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                      Led
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[#8a8a9a]">
                      Incidents
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-[#8a8a9a]">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preview.previewResults.map((result, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-[#2a2a3e] hover:bg-[#1a1a2e] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-block w-8 h-8 bg-[#f5a623] text-[#0a0a0f] rounded-full flex items-center justify-center text-sm font-bold">
                          {result.finPos}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{result.name}</td>
                      <td className="px-6 py-4 text-[#8a8a9a]">{result.carNumber}</td>
                      <td className="px-6 py-4 text-[#8a8a9a]">{result.lapsCompleted}</td>
                      <td className="px-6 py-4 text-[#8a8a9a]">{result.lapsLed}</td>
                      <td className="px-6 py-4 text-[#8a8a9a]">{result.incidents}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-[#2ec4b6]">{result.totalPts}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {preview && (
          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={loading || !selectedStage || !raceNumber}
              className="flex-1 py-3 bg-[#2ec4b6] text-white font-semibold rounded-lg hover:bg-[#28b0a4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirm & Upload
                </>
              )}
            </button>
          </div>
        )}

        {/* Status Indicator */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-[#8a8a9a]">
            {status === 'parsing' && <Loader className="w-4 h-4 animate-spin" />}
            {status === 'previewing' && <FileText className="w-4 h-4" />}
            {status === 'uploading' && <Loader className="w-4 h-4 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-4 h-4 text-[#2ec4b6]" />}
            <span className="text-sm">
              {status === 'idle' && 'Ready to upload'}
              {status === 'parsing' && 'Parsing CSV...'}
              {status === 'previewing' && 'Preview ready'}
              {status === 'uploading' && 'Uploading race results...'}
              {status === 'success' && 'Race uploaded successfully'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
