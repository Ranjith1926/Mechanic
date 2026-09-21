import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ServicesListScreen } from "../screens/mechanic/ServicesListScreen";
import { ServiceDetailScreen } from "../screens/ServiceDetailScreen";
import { InvoiceDetailScreen } from "../screens/InvoiceDetailScreen";
import type { SharedDetailParamList } from "./types";

export type ServicesStackParamList = SharedDetailParamList & {
  ServicesList: undefined;
};

const Stack = createNativeStackNavigator<ServicesStackParamList>();

export function ServicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ServicesList" component={ServicesListScreen} options={{ title: "Services" }} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: "Service" }} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: "Invoice" }} />
    </Stack.Navigator>
  );
}
