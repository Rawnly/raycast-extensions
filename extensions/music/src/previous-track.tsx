import { scripts } from "@/lib/apple-music";

import { handleResult } from "./lib/utils";

export default handleResult(scripts.player.previous, {
  onSuccess: "Track rewinded",
  onError: "Failed to rewind track",
  closeView: true,
});
