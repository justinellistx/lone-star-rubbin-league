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

  const latestRace = useMemo(() => {
    if (!raceResults || raceResults.length === 0) return null;
    return raceResults[raceResults.length - 1];
  }, [raceResults]);

  const upcomingRaces = useMemo(() => {
    if (!schedule) return [];
    return schedule.filter((r) => r.status === 'upcoming').slice(0, 3);
  }, [schedule]);

  const nextRace = upcomingRaces[0] || null;
  const topStandings = useMemo(() => {
    return standings ? standings.slice(0, 10) : [];
  }, [standings]);

  const displayNews = useMemo(() => {
    if (news && news.length > 0) return news;
    if (!latestRace) return [];
    const winner = latestRace.results?.[0];
    return [{
      id: `generated-${latestRace.id}`,
      title: winner ? `${winner.name} Takes Victory at ${latestRace.track}` : `Race Completed at ${latestRace.track}`,
      content: `Latest race results from ${latestRace.track} on ${new Date(latestRace.date).toLocaleDateString()}. ${latestRace.series} competition.`,
      category: 'Race Report',
      created_at: latestRace.date,
    }];
  }, [news, latestRace]);

  const categoryColor = (cat) => {
    switch (cat) {
      case 'recap': return '#003DA5';
      case 'highlight': return '#008564';
      case 'announcement': return '#003DA5';
      case 'preview': return '#c8102e';
      default: return '#003DA5';
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

  /* NASCAR.com section header component */
  const SectionHeader = ({ title, linkTo, linkText, accent = '#003DA5' }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderLeft: `4px solid ${accent}`, paddingLeft: '0.75rem',
      marginBottom: '0.75rem',
    }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', color: '#1a1a2e', margin: 0, letterSpacing: '0.02em' }}>
        {title}
      </h2>
      {linkTo && (
        <Link to={linkTo} style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#003DA5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
          {linkText || 'View All'} <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>

        {/* ===== LEFT COLUMN ===== */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Next Race Banner */}
          {!scheduleLoading && nextRace && (
            <div style={{
              backgroundColor: '#1a1a2e', color: '#fff', padding: '1rem 1.25rem', marginBottom: '1.25rem',
              display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #ffcf00', borderRadius: '0.25rem',
            }}>
              <Flag size={20} style={{ color: '#ffcf00', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffcf00', marginBottom: '0.125rem' }}>
                  Up Next — Race {nextRace.race_number}
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{nextRace.track_name}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                  {new Date(nextRace.race_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)' }}>{nextRace.series}</div>
              </div>
              <TrackIcon track={nextRace.track_name} size={48} />
            </div>
          )}

          {/* Headlines */}
          <div style={{ marginBottom: '1.25rem' }}>
            <SectionHeader title="Top Headlines" linkTo="/news" linkText="All News" />
            {newsLoading ? (
              <div style={{ padding: '2rem', color: '#6c6d6f', textAlign: 'center' }}>Loading headlines...</div>
            ) : displayNews && displayNews.length > 0 ? (
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.25rem', overflow: 'hidden' }}>
                {/* Featured */}
                <Link to="/news" style={{ display: 'block', backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0', padding: '1rem 1.25rem', textDecoration: 'none', transition: 'background-color 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f7f7'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: categoryColor(displayNews[0].category) }}>
                      {categoryLabel(displayNews[0].category)}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#999' }}>
                      {new Date(displayNews[0].published_at || displayNews[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a1a2e', margin: 0, lineHeight: 1.25 }}>{displayNews[0].title}</h3>
                  {displayNews[0].subtitle && (
                    <p style={{ fontSize: '0.875rem', color: '#6c6d6f', margin: '0.375rem 0 0 0' }}>{displayNews[0].subtitle}</p>
                  )}
                </Link>
                {displayNews.slice(1).map((item) => (
                  <Link key={item.id} to="/news" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0', padding: '0.625rem 1.25rem', textDecoration: 'none', transition: 'background-color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f7f7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <div style={{ width: '3px', height: '1.75rem', backgroundColor: categoryColor(item.category), flexShrink: 0, borderRadius: '1px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</h4>
                    </div>
                    <ChevronRight size={12} style={{ color: '#ccc', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', color: '#6c6d6f', backgroundColor: '#fff', textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: '0.25rem' }}>No headlines available</div>
            )}
          </div>

          {/* Latest Race Results */}
          <div style={{ marginBottom: '1.25rem' }}>
            <SectionHeader title="Latest Results" linkTo="/results" linkText="Full Results" accent="#1a1a2e" />
            {raceLoading ? (
              <div style={{ padding: '2rem', color: '#6c6d6f', backgroundColor: '#fff', textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: '0.25rem' }}>Loading latest race...</div>
            ) : latestRace ? (
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.25rem', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#1a1a2e', color: '#fff', padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <TrackIcon track={latestRace.track} size={28} />
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800 }}>{latestRace.track}</div>
                      <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)' }}>Race {latestRace.raceNumber} • {latestRace.series}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#ffcf00', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Final</span>
                </div>
                {latestRace.results?.slice(0, 5).map((r, idx) => (
                  <div key={r.id || idx} style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 1rem',
                    borderBottom: idx < 4 ? '1px solid #e0e0e0' : 'none',
                    backgroundColor: idx === 0 ? 'rgba(0, 61, 165, 0.03)' : '#fff',
                  }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: idx === 0 ? '#003DA5' : '#1a1a2e', minWidth: '1.25rem', textAlign: 'center' }}>{idx + 1}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a2e', flex: 1 }}>{r.name}</span>
                    <span style={{ fontSize: '0.6875rem', color: '#6c6d6f' }}>#{r.carNumber}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#008564' }}>{r.totalPoints} pts</span>
                  </div>
                ))}
                <Link to="/results" style={{
                  display: 'block', textAlign: 'center', padding: '0.5rem', backgroundColor: '#f4f4f4',
                  fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#003DA5', textDecoration: 'none', borderTop: '1px solid #e0e0e0',
                }}>
                  View Complete Results
                </Link>
              </div>
            ) : (
              <div style={{ padding: '2rem', color: '#6c6d6f', backgroundColor: '#fff', textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: '0.25rem' }}>No completed races yet</div>
            )}
          </div>

          {/* Upcoming Schedule */}
          {upcomingRaces.length > 1 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <SectionHeader title="Upcoming Schedule" linkTo="/schedule" linkText="Full Schedule" accent="#1a1a2e" />
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.25rem', overflow: 'hidden' }}>
                {upcomingRaces.slice(0, 3).map((race, idx) => (
                  <div key={race.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem',
                    borderBottom: idx < upcomingRaces.length - 1 ? '1px solid #e0e0e0' : 'none',
                  }}>
                    <TrackIcon track={race.track_name} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1a1a2e' }}>{race.track_name}</div>
                      <div style={{ fontSize: '0.625rem', color: '#6c6d6f' }}>Race {race.race_number} • {race.series}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1a1a2e' }}>
                        {new Date(race.race_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: '#6c6d6f' }}>
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
        <div style={{ width: '300px', flexShrink: 0 }} className="hidden md:block">
          {/* Standings Widget */}
          <div style={{ marginBottom: '1.25rem' }}>
            <SectionHeader title="Standings" linkTo="/standings" linkText="Full" />
            <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.25rem', overflow: 'hidden' }}>
              {standingsLoading ? (
                <div style={{ padding: '1.5rem', color: '#6c6d6f', textAlign: 'center', fontSize: '0.8125rem' }}>Loading...</div>
              ) : topStandings.length > 0 ? (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', padding: '0.375rem 0.75rem',
                    backgroundColor: '#1a1a2e', color: '#fff',
                    fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    <span style={{ width: '1.75rem' }}>RK</span>
                    <span style={{ flex: 1 }}>Driver</span>
                    <span style={{ width: '3rem', textAlign: 'right' }}>PTS</span>
                    <span style={{ width: '2.5rem', textAlign: 'right', color: 'rgba(255,255,255,0.5)' }}>Gap</span>
                  </div>
                  {topStandings.map((driver, idx) => (
                    <Link to={`/drivers/${driver.id}`} key={driver.id} style={{
                      display: 'flex', alignItems: 'center', padding: '0.4rem 0.75rem',
                      borderBottom: '1px solid #e0e0e0', textDecoration: 'none',
                      backgroundColor: idx === 0 ? 'rgba(0, 61, 165, 0.03)' : '#fff',
                      transition: 'background-color 0.15s',
                    }}
                      onMouseEnter={(e) => { if (idx !== 0) e.currentTarget.style.backgroundColor = '#f7f7f7'; }}
                      onMouseLeave={(e) => { if (idx !== 0) e.currentTarget.style.backgroundColor = '#fff'; }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, width: '1.75rem', color: idx === 0 ? '#003DA5' : idx < 3 ? '#1a1a2e' : '#6c6d6f' }}>{idx + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a2e' }}>{driver.name}</div>
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#1a1a2e', width: '3rem', textAlign: 'right' }}>{driver.points}</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: idx === 0 ? '#6c6d6f' : '#c8102e', width: '2.5rem', textAlign: 'right' }}>
                        {idx === 0 ? '—' : `−${topStandings[0].points - driver.points}`}
                      </span>
                    </Link>
                  ))}
                </>
              ) : (
                <div style={{ padding: '1.5rem', color: '#6c6d6f', textAlign: 'center', fontSize: '0.8125rem' }}>No standings data</div>
              )}
            </div>
          </div>

          {/* Podcast */}
          <div style={{ marginBottom: '1.25rem' }}>
            <SectionHeader title="Podcast" linkTo="/podcast" linkText="All" accent="#003DA5" />
            <PodcastMiniPlayer />
          </div>

          {/* Quick Links */}
          <div style={{ marginBottom: '1.25rem' }}>
            <SectionHeader title="Quick Links" accent="#1a1a2e" />
            <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.25rem', overflow: 'hidden' }}>
              {[
                { label: "Pick'em Predictions", path: '/pickem', icon: Trophy },
                { label: 'Power Rankings', path: '/power-rankings', icon: ChevronRight },
                { label: 'Head-to-Head', path: '/head-to-head', icon: Users },
                { label: 'Podcast', path: '/podcast', icon: Mic },
                { label: 'Arcade Game', path: '/game', icon: Flag },
              ].map((link, idx) => (
                <Link key={link.path} to={link.path} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem',
                  borderBottom: idx < 4 ? '1px solid #e0e0e0' : 'none',
                  textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, color: '#1a1a2e', transition: 'background-color 0.15s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7f7f7'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  <link.icon size={13} style={{ color: '#003DA5' }} />
                  <span style={{ flex: 1 }}>{link.label}</span>
                  <ChevronRight size={11} style={{ color: '#ccc' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* Season Stats */}
          <div>
            <SectionHeader title="Season Stats" accent="#1a1a2e" />
            <div style={{ border: '1px solid #e0e0e0', borderRadius: '0.25rem', overflow: 'hidden', padding: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { label: 'Races', value: '36', color: '#003DA5' },
                  { label: 'Stages', value: '3', color: '#1a1a2e' },
                  { label: 'Drivers', value: '9', color: '#008564' },
                  { label: 'Teams', value: '4', color: '#003DA5' },
                ].map((stat) => (
                  <div key={stat.label} style={{ textAlign: 'center', padding: '0.375rem' }}>
                    <div style={{ fontSize: '1.375rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6c6d6f' }}>{stat.label}</div>
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
