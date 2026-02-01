import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    userId: v.id("users"),
    avatarStorageId: v.optional(v.id("_storage")),
    avatarMode: v.string(),
    presetAvatarId: v.optional(v.string()),
    voiceId: v.optional(v.string()),
    introText: v.optional(v.string()),
    introAudioStorageId: v.optional(v.id("_storage")),
    systemPrompt: v.optional(v.string()),
    speechStyle: v.optional(
      v.object({
        tone: v.string(),
        emojiFrequency: v.string(),
        sentenceLength: v.string(),
        humor: v.string(),
      })
    ),
    personaMarkdown: v.optional(v.string()),
    onboardingMethod: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const now = Date.now();
    const characterId = await ctx.db.insert("characters", {
      userId: args.userId,
      avatarStorageId: args.avatarStorageId,
      avatarMode: args.avatarMode,
      presetAvatarId: args.presetAvatarId,
      voiceId: args.voiceId,
      introText: args.introText,
      introAudioStorageId: args.introAudioStorageId,
      systemPrompt: args.systemPrompt,
      speechStyle: args.speechStyle,
      personaMarkdown: args.personaMarkdown,
      onboardingMethod: args.onboardingMethod,
      createdAt: now,
      updatedAt: now,
    });
    return characterId;
  },
});

export const update = mutation({
  args: {
    characterId: v.id("characters"),
    avatarStorageId: v.optional(v.id("_storage")),
    avatarMode: v.optional(v.string()),
    presetAvatarId: v.optional(v.string()),
    voiceId: v.optional(v.string()),
    introText: v.optional(v.string()),
    introAudioStorageId: v.optional(v.id("_storage")),
    systemPrompt: v.optional(v.string()),
    speechStyle: v.optional(
      v.object({
        tone: v.string(),
        emojiFrequency: v.string(),
        sentenceLength: v.string(),
        humor: v.string(),
      })
    ),
  },
  handler: async (ctx: any, args: any) => {
    const { characterId, ...updates } = args;
    await ctx.db.patch(characterId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx: any, args: any) => {
    const character = await ctx.db
      .query("characters")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();
    return character;
  },
});
