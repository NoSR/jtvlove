
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../services/apiService';
import { Venue } from '../../types';

interface VenueSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (venueId: string) => void;
}

const VenueSelectorModal: React.FC<VenueSelectorModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchVenues();
        }
    }, [isOpen]);

    const fetchVenues = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getVenues();
            setVenues(data);
        } catch (error) {
            console.error('Failed to fetch venues:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredVenues = venues.filter(venue =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.region.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[80vh]"
                >
                    <div className="p-8 pb-0">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter">업소 관리자 모드 접속</h2>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">이동할 페이지의 업소를 선택해 주세요.</p>
                            </div>
                            <button onClick={onClose} className="size-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="relative mb-6">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="업소명 또는 지역으로 검색..."
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-3">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black text-gray-500 uppercase">업소 목록 로드 중...</p>
                            </div>
                        ) : filteredVenues.length > 0 ? (
                            filteredVenues.map(venue => (
                                <button
                                    key={venue.id}
                                    onClick={() => onSelect(venue.id)}
                                    className="w-full flex items-center justify-between p-5 bg-zinc-50 dark:bg-white/5 rounded-[1.5rem] border border-transparent hover:border-primary/30 hover:bg-white dark:hover:bg-zinc-800 group transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700">
                                            <img src={venue.image} className="size-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-sm">{venue.name}</p>
                                            <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">location_on</span>
                                                {venue.region}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">arrow_forward</span>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</span>
                                <p className="text-[10px] font-black text-gray-500 uppercase">검색 결과가 없습니다.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-zinc-50 dark:bg-white/3 border-t border-white/5">
                        <p className="text-[9px] font-bold text-gray-400 leading-relaxed">
                            <span className="text-red-500">* 주의:</span> 슈퍼관리자 권한으로 업소 관리 페이지에 접속합니다. 변경 사항은 즉시 실제 데이터에 반영되므로 유의해 주시기 바랍니다.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default VenueSelectorModal;
