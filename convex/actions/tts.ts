"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

export const synthesize = action({
  args: {
    text: v.string(),
    voiceId: v.string(),
  },
  handler: async (ctx: any, args: any): Promise<any> => {
    const apiKey = process.env.SUPERTONE_API_KEY;
    if (!apiKey) {
      throw new Error("SUPERTONE_API_KEY not configured");
    }

    if (!args.text.trim()) {
      throw new Error("Text cannot be empty");
    }

    const response = await fetch("https://supertoneapi.com/v1/text-to-speech", {
      method: "POST",
      headers: {
        "x-sup-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_id: args.voiceId,
        text: args.text,
        language: "ko",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supertone TTS error:", response.status, errorText);
      throw new Error(`TTS failed: ${response.status} ${errorText}`);
    }

    const audioBlob = await response.blob();
    const storageId = await ctx.storage.store(audioBlob);

    return storageId;
  },
});
