import React from "react";
import { Screen } from "../../components/Screen";
import { ComingSoon } from "../../components/ComingSoon";

export function ClientInvoicesScreen() {
  return (
    <Screen scroll={false}>
      <ComingSoon title="Invoices" />
    </Screen>
  );
}
