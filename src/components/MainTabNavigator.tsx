import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home";
import FindDoctorScreen from "../screens/FindDoctor";
import BookAppointment from "../screens/BookAppointment";
import ProfileScreen from "../screens/PatientProfile";
import Ionicons from 'react-native-vector-icons/Ionicons';

export type BottomTabParamList = {
  Home: undefined;
  FindDoctor: undefined;
  BookAppointment: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#606C32", // Active icon color
        tabBarInactiveTintColor: "#555",  // Inactive icon color
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "FindDoctor":
              iconName = focused ? "medkit" : "medkit-outline";
              break;
            case "BookAppointment":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="FindDoctor" component={FindDoctorScreen} />
      <Tab.Screen name="BookAppointment" component={BookAppointment} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
