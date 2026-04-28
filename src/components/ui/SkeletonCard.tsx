import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="skeleton-card card">
      <div className="skeleton-image">
        <div className="skeleton-pulse-circle" />
      </div>
      <div className="skeleton-info">
        <div className="skeleton-line title" />
        <div className="skeleton-line desc-1" />
        <div className="skeleton-line desc-2" />
        <div className="skeleton-line price" />
      </div>
    </div>
  );
};

export default SkeletonCard;
