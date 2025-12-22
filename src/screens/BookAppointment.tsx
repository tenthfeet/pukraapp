import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Api from '../utils/Api';
import API_URLS from '../config/API_URLS';

interface FormState {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  symptoms: string;
  description: string;
}

type PickerMode = 'date' | 'time' | null;

const BookAppointment: React.FC = () => {
  const navigation = useNavigation();
  const [btnLoading, setBtnLoading] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    symptoms: '',
    description: '',
  });

  const handleChange = (key: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  /* ================= SUBMIT APPOINTMENT ================= */

  const submitAppointment = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.date ||
      !formData.time
    ) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      setBtnLoading(true);
      console.log('Appointment form data', formData);

      const result = await Api.post(API_URLS.APPOINTMENTS, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date, // YYYY-MM-DD
        time: formData.time, // HH:mm
        symptoms: formData.symptoms,
        description: formData.description,
      });

      console.log('Appointment API result', result);

      Alert.alert(
        '✅ Appointment Booked',
        'Our team will contact you shortly.',
      );

      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        symptoms: '',
        description: '',
      });
    } catch (error: any) {
      console.log(error?.response?.data);
      Alert.alert('❌ Failed', 'Please try again later');
    } finally {
      setBtnLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#606C32" />
          </TouchableOpacity>

          <Text style={styles.title}>Book Appointment</Text>
        </View>

        <Text style={styles.subtitle}>
          Your easy Hospital Guide, All in One Place
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Patient Name"
        value={formData.name}
        onChangeText={t => handleChange('name', t)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={formData.email}
        onChangeText={t => handleChange('email', t)}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={t => handleChange('phone', t)}
      />

      {/* DATE */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setPickerMode('date')}
      >
        <Text>{formData.date || 'Select Date'}</Text>
      </TouchableOpacity>

      {/* TIME */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setPickerMode('time')}
      >
        <Text>{formData.time || 'Select Time'}</Text>
      </TouchableOpacity>

      {/* SINGLE PICKER (HOOK SAFE) */}
      {pickerMode && (
        <DateTimePicker
          value={new Date()}
          mode={pickerMode}
          is24Hour
          display="default"
          onChange={(event, selectedDate) => {
            setPickerMode(null);
            if (!selectedDate) return;

            if (pickerMode === 'date') {
              handleChange('date', selectedDate.toISOString().split('T')[0]);
            } else {
              handleChange('time', selectedDate.toTimeString().slice(0, 5));
            }
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Symptoms"
        value={formData.symptoms}
        onChangeText={t => handleChange('symptoms', t)}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        multiline
        value={formData.description}
        onChangeText={t => handleChange('description', t)}
      />

      <TouchableOpacity
        style={[styles.button, btnLoading && styles.disabledButton]}
        onPress={submitAppointment}
        disabled={btnLoading}
      >
        {btnLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit Appointment</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default BookAppointment;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginBottom: 12,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#606C32',
  },

  subtitle: {
    marginTop: 4,
    marginLeft: 34,
    fontSize: 13,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#606C32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
