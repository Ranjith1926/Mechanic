import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { InvoicesListScreen } from "../screens/mechanic/InvoicesListScreen";
import { InvoiceDetailScreen } from "../screens/InvoiceDetailScreen";
import type { SharedDetailParamList } from "./types";

export type InvoicesStackParamList = SharedDetailParamList & {
  InvoicesList: undefined;
};

const Stack = createNativeStackNavigator<InvoicesStackParamList>();

export function InvoicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="InvoicesList" component={InvoicesListScreen} options={{ title: "Invoices" }} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: "Invoice" }} />
    </Stack.Navigator>
  );
}
