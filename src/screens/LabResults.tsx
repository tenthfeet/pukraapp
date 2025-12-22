import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';

// Type
interface LabResult {
  id: number;
  name: string;
  date: string;
  status: 'Completed' | 'Processing' | 'Pending';
  file?: string;
}

// Mock Data
const RESULTS: LabResult[] = [
  {
    id: 1,
    name: 'Blood test reports',
    date: '2025-02-20',
    status: 'Completed',
    file: 'https://www.africau.edu/images/default/sample.pdf',
  },
  {
    id: 2,
    name: 'Scan reports (X-ray, MRI, CT)',
    date: '2025-02-18',
    status: 'Processing',
  },
  {
    id: 3,
    name: 'Urine test results',
    date: '2025-02-10',
    status: 'Pending',
  },
  {
    id: 4,
    name: 'Allergy test results',
    date: '2025-01-30',
    status: 'Completed',
    file: 'https://www.africau.edu/images/default/sample.pdf',
  },
  {
    id: 5,
    name: 'Thyroid function test',
    date: '2025-01-15',
    status: 'Completed',
    file: 'https://www.africau.edu/images/default/sample.pdf',
  },
];

const LabResults: React.FC = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredResults = RESULTS.filter(item => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Open PDF
  const handleView = (url?: string) => {
    if (!url) return;
    Linking.openURL(url);
  };

  // Download PDF
  const handleDownload = async (url?: string) => {
    if (!url) return;

    const fileName = url.split('/').pop();
    const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;

    try {
      await RNFS.downloadFile({
        fromUrl: url,
        toFile: path,
      }).promise;

      Alert.alert('✅ Downloaded', 'Saved to Downloads folder');
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Download failed');
    }
  };

  const renderItem = ({ item }: { item: LabResult }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.date}>📅 {item.date}</Text>

      <Text
        style={[
          styles.status,
          item.status === 'Completed'
            ? styles.completed
            : item.status === 'Processing'
            ? styles.processing
            : styles.pending,
        ]}
      >
        {item.status}
      </Text>

      {item.file ? (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => handleView(item.file)}
          >
            <Icon name="eye" size={20} color="#fff" />
            <Text style={styles.btnText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => handleDownload(item.file)}
          >
            <Icon name="download" size={20} color="#fff" />
            <Text style={styles.btnText}>Download</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.notAvailable}>Not Available</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IonIcon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Lab Results</Text>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search test..."
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      {/* Filter */}
      <View style={styles.filterRow}>
        {['All', 'Completed', 'Pending'].map(item => (
          <TouchableOpacity
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.filterBtn, filter === item && styles.activeFilter]}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.activeFilterText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredResults}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Text style={styles.footer}>
        📌 Reports will be available within 24–48 hours after sample collection.
      </Text>
    </View>
  );
};

export default LabResults;

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },

  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },

  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeFilter: {
    backgroundColor: '#2563eb',
  },
  filterText: {
    fontSize: 13,
  },
  activeFilterText: {
    color: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    marginTop: 4,
    color: '#555',
  },

  status: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
  },

  completed: {
    color: '#166534',
    borderWidth: 1,
    borderColor: '#166534',
  },
  processing: {
    color: '#a16207',
    borderWidth: 1,
    borderColor: '#a16207',
  },
  pending: {
    color: '#991b1b',
    borderWidth: 1,
    borderColor: '#991b1b',
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },

  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 6,
  },

  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    padding: 8,
    borderRadius: 6,
  },

  btnText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 6,
  },

  notAvailable: {
    marginTop: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },

  footer: {
    marginTop: 20,
    textAlign: 'center',
    color: '#374151',
  },
});
