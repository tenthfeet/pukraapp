import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { RootStackParamList } from '../../App';
import Api from '../utils/Api';
import API_URLS from '../config/API_URLS';

type RouteProps = RouteProp<RootStackParamList, 'DoctorProfile'>;

const DoctorProfile = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { doctorName } = route.params;

  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showPopup, setShowPopup] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    symptoms: '',
    description: '',
  });

  /* FETCH DOCTOR */

  useEffect(() => {
    Api.get(API_URLS.DOCTORS)
      .then(res => {
        const found = res.data.doctors.find(
          (d: any) => d.name === doctorName,
        );

        if (found) {
          found.photoUrl = found.photo?.original_url
            ? found.photo.original_url.replace(
                'http://localhost:8000',
                API_URLS.BASE_URL,
              )
            : 'https://via.placeholder.com/300';

          setDoctor(found);
        }
      })
      .finally(() => setLoading(false));
  }, [doctorName]);

  /* ================= SUBMIT APPOINTMENT ================= */

  const submitAppointment = async () => {
    if (!form.name || !form.email || !form.phone || !form.date) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    try {
      setBtnLoading(true);

      await Api.post(API_URLS.APPOINTMENTS, {
        doctor_name: doctor.name,
        ...form,
      });

      Alert.alert(
        '✅ Appointment Booked',
        'Our team will contact you shortly.',
      );

      setShowPopup(false);
      setForm({
        name: '',
        email: '',
        phone: '',
        date: '',
        symptoms: '',
        description: '',
      });
    } catch {
      Alert.alert('❌ Failed', 'Please try again later');
    } finally {
      setBtnLoading(false);
    }
  };

  /* UI */

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;
  }

  if (!doctor) {
    return (
      <Text style={{ marginTop: 40, textAlign: 'center' }}>
        Doctor not found
      </Text>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#606C32" />
        </TouchableOpacity>

        {/* HERO */}
        <View style={styles.hero}>
          <Image source={{ uri: doctor.photoUrl }} style={styles.image} />

          <Text style={styles.name}>{doctor.name}</Text>
          <Text style={styles.degree}>{doctor.qualification}</Text>
          <Text style={styles.role}>{doctor.specialization}</Text>

          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => setShowPopup(true)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              Book Appointment
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
        {doctor.description && section('About Doctor', doctor.description)}
        {doctor.education && listSection('Education', doctor.education)}
        {doctor.work_experience &&
          listSection('Work Experience', doctor.work_experience)}
        {doctor.clinical_expertise &&
          listSection('Clinical Expertise', doctor.clinical_expertise)}
        {doctor.membership &&
          listSection('Memberships', doctor.membership)}
        {doctor.key_skills &&
          listSection('Key Skills', doctor.key_skills)}
        {doctor.research &&
          listSection(
            'Academics and Clinical Research',
            doctor.research,
          )}
        {doctor.awards &&
          listSection('Honors and Awards', doctor.awards)}
        {doctor.languages_known &&
          section('Languages Known', doctor.languages_known)}
      </ScrollView>

      {/* ================= BOOK APPOINTMENT MODAL ================= */}

      <Modal visible={showPopup} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Book with {doctor.name}
            </Text>

            <TextInput
              placeholder="Patient Name"
              style={styles.input}
              value={form.name}
              onChangeText={t => setForm({ ...form, name: t })}
            />

            <TextInput
              placeholder="Email"
              style={styles.input}
              keyboardType="email-address"
              value={form.email}
              onChangeText={t => setForm({ ...form, email: t })}
            />

            <TextInput
              placeholder="Phone"
              style={styles.input}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={t => setForm({ ...form, phone: t })}
            />

            <TouchableOpacity
              style={styles.iconInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{form.date || 'Select Date'}</Text>
              <Icon name="calendar-outline" size={20} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                onChange={(e, d) => {
                  setShowDatePicker(false);
                  if (d) {
                    setForm({
                      ...form,
                      date: d.toISOString().split('T')[0],
                    });
                  }
                }}
              />
            )}

            <TextInput
              placeholder="Symptoms"
              style={styles.input}
              value={form.symptoms}
              onChangeText={t =>
                setForm({ ...form, symptoms: t })
              }
            />

            <TextInput
              placeholder="Description"
              style={[styles.input, { height: 90 }]}
              multiline
              value={form.description}
              onChangeText={t =>
                setForm({ ...form, description: t })
              }
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={submitAppointment}
              disabled={btnLoading}
            >
              <Text style={{ color: '#fff' }}>
                {btnLoading ? 'Processing...' : 'Submit'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowPopup(false)}>
              <Text style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DoctorProfile;

/* HELPERS */

const section = (title: string, content: string) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.text}>{content}</Text>
  </View>
);

const listSection = (title: string, content: string) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {content.split('\n').map((i, idx) => (
      <Text key={idx} style={styles.text}>• {i}</Text>
    ))}
  </View>
);

/* STYLES */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },

  hero: { alignItems: 'center', marginVertical: 20 },

  image: {
    width: 200,
    height: 240,
    borderRadius: 24,
    marginBottom: 16,
  },

  name: { fontSize: 24, fontWeight: 'bold', color: '#2D3E50' },
  degree: { color: '#555', marginTop: 4 },
  role: { color: '#606C32', fontWeight: '600', marginTop: 4 },

  bookBtn: {
    marginTop: 16,
    backgroundColor: '#606C32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  text: { color: '#444', lineHeight: 20 },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
  },

  modalCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },

  iconInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },

  submitBtn: {
    backgroundColor: '#606C32',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
});
