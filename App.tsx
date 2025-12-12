import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PatientLogin from "./src/screens/PatientLogin";
import PatientRegister from "./src/screens/PatientRegister";
import MainTabNavigator from "./src/components/MainTabNavigator";
import PatientDashboard from "./src/screens/PatientDashboard";
import LabResults from "./src/screens/LabResults";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  PatientDashboard: undefined;
  LabResult: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={PatientLogin} />
        <Stack.Screen name="Register" component={PatientRegister} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="PatientDashboard" component={PatientDashboard} />
        <Stack.Screen name="LabResult" component={LabResults} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
