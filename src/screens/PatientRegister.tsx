import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
<<<<<<< HEAD
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PatientApi from "../utils/Patient_Api";
import API_URLS from "../config/API_URLS";
=======
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PatientApi from '../utils/Patient_Api';
import API_URLS from '../config/API_URLS';
>>>>>>> 49be0b43cc69b6855ef8cc21d57304c6f6261bd2

// Navigation Type
type RootStackParamList = {
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PatientRegister() {
  const navigation = useNavigation<NavigationProp>();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = async () => {
    if (
      !user.name ||
      !user.email ||
      !user.phone ||
      !user.password ||
      !user.confirmPassword
    ) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (user.password !== user.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      // API Register
      await PatientApi.post(API_URLS.PATIENT_REGISTER, {
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: user.password,
        password_confirmation: user.confirmPassword,
      });

      Alert.alert('Success', 'Registration successful!');
      navigation.navigate('Login');
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'Registration Failed',
        err?.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.overlay}
    >
      <View style={styles.card}>
        <Image
<<<<<<< HEAD
          source={require("../assets/PUKRA-Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        
        
=======
          source={require('../assets/PUKRA-Hospial Logo-enggg.png')}
          style={styles.logo}
          resizeMode="contain"
        />
>>>>>>> 49be0b43cc69b6855ef8cc21d57304c6f6261bd2
        <Text style={styles.title}>Patient Registration</Text>

        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={user.name}
          onChangeText={text => setUser({ ...user, name: text })}
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          value={user.email}
          onChangeText={text => setUser({ ...user, email: text })}
        />

        <TextInput
          placeholder="Phone"
          style={styles.input}
          keyboardType="phone-pad"
          value={user.phone}
          onChangeText={text => setUser({ ...user, phone: text })}
        />

        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={user.password}
          onChangeText={text => setUser({ ...user, password: text })}
        />

        <TextInput
          placeholder="Confirm Password"
          style={styles.input}
          secureTextEntry
          value={user.confirmPassword}
          onChangeText={text => setUser({ ...user, confirmPassword: text })}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.disabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Login
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },

  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    // marginBottom: 2,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1D5D9B',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 14,
  },
  link: {
    color: '#1D5D9B',
    fontWeight: 'bold',
  },
   logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    // marginBottom: 2,
  },
});
