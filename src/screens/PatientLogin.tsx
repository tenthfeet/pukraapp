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
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PatientApi from '../utils/Patient_Api';
import API_URLS from '../config/API_URLS';

const PatientLogin: React.FC = () => {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // --- Forgot Password Modal State ---
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter email and password');
      return;
    }
    console.log('Attempting login with:', { email, password });
    setLoading(true);

    try {
      console.log('API Urls', API_URLS);

      const res = await PatientApi.post(API_URLS.PATIENT_LOGIN, {
        email,
        password,
      });

      console.log('Login Response', res);
      if (res?.status !== 200) {
        Alert.alert('Login Failed', 'Invalid email or password');
      } else {
        // Store Token Securely
        await AsyncStorage.setItem('patientToken', res.data.token);
        await AsyncStorage.setItem('isPatientLoggedIn', 'true');

        // Alert.alert('Login Successful');

        // Navigate After Login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'Login Failed',
        err.response?.data?.message || 'Invalid email or password',
      );
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD ---
  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert('Validation Error', 'Enter your registered email');
      return;
    }
    setResetLoading(true);
    setResetMessage('');

    try {
      const res = await PatientApi.post(API_URLS.PATIENT_FORGOT_PASSWORD, {
        email: resetEmail,
      });

      // Set success message
      setResetMessage(res.data.message || 'Reset link sent! Check your email.');

      // CLEAR the email field after sending
      setResetEmail('');
    } catch (err: any) {
      setResetMessage(err.response?.data?.message || 'Something went wrong');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Image
          source={require('../assets/PUKRA-Hospial Logo-enggg.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>LOGIN</Text>

        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#777"
          keyboardType="email-address"
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        {/* PASSWORD */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#777"
            secureTextEntry={!showPassword}
            underlineColorAndroid="transparent"
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#555"
            />
          </TouchableOpacity>
        </View>

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

        {/* FORGOT PASSWORD */}
        <TouchableOpacity
          style={{ alignSelf: 'flex-end', marginTop: 8 }}
          onPress={() => setShowForgotModal(true)}
        >
          <Text style={{ color: '#606C32', textDecorationLine: 'underline' }}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* REGISTER */}
        <Text style={styles.registerText}>
          Create a new account?
          <Text
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
          >
            {' '}
            Register
          </Text>
        </Text>
      </View>
      {/* --- FORGOT PASSWORD MODAL --- */}
      <Modal visible={showForgotModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.card, { width: '85%' }]}>
            <TouchableOpacity
              style={{ alignSelf: 'flex-end' }}
              onPress={() => {
                setShowForgotModal(false);
                setResetMessage('');
              }}
            >
              <Text style={{ fontSize: 18 }}>✕</Text>
            </TouchableOpacity>

            <Text style={[styles.title, { fontSize: 20, marginBottom: 12 }]}>
              Forgot Password
            </Text>

            <TextInput
              placeholder="Enter your registered email"
              placeholderTextColor="#777"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              value={resetEmail}
              onChangeText={setResetEmail}
            />

            <TouchableOpacity
              style={[styles.button, resetLoading && styles.disabledBtn]}
              disabled={resetLoading}
              onPress={handleForgotPassword}
            >
              {resetLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            {resetMessage.length > 0 && (
              <Text style={{ textAlign: 'center', marginTop: 8 }}>
                {resetMessage}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PatientLogin;

/* STYLES */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 24,
    borderRadius: 14,
    elevation: 10,
  },

  title: {
    fontSize: 23,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
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
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#000',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#000', // TEXT COLOR BLACK
  },

  button: {
    backgroundColor: '#606C32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },

  disabledBtn: {
    opacity: 0.7,
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  registerText: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 13,
    color: '#333',
  },

  registerBtn: {
    color: '#606C32',
    fontWeight: '600',
  },
});
