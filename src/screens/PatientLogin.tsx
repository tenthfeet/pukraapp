import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PatientApi from "../utils/Patient_Api";
import API_URLS from "../config/API_URLS";

const PatientLogin: React.FC = () => {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await PatientApi.post(API_URLS.PATIENT_LOGIN, {
        email,
        password,
      });

      // Store Token Securely
      await AsyncStorage.setItem("patientToken", res.data.token);
      await AsyncStorage.setItem("isPatientLoggedIn", "true");

      Alert.alert("Login Successful");

      // Navigate After Login
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
      
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Login Failed",
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
 <Image
  source={require("../assets/PUKRA-Logo.png")}
  style={styles.logo}
  resizeMode="contain"
/>
        <Text style={styles.title}>Patient Login</Text>

        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        {/* PASSWORD */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledBtn]}
          disabled={loading}
          onPress={handleLogin}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={styles.btnText}> Logging in...</Text>
            </>
          ) : (
            <Text style={styles.btnText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* REGISTER */}
        <Text style={styles.registerText}>
          Create a new account?
          <Text
            style={styles.registerBtn}
            onPress={() => navigation.navigate("Register")}
          >
            {" "}
            Register
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default PatientLogin;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 24,
    borderRadius: 14,
    elevation: 10,
  },

  title: {
    fontSize: 23,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#1D5D9B",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  disabledBtn: {
    opacity: 0.7,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  registerText: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 13,
    color: "#333",
  },

  registerBtn: {
    color: "#2563EB",
    fontWeight: "600",
  },
   logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    // marginBottom: 2,
  },
});
