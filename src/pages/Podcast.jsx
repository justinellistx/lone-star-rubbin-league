import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic, Download, ChevronRight, Loader } from 'lucide-react';
import TrackIcon from '../components/TrackIcon';
import { usePodcasts } from '../hooks/useSupabase';

/* ─── Helpers ─── */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ─── Custom Audio Player ─── */
function AudioPlayer({ src, onDurationLoaded }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrent(a.currentTime);
    const onMeta = () => {
      setDuration(a.duration);
      if (onDurationLoaded) onDurationLoaded(a.duration);
    };
    const onEnd = () => setPlaying(false);
    const onErr = () => setError(true);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    a.addEventListener('error', onErr);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('error', onErr);
    };
  }, [src]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play().catch(() => setError(true));
    setPlaying(!playing);
  };

  const seek = (e) => {
    if (!progressRef.current || !audioRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
  };

  const skip = (delta) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(duration, audioRef.current.currentTime + delta)
    );
  };

  const changeVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (v === 0) setMuted(true);
    else setMuted(false);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  const pct = duration ? (currentTime / duration) * 100 : 0;

  if (error || !src) {
    return (
      <div
        style={{
          backgroundColor: '#131313',
          color: '#fff',
          padding: '1.25rem',
          borderRadius: '4px',
          textAlign: 'center',
        }}
      >
        <Mic size={24} style={{ color: '#d00000', marginBottom: '0.5rem' }} />
        <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0.25rem' }}>
          Audio coming soon
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#131313',
        color: '#fff',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Progress bar */}
      <div
        ref={progressRef}
        onClick={seek}
        style={{
          height: '4px',
          backgroundColor: 'rgba(255,255,255,0.15)',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: '#d00000',
            transition: 'width 0.1s linear',
          }}
        />
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
        }}
      >
        <button
          onClick={() => skip(-15)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          title="Back 15s"
        >
          <SkipBack size={16} />
        </button>

        <button
          onClick={toggle}
          style={{
            background: '#d00000', border: 'none', color: '#fff',
            width: '36px', height: '36px', borderRadius: '50%',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
        </button>

        <button
          onClick={() => skip(30)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          title="Forward 30s"
        >
          <SkipForward size={16} />
        </button>

        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', minWidth: '5rem' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <div style={{ flex: 1 }} />

        <button
          onClick={toggleMute}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range" min="0" max="1" step="0.05"
          value={muted ? 0 : volume}
          onChange={changeVolume}
          style={{ width: '60px', accentColor: '#d00000' }}
        />

        <a href={src} download style={{ color: '#fff', display: 'flex', alignItems: 'center', padding: '4px' }} title="Download episode">
          <Download size={16} />
        </a>
      </div>
    </div>
  );
}

/* ─── Mini Player for Home sidebar ─── */
export function PodcastMiniPlayer() {
  const { data: episodes, loading } = usePodcasts();
  const latest = episodes?.[0];

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play().catch(() => setError(true));
    setPlaying(!playing);
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnd = () => setPlaying(false);
    const onErr = () => setError(true);
    a.addEventListener('ended', onEnd);
    a.addEventListener('error', onErr);
    return () => {
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('error', onErr);
    };
  }, [latest]);

  if (loading) {
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderTop: 'none', padding: '1.5rem', textAlign: 'center' }}>
        <span style={{ fontSize: '0.8125rem', color: '#6c6d6f' }}>Loading...</span>
      </div>
    );
  }

  if (!latest) {
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderTop: 'none', padding: '1rem', textAlign: 'center' }}>
        <Mic size={20} style={{ color: '#e0e0e0', margin: '0 auto 0.375rem' }} />
        <p style={{ fontSize: '0.75rem', color: '#6c6d6f', margin: 0 }}>Coming soon</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderTop: 'none' }}>
      {latest.audio_url && <audio ref={audioRef} src={latest.audio_url} preload="none" />}
      <div style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <button
            onClick={toggle}
            style={{
              background: (!latest.audio_url || error) ? '#6c6d6f' : '#d00000',
              border: 'none', color: '#fff', width: '32px', height: '32px',
              borderRadius: '50%', cursor: (!latest.audio_url || error) ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
            disabled={!latest.audio_url || error}
          >
            {playing ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '1px' }} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d00000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Episode {latest.episode_number}
            </div>
            <div style={{
              fontSize: '0.8125rem', fontWeight: 700, color: '#131313', lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {latest.title}
            </div>
          </div>
        </div>
      </div>
      <Link
        to="/podcast"
        style={{
          display: 'block', textAlign: 'center', padding: '0.5rem',
          backgroundColor: '#f5f5f5', fontSize: '0.6875rem', fontWeight: 700,
          textTransform: 'uppercase', color: '#004b8d', textDecoration: 'none',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        All Episodes <ChevronRight size={10} style={{ verticalAlign: 'middle' }} />
      </Link>
    </div>
  );
}

/* ─── Main Podcast Page ─── */
export default function Podcast() {
  const { data: episodes, loading: episodesLoading } = usePodcasts();
  const [activeDurations, setActiveDurations] = useState({});

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.25rem 1rem' }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Mic size={28} style={{ color: '#d00000' }} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#131313', margin: 0, textTransform: 'uppercase' }}>
              LSR League Weekly
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6c6d6f', margin: 0 }}>
              Your weekly breakdown of Lone Star Rubbin' League racing
            </p>
          </div>
        </div>

        {/* Episodes list */}
        {episodesLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader size={24} style={{ color: '#d00000', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6c6d6f', marginTop: '0.75rem', fontSize: '0.875rem' }}>Loading episodes...</p>
          </div>
        ) : episodes.length === 0 ? (
          <div style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', padding: '3rem 2rem', textAlign: 'center' }}>
            <Mic size={40} style={{ color: '#e0e0e0', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#131313', margin: '0 0 0.5rem' }}>
              No Episodes Yet
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6c6d6f', margin: 0 }}>
              The first episode of LSR League Weekly is coming soon!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {episodes.map((ep, idx) => (
              <div key={ep.id} style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                {/* Episode header */}
                <div style={{
                  backgroundColor: '#131313', color: '#fff', padding: '0.875rem 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: '3px solid #d00000',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {ep.track && <TrackIcon track={ep.track} size={36} />}
                    <div>
                      <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d00000' }}>
                        Episode {ep.episode_number}
                        {ep.race_number ? ` \u00B7 Race ${ep.race_number}` : ''}
                      </div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{ep.title}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                      {new Date(ep.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {activeDurations[ep.id] && (
                      <div style={{ fontSize: '0.6875rem', color: '#d00000', fontWeight: 700 }}>
                        {formatTime(activeDurations[ep.id])}
                      </div>
                    )}
                  </div>
                </div>

                {/* Audio player */}
                <div style={{ padding: '1rem 1.25rem 0.75rem' }}>
                  <AudioPlayer
                    src={ep.audio_url}
                    onDurationLoaded={(d) => setActiveDurations((prev) => ({ ...prev, [ep.id]: d }))}
                  />
                </div>

                {/* Description */}
                <div style={{ padding: '0 1.25rem 1rem' }}>
                  {ep.description && (
                    <p style={{ fontSize: '0.875rem', color: '#333', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
                      {ep.description}
                    </p>
                  )}

                  {ep.highlights && ep.highlights.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6c6d6f', marginBottom: '0.375rem' }}>
                        Episode Highlights
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {ep.highlights.map((h, i) => (
                          <span key={i} style={{
                            fontSize: '0.75rem', backgroundColor: '#f5f5f5', color: '#333',
                            padding: '0.25rem 0.625rem', borderRadius: '2px', border: '1px solid #e0e0e0',
                          }}>
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {idx === 0 && (
                  <div style={{
                    backgroundColor: '#d00000', color: '#fff', fontSize: '0.625rem',
                    fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                    textAlign: 'center', padding: '0.375rem',
                  }}>
                    Latest Episode
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* About section */}
        <div style={{ marginTop: '2rem', backgroundColor: '#fff', border: '1px solid #e0e0e0', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 800, textTransform: 'uppercase', color: '#131313', margin: '0 0 0.5rem' }}>
            About LSR League Weekly
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#6c6d6f', lineHeight: 1.6, margin: 0 }}>
            LSR League Weekly is an AI-generated podcast produced after every race
            in the Lone Star Rubbin' League season. Two hosts break down the latest
            race, discuss championship implications, dive into driver storylines,
            and preview what's coming next. New episodes drop every week after race night.
          </p>
        </div>
      </div>
    </div>
  );
}
