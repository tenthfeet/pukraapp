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
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PatientApi from '../utils/Patient_Api';
import API_URLS from '../config/API_URLS';

// Navigation Type
type RootStackParamList = {
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PatientRegister() {
  const navigation = useNavigation<NavigationProp>();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
          source={require('../assets/PUKRA-Hospial Logo-enggg.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>REGISTER</Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#777"
          underlineColorAndroid="transparent"
          style={styles.input}
          value={user.name}
          onChangeText={text => setUser({ ...user, name: text })}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#777"
          underlineColorAndroid="transparent"
          style={styles.input}
          keyboardType="email-address"
          value={user.email}
          onChangeText={text => setUser({ ...user, email: text })}
        />

        <TextInput
          placeholder="Phone"
          placeholderTextColor="#777"
          underlineColorAndroid="transparent"
          style={styles.input}
          keyboardType="phone-pad"
          value={user.phone}
          onChangeText={text => setUser({ ...user, phone: text })}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#777"
            secureTextEntry={!showPassword}
            underlineColorAndroid="transparent"
            style={styles.passwordInput}
            value={user.password}
            onChangeText={text => setUser({ ...user, password: text })}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#555"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#777"
            secureTextEntry={!showConfirmPassword}
            underlineColorAndroid="transparent"
            style={styles.passwordInput}
            value={user.confirmPassword}
            onChangeText={text => setUser({ ...user, confirmPassword: text })}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Icon
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#555"
            />
          </TouchableOpacity>
        </View>

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
    color: '#606C32',
  },

  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    // marginBottom: 2,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    color: '#000',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#000', // TEXT COLOR BLACK
  },

  button: {
    backgroundColor: '#606C32',
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
    color: '#606C32',
    fontWeight: 'bold',
  },
});
