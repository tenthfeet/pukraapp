import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import PatientApi from '../utils/Patient_Api';
import API_URLS from '../config/API_URLS';

const ITEMS_PER_PAGE = 5;

const MyAppointments: React.FC = () => {
  const navigation = useNavigation<any>();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const response = await PatientApi.get(API_URLS.MY_APPOINTMENTS);

      console.log('MyAppointments response:', response.data);

      setAppointments(response.data?.appointments || []);
    } catch (error: any) {
      console.log('Appointments error:', error?.response?.data);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  const paginatedData = appointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#606C32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>

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

          {/* Pagination Controls */}
          <View style={styles.pagination}>
            {/* Previous Icon */}
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

            {/* Next Icon */}
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
  );
};

export default MyAppointments;

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
    color: '#000',
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
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
  pageButton: {
    backgroundColor: '#606C32',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  pageText: {
    color: '#fff',
  },
  pageNumber: {
    fontWeight: 'bold',
  },
  iconButton: {
    backgroundColor: '#606C32',
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
