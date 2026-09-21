import React from "react";
import { Screen } from "../../components/Screen";
import { ComingSoon } from "../../components/ComingSoon";

export function CustomersScreen() {
  return (
    <Screen scroll={false}>
      <ComingSoon title="Customers" />
    </Screen>
  );
}
