import { Alert, Icon, LaunchType, confirmAlert, launchCommand, popToRoot } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useEffect } from "react";

import { isLoggedIn as checkAuth } from "../apple-music";

export default function useAuth(prompt = true) {
  const { data: isLoggedIn, isLoading } = useCachedPromise(checkAuth);

  const login = () =>
    launchCommand({
      type: LaunchType.UserInitiated,
      name: "login",
      extensionName: "music",
      ownerOrAuthorName: "fedevitaledev",
      context: {
        force: true,
      },
    });

  const askToLogin = (onCancel: () => void = popToRoot, onConfirm: () => void = login) =>
    confirmAlert({
      icon: Icon.Lock,
      title: "Not logged in",
      message: "You need to be logged in to use this extension. Please login in the preferences.",
      dismissAction: {
        title: "Close",
        style: Alert.ActionStyle.Cancel,
        onAction: onCancel,
      },
      primaryAction: {
        title: "Login",
        style: Alert.ActionStyle.Default,
        onAction: onConfirm,
      },
    });

  useEffect(() => {
    if (isLoading || isLoggedIn || !prompt) return;
    askToLogin();
  }, [isLoggedIn, askToLogin, isLoading]);

  return { isLoggedIn, authenticate: login, askToLogin, isLoading };
}
