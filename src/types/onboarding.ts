export type OnboardingStep =
  | 'welcome'
  | 'questions'
  | 'persona-import'
  | 'analyzing'
  | 'avatar-choice'
  | 'voice-recording'
  | 'complete';


export type QuestionCategory = 'personality' | 'lifestyle';

export interface VoiceQuestion {
  id: number;
  text: string;
  category: QuestionCategory;
}

export interface VoiceAnswer {
  questionId: number;
  transcript: string;
  duration: number;
}

export interface PersonalityScores {
  communication_directness: number; // 0=우회적, 100=직접적
  social_energy: number;            // 0=내향적, 100=외향적
  emotional_expression: number;     // 0=절제, 100=풍부
  life_approach: number;            // 0=계획적, 100=즉흥적
}

export interface PersonalityRationale {
  communication_directness: string;
  social_energy: string;
  emotional_expression: string;
  life_approach: string;
}

export interface PersonalityResult {
  scores: PersonalityScores;
  rationale: PersonalityRationale;
  summary: string;
  confidence: number;
}

export type AvatarMode = 'upload' | 'preset';

export interface OnboardingData {
  step: OnboardingStep;
  currentQuestionIndex: number;
  answers: VoiceAnswer[];
  personalityResult: PersonalityResult | null;
  voiceId: string | null;
  avatarMode: AvatarMode | null;
  selectedAvatar: string | null;
  uploadedPhoto: string | null;
  completedAt: string | null;
}
