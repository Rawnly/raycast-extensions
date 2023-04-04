import { Toast, environment, open, closeMainWindow, Clipboard, showHUD, showToast } from "@raycast/api";
import { match } from "ts-pattern";

import { trackCommandExecution } from "./analytics";
import { Preferences } from "./preferences";
import Result from "./result";
import { ScriptError } from "../models/types";

/**
 *
 * Split number into N pieces, starting from 0
 *
 * @example divideNumber(100, 25) // => 0,25,50,75,100
 */
export const divideNumber = (num: number, step: number): number[] => {
  const arr: number[] = [];

  for (let i = 0; i <= num; i += step) {
    arr.push(i);
  }

  return arr;
};

export function displayError(error: Error | ScriptError) {
  const message = ScriptError.is(error) ? error.shortMessage : error.message;

  if (environment.commandMode === "menu-bar") {
    showHUD(`Error: ${message}`);
    return;
  }

  showToast({
    title: "Error",
    message,
    style: Toast.Style.Failure,
    primaryAction: {
      title: "Copy stack trace",
      onAction: () => Clipboard.copy(error.stack ?? error.message),
      shortcut: {
        key: "enter",
        modifiers: ["shift"],
      },
    },
    secondaryAction: {
      title: "Report Issue",
      onAction: async () => {
        await open(
          "https://github.com/raycast/extensions/issues/new?template=extension_bug_report.yml&extension-url=https%3A%2F%2Fraycast.com%2Ffedevitaledev%2Fmusic&title=%5BMusic%5D+..."
        );

        await showHUD(`Thanks for reporting this bug!`);
      },
      shortcut: {
        key: "enter",
        modifiers: ["cmd"],
      },
    },
  });
}

export const minMax = (min: number, max: number) => (value: number) => Math.max(Math.min(value, max), min);

interface Options<T, E> {
  onSuccess?: string | ((val: T) => string);
  onError?: string | ((val: E) => string);
  closeView?: boolean;
}

export const isMenuBar = () => environment.commandMode == "menu-bar";

function handleResult<T, E>(result: () => Promise<Result<T, E>>, options: Options<T, E>): () => Promise<void>;
function handleResult<T, E>(result: () => Promise<Result<T, E>>): () => Promise<void>;
function handleResult<T, E extends Error>(result: () => Promise<Result<T, E>>, options?: Options<T, E>) {
  return async () => {
    const r = await result();

    await trackCommandExecution(r.success);

    const closeView = isMenuBar() ? false : options?.closeView ?? Preferences.closeMainWindowOnControls;
    const displayEnhancedFeedback = isMenuBar() ? false : Preferences.enhancedFeedback;

    if (!displayEnhancedFeedback) {
      if (!r.success) {
        displayError(r.error);
        return;
      }

      if (!closeView) return;

      closeMainWindow();
      return;
    }

    match(r)
      .with({ success: true }, ({ data }) => {
        if (!options?.onSuccess) return;
        const message = typeof options.onSuccess === "string" ? options.onSuccess : options.onSuccess(data);

        if (closeView) {
          showHUD(message);
          return;
        }

        showToast(Toast.Style.Success, message);
      })
      .with({ success: false }, ({ error }) => {
        if (options?.onError) {
          const message = typeof options.onError === "string" ? options.onError : options.onError(error);
          showHUD(message);
        }

        displayError(error);
      })
      .exhaustive();

    if (!closeView || !r.success) return;
    closeMainWindow();
  };
}

export { handleResult };
