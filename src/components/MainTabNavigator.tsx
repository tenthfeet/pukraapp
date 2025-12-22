// import React from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import HomeScreen from "../screens/Home";
// import FindDoctorScreen from "../screens/FindDoctor";
// import BookAppointment from "../screens/BookAppointment";
// import ProfileScreen from "../screens/PatientProfile";
// import Ionicons from 'react-native-vector-icons/Ionicons';

// export type BottomTabParamList = {
//   Home: undefined;
//   FindDoctor: undefined;
//   BookAppointment: undefined;
//   Profile: undefined;
// };

// const Tab = createBottomTabNavigator<BottomTabParamList>();

// const MainTabNavigator = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarActiveTintColor: "#1D5D9B",
//         tabBarInactiveTintColor: "#555",
//         tabBarIcon: ({ color, size }) => {
//           let iconName: string = "home";

//           switch (route.name) {
//             case "Home":
//               iconName = "home-outline";
//               break;
//             case "FindDoctor":
//               iconName = "medkit-outline";
//               break;
//             case "BookAppointment":
//               iconName = "calendar-outline";
//               break;
//             case "Profile":
//               iconName = "person-outline";
//               break;
//           }
//           return <Ionicons name={iconName as any} size={size} color={color} />;
//         },
//       })}
//     >
//       <Tab.Screen name="Home" component={HomeScreen} />
//       <Tab.Screen name="FindDoctor" component={FindDoctorScreen} />
//       <Tab.Screen name="BookAppointment" component={BookAppointment} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// };

// export default MainTabNavigator;
import React from "react";
import { Image } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home";
import FindDoctorScreen from "../screens/FindDoctor";
import BookAppointment from "../screens/BookAppointment";
import ProfileScreen from "../screens/PatientProfile";

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
        tabBarActiveTintColor: "#1D5D9B",
        tabBarInactiveTintColor: "#555",
        tabBarIcon: ({ color, size }) => {
          let iconName: string = "home";

          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            case "FindDoctor":
              iconName = "medkit-outline";
              break;
            case "BookAppointment":
              iconName = "calendar-outline";
              break;
            case "Profile":
              iconName = "person-outline";
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
