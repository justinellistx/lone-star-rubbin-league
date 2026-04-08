import React from 'react';
import '../styles/loading-spinner.css';

export default function LoadingSpinner({ size = 'medium', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="spinner-container fullpage">
        <div className={`racing-spinner ${size}`}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-text">Loading</div>
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-container">
      <div className={`racing-spinner ${size}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
    </div>
  );
}
