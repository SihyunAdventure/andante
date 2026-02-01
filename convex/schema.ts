import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  voiceAnswers: defineTable({
    userId: v.id("users"),
    questionId: v.string(),
    audioStorageId: v.id("_storage"),
    transcript: v.optional(v.string()),
    durationSeconds: v.optional(v.float64()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  personalityResults: defineTable({
    userId: v.id("users"),
    communicationDirectness: v.float64(),
    socialEnergy: v.float64(),
    emotionalExpression: v.float64(),
    lifeApproach: v.float64(),
    rationale: v.object({
      communicationDirectness: v.string(),
      socialEnergy: v.string(),
      emotionalExpression: v.string(),
      lifeApproach: v.string(),
    }),
    summary: v.string(),
    confidence: v.float64(),
    mbtiType: v.optional(v.string()),
    mbtiEI: v.optional(v.float64()),
    mbtiSN: v.optional(v.float64()),
    mbtiTF: v.optional(v.float64()),
    mbtiJP: v.optional(v.float64()),
    mbtiConfidence: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  characters: defineTable({
    userId: v.id("users"),
    avatarStorageId: v.optional(v.id("_storage")),
    avatarMode: v.string(),
    presetAvatarId: v.optional(v.string()),
    voiceId: v.optional(v.string()),
    introText: v.optional(v.string()),
    introAudioStorageId: v.optional(v.id("_storage")),
    systemPrompt: v.optional(v.string()),
    speechStyle: v.optional(v.object({
      tone: v.string(),
      emojiFrequency: v.string(),
      sentenceLength: v.string(),
      humor: v.string(),
    })),
    personaMarkdown: v.optional(v.string()),
    onboardingMethod: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
