import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import './CCAFeed.css';

// ─── Types ────────────────────────────────────
interface FeedItem {
  id: string;
  type: string;
  url: string;
  caption: string;
  likes: number;
  shares: number;
  commentsCount: number;
  date: string;
  ccaId: string;
  ccaName: string;
  ccaNickname: string;
  ccaImage: string;
  ccaGrade: string;
  ccaScore: number;
  venueName: string;
  venueRegion: string;
}

interface FeedComment {
  id: string;
  galleryId: string;
  authorName: string;
  authorId?: string;
  authorImage?: string;
  content: string;
  likesCount: number;
  dislikesCount: number;
  userVote?: 'like' | 'dislike' | null;
  createdAt: string;
}

interface LiveCCA {
  id: string;
  nickname: string;
  image: string;
  grade: string;
  isLive: boolean;
}

// ─── Helpers ──────────────────────────────────
function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  const diffWk = Math.floor(diffDay / 7);
  return `${diffWk}w`;
}

function getVisitorId(): string {
  let vid = localStorage.getItem('lib_visitor_id');
  if (!vid) {
    vid = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('lib_visitor_id', vid);
  }
  return vid;
}

// ─── Main Feed Component ──────────────────────
const CCAFeed: React.FC = () => {
  const { user } = useAuth();

  // Tab state 
  const [activeTab, setActiveTab] = useState<'feed' | 'explore'>('feed');

  // Feed state
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Stories
  const [liveCCAs, setLiveCCAs] = useState<LiveCCA[]>([]);

  // Like states (per item)
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  // Comment input (per item)
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  // Post detail modal
  const [selectedPost, setSelectedPost] = useState<FeedItem | null>(null);
  const [postComments, setPostComments] = useState<FeedComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [modalCommentText, setModalCommentText] = useState('');

  // Double-tap heart
  const [heartBurstId, setHeartBurstId] = useState<string | null>(null);
  const lastTapRef = useRef<Record<string, number>>({});

  // Follow states
  const [followedCCAs, setFollowedCCAs] = useState<Record<string, boolean>>({});

  // Explore
  const [exploreSearch, setExploreSearch] = useState('');
  const [exploreItems, setExploreItems] = useState<FeedItem[]>([]);

  // ─── Load Feed ───
  const loadFeed = useCallback(async (pageNum: number, append: boolean = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await apiService.getFeed(pageNum, 15, user?.id);
      const items = data.items || [];

      if (append) {
        setFeedItems(prev => [...prev, ...items]);
      } else {
        setFeedItems(items);
      }
      setHasMore(data.hasMore);

      // Initialize like states
      const visitorId = user?.id || getVisitorId();
      for (const item of items) {
        setLikeCounts(prev => ({ ...prev, [item.id]: item.likes }));
        // Check like status async
        apiService.getGalleryLikes(item.id, visitorId).then(result => {
          setLikedItems(prev => ({ ...prev, [item.id]: result.liked }));
          setLikeCounts(prev => ({ ...prev, [item.id]: result.count }));
        });
      }
    } catch (err) {
      console.error('Feed load error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user?.id]);

  // ─── Load Initial Follows ───
  useEffect(() => {
    if (!user?.id) return;
    apiService.checkCCAFollow(user.id, '').then((res: any) => {
      if (res.followedIds) {
        const mapping: Record<string, boolean> = {};
        res.followedIds.forEach((id: string) => mapping[id] = true);
        setFollowedCCAs(mapping);
      }
    });
  }, [user?.id]);

  // ─── Load Stories (Live CCAs) ───
  const loadStories = useCallback(async () => {
    try {
      const ccas = await apiService.getCCAs();
      const stories: LiveCCA[] = ccas
        .filter((c: any) => c.status === 'active')
        .map((c: any) => ({
          id: c.id,
          nickname: c.nickname || c.name,
          image: c.image,
          grade: c.grade || 'NEW',
          isLive: c.isWorking || false
        }))
        // Sort: live first, then by grade
        .sort((a: LiveCCA, b: LiveCCA) => {
          if (a.isLive && !b.isLive) return -1;
          if (!a.isLive && b.isLive) return 1;
          return 0;
        });
      setLiveCCAs(stories);

      // For explore grid, use all feed items
      setExploreItems(feedItems);
    } catch (err) {
      console.error('Stories load error:', err);
    }
  }, [feedItems]);

  useEffect(() => {
    loadFeed(1);
    loadStories();
  }, [loadFeed, loadStories]);

  // ─── Infinite Scroll ───
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadFeed(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, loadFeed]);

  // ─── Like Toggle ───
  const handleLike = async (itemId: string) => {
    const visitorId = user?.id || getVisitorId();
    const wasLiked = likedItems[itemId];

    // Optimistic update
    setLikedItems(prev => ({ ...prev, [itemId]: !wasLiked }));
    setLikeCounts(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + (wasLiked ? -1 : 1) }));

    const result = await apiService.toggleGalleryLike(itemId, visitorId);
    setLikedItems(prev => ({ ...prev, [itemId]: result.liked }));
    setLikeCounts(prev => ({ ...prev, [itemId]: result.count }));
  };

  // ─── Double Tap ───
  const handleDoubleTap = (itemId: string) => {
    const now = Date.now();
    const last = lastTapRef.current[itemId] || 0;

    if (now - last < 300) {
      // Double tap!
      if (!likedItems[itemId]) {
        handleLike(itemId);
      }
      setHeartBurstId(itemId);
      setTimeout(() => setHeartBurstId(null), 800);
      lastTapRef.current[itemId] = 0;
    } else {
      lastTapRef.current[itemId] = now;
    }
  };

  // ─── Submit Comment (inline) ───
  const handleInlineComment = async (itemId: string) => {
    const text = commentTexts[itemId]?.trim();
    if (!text) return;
    if (!user) {
      alert('댓글을 작성하려면 로그인이 필요합니다.');
      return;
    }

    await apiService.createGalleryComment({
      galleryId: itemId,
      authorName: user.nickname || user.realName || 'User',
      authorId: user.id,
      content: text
    });

    setCommentTexts(prev => ({ ...prev, [itemId]: '' }));
    // Update comment count optimistically
    setFeedItems(prev => prev.map(fi => fi.id === itemId ? { ...fi, commentsCount: fi.commentsCount + 1 } : fi));
  };

  // ─── Open Post Detail ───
  const openPostDetail = async (item: FeedItem) => {
    setSelectedPost(item);
    setLoadingComments(true);
    document.body.style.overflow = 'hidden';

    // Load comments and votes independently
    const comments = await apiService.getGalleryComments(item.id);
    let votesMapping: Record<string, string> = {};
    if (user?.id) {
       const votes = await apiService.getGalleryCommentVotes(item.id, user.id);
       votes.forEach((v: any) => votesMapping[v.comment_id] = v.vote_type);
    }

    setPostComments(comments.map(c => ({
      ...c,
      likesCount: c.likesCount || 0,
      dislikesCount: c.dislikesCount || 0,
      userVote: votesMapping[c.id] || null
    })));
    setLoadingComments(false);
  };

  const closePostDetail = () => {
    setSelectedPost(null);
    setPostComments([]);
    setModalCommentText('');
    document.body.style.overflow = '';
  };

  // ─── Submit Comment (modal) ───
  const handleModalComment = async () => {
    if (!selectedPost || !modalCommentText.trim() || !user) return;

    const result = await apiService.createGalleryComment({
      galleryId: selectedPost.id,
      authorName: user.nickname || user.realName || 'User',
      authorId: user.id,
      content: modalCommentText.trim()
    });

    if (result.success) {
      setModalCommentText('');
      // Reload comments
      const comments = await apiService.getGalleryComments(selectedPost.id);
      setPostComments(comments);
      // Update count
      setFeedItems(prev => prev.map(fi =>
        fi.id === selectedPost.id
          ? { ...fi, commentsCount: result.commentsCount || fi.commentsCount + 1 }
          : fi
      ));
    }
  };

  // ─── Navigate to CCA Profile ───
  const goToProfile = (ccaNickname: string) => {
    window.location.hash = `/@${ccaNickname}`;
  };

  // ─── Navigate to main site ───
  const goToMainSite = () => {
    window.location.hash = '/';
  };

  // ─── Explore Items (filtered) ───
  const filteredExplore = exploreSearch
    ? feedItems.filter(fi =>
      (fi.ccaNickname || fi.ccaName).toLowerCase().includes(exploreSearch.toLowerCase()) ||
      (fi.caption || '').toLowerCase().includes(exploreSearch.toLowerCase()) ||
      (fi.venueName || '').toLowerCase().includes(exploreSearch.toLowerCase())
    )
    : feedItems;

  // ─── Comment Vote Toggle ───
  const handleCommentVote = async (commentId: string, voteType: 'like' | 'dislike') => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const targetComment = postComments.find(c => c.id === commentId);
    if (!targetComment) return;

    const previousVote = targetComment.userVote;
    const isRemoving = previousVote === voteType;
    const newVote = isRemoving ? null : voteType;

    // Optimistic UI updates
    setPostComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      let newLikes = c.likesCount;
      let newDislikes = c.dislikesCount;

      if (previousVote === 'like') newLikes = Math.max(0, newLikes - 1);
      if (previousVote === 'dislike') newDislikes = Math.max(0, newDislikes - 1);

      if (newVote === 'like') newLikes += 1;
      if (newVote === 'dislike') newDislikes += 1;

      return { ...c, userVote: newVote, likesCount: newLikes, dislikesCount: newDislikes };
    }));

    const result = await apiService.toggleGalleryCommentVote(commentId, user.id, voteType);
    if (result.success) {
      // Sync real counts
      setPostComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, userVote: result.currentVote, likesCount: result.likesCount, dislikesCount: result.dislikesCount }
          : c
      ));
    }
  };

  // ─── Follow Toggle ───
  const handleFollowToggle = async (ccaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // Optimistic UI
    const isF = followedCCAs[ccaId];
    setFollowedCCAs(prev => ({ ...prev, [ccaId]: !isF }));

    const res = await apiService.toggleCCAFollow(user.id, ccaId);
    setFollowedCCAs(prev => ({ ...prev, [ccaId]: res.isFollowing }));
  };

  // ─── Render ─────────────────────────────────
  return (
    <div className="feed-wrapper">
      {/* Header */}
      <header className="feed-header">
        <div className="feed-header-logo" onClick={goToMainSite}>
          <div className="feed-header-logo-icon">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>stars</span>
          </div>
          <span className="feed-header-logo-text">CCA Feed</span>
        </div>
        <div className="feed-header-actions">
          <button className="feed-header-btn" onClick={() => setActiveTab(activeTab === 'explore' ? 'feed' : 'explore')}>
            <span className="material-symbols-outlined">
              {activeTab === 'explore' ? 'home' : 'search'}
            </span>
          </button>
          {user ? (
            <button className="feed-header-btn" title={user.nickname || ''}>
              <span className="material-symbols-outlined">person</span>
            </button>
          ) : (
            <button className="feed-header-btn" onClick={() => { window.location.hash = '/login'; }}>
              <span className="material-symbols-outlined">login</span>
            </button>
          )}
        </div>
      </header>

      {activeTab === 'feed' ? (
        <>
          {/* Stories Bar */}
          {liveCCAs.length > 0 && (
            <div className="feed-stories">
              {liveCCAs.map(cca => (
                <div
                  key={cca.id}
                  className="feed-story-item"
                  onClick={() => goToProfile(cca.nickname)}
                >
                  <div className={`feed-story-avatar-ring ${cca.isLive ? '' : 'offline'}`}>
                    <img src={cca.image} alt={cca.nickname} className="feed-story-avatar" />
                  </div>
                  {cca.isLive && <span className="feed-story-live">LIVE</span>}
                  <span className="feed-story-name">{cca.nickname}</span>
                </div>
              ))}
            </div>
          )}

          {/* Feed */}
          <div className="feed-container">
            {loading ? (
              <div className="feed-loading">
                <div className="feed-spinner"></div>
                <span className="feed-loading-text">Loading Feed...</span>
              </div>
            ) : feedItems.length === 0 ? (
              <div className="feed-empty">
                <span className="material-symbols-outlined">photo_library</span>
                <p>No posts yet — stay tuned!</p>
              </div>
            ) : (
              <>
                {feedItems.map((item, index) => (
                  <article
                    key={item.id}
                    className="feed-card"
                    style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
                  >
                    {/* Card Header */}
                    <div className="feed-card-header">
                      <div className="feed-card-author" onClick={() => goToProfile(item.ccaNickname || item.ccaId)}>
                        <img src={item.ccaImage} alt="" className="feed-card-avatar" />
                        <div className="feed-card-author-info">
                          <span className="feed-card-author-name">
                            {item.ccaNickname || item.ccaName}
                            {item.ccaGrade && (
                              <span className={`feed-card-grade ${item.ccaGrade}`}>
                                {item.ccaGrade}
                              </span>
                            )}
                            {user && user.id !== item.ccaId && (
                              <button 
                                onClick={(e) => handleFollowToggle(item.ccaId, e)}
                                style={{
                                  background: followedCCAs[item.ccaId] ? 'transparent' : '#eebd2b',
                                  color: followedCCAs[item.ccaId] ? '#eebd2b' : '#1b180d',
                                  border: followedCCAs[item.ccaId] ? '1px solid #eebd2b' : 'none',
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  marginLeft: 6,
                                  cursor: 'pointer'
                                }}
                              >
                                {followedCCAs[item.ccaId] ? 'Following' : 'Follow'}
                              </button>
                            )}
                          </span>
                          <span className="feed-card-author-meta">
                            {item.venueName}
                            {item.venueRegion && <> · {item.venueRegion}</>}
                          </span>
                        </div>
                      </div>
                      <button className="feed-card-more"
                        onClick={() => openPostDetail(item)}
                      >
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </div>

                    {/* Card Media */}
                    <div
                      className="feed-card-media"
                      onClick={() => handleDoubleTap(item.id)}
                    >
                      {item.type === 'video' ? (
                        <>
                          <video src={item.url} muted playsInline preload="metadata" />
                          <div className="feed-card-video-overlay">
                            <span className="material-symbols-outlined">play_circle</span>
                          </div>
                        </>
                      ) : (
                        <img src={item.url} alt={item.caption || ''} loading="lazy" />
                      )}
                      {heartBurstId === item.id && (
                        <div className="feed-heart-burst">❤️</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="feed-card-actions">
                      <div className="feed-card-actions-left">
                        <button
                          className={`feed-action-btn ${likedItems[item.id] ? 'liked' : ''}`}
                          onClick={() => handleLike(item.id)}
                        >
                          <span className="material-symbols-outlined">
                            favorite
                          </span>
                        </button>
                        <button className="feed-action-btn" onClick={() => openPostDetail(item)}>
                          <span className="material-symbols-outlined">chat_bubble</span>
                        </button>
                        <button className="feed-action-btn" onClick={() => {
                          const shareUrl = `${window.location.origin}${window.location.pathname}#/@${item.ccaNickname || item.ccaId}`;
                          navigator.clipboard?.writeText(shareUrl);
                        }}>
                          <span className="material-symbols-outlined">send</span>
                        </button>
                      </div>
                      <button className="feed-action-btn" onClick={() => goToProfile(item.ccaNickname || item.ccaId)}>
                        <span className="material-symbols-outlined">bookmark</span>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="feed-card-content">
                      <div className="feed-card-likes">
                        {(likeCounts[item.id] || 0).toLocaleString()} likes
                      </div>
                      <div className="feed-card-caption">
                        <strong onClick={() => goToProfile(item.ccaNickname || item.ccaId)}>
                          {item.ccaNickname || item.ccaName}
                        </strong>
                        {item.caption || ''}
                      </div>
                      {item.commentsCount > 0 && (
                        <button
                          className="feed-card-comments-link"
                          onClick={() => openPostDetail(item)}
                        >
                          View all {item.commentsCount} comments
                        </button>
                      )}
                      <div className="feed-card-time">{timeAgo(item.date)}</div>
                    </div>

                    {/* Inline Comment */}
                    <div className="feed-comment-input-row">
                      <input
                        className="feed-comment-input"
                        placeholder="Add a comment..."
                        value={commentTexts[item.id] || ''}
                        onChange={e => setCommentTexts(prev => ({ ...prev, [item.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') handleInlineComment(item.id); }}
                      />
                      <button
                        className={`feed-comment-post-btn ${commentTexts[item.id]?.trim() ? 'active' : ''}`}
                        onClick={() => handleInlineComment(item.id)}
                      >
                        Post
                      </button>
                    </div>
                  </article>
                ))}

                {/* Infinite scroll sentinel */}
                <div ref={loadMoreRef} className="feed-load-more">
                  {loadingMore && (
                    <div className="feed-loading" style={{ padding: '20px' }}>
                      <div className="feed-spinner"></div>
                    </div>
                  )}
                  {!hasMore && feedItems.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', opacity: 0.3 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
                      <p style={{ fontSize: 10, fontWeight: 800, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        You're all caught up
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        /* ─── Explore Tab ─── */
        <div className="feed-container">
          <div className="feed-explore">
            <div className="feed-explore-search">
              <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.3)' }}>search</span>
              <input
                placeholder="Search CCA, venue, or keyword..."
                value={exploreSearch}
                onChange={e => setExploreSearch(e.target.value)}
              />
            </div>
            {filteredExplore.length > 0 ? (
              <div className="feed-explore-grid">
                {filteredExplore.map(item => (
                  <div
                    key={item.id}
                    className="feed-explore-item"
                    onClick={() => openPostDetail(item)}
                  >
                    <img src={item.url} alt="" loading="lazy" />
                    <div className="feed-explore-item-overlay">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>favorite</span>
                      {likeCounts[item.id] || item.likes || 0}
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat_bubble</span>
                      {item.commentsCount || 0}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="feed-empty">
                <span className="material-symbols-outlined">search_off</span>
                <p>No results found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <nav className="feed-tabbar">
        <button className={`feed-tab-item ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>
          <span className="material-symbols-outlined">home</span>
          <span className="feed-tab-label">Feed</span>
        </button>
        <button className={`feed-tab-item ${activeTab === 'explore' ? 'active' : ''}`} onClick={() => setActiveTab('explore')}>
          <span className="material-symbols-outlined">search</span>
          <span className="feed-tab-label">Explore</span>
        </button>
        <button className="feed-tab-item" onClick={goToMainSite}>
          <span className="material-symbols-outlined">language</span>
          <span className="feed-tab-label">Main Site</span>
        </button>
      </nav>

      {/* ─── Post Detail Modal ─── */}
      {selectedPost && (
        <div className="feed-modal-overlay" onClick={closePostDetail}>
          <button className="feed-modal-close" onClick={closePostDetail}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="feed-modal-card" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="feed-card-header">
              <div className="feed-card-author" onClick={() => goToProfile(selectedPost.ccaNickname || selectedPost.ccaId)}>
                <img src={selectedPost.ccaImage} alt="" className="feed-card-avatar" />
                <div className="feed-card-author-info">
                  <span className="feed-card-author-name">
                    {selectedPost.ccaNickname || selectedPost.ccaName}
                    {selectedPost.ccaGrade && (
                      <span className={`feed-card-grade ${selectedPost.ccaGrade}`}>
                        {selectedPost.ccaGrade}
                      </span>
                    )}
                  </span>
                  <span className="feed-card-author-meta">{selectedPost.venueName}</span>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="feed-card-media" style={{ borderRadius: 0, margin: 0, width: '100%' }}>
              {selectedPost.type === 'video' ? (
                <video src={selectedPost.url} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
              ) : (
                <img src={selectedPost.url} alt="" />
              )}
            </div>

            {/* Actions */}
            <div className="feed-card-actions">
              <div className="feed-card-actions-left">
                <button
                  className={`feed-action-btn ${likedItems[selectedPost.id] ? 'liked' : ''}`}
                  onClick={() => handleLike(selectedPost.id)}
                >
                  <span className="material-symbols-outlined">favorite</span>
                </button>
                <button className="feed-action-btn">
                  <span className="material-symbols-outlined">chat_bubble</span>
                </button>
                <button className="feed-action-btn" onClick={() => {
                  const shareUrl = `${window.location.origin}${window.location.pathname}#/@${selectedPost.ccaNickname || selectedPost.ccaId}`;
                  navigator.clipboard?.writeText(shareUrl);
                }}>
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>

            <div className="feed-card-content">
              <div className="feed-card-likes">
                {(likeCounts[selectedPost.id] || 0).toLocaleString()} likes
              </div>
              <div className="feed-card-caption">
                <strong>{selectedPost.ccaNickname || selectedPost.ccaName}</strong>
                {selectedPost.caption || ''}
              </div>
              <div className="feed-card-time">{timeAgo(selectedPost.date)}</div>
            </div>

            {/* Comments */}
            <div className="feed-comments-section">
              {loadingComments ? (
                <div className="feed-loading" style={{ padding: '20px 0' }}>
                  <div className="feed-spinner" style={{ width: 24, height: 24 }}></div>
                </div>
              ) : postComments.length > 0 ? (
                postComments.map(c => (
                  <div key={c.id} className="feed-comment-item">
                    <img
                      src={c.authorImage || 'https://via.placeholder.com/28'}
                      alt=""
                      className="feed-comment-avatar"
                    />
                    <div className="feed-comment-body">
                      <span>
                        <span className="feed-comment-author">{c.authorName}</span>
                        <span className="feed-comment-text">{c.content}</span>
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <div className="feed-comment-time">{timeAgo(c.createdAt)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button 
                            onClick={() => handleCommentVote(c.id, 'like')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, color: c.userVote === 'like' ? '#ef4444' : 'rgba(255,255,255,0.4)' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 13, fontVariationSettings: c.userVote === 'like' ? "'FILL' 1" : "'FILL' 0" }}>thumb_up</span>
                            <span style={{ fontSize: 10 }}>{c.likesCount || 0}</span>
                          </button>
                          <button 
                            onClick={() => handleCommentVote(c.id, 'dislike')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, color: c.userVote === 'dislike' ? '#60a5fa' : 'rgba(255,255,255,0.4)' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 13, transform: 'scaleY(-1)' }}>thumb_down</span>
                            {c.dislikesCount > 0 && <span style={{ fontSize: 10 }}>{c.dislikesCount}</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', opacity: 0.3, fontSize: 12 }}>
                  No comments yet — be the first!
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="feed-comment-input-row">
              <input
                className="feed-comment-input"
                placeholder={user ? 'Add a comment...' : 'Login to comment'}
                value={modalCommentText}
                onChange={e => setModalCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleModalComment(); }}
                disabled={!user}
              />
              <button
                className={`feed-comment-post-btn ${modalCommentText.trim() ? 'active' : ''}`}
                onClick={handleModalComment}
                disabled={!user}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CCAFeed;
