import { Action, ActionPanel, Grid, List, popToRoot } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";

import { api } from "./lib/apple-music";
import useAuth from "./lib/hooks/useAuth";
import { Preferences } from "./lib/preferences";

export default function Recommendations() {
  const { isLoggedIn, isLoading: isLoadingAuth } = useAuth();
  const { data: recommendations, isLoading: isLoadingRecommendations } = useCachedPromise(api.me.recommendations, [], {
    execute: isLoggedIn,
  });

  const isLoading = isLoadingAuth || isLoadingRecommendations;

  if (Preferences.recommendations.displayAsList) {
    return (
      <List isLoading={isLoading} navigationTitle="Recommendations">
        {recommendations?.data.data.map((section) => (
          <List.Section key={section.id} title={section.attributes.title.stringForDisplay}>
            {section.relationships?.contents.data.map((item) => (
              <List.Item
                key={item.id}
                title={item.attributes.name}
                icon={item.attributes.artwork.url.replace("{w}", "80").replace("{h}", "80")}
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser title="Open" onOpen={() => popToRoot()} url={item.attributes.url} />
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        ))}
      </List>
    );
  }

  return (
    <Grid isLoading={isLoading}>
      {recommendations?.data.data.map((item) => (
        <Grid.Section
          key={item.id}
          title={item.attributes.title.stringForDisplay}
          subtitle={item.attributes.reason?.stringForDisplay}
        >
          {item.relationships?.contents?.data.map((content) => (
            <Grid.Item
              key={content.id}
              title={content.attributes.name}
              content={content.attributes.artwork.url.replace("{w}", "200").replace("{h}", "200")}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser title="Open" onOpen={() => popToRoot()} url={content.attributes.url} />
                </ActionPanel>
              }
            />
          ))}
        </Grid.Section>
      ))}
    </Grid>
  );
}
