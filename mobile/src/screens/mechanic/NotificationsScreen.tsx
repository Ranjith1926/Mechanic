import React from "react";
import { Screen } from "../../components/Screen";
import { ComingSoon } from "../../components/ComingSoon";

export function MechanicNotificationsScreen() {
  return (
    <Screen scroll={false}>
      <ComingSoon title="Notifications" />
    </Screen>
  );
}
