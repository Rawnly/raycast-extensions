import { createQueryString, parseQueryString, runScript } from "@/lib/apple-script";
import { STAR_VALUE } from "@/lib/costants";
import { Result } from "@/lib/result";

export const reveal = () => Result.tell("reveal current track");
export const love = (love = true) => Result.tell("set loved of current track to " + love?.toString());
export const dislike = (dislike = true) => Result.tell("set disliked of current track to " + dislike?.toString());

/*
 * RATING
 */
const setRating = (rating: number) => Result.tell(`set rating of current track to ${rating * STAR_VALUE}`);
const getRating = async () => {
  const result = await Result.tell("get rating of current track");
  const rating = Result.map(result, parseInt);

  return Result.map(rating, (r) => r / STAR_VALUE);
};

export const rating = {
  get: getRating,
  set: setRating,
};

export type CurrentTrack = {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number;
  rating: number;
  loved: boolean;
  disliked: boolean;
};

export const getCurrentTrack = async () => {
  const querystring = createQueryString({
    id: "trackId",
    name: "trackName",
    artist: "trackArtist",
    album: "trackAlbum",
    duration: "trackDuration",
    rating: "trackRating",
    loved: "trackLoved",
    disliked: "trackDisliked",
  });

  const r = await runScript(`
      set output to ""
        tell application "Music"
          set t to (get current track)

          set trackId to id of t
          set trackName to name of t
          set trackArtist to artist of t
          set trackAlbum to album of t
          set trackDuration to duration of t
          set trackRating to rating of t
          set trackLoved to loved of t
          set trackDisliked to disliked of t

          set output to ${querystring}
        end tell
      return output
    `);

  return Result.map(r, parseQueryString<CurrentTrack>());
};
