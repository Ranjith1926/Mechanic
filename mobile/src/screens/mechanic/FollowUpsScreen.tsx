import React from "react";
import { Screen } from "../../components/Screen";
import { ComingSoon } from "../../components/ComingSoon";

export function FollowUpsScreen() {
  return (
    <Screen scroll={false}>
      <ComingSoon title="Follow-ups" />
    </Screen>
  );
}
