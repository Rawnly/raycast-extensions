import { Toast, closeMainWindow, showToast } from "@raycast/api";

import { api, trackToSong } from "./lib/apple-music";
import { addToLibrary, getCurrentTrack } from "./lib/apple-music/scripts/current-track";
import useAuth from "./lib/hooks/useAuth";
import { Preferences } from "./lib/preferences";
import { displayError, handleResult } from "./lib/utils";

export default async function AddToLibrary() {
  const { isLoggedIn, askToLogin, isLoading } = useAuth(false);

  if (Preferences.experimental_add_to_library) {
    if (!isLoading && !isLoggedIn) {
      askToLogin();
      return;
    }

    try {
      const track = await getCurrentTrack();

      if (!track.success) {
        const error = new Error("Could not retrive currrent track");
        displayError(error);
        return;
      }

      const song = await trackToSong(track.data);

      if (!song) {
        displayError(new Error("Could not retrive song"));
        return;
      }

      const result = await api.me.library.add("songs", song.id);

      if (result.status === 202) {
        showToast(Toast.Style.Success, "Added to library");
      }

      if (Preferences.closeMainWindowOnControls) {
        await closeMainWindow();
      }
    } catch (error) {
      displayError(error as Error);
    }
  }

  return handleResult(addToLibrary, {
    onSuccess: "Added to library",
  })();
}
