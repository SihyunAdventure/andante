/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_characterGen from "../actions/characterGen.js";
import type * as actions_chat from "../actions/chat.js";
import type * as actions_mjGenerate from "../actions/mjGenerate.js";
import type * as actions_personaImport from "../actions/personaImport.js";
import type * as actions_personality from "../actions/personality.js";
import type * as actions_stt from "../actions/stt.js";
import type * as actions_tts from "../actions/tts.js";
import type * as actions_voiceClone from "../actions/voiceClone.js";
import type * as characters from "../characters.js";
import type * as personalityResults from "../personalityResults.js";
import type * as users from "../users.js";
import type * as voiceAnswers from "../voiceAnswers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/characterGen": typeof actions_characterGen;
  "actions/chat": typeof actions_chat;
  "actions/mjGenerate": typeof actions_mjGenerate;
  "actions/personaImport": typeof actions_personaImport;
  "actions/personality": typeof actions_personality;
  "actions/stt": typeof actions_stt;
  "actions/tts": typeof actions_tts;
  "actions/voiceClone": typeof actions_voiceClone;
  characters: typeof characters;
  personalityResults: typeof personalityResults;
  users: typeof users;
  voiceAnswers: typeof voiceAnswers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
