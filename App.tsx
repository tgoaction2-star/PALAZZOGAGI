
import React, { useState, useCallback, useRef } from 'react';
import { FocusArea, MandalartData, AppState } from './types';
import { FOCUS_AREAS } from './constants';
import { geminiService } from './services/geminiService';
import MandalartGrid from './components/MandalartGrid';
import { Send, Download, Sparkles, Loader2, AlertCircle, Trash2 } from 'lucide-react';

// Use standard import for html2canvas
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [mainGoalInput, setMainGoalInput] = useState('');
  const [focusArea, setFocusArea] = useState<FocusArea>('Balanced');
  const [state, setState] = useState<AppState>({
    data: null,
    loading: false,
    error: null,
    focusArea: 'Balanced',
    lastUpdated: Date.now(),
  });
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleGenerate = async () => {
    if (!mainGoalInput.trim()) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await geminiService.generateMandalart(mainGoalInput, focusArea);
      setState({
        data,
        loading: false,
        error: null,
        focusArea,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: '만다라트를 생성하는 중 오류가 발생했습니다. 다시 시도해 주세요.',
      }));
    }
  };

  const handleRegenerateBlock = async (id: string) => {
    if (!state.data) return;

    setIsRegenerating(true);
    try {
      const newData = await geminiService.regenerateBlock(state.data, state.focusArea, id);
      setState(prev => ({
        ...prev,
        data: newData,
        lastUpdated: Date.now(),
      }));
    } catch (err) {
      console.error(err);
      alert('블록을 재생성하는 데 실패했습니다.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('mandalart-capture-area');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `mandalart-${state.data?.mainGoal || 'plan'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const handleReset = () => {
    if (window.confirm('현재 계획을 지우고 다시 시작할까요?')) {
      setState({
        data: null,
        loading: false,
        error: null,
        focusArea: 'Balanced',
        lastUpdated: Date.now(),
      });
      setMainGoalInput('');
    }
  };

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white p-6">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center max-w-sm text-center shadow-2xl">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">실행 가능한 계획을 수립 중입니다...</h3>
        <p className="text-slate-500 text-sm">
          Gemini 3가 당신의 목표를 64개의 구체적인 액션으로 쪼개고 있습니다. 잠시만 기다려주세요.
        </p>
        <div className="mt-6 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-indigo-600 h-full animate-progress" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {state.loading && <LoadingOverlay />}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Sparkles size={22} fill="currentColor" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">AI MANDALART</h1>
          </div>
          
          {state.data && (
            <div className="flex gap-2">
              <button 
                onClick={handleReset}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                title="초기화"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all shadow-md active:scale-95"
              >
                <Download size={18} />
                <span className="hidden sm:inline">이미지 저장</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!state.data ? (
          <div className="max-w-2xl mx-auto py-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
                이룰 수 밖에 없는<br />
                <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">구체적인 실행 계획</span>
              </h2>
              <p className="text-slate-500 text-lg">
                목표를 입력하면 AI가 즉시 캘린더에 넣을 수 있는 수준의<br />
                8개 중간 목표와 64개 상세 액션 플랜을 제안합니다.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">당신의 핵심 목표는 무엇인가요?</label>
                <textarea
                  value={mainGoalInput}
                  onChange={(e) => setMainGoalInput(e.target.value)}
                  placeholder="예: '12주 안에 코딩 포트폴리오 3개 완성하기', '체지방 5% 감량하고 바디프로필 찍기'"
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">어떤 분야에 집중하고 싶으신가요?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FOCUS_AREAS.map((area) => (
                    <button
                      key={area}
                      onClick={() => setFocusArea(area)}
                      className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                        focusArea === area 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!mainGoalInput.trim()}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
              >
                <Send size={20} />
                만다라트 생성하기
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <div className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Main Goal</div>
                <h2 className="text-2xl font-black text-slate-900">{state.data.mainGoal}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">{state.focusArea}</span>
                <span className="text-slate-400 text-xs">업데이트: {new Date(state.lastUpdated).toLocaleTimeString()}</span>
              </div>
            </div>

            <MandalartGrid 
              data={state.data} 
              onRegenerateBlock={handleRegenerateBlock} 
              isRegenerating={isRegenerating}
            />

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-indigo-800">
              <h4 className="flex items-center gap-2 font-bold mb-3">
                <AlertCircle size={18} />
                AI 만다라트 활용 팁
              </h4>
              <ul className="text-sm space-y-2 opacity-90 list-disc list-inside">
                <li>각 셀의 문구는 <strong>캘린더에 바로 등록</strong>할 수 있는 행동 단위로 설계되었습니다.</li>
                <li>마음에 들지 않는 중간 목표 블록은 중심부의 <strong>새로고침 아이콘</strong>을 눌러 해당 부분만 다시 생성할 수 있습니다.</li>
                <li>환경 세팅, If-Then 기법, 장애 대비 Plan B가 액션에 포함되어 있어 실행력이 높아집니다.</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-sm">
        <p>© 2024 AI Mandalart Planner. Powered by Gemini 3 Flash.</p>
      </footer>
    </div>
  );
};

export default App;
