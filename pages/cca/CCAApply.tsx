import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

const CCAApply: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        nickname: '',
        age: '',
        height: '',
        languages: [] as string[],
        experience: '',
        introduction: '',
        venuePreference: 'any',
        photo: null as File | null
    });

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(prev => prev + 1);
    };

    const handlePrev = () => {
        setStep(prev => prev - 1);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLanguageToggle = (lang: string) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.includes(lang)
                ? prev.languages.filter(l => l !== lang)
                : [...prev.languages, lang]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Mock API call to submit application
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0f0e0b] flex flex-col items-center justify-center p-4 animate-fade-in font-display">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-[3rem] p-10 text-center shadow-2xl border border-primary/10">
                    <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <span className="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
                    </div>
                    <h2 className="text-3xl font-extrabold mb-4">지원 완료!</h2>
                    <p className="text-zinc-500 font-medium leading-relaxed mb-8">
                        파트너 등록 신청이 성공적으로 접수되었습니다. <br />
                        담당 업소(또는 본사)에서 24시간 내에 연락드릴 예정입니다.
                    </p>
                    <Link to="/" className="block w-full py-4 bg-primary text-[#1b180d] rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:scale-105 transition-transform">
                        메인으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf9f6] dark:bg-zinc-950 font-display flex flex-col items-center justify-center p-4 sm:p-8">
            <Helmet>
                <title>CCA 파트너 지원 | JTV STAR</title>
            </Helmet>

            <div className="w-full max-w-2xl relative">
                {/* Back button */}
                <Link to="/cca-portal/welcome" className="absolute -top-16 left-0 flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors font-bold text-sm">
                    <span className="material-symbols-outlined">arrow_back</span>
                    소개 페이지로
                </Link>

                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-primary/5 p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none transition-all"></div>

                    {/* Progress Indicator */}
                    <div className="mb-12 relative z-10">
                        <div className="flex justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Step {step} of 4</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                {step === 1 ? '기본 정보' : step === 2 ? '상세 프로필' : step === 3 ? '사진 등록' : '근무 희망지'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map(idx => (
                                <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= idx ? 'bg-primary shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'bg-zinc-200 dark:bg-zinc-800'}`}></div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={step === 4 ? handleSubmit : handleNext} className="relative z-10 min-h-[300px] flex flex-col">
                        
                        {/* STEP 1: Basic Info */}
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in flex-1">
                                <h2 className="text-3xl font-extrabold mb-8 tracking-tight">기본 정보 입력 <span className="text-primary text-4xl leading-none">.</span></h2>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">활동할 닉네임</label>
                                    <input 
                                        type="text" 
                                        name="nickname" 
                                        required 
                                        value={formData.nickname} 
                                        onChange={handleChange}
                                        placeholder="홍보에 사용될 이름" 
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">출생 년도 (Age)</label>
                                        <input 
                                            type="number" 
                                            name="age" 
                                            min="1990" 
                                            max="2005"
                                            required 
                                            value={formData.age} 
                                            onChange={handleChange}
                                            placeholder="예: 2001" 
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">키 (Height cm)</label>
                                        <input 
                                            type="number" 
                                            name="height" 
                                            required 
                                            value={formData.height} 
                                            onChange={handleChange}
                                            placeholder="예: 165" 
                                            className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Details */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in flex-1">
                                <h2 className="text-3xl font-extrabold mb-8 tracking-tight">상세 프로필 <span className="text-primary text-4xl leading-none">.</span></h2>
                                
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">가능한 언어 (다중 선택)</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['한국어', '영어', '일본어', '따갈로그'].map(lang => (
                                            <button
                                                type="button"
                                                key={lang}
                                                onClick={() => handleLanguageToggle(lang)}
                                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${formData.languages.includes(lang) ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-zinc-50 dark:bg-zinc-800 border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">근무 경력</label>
                                    <select 
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    >
                                        <option value="">선택해주세요</option>
                                        <option value="초보 (신입)">처음입니다 (신입)</option>
                                        <option value="1년 미만">1년 미만</option>
                                        <option value="1~3년">1~3년</option>
                                        <option value="3년 이상 (에이스)">3년 이상 (경력직)</option>
                                    </select>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">나의 매력 포인트 (자기소개)</label>
                                    <textarea 
                                        name="introduction" 
                                        required 
                                        value={formData.introduction} 
                                        onChange={handleChange}
                                        placeholder="고객들에게 어필할 나만의 장점을 적어주세요!" 
                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-transparent rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none h-24"
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Photo Upload */}
                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in flex-1">
                                <h2 className="text-3xl font-extrabold mb-8 tracking-tight">메인 사진 등록 <span className="text-primary text-4xl leading-none">.</span></h2>
                                
                                <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group h-64">
                                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                                    </div>
                                    <p className="font-bold text-lg mb-2">얼굴이 잘 나온 사진을 올려주세요</p>
                                    <p className="text-xs text-zinc-400 font-medium">최대 5MB, JPG/PNG 지원</p>
                                    <input type="file" className="hidden" accept="image/*" />
                                </div>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-center mt-4">* 제출 후 관리자 승인을 거치게 됩니다.</p>
                            </div>
                        )}

                        {/* STEP 4: Venue Preference */}
                        {step === 4 && (
                            <div className="space-y-6 animate-fade-in flex-1">
                                <h2 className="text-3xl font-extrabold mb-8 tracking-tight">근무 희망지 <span className="text-primary text-4xl leading-none">.</span></h2>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <label className={`cursor-pointer border-2 rounded-2xl p-6 transition-all ${formData.venuePreference === 'any' ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-primary/30'}`}>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="radio" 
                                                name="venuePreference" 
                                                value="any" 
                                                checked={formData.venuePreference === 'any'}
                                                onChange={handleChange}
                                                className="w-5 h-5 accent-primary" 
                                            />
                                            <div>
                                                <p className="font-black text-lg">전체 인재풀 등록 (추천)</p>
                                                <p className="text-xs text-zinc-500 font-medium mt-1">JTV STAR의 모든 제휴 업소가 나의 프로필을 보고 스카웃(면접)을 제안할 수 있습니다.</p>
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`cursor-pointer border-2 rounded-2xl p-6 transition-all ${formData.venuePreference === 'specific' ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-primary/30'}`}>
                                        <div className="flex items-center gap-4 mb-3">
                                            <input 
                                                type="radio" 
                                                name="venuePreference" 
                                                value="specific" 
                                                checked={formData.venuePreference === 'specific'}
                                                onChange={handleChange}
                                                className="w-5 h-5 accent-primary" 
                                            />
                                            <div>
                                                <p className="font-black text-lg">특정 업소 바로 지원</p>
                                                <p className="text-xs text-zinc-500 font-medium mt-1">지인 추천이나 이미 마음속에 정해둔 특정 프리미엄 라운지에 직접 이력서를 제출합니다.</p>
                                            </div>
                                        </div>
                                        {formData.venuePreference === 'specific' && (
                                            <select className="w-full mt-2 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-sm font-bold outline-none border ml-9 w-[calc(100%-2.25rem)]">
                                                <option>업소를 선택하세요</option>
                                                <option>Grand Palace JTV (Pasay)</option>
                                                <option>Club Galaxy (Makati)</option>
                                            </select>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                            {step > 1 && (
                                <button type="button" onClick={handlePrev} className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                    이전으로
                                </button>
                            )}
                            <button 
                                type="submit" 
                                disabled={isSubmitting || (step === 2 && formData.languages.length === 0)}
                                className="ml-auto px-10 py-4 bg-primary text-[#1b180d] rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[140px]"
                            >
                                {isSubmitting ? (
                                    <span className="material-symbols-outlined animate-spin">cyclone</span>
                                ) : step === 4 ? (
                                    '지원 완료하기'
                                ) : (
                                    <>다음 단계 <span className="material-symbols-outlined text-sm">arrow_forward</span></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CCAApply;
