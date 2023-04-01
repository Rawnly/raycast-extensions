import { getPreferenceValues } from "@raycast/api";
import { z } from "zod";

const preferencesSchema = z.object({
  volumeSteps: z.string().default("10"),
  sendAnonymousUsageData: z.boolean().default(true),
  closeMainWindowOnControls: z.boolean().default(true),
  enhancedFeedback: z.boolean().default(true),
});

export type IPreferences = z.infer<typeof preferencesSchema>;

const getPreferences = () => preferencesSchema.parse(getPreferenceValues());

export class Preferences {
  static get<K extends keyof IPreferences = keyof IPreferences>(key: K): IPreferences[K] {
    return getPreferences()[key];
  }

  static get volumeStep(): number {
    return parseInt(this.get("volumeSteps")) ?? 10;
  }

  static get sendAnonymousUsageData(): boolean {
    return Preferences.get("sendAnonymousUsageData");
  }

  static get closeMainWindowOnControls(): boolean {
    return Preferences.get("closeMainWindowOnControls");
  }

  static get enhancedFeedback(): boolean {
    return Preferences.get("enhancedFeedback");
  }
}
