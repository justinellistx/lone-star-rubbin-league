import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Trophy, Users, ChevronDown, ChevronUp, Award, Flag, Zap, Shield } from 'lucide-react';
import { usePayouts } from '../hooks/usePayouts';

const fmt = (n) => '$' + n.toLocaleString();

const TIER_COLORS = {
  crown: '#ffcf00',
  major: '#003DA5',
  standard: '#6c6d6f',
  finale: '#c8102e',
};

const TIER_BG = {
  crown: 'rgba(255,207,0,0.10)',
  major: 'rgba(0,61,165,0.06)',
  standard: 'rgba(108,109,111,0.06)',
  finale: 'rgba(200,16,46,0.08)',
};

export default function Payouts() {
  const { payouts, loading, error } = usePayouts();
  const [activeTab, setActiveTab] = useState('drivers');
  const [expandedDriver, setExpandedDriver] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);

  const driverLeaderboard = payouts?.driverLeaderboard || [];
  const teamLeaderboard = payouts?.teamLeaderboard || [];
  const racePayouts = payouts?.racePayouts || [];

  // Top stats
  const topEarner = driverLeaderboard[0];
  const totalPursePaid = driverLeaderboard.reduce((sum, d) => sum + d.totalEarnings, 0);
  const totalBonusesPaid = driverLeaderboard.reduce((sum, d) => sum + d.bonusEarnings, 0);
  const racesCompleted = racePayouts.length;

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem 3rem' }}>
        {/* Page Header */}
        <div style={{ borderLeft: '4px solid #008564', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1a1a2e', lineHeight: 1, margin: 0, textTransform: 'uppercase' }}>
            Payouts
          </h1>
          <p style={{ color: '#6c6d6f', fontSize: '0.875rem', marginTop: '0.375rem' }}>
            2026 Season Earnings — Race Purses & Bonus Awards
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }}></div>
              <p style={{ color: '#6c6d6f' }}>Loading payout data...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ backgroundColor: 'rgba(200,16,46,0.06)', border: '1px solid #c8102e', borderRadius: '0.375rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#c8102e', fontWeight: 700 }}>Error loading payouts</p>
            <p style={{ color: '#6c6d6f', fontSize: '0.875rem', marginTop: '0.375rem' }}>{error}</p>
          </div>
        )}

        {!loading && payouts && (
          <>
            {/* Quick Stats Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid #e0e0e0', borderRadius: '0.375rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
              {[
                { label: 'Top Earner', name: topEarner?.name || '—', value: topEarner ? fmt(topEarner.totalEarnings) : '—', color: '#008564' },
                { label: 'Total Purse Paid', name: `${racesCompleted} Races`, value: fmt(totalPursePaid), color: '#003DA5' },
                { label: 'Bonuses Awarded', name: 'Season Total', value: fmt(totalBonusesPaid), color: '#ffcf00' },
                { label: 'Avg Per Race', name: 'Per Driver', value: driverLeaderboard.length > 0 ? fmt(Math.round(totalPursePaid / racesCompleted / driverLeaderboard.length)) : '—', color: '#1a1a2e' },
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

            {/* Tab Strip */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e0e0e0', marginBottom: '1.5rem' }}>
              {[
                { key: 'drivers', label: 'Driver Earnings', icon: <DollarSign size={14} /> },
                { key: 'teams', label: 'Team Earnings', icon: <Users size={14} /> },
                { key: 'races', label: 'Race Breakdown', icon: <Flag size={14} /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.75rem 1.5rem',
                    fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase',
                    letterSpacing: '0.04em', border: 'none', cursor: 'pointer',
                    background: 'none',
                    color: activeTab === tab.key ? '#003DA5' : '#6c6d6f',
                    borderBottom: activeTab === tab.key ? '3px solid #003DA5' : '3px solid transparent',
                    marginBottom: '-2px', transition: 'all 0.15s ease', fontFamily: 'inherit',
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Driver Leaderboard */}
            {activeTab === 'drivers' && (
              <div>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 120px 120px 120px 130px 50px',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  backgroundColor: '#1a1a2e',
                  color: '#ffffff',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderRadius: '0.375rem 0.375rem 0 0',
                }}>
                  <span>Rank</span>
                  <span>Driver</span>
                  <span style={{ textAlign: 'right' }}>Position $</span>
                  <span style={{ textAlign: 'right' }}>Bonus $</span>
                  <span style={{ textAlign: 'right' }}>Races</span>
                  <span style={{ textAlign: 'right' }}>Total Earnings</span>
                  <span></span>
                </div>

                {driverLeaderboard.map((driver, idx) => (
                  <div key={driver.driverId}>
                    {/* Driver Row */}
                    <div
                      onClick={() => setExpandedDriver(expandedDriver === driver.driverId ? null : driver.driverId)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '50px 1fr 120px 120px 120px 130px 50px',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        backgroundColor: expandedDriver === driver.driverId ? 'rgba(0,61,165,0.04)' : idx % 2 === 0 ? '#fff' : '#fafafa',
                        transition: 'background-color 0.15s',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{
                        fontWeight: 800,
                        fontSize: '1.125rem',
                        color: idx < 3 ? '#008564' : '#1a1a2e',
                      }}>
                        {idx + 1}
                      </span>
                      <div>
                        <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9375rem' }}>
                          {driver.name}
                        </span>
                        <span style={{ color: '#6c6d6f', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                          #{driver.carNumber}
                        </span>
                        {driver.wins > 0 && (
                          <span style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            color: '#008564',
                            backgroundColor: 'rgba(0,133,100,0.08)',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.25rem',
                            textTransform: 'uppercase',
                          }}>
                            {driver.wins}W
                          </span>
                        )}
                      </div>
                      <span style={{ textAlign: 'right', fontWeight: 600, color: '#1a1a2e', fontSize: '0.875rem' }}>
                        {fmt(driver.positionEarnings)}
                      </span>
                      <span style={{ textAlign: 'right', fontWeight: 600, color: driver.bonusEarnings > 0 ? '#008564' : '#6c6d6f', fontSize: '0.875rem' }}>
                        {driver.bonusEarnings > 0 ? '+' + fmt(driver.bonusEarnings) : '—'}
                      </span>
                      <span style={{ textAlign: 'right', color: '#6c6d6f', fontSize: '0.875rem' }}>
                        {driver.racesCompleted}
                      </span>
                      <span style={{ textAlign: 'right', fontWeight: 800, color: '#008564', fontSize: '1.0625rem' }}>
                        {fmt(driver.totalEarnings)}
                      </span>
                      <span style={{ textAlign: 'center', color: '#6c6d6f' }}>
                        {expandedDriver === driver.driverId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>

                    {/* Expanded: Race-by-Race Breakdown */}
                    {expandedDriver === driver.driverId && (
                      <div style={{ backgroundColor: '#f4f5f6', padding: '1rem 1.5rem', borderBottom: '2px solid #003DA5' }}>
                        {/* Bonus Summary Chips */}
                        {driver.bonusEarnings > 0 && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            {driver.bonusCounts.pole > 0 && (
                              <span style={chipStyle('#003DA5')}>
                                <Flag size={11} /> Poles: {driver.bonusCounts.pole} ({fmt(driver.bonusCounts.pole * 2000)})
                              </span>
                            )}
                            {driver.bonusCounts.mostLapsLed > 0 && (
                              <span style={chipStyle('#008564')}>
                                <Zap size={11} /> Laps Led: {driver.bonusCounts.mostLapsLed} ({fmt(driver.bonusCounts.mostLapsLed * 2000)})
                              </span>
                            )}
                            {driver.bonusCounts.fastestLap > 0 && (
                              <span style={chipStyle('#c8102e')}>
                                <Zap size={11} /> Fastest: {driver.bonusCounts.fastestLap} ({fmt(driver.bonusCounts.fastestLap * 2000)})
                              </span>
                            )}
                            {driver.bonusCounts.cleanRace > 0 && (
                              <span style={chipStyle('#1a1a2e')}>
                                <Shield size={11} /> Clean: {driver.bonusCounts.cleanRace} ({fmt(driver.bonusCounts.cleanRace * 3000)})
                              </span>
                            )}
                          </div>
                        )}

                        {/* Race Breakdown Table */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '40px 1fr 100px 70px 90px 90px 100px',
                          gap: '0.25rem',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#6c6d6f',
                          padding: '0.375rem 0',
                          borderBottom: '1px solid #d0d0d0',
                          marginBottom: '0.25rem',
                        }}>
                          <span>Race</span>
                          <span>Track</span>
                          <span>Tier</span>
                          <span style={{ textAlign: 'center' }}>Finish</span>
                          <span style={{ textAlign: 'right' }}>Position $</span>
                          <span style={{ textAlign: 'right' }}>Bonus $</span>
                          <span style={{ textAlign: 'right' }}>Total</span>
                        </div>
                        {driver.raceBreakdown
                          .sort((a, b) => a.raceNumber - b.raceNumber)
                          .map((race) => (
                            <div key={race.raceNumber} style={{
                              display: 'grid',
                              gridTemplateColumns: '40px 1fr 100px 70px 90px 90px 100px',
                              gap: '0.25rem',
                              padding: '0.375rem 0',
                              borderBottom: '1px solid #e8e8e8',
                              fontSize: '0.8125rem',
                              alignItems: 'center',
                            }}>
                              <span style={{ fontWeight: 700, color: '#1a1a2e' }}>R{race.raceNumber}</span>
                              <span style={{ color: '#1a1a2e', fontWeight: 600 }}>{race.trackName}</span>
                              <span style={{
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                color: TIER_COLORS[race.tier],
                                backgroundColor: TIER_BG[race.tier],
                                padding: '0.125rem 0.5rem',
                                borderRadius: '0.25rem',
                                textTransform: 'uppercase',
                                display: 'inline-block',
                                width: 'fit-content',
                              }}>
                                {race.tier === 'crown' ? '👑 Crown' : race.tier === 'finale' ? '🏆 Finale' : race.tier === 'major' ? '🥈 Major' : '🥉 Standard'}
                              </span>
                              <span style={{ textAlign: 'center', fontWeight: 700, color: race.finishPosition <= 3 ? '#008564' : '#1a1a2e' }}>
                                P{race.finishPosition}
                              </span>
                              <span style={{ textAlign: 'right', color: '#1a1a2e' }}>{fmt(race.positionPayout)}</span>
                              <span style={{ textAlign: 'right', color: race.bonusTotal > 0 ? '#008564' : '#b0b0b0' }}>
                                {race.bonusTotal > 0 ? '+' + fmt(race.bonusTotal) : '—'}
                              </span>
                              <span style={{ textAlign: 'right', fontWeight: 700, color: '#008564' }}>{fmt(race.totalRaceEarnings)}</span>
                            </div>
                          ))}
                        {/* Total Row */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '40px 1fr 100px 70px 90px 90px 100px',
                          gap: '0.25rem',
                          padding: '0.5rem 0',
                          borderTop: '2px solid #1a1a2e',
                          fontSize: '0.875rem',
                          fontWeight: 800,
                          marginTop: '0.25rem',
                        }}>
                          <span></span>
                          <span style={{ color: '#1a1a2e' }}>TOTAL</span>
                          <span></span>
                          <span></span>
                          <span style={{ textAlign: 'right', color: '#1a1a2e' }}>{fmt(driver.positionEarnings)}</span>
                          <span style={{ textAlign: 'right', color: '#008564' }}>+{fmt(driver.bonusEarnings)}</span>
                          <span style={{ textAlign: 'right', color: '#008564', fontSize: '1rem' }}>{fmt(driver.totalEarnings)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Team Leaderboard */}
            {activeTab === 'teams' && (
              <div>
                {teamLeaderboard.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#6c6d6f' }}>
                    No team data available
                  </div>
                ) : (
                  <>
                    {/* Team Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '50px 1fr 100px 120px 120px 130px 50px',
                      gap: '0.5rem',
                      padding: '0.625rem 1rem',
                      backgroundColor: '#1a1a2e',
                      color: '#ffffff',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      borderRadius: '0.375rem 0.375rem 0 0',
                    }}>
                      <span>Rank</span>
                      <span>Team</span>
                      <span style={{ textAlign: 'center' }}>Drivers</span>
                      <span style={{ textAlign: 'right' }}>Position $</span>
                      <span style={{ textAlign: 'right' }}>Bonus $</span>
                      <span style={{ textAlign: 'right' }}>Total Earnings</span>
                      <span></span>
                    </div>

                    {teamLeaderboard.map((team, idx) => (
                      <div key={team.teamId}>
                        <div
                          onClick={() => setExpandedTeam(expandedTeam === team.teamId ? null : team.teamId)}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '50px 1fr 100px 120px 120px 130px 50px',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid #e0e0e0',
                            cursor: 'pointer',
                            backgroundColor: expandedTeam === team.teamId ? 'rgba(0,61,165,0.04)' : idx % 2 === 0 ? '#fff' : '#fafafa',
                            transition: 'background-color 0.15s',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: idx < 3 ? '#008564' : '#1a1a2e' }}>
                            {idx + 1}
                          </span>
                          <div>
                            <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9375rem' }}>{team.teamName}</span>
                            {team.totalWins > 0 && (
                              <span style={{
                                marginLeft: '0.5rem', fontSize: '0.625rem', fontWeight: 700,
                                color: '#008564', backgroundColor: 'rgba(0,133,100,0.08)',
                                padding: '0.125rem 0.375rem', borderRadius: '0.25rem', textTransform: 'uppercase',
                              }}>
                                {team.totalWins}W
                              </span>
                            )}
                          </div>
                          <span style={{ textAlign: 'center', color: '#6c6d6f', fontSize: '0.875rem' }}>
                            {team.driverCount}
                          </span>
                          <span style={{ textAlign: 'right', fontWeight: 600, color: '#1a1a2e', fontSize: '0.875rem' }}>
                            {fmt(team.positionEarnings)}
                          </span>
                          <span style={{ textAlign: 'right', fontWeight: 600, color: team.bonusEarnings > 0 ? '#008564' : '#6c6d6f', fontSize: '0.875rem' }}>
                            {team.bonusEarnings > 0 ? '+' + fmt(team.bonusEarnings) : '—'}
                          </span>
                          <span style={{ textAlign: 'right', fontWeight: 800, color: '#008564', fontSize: '1.0625rem' }}>
                            {fmt(team.totalEarnings)}
                          </span>
                          <span style={{ textAlign: 'center', color: '#6c6d6f' }}>
                            {expandedTeam === team.teamId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        </div>

                        {/* Expanded: Team Drivers */}
                        {expandedTeam === team.teamId && (
                          <div style={{ backgroundColor: '#f4f5f6', padding: '0.75rem 1.5rem', borderBottom: '2px solid #003DA5' }}>
                            {team.drivers
                              .sort((a, b) => b.totalEarnings - a.totalEarnings)
                              .map((d) => (
                                <div key={d.driverId} style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.5rem 0',
                                  borderBottom: '1px solid #e0e0e0',
                                }}>
                                  <div>
                                    <span style={{ fontWeight: 700, color: '#1a1a2e' }}>{d.name}</span>
                                    <span style={{ color: '#6c6d6f', fontSize: '0.75rem', marginLeft: '0.375rem' }}>#{d.carNumber}</span>
                                    <span style={{ color: '#6c6d6f', fontSize: '0.75rem', marginLeft: '0.75rem' }}>
                                      {d.racesCompleted} races • {d.wins}W
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8125rem', color: '#6c6d6f' }}>
                                      Pos: {fmt(d.positionEarnings)}
                                    </span>
                                    <span style={{ fontSize: '0.8125rem', color: '#008564' }}>
                                      Bonus: +{fmt(d.bonusEarnings)}
                                    </span>
                                    <span style={{ fontWeight: 800, color: '#008564', fontSize: '1rem' }}>
                                      {fmt(d.totalEarnings)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            <div style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '0.75rem 0 0.25rem', borderTop: '2px solid #1a1a2e', marginTop: '0.25rem',
                            }}>
                              <span style={{ fontWeight: 800, color: '#1a1a2e', textTransform: 'uppercase', fontSize: '0.8125rem' }}>
                                Team Total
                              </span>
                              <span style={{ fontWeight: 800, color: '#008564', fontSize: '1.125rem' }}>
                                {fmt(team.totalEarnings)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Race Breakdown */}
            {activeTab === 'races' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {racePayouts.map((race) => (
                  <RacePayoutCard key={race.raceNumber} race={race} />
                ))}
              </div>
            )}

            {/* Payout Structure Reference */}
            <div style={{ marginTop: '2.5rem', borderTop: '2px solid #e0e0e0', paddingTop: '1.5rem' }}>
              <div style={{ borderLeft: '4px solid #6c6d6f', paddingLeft: '1rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a2e', margin: 0, textTransform: 'uppercase' }}>
                  Payout Structure
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                  { tier: 'crown', label: '👑 Crown Jewel', purse: '$200,000', races: 'Daytona 500, Coca-Cola 600, Brickyard 400, Southern 500' },
                  { tier: 'major', label: '🥈 Major', purse: '$125,000', races: 'Atlanta, Las Vegas, Martinsville, Bristol, Kansas, Talladega, +more' },
                  { tier: 'standard', label: '🥉 Standard', purse: '$100,000', races: 'COTA, Phoenix, Darlington, Texas, Watkins Glen, +more' },
                  { tier: 'finale', label: '🏆 Finale', purse: '$300,000', races: 'Homestead-Miami (Championship)' },
                ].map((t) => (
                  <div key={t.tier} style={{
                    border: `1px solid ${TIER_COLORS[t.tier]}40`,
                    borderTop: `3px solid ${TIER_COLORS[t.tier]}`,
                    borderRadius: '0.375rem',
                    padding: '1rem',
                    backgroundColor: TIER_BG[t.tier],
                  }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#1a1a2e', marginBottom: '0.25rem' }}>{t.label}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.5rem', color: TIER_COLORS[t.tier], marginBottom: '0.375rem' }}>{t.purse}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#6c6d6f', lineHeight: 1.4 }}>{t.races}</div>
                  </div>
                ))}
              </div>

              {/* Global Bonuses */}
              <div style={{ marginTop: '1rem', border: '1px solid #e0e0e0', borderRadius: '0.375rem', padding: '1rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#6c6d6f', alignSelf: 'center' }}>
                  Global Bonuses (All Races):
                </span>
                {[
                  { label: 'Pole Position', amount: '$2,000', icon: <Flag size={13} /> },
                  { label: 'Most Laps Led', amount: '$2,000', icon: <Zap size={13} /> },
                  { label: 'Fastest Lap', amount: '$2,000', icon: <Zap size={13} /> },
                  { label: 'Clean Race', amount: '$3,000', icon: <Shield size={13} /> },
                ].map((b) => (
                  <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    {b.icon}
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a2e' }}>{b.label}:</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#008564' }}>{b.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Race Payout Card Sub-Component ─────────────────────────

function RacePayoutCard({ race }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '0.375rem',
      overflow: 'hidden',
      borderLeft: `4px solid ${TIER_COLORS[race.tier]}`,
    }}>
      {/* Card Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.75rem 1rem',
          backgroundColor: TIER_BG[race.tier],
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 800, color: '#1a1a2e', fontSize: '0.875rem', minWidth: '35px' }}>R{race.raceNumber}</span>
          <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1rem' }}>{race.displayName}</span>
          <span style={{
            fontSize: '0.625rem', fontWeight: 700,
            color: TIER_COLORS[race.tier],
            backgroundColor: `${TIER_COLORS[race.tier]}18`,
            padding: '0.125rem 0.5rem', borderRadius: '0.25rem', textTransform: 'uppercase',
          }}>
            {race.tierLabel} — {fmt(race.purse)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Bonus winner chips */}
          {race.bonuses.pole && (
            <span style={{ fontSize: '0.6875rem', color: '#003DA5' }}>🏁 {race.bonuses.pole.name?.split(' ')[1] || race.bonuses.pole.name}</span>
          )}
          {race.bonuses.mostLapsLed && (
            <span style={{ fontSize: '0.6875rem', color: '#008564' }}>⚡ {race.bonuses.mostLapsLed.name?.split(' ')[1] || race.bonuses.mostLapsLed.name}</span>
          )}
          {expanded ? <ChevronUp size={16} color="#6c6d6f" /> : <ChevronDown size={16} color="#6c6d6f" />}
        </div>
      </div>

      {/* Expanded Results */}
      {expanded && (
        <div style={{ padding: '0' }}>
          {/* Bonus Awards */}
          <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', backgroundColor: '#f4f5f6', borderBottom: '1px solid #e0e0e0', flexWrap: 'wrap' }}>
            {race.bonuses.pole && (
              <span style={{ fontSize: '0.75rem' }}>
                <strong>Pole:</strong> {race.bonuses.pole.name} <span style={{ color: '#008564', fontWeight: 700 }}>(+$2,000)</span>
              </span>
            )}
            {race.bonuses.mostLapsLed && (
              <span style={{ fontSize: '0.75rem' }}>
                <strong>Most Laps Led:</strong> {race.bonuses.mostLapsLed.name} ({race.bonuses.mostLapsLed.laps} laps) <span style={{ color: '#008564', fontWeight: 700 }}>(+$2,000)</span>
              </span>
            )}
            {race.bonuses.fastestLap && (
              <span style={{ fontSize: '0.75rem' }}>
                <strong>Fastest Lap:</strong> {race.bonuses.fastestLap.name} ({race.bonuses.fastestLap.time}s) <span style={{ color: '#008564', fontWeight: 700 }}>(+$2,000)</span>
              </span>
            )}
            {race.bonuses.cleanRace && (
              <span style={{ fontSize: '0.75rem' }}>
                <strong>Clean Race:</strong> {race.bonuses.cleanRace.name} ({race.bonuses.cleanRace.incidents} inc) <span style={{ color: '#008564', fontWeight: 700 }}>(+$3,000)</span>
              </span>
            )}
          </div>

          {/* Results Table */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '50px 1fr 90px 90px 100px',
            gap: '0.25rem',
            padding: '0.5rem 1rem',
            fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
            color: '#6c6d6f', borderBottom: '1px solid #e0e0e0',
          }}>
            <span>Pos</span>
            <span>Driver</span>
            <span style={{ textAlign: 'right' }}>Position $</span>
            <span style={{ textAlign: 'right' }}>Bonus $</span>
            <span style={{ textAlign: 'right' }}>Total</span>
          </div>
          {race.drivers
            .sort((a, b) => a.finishPosition - b.finishPosition)
            .map((d, idx) => (
              <div key={d.driverId} style={{
                display: 'grid',
                gridTemplateColumns: '50px 1fr 90px 90px 100px',
                gap: '0.25rem',
                padding: '0.5rem 1rem',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
                fontSize: '0.8125rem',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 700, color: d.finishPosition <= 3 ? '#008564' : '#1a1a2e' }}>
                  P{d.finishPosition}
                </span>
                <div>
                  <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{d.name}</span>
                  <span style={{ color: '#6c6d6f', fontSize: '0.6875rem', marginLeft: '0.375rem' }}>#{d.carNumber}</span>
                  {d.bonusDetails.length > 0 && d.bonusDetails.map((b, i) => (
                    <span key={i} style={{
                      marginLeft: '0.375rem', fontSize: '0.5625rem', fontWeight: 700,
                      color: '#008564', backgroundColor: 'rgba(0,133,100,0.08)',
                      padding: '0.0625rem 0.25rem', borderRadius: '0.1875rem',
                    }}>
                      {b.type}
                    </span>
                  ))}
                </div>
                <span style={{ textAlign: 'right', color: '#1a1a2e' }}>{fmt(d.positionPayout)}</span>
                <span style={{ textAlign: 'right', color: d.bonusTotal > 0 ? '#008564' : '#b0b0b0' }}>
                  {d.bonusTotal > 0 ? '+' + fmt(d.bonusTotal) : '—'}
                </span>
                <span style={{ textAlign: 'right', fontWeight: 700, color: '#008564' }}>{fmt(d.totalRaceEarnings)}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared Styles ──────────────────────────────────────────

function chipStyle(color) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.6875rem',
    fontWeight: 700,
    color: color,
    backgroundColor: `${color}12`,
    padding: '0.25rem 0.625rem',
    borderRadius: '1rem',
    border: `1px solid ${color}30`,
  };
}
