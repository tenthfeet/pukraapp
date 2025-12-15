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
import { launchImageLibrary } from 'react-native-image-picker';
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

const PatientProfile: React.FC = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

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

  const [originalUser, setOriginalUser] = useState<User | null>(null);

  const [passwords, setPasswords] = useState<Passwords>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
      setOriginalUser(null);
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
      <Text style={styles.title}>Patient Profile</Text>

      {/* Avatar */}
      <TouchableOpacity onPress={handleImagePick} style={styles.avatarBox}>
        {user.preview ? (
          <Image source={{ uri: user.preview }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0)?.toUpperCase()}
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
      />

      <TextInput
        value={user.email}
        editable={false}
        style={styles.inputDisabled}
      />

      <TextInput
        value={user.phone}
        editable={isEditing}
        onChangeText={v => handleInputChange('phone', v)}
        style={styles.input}
        placeholder="Phone"
      />

      <TextInput
        value={user.dob}
        editable={isEditing}
        onChangeText={v => handleInputChange('dob', v)}
        style={styles.input}
        placeholder="DOB (YYYY-MM-DD)"
      />

      <TextInput
        value={user.gender}
        editable={isEditing}
        onChangeText={v => handleInputChange('gender', v)}
        style={styles.input}
        placeholder="Gender"
      />

      <TextInput
        value={user.place}
        editable={isEditing}
        onChangeText={v => handleInputChange('place', v)}
        style={styles.input}
        placeholder="Place"
      />

      <TextInput
        value={user.address}
        editable={isEditing}
        onChangeText={v => handleInputChange('address', v)}
        style={styles.textArea}
        placeholder="Address"
        multiline
      />

      {/* Buttons */}
      {isEditing ? (
        <TouchableOpacity
          style={styles.updateBtn}
          onPress={handleProfileUpdate}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Update Profile</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => {
            setOriginalUser({ ...user });
            setIsEditing(true);
          }}
        >
          <Text style={styles.btnText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      {/* Change Password */}
      {!showPasswordForm && (
        <TouchableOpacity
          style={styles.passwordBtn}
          onPress={() => setShowPasswordForm(true)}
        >
          <Text style={styles.btnText}>Change Password</Text>
        </TouchableOpacity>
      )}

      {showPasswordForm && (
        <>
          <TextInput
            placeholder="Old Password"
            secureTextEntry
            style={styles.input}
            onChangeText={v => setPasswords({ ...passwords, oldPassword: v })}
          />
          <TextInput
            placeholder="New Password"
            secureTextEntry
            style={styles.input}
            onChangeText={v => setPasswords({ ...passwords, newPassword: v })}
          />
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            style={styles.input}
            onChangeText={v =>
              setPasswords({ ...passwords, confirmPassword: v })
            }
          />

          <TouchableOpacity
            style={styles.updateBtn}
            onPress={handlePasswordUpdate}
          >
            <Text style={styles.btnText}>Update Password</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

export default PatientProfile;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#eee',
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
    backgroundColor: '#1e3a8a',
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
