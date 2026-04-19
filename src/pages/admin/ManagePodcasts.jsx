import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Mic,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader,
  Eye,
  EyeOff,
  Play,
  Music,
  X,
} from 'lucide-react';

export default function ManagePodcasts() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    episode_number: '',
    title: '',
    description: '',
    track: '',
    race_number: '',
    date: new Date().toISOString().split('T')[0],
    highlights: '',
    published: false,
  });
  const [audioFile, setAudioFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const fetchEpisodes = async () => {
    try {
      setLoading(true);
      const { data, error: fetchErr } = await supabase
        .from('podcasts')
        .select('*')
        .order('episode_number', { ascending: false });
      if (fetchErr) throw fetchErr;
      setEpisodes(data || []);
    } catch (err) {
      setError('Failed to load episodes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      episode_number: '',
      title: '',
      description: '',
      track: '',
      race_number: '',
      date: new Date().toISOString().split('T')[0],
      highlights: '',
      published: false,
    });
    setAudioFile(null);
    setEditingId(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file (MP3, WAV, etc.)');
      return;
    }
    setAudioFile(file);
    setError('');
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      setError('Please drop an audio file (MP3, WAV, etc.)');
      return;
    }
    setAudioFile(file);
    setError('');
  };

  const uploadAudio = async (file, episodeNumber) => {
    const ext = file.name.split('.').pop();
    const fileName = `ep${episodeNumber}.${ext}`;
    const filePath = fileName;

    setUploadProgress('Uploading audio...');

    const { error: uploadErr } = await supabase.storage
      .from('podcasts')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage
      .from('podcasts')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.episode_number || !form.title) {
      setError('Episode number and title are required');
      return;
    }

    if (!editingId && !audioFile) {
      setError('Please upload an MP3 file');
      return;
    }

    try {
      setUploading(true);
      let audioUrl = null;

      // Upload audio if a new file was selected
      if (audioFile) {
        audioUrl = await uploadAudio(audioFile, form.episode_number);
        setUploadProgress('Saving episode...');
      }

      const highlights = form.highlights
        ? form.highlights.split('\n').map((h) => h.trim()).filter(Boolean)
        : [];

      const payload = {
        episode_number: parseInt(form.episode_number),
        title: form.title,
        description: form.description || null,
        track: form.track || null,
        race_number: form.race_number ? parseInt(form.race_number) : null,
        date: form.date,
        highlights,
        published: form.published,
        updated_at: new Date().toISOString(),
      };

      if (audioUrl) {
        payload.audio_url = audioUrl;
      }

      if (editingId) {
        const { error: updateErr } = await supabase
          .from('podcasts')
          .update(payload)
          .eq('id', editingId);
        if (updateErr) throw updateErr;
        setSuccess('Episode updated!');
      } else {
        const { error: insertErr } = await supabase
          .from('podcasts')
          .insert(payload);
        if (insertErr) throw insertErr;
        setSuccess('Episode created!');
      }

      resetForm();
      fetchEpisodes();
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleEdit = (ep) => {
    setForm({
      episode_number: ep.episode_number?.toString() || '',
      title: ep.title || '',
      description: ep.description || '',
      track: ep.track || '',
      race_number: ep.race_number?.toString() || '',
      date: ep.date || new Date().toISOString().split('T')[0],
      highlights: (ep.highlights || []).join('\n'),
      published: ep.published || false,
    });
    setEditingId(ep.id);
    setAudioFile(null);
    setShowForm(true);
  };

  const handleTogglePublish = async (ep) => {
    try {
      const { error: updateErr } = await supabase
        .from('podcasts')
        .update({ published: !ep.published, updated_at: new Date().toISOString() })
        .eq('id', ep.id);
      if (updateErr) throw updateErr;
      fetchEpisodes();
      setSuccess(`Episode ${!ep.published ? 'published' : 'unpublished'}!`);
    } catch (err) {
      setError('Failed to update: ' + err.message);
    }
  };

  const handleDelete = async (ep) => {
    if (!confirm(`Delete Episode ${ep.episode_number}: "${ep.title}"?`)) return;
    try {
      // Delete audio file from storage
      if (ep.audio_url) {
        const fileName = ep.audio_url.split('/').pop();
        await supabase.storage.from('podcasts').remove([fileName]);
      }
      const { error: delErr } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', ep.id);
      if (delErr) throw delErr;
      fetchEpisodes();
      setSuccess('Episode deleted');
    } catch (err) {
      setError('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Mic className="w-6 h-6 text-[#f5a623]" />
          <h1 className="text-2xl font-bold text-white">Manage Podcasts</h1>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#f5a623] text-[#0a0a0f] rounded-lg font-semibold hover:bg-[#e09000] transition-colors"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> New Episode
            </>
          )}
        </button>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-green-900/30 border border-green-700 rounded-lg text-green-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">
            {editingId ? 'Edit Episode' : 'New Episode'}
          </h2>

          {/* Audio Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors ${
              audioFile
                ? 'border-green-500 bg-green-900/10'
                : 'border-[#2a2a3e] hover:border-[#f5a623] hover:bg-[#1a1a2e]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {audioFile ? (
              <div className="flex items-center justify-center gap-3">
                <Music className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-white font-semibold">{audioFile.name}</p>
                  <p className="text-sm text-[#8a8a9a]">
                    {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAudioFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="ml-4 p-1 text-red-400 hover:text-red-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-[#8a8a9a] mx-auto mb-2" />
                <p className="text-[#8a8a9a]">
                  {editingId ? 'Drop new MP3 to replace audio (optional)' : 'Drop MP3 file here or click to browse'}
                </p>
                <p className="text-xs text-[#555] mt-1">Supports MP3, WAV, M4A</p>
              </>
            )}
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[#8a8a9a] mb-1">Episode #</label>
              <input
                type="number"
                value={form.episode_number}
                onChange={(e) => setForm({ ...form, episode_number: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:border-[#f5a623] focus:outline-none"
                placeholder="8"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9a] mb-1">Race #</label>
              <input
                type="number"
                value={form.race_number}
                onChange={(e) => setForm({ ...form, race_number: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:border-[#f5a623] focus:outline-none"
                placeholder="8"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8a9a] mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:border-[#f5a623] focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-[#8a8a9a] mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:border-[#f5a623] focus:outline-none"
              placeholder="Terry Domino Shocks the Field at Bristol"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-[#8a8a9a] mb-1">Track</label>
            <input
              type="text"
              value={form.track}
              onChange={(e) => setForm({ ...form, track: e.target.value })}
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:border-[#f5a623] focus:outline-none"
              placeholder="Bristol Motor Speedway"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-[#8a8a9a] mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:border-[#f5a623] focus:outline-none resize-y"
              placeholder="Terry Domino captures his first career win at Bristol..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-[#8a8a9a] mb-1">
              Highlights (one per line)
            </label>
            <textarea
              value={form.highlights}
              onChange={(e) => setForm({ ...form, highlights: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2a2a3e] rounded-lg text-white focus:border-[#f5a623] focus:outline-none resize-y"
              placeholder={"Terry Domino's breakthrough first win\nRonald Ramsey's second career pole\nNathan's worst finish (P18)"}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-[#8a8a9a] cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded"
              />
              Publish immediately
            </label>

            <div className="flex-1" />

            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-[#8a8a9a] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2 bg-[#f5a623] text-[#0a0a0f] rounded-lg font-semibold hover:bg-[#e09000] transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {uploadProgress || 'Saving...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {editingId ? 'Update Episode' : 'Upload Episode'}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Episodes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-[#f5a623] animate-spin" />
          <span className="ml-3 text-[#8a8a9a]">Loading episodes...</span>
        </div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-12 bg-[#14141f] border border-[#2a2a3e] rounded-lg">
          <Mic className="w-12 h-12 text-[#2a2a3e] mx-auto mb-3" />
          <p className="text-[#8a8a9a]">No episodes yet</p>
          <p className="text-sm text-[#555]">Click "New Episode" to upload your first podcast</p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((ep) => (
            <div
              key={ep.id}
              className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-4 flex items-center gap-4"
            >
              {/* Episode number badge */}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                  ep.published
                    ? 'bg-[#f5a623] text-[#0a0a0f]'
                    : 'bg-[#2a2a3e] text-[#8a8a9a]'
                }`}
              >
                {ep.episode_number}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold truncate">{ep.title}</h3>
                  {!ep.published && (
                    <span className="text-xs bg-[#2a2a3e] text-[#8a8a9a] px-2 py-0.5 rounded flex-shrink-0">
                      Draft
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8a8a9a]">
                  {ep.track && <span>{ep.track}</span>}
                  {ep.race_number && <span>Race {ep.race_number}</span>}
                  <span>
                    {new Date(ep.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {ep.audio_url && (
                    <span className="flex items-center gap-1 text-green-400">
                      <Music className="w-3 h-3" /> Audio uploaded
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {ep.audio_url && (
                  <a
                    href={ep.audio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-[#8a8a9a] hover:text-white transition-colors"
                    title="Play audio"
                  >
                    <Play className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleTogglePublish(ep)}
                  className={`p-2 transition-colors ${
                    ep.published
                      ? 'text-green-400 hover:text-green-300'
                      : 'text-[#8a8a9a] hover:text-[#f5a623]'
                  }`}
                  title={ep.published ? 'Unpublish' : 'Publish'}
                >
                  {ep.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(ep)}
                  className="p-2 text-[#8a8a9a] hover:text-[#f5a623] transition-colors"
                  title="Edit"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ep)}
                  className="p-2 text-[#8a8a9a] hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      <div className="mt-8 p-4 bg-[#14141f] border border-[#2a2a3e] rounded-lg">
        <h3 className="text-sm font-bold text-white mb-2">Workflow</h3>
        <ol className="text-xs text-[#8a8a9a] space-y-1 list-decimal list-inside">
          <li>Generate podcast in NotebookLM after each race</li>
          <li>Download the MP3 from NotebookLM</li>
          <li>Click "New Episode" above and drop in the MP3</li>
          <li>Fill in the episode details and check "Publish immediately"</li>
          <li>Hit Upload — the podcast goes live on the site</li>
        </ol>
      </div>
    </div>
  );
}
