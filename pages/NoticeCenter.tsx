
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
            setPosts(data);
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

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-32 animate-fade-in">
            {/* Hero Section */}
            <section className="relative w-full h-[350px] mb-20 overflow-hidden flex flex-col justify-center rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl">
                <img src={heroSettings.image} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Banner" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
                <div className="relative px-8 md:px-20 space-y-6">
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
                <div className="grid grid-cols-1 gap-10 max-w-5xl mx-auto">
                    {posts.map(post => (
                        activeTab === 'FAQ' ? (
                            <div key={post.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all p-10 md:p-12 shadow-sm hover:shadow-2xl hover:shadow-primary/5">
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
                        ) : (
                            <Link key={post.id} to={`/community?board=${post.board}&id=${post.id}`} className="block bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                                <div className="flex flex-col md:flex-row min-h-[280px]">
                                    {post.image && (
                                        <div className="md:w-[40%] relative overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                            <img src={post.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={post.title} />
                                            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/20 to-transparent"></div>
                                        </div>
                                    )}
                                    <div className={`flex-1 flex flex-col p-10 md:p-12 ${!post.image && 'md:text-center md:items-center'}`}>
                                        <div className={`flex items-center gap-3 mb-6 ${!post.image && 'md:justify-center'}`}>
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary/20">{activeTab}</span>
                                            <span className="text-[10px] text-gray-400 font-bold tracking-tight">{new Date(post.created_at || new Date()).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        
                                        <h3 className="text-2xl md:text-3xl font-black dark:text-white group-hover:text-primary transition-colors leading-[1.15] mb-6 tracking-tight">{post.title}</h3>
                                        <p className="text-[15px] text-gray-500 dark:text-zinc-500 font-medium line-clamp-2 leading-relaxed mb-auto">{post.content}</p>
                                        
                                        <div className="mt-10 pt-8 flex items-center justify-between border-t border-gray-50 dark:border-white/5 uppercase">
                                            <span className="text-[10px] font-black text-gray-400 tracking-widest flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                                <span className="dark:text-zinc-600">{post.views || 0} VIEWS</span>
                                            </span>
                                            <div className="text-[10px] font-black text-primary tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all bg-primary/5 px-6 py-2.5 rounded-full border border-primary/10 group-hover:bg-primary group-hover:text-black hover:shadow-lg hover:shadow-primary/20">
                                                READ FULL STORY <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    ))}
                    {posts.length === 0 && (
                        <div className="py-40 text-center bg-gray-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5">
                            <div className="size-20 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                                <span className="material-symbols-outlined text-4xl text-gray-300">notifications_off</span>
                            </div>
                            <h4 className="text-gray-400 dark:text-zinc-600 font-black uppercase tracking-[0.5em] text-[10px]">No Broadcasts Scheduled</h4>
                        </div>
                    )}
                </div>
            )
        }</div>
    );
};

export default NoticeCenter;
