import { scripts } from "@/lib/apple-music";

import { handleResult } from "./lib/utils";

export default handleResult(scripts.currentTrack.love, {
  onSuccess: "Track Loved",
  onError: "Failed to love track",
});
