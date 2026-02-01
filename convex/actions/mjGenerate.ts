"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

const KIE_BASE_URL = "https://api.kie.ai/api/v1";

export const submitTask = action({
  args: {
    prompt: v.string(),
  },
  handler: async (_ctx, args): Promise<string> => {
    const apiKey = process.env.KIE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("KIE_AI_API_KEY not configured");
    }

    const response = await fetch(`${KIE_BASE_URL}/jobs/createTask`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "z-image",
        input: {
          prompt: args.prompt,
          aspect_ratio: "1:1",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`KIE API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const taskId = data.data?.taskId;

    if (!taskId) {
      throw new Error("No taskId returned from KIE API");
    }

    return taskId;
  },
});

export const getTaskResult = action({
  args: {
    taskId: v.string(),
  },
  handler: async (_ctx, args): Promise<{ status: string; imageUrl: string | null }> => {
    const apiKey = process.env.KIE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("KIE_AI_API_KEY not configured");
    }

    const response = await fetch(
      `${KIE_BASE_URL}/jobs/recordInfo?taskId=${encodeURIComponent(args.taskId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`KIE API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const record = data.data;

    if (!record) {
      return { status: "pending", imageUrl: null };
    }

    const status = record.status ?? "pending";
    let imageUrl: string | null = null;

    if (status === "success" || status === "completed") {
      imageUrl = record.output?.imageUrl
        ?? record.output?.image_url
        ?? record.imageUrl
        ?? record.resultUrl
        ?? null;
    }

    return { status, imageUrl };
  },
});
