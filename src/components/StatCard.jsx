import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changeLabel,
}) {
  const isPositive = change > 0;

  return (
    <div className="stat-card">
      <div className="stat-card-content">
        {Icon && (
          <div className="stat-card-icon">
            <Icon size={24} className="icon" />
          </div>
        )}
        <div className="stat-card-body">
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>

      {change !== undefined && change !== null && (
        <div className={`stat-card-change ${isPositive ? 'positive' : 'negative'}`}>
          <div className="change-content">
            {isPositive ? (
              <TrendingUp size={16} className="change-icon" />
            ) : (
              <TrendingDown size={16} className="change-icon" />
            )}
            <span className="change-value">
              {isPositive ? '+' : ''}{change}
            </span>
          </div>
          {changeLabel && (
            <div className="change-label">{changeLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}
