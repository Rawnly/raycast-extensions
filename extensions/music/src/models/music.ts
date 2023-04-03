import { PlayerState } from "./types";

export interface Track {
  id?: string;
  name: string;
  artist: string;
  album: string;
  duration: string;
  state?: PlayerState;
}

export interface Storefront {
  id: string;
  type: "storefronts";
  attributes: {
    supportedLanguageTags: string[];
    defaultLanguageTag: string;
    name: string;
    explicitContentPolicy: string;
  };
}

type AppleMusicStringForDisplay = {
  stringForDisplay: string;
};

export interface Recommendation {
  id: string;
  attributes: {
    reason?: AppleMusicStringForDisplay;
    title: AppleMusicStringForDisplay;
    isGroupRecommendation: false;
    resourceTypes: any[];
    nextUpdateDate: string;
    kind: string;
  };
  relationships: {
    contents: {
      href: string;
      data: {
        id: string;
        kind: string;
        attributes: {
          url: string;
          name: string;
          type: string;
          artwork: Artwork;
        };
      }[];
    };
  };
}

export type SearchScope = "songs" | "albums" | "artists" | "playlists" | "stations";

export interface Artwork {
  width: number;
  height: number;
  url: string;
  bgColor: string;
}

type SearchElementAttributesBase = {
  name: string;
  artwork: Artwork;
};

type Song = {
  artistName: string;
};

type SearchElementAttributes<T extends SearchScope> = SearchElementAttributesBase &
  (T extends "songs" | "albums"
    ? Song
    : {
      curatorName: string;
    });

export interface SearchElement<T extends SearchScope> {
  href: string;
  next: string;
  data: {
    id: string;
    type: T;
    href: string;
    attributes: SearchElementAttributes<T>;
  }[];
}

export type SearchResponse = {
  results: {
    [K in SearchScope]: SearchElement<K>;
  };
};
