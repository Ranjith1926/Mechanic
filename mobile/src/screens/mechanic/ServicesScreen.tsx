import React from "react";
import { Screen } from "../../components/Screen";
import { ComingSoon } from "../../components/ComingSoon";

export function ServicesScreen() {
  return (
    <Screen scroll={false}>
      <ComingSoon title="Services" />
    </Screen>
  );
}
