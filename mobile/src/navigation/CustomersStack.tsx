import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CustomersListScreen } from "../screens/mechanic/CustomersListScreen";
import { CustomerBikesScreen } from "../screens/mechanic/CustomerBikesScreen";
import { BikeDetailScreen } from "../screens/BikeDetailScreen";

export type CustomersStackParamList = {
  CustomersList: undefined;
  CustomerBikes: { clientId: number; clientName: string };
  BikeDetail: { bikeId: number };
};

const Stack = createNativeStackNavigator<CustomersStackParamList>();

export function CustomersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CustomersList" component={CustomersListScreen} options={{ title: "Customers" }} />
      <Stack.Screen
        name="CustomerBikes"
        component={CustomerBikesScreen}
        options={({ route }) => ({ title: route.params.clientName })}
      />
      <Stack.Screen name="BikeDetail" component={BikeDetailScreen} options={{ title: "Bike History" }} />
    </Stack.Navigator>
  );
}
