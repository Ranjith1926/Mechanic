import React from "react";
import { Screen } from "../../components/Screen";
import { ComingSoon } from "../../components/ComingSoon";

export function SparePartsScreen() {
  return (
    <Screen scroll={false}>
      <ComingSoon title="Spare Parts" />
    </Screen>
  );
}
