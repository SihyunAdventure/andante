"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAction, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useOnboardingStore } from "@/stores/onboarding";
import type { PersonalityResult } from "@/types/onboarding";
import type { Id } from "@/types/convex";

const voiceMessages = [
  "답변을 분석하고 있어요...",
  "성격 패턴을 찾고 있어요...",
  "목소리를 학습하고 있어요...",
  "캐릭터를 만들고 있어요...",
  "자기소개를 작성하고 있어요...",
  "거의 다 됐어요...",
];

const personaMessages = [
  "페르소나 문서를 읽고 있어요...",
  "성격을 분석하고 있어요...",
  "캐릭터를 만들고 있어요...",
  "자기소개를 작성하고 있어요...",
  "거의 다 됐어요...",
];

export default function AnalyzingStep() {
  const {
    answers,
    audioStorageIds,
    convexUserId,
    personaMarkdown,
    onboardingMethod,
    setPersonalityResult,
    setVoiceId,
    setIntroText,
    setCharacterId,
    setAvatarPrompt,
    setMjTaskId,
    setGeneratedAvatarUrl,
    setStep,
  } = useOnboardingStore();

  const isPersonaMode = onboardingMethod === 'persona-md' && !!personaMarkdown;
  const messages = isPersonaMode ? personaMessages : voiceMessages;
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const startTimeRef = useRef(0);

  const analyzePersonality = useAction(api.actions.personality.analyze);
  const analyzePersonaMd = useAction(api.actions.personaImport.analyzePersonaMd);
  const cloneVoice = useAction(api.actions.voiceClone.cloneVoice);
  const generateCharacter = useAction(api.actions.characterGen.generate);
  const synthesizeSpeech = useAction(api.actions.tts.synthesize);
  const mjSubmitTask = useAction(api.actions.mjGenerate.submitTask);
  const mjGetResult = useAction(api.actions.mjGenerate.getTaskResult);
  const savePersonalityResult = useMutation(api.personalityResults.save);
  const createCharacter = useMutation(api.characters.create);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    const fallbackResult: PersonalityResult = {
      scores: {
        communication_directness: 50,
        social_energy: 50,
        emotional_expression: 50,
        life_approach: 50,
      },
      rationale: {
        communication_directness: "분석 불가",
        social_energy: "분석 불가",
        emotional_expression: "분석 불가",
        life_approach: "분석 불가",
      },
      summary: "분석 중 오류가 발생했습니다",
      confidence: 0,
    };

    const runPersonaAnalysis = async () => {
      try {
        const result = await analyzePersonaMd({ markdown: personaMarkdown! });

        const personalityResult: PersonalityResult = {
          scores: result.scores,
          rationale: result.rationale,
          summary: result.summary,
          confidence: result.confidence,
        };

        setPersonalityResult(personalityResult);
        if (result.introText) setIntroText(result.introText);
        if (result.avatarPrompt) setAvatarPrompt(result.avatarPrompt);

        // Start Midjourney avatar generation in parallel
        const mjPromise = (async () => {
          try {
            const taskId = await mjSubmitTask({ prompt: result.avatarPrompt });
            setMjTaskId(taskId);

            // Poll for result (max 120s)
            const maxAttempts = 40;
            for (let i = 0; i < maxAttempts; i++) {
              await new Promise((r) => setTimeout(r, 3000));
              const taskResult = await mjGetResult({ taskId });
              if (taskResult.imageUrl) {
                setGeneratedAvatarUrl(taskResult.imageUrl);
                return;
              }
              if (taskResult.status === "failed" || taskResult.status === "error") {
                console.error("MJ task failed:", taskResult.status);
                return;
              }
            }
            console.warn("MJ task timed out");
          } catch (err) {
            console.error("Midjourney generation error:", err);
          }
        })();

        // Save personality result to Convex
        if (convexUserId) {
          await savePersonalityResult({
            userId: convexUserId as Id<"users">,
            communicationDirectness: result.scores.communication_directness,
            socialEnergy: result.scores.social_energy,
            emotionalExpression: result.scores.emotional_expression,
            lifeApproach: result.scores.life_approach,
            rationale: {
              communicationDirectness: result.rationale.communication_directness,
              socialEnergy: result.rationale.social_energy,
              emotionalExpression: result.rationale.emotional_expression,
              lifeApproach: result.rationale.life_approach,
            },
            summary: result.summary,
            confidence: result.confidence,
            mbtiType: result.mbtiType,
            mbtiEI: result.mbtiEI,
            mbtiSN: result.mbtiSN,
            mbtiTF: result.mbtiTF,
            mbtiJP: result.mbtiJP,
            mbtiConfidence: result.mbtiConfidence,
          }).catch((err: unknown) => console.error("Failed to save personality result:", err));

          // Create character
          try {
            const charId = await createCharacter({
              userId: convexUserId as Id<"users">,
              avatarMode: "preset",
              introText: result.introText,
              systemPrompt: result.systemPrompt,
              speechStyle: result.speechStyle,
              personaMarkdown: personaMarkdown!,
              onboardingMethod: "persona-md",
            });
            setCharacterId(charId);
          } catch (err) {
            console.error("Failed to create character:", err);
          }
        }
        // Wait for MJ to finish (or timeout) before moving on
        await mjPromise;
      } catch (err) {
        console.error("Persona analysis error:", err);
        setPersonalityResult(fallbackResult);
      }

      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 5000 - elapsed);
      setTimeout(() => setStep("avatar-choice"), remaining);
    };

    const runAnalysis = async () => {
      try {
        // Step 1: Parallel - personality analysis + voice cloning
        const answersPayload = answers
          .filter((a) => a.transcript)
          .map((a) => ({
            questionId: String(a.questionId),
            transcript: a.transcript,
          }));

        const storageIdEntries = Object.entries(audioStorageIds);
        const first3StorageIds = storageIdEntries
          .slice(0, 3)
          .map(([, id]) => id as Id<"_storage">);

        const [personalityResultData, voiceId] = await Promise.all([
          analyzePersonality({ answers: answersPayload }).catch((err) => {
            console.error("Personality analysis error:", err);
            return fallbackResult;
          }),
          first3StorageIds.length > 0
            ? cloneVoice({
                audioStorageIds: first3StorageIds,
                name: `Andante_${Date.now()}`,
              }).catch((err) => {
                console.error("Voice clone error:", err);
                return null;
              })
            : Promise.resolve(null),
        ]);

        const personalityResult = personalityResultData as PersonalityResult;

        // Save personality result to Zustand
        setPersonalityResult(personalityResult);
        if (voiceId) setVoiceId(voiceId);

        // Save personality result to Convex
        if (convexUserId) {
          await savePersonalityResult({
            userId: convexUserId as Id<"users">,
            communicationDirectness: personalityResult.scores.communication_directness,
            socialEnergy: personalityResult.scores.social_energy,
            emotionalExpression: personalityResult.scores.emotional_expression,
            lifeApproach: personalityResult.scores.life_approach,
            rationale: {
              communicationDirectness: personalityResult.rationale.communication_directness,
              socialEnergy: personalityResult.rationale.social_energy,
              emotionalExpression: personalityResult.rationale.emotional_expression,
              lifeApproach: personalityResult.rationale.life_approach,
            },
            summary: personalityResult.summary,
            confidence: personalityResult.confidence,
          }).catch((err) => console.error("Failed to save personality result:", err));
        }

        // Step 2: Sequential - generate character
        const transcripts = answers
          .filter((a) => a.transcript)
          .map((a) => a.transcript);

        let introText: string | undefined;
        let systemPrompt: string | undefined;
        let speechStyle: { tone: string; emojiFrequency: string; sentenceLength: string; humor: string } | undefined;
        let introAudioStorageId: Id<"_storage"> | undefined;

        try {
          const characterGenResult = await generateCharacter({
            personalityScores: personalityResult.scores,
            transcripts,
            summary: personalityResult.summary,
          });

          introText = characterGenResult.introText;
          systemPrompt = characterGenResult.systemPrompt;
          speechStyle = characterGenResult.speechStyle;

          if (introText) setIntroText(introText);

          // Step 3: Generate intro speech if we have a voice
          if (voiceId && introText) {
            try {
              introAudioStorageId = await synthesizeSpeech({
                text: introText,
                voiceId,
              });
            } catch (err) {
              console.error("TTS error:", err);
            }
          }
        } catch (err) {
          console.error("Character generation error:", err);
        }

        // Step 4: Create character in Convex
        if (convexUserId) {
          try {
            const charId = await createCharacter({
              userId: convexUserId as Id<"users">,
              avatarMode: "preset",
              voiceId: voiceId ?? undefined,
              introText,
              introAudioStorageId,
              systemPrompt,
              speechStyle,
            });
            setCharacterId(charId);
          } catch (err) {
            console.error("Failed to create character:", err);
          }
        }
      } catch (err) {
        console.error("Analysis pipeline error:", err);
      }

      // Ensure minimum 5s UX
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 5000 - elapsed);

      setTimeout(() => {
        setStep("avatar-choice");
      }, remaining);
    };

    if (isPersonaMode) {
      runPersonaAnalysis();
    } else {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6">
      <div className="relative w-full max-w-md">
        {/* Floating blobs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-12 w-24 h-24 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full blur-xl opacity-60"
        />
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-20 right-12 w-32 h-32 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full blur-xl opacity-60"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-12 left-1/3 w-28 h-28 bg-gradient-to-br from-warm-200 to-warm-300 rounded-full blur-xl opacity-60"
        />

        {/* Content */}
        <div className="relative z-10 text-center space-y-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-20 h-20 mx-auto border-4 border-pink-400 border-t-transparent rounded-full"
          />

          <motion.p
            key={currentMessageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-serif text-xl text-rose-dark/80"
          >
            {messages[currentMessageIndex]}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
