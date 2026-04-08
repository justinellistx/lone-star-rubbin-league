import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Target } from 'lucide-react';
import '../styles/driver-card.css';

export default function DriverCard({ driver, stats }) {
  if (!driver) return null;

  const driverId = driver.id || driver.driverId;
  const driverName = driver.driverName || driver.name || 'Unknown Driver';
  const carNumber = driver.carNumber || driver.number || '-';
  const teamName = driver.team || driver.teamName || 'No Team';

  return (
    <Link to={`/driver/${driverId}`} className="driver-card-link">
      <div className="driver-card card">
        {/* Yellow accent border */}
        <div className="driver-card-accent"></div>

        {/* Header */}
        <div className="driver-card-header">
          <div className="driver-number-badge">
            {carNumber}
          </div>
          <div className="driver-info">
            <h3 className="driver-card-name">{driverName}</h3>
            <p className="driver-card-team">{teamName}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="driver-card-stats">
          <div className="stat">
            <div className="stat-icon">
              <Trophy size={16} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats?.wins || 0}</div>
              <div className="stat-label">Wins</div>
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon">
              <TrendingUp size={16} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats?.top5 || 0}</div>
              <div className="stat-label">Top 5</div>
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon">
              <Target size={16} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats?.avgFinish || '-'}</div>
              <div className="stat-label">Avg Fin</div>
            </div>
          </div>

          <div className="stat">
            <div className="stat-icon">
              <Trophy size={16} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats?.points || 0}</div>
              <div className="stat-label">Points</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="driver-card-cta">
          <span className="cta-text">View Profile</span>
          <span className="cta-arrow">→</span>
        </div>
      </div>
    </Link>
  );
}
