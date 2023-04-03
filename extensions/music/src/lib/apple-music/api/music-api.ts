import { fetch, RequestInit } from "undici";
import { nanoid } from "nanoid";

import { debug } from "@/lib/logger";
import { Recommendation, SearchResponse, SearchScope, Storefront } from "@/models/music";

import { getToken, getUserToken } from "./token";

interface MusicRequestInit extends RequestInit {
  query?: Record<string, string | number | boolean>;
}

type LibrarySearchScope =
  | "library-albums"
  | "library-artist"
  | "library-music-videos"
  | "library-playlists"
  | "library-songs";

export default class MusicApiClient {
  #baseUrl = new URL(`https://api.music.apple.com`);
  private _authenticated: boolean;

  constructor(authenticated = false) {
    this._authenticated = authenticated;
  }

  get authenticated() {
    return new MusicApiClient(true);
  }

  async request<T = unknown>(path: string, request?: MusicRequestInit) {
    const { token } = await getToken();
    const userToken = await getUserToken();

    const url = this.#baseUrl;
    url.pathname = `/v1/${path}`.replace(/\/+/g, "/");

    if (request?.query) {
      for (const k in request?.query ?? {}) {
        url.searchParams.set(k, request?.query?.[k].toString());
      }
    }

    const requestId = nanoid(5);
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      debug(`[${requestId}] Timed out`);
      controller.abort();
    }, 1000 * 30);

    debug(`[${requestId}] ${request?.method ?? "GET"} - ${url.toString()}`);

    const response = await fetch(url, {
      ...request,
      referrerPolicy: "no-referrer",
      signal: request?.signal ?? controller.signal,
      headers: {
        ...request?.headers,
        Origin: "https://raycast-music.app",
        Authorization: `Bearer ${token}`,
        ...(this._authenticated && { "Music-User-Token": userToken }),
      },
    });

    debug(`[${requestId}] ${response.status} - ${response.statusText}]`);
    clearTimeout(timeout);

    const data = await response.json();

    return { data: data as T, status: response.status };
  }

  catalog = {
    search: (query: string, scope: SearchScope[], { storefront }: { storefront: string }) =>
      this.request<SearchResponse>(`/catalog/${storefront}/search`, {
        query: {
          term: query,
          types: scope.join(","),
          limit: 25,
        },
      }),
  };

  me = {
    storefront: () => this.authenticated.request<{ data: Storefront[] }>("/me/storefront"),
    isLoggedIn: async () => {
      const res = await this.me.storefront();

      return res.status === 200;
    },
    recommendations: () => this.authenticated.request<{ data: Recommendation[] }>("/me/recommendations"),
    library: {
      songs: () => this.authenticated.request("/me/library/songs"),
      search: (term: string, types: LibrarySearchScope, limit = 25) =>
        this.authenticated.request("/me/library/search", {
          query: {
            term,
            types,
            limit,
          },
        }),
    },
  };
}

export const api = new MusicApiClient();
