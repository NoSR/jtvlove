
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Post } from '../types';

const NoticeCenter: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Notice' | 'Event' | 'FAQ'>('Notice');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [heroSettings, setHeroSettings] = useState({
        image: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e03a?q=80&w=2000',
        title: 'Communication Center',
        subtitle: 'Stay updated with the latest announcements, special events, and frequently asked questions.'
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const type = params.get('type');
        if (type === 'Event') setActiveTab('Event');
        else if (type === 'FAQ') setActiveTab('FAQ');
        else setActiveTab('Notice');
        setCurrentPage(1); // Reset page on tab change
    }, [location.search]);

    useEffect(() => {
        fetchPosts();
    }, [activeTab]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const [data, settings] = await Promise.all([
                apiService.getPosts(activeTab),
                apiService.getSiteSettings()
            ]);
            
            // Sort by created_at desc
            const sortedData = [...data].sort((a, b) => 
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            );
            
            setPosts(sortedData);
            if (settings) {
                setHeroSettings({
                    image: settings.notice_hero_image || 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e03a?q=80&w=2000',
                    title: settings.notice_hero_title || 'Communication Center',
                    subtitle: settings.notice_hero_subtitle || 'Stay updated with the latest announcements, special events, and frequently asked questions.'
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(posts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPosts = posts.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-32 animate-fade-in">
            {/* Hero Section */}
            <section className="relative w-full h-[300px] mb-20 overflow-hidden flex flex-col justify-center rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl">
                <img src={heroSettings.image} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Banner" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                <div className="relative px-8 md:px-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-primary/30 backdrop-blur-md">
                        <span className="material-symbols-outlined text-xs animate-pulse">campaign</span>
                        Broadcast Center
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.8]">{heroSettings.title}</h1>
                    <p className="text-white/70 max-w-xl text-sm md:text-lg font-medium leading-relaxed">
                        {heroSettings.subtitle}
                    </p>
                </div>
            </section>

            {/* Sub Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-20">
                <div className="flex p-1.5 bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border border-gray-100 dark:border-white/5 backdrop-blur-xl">
                    {(['Notice', 'Event', 'FAQ'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => navigate(`/notice?type=${tab}`)}
                            className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary text-black shadow-xl shadow-primary/20 scale-100' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                        >
                            {tab === 'Notice' ? '공지사항' : tab === 'Event' ? '이벤트' : 'FAQ'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center gap-4">
                    <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-rotate"></div>
                    <div className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">Synchronizing...</div>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto space-y-12">
                    {activeTab === 'FAQ' ? (
                        <div className="grid grid-cols-1 gap-6">
                            {currentPosts.map(post => (
                                <div key={post.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all p-10 md:p-12 shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="size-14 shrink-0 rounded-2xl bg-primary flex items-center justify-center font-black text-[#1b180d] text-2xl shadow-lg shadow-primary/20">Q</div>
                                        <div className="flex-1 space-y-6">
                                            <h3 className="text-xl md:text-2xl font-black dark:text-white leading-tight tracking-tight">{post.title}</h3>
                                            <div className="bg-gray-50 dark:bg-black/20 rounded-[2rem] p-10 border border-gray-100 dark:border-white/5 shadow-inner">
                                                <p className="text-[15px] text-gray-600 dark:text-zinc-400 font-bold leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] md:rounded-[3rem] shadow-xl overflow-hidden border border-gray-100 dark:border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-white/5">
                                            <th className="py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-20">NO</th>
                                            <th className="py-6 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                                            <th className="py-6 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-32">Date</th>
                                            <th className="py-6 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-24 whitespace-nowrap">Views</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentPosts.map((post, index) => (
                                            <tr 
                                                key={post.id} 
                                                onClick={() => navigate(`/community?board=${post.board}&id=${post.id}`)}
                                                className="group cursor-pointer hover:bg-primary/5 transition-colors border-b border-gray-50 dark:border-white/5 last:border-0"
                                            >
                                                <td className="py-6 px-8 text-center">
                                                    <span className="text-[11px] font-black text-gray-300 dark:text-zinc-700 group-hover:text-primary transition-colors">
                                                        {posts.length - (indexOfFirstItem + index)}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {post.image && (
                                                            <span className="material-symbols-outlined text-sm text-primary animate-pulse">image</span>
                                                        )}
                                                        <span className="text-sm md:text-base font-bold dark:text-zinc-200 group-hover:text-primary transition-colors line-clamp-1">
                                                            {post.title}
                                                        </span>
                                                        {new Date(post.created_at || '').getTime() > Date.now() - 86400000 * 3 && (
                                                             <span className="px-1.5 py-0.5 bg-primary text-[#1b180d] text-[8px] font-black rounded uppercase scale-90">New</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4 text-center">
                                                    <span className="text-[10px] font-bold text-gray-400">
                                                        {new Date(post.created_at || '').toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-8 text-center">
                                                    <span className="text-[10px] font-black text-gray-400 dark:text-zinc-600">
                                                        {post.views || 0}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {posts.length === 0 && (
                        <div className="py-40 text-center bg-gray-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5">
                            <div className="size-20 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                                <span className="material-symbols-outlined text-4xl text-gray-300">notifications_off</span>
                            </div>
                            <h4 className="text-gray-400 dark:text-zinc-600 font-black uppercase tracking-[0.5em] text-[10px]">No Broadcasts Scheduled</h4>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-12">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="size-10 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 flex items-center justify-center transition-all hover:border-primary disabled:opacity-30 disabled:hover:border-gray-100"
                            >
                                <span className="material-symbols-outlined text-sm font-black">chevron_left</span>
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`size-10 rounded-xl font-black text-xs transition-all ${currentPage === page ? 'bg-primary text-[#1b180d] shadow-lg shadow-primary/20' : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 text-gray-400 hover:border-primary'}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="size-10 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 flex items-center justify-center transition-all hover:border-primary disabled:opacity-30 disabled:hover:border-gray-100"
                            >
                                <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NoticeCenter;
