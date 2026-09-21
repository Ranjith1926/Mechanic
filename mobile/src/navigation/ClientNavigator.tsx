import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { ClientDashboardScreen } from "../screens/client/DashboardScreen";
import { MyBikesScreen } from "../screens/client/MyBikesScreen";
import { ServiceHistoryScreen } from "../screens/client/ServiceHistoryScreen";
import { ClientInvoicesScreen } from "../screens/client/InvoicesScreen";
import { ClientNotificationsScreen } from "../screens/client/NotificationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { colors } from "../theme";

export type ClientDrawerParamList = {
  Dashboard: undefined;
  "My Bikes": undefined;
  "Service History": undefined;
  Invoices: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator<ClientDrawerParamList>();

export function ClientNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerTintColor: colors.text,
        drawerActiveTintColor: colors.primary,
        drawerActiveBackgroundColor: "#eff6ff",
      }}
    >
      <Drawer.Screen name="Dashboard" component={ClientDashboardScreen} />
      <Drawer.Screen name="My Bikes" component={MyBikesScreen} />
      <Drawer.Screen name="Service History" component={ServiceHistoryScreen} />
      <Drawer.Screen name="Invoices" component={ClientInvoicesScreen} />
      <Drawer.Screen name="Notifications" component={ClientNotificationsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
