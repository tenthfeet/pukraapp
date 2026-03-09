import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import PatientApi from '../utils/Patient_Api';
import API_URLS from '../config/API_URLS';

const ITEMS_PER_PAGE = 5;

const BookAppointment: React.FC = () => {
  const navigation = useNavigation<any>();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalVisible, setModalVisible] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    symptoms: '',
    description: '',
  });

  /* ================= FETCH APPOINTMENTS ================= */

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await PatientApi.get(API_URLS.MY_APPOINTMENTS);
      setAppointments(response.data?.appointments || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  /* ================= SUBMIT APPOINTMENT ================= */

  const submitAppointment = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.date
    ) {
      Alert.alert('Validation Error', 'Please fill required fields');
      return;
    }

    try {
      setBtnLoading(true);

      await PatientApi.post(API_URLS.APPOINTMENTS, formData);

      Alert.alert(
        '✅ Appointment Booked',
        'Our team will contact you shortly.',
      );

      setModalVisible(false);
      fetchAppointments();

      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        symptoms: '',
        description: '',
      });
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setBtnLoading(false);
    }
  };

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  const paginatedData = appointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  /* ================= RENDER CARD ================= */

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.title}>👤 Patient: {item.name}</Text>
      <Text style={styles.text}>
        🕒 Booking Date:{' '}
        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
      </Text>
      <Text style={styles.text}>📅 Appointment Date: {item.date}</Text>
      <Text style={styles.text}>
        🩺 Doctor: {item.doctor_name || 'Not Assigned'}
      </Text>
      <Text style={styles.text}>📞 Phone: {item.phone}</Text>
      <Text style={styles.text}>✉ Email: {item.email}</Text>
      <Text style={styles.text}>🤒 Symptoms: {item.symptoms || '-'}</Text>
      <Text style={styles.text}>📝 Description: {item.description || '-'}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#606C32" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#606C32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Appointments</Text>
        </View>

        {/* BOOK BUTTON */}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.bookButtonText}>+ Book Appointment</Text>
        </TouchableOpacity>

        {appointments.length === 0 ? (
          <Text style={styles.noData}>No appointments found.</Text>
        ) : (
          <>
            <FlatList
              data={paginatedData}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 20 }}
            />

            {/* PAGINATION */}
            <View style={styles.pagination}>
              <TouchableOpacity
                disabled={currentPage === 1}
                onPress={() => setCurrentPage(prev => prev - 1)}
                style={[
                  styles.iconButton,
                  currentPage === 1 && styles.disabledButton,
                ]}
              >
                <Icon
                  name="chevron-back"
                  size={22}
                  color={currentPage === 1 ? '#999' : '#fff'}
                />
              </TouchableOpacity>

              <Text style={styles.pageNumber}>
                {currentPage} / {totalPages || 1}
              </Text>

              <TouchableOpacity
                disabled={currentPage >= totalPages}
                onPress={() => setCurrentPage(prev => prev + 1)}
                style={[
                  styles.iconButton,
                  currentPage >= totalPages && styles.disabledButton,
                ]}
              >
                <Icon
                  name="chevron-forward"
                  size={22}
                  color={currentPage >= totalPages ? '#999' : '#fff'}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* ================= MODAL ================= */}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book Appointment</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color="#606C32" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Patient Name"
                value={formData.name}
                onChangeText={t => setFormData({ ...formData, name: t })}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={t => setFormData({ ...formData, email: t })}
              />

              <TextInput
                style={styles.input}
                placeholder="Phone"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={t => setFormData({ ...formData, phone: t })}
              />

              <TouchableOpacity
                style={styles.iconInput}
                onPress={() => setPickerMode('date')}
              >
                <Text style={{ color: formData.date ? '#000' : '#777' }}>
                  {formData.date || 'Select Date'}
                </Text>
                <Icon name="calendar-outline" size={20} color="#606C32" />
              </TouchableOpacity>

              {pickerMode && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setPickerMode(null);
                    if (selectedDate) {
                      setFormData({
                        ...formData,
                        date: selectedDate.toISOString().split('T')[0],
                      });
                    }
                  }}
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Symptoms"
                value={formData.symptoms}
                onChangeText={t => setFormData({ ...formData, symptoms: t })}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                multiline
                value={formData.description}
                onChangeText={t => setFormData({ ...formData, description: t })}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={submitAppointment}
              >
                {btnLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit Appointment</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#606C32',
  },
  card: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
  noData: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#777',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  pageNumber: {
    fontWeight: 'bold',
  },
  iconButton: {
    backgroundColor: '#606C32',
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  bookButton: {
    backgroundColor: '#606C32',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#606C32',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  iconInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
