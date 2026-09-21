import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MechanicDashboardScreen } from "../screens/mechanic/DashboardScreen";
import { CustomersScreen } from "../screens/mechanic/CustomersScreen";
import { BikesScreen } from "../screens/mechanic/BikesScreen";
import { ServicesScreen } from "../screens/mechanic/ServicesScreen";
import { SparePartsScreen } from "../screens/mechanic/SparePartsScreen";
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
      <Drawer.Screen name="Customers" component={CustomersScreen} />
      <Drawer.Screen name="Bikes" component={BikesScreen} />
      <Drawer.Screen name="Services" component={ServicesScreen} />
      <Drawer.Screen name="Spare Parts" component={SparePartsScreen} />
      <Drawer.Screen name="Invoices" component={InvoicesScreen} />
      <Drawer.Screen name="Follow-ups" component={FollowUpsScreen} />
      <Drawer.Screen name="Notifications" component={MechanicNotificationsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}
