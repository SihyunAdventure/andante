"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

export const transcribe = action({
  args: {
    audioStorageId: v.id("_storage"),
  },
  handler: async (ctx: any, args: any): Promise<string> => {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPGRAM_API_KEY not configured");
    }

    const blob = await ctx.storage.get(args.audioStorageId);
    if (!blob) {
      throw new Error("Audio file not found in storage");
    }

    const audioBuffer = await blob.arrayBuffer();

    const response = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-3&language=ko&smart_format=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "audio/webm",
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepgram API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const transcript =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return transcript;
  },
});
