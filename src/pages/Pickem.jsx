import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useDrivers, useRaceResultsByRace } from '../hooks/useSupabase';

export default function Pickem() {
  const { data: drivers, loading: driversLoading } = useDrivers();
  const { data: races, loading: racesLoading } = useRaceResultsByRace();

  const [picks, setPicks] = useState({
    first: '',
    second: '',
    third: '',
    fourth: '',
    fifth: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const lastRaceResults = races && races.length > 0 ? races[races.length - 1].results : [];
  const lastRaceName = races && races.length > 0 ? races[races.length - 1].track : 'Previous Race';

  const handlePickChange = (position, value) => {
    setPicks((prev) => ({
      ...prev,
      [position]: value,
    }));
    setValidationError('');
  };

  const validatePicks = () => {
    const selectedDrivers = Object.values(picks).filter((id) => id !== '');

    if (selectedDrivers.length < 5) {
      setValidationError('Please select all 5 positions');
      return false;
    }

    const uniqueDrivers = new Set(selectedDrivers);
    if (uniqueDrivers.size !== 5) {
      setValidationError('Cannot pick the same driver twice');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validatePicks()) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setPicks({
      first: '',
      second: '',
      third: '',
      fourth: '',
      fifth: '',
    });
    setSubmitted(false);
    setValidationError('');
  };

  const getDriverName = (driverId) => {
    return drivers?.find((d) => d.id === driverId)?.name || '';
  };

  const getDriverNumber = (driverId) => {
    return drivers?.find((d) => d.id === driverId)?.car_number || '';
  };

  const positions = [
    { key: 'first', label: '1st Place', position: '🥇' },
    { key: 'second', label: '2nd Place', position: '🥈' },
    { key: 'third', label: '3rd Place', position: '🥉' },
    { key: 'fourth', label: '4th Place', position: '4️⃣' },
    { key: 'fifth', label: '5th Place', position: '5️⃣' },
  ];

  if (driversLoading || racesLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
        <p style={{ color: '#8a8a9a' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="max-w-4xl mx-auto">
        <div
          className="mb-8 p-6 rounded-lg border-2"
          style={{
            backgroundColor: '#14141f',
            borderColor: '#f5a623',
          }}
        >
          <h1 className="text-3xl font-bold" style={{ color: '#f5a623' }}>
            Bristol Pick'em
          </h1>
          <p className="text-lg mt-2" style={{ color: '#8a8a9a' }}>
            Next Race: Bristol Motor Speedway
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pick'em Section */}
          <div className="lg:col-span-2">
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: '#14141f',
                borderColor: '#2a2a3e',
              }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#f5a623' }}>
                Make Your Picks
              </h2>

              {validationError && (
                <div
                  className="mb-6 p-4 rounded-lg flex items-center gap-3 border"
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderColor: '#e63946',
                  }}
                >
                  <AlertCircle size={20} style={{ color: '#e63946' }} />
                  <p style={{ color: '#e63946' }}>{validationError}</p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                {positions.map((pos) => (
                  <div key={pos.key}>
                    <label
                      className="block text-sm font-bold mb-2"
                      style={{ color: '#2ec4b6' }}
                    >
                      {pos.position} {pos.label}
                    </label>
                    <select
                      value={picks[pos.key]}
                      onChange={(e) => handlePickChange(pos.key, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border font-medium"
                      style={{
                        backgroundColor: '#0a0a0f',
                        borderColor: picks[pos.key] ? '#2ec4b6' : '#2a2a3e',
                        color: picks[pos.key] ? '#ffffff' : '#8a8a9a',
                      }}
                    >
                      <option value="">Select a driver...</option>
                      {drivers?.map((driver) => {
                        const isSelected = Object.values(picks).includes(driver.id);
                        const isCurrentSelection = picks[pos.key] === driver.id;
                        const isDisabled = isSelected && !isCurrentSelection;

                        return (
                          <option
                            key={driver.id}
                            value={driver.id}
                            disabled={isDisabled}
                          >
                            #{driver.car_number} {driver.name}
                            {isDisabled ? ' (already selected)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitted}
                  className="flex-1 px-6 py-3 rounded-lg font-bold text-white transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: submitted ? '#8a8a9a' : '#f5a623',
                  }}
                >
                  Submit Picks
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 rounded-lg font-bold transition-all"
                  style={{
                    backgroundColor: '#2a2a3e',
                    color: '#ffffff',
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Submission Status */}
            {submitted && (
              <div
                className="p-6 rounded-lg border-2"
                style={{
                  backgroundColor: '#14141f',
                  borderColor: '#2ec4b6',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle size={24} style={{ color: '#2ec4b6' }} />
                  <h3 className="text-lg font-bold text-white">Submitted!</h3>
                </div>
                <p className="text-sm mb-4" style={{ color: '#8a8a9a' }}>
                  Your picks for Bristol have been locked in.
                </p>
                <div className="space-y-2 text-sm">
                  {positions.map((pos) => (
                    <div
                      key={pos.key}
                      className="flex justify-between items-center p-2 rounded"
                      style={{ backgroundColor: '#0a0a0f' }}
                    >
                      <span style={{ color: '#8a8a9a' }}>{pos.label}</span>
                      <span className="font-bold text-white">
                        {picks[pos.key]
                          ? `#${getDriverNumber(
                              picks[pos.key]
                            )} ${getDriverName(picks[pos.key])}`
                          : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard Placeholder */}
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: '#14141f',
                borderColor: '#2a2a3e',
              }}
            >
              <h3 className="text-lg font-bold mb-3" style={{ color: '#f5a623' }}>
                Season Leaderboard
              </h3>
              <p style={{ color: '#8a8a9a' }} className="text-sm">
                Predictions leaderboard coming soon — submit your picks each week!
              </p>
            </div>
          </div>
        </div>

        {/* Last Race Results */}
        {lastRaceResults && lastRaceResults.length > 0 && (
          <div
            className="mt-8 p-6 rounded-lg border"
            style={{
              backgroundColor: '#14141f',
              borderColor: '#2a2a3e',
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#f5a623' }}>
              Last Race Results: {lastRaceName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {lastRaceResults.slice(0, 5).map((result, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg text-center border"
                  style={{
                    backgroundColor: '#0a0a0f',
                    borderColor: '#2a2a3e',
                  }}
                >
                  <div
                    className="text-3xl font-bold mb-2"
                    style={{ color: '#f5a623' }}
                  >
                    {result.position}
                  </div>
                  <p className="font-bold text-white text-sm mb-1">
                    {result.name}
                  </p>
                  <p style={{ color: '#2ec4b6' }} className="text-sm">
                    #{result.car_number}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
