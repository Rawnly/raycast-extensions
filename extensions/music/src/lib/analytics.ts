/*
 * This file includes the analytics code for this extension.
 * All the data is sent anonymously and is used to improve the extension.
 *
 * You can opt-out of this by setting the `sendAnonymousUsageData` setting to `false`.
 *
 * @see https://github.com/rawnly/raycast-music - For the source code of the analytics
 */
import { environment } from "@raycast/api";
import { fetch } from "undici";
import { z } from "zod";

import { debug } from "./logger";
import { Preferences } from "./preferences";
import Result from "./result";

const payloadSchema = z.object({
  command: z.string(),
  timestamp: z.string(),
  parameters: z.object({
    raycastVersion: z.string(),
    success: z.boolean(),
    mode: z.string(),
  }),
});

type Payload = z.infer<typeof payloadSchema>;

export const isEnabled = () => {
  if (environment.isDevelopment) return false;
  if (environment.commandName) return Preferences.sendAnonymousUsageData;
};

export const trackCommandExecution = async (success = true) => {
  if (!isEnabled()) return Promise.resolve(true);

  let url = `https://raycast-music.app/api/analytics`;

  if (environment.isDevelopment) {
    url = `http://localhost:3000/api/analytics`;
  }

  const payload: Payload = {
    timestamp: new Date().toISOString(),
    command: environment.commandName,
    parameters: {
      success,
      mode: environment.commandMode,
      raycastVersion: environment.raycastVersion,
    },
  };

  debug(payload);

  const promise = () =>
    fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });

  debug(`Sending analytics data for command: ${environment.commandName}`);
  const result = await Result.try(promise, (error) => error as Error);

  if (!result.success && environment.isDevelopment) {
    console.error("Failed to send analytics data", result);
  }

  return result;
};
