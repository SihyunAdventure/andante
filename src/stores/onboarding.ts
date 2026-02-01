import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  OnboardingStep,
  AvatarMode,
  VoiceAnswer,
  PersonalityResult,
} from '@/types/onboarding';

interface OnboardingState {
  step: OnboardingStep;
  currentQuestionIndex: number;
  answers: VoiceAnswer[];
  audioRecordings: Record<number, string>;
  personalityResult: PersonalityResult | null;
  avatarMode: AvatarMode | null;
  selectedAvatar: string | null;
  uploadedPhoto: string | null;
  voiceId: string | null;
  completedAt: string | null;
  isRecording: boolean;
  isProcessing: boolean;
  convexUserId: string | null;
  audioStorageIds: Record<number, string>;
  introText: string | null;
  characterId: string | null;
  personaMarkdown: string | null;
  onboardingMethod: 'voice' | 'persona-md';
  avatarPrompt: string | null;
  mjTaskId: string | null;
  generatedAvatarUrl: string | null;

  setVoiceId: (id: string) => void;
  setStep: (step: OnboardingStep) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  saveAnswer: (answer: VoiceAnswer) => void;
  saveAudioRecording: (questionId: number, base64: string) => void;
  setPersonalityResult: (result: PersonalityResult) => void;
  setAvatarMode: (mode: AvatarMode) => void;
  selectAvatar: (url: string) => void;
  setUploadedPhoto: (dataUrl: string | null) => void;
  setRecording: (val: boolean) => void;
  setProcessing: (val: boolean) => void;
  setConvexUserId: (id: string) => void;
  saveAudioStorageId: (questionId: number, storageId: string) => void;
  setIntroText: (text: string) => void;
  setCharacterId: (id: string) => void;
  setPersonaMarkdown: (md: string) => void;
  setOnboardingMethod: (method: 'voice' | 'persona-md') => void;
  setAvatarPrompt: (prompt: string) => void;
  setMjTaskId: (id: string) => void;
  setGeneratedAvatarUrl: (url: string) => void;
  resetOnboarding: () => void;
}

const initialState = {
  step: 'persona-import' as OnboardingStep,
  currentQuestionIndex: 0,
  answers: [] as VoiceAnswer[],
  audioRecordings: {} as Record<number, string>,
  personalityResult: null,
  avatarMode: null,
  selectedAvatar: null,
  uploadedPhoto: null,
  voiceId: null,
  completedAt: null,
  isRecording: false,
  isProcessing: false,
  convexUserId: null,
  audioStorageIds: {} as Record<number, string>,
  introText: null,
  characterId: null,
  personaMarkdown: null,
  onboardingMethod: 'voice' as const,
  avatarPrompt: null,
  mjTaskId: null,
  generatedAvatarUrl: null,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, 11),
        })),

      prevQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
        })),

      saveAnswer: (answer) =>
        set((state) => {
          const existing = state.answers.findIndex(
            (a) => a.questionId === answer.questionId
          );
          const answers = [...state.answers];
          if (existing >= 0) {
            answers[existing] = answer;
          } else {
            answers.push(answer);
          }
          return { answers };
        }),

      saveAudioRecording: (questionId, base64) =>
        set((state) => ({
          audioRecordings: {
            ...state.audioRecordings,
            [questionId]: base64,
          },
        })),

      setVoiceId: (id) => set({ voiceId: id }),
      setPersonalityResult: (result) => set({ personalityResult: result }),
      setAvatarMode: (mode) => set({ avatarMode: mode }),
      selectAvatar: (url) => set({ selectedAvatar: url }),
      setUploadedPhoto: (dataUrl) => set({ uploadedPhoto: dataUrl }),
      setRecording: (val) => set({ isRecording: val }),
      setProcessing: (val) => set({ isProcessing: val }),
      setConvexUserId: (id) => set({ convexUserId: id }),
      saveAudioStorageId: (questionId, storageId) =>
        set((state) => ({
          audioStorageIds: {
            ...state.audioStorageIds,
            [questionId]: storageId,
          },
        })),
      setIntroText: (text) => set({ introText: text }),
      setCharacterId: (id) => set({ characterId: id }),
      setPersonaMarkdown: (md) => set({ personaMarkdown: md, onboardingMethod: 'persona-md' }),
      setOnboardingMethod: (method) => set({ onboardingMethod: method }),
      setAvatarPrompt: (prompt) => set({ avatarPrompt: prompt }),
      setMjTaskId: (id) => set({ mjTaskId: id }),
      setGeneratedAvatarUrl: (url) => set({ generatedAvatarUrl: url }),
      resetOnboarding: () => set(initialState),
    }),
    {
      name: 'andante-onboarding',
      partialize: (state) => ({
        step: state.step,
        currentQuestionIndex: state.currentQuestionIndex,
        answers: state.answers,
        audioRecordings: state.audioRecordings,
        personalityResult: state.personalityResult,
        voiceId: state.voiceId,
        avatarMode: state.avatarMode,
        selectedAvatar: state.selectedAvatar,
        completedAt: state.completedAt,
        convexUserId: state.convexUserId,
        audioStorageIds: state.audioStorageIds,
        introText: state.introText,
        characterId: state.characterId,
        personaMarkdown: state.personaMarkdown,
        onboardingMethod: state.onboardingMethod,
        avatarPrompt: state.avatarPrompt,
        mjTaskId: state.mjTaskId,
        generatedAvatarUrl: state.generatedAvatarUrl,
      }),
    }
  )
);
