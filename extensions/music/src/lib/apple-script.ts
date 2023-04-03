import { runAppleScript } from "run-applescript";

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
    // debug(`Running AppleScript:\n\n ${command}`);
    return runAppleScript(command);
  }, asScriptError);

export const tell = (application: string, command: string) => {
  const script = `tell application "${application}" to ${command}`;
  return runScript(script);
};

/**
 * Transforms an object to a querystring concatened in apple-script.
 * @example
 *  createQueryString({
 *     id: 'trackId',
 *     name: 'trackName',
 *  }) // => "id=" & trackId & "&name=" & trackName"
 */
export const createQueryString = <T extends object>(obj: T): string => {
  return Object.entries(obj).reduce((acc, [key, value], i) => {
    const keyvalue = `"${i > 0 ? "$BREAK" : ""}${key}=" & ${value}`;

    if (!acc) return keyvalue;

    return `${acc} & ${keyvalue}`;
  }, "");
};

export const parseQueryString =
  <T>() =>
    (query: string): T => {
      const entries = query.split("$BREAK").map((item) => item.split("="));

      const o: any = {};

      for (const [k, v] of entries) {
        o[k] = parseValue(v);
      }

      return o as T;
    };

const parseValue = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
