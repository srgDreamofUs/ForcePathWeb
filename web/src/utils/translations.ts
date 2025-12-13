export const translations = {
    en: {
        title: "ForcePath",
        subtitle: "Social Trajectory Simulator",
        inputPlaceholder: "Describe the initial society, situation, or scenario to simulate. The system will predict how this society evolves.",
        futureStateDepth: "Future State Depth",
        futureStateDepthSub: "Number of future transitions to predict",
        examplePrompts: "Example Prompts",
        runSimulation: "Run Simulation",
        running: "Predicting...",
        step: "Step",
        input: "Input",
        stabilityScore: "Stability Score",
        stabilitySubtitle: "Social Stability per Future State",
        predictionOverview: "Prediction Overview",
        predictionOverviewSubtitle: "Summary of Societal Change Patterns",
        errorModel: "The model encountered an issue. Retrying...",
        footer: "ForcePath experimental simulation engine."
    },
    ko: {
        title: "ForcePath",
        subtitle: "Social Trajectory Simulator",
        inputPlaceholder: "시뮬레이션할 초기 사회, 상황 또는 시나리오를 설명하는 글을 입력하면, 그 이후의 사회가 예측됩니다.",
        futureStateDepth: "미래 상태 단계 수",
        futureStateDepthSub: "예측할 미래 상태의 단계 수 선택",
        examplePrompts: "예시 프롬프트",
        runSimulation: "시뮬레이션 실행",
        running: "예측 중...",
        step: "단계",
        input: "입력값",
        stabilityScore: "안정성 점수",
        stabilitySubtitle: "미래 상태별 사회적 안정도",
        predictionOverview: "예측 개요",
        predictionOverviewSubtitle: "사회 변화 양상 요약",
        errorModel: "모델이 응답하지 않아 다시 시도합니다...",
        footer: "ForcePath experimental simulation engine."
    }
};

export type Language = 'en' | 'ko';
export type TranslationKey = keyof typeof translations.en;
