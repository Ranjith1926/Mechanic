import React from "react";
import { Screen } from "../../components/Screen";
import { ComingSoon } from "../../components/ComingSoon";

export function ServiceHistoryScreen() {
  return (
    <Screen scroll={false}>
      <ComingSoon title="Service History" />
    </Screen>
  );
}
