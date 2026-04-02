import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

const SuperJobPool: React.FC = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [venues, setVenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [assignModal, setAssignModal] = useState<any>(null);
    const [selectedVenueId, setSelectedVenueId] = useState('');
    const [sending, setSending] = useState(false);
    const [detailModal, setDetailModal] = useState<any>(null);
    const [offers, setOffers] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        const [apps, venueList] = await Promise.all([
            apiService.getCCAApplications(filter === 'all' ? undefined : filter),
            apiService.getSuperVenues()
        ]);
        setApplications(apps);
        setVenues(venueList);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [filter]);

    const handleDirectAssign = async () => {
        if (!assignModal || !selectedVenueId) return;
        setSending(true);
        const result = await apiService.directAssignApplicant(assignModal.id, selectedVenueId);
        if (result.success) {
            alert(`✅ ${assignModal.nickname || assignModal.name}님이 성공적으로 CCA로 등록되었습니다.`);
            setAssignModal(null);
            setSelectedVenueId('');
            fetchData();
        } else {
            alert(result.error || 'Failed to assign.');
        }
        setSending(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`${name}의 지원서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
        const result = await apiService.deleteCCAApplication(id);
        if (result.success) {
            fetchData();
        } else {
            alert(result.error || 'Failed to delete.');
        }
    };

    const handleViewOffers = async (app: any) => {
        setDetailModal(app);
        // Load offers for this application by querying status
        const result = await apiService.checkApplicantStatus(app.name, app.pin);
        if (result && result.offers) {
            setOffers(result.offers);
        }
    };

    const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
        pending: { label: 'PENDING', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: 'hourglass_top' },
        reviewing: { label: 'IN REVIEW', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: 'visibility' },
        hired: { label: 'HIRED', color: 'text-green-400 bg-green-500/10 border-green-500/30', icon: 'check_circle' },
        rejected: { label: 'REJECTED', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: 'cancel' },
    };

    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        reviewing: applications.filter(a => a.status === 'reviewing').length,
        hired: applications.filter(a => a.status === 'hired').length,
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="size-12 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                    <span className="material-symbols-outlined text-white text-2xl">groups_3</span>
                </div>
                <div>
                    <h1 className="text-xl font-black uppercase tracking-wider">Talent Pool Monitor</h1>
                    <p className="text-xs text-gray-500 font-bold">구직자 지원서 모니터링 및 직권 배정</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                    { label: 'TOTAL', value: stats.total, color: 'text-white', bg: 'bg-zinc-800 border-zinc-700' },
                    { label: 'PENDING', value: stats.pending, color: 'text-amber-400', bg: 'bg-zinc-900 border-amber-500/20' },
                    { label: 'IN REVIEW', value: stats.reviewing, color: 'text-blue-400', bg: 'bg-zinc-900 border-blue-500/20' },
                    { label: 'HIRED', value: stats.hired, color: 'text-green-400', bg: 'bg-zinc-900 border-green-500/20' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{s.label}</p>
                        <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {[
                    { label: 'ALL', value: 'all' },
                    { label: 'PENDING', value: 'pending' },
                    { label: 'IN REVIEW', value: 'reviewing' },
                    { label: 'HIRED', value: 'hired' },
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${filter === f.value ? 'bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-zinc-900 text-gray-500 border-zinc-800 hover:border-gray-600'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Application List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-4xl text-red-500">cyclone</span>
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900 rounded-2xl border border-zinc-800">
                    <span className="material-symbols-outlined text-6xl text-zinc-700">person_search</span>
                    <p className="font-bold text-gray-500 mt-4">No applications found</p>
                </div>
            ) : (
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left p-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">APPLICANT</th>
                                    <th className="text-left p-4 text-[9px] font-black text-gray-500 uppercase tracking-widest hidden md:table-cell">DETAILS</th>
                                    <th className="text-center p-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">OFFERS</th>
                                    <th className="text-center p-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">STATUS</th>
                                    <th className="text-right p-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map(app => {
                                    const sc = statusConfig[app.status] || statusConfig.pending;
                                    return (
                                        <tr key={app.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {app.image ? (
                                                        <img src={app.image} alt="" className="size-10 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-gray-600">person</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-white">{app.nickname || app.name}</p>
                                                        <p className="text-[10px] text-gray-500">{app.phone || 'No phone'} · {app.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell">
                                                <div className="flex gap-1 flex-wrap">
                                                    {app.age && <span className="px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-bold text-gray-400">{app.age}세</span>}
                                                    {(app.languages || []).map((l: string) => (
                                                        <span key={l} className="px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-bold text-gray-400">{l}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-bold">{app.pending_offers_count || 0}</span>
                                                <span className="text-gray-600">/5</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[9px] font-black ${sc.color}`}>
                                                    <span className="material-symbols-outlined text-xs">{sc.icon}</span>
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {app.status !== 'hired' && (
                                                        <button 
                                                            onClick={() => setAssignModal(app)}
                                                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-colors"
                                                            title="직권 배정"
                                                        >
                                                            ASSIGN
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDelete(app.id, app.name)}
                                                        className="p-1.5 text-gray-600 hover:text-red-500 transition-colors"
                                                        title="삭제"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Direct Assign Modal */}
            {assignModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setAssignModal(null)}>
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 bg-red-600 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white">assignment_ind</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">Direct Assignment</h3>
                                <p className="text-[10px] text-gray-500 font-bold">슈퍼관리자 직권 배정</p>
                            </div>
                        </div>

                        <div className="bg-zinc-800 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                {assignModal.image ? (
                                    <img src={assignModal.image} alt="" className="size-12 rounded-lg object-cover" />
                                ) : (
                                    <div className="size-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-gray-500">person</span>
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-white">{assignModal.nickname || assignModal.name}</p>
                                    <p className="text-xs text-gray-500">{assignModal.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">업체 선택 *</label>
                                <select 
                                    value={selectedVenueId}
                                    onChange={e => setSelectedVenueId(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-red-500 transition-colors"
                                >
                                    <option value="">Select venue to assign...</option>
                                    {venues.map(v => (
                                        <option key={v.id} value={v.id}>{v.name} ({v.region || 'N/A'})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setAssignModal(null)} className="flex-1 py-3 border border-zinc-700 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-zinc-800 transition-colors">
                                Cancel
                            </button>
                            <button 
                                onClick={handleDirectAssign} 
                                disabled={sending || !selectedVenueId}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sending ? <span className="material-symbols-outlined animate-spin text-sm">cyclone</span> : <span className="material-symbols-outlined text-sm">assignment_ind</span>}
                                ASSIGN NOW
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperJobPool;
