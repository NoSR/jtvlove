import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const CCALanding: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0f0e0b] font-display text-zinc-900 dark:text-white pb-20 overflow-x-hidden">
            <Helmet>
                <title>CCA 파트너 안내 | JTV STAR</title>
                <meta name="description" content="JTV STAR의 CCA로 합류하세요. 완벽한 프라이버시 보호, 똑똑한 스케줄 관리, 투명한 수익 정산을 경험하세요." />
            </Helmet>

            {/* Top Navigation for Landing */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-primary/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="size-8 bg-gradient-to-br from-primary to-yellow-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined text-sm font-black">sparkles</span>
                        </div>
                        <h1 className="text-sm font-black tracking-tighter uppercase">JTV STAR <span className="text-primary">PARTNERS</span></h1>
                    </Link>
                    <div className="flex gap-4">
                        <Link to="/cca-portal/login" className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
                            로그인
                        </Link>
                        <Link to="/cca-portal/apply" className="px-6 py-2 bg-primary text-[#1b180d] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            지원하기
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-yellow-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                    <div className="lg:w-1/2 text-center lg:text-left space-y-8 animate-fade-in">
                        <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-primary/20">
                            The Best Stage For You
                        </span>
                        <h2 className="text-4xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
                            당신의 가치를 증명할<br />
                            <span className="text-primary">최고의 무대,</span> JTV STAR
                        </h2>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                            능력에 맞는 합당한 대우를 받고 계신가요? 프라이버시 걱정 없는 똑똑한 스케줄 관리와, 상위 1% 예약 고객들을 지금 바로 만나보세요.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Link to="/cca-portal/apply" className="px-10 py-5 bg-[#1b180d] dark:bg-primary text-white dark:text-[#1b180d] rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                                파트너 지원하기 <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                    
                    <div className="lg:w-1/2 relative animate-scale-in">
                        <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-2xl border border-primary/10 rotate-2 hover:rotate-0 transition-transform duration-500">
                            {/* Mock Dashboard UI for Hero */}
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-primary/5">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-gradient-to-tr from-primary to-yellow-500 p-0.5">
                                        <div className="size-full bg-white dark:bg-zinc-900 rounded-full border-2 border-transparent"></div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">환영합니다</p>
                                        <p className="text-lg font-extrabold">에이스 <span className="text-primary">YUMI</span>님</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">오늘의 지명</p>
                                    <p className="text-xl font-black text-emerald-500">4팀</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-primary/20 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black text-zinc-400 w-12 text-center">20:00</span>
                                        <div>
                                            <p className="font-bold text-sm">VIP 고객 예약 (지명)</p>
                                            <p className="text-[10px] text-primary font-black uppercase">확정됨</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">verified</span>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-primary/20 transition-colors opacity-70">
                                    <div className="flex items-center gap-4">
                                        <span className="text-lg font-black text-zinc-400 w-12 text-center">22:30</span>
                                        <div>
                                            <p className="font-bold text-sm">일반 예약 대기</p>
                                            <p className="text-[10px] text-zinc-500 font-black uppercase">대기중</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-zinc-400 bg-zinc-200 dark:bg-zinc-700 p-2 rounded-xl">schedule</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute -bottom-6 -left-6 bg-white dark:bg-zinc-900 border border-primary/20 px-6 py-4 rounded-2xl shadow-xl z-20 flex items-center gap-4 animate-bounce hover:animate-none">
                            <div className="size-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">이번 달 수익금</p>
                                <p className="text-lg font-black tracking-tighter">₱ 128,500 <span className="text-primary text-xs">↑</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Benefits */}
            <section className="py-20 bg-white dark:bg-zinc-950 border-y border-primary/5 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest mb-4">Why Join Us?</span>
                        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">수백 명의 탑 CCA들이 <br className="md:hidden"/> <span className="text-primary">선택한 이유</span></h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-100 dark:border-white/5 hover:-translate-y-2 transition-transform group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-[#1b180d] transition-colors">
                                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                            </div>
                            <h4 className="text-xl font-bold mb-4">완벽한 프라이버시 보호</h4>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                                카카오톡, 라인 등 개인 메신저 연락처를 손님에게 알려줄 필요가 없습니다. 플랫폼 내장형 1:1 메시지를 통해 안전하게 예약과 지명을 관리하세요. 위험한 고객은 시스템 상에서 차단이 가능합니다.
                            </p>
                        </div>
                        
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-100 dark:border-white/5 hover:-translate-y-2 transition-transform group">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-3xl">event_available</span>
                            </div>
                            <h4 className="text-xl font-bold mb-4">똑똑하고 쉬운 일정 관리</h4>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                                오늘 내게 배정된 예약 건수와 스케줄, 그리고 지명 고객들을 직관적인 캘린더 화면에서 한눈에 확인하세요. 스위치 하나로 출퇴근과 대기 상태를 손쉽게 전환할 수 있습니다.
                            </p>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-100 dark:border-white/5 hover:-translate-y-2 transition-transform group">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                            </div>
                            <h4 className="text-xl font-bold mb-4">투명한 수익 시스템 & 인센티브</h4>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                                지명 수당, 팁, 예약 확정에 따른 인센티브/포인트가 실시간으로 집계되어 대시보드에 나타납니다. 자신이 얼마나 열심히 일하고 있는지 정확히 확인하고 능력만큼 보상받으세요.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Income Simulator Demo Section */}
            <section className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden bg-zinc-900 rounded-[3rem] mt-20 border border-primary/10 shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[100px] pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10 text-white">
                    <div className="lg:w-1/2 space-y-6">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Reward System</span>
                        <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">당신의 땀방울, <br />그 이상의 <span className="text-primary">스마트한 가치</span></h3>
                        <p className="text-zinc-400 leading-relaxed font-medium">단순 시급제에 얽매이지 마세요. 본인의 평점(Rating)이 높아지고 지명 손님(Request)이 늘어날수록, 시스템 알고리즘이 자동으로 추가 포인트/등급 배지 보상을 제공하여 더 많은 예약 기회를 창출해 드립니다.</p>
                        
                        <ul className="space-y-4 pt-4">
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg text-sm">verified</span>
                                <span className="font-bold text-sm">에이스 전용 메인 화면 노출권 획득</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg text-sm">paid</span>
                                <span className="font-bold text-sm">리뷰 1건당 환급 가능한 추가 마일리지</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-blue-500 bg-blue-500/10 p-1.5 rounded-lg text-sm">star_rate</span>
                                <span className="font-bold text-sm">우수 리뷰 누적 시 프리미엄 업소로 이적 스카웃 무대</span>
                            </li>
                        </ul>
                    </div>

                    <div className="lg:w-1/2 w-full">
                        {/* Interactive Graph Mockup */}
                        <div className="bg-zinc-950 p-8 rounded-3xl border border-white/10 shadow-inner">
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest mb-1">상위 5% 평균 합산 수입 비율</p>
                                    <h4 className="text-3xl font-black text-white">압도적 성장 곡선</h4>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-full border border-emerald-500/30">+32% / Mo</span>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-zinc-400">기본 출근 수당</span>
                                        <span className="text-white">40%</span>
                                    </div>
                                    <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-zinc-500 w-[40%] rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-zinc-400">시스템 예약 / 지명 (Request) 보너스</span>
                                        <span className="text-primary">45%</span>
                                    </div>
                                    <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[45%] rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-zinc-400">고객 보너스 팁 및 리뷰 리워드</span>
                                        <span className="text-emerald-500">15%</span>
                                    </div>
                                    <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[15%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-6 text-center">
                <h3 className="text-3xl md:text-5xl font-extrabold mb-6">지금 바로 시작하세요</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto mb-10 font-medium">프로필 등록은 단 3분이면 충분합니다. 지금 무료로 가입하고 JTV 최고 라운지의 파트너가 되어보세요.</p>
                <Link to="/cca-portal/apply" className="inline-flex px-12 py-5 bg-primary text-[#1b180d] rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-110 active:scale-95 transition-all">
                    프로필 등록 신청하기
                </Link>
                <p className="mt-6 text-[10px] text-zinc-400 uppercase tracking-widest font-black">심사 후 24시간 내 결과를 통보해 드립니다</p>
            </section>
        </div>
    );
};

export default CCALanding;
