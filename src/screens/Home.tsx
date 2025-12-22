import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import DateTimePicker from '@react-native-community/datetimepicker';
import Api from '../utils/Api';
import API_URLS from '../config/API_URLS';

const { width } = Dimensions.get('window');

/* TYPES */

interface Slide {
  id: number;
  name: string;
  image: { original_url: string };
}

interface Doctor {
  name: string;
  degrees: string;
  title: string;
  img: string;
}

interface EventItem {
  id: number;
  title: string;
  month: string;
  date: string;
}

interface NewsItem {
  id: number;
  title: string;
  date: string;
  image?: string;
  description?: string;
}

interface Blog {
  id: number;
  title: string;
  image_url?: string;
  youtube_link?: string;
  doctor_name?: string;
  type: string;
}

/* MAIN */

const Home: React.FC = () => {
  const navigation = useNavigation<any>();
  const sliderRef = useRef<FlatList>(null);

  const [slides, setSlides] = useState<Slide[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [featuredNews, setFeaturedNews] = useState<NewsItem | null>(null);
  const [latestEvents, setLatestEvents] = useState<EventItem[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [btnLoading, setBtnLoading] = useState(false);
  type PickerMode = 'date' | 'time' | null;
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    symptoms: '',
    description: '',
  });

  /* FETCH ALL */

  const fetchAll = async () => {
    try {
      // Fetch slides
      const slideRes = await Api.get(API_URLS.SLIDES);

      // Replace localhost with IP for React Native
      const mappedSlides = (slideRes.data.slides || []).map((slide: any) => ({
        ...slide,
        image: {
          original_url: slide.image.original_url.replace(
            'http://localhost:8000',
            API_URLS.BASE_URL,
          ),
        },
      }));

      setSlides(mappedSlides);

      // Doctors
      const docRes = await Api.get(API_URLS.DOCTORS);

      setDoctors(
        docRes.data.doctors.map((doc: any) => {
          const url = doc.photo?.original_url;

          const fixedUrl = url
            ? url.replace('http://localhost:8000', API_URLS.BASE_URL)
            : null;

          return {
            name: doc.name,
            degrees: doc.qualification || '',
            title: doc.specialization || '',
            img: fixedUrl || 'https://via.placeholder.com/300x300',
          };
        }),
      );

      // Events
      const eventRes = await Api.get(API_URLS.EVENTS);
      setEvents(eventRes.data.events || []);
      setLatestEvents(eventRes.data.events.slice(0, 5));

      // News
      const newsRes = await Api.get(API_URLS.NEWS);
      const mappedNews = (newsRes.data.news || []).map((i: any) => ({
        ...i,
        image: i.image?.original_url.replace(
          'http://localhost:8000',
          API_URLS.BASE_URL,
        ),
      }));
      setNews(mappedNews);

      if (mappedNews.length > 0) {
        setFeaturedNews(mappedNews[0]);
        setLatestNews(mappedNews.slice(0, 5));
      }

      // Blogs
      const blogRes = await Api.get(API_URLS.BLOG);
      const mappedBlogs = (blogRes.data.blogs || []).map((b: any) => ({
        ...b,
        image_url: b.image_url?.replace(
          'http://localhost:8000',
          API_URLS.BASE_URL,
        ),
      }));
      setBlogs(mappedBlogs);

      setLatestEvents(eventRes.data.events.slice(0, 5));
    } catch (err) {
      console.log('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* APPOINTMENT */

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

      setShowForm(false);
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

  /* YOUTUBE FIX */

  const getEmbedUrl = (url?: string) => {
    if (!url) return '';

    if (url.includes('youtube.com/embed/')) return url.split('?')[0];

    if (url.includes('youtube.com/watch?v='))
      return url.replace('watch?v=', 'embed/').split('?')[0];

    if (url.includes('youtu.be/'))
      return url.replace('youtu.be/', 'youtube.com/embed/').split('?')[0];

    return url;
  };

  /* RENDERS */

  const renderSlide = ({ item }: { item: Slide }) => (
    <Image source={{ uri: item.image.original_url }} style={styles.slideImg} />
  );

  const renderDoctor = ({ item }: { item: Doctor }) => (
    <View style={styles.docCard}>
      <Image source={{ uri: item.img }} style={styles.docImg} />
      <Text style={styles.docName}>{item.name}</Text>
      <Text style={styles.docDeg}>{item.degrees}</Text>
      <Text style={styles.docTitle}>{item.title}</Text>

      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() => {
          setSelectedDoctor(item);
          setShowForm(true);
        }}
      >
        <Text style={{ color: '#fff' }}>Book Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  /* UI */

  return (
    <ScrollView style={styles.container}>
      {/* SLIDER */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={slides}
          ref={sliderRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={renderSlide}
        />
      )}

      {/* HERO TEXT */}
      <View style={styles.heroBox}>
        <Text style={styles.heroTag}>Trusted Care for Healthier Tomorrow</Text>
        <Text style={styles.heroTitle}>
          Your Health is {'\n'}
          <Text style={{ color: '#606C32' }}>Our Priority! {'\n'} </Text>
          <Text style={{ fontSize: 16, lineHeight: 22, color: '#333' }}>
            Pukra is a state-of-the-art super-speciality hospital established
            under the esteemed <Text>Kovai Heart Foundation</Text> - a trusted
            name in cardiac care since 2009. With 16 years of excellence, Pukra
            delivers holistic, world-class healthcare with a patient-centric
            approach. Guided by <Text>Dr. Rajendran's</Text> visionary
            leadership, the foundation expanded across multiple specialties. A
            notable milestone includes the pioneering of a{' '}
            <Text>15-minute angiography</Text> procedure - promoted with the
            tagline <Text>"Walk-in & Walk-out"</Text> - benefiting over 1 lakh
            patients.
          </Text>
        </Text>

        <TouchableOpacity
          style={styles.heroBtn}
          onPress={() => navigation.navigate('FindDoctor')}
        >
          <Text style={{ color: '#606C32' }}>Discover Our Doctor</Text>
        </TouchableOpacity>
      </View>

      {/* DOCTORS */}
      <Text style={styles.sectionTitle}>Our Doctors</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={doctors}
          renderItem={renderDoctor}
          numColumns={2}
          keyExtractor={(_, i) => i.toString()}
        />
      )}

      {/* NEWS & EVENTS */}
      <Text style={styles.sectionTitle}>News & Events</Text>

      {/* LATEST NEWS LIST */}
      <Text style={styles.subTitle}>Latest News</Text>

      {latestNews.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.newsListCard}
          onPress={() => navigation.navigate('SingleNews', { id: item.id })}
        >
          <Image source={{ uri: item.image }} style={styles.newsListImg} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.newsListTitle}>{item.title}</Text>
            <Text style={styles.newsListDate}>{item.date}</Text>
            <Text style={styles.newsListDesc} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* FULL EVENTS LIST */}
      <Text style={styles.subTitle}>Events</Text>

      {events.map(item => (
        <View key={item.id} style={styles.eventCard}>
          <View style={styles.eventDateBox}>
            <Text style={styles.eventDate}>{item.date}</Text>
            <Text style={styles.eventMonth}>{item.month}</Text>
          </View>

          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={styles.eventTitle}>{item.title}</Text>
          </View>
        </View>
      ))}

      {/* BLOGS */}
      {/* BLOGS & DOCTOR VLOGS */}
      <Text style={styles.sectionTitle}>Blogs & Doctor Vlogs</Text>

      {blogs.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#555' }}>
          No blogs available right now.
        </Text>
      ) : (
        blogs.map(item => {
          const embedUrl = item.youtube_link
            ? getEmbedUrl(item.youtube_link)
            : null;

          return (
            <View key={item.id} style={styles.blogCard}>
              {/* IMAGE OR VIDEO */}
              {embedUrl ? (
                <WebView
                  source={{ uri: embedUrl }}
                  style={styles.blogVideo}
                  javaScriptEnabled
                  domStorageEnabled
                />
              ) : (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.blogImg}
                />
              )}

              {/* CONTENT BOX */}
              <View style={styles.blogContent}>
                <Text style={styles.blogTitle}>{item.title}</Text>

                {item.doctor_name ? (
                  <Text style={styles.blogDoctor}>{item.doctor_name}</Text>
                ) : null}

                <Text style={styles.blogType}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Text>
              </View>
            </View>
          );
        })
      )}
      {/* OUT PATIENT & LAB */}
      <View style={styles.cardRow}>
        <TouchableOpacity
          style={styles.blueCard}
          onPress={() => navigation.navigate('PatientDashboard')}
        >
          <Text style={styles.cardTitle}>Out Patients</Text>
          <Text style={styles.cardSub}>Streamlined Care</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.blueCard}
          onPress={() => navigation.navigate('LabResult')}
        >
          <Text style={styles.cardTitle}>Lab Results</Text>
          <Text style={styles.cardSub}>Instant Access</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Book with {selectedDoctor?.name}
            </Text>

            {/* INPUTS */}
            <TextInput
              placeholder="Patient Name"
              value={form.name}
              style={styles.input}
              onChangeText={t => setForm({ ...form, name: t })}
            />

            <TextInput
              placeholder="Email"
              value={form.email}
              style={styles.input}
              onChangeText={t => setForm({ ...form, email: t })}
            />

            <TextInput
              placeholder="Phone"
              value={form.phone}
              style={styles.input}
              onChangeText={t => setForm({ ...form, phone: t })}
            />
            {/* DATE */}
            <TouchableOpacity
              style={styles.input}
              onPress={() => setPickerMode('date')}
            >
              <Text>{form.date || 'Select Date'}</Text>
            </TouchableOpacity>

            {/* TIME */}
            <TouchableOpacity
              style={styles.input}
              onPress={() => setPickerMode('time')}
            >
              <Text>{form.time || 'Select Time'}</Text>
            </TouchableOpacity>

            {/* SINGLE PICKER – HOOK SAFE */}
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
                    setForm({
                      ...form,
                      date: selectedDate.toISOString().split('T')[0],
                    });
                  } else {
                    setForm({
                      ...form,
                      time: selectedDate.toTimeString().slice(0, 5),
                    });
                  }
                }}
              />
            )}
            <TextInput
              placeholder="Symptoms"
              value={form.symptoms}
              style={styles.input}
              onChangeText={t => setForm({ ...form, symptoms: t })}
            />

            <TextInput
              placeholder="Description"
              value={form.description}
              style={[styles.input, { height: 80 }]}
              multiline
              onChangeText={t => setForm({ ...form, description: t })}
            />

            {/* SUBMIT BTN */}
            <TouchableOpacity
              style={styles.submitBtn}
              disabled={btnLoading}
              onPress={submitAppointment}
            >
              <Text style={{ color: '#fff' }}>
                {btnLoading ? 'Processing...' : 'Submit'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Text
                style={{ color: 'red', marginTop: 12, textAlign: 'center' }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Home;

/* STYLES */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  slideImg: { width, height: 260 },

  heroBox: { padding: 16 },
  heroTag: { color: '#2563EB' },
  heroTitle: { fontSize: 26, fontWeight: 'bold', marginVertical: 8 },

  heroBtn: {
    borderWidth: 2,
    borderColor: '#606C32',
    padding: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    margin: 16,
  },

  docCard: {
    width: width / 2 - 20,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
  },

  docImg: { width: '100%', height: 120, borderRadius: 12 },
  docName: { fontWeight: 'bold', marginTop: 5 },
  docDeg: { fontSize: 12, color: '#555' },
  docTitle: { color: '#0F766E' },

  bookBtn: {
    marginTop: 6,
    backgroundColor: '#606C32',
    padding: 6,
    borderRadius: 12,
  },

  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },

  /* NEWS LIST */
  newsListCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },

  newsListImg: {
    width: 90,
    height: 80,
    borderRadius: 8,
  },

  newsListTitle: {
    fontWeight: 'bold',
    color: '#000',
  },

  newsListDate: {
    color: '#757575',
    fontSize: 12,
  },

  newsListDesc: {
    fontSize: 13,
    color: '#444',
    marginTop: 4,
  },

  /* EVENTS CARD */
  eventCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 10,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },

  eventDateBox: {
    width: 120,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#606C32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  eventDate: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  eventMonth: {
    color: '#fff',
    fontSize: 12,
  },

  eventTitle: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 18,
  },

  /* BLOGS */
  blogCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
  },

  blogImg: {
    width: '100%',
    height: 200,
  },

  blogVideo: {
    width: '100%',
    height: 220,
    borderRadius: 0,
  },

  blogContent: {
    padding: 12,
    backgroundColor: '#fff',
  },

  blogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },

  blogDoctor: {
    marginTop: 4,
    color: '#555',
    fontSize: 13,
  },

  blogType: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    borderRadius: 6,
  },

  cardRow: { flexDirection: 'row', padding: 16 },

  blueCard: {
    flex: 1,
    backgroundColor: '#1556d6',
    margin: 8,
    padding: 16,
    borderRadius: 16,
  },

  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardSub: { color: '#fff', fontSize: 12 },

  modalBg: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalBox: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 6,
    padding: 10,
    borderRadius: 8,
  },

  submitBtn: {
    backgroundColor: '#606C32',
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
});
