import React, { useState, useMemo } from 'react';
import { Newspaper, ChevronRight, Filter, Clock } from 'lucide-react';
import { useNews } from '../hooks/useSupabase';

const CATEGORY_CONFIG = {
  all: { label: 'All', color: '#f5a623' },
  recap: { label: 'Race Recaps', color: '#e63946' },
  highlight: { label: 'Highlights', color: '#2ec4b6' },
  news: { label: 'News', color: '#f5a623' },
  announcement: { label: 'Announcements', color: '#a78bfa' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ArticleCard({ article, featured = false }) {
  const [expanded, setExpanded] = useState(false);
  const catConfig = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG.news;

  // Truncate body for preview
  const previewText = article.body?.length > 200
    ? article.body.substring(0, 200) + '...'
    : article.body;

  return (
    <div
      className={`bg-[#14141f] border border-[#2a2a3e] rounded-lg overflow-hidden hover:border-[#f5a623] transition cursor-pointer ${
        featured ? 'md:col-span-2' : ''
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-6">
        {/* Category + Date */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{ color: catConfig.color, backgroundColor: catConfig.color + '15' }}
          >
            {catConfig.label}
          </span>
          <div className="flex items-center gap-1 text-[#8a8a9a] text-xs">
            <Clock size={12} />
            {formatDate(article.published_at || article.created_at)}
          </div>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-white mb-2 ${featured ? 'text-2xl' : 'text-lg'}`}>
          {article.title}
        </h3>

        {/* Subtitle */}
        {article.subtitle && (
          <p className={`text-[#f5a623] mb-3 ${featured ? 'text-base' : 'text-sm'}`}>
            {article.subtitle}
          </p>
        )}

        {/* Body preview or full */}
        <div className="text-[#8a8a9a] text-sm leading-relaxed whitespace-pre-line">
          {expanded ? article.body : previewText}
        </div>

        {/* Read more / collapse */}
        <div className="mt-4 flex items-center gap-1 text-[#f5a623] text-sm font-medium">
          {expanded ? 'Show less' : 'Read more'}
          <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>
    </div>
  );
}

export default function News() {
  const { data: articles, loading } = useNews(50);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (activeCategory === 'all') return articles;
    return articles.filter((a) => a.category === activeCategory);
  }, [articles, activeCategory]);

  // Count per category
  const categoryCounts = useMemo(() => {
    if (!articles) return {};
    const counts = { all: articles.length };
    articles.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [articles]);

  return (
    <div className="bg-[#0a0a0f] min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="text-[#f5a623]" size={36} />
            <h1 className="text-5xl md:text-6xl font-black text-white">NEWS</h1>
          </div>
          <p className="text-[#8a8a9a] text-lg">
            Race recaps, driver storylines, and all the drama from the Lone Star Rubbin' League
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                activeCategory === key
                  ? 'text-[#0a0a0f]'
                  : 'text-[#8a8a9a] hover:text-white bg-[#14141f] border border-[#2a2a3e]'
              }`}
              style={
                activeCategory === key
                  ? { backgroundColor: config.color, borderColor: config.color }
                  : {}
              }
            >
              {config.label}
              {categoryCounts[key] ? ` (${categoryCounts[key]})` : ''}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
            <p className="text-[#8a8a9a]">Loading articles...</p>
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article, idx) => (
              <ArticleCard
                key={article.id}
                article={article}
                featured={idx === 0 && activeCategory === 'all'}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#14141f] border border-[#2a2a3e] rounded-lg p-12 text-center">
            <p className="text-[#8a8a9a]">No articles in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
