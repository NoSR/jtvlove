import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';

const AdminJobPool: React.FC = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [offerModal, setOfferModal] = useState<any>(null);
    const [offerMessage, setOfferMessage] = useState('');
    const [sending, setSending] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const data = await apiService.getCCAApplications(filter === 'all' ? undefined : filter);
        setApplications(data);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [filter]);

    const handleSendOffer = async () => {
        if (!offerModal || !user?.venueId) return;
        setSending(true);
        
        // Get venue name
        const venue = await apiService.getVenueById(user.venueId);
        const venueName = venue?.name || user.venueId;

        const result = await apiService.sendJobOffer({
            applicationId: offerModal.id,
            venueId: user.venueId,
            venueName,
            message: offerMessage
        });

        if (result.success) {
            alert('Job offer sent successfully!');
            setOfferModal(null);
            setOfferMessage('');
            fetchData();
        } else {
            alert(result.error || 'Failed to send offer.');
        }
        setSending(false);
    };

    const statusBadge = (status: string) => {
        const config: Record<string, string> = {
            pending: 'bg-amber-500/10 text-amber-500',
            reviewing: 'bg-blue-500/10 text-blue-500',
            hired: 'bg-emerald-500/10 text-emerald-500',
            rejected: 'bg-red-500/10 text-red-500',
        };
        return config[status] || 'bg-zinc-100 text-zinc-500';
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold">인재풀 (Job Pool)</h1>
                    <p className="text-sm text-zinc-500 font-medium mt-1">구직 중인 CCA 지원자 리스트를 확인하고 채용 제안을 보낼 수 있습니다.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl">groups_3</span>
                    <span className="text-3xl font-black text-primary">{applications.length}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {[
                    { label: '전체', value: 'all' },
                    { label: '대기중', value: 'pending' },
                    { label: '검토중', value: 'reviewing' },
                    { label: '채용완료', value: 'hired' },
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.value ? 'bg-primary text-[#1b180d] shadow-lg' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">cyclone</span>
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl">
                    <span className="material-symbols-outlined text-6xl text-zinc-300 dark:text-zinc-700">person_search</span>
                    <p className="font-bold text-zinc-400 mt-4">아직 구직 중인 지원서가 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {applications.map(app => (
                        <div key={app.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                                {app.image ? (
                                    <img src={app.image} alt={app.name} className="size-16 rounded-xl object-cover flex-shrink-0" />
                                ) : (
                                    <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="material-symbols-outlined text-2xl text-primary">person</span>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-extrabold truncate">{app.nickname || app.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${statusBadge(app.status)}`}>{app.status}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1">{app.experience || 'No experience info'}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {(app.languages || []).map((l: string) => (
                                            <span key={l} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[9px] font-bold">{l}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
                                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-2">
                                    <span className="text-[9px] font-black text-zinc-400 block">나이</span>
                                    <span className="font-bold">{app.age || '-'}</span>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-2">
                                    <span className="text-[9px] font-black text-zinc-400 block">체형</span>
                                    <span className="font-bold">{app.body_size || '-'}</span>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-2">
                                    <span className="text-[9px] font-black text-zinc-400 block">대기 제안</span>
                                    <span className="font-bold">{app.pending_offers_count || 0}/5</span>
                                </div>
                            </div>

                            {app.introduction && (
                                <p className="text-xs text-zinc-500 mt-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 line-clamp-2">{app.introduction}</p>
                            )}

                            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[9px] font-bold text-zinc-400">
                                <span>지원일: {app.created_at ? new Date(app.created_at).toLocaleDateString() : '-'}</span>
                                {app.status !== 'hired' && (
                                    <button 
                                        onClick={() => setOfferModal(app)}
                                        className="px-4 py-2 bg-primary text-[#1b180d] rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                    >
                                        채용 제안하기
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Offer Modal */}
            {offerModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOfferModal(null)}>
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-extrabold mb-2">채용 제안 보내기</h3>
                        <p className="text-sm text-zinc-500 font-medium mb-6">
                            <span className="font-bold text-zinc-900 dark:text-white">{offerModal.nickname || offerModal.name}</span>님에게 채용 제안을 보냅니다.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">메시지 (선택사항)</label>
                                <textarea 
                                    value={offerMessage}
                                    onChange={e => setOfferMessage(e.target.value)}
                                    placeholder="예: 저희 업소에서 근무하실 관심이 있으시면 연락 주세요!"
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 text-sm font-medium outline-none resize-none h-24 focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setOfferModal(null)} className="flex-1 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                취소
                            </button>
                            <button 
                                onClick={handleSendOffer} 
                                disabled={sending}
                                className="flex-1 py-3 bg-primary text-[#1b180d] rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sending ? <span className="material-symbols-outlined animate-spin text-sm">cyclone</span> : <span className="material-symbols-outlined text-sm">send</span>}
                                전송
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJobPool;
