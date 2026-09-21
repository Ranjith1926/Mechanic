import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BikesListScreen } from "../screens/mechanic/BikesListScreen";
import { BikeDetailScreen } from "../screens/BikeDetailScreen";

export type BikesStackParamList = {
  BikesList: undefined;
  BikeDetail: { bikeId: number };
};

const Stack = createNativeStackNavigator<BikesStackParamList>();

export function BikesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="BikesList" component={BikesListScreen} options={{ title: "Bikes" }} />
      <Stack.Screen name="BikeDetail" component={BikeDetailScreen} options={{ title: "Bike History" }} />
    </Stack.Navigator>
  );
}
