
export type FocusArea = "Balanced" | "사업 & 수익" | "건강 & 웰니스" | "학습 & 자기계발" | "네트워킹 & 브랜딩";

export interface SubGoal {
  id: string;
  title: string;
  actions: string[];
}

export interface MandalartData {
  mainGoal: string;
  subGoals: SubGoal[];
}

export interface AppState {
  data: MandalartData | null;
  loading: boolean;
  error: string | null;
  focusArea: FocusArea;
  lastUpdated: number;
}
