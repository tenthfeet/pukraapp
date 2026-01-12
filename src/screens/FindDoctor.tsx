import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Api from '../utils/Api';
import API_URLS from '../config/API_URLS';

const { width } = Dimensions.get('window');

interface Doctor {
  name: string;
  degree: string;
  role: string;
  img: string;
}

const FindDoctor: React.FC = () => {
  const navigation = useNavigation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [showProfile, setShowProfile] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    symptoms: '',
    description: '',
  });

  /* ================= FETCH DOCTORS ================= */

  useEffect(() => {
    Api.get(API_URLS.DOCTORS)
      .then(res => {
        const mapped = res.data.doctors.map((doc: any) => ({
          name: doc.name,
          degree: doc.qualification || '',
          role: doc.specialization || '',
          img: doc.photo?.original_url
            ? doc.photo.original_url.replace(
                'http://localhost:8000',
                API_URLS.BASE_URL,
              )
            : 'https://via.placeholder.com/300',
        }));

        setDoctors(mapped);
        setFilteredDoctors(mapped);
      })
      .catch(() => Alert.alert('Error', 'Failed to load doctors'))
      .finally(() => setLoading(false));
  }, []);

  /* ================= FILTER ================= */

  useEffect(() => {
    const s = searchTerm.toLowerCase();
    setFilteredDoctors(
      doctors.filter(
        doc =>
          doc.name.toLowerCase().includes(s) ||
          doc.role.toLowerCase().includes(s) ||
          doc.degree.toLowerCase().includes(s),
      ),
    );
  }, [searchTerm, doctors]);

  /* ================= SUBMIT APPOINTMENT ================= */

  const submitAppointment = async () => {
    if (!selectedDoctor) return;

    if (!form.name || !form.email || !form.phone || !form.date || !form.time) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    try {
      setBtnLoading(true);
      console.log('Appointments form data', form);

      var result = await Api.post(API_URLS.APPOINTMENTS, {
        doctor_name: selectedDoctor.name,
        name: form.name,
        email: form.email,
        phone: form.phone,
        date: form.date, // YYYY-MM-DD
        time: form.time, // HH:mm ✅
        symptoms: form.symptoms,
        description: form.description,
      });
      console.log('Appointments api result', result);

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
        time: '',
        symptoms: '',
        description: '',
      });
    } catch (err: any) {
      console.log(err?.response?.data);
      Alert.alert('❌ Failed', 'Please try again later');
    } finally {
      setBtnLoading(false);
    }
  };

  /* ================= RENDER DOCTOR CARD ================= */

  const renderDoctor = ({ item }: { item: Doctor }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.img }} style={styles.img} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.degree}>{item.degree}</Text>
      <Text style={styles.role}>{item.role}</Text>

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.outlinedBtn}
          onPress={() => {
            setSelectedDoctor(item);
            setShowProfile(true);
          }}
        >
          <Text style={styles.outlinedText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlinedBtn}
          onPress={() => {
            setSelectedDoctor(item);
            setShowPopup(true);
          }}
        >
          <Text style={styles.outlinedText}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ================= UI ================= */

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#606C32" />
        </TouchableOpacity>

        <Text style={styles.title}>Find a Doctor</Text>
      </View>

      <View style={styles.searchWrapper}>
        <Icon
          name="search"
          size={20}
          color="#888"
          style={{ marginHorizontal: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, degree or speciality"
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredDoctors}
          renderItem={renderDoctor}
          keyExtractor={(_, i) => i.toString()}
          numColumns={2}
          scrollEnabled={false}
        />
      )}

      {/* ================= BOOKING MODAL ================= */}

      <Modal visible={showPopup} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Book with {selectedDoctor?.name}
            </Text>

            <TextInput
              placeholder="Patient Name"
              placeholderTextColor="#888"
              style={styles.input}
              value={form.name}
              onChangeText={t => setForm({ ...form, name: t })}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="#888"
              style={styles.input}
              keyboardType="email-address"
              value={form.email}
              onChangeText={t => setForm({ ...form, email: t })}
            />

            <TextInput
              placeholder="Phone"
              placeholderTextColor="#888"
              style={styles.input}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={t => setForm({ ...form, phone: t })}
            />

            {/* DATE */}
            <TouchableOpacity
              style={styles.iconInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={[styles.inputText, !form.date && styles.placeholderText]}
              >
                {form.date || 'Select Date'}
              </Text>
              <Icon name="calendar-outline" size={20} color="#606C32" />
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

            {/* TIME */}
            <TouchableOpacity
              style={styles.iconInput}
              onPress={() => setShowTimePicker(true)}
            >
              <Text
                style={[styles.inputText, !form.time && styles.placeholderText]}
              >
                {form.time || 'Select Time'}
              </Text>
              <Icon name="time-outline" size={20} color="#606C32" />
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                onChange={(e, t) => {
                  setShowTimePicker(false);
                  if (t) {
                    setForm({
                      ...form,
                      time: t.toTimeString().slice(0, 5), // ✅ FIX
                    });
                  }
                }}
              />
            )}

            <TextInput
              placeholder="Symptoms"
              placeholderTextColor="#888"
              style={styles.input}
              value={form.symptoms}
              onChangeText={t => setForm({ ...form, symptoms: t })}
            />

            <TextInput
              placeholder="Description"
              placeholderTextColor="#888"
              multiline
              style={[styles.input, { height: 90 }]}
              value={form.description}
              onChangeText={t => setForm({ ...form, description: t })}
            />

            <TouchableOpacity
              style={styles.mainBtn}
              onPress={submitAppointment}
              disabled={btnLoading}
            >
              <Text style={{ color: '#fff' }}>
                {btnLoading ? 'Processing...' : 'Submit'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowPopup(false)}>
              <Text style={{ color: 'red', marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default FindDoctor;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  title: { fontSize: 26, fontWeight: 'bold', color: '#606C32' },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginVertical: 10,
    paddingHorizontal: 8,
  },

  searchInput: {
    flex: 1,
    height: 40,
    color: '#000', // typed text color
    fontSize: 16,
  },

  card: {
    backgroundColor: '#fff',
    width: width / 2 - 24,
    margin: 8,
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
  },

  img: { width: '100%', height: 140, borderRadius: 12 },

  name: { fontWeight: 'bold', marginTop: 6 },
  degree: { fontSize: 12, color: '#555' },
  role: { color: '#606C32', fontWeight: '600' },

  btnRow: { flexDirection: 'row', marginTop: 10 },

  outlinedBtn: {
    borderWidth: 1,
    borderColor: '#606C32',
    padding: 6,
    borderRadius: 20,
    marginHorizontal: 4,
  },

  outlinedText: { color: '#606C32', fontSize: 12 },

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
    alignItems: 'center',
  },

  modalTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },

  profileImg: { width: 120, height: 120, borderRadius: 60 },

  profileName: { fontSize: 20, fontWeight: 'bold', color: '#606C32' },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: '#fff',
    color: '#000',
  },

  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: '#fff',
  },

  inputText: {
    fontSize: 16,
    color: '#000',
  },

  placeholderText: {
    color: '#888',
  },

  mainBtn: {
    backgroundColor: '#606C32',
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
});
