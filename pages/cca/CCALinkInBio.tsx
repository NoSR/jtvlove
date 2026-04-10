import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { CCA } from '../../types';
import './CCALinkInBio.css';

const CCALinkInBio: React.FC = () => {
  const params = useParams();
  const username = params.username;
  
  const [cca, setCca] = useState<CCA | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchCca = async () => {
      if (username) {
        setLoading(true);
        try {
          const data = await apiService.getCCAByNickname(username);
          setCca(data);
        } catch (err) {
          console.error("Fetch CCA error:", err);
          setCca(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchCca();
  }, [username]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }).catch(err => {
      console.error("Clipboard error:", err);
    });
  };

  const handleBooking = () => {
    if (cca) {
      const bookingUrl = `https://jtvstar.com/booking/${cca.nickname || cca.id}`;
      window.open(bookingUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="lib-wrapper">
        <div className="lib-container skeleton">
          <div className="lib-hero-skeleton"></div>
          <div className="lib-content-skeleton">
            <div className="skeleton-line-lg"></div>
            <div className="skeleton-line-sm"></div>
            <div className="skeleton-metrics">
              <div className="skeleton-badge"></div>
              <div className="skeleton-badge"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cca) {
    return (
      <div className="lib-wrapper">
        <div className="lib-error">
          <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px' }}>error</span>
          <p>CCA를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lib-wrapper">
      <div className="lib-container">
        {/* Hero Section */}
        <div className="lib-hero">
          <img 
            src={cca.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000'} 
            alt={cca.name} 
            className="lib-profile-img" 
          />
          <div className="lib-hero-dimmed"></div>
          
          {/* Top Actions */}
          <div className="lib-top-actions">
            <button className="lib-icon-btn" onClick={handleCopyLink} aria-label="Copy Link">
              <span className="material-symbols-outlined">link</span>
            </button>
          </div>

          {/* Profile Info */}
          <div className="lib-profile-info">
            <h1 className="lib-name">{cca.name}</h1>
            <p className="lib-username">@{cca.nickname || cca.id}</p>
            <p className="lib-shop">{cca.venueName || 'Grand Palace JTV'}</p>
            
            {/* Vanity Metrics */}
            <div className="lib-metrics">
              <div className="lib-badge">
                <span className="lib-badge-label">Today Views</span>
                <span className="lib-badge-value">{(cca.viewsCount || 0).toLocaleString()}</span>
              </div>
              <div className="lib-badge highlight">
                <span className="lib-badge-label">Received Hearts ❤️</span>
                <span className="lib-badge-value">{(cca.likesCount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="lib-cta-container">
          <button className="lib-cta-button" onClick={handleBooking}>
            나 지명하기
          </button>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="lib-toast">
            링크가 복사되었어요! 틱톡 프로필에 추가해 보세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default CCALinkInBio;
