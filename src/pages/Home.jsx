import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Flag, Clock, Trophy, Users, Mic } from 'lucide-react';
import { PodcastMiniPlayer } from './Podcast';
import TrackIcon from '../components/TrackIcon';
import {
  useComputedStandings,
  useRaceResultsByRace,
  useSchedule,
  useNews,
} from '../hooks/useSupabase';

export default function Home() {
  const { standings, loading: standingsLoading } = useComputedStandings();
  const { data: raceResults, loading: raceLoading } = useRaceResultsByRace();
  const { data: schedule, loading: scheduleLoading } = useSchedule(null);
  const { data: news, loading: newsLoading } = useNews(5);

  // Get the latest completed race
  const latestRace = useMemo(() => {
    if (!raceResults || raceResults.length === 0) return null;
    return raceResults[raceResults.length - 1];
  }, [raceResults]);

  // Get the next 3 upcoming races from schedule
  const upcomingRaces = useMemo(() => {
    if (!schedule) return [];
    return schedule
      .filter((r) => r.status === 'upcoming')
      .slice(0, 3);
  }, [schedule]);

  const nextRace = upcomingRaces[0] || null;
  const topStandings = useMemo(() => {
    return standings ? standings.slice(0, 10) : [];
  }, [standings]);

  // Fallback news if none from DB
  const displayNews = useMemo(() => {
    if (news && news.length > 0) return news;
    if (!latestRace) return [];
    const winner = latestRace.results?.[0];
    return [
      {
        id: `generated-${latestRace.id}`,
        title: winner
          ? `${winner.name} Takes Victory at ${latestRace.track}`
          : `Race Completed at ${latestRace.track}`,
        content: `Latest race results from ${latestRace.track} on ${new Date(
          latestRace.date
        ).toLocaleDateString()}. ${latestRace.series} competition.`,
        category: 'Race Report',
        created_at: latestRace.date,
      },
    ];
  }, [news, latestRace]);

  const categoryColor = (cat) => {
    switch (cat) {
      case 'recap': return '#d00000';
      case 'highlight': return '#008564';
      case 'announcement': return '#004b8d';
      case 'preview': return '#d00000';
      default: return '#d00000';
    }
  };

  const categoryLabel = (cat) => {
    switch (cat) {
      case 'recap': return 'Race Recap';
      case 'highlight': return 'Highlight';
      case 'announcement': return 'Announcement';
      case 'preview': return 'Preview';
      default: return 'News';
    }
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Page Content: 2-column ESPN layout */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>

        {/* ===== LEFT COLUMN: Main Content ===== */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Next Race Banner */}
          {!scheduleLoading && nextRace && (
            <div style={{
              backgroundColor: '#131313',
              color: '#fff',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              borderLeft: '4px solid #d00000',
            }}>
              <Flag size={20} style={{ color: '#d00000', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d00000', marginBottom: '0.125rem' }}>
                  Up Next
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>
                  {nextRace.track_name}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.125rem' }}>
                  Race {nextRace.race_number}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                  {new Date(nextRace.race_date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                  })}
                </div>
              </div>
              <TrackIcon track={nextRace.track_name} size={48} />
            </div>
          )}

          {/* Headlines Section */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '3px solid #d00000', paddingBottom: '0.5rem', marginBottom: '0.875rem',
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', color: '#131313', margin: 0 }}>
                Top Headlines
              </h2>
              <Link to="/news" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#004b8d', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                All News <ChevronRight size={14} />
              </Link>
            </div>

            {newsLoading ? (
              <div style={{ padding: '2rem', color: '#6c6d6f', textAlign: 'center' }}>Loading headlines...</div>
            ) : displayNews && displayNews.length > 0 ? (
              <div>
                {/* Featured headline */}
                <Link
                  to="/news"
                  style={{
                    display: 'block',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #e0e0e0',
                    padding: '1rem 1.25rem',
                    textDecoration: 'none',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <span style={{
                      fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: categoryColor(displayNews[0].category),
                    }}>
                      {categoryLabel(displayNews[0].category)}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#999' }}>
                      {new Date(displayNews[0].published_at || displayNews[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#131313', margin: 0, lineHeight: 1.25 }}>
                    {displayNews[0].title}
                  </h3>
                  {displayNews[0].subtitle && (
                    <p style={{ fontSize: '0.875rem', color: '#6c6d6f', marginTop: '0.375rem', margin: '0.375rem 0 0 0' }}>
                      {displayNews[0].subtitle}
                    </p>
                  )}
                </Link>

                {/* Remaining headlines — tight list */}
                {displayNews.slice(1).map((item) => (
                  <Link
                    key={item.id}
                    to="/news"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      backgroundColor: '#fff',
                      borderBottom: '1px solid #e0e0e0',
                      padding: '0.75rem 1.25rem',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <div style={{
                      width: '3px', height: '2rem', backgroundColor: categoryColor(item.category),
                      flexShrink: 0, borderRadius: '1px',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#131313', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </h4>
                      <span style={{ fontSize: '0.6875rem', color: '#999' }}>
                        {new Date(item.published_at || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <ChevronRight size={14} style={{ color: '#ccc', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', color: '#6c6d6f', backgroundColor: '#fff', textAlign: 'center' }}>
                No headlines available
              </div>
            )}
          </div>

          {/* Latest Race Results */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '3px solid #131313', paddingBottom: '0.5rem', marginBottom: '0.875rem',
            }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', color: '#131313', margin: 0 }}>
                Latest Results
              </h2>
              <Link to="/results" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#004b8d', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Full Results <ChevronRight size={14} />
              </Link>
            </div>

            {raceLoading ? (
              <div style={{ padding: '2rem', color: '#6c6d6f', backgroundColor: '#fff', textAlign: 'center' }}>
                Loading latest race...
              </div>
            ) : latestRace ? (
              <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
                {/* Race header */}
                <div style={{
                  backgroundColor: '#131313', color: '#fff', padding: '0.75rem 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <TrackIcon track={latestRace.track} size={32} />
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800 }}>{latestRace.track}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.6)' }}>
                        Race {latestRace.raceNumber} &middot; {latestRace.series}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d00000' }}>FINAL</div>
                </div>

                {/* Top 5 results */}
                <div>
                  {latestRace.results?.slice(0, 5).map((r, idx) => (
                    <div
                      key={r.id || idx}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.5rem 1.25rem',
                        borderBottom: idx < 4 ? '1px solid #e0e0e0' : 'none',
                        backgroundColor: idx === 0 ? '#fffde7' : '#fff',
                      }}
                    >
                      <span style={{
                        fontSize: '0.875rem', fontWeight: 800,
                        color: idx === 0 ? '#d00000' : '#131313',
                        minWidth: '1.5rem', textAlign: 'center',
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#131313', flex: 1 }}>
                        {r.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#6c6d6f' }}>
                        #{r.carNumber}
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#008564' }}>
                        {r.totalPoints} pts
                      </span>
                    </div>
                  ))}
                </div>

                {/* View full results link */}
                <Link
                  to="/results"
                  style={{
                    display: 'block', textAlign: 'center', padding: '0.625rem',
                    backgroundColor: '#f5f5f5', fontSize: '0.75rem', fontWeight: 700,
                    textTransform: 'uppercase', color: '#004b8d', textDecoration: 'none',
                    borderTop: '1px solid #e0e0e0',
                  }}
                >
                  View Complete Results
                </Link>
              </div>
            ) : (
              <div style={{ padding: '2rem', color: '#6c6d6f', backgroundColor: '#fff', textAlign: 'center' }}>
                No completed races yet
              </div>
            )}
          </div>

          {/* Upcoming Schedule */}
          {upcomingRaces.length > 1 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '3px solid #131313', paddingBottom: '0.5rem', marginBottom: '0.875rem',
              }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', color: '#131313', margin: 0 }}>
                  Upcoming Schedule
                </h2>
                <Link to="/schedule" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#004b8d', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Full Schedule <ChevronRight size={14} />
                </Link>
              </div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
                {upcomingRaces.slice(0, 3).map((race, idx) => (
                  <div
                    key={race.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.75rem 1.25rem',
                      borderBottom: idx < upcomingRaces.length - 1 ? '1px solid #e0e0e0' : 'none',
                    }}
                  >
                    <TrackIcon track={race.track_name} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#131313' }}>
                        {race.track_name}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#6c6d6f' }}>
                        Race {race.race_number} &middot; {race.series}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#131313' }}>
                        {new Date(race.race_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#6c6d6f' }}>
                        {new Date(race.race_date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div style={{ width: '300px', flexShrink: 0 }}
             className="hidden md:block"
        >
          {/* Standings Widget */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '3px solid #d00000', paddingBottom: '0.5rem', marginBottom: 0,
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: '#131313', margin: 0 }}>
                Standings
              </h3>
              <Link to="/standings" style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#004b8d', textDecoration: 'none' }}>
                Full
              </Link>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderTop: 'none' }}>
              {standingsLoading ? (
                <div style={{ padding: '1.5rem', color: '#6c6d6f', textAlign: 'center', fontSize: '0.8125rem' }}>
                  Loading...
                </div>
              ) : topStandings.length > 0 ? (
                <>
                  {/* Header row */}
                  <div style={{
                    display: 'flex', alignItems: 'center', padding: '0.375rem 0.75rem',
                    backgroundColor: '#131313', color: '#fff',
                    fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    <span style={{ width: '1.5rem' }}>RK</span>
                    <span style={{ flex: 1 }}>Driver</span>
                    <span style={{ width: '3rem', textAlign: 'right' }}>PTS</span>
                  </div>
                  {topStandings.map((driver, idx) => (
                    <Link
                      to={`/drivers/${driver.id}`}
                      key={driver.id}
                      style={{
                        display: 'flex', alignItems: 'center', padding: '0.5rem 0.75rem',
                        borderBottom: '1px solid #e0e0e0',
                        textDecoration: 'none',
                        backgroundColor: idx === 0 ? '#fffde7' : '#fff',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => { if (idx !== 0) e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                      onMouseLeave={(e) => { if (idx !== 0) e.currentTarget.style.backgroundColor = '#fff'; }}
                    >
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 800, width: '1.5rem',
                        color: idx === 0 ? '#d00000' : '#131313',
                      }}>
                        {idx + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#131313' }}>
                          {driver.name}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: '#999' }}>
                          #{driver.number} &middot; {driver.team}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#131313', width: '3rem', textAlign: 'right' }}>
                        {driver.points}
                      </span>
                    </Link>
                  ))}
                </>
              ) : (
                <div style={{ padding: '1.5rem', color: '#6c6d6f', textAlign: 'center', fontSize: '0.8125rem' }}>
                  No standings data
                </div>
              )}
            </div>
          </div>

          {/* Latest Podcast */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '3px solid #d00000', paddingBottom: '0.5rem', marginBottom: 0,
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: '#131313', margin: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Mic size={14} style={{ color: '#d00000' }} /> Podcast
              </h3>
              <Link to="/podcast" style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#004b8d', textDecoration: 'none' }}>
                All
              </Link>
            </div>
            <PodcastMiniPlayer />
          </div>

          {/* Quick Links */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              borderBottom: '3px solid #131313', paddingBottom: '0.5rem', marginBottom: 0,
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: '#131313', margin: 0 }}>
                Quick Links
              </h3>
            </div>
            <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderTop: 'none' }}>
              {[
                { label: "Pick'em Predictions", path: '/pickem', icon: Trophy },
                { label: 'Power Rankings', path: '/power-rankings', icon: ChevronRight },
                { label: 'Head-to-Head', path: '/head-to-head', icon: Users },
                { label: 'Podcast', path: '/podcast', icon: Mic },
                { label: 'Arcade Game', path: '/game', icon: Flag },
              ].map((link, idx) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.625rem 0.75rem',
                    borderBottom: idx < 4 ? '1px solid #e0e0e0' : 'none',
                    textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600,
                    color: '#131313', transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  <link.icon size={14} style={{ color: '#d00000' }} />
                  <span style={{ flex: 1 }}>{link.label}</span>
                  <ChevronRight size={12} style={{ color: '#ccc' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Season Stats */}
          <div>
            <div style={{
              borderBottom: '3px solid #131313', paddingBottom: '0.5rem', marginBottom: 0,
            }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: '#131313', margin: 0 }}>
                Season Stats
              </h3>
            </div>
            <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderTop: 'none', padding: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'Total Races', value: '36', color: '#d00000' },
                  { label: 'Stages', value: '3', color: '#131313' },
                  { label: 'Drivers', value: '9', color: '#008564' },
                  { label: 'Teams', value: '4', color: '#004b8d' },
                ].map((stat) => (
                  <div key={stat.label} style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6c6d6f' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
