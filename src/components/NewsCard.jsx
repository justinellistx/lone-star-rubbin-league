import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/news-card.css';

export default function NewsCard({ article }) {
  if (!article) return null;

  const category = article.category || 'News';
  const title = article.title || 'Untitled';
  const subtitle = article.subtitle || article.description;
  const date = article.date || article.publishedAt;
  const image = article.image || article.imageUrl;
  const link = article.link || article.url || '#';

  const getCategoryColor = (cat) => {
    const lowerCat = cat?.toLowerCase() || '';
    if (lowerCat.includes('highlight')) return 'category-highlight';
    if (lowerCat.includes('recap')) return 'category-recap';
    if (lowerCat.includes('announcement')) return 'category-announcement';
    return 'category-news';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isExternalLink = link?.startsWith('http');

  const NewsComponent = isExternalLink ? 'a' : Link;
  const newsProps = isExternalLink
    ? { href: link, target: '_blank', rel: 'noopener noreferrer' }
    : { to: link };

  return (
    <NewsComponent {...newsProps} className="news-card-link">
      <div className="news-card card">
        {/* Image */}
        {image && (
          <div className="news-card-image-wrapper">
            <img src={image} alt={title} className="news-card-image" />
            <div className="news-card-overlay"></div>
          </div>
        )}

        {/* Content */}
        <div className="news-card-content">
          {/* Category Badge */}
          <div className={`news-card-category ${getCategoryColor(category)}`}>
            {category.toUpperCase()}
          </div>

          {/* Title */}
          <h3 className="news-card-title">{title}</h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="news-card-subtitle">{subtitle}</p>
          )}

          {/* Date */}
          {date && (
            <p className="news-card-date">{formatDate(date)}</p>
          )}

          {/* CTA */}
          <div className="news-card-cta">
            <span>Read More</span>
            <span className="cta-arrow">→</span>
          </div>
        </div>
      </div>
    </NewsComponent>
  );
}
