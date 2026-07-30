"use client";

import { useState } from 'react';

export default function PipelinePage() {
  const [itemData, setItemData] = useState({
    name: '',
    feature: '',
    target: ''
  });

  const [customPrompt, setCustomPrompt] = useState('');
  const [scriptMemo, setScriptMemo] = useState('');
  const [isPromptGenerated, setIsPromptGenerated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemData({ ...itemData, [e.target.name]: e.target.value });
  };

  const generatePromptBase = () => {
    if (!itemData.name) {
      alert("상품명을 먼저 입력해 주세요!");
      return;
    }

    const base = `너는 100만 조회수를 밥 먹듯이 찍는 실리콘밸리 천재 마케터이자 틱톡커야. 
아래 [제품 정보]를 바탕으로, 시청자가 무조건 3초 안에 스크롤을 멈출 수밖에 없는 숏폼 영상(릴스/쇼츠) 대본 3가지를 작성해 줘.

[제품 정보]
- 상품명: ${itemData.name}
- 핵심 소구점: ${itemData.feature || '기획자가 본문에 입력한 장점 참고'}
- 타겟 고객: ${itemData.target || '이 제품이 가장 필요한 대중'}

[작성 조건]
1. 분량: 50초
2. 후킹(Hook): 첫 3초에 강력한 어그로를 끌어 공감대나 호기심을 유발할 것
3. 전개: 호들갑스럽고 친근한 '내돈내산 후기' 말투를 사용할 것
4. CTA: 영상 마지막에 반드시 "프로필 링크에서 확인하세요"라는 멘트를 넣을 것`;

    setCustomPrompt(base);
    setIsPromptGenerated(true);
  };

  const copyPrompt = () => {
    if (!customPrompt) {
      alert("먼저 프롬프트를 생성해 주세요!");
      return;
    }
    navigator.clipboard.writeText(customPrompt);
    alert("✨ 프롬프트가 복사되었습니다! ChatGPT에 붙여넣으세요.");
  };

  const copyScript = () => {
    if (!scriptMemo) {
      alert("복사할 대본 내용이 없습니다!");
      return;
    }
    navigator.clipboard.writeText(scriptMemo);
    alert("📝 수정된 대본이 복사되었습니다! 브루(Vrew)나 캡컷에 붙여넣으세요.");
  };

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-slate-900 p-8 font-sans text-slate-100">
      <header className="mb-10 border-b border-slate-700 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span>🏭</span> 글로벌 AI 숏폼 팩토리
          </h1>
          <p className="text-slate-400 mt-2">트렌드 분석, 대본 커스텀부터 20개국 글로벌 배포 인프라까지.</p>
        </div>
      </header>

      {/* 1단계: 트렌드 레이더 & 글로벌 도구 퀵링크 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">📡 1단계: 트렌드 분석 & 다국어 배포 툴 가동</h2>
        {/* 🚨 버튼이 6개로 늘어나서 grid-cols-6로 반응형 디자인 수정 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <a href="https://datalab.naver.com/shoppingInsight/sCategory.naver" target="_blank" rel="noreferrer" className="bg-green-600/10 border border-green-500/30 p-4 rounded-xl hover:bg-green-600/20 transition text-center group">
            <div className="text-green-400 font-bold mb-1">네이버 데이터랩</div>
            <div className="text-xs text-slate-400">국내 쇼핑 랭킹</div>
          </a>
          <a href="https://itemscout.io/trend" target="_blank" rel="noreferrer" className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl hover:bg-blue-600/20 transition text-center group">
            <div className="text-blue-400 font-bold mb-1">아이템스카우트</div>
            <div className="text-xs text-slate-400">급상승 트렌드</div>
          </a>
          <a href="https://trends.google.com/trends/" target="_blank" rel="noreferrer" className="bg-orange-600/10 border border-orange-500/30 p-4 rounded-xl hover:bg-orange-600/20 transition text-center group">
            <div className="text-orange-400 font-bold mb-1">구글 트렌드</div>
            <div className="text-xs text-slate-400">실시간 급상승 키워드</div>
          </a>
          {/* 글로벌/편집 핵심 AI 링크 배치 */}
          <a href="https://vrew.voyagerx.com/" target="_blank" rel="noreferrer" className="bg-purple-600/20 border border-purple-500/50 p-4 rounded-xl hover:bg-purple-600/30 transition text-center group animate-pulse">
            <div className="text-purple-400 font-bold mb-1">브루 (Vrew) 🎙️</div>
            <div className="text-xs text-slate-300">AI 목소리/자막 생성</div>
          </a>
          {/* 🚨 캡컷 퀵링크 추가 완료 */}
          <a href="https://www.capcut.com/" target="_blank" rel="noreferrer" className="bg-indigo-600/20 border border-indigo-500/50 p-4 rounded-xl hover:bg-indigo-600/30 transition text-center group animate-pulse">
            <div className="text-indigo-400 font-bold mb-1">캡컷 (CapCut) ✂️</div>
            <div className="text-xs text-slate-300">최종 영상 조립·편집</div>
          </a>
          <a href="https://elevenlabs.io/dubbing" target="_blank" rel="noreferrer" className="bg-red-600/20 border border-red-500/50 p-4 rounded-xl hover:bg-red-600/30 transition text-center group animate-pulse">
            <div className="text-red-400 font-bold mb-1">일레븐랩스 🌍</div>
            <div className="text-xs text-slate-300">20개국 자동번역·더빙</div>
          </a>
        </div>
      </section>

      {/* 2단계 및 3단계 배치 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 기획서 입력 폼 */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">📝 2단계: 제품 정보 입력</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">상품명</label>
                <input type="text" name="name" value={itemData.name} onChange={handleChange} placeholder="예: 규조토 1초 흡수 발매트" className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"/>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">핵심 기능 / 어그로 포인트</label>
                <input type="text" name="feature" value={itemData.feature} onChange={handleChange} placeholder="예: 물 닿자마자 1초 만에 마름" className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"/>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">타겟 고객</label>
                <input type="text" name="target" value={itemData.target} onChange={handleChange} placeholder="예: 자취생, 욕실 앞 찝찝함 싫은 사람" className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"/>
              </div>
            </div>
          </div>
          <button onClick={generatePromptBase} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all mt-6">
            프롬프트 조립하기 ⚡
          </button>
        </section>

        {/* 실시간 편집 가능한 마법의 프롬프트 창 */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl relative">
          <div className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">수정 가능</div>
          <h2 className="text-xl font-bold text-white mb-4">🪄 3단계: 프롬프트 커스텀</h2>
          <p className="text-xs text-slate-400 mb-2">필요에 따라 지시사항을 자유롭게 수정한 뒤 복사하세요.</p>
          <textarea 
            value={customPrompt} 
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="왼쪽 폼을 입력하고 [프롬프트 조립하기] 버튼을 누르면 마법의 프롬프트가 이곳에 실시간으로 생성되며 직접 수정도 가능해집니다."
            className="w-full h-[250px] p-4 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-300 font-mono leading-relaxed resize-none focus:outline-none focus:border-orange-500"
          />
          <button onClick={copyPrompt} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg mt-4 transition-colors flex items-center justify-center gap-2">
            <span>📋</span> 프롬프트 복사 (ChatGPT로 가기)
          </button>
        </section>

        {/* ChatGPT 대본을 가져와 수정하는 글로벌 메인 메모장 */}
        <section className="bg-slate-800 p-6 rounded-xl border border-purple-500/30 shadow-xl relative">
          <div className="absolute top-4 right-4 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">최종 보관소</div>
          <h2 className="text-xl font-bold text-purple-400 mb-4">🎬 4단계: 대본·자막 편집기</h2>
          <p className="text-xs text-slate-400 mb-2">ChatGPT가 만들어준 대본을 여기에 붙여넣고 자막을 최종 다듬으세요.</p>
          <textarea 
            value={scriptMemo} 
            onChange={(e) => setScriptMemo(e.target.value)}
            placeholder="[여기에 ChatGPT 대본을 붙여넣으세요]&#10;&#10;예시:&#10;0~3초(후킹): 규조토 매트 아직도 안 쓰는 사람 있음?&#10;3~12초(본문): 이거 진짜 1초 만에 물기가 싹 사라짐..."
            className="w-full h-[250px] p-4 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white leading-relaxed resize-none focus:outline-none focus:border-purple-500"
          />
          <button onClick={copyScript} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mt-4 transition-colors flex items-center justify-center gap-2">
            <span>🚀</span> 수정 완료 대본 복사하기
          </button>
        </section>

      </div>

      {/* 글로벌 배포 파이프라인 가이드라인 보드 */}
      <footer className="mt-12 bg-slate-950 p-6 rounded-xl border border-slate-800 text-sm text-slate-400 leading-relaxed">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2">🌐 20개국 글로벌 확장 파이프라인 매뉴얼</h4>
        <ol className="list-decimal pl-5 flex flex-col gap-1.5 text-xs text-slate-400">
          <li>상단 링크를 통해 트렌드 제품 소싱 후 <strong>2단계 정보 입력</strong> 및 <strong>프롬프트를 조립</strong>합니다.</li>
          <li>조립된 프롬프트를 취향껏 커스텀 수정한 후 복사해 <strong>ChatGPT</strong>에 넣고 대본을 받아옵니다.</li>
          <li>가져온 대본을 <strong>4단계 편집기</strong>에 넣고 최종 자막 싱크를 조정한 후 복사합니다.</li>
          <li>위의 <strong>브루(Vrew) 퀵링크</strong>로 이동해 대본을 넣고 전 세계 수백 명의 AI 목소리 중 마음에 드는 음성과 스타일리시한 자막을 얹어 영상 뼈대를 뽑아냅니다.</li>
          <li><strong>캡컷(CapCut) 퀵링크</strong>를 눌러 브루에서 만든 뼈대 영상과 제품 사진/영상을 합쳐 최종 원본 숏폼을 완성합니다.</li>
          <li>완성된 원본 비디오를 위의 <strong>일레븐랩스(ElevenLabs) 다국어 더빙 링크</strong>에 업로드하면, AI가 원본 싱크 그대로 영어, 일본어, 힌두어, 태국어 등 20개국 현지인 음성으로 자동 번역 및 더빙된 폭발적인 글로벌 트래픽용 비디오를 뱉어냅니다!</li>
        </ol>
      </footer>
    </div>
  );
}