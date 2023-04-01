import { scripts } from "@/lib/apple-music";

import { handleResult } from "./lib/utils";

export default handleResult(scripts.currentTrack.dislike, {
  onSuccess: "Track Disliked",
  onError: "Failed to dislike track",
});
