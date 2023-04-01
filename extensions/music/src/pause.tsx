import { scripts } from "@/lib/apple-music";

import { handleResult } from "./lib/utils";

export default handleResult(scripts.player.playPause, {
  onSuccess: "Play/Pause",
  onError: "Failed to play/pause",
});
