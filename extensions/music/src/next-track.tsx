import { scripts } from "@/lib/apple-music";

import { handleResult } from "./lib/utils";

export default handleResult(scripts.player.next, {
  onSuccess: "Next Track",
  onError: "Failed to go to next track",
});
