
import React from 'react';
import { MandalartData, SubGoal } from '../types';
import { COLORS } from '../constants';
import { RefreshCw } from 'lucide-react';

interface MandalartGridProps {
  data: MandalartData;
  onRegenerateBlock: (id: string) => void;
  isRegenerating: boolean;
}

const MandalartGrid: React.FC<MandalartGridProps> = ({ data, onRegenerateBlock, isRegenerating }) => {
  // Grid coordinates for the 9x9 layout
  // Center is SubGoal mapping to its cluster
  // Center cluster: [SubGoal index 0-7 surrounding MainGoal]

  const getSubGoalById = (index: number) => data.subGoals[index];

  // Helper to render a 3x3 block
  const renderSubBlock = (subGoal: SubGoal, clusterIndex: number, isCenterCluster: boolean = false) => {
    const color = COLORS[clusterIndex % COLORS.length];
    
    // Each block has 9 cells
    // If center cluster: center is mainGoal, 8 others are subGoals
    // If outer cluster: center is subGoal, 8 others are actions
    
    return (
      <div className={`sub-grid border-2 ${color.border} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white`}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          let content = "";
          let isCenter = i === 4;
          let cellStyle = "";

          if (isCenterCluster) {
            if (isCenter) {
              content = data.mainGoal;
              cellStyle = `bg-slate-800 text-white font-bold text-sm`;
            } else {
              // Indices for 8 subgoals around the center:
              // 0 1 2
              // 3 C 4
              // 5 6 7
              const subGoalIdx = i < 4 ? i : i - 1;
              const sg = data.subGoals[subGoalIdx];
              content = sg?.title || "";
              cellStyle = `${COLORS[subGoalIdx].subBg} ${COLORS[subGoalIdx].text} font-semibold cursor-default`;
            }
          } else {
            if (isCenter) {
              content = subGoal.title;
              cellStyle = `${color.highlight} text-white font-bold text-sm flex-col gap-1`;
            } else {
              const actionIdx = i < 4 ? i : i - 1;
              content = subGoal.actions[actionIdx] || "";
              cellStyle = `${color.bg} ${color.text} hover:scale-[1.02] transition-transform cursor-default`;
            }
          }

          return (
            <div key={i} className={`cell ${cellStyle} relative group`}>
              {content}
              {!isCenterCluster && isCenter && (
                <button 
                  onClick={() => onRegenerateBlock(subGoal.id)}
                  disabled={isRegenerating}
                  className="absolute bottom-1 right-1 p-1 bg-white/20 rounded-full hover:bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="이 블록만 재생성"
                >
                  <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div id="mandalart-capture-area" className="mandalart-grid w-full max-w-[900px] mx-auto p-4 bg-white rounded-xl shadow-2xl border border-slate-200">
      {/* 3x3 layout of 3x3 clusters */}
      {/* 
        SG0 SG1 SG2
        SG3 CTR SG4
        SG5 SG6 SG7
      */}
      {renderSubBlock(data.subGoals[0], 0)}
      {renderSubBlock(data.subGoals[1], 1)}
      {renderSubBlock(data.subGoals[2], 2)}
      
      {renderSubBlock(data.subGoals[3], 3)}
      {renderSubBlock(data.subGoals[0], 0, true)} {/* Center Cluster */}
      {renderSubBlock(data.subGoals[4], 4)}
      
      {renderSubBlock(data.subGoals[5], 5)}
      {renderSubBlock(data.subGoals[6], 6)}
      {renderSubBlock(data.subGoals[7], 7)}
    </div>
  );
};

export default MandalartGrid;
