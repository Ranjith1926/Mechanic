import React from "react";
import { Screen } from "../../components/Screen";
import { ComingSoon } from "../../components/ComingSoon";

export function InvoicesScreen() {
  return (
    <Screen scroll={false}>
      <ComingSoon title="Invoices" />
    </Screen>
  );
}
