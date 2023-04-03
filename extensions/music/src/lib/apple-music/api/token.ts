import { environment } from "@raycast/api";
import { fetch } from "undici";
import { z } from "zod";

import Result from "@/lib/result";
import { Storage, StorageKeys } from "@/lib/storage";
import { api } from "./music-api";

const tokenResponseSchema = z.object({
  token: z.string(),
  expires: z.number(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;

export async function getAppleMusicToken() {
  const response = await Result.try(
    () =>
      fetch("https://raycast-music.app/api/get-token", {
        headers: {
          "X-Raycast-Version": environment.raycastVersion,
        },
      }).then((r) => r.json()),
    (error) => error as Error
  );

  return Result.chainSchema(response, tokenResponseSchema.safeParse);
}

export async function getToken() {
  const token = await Storage.musicToken;

  if (token && token.expires > Date.now()) {
    return token;
  }

  const tkn = await getAppleMusicToken();

  if (!tkn.success) {
    throw tkn.error;
  }

  await Storage.set(StorageKeys.MusicToken, JSON.stringify(tkn));

  return tkn.data;
}

export async function getUserToken() {
  const token = await Storage.userToken;

  return token;
}

export async function isLoggedIn() {
  const userToken = await getUserToken();
  if (!userToken) return false;

  const res = await api.authenticated.request("/me/storefront");

  return res.status === 200;
}
