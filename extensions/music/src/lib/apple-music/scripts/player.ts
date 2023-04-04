import { debug } from "@/lib/logger";
import { Result } from "@/lib/result";
import { minMax } from "@/lib/utils";
import { PlayerState, ScriptError } from "@/models/types";

export const pause = () => Result.tell("pause");
export const play = () => Result.tell("play");
export const stop = () => Result.tell("stop");
export const next = () => Result.tell("next track");
export const previous = () => Result.tell("previous track");
export const playPause = () => Result.tell("playpause");
export const activate = () => Result.tell("activate");

const setShufffle = (shuffleEnabled: boolean) => Result.tell(`set shuffle enabled to ${shuffleEnabled.toString()}`);
const getShuffle = async (): Promise<Result<boolean, ScriptError>> => {
  const data = await Result.tell("get shuffle enabled");
  return Result.map(data, (s) => s === "true");
};

/**
 *
 * Shuffle Controls
 */
export const shuffle = {
  get: getShuffle,
  set: setShufffle,
  toggle: async () => {
    const isShuffleEnabled = getShuffle();

    return setShufffle(!isShuffleEnabled);
  },
};

/*
 * VOLUME CONTROLS
 */

const getVolume = async () => {
  const volumeResult = await Result.tell("get sound volume");
  return Result.map(volumeResult, parseInt);
};

const setVolume = (volume: number) => {
  const vol = minMax(0, 100)(volume);

  return Result.tell(`set sound volume to ${vol}`);
};

/**
 *
 * Volume Controls
 */
export const volume = {
  get: getVolume,
  set: setVolume,
  increase: async (step = 10) => {
    const volume = await getVolume();

    return Result.chain(
      Result.map(volume, (v) => v + step),
      setVolume
    );
  },
  decrease: async (step = 10) => {
    const volume = await getVolume();

    return Result.chain(
      Result.map(volume, (v) => v - step),
      setVolume
    );
  },
};

/**
 * Get the current player state
 */
export const getState = async () => {
  const state = await Result.tell("player state");
  return Result.map(state, (s) => s as PlayerState);
};
