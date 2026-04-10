import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { CCA, MediaItem } from '../types';
import './CCALinkInBio.css';

interface CCALinkInBioProps {
  forcedUsername?: string;
}

const CCALinkInBio: React.FC<CCALinkInBioProps> = ({ forcedUsername }) => {
  const params = useParams();
  const username = forcedUsername || params.username;
  
  const [cca, setCca] = useState<CCA | null>(null);
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (username) {
        setLoading(true);
        try {
          // Both CCA info and Gallery can be fetched using the nickname/username
          const [ccaData, galleryData] = await Promise.all([
            apiService.getCCAByNickname(username),
            apiService.getGallery(username) 
          ]);
          
          setCca(ccaData);
          setGallery(Array.isArray(galleryData) ? galleryData : []);
        } catch (err) {
          console.error("Fetch data error:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
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

            {/* SNS Icons */}
            {cca.sns && (
              <div className="lib-sns-links">
                {Object.entries(cca.sns).map(([platform, handle]) => {
                  if (!handle) return null;
                  
                  let iconUrl = '';
                  let linkUrl = '';
                  
                  switch(platform.toLowerCase()) {
                    case 'instagram':
                      iconUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg';
                      linkUrl = `https://instagram.com/${handle}`;
                      break;
                    case 'telegram':
                      iconUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg';
                      linkUrl = `https://t.me/${handle.replace('@', '')}`;
                      break;
                    case 'kakao':
                      iconUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg';
                      linkUrl = handle.startsWith('http') ? handle : `https://open.kakao.com/o/${handle}`;
                      break;
                    case 'facebook':
                      iconUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282013%29.svg';
                      linkUrl = handle.startsWith('http') ? handle : `https://facebook.com/${handle}`;
                      break;
                    case 'tiktok':
                      iconUrl = 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg';
                      linkUrl = `https://tiktok.com/@${handle.replace('@', '')}`;
                      break;
                    default:
                      // Fallback icon or hide
                      return null;
                  }
                  
                  return (
                    <a key={platform} href={linkUrl} target="_blank" rel="noreferrer" className="lib-sns-icon">
                      <img src={iconUrl} alt={platform} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Gallery Section */}
        {gallery.length > 0 ? (
          <div className="lib-gallery">
            <h3 className="lib-section-title">Photo Gallery</h3>
            <div className="lib-gallery-grid">
              {gallery.map((item: MediaItem, idx: number) => (
                <div key={idx} className="lib-gallery-item">
                  <img src={item.url} alt={`Gallery ${idx}`} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="lib-no-data">
            <p>아직 등록된 갤러리 사진이 없습니다.</p>
          </div>
        )}

        {/* Info Section */}
        <div className="lib-info-section">
          <h3 className="lib-section-title">About Me</h3>
          <div className="lib-info-grid">
            {cca.mbti && (
              <div className="lib-info-card">
                <span className="lib-info-icon material-symbols-outlined">psychology</span>
                <div className="lib-info-content">
                  <span className="lib-info-label">MBTI</span>
                  <span className="lib-info-value">{cca.mbti}</span>
                </div>
              </div>
            )}
            {cca.zodiac && (
              <div className="lib-info-card">
                <span className="lib-info-icon material-symbols-outlined">auto_awesome</span>
                <div className="lib-info-content">
                  <span className="lib-info-label">Zodiac</span>
                  <span className="lib-info-value">{cca.zodiac}</span>
                </div>
              </div>
            )}
            {cca.height && (
              <div className="lib-info-card">
                <span className="lib-info-icon material-symbols-outlined">height</span>
                <div className="lib-info-content">
                  <span className="lib-info-label">Height</span>
                  <span className="lib-info-value">{cca.height}</span>
                </div>
              </div>
            )}
          </div>
          {cca.description && (
            <p className="lib-description">{cca.description}</p>
          )}
        </div>

        <div style={{ paddingBottom: '120px' }}></div>

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
