import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { CCA, MediaItem } from '../types';
import './CCALinkInBio.css';

interface CCALinkInBioProps {
  forcedUsername?: string;
}

// Grade config for badge styling
const GRADE_CONFIG: Record<string, { label: string; icon: string; className: string }> = {
  STAR: { label: 'STAR', icon: '⭐', className: 'lib-grade-star' },
  ACE: { label: 'ACE', icon: '💎', className: 'lib-grade-ace' },
  PRO: { label: 'PRO', icon: '🔥', className: 'lib-grade-pro' },
  RISING: { label: 'RISING', icon: '🌱', className: 'lib-grade-rising' },
  NEW: { label: 'NEW', icon: '🆕', className: 'lib-grade-new' },
  // Legacy support
  CUTE: { label: 'CUTE', icon: '💕', className: 'lib-grade-rising' },
};

const CCALinkInBio: React.FC<CCALinkInBioProps> = ({ forcedUsername }) => {
  const params = useParams();
  const username = forcedUsername || params.username;
  
  const [cca, setCca] = useState<CCA | null>(null);
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);

  // Heart state
  const [heartCount, setHeartCount] = useState(0);
  const [isHearted, setIsHearted] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  // View count
  const [todayViews, setTodayViews] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (username) {
        setLoading(true);
        try {
          const [ccaData, galleryData] = await Promise.all([
            apiService.getCCAByNickname(username),
            apiService.getGallery(username) 
          ]);
          
          setCca(ccaData);
          setGallery(Array.isArray(galleryData) ? galleryData : []);

          // Set initial heart/view counts from CCA data
          if (ccaData) {
            setHeartCount(ccaData.likesCount || 0);
            setTodayViews(ccaData.viewsCount || 0);
          }
        } catch (err) {
          console.error("Fetch data error:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [username]);

  // Record profile view (with dedup)
  useEffect(() => {
    if (!cca?.id) return;
    const key = `lib_view_${cca.id}`;
    const lastView = sessionStorage.getItem(key);
    const now = Date.now();
    
    // Only count if 30min since last view from this session
    if (lastView && now - parseInt(lastView) < 30 * 60 * 1000) return;
    
    sessionStorage.setItem(key, String(now));
    
    // Fire-and-forget view recording
    fetch(`/api/cca-views`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cca_id: cca.id, visitor_id: getVisitorId() })
    }).then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.todayViews !== undefined) setTodayViews(data.todayViews);
      })
      .catch(() => {});
  }, [cca?.id]);

  // Load heart status
  useEffect(() => {
    if (!cca?.id) return;
    const userId = getVisitorId();
    apiService.getCCALikes(cca.id, userId).then(data => {
      setHeartCount(data.count || 0);
      setIsHearted(data.liked || false);
    }).catch(() => {});
  }, [cca?.id]);

  // Generate or retrieve a stable visitor ID (anonymous)
  function getVisitorId(): string {
    let vid = localStorage.getItem('lib_visitor_id');
    if (!vid) {
      vid = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('lib_visitor_id', vid);
    }
    return vid;
  }

  const showToastMsg = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      showToastMsg('링크가 복사되었어요! 프로필에 추가해 보세요 ✨');
    }).catch(() => {
      showToastMsg('링크 복사에 실패했습니다.');
    });
  };

  const handleBooking = () => {
    if (cca) {
      // Redirect to the main site's CCA profile page where the full booking flow exists
      window.location.href = `https://jtvstar.com/#/ccas/${cca.id}`;
    }
  };

  // ─── Heart ────────────────────────────────────
  const handleToggleHeart = async () => {
    if (!cca?.id) return;
    
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 600);

    const visitorId = getVisitorId();
    try {
      const result = await apiService.toggleCCALike(cca.id, visitorId);
      setIsHearted(result.liked);
      setHeartCount(result.count);
    } catch {
      // Optimistic toggle for offline/error
      setIsHearted(!isHearted);
      setHeartCount(prev => isHearted ? prev - 1 : prev + 1);
    }
  };

  // ─── Lightbox ─────────────────────────────────
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  const goToNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % gallery.length);
  }, [lightboxIndex, gallery.length]);

  const goToPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length);
  }, [lightboxIndex, gallery.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, goToNext, goToPrev]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
  };

  const gradeConfig = cca?.grade ? GRADE_CONFIG[cca.grade] || GRADE_CONFIG.NEW : GRADE_CONFIG.NEW;

  // ─── Loading ──────────────────────────────────
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
            <h1 className="lib-name">{cca.nickname || cca.name}</h1>
            <p className="lib-username">@{cca.nickname || cca.id}</p>
            
            {/* Grade Badge */}
            <div className={`lib-grade-badge ${gradeConfig.className}`}>
              <span>{gradeConfig.icon}</span>
              <span>{gradeConfig.label}</span>
              {cca.score !== undefined && <span className="lib-grade-score">{cca.score}</span>}
            </div>

            {/* Vanity Metrics */}
            <div className="lib-metrics">
              <div className="lib-badge">
                <span className="lib-badge-label">Today Views</span>
                <span className="lib-badge-value">{todayViews.toLocaleString()}</span>
              </div>
              <button 
                className={`lib-badge highlight lib-heart-btn ${isHearted ? 'hearted' : ''} ${heartAnimating ? 'animating' : ''}`}
                onClick={handleToggleHeart}
              >
                <span className="lib-badge-label">
                  {isHearted ? '❤️' : '🤍'} Hearts
                </span>
                <span className="lib-badge-value">{heartCount.toLocaleString()}</span>
              </button>
            </div>

            {/* SNS Icons */}
            {cca.sns && (
              <div className="lib-sns-links">
                {Object.entries(cca.sns).map(([platform, handle]) => {
                  if (!handle) return null;
                  
                  let iconClass = '';
                  let linkUrl = '';
                  
                  switch(platform.toLowerCase()) {
                    case 'instagram':
                      iconClass = 'lib-sns-instagram';
                      linkUrl = `https://instagram.com/${handle}`;
                      break;
                    case 'telegram':
                      iconClass = 'lib-sns-telegram';
                      linkUrl = `https://t.me/${(handle as string).replace('@', '')}`;
                      break;
                    case 'kakao':
                      iconClass = 'lib-sns-kakao';
                      linkUrl = (handle as string).startsWith('http') ? handle as string : `https://open.kakao.com/o/${handle}`;
                      break;
                    case 'facebook':
                      iconClass = 'lib-sns-facebook';
                      linkUrl = (handle as string).startsWith('http') ? handle as string : `https://facebook.com/${handle}`;
                      break;
                    case 'tiktok':
                      iconClass = 'lib-sns-tiktok';
                      linkUrl = `https://tiktok.com/@${(handle as string).replace('@', '')}`;
                      break;
                    default:
                      return null;
                  }
                  
                  return (
                    <a key={platform} href={linkUrl} target="_blank" rel="noreferrer" className={`lib-sns-chip ${iconClass}`}>
                      <span className="lib-sns-name">{platform}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Gallery Section */}
        <div className="lib-gallery">
          <h3 className="lib-section-title">
            <span className="material-symbols-outlined">photo_library</span>
            Photo Gallery
            <span className="lib-gallery-count">{gallery.length}</span>
          </h3>
          {gallery.length > 0 ? (
            <div className="lib-gallery-grid">
              {gallery.map((item: MediaItem, idx: number) => (
                <div 
                  key={item.id || idx} 
                  className="lib-gallery-item"
                  onClick={() => openLightbox(idx)}
                >
                  <img src={item.url} alt={item.caption || `Photo ${idx + 1}`} loading="lazy" />
                  <div className="lib-gallery-overlay">
                    <span className="material-symbols-outlined">zoom_in</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lib-no-data">
              <span className="material-symbols-outlined">add_photo_alternate</span>
              <p>갤러리를 준비 중입니다 ✨</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="lib-info-section">
          <h3 className="lib-section-title">
            <span className="material-symbols-outlined">person</span>
            About Me
          </h3>
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
            {cca.languages && cca.languages.length > 0 && (
              <div className="lib-info-card">
                <span className="lib-info-icon material-symbols-outlined">translate</span>
                <div className="lib-info-content">
                  <span className="lib-info-label">Languages</span>
                  <span className="lib-info-value">{cca.languages.join(', ')}</span>
                </div>
              </div>
            )}
          </div>
          {cca.description && (
            <p className="lib-description">"{cca.description}"</p>
          )}
          {cca.oneLineStory && !cca.description && (
            <p className="lib-description">"{cca.oneLineStory}"</p>
          )}
        </div>

        <div style={{ paddingBottom: '120px' }}></div>

        {/* Sticky CTA */}
        <div className="lib-cta-container">
          <button className="lib-cta-button" onClick={handleBooking}>
            <span className="material-symbols-outlined">calendar_month</span>
            프로필 보기 & 지명하기
          </button>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="lib-toast">
            {toastMessage}
          </div>
        )}

        {/* ─── Lightbox Modal ─── */}
        {lightboxIndex !== null && gallery[lightboxIndex] && (
          <div 
            className="lib-lightbox"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button className="lib-lightbox-close" onClick={closeLightbox}>
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Counter */}
            <div className="lib-lightbox-counter">
              {lightboxIndex + 1} / {gallery.length}
            </div>

            {/* Image */}
            <div className="lib-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img 
                src={gallery[lightboxIndex].url} 
                alt={gallery[lightboxIndex].caption || ''} 
                className="lib-lightbox-img"
              />
              {gallery[lightboxIndex].caption && (
                <p className="lib-lightbox-caption">{gallery[lightboxIndex].caption}</p>
              )}
            </div>

            {/* Navigation arrows */}
            {gallery.length > 1 && (
              <>
                <button 
                  className="lib-lightbox-nav lib-lightbox-prev"
                  onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button 
                  className="lib-lightbox-nav lib-lightbox-next"
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </>
            )}

            {/* Thumbnail strip */}
            {gallery.length > 1 && (
              <div className="lib-lightbox-thumbs">
                {gallery.map((item, idx) => (
                  <button
                    key={idx}
                    className={`lib-lightbox-thumb ${idx === lightboxIndex ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  >
                    <img src={item.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CCALinkInBio;
