import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Flag, CheckCircle, AlertCircle, Loader } from 'lucide-react';

// In-race caution stage points: top 5 score 5 / 4 / 3 / 2 / 1
const STAGE_POINTS = [5, 4, 3, 2, 1];

export default function ManageStagePoints() {
  const [races, setRaces] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [raceId, setRaceId] = useState('');

  // picks[caution][positionIndex] = driverId ('' = none)
  const [stage1, setStage1] = useState(['', '', '', '', '']);
  const [stage2, setStage2] = useState(['', '', '', '', '']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Load Stage 2 races + league drivers ──
  useEffect(() => {
    const load = async () => {
      try {
        const { data: raceRows, error: rErr } = await supabase
          .from('races')
          .select('id, race_number, track_name, status, stages ( stage_number )')
          .order('race_number', { ascending: true });
        if (rErr) throw rErr;

        // Stage 2 races only (in-race stage points are a Stage 2 feature)
        const stage2Races = (raceRows || []).filter((r) => r.stages?.stage_number === 2);
        setRaces(stage2Races);

        const { data: driverRows, error: dErr } = await supabase
          .from('drivers')
          .select('id, name, car_number')
          .eq('active', true)
          .order('name', { ascending: true });
        if (dErr) throw dErr;
        setDrivers(driverRows || []);
      } catch (err) {
        setError(err.message || 'Failed to load races/drivers');
      }
    };
    load();
  }, []);

  // ── When a race is selected, load any existing stage results ──
  useEffect(() => {
    if (!raceId) {
      setStage1(['', '', '', '', '']);
      setStage2(['', '', '', '', '']);
      return;
    }
    const load = async () => {
      setSuccess('');
      setError('');
      const { data, error: e } = await supabase
        .from('race_stage_results')
        .select('stage_number, position, driver_id')
        .eq('race_id', raceId);
      if (e) {
        setError(e.message);
        return;
      }
      const s1 = ['', '', '', '', ''];
      const s2 = ['', '', '', '', ''];
      (data || []).forEach((row) => {
        const idx = row.position - 1;
        if (idx < 0 || idx > 4) return;
        if (row.stage_number === 1) s1[idx] = row.driver_id;
        else if (row.stage_number === 2) s2[idx] = row.driver_id;
      });
      setStage1(s1);
      setStage2(s2);
    };
    load();
  }, [raceId]);

  const driverName = useMemo(() => {
    const m = new Map();
    drivers.forEach((d) => m.set(d.id, d.name));
    return m;
  }, [drivers]);

  // Per-driver total stage points across both cautions (live preview)
  const driverTotals = useMemo(() => {
    const totals = {};
    [stage1, stage2].forEach((picks) => {
      picks.forEach((driverId, i) => {
        if (!driverId) return;
        totals[driverId] = (totals[driverId] || 0) + STAGE_POINTS[i];
      });
    });
    return Object.entries(totals)
      .map(([id, pts]) => ({ name: driverName.get(id) || 'Unknown', pts }))
      .sort((a, b) => b.pts - a.pts);
  }, [stage1, stage2, driverName]);

  const setPick = (caution, posIdx, value) => {
    const setter = caution === 1 ? setStage1 : setStage2;
    setter((prev) => prev.map((v, i) => (i === posIdx ? value : v)));
  };

  const handleSave = async () => {
    if (!raceId) {
      setError('Select a race first.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const rows = [];
      stage1.forEach((d, i) => {
        if (d) rows.push({ race_id: raceId, stage_number: 1, position: i + 1, driver_id: d, points: STAGE_POINTS[i] });
      });
      stage2.forEach((d, i) => {
        if (d) rows.push({ race_id: raceId, stage_number: 2, position: i + 1, driver_id: d, points: STAGE_POINTS[i] });
      });

      // Replace any existing stage results for this race
      const { error: delErr } = await supabase.from('race_stage_results').delete().eq('race_id', raceId);
      if (delErr) throw delErr;

      if (rows.length > 0) {
        const { error: insErr } = await supabase.from('race_stage_results').insert(rows);
        if (insErr) throw insErr;
      }

      setSuccess(
        `Saved ${rows.length} stage entr${rows.length === 1 ? 'y' : 'ies'}. Standings will include these points automatically.`
      );
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to save stage points');
    } finally {
      setLoading(false);
    }
  };

  const selectClass =
    'w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors';

  const StageColumn = ({ title, picks, caution }) => (
    <div className="flex-1 min-w-[280px] bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-[#8a8a9a] text-sm mb-4">Top 5 earn +5 / +4 / +3 / +2 / +1</p>
      {picks.map((val, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <span className="w-16 text-white font-bold text-sm">
            P{i + 1} <span className="text-[#2ec4b6]">+{STAGE_POINTS[i]}</span>
          </span>
          <select className={selectClass} value={val} onChange={(e) => setPick(caution, i, e.target.value)}>
            <option value="">— none —</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8 bg-[#0a0a0f] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Flag className="w-8 h-8 text-[#f5a623]" />
          <div>
            <h1 className="text-4xl font-bold text-white">Stage Points</h1>
            <p className="text-[#8a8a9a]">
              Enter the in-race Stage 1 &amp; Stage 2 caution top-5 for a Stage 2 race. Finish points are
              scored separately at upload.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#1a1a2e] border border-[#e63946] rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#e63946] flex-shrink-0 mt-0.5" />
            <p className="text-[#e63946] text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-[#1a1a2e] border border-[#2ec4b6] rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#2ec4b6] flex-shrink-0 mt-0.5" />
            <p className="text-[#2ec4b6] text-sm">{success}</p>
          </div>
        )}

        <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-white mb-2">Race</label>
          <select className={selectClass} value={raceId} onChange={(e) => setRaceId(e.target.value)}>
            <option value="">Select a Stage 2 race...</option>
            {races.map((r) => (
              <option key={r.id} value={r.id}>
                Race {String(r.race_number).padStart(2, '0')} — {r.track_name}
              </option>
            ))}
          </select>
          {races.length === 0 && (
            <p className="text-[#8a8a9a] text-sm mt-2">No Stage 2 races found yet.</p>
          )}
        </div>

        {raceId && (
          <>
            <div className="flex flex-wrap gap-6 mb-6">
              <StageColumn title="Stage 1 caution" picks={stage1} caution={1} />
              <StageColumn title="Stage 2 caution" picks={stage2} caution={2} />
            </div>

            {driverTotals.length > 0 && (
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-4 mb-6">
                <p className="text-[#8a8a9a] text-sm mb-2">Stage points this race (preview):</p>
                <div className="flex flex-wrap gap-2">
                  {driverTotals.map((d) => (
                    <span
                      key={d.name}
                      className="px-3 py-1 bg-[#0a0a0f] border border-[#2a2a3e] rounded-full text-white text-sm"
                    >
                      {d.name} <span className="text-[#2ec4b6] font-bold">+{d.pts}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 bg-[#2ec4b6] text-white font-semibold rounded-lg hover:bg-[#28b0a4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" /> Save Stage Points
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
