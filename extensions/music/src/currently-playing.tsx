import { Icon, MenuBarExtra } from "@raycast/api";
import { useCachedPromise, useCachedState } from "@raycast/utils";
import { useCallback, useEffect, useMemo } from "react";
import { match } from "ts-pattern";

import * as music from "@/lib/apple-music/";

import { CurrentTrack } from "./lib/apple-music/scripts/current-track";
import { debug } from "./lib/logger";
import { Preferences } from "./lib/preferences";
import Result from "./lib/result";
import { handleResult } from "./lib/utils";
import { PlayerState } from "./models/types";

function getTrack() {
  debug("Getting track...");
  return Result.promisify(music.scripts.currentTrack.getCurrentTrack)();
}

function getPlayerState() {
  debug("Getting player state...");
  return Result.promisify(music.scripts.player.getState)();
}

function getTrackArtwork(track: CurrentTrack) {
  debug("Getting track artwork...");
  return music.trackToSong(track);
}

const MUSIC_ICON = "../assets/icon.png";

type Action = "next" | "prev" | "love" | "dislike";

function truncateTitleIfNeeded(title: string) {
  const max = Preferences.currentlyPlaying.maxTitleLength;
  if (max <= 5) return title;

  const truncated = title.slice(0, max);

  return `${truncated}${truncated.length < title.length ? "…" : ""}`;
}

function CurrentlyPlaying() {
  const {
    data: playerState = PlayerState.PAUSED,
    isLoading: isLoadingState,
    mutate: mutateState,
  } = useCachedPromise(getPlayerState);

  const { data: track, isLoading: isTrackLoading, mutate: mutateTrack } = useCachedPromise(getTrack);
  const { data: song, revalidate: revalidateSong } = useCachedPromise(getTrackArtwork, [track as any], {
    execute: !!track,
  });

  const isPlaying = useMemo(() => playerState === PlayerState.PLAYING, [playerState]);
  const [artwork, setArtwork] = useCachedState("artwork", MUSIC_ICON);
  const title = useMemo(() => {
    if (!track) return "Music";
    return truncateTitleIfNeeded(`${track.artist} - ${track.name}`);
  }, [track]);

  useEffect(() => {
    if (!track || !song || !Preferences.currentlyPlaying.displayArtowrk) {
      setArtwork(MUSIC_ICON);
      return;
    }

    setArtwork(song.attributes.artwork.url.replace("{w}", "150").replace("{h}", "150"));
  }, [track, song, Preferences.currentlyPlaying.displayArtowrk]);

  async function onToggle() {
    await mutateState(Promise.resolve(isPlaying ? PlayerState.PAUSED : PlayerState.PLAYING), {
      shouldRevalidateAfter: true,
    });

    await handleResult(music.scripts.player.playPause)();
  }

  const executeAction = useCallback(
    (actionType: Action) => async () => {
      const action = match(actionType)
        .with("next", () => music.scripts.player.next)
        .with("prev", () => music.scripts.player.previous)
        .with("love", () => () => music.scripts.currentTrack.love(!track?.loved))
        .with("dislike", () => {
          return () => music.scripts.currentTrack.dislike(!track?.disliked);
        })
        .exhaustive();

      if (actionType === "next" || actionType === "prev") {
        revalidateSong();
      }

      await handleResult(action)();
      await mutateTrack(
        Promise.resolve({
          ...track,
          loved: actionType === "love" ? !track?.loved : track?.loved,
          disliked: actionType === "dislike" ? !track?.disliked : track?.disliked,
        }),
        {
          rollbackOnError: true,
          shouldRevalidateAfter: true,
        }
      );
    },
    [track]
  );

  return (
    <MenuBarExtra
      title={(Preferences.currentlyPlaying.displayTitle && title) || undefined}
      icon={artwork}
      isLoading={isLoadingState || isTrackLoading}
    >
      <MenuBarExtra.Item
        icon={isPlaying ? Icon.Pause : Icon.Play}
        title={isPlaying ? "Pause" : "Play"}
        onAction={onToggle}
      />
      <MenuBarExtra.Section>
        <MenuBarExtra.Item icon={Icon.Forward} title="Next Track" onAction={executeAction("next")} />
        <MenuBarExtra.Item icon={Icon.Rewind} title="Previous Track" onAction={executeAction("prev")} />
      </MenuBarExtra.Section>

      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          icon={track?.loved ? Icon.Checkmark : Icon.Heart}
          title="Love"
          onAction={executeAction("love")}
        />
        <MenuBarExtra.Item
          icon={track?.disliked ? Icon.Checkmark : Icon.HeartDisabled}
          title="Dislike"
          onAction={executeAction("dislike")}
        />
      </MenuBarExtra.Section>
      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          title="View in Music"
          icon={MUSIC_ICON}
          onAction={handleResult(music.scripts.currentTrack.reveal)}
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}

export default CurrentlyPlaying;
