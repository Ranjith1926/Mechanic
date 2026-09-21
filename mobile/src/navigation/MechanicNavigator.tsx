import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MechanicDashboardScreen } from "../screens/mechanic/DashboardScreen";
import { CustomersStack } from "./CustomersStack";
import { BikesStack } from "./BikesStack";
import { ServicesStack } from "./ServicesStack";
import { SparePartsCatalogScreen } from "../screens/mechanic/SparePartsCatalogScreen";
import { InvoicesScreen } from "../screens/mechanic/InvoicesScreen";
import { FollowUpsScreen } from "../screens/mechanic/FollowUpsScreen";
import { MechanicNotificationsScreen } from "../screens/mechanic/NotificationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { colors } from "../theme";

export type MechanicDrawerParamList = {
  Dashboard: undefined;
  Customers: undefined;
  Bikes: undefined;
  Services: undefined;
  "Spare Parts": undefined;
  Invoices: undefined;
  "Follow-ups": undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator<MechanicDrawerParamList>();

export function MechanicNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerTintColor: colors.text,
        drawerActiveTintColor: colors.primary,
        drawerActiveBackgroundColor: "#eff6ff",
      }}
    >
      <Drawer.Screen name="Dashboard" component={MechanicDashboardScreen} />
      <Drawer.Screen name="Customers" component={CustomersStack} options={{ headerShown: false }} />
      <Drawer.Screen name="Bikes" component={BikesStack} options={{ headerShown: false }} />
      <Drawer.Screen name="Services" component={ServicesStack} options={{ headerShown: false }} />
      <Drawer.Screen name="Spare Parts" component={SparePartsCatalogScreen} />
      <Drawer.Screen name="Invoices" component={InvoicesScreen} />
      <Drawer.Screen name="Follow-ups" component={FollowUpsScreen} />
      <Drawer.Screen name="Notifications" component={MechanicNotificationsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
