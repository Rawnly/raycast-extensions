import { runAppleScript } from "run-applescript";

import { debug } from "./logger";
import Result from "./result";
import { ScriptError } from "../models/types";

/**
 *
 * Force the type of the error to be a {ScriptError}.
 */
function asScriptError(error: unknown) {
  return error as ScriptError;
}

export const runScript = (command: string) =>
  Result.fromPromise(() => {
    debug(`Running AppleScript:\n\n ${command}`);
    return runAppleScript(command);
  }, asScriptError);

export const tell = (application: string, command: string) => {
  const script = `tell application "${application}" to ${command}`;
  return runScript(script);
};
