import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveAnswer = mutation({
  args: {
    userId: v.id("users"),
    questionId: v.string(),
    audioStorageId: v.id("_storage"),
    transcript: v.optional(v.string()),
    durationSeconds: v.optional(v.float64()),
  },
  handler: async (ctx: any, args: any) => {
    const answerId = await ctx.db.insert("voiceAnswers", {
      userId: args.userId,
      questionId: args.questionId,
      audioStorageId: args.audioStorageId,
      transcript: args.transcript,
      durationSeconds: args.durationSeconds,
      createdAt: Date.now(),
    });
    return answerId;
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx: any, args: any) => {
    const answers = await ctx.db
      .query("voiceAnswers")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();

    // Sort by questionId for consistent ordering
    return answers.sort((a: any, b: any) => a.questionId.localeCompare(b.questionId));
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx: any) => {
    return await ctx.storage.generateUploadUrl();
  },
});
