import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Trophy, Zap, Shield } from 'lucide-react';
import { useComputedStandings } from '../hooks/useSupabase';

export default function Standings() {
  const [selectedStage, setSelectedStage] = useState('stage1');
  const [expandedSection, setExpandedSection] = useState(false);
  const { standings, stageBonusTracker, loading, error } = useComputedStandings();

  // Fallback to empty state while loading
  const displayStandings = standings || [];
  const leader = displayStandings[0] || { name: '—', points: '—' };
  const mostWins =
    displayStandings.length > 0
      ? displayStandings.reduce((max, driver) =>
          driver.wins > (max.wins || 0) ? driver : max
        )
      : { name: '—', wins: '—' };
  const bestAvgFinish =
    displayStandings.length > 0
      ? displayStandings.reduce((min, driver) =>
          driver.avgFinish < (min.avgFinish || Infinity) ? driver : min
        )
      : { name: '—', avgFinish: '—' };
  const mostLapsLed =
    displayStandings.length > 0
      ? displayStandings.reduce((max, driver) =>
          driver.lapsLed > (max.lapsLed || 0) ? driver : max
        )
      : { name: '—', lapsLed: '—' };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Page Header — NASCAR.com bold left-border style */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 0' }}>
        <div style={{ borderLeft: '4px solid #003DA5', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1a1a2e', lineHeight: 1, margin: 0, textTransform: 'uppercase' }}>
            Standings
          </h1>
          <p style={{ color: '#6c6d6f', fontSize: '0.875rem', marginTop: '0.375rem' }}>
            2026 Season — All Stages
          </p>
        </div>

        {/* Stage Tabs — NASCAR.com tab strip */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e0e0e0', marginBottom: '1.5rem' }}>
          {['stage1', 'stage2', 'stage3', 'overall'].map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              style={{
                padding: '0.75rem 1.5rem',
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                border: 'none',
                cursor: 'pointer',
                background: 'none',
                color: selectedStage === stage ? '#003DA5' : '#6c6d6f',
                borderBottom: selectedStage === stage ? '3px solid #003DA5' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
            >
              {stage === 'stage1' ? 'Stage 1: Trucks'
                : stage === 'stage2' ? 'Stage 2: Xfinity'
                : stage === 'stage3' ? 'Stage 3: Cup'
                : 'Overall'}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }}></div>
              <p style={{ color: '#6c6d6f' }}>Loading standings data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ backgroundColor: 'rgba(200,16,46,0.06)', border: '1px solid #c8102e', borderRadius: '0.375rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#c8102e', fontWeight: 700 }}>Error loading standings</p>
            <p style={{ color: '#6c6d6f', fontSize: '0.875rem', marginTop: '0.375rem' }}>{error}</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Quick Stats Strip — NASCAR.com horizontal bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid #e0e0e0', borderRadius: '0.375rem', overflow: 'hidden', marginBottom: '1rem' }}>
              {[
                { label: 'Leader', name: leader.name, value: `${leader.points} pts`, color: '#003DA5' },
                { label: 'Most Wins', name: mostWins.name, value: `${mostWins.wins} wins`, color: '#008564' },
                { label: 'Best Avg Finish', name: bestAvgFinish.name, value: bestAvgFinish.avgFinish, color: '#1a1a2e' },
                { label: 'Most Laps Led', name: mostLapsLed.name, value: mostLapsLed.lapsLed, color: '#003DA5' },
              ].map((stat, idx) => (
                <div key={stat.label} style={{
                  padding: '1rem 1.25rem',
                  borderRight: idx < 3 ? '1px solid #e0e0e0' : 'none',
                  backgroundColor: '#fff',
                }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6c6d6f', marginBottom: '0.25rem' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.125rem' }}>
                    {stat.name}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Drop System Info */}
            {stageBonusTracker && (
              <div style={{ backgroundColor: 'rgba(0, 61, 165, 0.04)', borderLeft: '3px solid #003DA5', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#6c6d6f' }}>
                <span style={{ color: '#003DA5', fontWeight: 700 }}>Drop {stageBonusTracker.dropsAllowed} worst</span> of {stageBonusTracker.totalRaces} races per stage.
                {' '}DNRs count as 0-point races and are dropped first.
                {' '}<span style={{ color: '#1a1a2e', fontWeight: 600 }}>{stageBonusTracker.racesCompleted} of {stageBonusTracker.totalRaces} races completed.</span>
              </div>
            )}

            {/* Standings Table — NASCAR.com style with tighter rows */}
            <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.375rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1a1a2e' }}>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'center', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: '52px' }}>
                        Pos
                      </th>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'left', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Driver
                      </th>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'left', color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                          className="hidden md:table-cell"
                      >
                        Team
                      </th>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: '#ffcf00', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Points
                      </th>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: '52px' }}>
                        Gap
                      </th>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: '52px' }}>
                        +/-
                      </th>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: '52px' }}>
                        Pen
                      </th>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: '42px' }}>
                        W
                      </th>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: '42px' }}>
                        T5
                      </th>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: '52px' }}
                          className="hidden lg:table-cell"
                      >
                        Avg
                      </th>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: '52px' }}
                          className="hidden lg:table-cell"
                      >
                        Led
                      </th>
                      <th style={{ padding: '0.625rem 0.75rem', textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: '42px' }}
                          className="hidden lg:table-cell"
                      >
                        Inc
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayStandings.map((driver, idx) => {
                      const gap = idx === 0 ? '—' : `−${leader.points - driver.points}`;
                      return (
                      <tr
                        key={driver.id}
                        style={{
                          borderBottom: '1px solid #e0e0e0',
                          backgroundColor: idx === 0 ? 'rgba(0, 61, 165, 0.03)' : '#fff',
                          transition: 'background-color 0.15s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f7f7'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx === 0 ? 'rgba(0, 61, 165, 0.03)' : '#fff'}
                        onClick={() => window.location.href = `/drivers/${driver.id}`}
                      >
                        {/* Position */}
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px', borderRadius: '4px',
                            fontWeight: 800, fontSize: '0.8125rem',
                            backgroundColor: idx === 0 ? '#003DA5' : idx < 3 ? '#1a1a2e' : '#e0e0e0',
                            color: idx < 3 ? '#fff' : '#1a1a2e',
                          }}>
                            {idx + 1}
                          </div>
                        </td>
                        {/* Driver */}
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <Link to={`/drivers/${driver.id}`} style={{ textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.875rem' }}>{driver.name}</div>
                            <div style={{ fontSize: '0.6875rem', color: '#6c6d6f' }}>#{driver.number}</div>
                          </Link>
                        </td>
                        {/* Team */}
                        <td style={{ padding: '0.5rem 0.75rem', color: '#6c6d6f', fontSize: '0.8125rem' }}
                            className="hidden md:table-cell"
                        >
                          {driver.team}
                        </td>
                        {/* Points */}
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                          <span style={{ fontWeight: 800, color: '#003DA5', fontSize: '1rem' }}>{driver.points}</span>
                          {driver.droppedPoints > 0 && (
                            <div style={{ fontSize: '0.625rem', color: '#6c6d6f' }}>{driver.rawPoints} raw</div>
                          )}
                        </td>
                        {/* Gap to leader */}
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: idx === 0 ? '#6c6d6f' : '#c8102e', fontWeight: 600, fontSize: '0.8125rem' }}>
                          {gap}
                        </td>
                        {/* Bonus */}
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                          {driver.bonusPoints > 0 ? (
                            <span style={{ color: '#008564', fontWeight: 600, fontSize: '0.8125rem' }}>
                              +{driver.bonusPoints % 1 === 0 ? driver.bonusPoints : driver.bonusPoints.toFixed(1)}
                            </span>
                          ) : (
                            <span style={{ color: '#ccc' }}>—</span>
                          )}
                        </td>
                        {/* Penalty */}
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                          {driver.penaltyPoints < 0 ? (
                            <span style={{ color: '#c8102e', fontWeight: 600, fontSize: '0.8125rem' }}>{driver.penaltyPoints}</span>
                          ) : (
                            <span style={{ color: '#ccc' }}>—</span>
                          )}
                        </td>
                        {/* Wins */}
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 700, color: driver.wins > 0 ? '#1a1a2e' : '#ccc', fontSize: '0.875rem' }}>
                          {driver.wins}
                        </td>
                        {/* Top 5 */}
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 600, color: driver.top5 > 0 ? '#008564' : '#ccc', fontSize: '0.875rem' }}>
                          {driver.top5}
                        </td>
                        {/* Avg Finish */}
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#1a1a2e', fontWeight: 600, fontSize: '0.8125rem' }}
                            className="hidden lg:table-cell"
                        >
                          {(driver.avgFinish || 0).toFixed(1)}
                        </td>
                        {/* Laps Led */}
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: driver.lapsLed > 0 ? '#003DA5' : '#ccc', fontWeight: 600, fontSize: '0.8125rem' }}
                            className="hidden lg:table-cell"
                        >
                          {driver.lapsLed}
                        </td>
                        {/* Incidents */}
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#c8102e', fontWeight: 600, fontSize: '0.8125rem' }}
                            className="hidden lg:table-cell"
                        >
                          {driver.totalIncidents}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stage Bonus Tracker */}
            {selectedStage !== 'overall' && stageBonusTracker && (
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.375rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div style={{ borderLeft: '4px solid #003DA5', padding: '1rem 1.25rem', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a2e', margin: 0, textTransform: 'uppercase' }}>Stage Champion Bonus Tracker</h3>
                  <span style={{ color: '#6c6d6f', fontSize: '0.75rem' }}>
                    {stageBonusTracker.racesCompleted} of {stageBonusTracker.totalRaces} races • +3 pts each
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {/* Most Laps Led */}
                  <div style={{ padding: '1rem 1.25rem', borderRight: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                      <Trophy size={14} style={{ color: '#003DA5' }} />
                      <span style={{ color: '#6c6d6f', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Most Laps Led</span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9375rem' }}>{stageBonusTracker.mostLapsLed.name}</div>
                    <div style={{ color: '#003DA5', fontSize: '0.8125rem', fontWeight: 700, marginTop: '0.125rem' }}>{stageBonusTracker.mostLapsLed.value} laps</div>
                  </div>

                  {/* Lowest Incidents */}
                  <div style={{ padding: '1rem 1.25rem', borderRight: '1px solid #e0e0e0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                      <Shield size={14} style={{ color: '#008564' }} />
                      <span style={{ color: '#6c6d6f', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Lowest Incidents</span>
                    </div>
                    {stageBonusTracker.lowestIncidents.qualified ? (
                      <>
                        <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9375rem' }}>{stageBonusTracker.lowestIncidents.name}</div>
                        <div style={{ color: '#008564', fontSize: '0.8125rem', fontWeight: 700, marginTop: '0.125rem' }}>{stageBonusTracker.lowestIncidents.value} incidents</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, color: '#6c6d6f', fontSize: '0.9375rem' }}>No one qualifies yet</div>
                        <div style={{ color: '#6c6d6f', fontSize: '0.6875rem', marginTop: '0.125rem' }}>Requires {stageBonusTracker.lowestIncidents.minRaces}+ races</div>
                      </>
                    )}
                  </div>

                  {/* Most Fastest Laps */}
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                      <Zap size={14} style={{ color: '#c8102e' }} />
                      <span style={{ color: '#6c6d6f', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Most Fastest Laps</span>
                    </div>
                    {stageBonusTracker.mostFastestLaps.isTied ? (
                      <>
                        <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9375rem' }}>{stageBonusTracker.mostFastestLaps.leaders.length}-way tie</div>
                        <div style={{ color: '#6c6d6f', fontSize: '0.6875rem', marginTop: '0.125rem' }}>
                          {stageBonusTracker.mostFastestLaps.leaders.join(', ')} ({stageBonusTracker.mostFastestLaps.value} each)
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9375rem' }}>{stageBonusTracker.mostFastestLaps.leaders[0]}</div>
                        <div style={{ color: '#c8102e', fontSize: '0.8125rem', fontWeight: 700, marginTop: '0.125rem' }}>{stageBonusTracker.mostFastestLaps.value} awards</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Points Breakdown Section */}
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.375rem', overflow: 'hidden', marginBottom: '2rem' }}>
          <button
            onClick={() => setExpandedSection(!expandedSection)}
            style={{
              width: '100%', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f7f7'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a2e', margin: 0, textTransform: 'uppercase' }}>Points Breakdown</h3>
            <ChevronDown
              size={20}
              style={{ color: '#003DA5', transform: expandedSection ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
            />
          </button>

          {expandedSection && (
            <div style={{ borderTop: '1px solid #e0e0e0', padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Position Points */}
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.375rem', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#1a1a2e', padding: '0.5rem 0.75rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Position Points</h4>
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    {[
                      ['1st Place', '40 points'],
                      ['2nd Place', '35 points'],
                      ['3rd Place', '34 points'],
                      ['4th–5th', '33–32 pts'],
                      ['6th–10th', '31–27 pts'],
                      ['40th Place', '1 point'],
                    ].map(([pos, pts]) => (
                      <div key={pos} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ color: '#6c6d6f', fontSize: '0.8125rem' }}>{pos}</span>
                        <span style={{ color: '#1a1a2e', fontWeight: 700, fontSize: '0.8125rem' }}>{pts}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bonus Points */}
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.375rem', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#008564', padding: '0.5rem 0.75rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Bonus Points (+2 each)</h4>
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    {[
                      ['Pole (P1 start)', '+2'],
                      ['Fastest Lap', '+2'],
                      ['Most Laps Led', '+2'],
                      ['Lowest Incidents', '+2'],
                    ].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ color: '#6c6d6f', fontSize: '0.8125rem' }}>{label}</span>
                        <span style={{ color: '#008564', fontWeight: 700, fontSize: '0.8125rem' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Penalties */}
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.375rem', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#c8102e', padding: '0.5rem 0.75rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Incident Penalties</h4>
                  </div>
                  <div style={{ padding: '0.75rem' }}>
                    {[
                      ['20–29 incidents', '-1'],
                      ['30–39 incidents', '-2'],
                      ['40+ incidents', '-3'],
                    ].map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ color: '#6c6d6f', fontSize: '0.8125rem' }}>{label}</span>
                        <span style={{ color: '#c8102e', fontWeight: 700, fontSize: '0.8125rem' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage/Rules */}
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.375rem', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#003DA5', padding: '0.5rem 0.75rem' }}>
                    <h4 style={{ color: '#fff', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Stage Rules</h4>
                  </div>
                  <div style={{ padding: '0.75rem', color: '#6c6d6f', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}>36-race season split into 3 stages of 12 races. Drop your worst 3 races per stage.</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}>Points based on overall finishing position among all drivers (including AI).</p>
                    <p style={{ margin: 0 }}><strong style={{ color: '#003DA5' }}>Stage Champion Bonuses:</strong> +3 pts each for Most Laps Led, Lowest Incidents, and Most Fastest Laps across the stage.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
