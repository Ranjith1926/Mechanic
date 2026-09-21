import React from "react";
import { Screen } from "../../components/Screen";
import { ComingSoon } from "../../components/ComingSoon";

export function BikesScreen() {
  return (
    <Screen scroll={false}>
      <ComingSoon title="Bikes" />
    </Screen>
  );
}
