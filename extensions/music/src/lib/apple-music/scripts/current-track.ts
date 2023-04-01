import { STAR_VALUE } from "@/lib/costants";
import { Result } from "@/lib/result";

export const reveal = () => Result.tell("reveal current track");
export const love = () => Result.tell("set loved of current track to true");
export const dislike = () => Result.tell("set disliked of current track to true");

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
