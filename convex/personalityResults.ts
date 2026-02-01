import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const save = mutation({
  args: {
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
  },
  handler: async (ctx: any, args: any) => {
    const resultId = await ctx.db.insert("personalityResults", {
      userId: args.userId,
      communicationDirectness: args.communicationDirectness,
      socialEnergy: args.socialEnergy,
      emotionalExpression: args.emotionalExpression,
      lifeApproach: args.lifeApproach,
      rationale: args.rationale,
      summary: args.summary,
      confidence: args.confidence,
      mbtiType: args.mbtiType,
      mbtiEI: args.mbtiEI,
      mbtiSN: args.mbtiSN,
      mbtiTF: args.mbtiTF,
      mbtiJP: args.mbtiJP,
      mbtiConfidence: args.mbtiConfidence,
      createdAt: Date.now(),
    });
    return resultId;
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx: any, args: any) => {
    const result = await ctx.db
      .query("personalityResults")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();
    return result;
  },
});
