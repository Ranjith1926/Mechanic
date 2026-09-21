import React from "react";
import { Screen } from "../../components/Screen";
import { ComingSoon } from "../../components/ComingSoon";

export function ClientNotificationsScreen() {
  return (
    <Screen scroll={false}>
      <ComingSoon title="Notifications" />
    </Screen>
  );
}
