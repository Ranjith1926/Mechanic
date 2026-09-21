import React from "react";
import { Screen } from "../../components/Screen";
import { ComingSoon } from "../../components/ComingSoon";

export function MyBikesScreen() {
  return (
    <Screen scroll={false}>
      <ComingSoon title="My Bikes" />
    </Screen>
  );
}
