import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';

const defaultTexts = {
  home_cca_subtitle: '인기 CCA 리스트',
  home_cca_title: '이번 주 <span class="text-primary">화제의 홍보대사</span>',
  home_venue_subtitle: '이달의 추천 업소',
  home_venue_title: '최고의 JTV 라운지',
  home_premium_title: 'PREMIUM EXPERIENCE',
  home_premium_subtitle: '특별한 밤을 위한 최고의 선택',
  home_premium_content: 'JTV협회가 인증한 프리미엄 업소와 검증된 CCA를 만나보세요. 안전하고 만족스러운 경험을 보장합니다.',
  home_btn_cca: 'CCA 둘러보기',
  home_btn_venue: '업소 정보 보기',
  footer_desc_1: '공식 커뮤니티 플랫폼입니다.',
  footer_desc_2: '안전하고 검증된 나이트라이프를 위한 공식 플랫폼입니다.'
};

const SuperTextManager: React.FC = () => {
  const [texts, setTexts] = useState<any>(defaultTexts);
  const [originalSettings, setOriginalSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    setIsLoading(true);
    const data = await apiService.getSiteSettings();
    setOriginalSettings(data);
    if (data?.ui_texts) {
      setTexts({ ...defaultTexts, ...data.ui_texts });
    } else {
      setTexts(defaultTexts);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updatedSettings = {
      ...originalSettings,
      ui_texts: texts
    };
    const success = await apiService.updateSiteSettings(updatedSettings);
    setIsSaving(false);
    if (success) {
      alert("텍스트 설정이 성공적으로 저장되었습니다.");
    } else {
      alert("저장에 실패했습니다. 관리자에게 문의하세요.");
    }
  };

  const renderInput = (key: string, label: string, isTextarea = false, hint?: string) => {
    return (
      <div className="flex flex-col gap-2 bg-zinc-900 border border-white/5 rounded-2xl p-6">
        <label className="text-[10px] font-black uppercase tracking-widest text-primary">{label}</label>
        {hint && <p className="text-[10px] text-gray-400 font-bold mb-2">{hint}</p>}
        {isTextarea ? (
          <textarea
            value={texts[key] || ''}
            onChange={(e) => setTexts((prev: any) => ({ ...prev, [key]: e.target.value }))}
            className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-red-500 outline-none transition-all resize-none h-24"
          />
        ) : (
          <input
            type="text"
            value={texts[key] || ''}
            onChange={(e) => setTexts((prev: any) => ({ ...prev, [key]: e.target.value }))}
            className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-red-500 outline-none transition-all"
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-red-500 font-black tracking-widest animate-pulse">LOADING TEXT MANAGER...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-end justify-between mb-8">
        <div>
           <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-3xl">text_fields</span>
              CONTENT TEXT MANAGER
           </h2>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              시스템 전체(메인페이지 및 푸터)의 텍스트를 손쉽게 수정 및 관리합니다
           </p>
        </div>
        <button
           onClick={handleSave}
           disabled={isSaving}
           className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
        >
           {isSaving ? (
              <>
                 <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                 SAVING...
              </>
           ) : (
              <>
                 <span className="material-symbols-outlined text-sm">save</span>
                 SAVE CHANGES
              </>
           )}
        </button>
      </div>

      <div className="space-y-10">
        <section>
          <h3 className="text-xs font-black text-white/50 border-b border-white/10 pb-2 mb-6 tracking-[0.2em]">HOME: CCA SECTION</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {renderInput('home_cca_subtitle', '소제목 (예: 인기 CCA 리스트)')}
            {renderInput('home_cca_title', '대제목', false, "단어별 색상 하이라이트를 원하시면 해당 단어를 <span class=\"text-primary\">단어</span> 태그로 감싸주세요.")}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-black text-white/50 border-b border-white/10 pb-2 mb-6 tracking-[0.2em]">HOME: VENUE SECTION</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {renderInput('home_venue_subtitle', '소제목 (예: 이달의 추천 업소)')}
            {renderInput('home_venue_title', '대제목', false, "마찬가지로 동일한 HTML 태그를 사용할 수 있습니다.")}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-black text-white/50 border-b border-white/10 pb-2 mb-6 tracking-[0.2em]">HOME: PREMIUM BANNER</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              {renderInput('home_premium_title', '박스 대제목 (예: PREMIUM EXPERIENCE)')}
              {renderInput('home_premium_subtitle', '박스 소제목 (예: 특별한 밤을 위한 최고의 선택)')}
            </div>
            {renderInput('home_premium_content', '본문 내용', true)}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-black text-white/50 border-b border-white/10 pb-2 mb-6 tracking-[0.2em]">HOME: BUTTONS</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {renderInput('home_btn_cca', 'CCA 둘러보기 버튼 테스트')}
            {renderInput('home_btn_venue', '업소 정보 보기 버튼 텍스트')}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-black text-white/50 border-b border-white/10 pb-2 mb-6 tracking-[0.2em]">GLOBAL: FOOTER</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {renderInput('footer_desc_1', '푸터 설명 내용 1 (플랫폼 이름 뒤)')}
            {renderInput('footer_desc_2', '푸터 설명 내용 2 (그 아래 설명)')}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SuperTextManager;
