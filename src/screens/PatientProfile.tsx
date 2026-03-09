import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PatientApi from '../utils/Patient_Api';
import API_URLS from '../config/API_URLS';

// Types
interface User {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  place: string;
  image: any;
  preview: string | null;
}

interface Passwords {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
type PickerMode = 'date' | null;

const PatientProfile: React.FC = () => {
  const navigation = useNavigation<any>();
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    place: '',
    image: null,
    preview: null,
  });

  const [passwords, setPasswords] = useState<Passwords>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
  };

  // Helper: Replace localhost with BASE_URL
  const fixUrl = (url: string | null) => {
    if (!url) return null;
    return url.replace('http://localhost:8000', API_URLS.BASE_URL);
  };

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await PatientApi.get(API_URLS.PATIENT_PROFILE);
        const imageUrl = fixUrl(data.photo?.original_url || data.image || null);

        setUser({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dob: data.dob || '',
          gender: data.gender || '',
          address: data.address || '',
          place: data.place || '',
          image: null,
          preview: imageUrl,
        });
      } catch (err) {
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setPageLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Input Change
  const handleInputChange = (name: keyof User, value: string) => {
    setUser({ ...user, [name]: value });
  };

  // Pick Image
  const handleImagePick = async () => {
    if (!isEditing) return;

    const result = await launchImageLibrary({ mediaType: 'photo' });

    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setUser({
        ...user,
        image: asset,
        preview: asset.uri || null,
      });
    }
  };

  // Update Profile
  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('phone', user.phone);
      formData.append('dob', user.dob);
      formData.append('gender', user.gender);
      formData.append('address', user.address);
      formData.append('place', user.place);

      if (user.image) {
        formData.append('image', {
          uri: user.image.uri,
          type: user.image.type,
          name: user.image.fileName,
        } as any);
      }

      formData.append('_method', 'PUT');

      const { data } = await PatientApi.post(
        API_URLS.PATIENT_PROFILE,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      const updatedImageUrl = fixUrl(data.patient?.photo?.original_url || null);

      setUser({
        ...user,
        ...data.patient,
        preview: updatedImageUrl,
        image: null,
      });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handlePasswordUpdate = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await PatientApi.put(API_URLS.PATIENT_CHANGE_PASSWORD, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
        newPassword_confirmation: passwords.confirmPassword,
      });

      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      Alert.alert('Success', 'Password updated');
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Password update failed',
      );
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await PatientApi.post(API_URLS.PATIENT_LOGOUT);
      await AsyncStorage.removeItem('patientToken');
      await AsyncStorage.removeItem('isPatientLoggedIn');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      console.error('Logout failed', err);
      await AsyncStorage.removeItem('patientToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  // Page Loader
  if (pageLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={24} color="#606C32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Profile</Text>
      </View>

      {/* Avatar */}
      <TouchableOpacity onPress={handleImagePick} style={styles.avatarBox}>
        {user.preview ? (
          <Image source={{ uri: user.preview }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <Icon name="edit" size={22} color="#1e3a8a" style={styles.editIcon} />
      </TouchableOpacity>

      {/* Form */}
      <TextInput
        value={user.name}
        editable={isEditing}
        onChangeText={v => handleInputChange('name', v)}
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#888"
      />
      <TextInput
        value={user.email}
        editable={false}
        style={styles.inputDisabled}
        placeholder="Email"
        placeholderTextColor="#888"
      />
      <TextInput
        value={user.phone}
        editable={isEditing}
        onChangeText={v => handleInputChange('phone', v)}
        style={styles.input}
        placeholder="Phone"
        placeholderTextColor="#888"
      />
      {/* DOB Field */}
      <TouchableOpacity
        style={styles.inputIconWrapper}
        onPress={() => isEditing && setPickerMode('date')} // only editable in edit mode
      >
        <Icon name="calendar" size={20} color="#888" style={styles.inputIcon} />
        <Text
          style={{ color: user.dob ? '#000' : '#888', fontSize: 16, flex: 1 }}
        >
          {user.dob ? formatDate(user.dob) : 'Select DOB'}
        </Text>
      </TouchableOpacity>

      {/* Single Date Picker */}
      {pickerMode && (
        <DateTimePicker
          value={user.dob ? new Date(user.dob) : new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setPickerMode(null);
            if (event.type === 'set' && selectedDate) {
              const formatted = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
              handleInputChange('dob', formatted);
            }
          }}
        />
      )}
      {/* Gender Picker */}
      <View style={[styles.input, { justifyContent: 'center' }]}>
        {isEditing ? (
          <Picker
            selectedValue={user.gender}
            onValueChange={value => handleInputChange('gender', value)}
            mode="dropdown"
            style={{ color: '#000', width: '100%' }}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Others" value="Others" />
          </Picker>
        ) : (
          <Text style={{ fontSize: 16, color: '#000' }}>
            {user.gender || '-'}
          </Text>
        )}
      </View>
      <TextInput
        value={user.place}
        editable={isEditing}
        onChangeText={v => handleInputChange('place', v)}
        style={styles.input}
        placeholder="Place"
        placeholderTextColor="#888"
      />
      <TextInput
        value={user.address}
        editable={isEditing}
        onChangeText={v => handleInputChange('address', v)}
        style={styles.textArea}
        placeholder="Address"
        placeholderTextColor="#888"
        multiline
      />

      {/* Buttons */}
      {isEditing ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {/* Update Button */}
          <TouchableOpacity
            style={[styles.updateBtn, { flex: 1, marginRight: 8 }]}
            onPress={handleProfileUpdate}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Update Profile</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.cancelBtn, { flex: 1 }]}
            onPress={() => {
              // Reset user state to last fetched profile
              setIsEditing(false);
              setPageLoading(true);
              PatientApi.get(API_URLS.PATIENT_PROFILE)
                .then(({ data }) => {
                  const imageUrl = fixUrl(
                    data.photo?.original_url || data.image || null,
                  );
                  setUser({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    dob: data.dob || '',
                    gender: data.gender || '',
                    address: data.address || '',
                    place: data.place || '',
                    image: null,
                    preview: imageUrl,
                  });
                })
                .finally(() => setPageLoading(false));
            }}
          >
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.btnText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      {!showPasswordForm && (
        <TouchableOpacity
          style={styles.passwordBtn}
          onPress={() => setShowPasswordForm(true)}
        >
          <Text style={styles.btnText}>Change Password</Text>
        </TouchableOpacity>
      )}

      {/* <TouchableOpacity
        style={styles.passwordBtn}
        onPress={() => navigation.navigate('MyAppointments')}
      >
        <Text style={styles.btnText}>My Booked Appointments</Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.passwordBtn} onPress={handleLogout}>
        <Text style={styles.btnText}>Log Out</Text>
      </TouchableOpacity>

      {showPasswordForm && (
        <View style={styles.passwordForm}>
          <View style={styles.passwordHeader}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <TouchableOpacity onPress={() => setShowPasswordForm(false)}>
              <Icon name="x" size={24} color="#dc2626" />
            </TouchableOpacity>
          </View>

          {/* Old Password */}
          <View style={styles.passwordField}>
            <TextInput
              placeholder="Old Password"
              placeholderTextColor="#888"
              secureTextEntry={!showOldPassword}
              style={styles.inputWithIconPassword}
              onChangeText={v => setPasswords({ ...passwords, oldPassword: v })}
            />
            <TouchableOpacity
              onPress={() => setShowOldPassword(!showOldPassword)}
            >
              <Icon
                name={showOldPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* New Password */}
          <View style={styles.passwordField}>
            <TextInput
              placeholder="New Password"
              placeholderTextColor="#888"
              secureTextEntry={!showNewPassword}
              style={styles.inputWithIconPassword}
              onChangeText={v => setPasswords({ ...passwords, newPassword: v })}
            />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Icon
                name={showNewPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.passwordField}>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#888"
              secureTextEntry={!showConfirmPassword}
              style={styles.inputWithIconPassword}
              onChangeText={v =>
                setPasswords({ ...passwords, confirmPassword: v })
              }
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* Update Password Button */}
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={handlePasswordUpdate}
          >
            <Text style={styles.btnText}>Update Password</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default PatientProfile;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#606C32' },
  avatarBox: { alignSelf: 'center', marginBottom: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
  },
  cancelBtn: {
    backgroundColor: '#dc2626',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    color: '#000',
    fontSize: 16,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#eee',
    color: '#000',
  },

  inputIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 48,
  },

  inputIcon: {
    marginRight: 8,
  },

  inputWithIcon: {
    flex: 1,
    height: '100%',
    color: '#000',
  },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 48,
    justifyContent: 'space-between',
  },

  inputWithIconPassword: {
    flex: 1,
    color: '#000',
    fontSize: 16,
  },

  passwordForm: {
    marginTop: 20,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },

  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    height: 90,
  },
  editBtn: {
    backgroundColor: '#606C32',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  updateBtn: {
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  passwordBtn: {
    backgroundColor: '#15803d',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  btnText: { textAlign: 'center', color: '#fff', fontWeight: '700' },
});
