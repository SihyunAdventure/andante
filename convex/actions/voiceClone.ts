"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

export const cloneVoice = action({
  args: {
    audioStorageIds: v.array(v.id("_storage")),
    name: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any): Promise<string> => {
    const apiKey = process.env.SUPERTONE_API_KEY;
    if (!apiKey) {
      throw new Error("SUPERTONE_API_KEY not configured");
    }

    if (args.audioStorageIds.length === 0) {
      throw new Error("No audio files provided");
    }

    if (args.audioStorageIds.length > 3) {
      throw new Error("Maximum 3 audio files allowed");
    }

    const formData = new FormData();

    for (let i = 0; i < args.audioStorageIds.length; i++) {
      const blob = await ctx.storage.get(args.audioStorageIds[i]);
      if (!blob) {
        throw new Error(`Audio file not found in storage: ${args.audioStorageIds[i]}`);
      }
      // Send audio as-is; Supertone may accept webm directly.
      // If WAV conversion is needed, it will be added later.
      formData.append("files", blob, `recording_${i}.webm`);
    }

    formData.append("name", args.name ?? "Andante Voice");

    const response = await fetch(
      "https://supertoneapi.com/v1/custom-voices/cloned-voice",
      {
        method: "POST",
        headers: {
          "x-sup-api-key": apiKey,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supertone clone error:", response.status, errorText);
      throw new Error(`Voice cloning failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const voiceId = result.voice_id || result.id;

    if (!voiceId) {
      console.error("Unexpected Supertone response:", result);
      throw new Error("No voice_id returned from Supertone");
    }

    return voiceId;
  },
});
