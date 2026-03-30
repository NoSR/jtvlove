import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Guidebook: React.FC = () => {
  const [activeTab, setActiveTab] = useState('intro');

  const tabs = [
    { id: 'intro', label: 'JTV 알아보기', icon: 'lightbulb' },
    { id: 'system', label: '시스템 & 예약', icon: 'devices' },
    { id: 'etiquette', label: '매너 & 꿀팁', icon: 'verified_user' },
    { id: 'faq', label: '자주 묻는 질문', icon: 'quiz' },
  ];

  return (
    <div className="min-h-screen bg-background-dark text-white animate-fade-in pb-20">
      <Helmet>
        <title>초보자 가이드북 | JTV STAR</title>
        <meta name="description" content="JTV가 처음이신가요? 시스템 이용 방법, 예약 방법, 매너, 꿀팁까지 초보자를 위한 완벽 가이드를 제공합니다." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 md:px-12 bg-zinc-950 overflow-hidden border-b border-primary/20">
         <div className="absolute top-0 right-0 lg:right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-600/5 rounded-full blur-[100px] translate-y-1/2 pointer-events-none"></div>
         
         <div className="max-w-4xl mx-auto relative z-10 text-center">
            <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary text-[11px] font-black rounded-full uppercase tracking-widest border border-primary/30 backdrop-blur-sm mb-6">
              Beginner's Guide
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight font-display">
              처음 오신 분들을 위한<br className="md:hidden"/> <span className="text-primary">100% 즐기기 가이드</span>
            </h1>
            <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
               방문이 처음이신가요? 당황하지 마세요.<br />
               기본적인 룰부터 예약, 스마트하게 즐기는 팁까지 모두 준비했습니다.
            </p>
         </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 !-mt-8 relative z-20">
         {/* Navigation Tabs */}
         <div className="bg-zinc-900 border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row gap-2 max-w-4xl mx-auto mb-16">
            {tabs.map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black transition-all ${activeTab === tab.id ? 'bg-primary text-[#1b180d] shadow-lg scale-[1.02]' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
               >
                  <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                  {tab.label}
               </button>
            ))}
         </div>

         {/* Content Panes */}
         <div className="max-w-4xl mx-auto">
            {/* Intro Tab */}
            {activeTab === 'intro' && (
               <div className="space-y-12 animate-fade-in">
                  <div className="text-center mb-12">
                     <h2 className="text-3xl font-extrabold mb-4">JTV란 무엇인가요?</h2>
                     <p className="text-zinc-400 leading-relaxed">Japanese Television의 약자로, 합리적인 가격에 <br className="hidden sm:block"/>안전하고 건전하게 대화와 음주, 노래를 즐길 수 있는 프리미엄 라운지입니다.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl hover:border-primary/30 transition-colors group">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                           <span className="material-symbols-outlined text-2xl">safety_divider</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">안전하고 건전한 문화</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           공개된 라운지 형식의 공간이 많으며, 엄격한 매너 룰이 적용되어 누구나 안심하고 편안하게 대화할 수 있는 분위기입니다.
                        </p>
                     </div>
                     <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl hover:border-primary/30 transition-colors group">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                           <span className="material-symbols-outlined text-2xl">schedule</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">시간제(Set) 시스템</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           보통 90분 또는 60분을 1세트(Set)로 운영하며, 정해진 기본요금에 음료가 포함된 시간제 요금 시스템을 채택하고 있습니다.
                        </p>
                     </div>
                     <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl hover:border-primary/30 transition-colors group">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                           <span className="material-symbols-outlined text-2xl">groups</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">로테이션 시스템</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           특정 매니저를 지명(Request)하지 않으면, 여러 명의 직원이 일정 시간마다 교대로 자리에 앉아 대화를 나누는 로테이션 시스템을 경험할 수 있습니다.
                        </p>
                     </div>
                     <div className="bg-zinc-900 border border-white/5 p-8 rounded-3xl hover:border-primary/30 transition-colors group">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                           <span className="material-symbols-outlined text-2xl">local_bar</span>
                        </div>
                        <h3 className="text-xl font-bold mb-3">합리적인 비용</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                           기본 세트 요금에 맥주, 소주, 기본 안주 등이 무제한(또는 기본 제공)으로 포함된 경우가 많아 예산을 예측하기 쉽습니다.
                        </p>
                     </div>
                  </div>
               </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
               <div className="space-y-12 animate-fade-in">
                  <div className="text-center mb-12">
                     <h2 className="text-3xl font-extrabold mb-4">입장부터 결제까지</h2>
                     <p className="text-zinc-400 leading-relaxed">JTV의 기본적인 이용 순서와 시스템을 알아볼까요?</p>
                  </div>

                  <div className="space-y-6">
                     {[
                        { step: '01', title: '예약 및 방문', desc: '플랫폼을 통해 마음에 드는 업소나 CCA를 미리 확인하고 온라인으로 예약을 확정하세요. 워크인(예약 없이 방문)도 가능하지만 주말엔 예약이 권장됩니다.' },
                        { step: '02', title: '입장 및 좌석 안내', desc: '도착하면 마마상(매니저)이 예약 확인 후 자리로 안내합니다. VIP룸 또는 오픈된 소파 라운지 중 선택할 수 있습니다 (VIP룸 이용 시 추가 차지가 발생할 수 있습니다).' },
                        { step: '03', title: '지명 (Request)', desc: '미리 앱에서 찜해둔 CCA가 있다면 도착 시 지명(Request)하세요. 지명비가 별도로 추가되지만, 해당 직원이 세트 시간 내내 함께합니다.' },
                        { step: '04', title: '연장 및 결제', desc: '세트 종료 10~15분 전에 직원이 연장(Extension) 여부를 묻습니다. 충분히 즐겼다면 체크아웃을 요청하고 카운터나 자리에서 계산하면 됩니다.' }
                     ].map((item, idx) => (
                        <div key={idx} className="flex gap-6 bg-zinc-900/50 p-6 md:p-8 rounded-3xl border border-white/5">
                           <div className="font-extrabold text-4xl text-primary/30">{item.step}</div>
                           <div>
                              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                              <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="bg-primary/10 border border-primary/20 p-8 rounded-3xl mt-8">
                     <h4 className="text-primary font-bold mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined">lightbulb</span>
                        전문가의 예약 팁
                     </h4>
                     <p className="text-sm text-zinc-300 leading-relaxed">
                        인기 있는 CCA(홍보 대사)는 이미 예약이 꽉 차는 경우가 많습니다. 당일 예약보다는 <strong>최소 1~2일 전 예약</strong>을 권장하며, 예약 후 노쇼(No-show)는 본인 계정에 패널티로 적용될 수 있으니 일정이 변경되면 반드시 사전에 취소 기능을 이용해주세요.
                     </p>
                  </div>
               </div>
            )}

            {/* Etiquette Tab */}
            {activeTab === 'etiquette' && (
               <div className="space-y-12 animate-fade-in">
                  <div className="text-center mb-12">
                     <h2 className="text-3xl font-extrabold mb-4">모두를 위한 에티켓</h2>
                     <p className="text-zinc-400 leading-relaxed">조금만 배려하면 두 배로 즐거워집니다. <br />절대 피해야 할 비매너 행동들을 꼭 숙지하세요.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-3xl border-t-4 border-t-red-500">
                        <h3 className="text-lg font-bold text-red-400 mb-6 flex items-center gap-2">
                           <span className="material-symbols-outlined">block</span>
                           이것만은 피해주세요
                        </h3>
                        <ul className="space-y-4">
                           <li className="flex items-start gap-3 text-sm text-zinc-300">
                              <span className="material-symbols-outlined text-red-500 text-lg shrink-0">close</span>
                              과도한 스킨십이나 불쾌감을 주는 언행 (업소 규정에 따라 강제 퇴장 조치)
                           </li>
                           <li className="flex items-start gap-3 text-sm text-zinc-300">
                              <span className="material-symbols-outlined text-red-500 text-lg shrink-0">close</span>
                              과음으로 인한 큰 소리, 다른 테이블에 피해주기
                           </li>
                           <li className="flex items-start gap-3 text-sm text-zinc-300">
                              <span className="material-symbols-outlined text-red-500 text-lg shrink-0">close</span>
                              동의 없는 사진/동영상 촬영
                           </li>
                           <li className="flex items-start gap-3 text-sm text-zinc-300">
                              <span className="material-symbols-outlined text-red-500 text-lg shrink-0">close</span>
                              허락받지 않은 개인적인 연락처/SNS 지속적 요구
                           </li>
                        </ul>
                     </div>

                     <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-3xl border-t-4 border-t-emerald-500">
                        <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center gap-2">
                           <span className="material-symbols-outlined">thumb_up</span>
                           베스트 매너
                        </h3>
                        <ul className="space-y-4">
                           <li className="flex items-start gap-3 text-sm text-zinc-300">
                              <span className="material-symbols-outlined text-emerald-500 text-lg shrink-0">check</span>
                              LD(Lady's Drink) 한잔의 여유. 대화 상대를 위한 작은 음료 배려는 매너의 기본입니다.
                           </li>
                           <li className="flex items-start gap-3 text-sm text-zinc-300">
                              <span className="material-symbols-outlined text-emerald-500 text-lg shrink-0">check</span>
                              젠틀한 호칭과 미소. 담당 직원이나 마마상을 존중해 주시면 최고의 서비스로 돌아옵니다.
                           </li>
                           <li className="flex items-start gap-3 text-sm text-zinc-300">
                              <span className="material-symbols-outlined text-emerald-500 text-lg shrink-0">check</span>
                              정중한 팁(Tip). 강제는 아니지만 만족스러운 서비스를 받았다면 작은 성의 표시를 하는 것이 좋습니다. (보통 500~1000페소)
                           </li>
                        </ul>
                     </div>
                  </div>
               </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
               <div className="space-y-12 animate-fade-in">
                  <div className="text-center mb-12">
                     <h2 className="text-3xl font-extrabold mb-4">자주 묻는 질문</h2>
                     <p className="text-zinc-400 leading-relaxed">입문자들이 가장 궁금해하는 내용들을 모았습니다.</p>
                  </div>

                  <div className="space-y-4">
                     {[
                        { q: '옷차림(Dress Code) 제한이 있나요?', a: '기본적으로 스마트 캐주얼 이상을 권장합니다. 슬리퍼, 수면바지, 오염이 심한 민소매티 등은 업소에 따라 입장이 거절될 수 있습니다.' },
                        { q: '언어가 안 통하는데 괜찮을까요?', a: '다수의 CCA들은 기초적인 영어나 한국어, 일본어 소통이 가능합니다. 이 플랫폼 프로필에서 [한국어 가능] 뱃지를 달고 있는 CCA를 미리 지명하시는 것도 좋은 방법입니다. 또한 번역기를 활용하며 웃으며 대화하는 것도 재미의 일부입니다.' },
                        { q: '결제 시 꼭 카드나 현금만 되나요?', a: '대부분의 업소가 현금(PHP)과 신용카드를 지원하지만, 일부 카드는 카드사 수수료(약 5~10%)가 추가로 부과될 수 있습니다. 카운터에 미리 결제 방식을 확인하세요.' },
                        { q: '친구 여러 명과 함께 가도 되나요?', a: '네, 물론입니다! 오히려 여러 명일 경우 단체 VIP룸을 예약하여 우리만의 시간을 즐기기에 더 적합합니다. 그룹 규모에 맞춰 미리 예약하시면 원활합니다.' }
                     ].map((faq, idx) => (
                        <div key={idx} className="bg-zinc-900 border border-white/5 rounded-2xl p-6">
                           <h4 className="font-bold flex gap-3 text-white mb-3">
                              <span className="text-primary font-black uppercase">Q.</span>
                              {faq.q}
                           </h4>
                           <div className="flex gap-3 pl-8">
                              <span className="text-zinc-500 font-extrabold uppercase">A.</span>
                              <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
         
         {/* Discovery Banner */}
         <div className="max-w-4xl mx-auto mt-20 relative overflow-hidden rounded-3xl p-8 md:p-12 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border border-primary/20 flex flex-col items-center text-center">
            <h3 className="text-2xl font-black text-white mb-4">가이드라인을 모두 확인하셨나요?</h3>
            <p className="text-zinc-300 mb-8 max-w-lg">이제 검증된 인기 시스템과 멋진 CCA 라인업을 경험해보세요. 지금 바로 나만의 여정을 시작할 수 있습니다.</p>
            <div className="flex gap-4">
               <Link to="/venues" className="px-8 py-3 bg-white text-zinc-950 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors">
                  업소 찾기
               </Link>
               <Link to="/ccas" className="px-8 py-3 bg-primary text-[#1b180d] rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  추천 CCA 찾기
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Guidebook;
