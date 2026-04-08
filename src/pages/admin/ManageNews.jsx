import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, Loader, Eye, EyeOff } from 'lucide-react';

export default function ManageNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    body: '',
    category: 'news',
    imageUrl: '',
    published: false,
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setNews(data || []);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      body: '',
      category: 'news',
      imageUrl: '',
      published: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.body) {
      setError('Title and body are required');
      return;
    }

    try {
      if (editingId) {
        // Update existing article
        const { error: updateError } = await supabase
          .from('news')
          .update({
            title: formData.title,
            subtitle: formData.subtitle,
            body: formData.body,
            category: formData.category,
            image_url: formData.imageUrl,
            published: formData.published,
            published_at: formData.published ? new Date().toISOString() : null,
          })
          .eq('id', editingId);

        if (updateError) throw updateError;
        setSuccess('Article updated successfully');
      } else {
        // Add new article
        const { error: insertError } = await supabase.from('news').insert({
          title: formData.title,
          subtitle: formData.subtitle,
          body: formData.body,
          category: formData.category,
          image_url: formData.imageUrl,
          published: formData.published,
          published_at: formData.published ? new Date().toISOString() : null,
        });

        if (insertError) throw insertError;
        setSuccess('Article created successfully');
      }

      fetchNews();
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err.message || 'Failed to save article');
    }
  };

  const handleEdit = (article) => {
    setFormData({
      title: article.title,
      subtitle: article.subtitle || '',
      body: article.body || '',
      category: article.category,
      imageUrl: article.image_url || '',
      published: article.published,
    });
    setEditingId(article.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setSuccess('Article deleted successfully');
      fetchNews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting article:', err);
      setError(err.message || 'Failed to delete article');
    }
  };

  const togglePublished = async (article) => {
    try {
      const { error: updateError } = await supabase
        .from('news')
        .update({
          published: !article.published,
          published_at: !article.published ? new Date().toISOString() : null,
        })
        .eq('id', article.id);

      if (updateError) throw updateError;
      fetchNews();
    } catch (err) {
      console.error('Error toggling published:', err);
      setError('Failed to update article');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      news: 'bg-[#f5a623]',
      highlight: 'bg-[#2ec4b6]',
      recap: 'bg-[#e63946]',
      announcement: 'bg-[#a8dadc]',
    };
    return colors[category] || 'bg-[#8a8a9a]';
  };

  return (
    <div className="p-8 bg-[#0a0a0f] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manage News</h1>
            <p className="text-[#8a8a9a]">Create and publish league news and highlights</p>
          </div>
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="flex items-center gap-2 px-4 py-2 bg-[#f5a623] text-[#0a0a0f] font-semibold rounded-lg hover:bg-[#e59b1a] transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Article
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#1a1a2e] border border-[#e63946] rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#e63946] flex-shrink-0 mt-0.5" />
            <p className="text-[#e63946]">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[#1a1a2e] border border-[#2ec4b6] rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-[#2ec4b6] flex-shrink-0 mt-0.5" />
            <p className="text-[#2ec4b6]">{success}</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingId ? 'Edit Article' : 'Create New Article'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Title <span className="text-[#e63946]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Article title"
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Brief summary (optional)"
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                  >
                    <option value="news">News</option>
                    <option value="highlight">Highlight</option>
                    <option value="recap">Recap</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Body <span className="text-[#e63946]">*</span>
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Write your article here..."
                  rows="8"
                  className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3e] text-white placeholder-[#8a8a9a] rounded-lg focus:outline-none focus:border-[#f5a623] transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-3 py-4 border-y border-[#2a2a3e]">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 bg-[#0a0a0f] border border-[#2a2a3e] rounded cursor-pointer"
                />
                <label htmlFor="published" className="text-white font-medium cursor-pointer">
                  Publish immediately
                </label>
                <p className="text-[#8a8a9a] text-sm">
                  {formData.published ? 'This article will be visible to the public' : 'Save as draft'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#2ec4b6] text-white font-semibold rounded-lg hover:bg-[#28b0a4] transition-colors"
                >
                  {editingId ? 'Update Article' : 'Create Article'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 bg-[#1a1a2e] text-[#8a8a9a] font-semibold rounded-lg hover:bg-[#2a2a3e] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* News List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin text-[#f5a623] mx-auto mb-4" />
            <p className="text-[#8a8a9a]">Loading articles...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.length === 0 ? (
              <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
                <p className="text-[#8a8a9a]">No articles yet. Create one to get started.</p>
              </div>
            ) : (
              news.map((article) => (
                <div
                  key={article.id}
                  className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-6 hover:border-[#f5a623] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`${getCategoryColor(article.category)} text-white text-xs font-bold px-2 py-1 rounded`}
                        >
                          {article.category.toUpperCase()}
                        </span>
                        <span className="text-[#8a8a9a] text-sm">
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-1">{article.title}</h3>

                      {article.subtitle && (
                        <p className="text-[#8a8a9a] text-sm mb-2">{article.subtitle}</p>
                      )}

                      <p className="text-[#8a8a9a] text-sm line-clamp-2">{article.body}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => togglePublished(article)}
                        className={`p-2 rounded-lg transition-colors ${
                          article.published
                            ? 'text-[#2ec4b6] bg-[#1a1a2e] hover:bg-[#2a2a3e]'
                            : 'text-[#8a8a9a] hover:bg-[#1a1a2e]'
                        }`}
                        title={article.published ? 'Unpublish' : 'Publish'}
                      >
                        {article.published ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleEdit(article)}
                        className="p-2 text-[#f5a623] hover:bg-[#1a1a2e] rounded-lg transition-colors"
                        title="Edit article"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 text-[#e63946] hover:bg-[#1a1a2e] rounded-lg transition-colors"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {article.image_url && (
                    <div className="mt-4 pt-4 border-t border-[#2a2a3e]">
                      <p className="text-[#8a8a9a] text-xs mb-2">Image URL:</p>
                      <p className="text-[#2ec4b6] text-xs break-all">{article.image_url}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
