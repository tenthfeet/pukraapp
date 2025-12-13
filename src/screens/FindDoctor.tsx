import React, { useEffect, useState } from "react";
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
} from "react-native";
import Api from "../utils/Api";
import API_URLS from "../config/API_URLS";

const { width } = Dimensions.get("window");

interface Doctor {
  name: string;
  degree: string;
  role: string;
  img: string;
}

const FindDoctor: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [showPopup, setShowPopup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    symptoms: "",
    description: "",
  });

  /* ================= FETCH DOCTORS ================= */

  useEffect(() => {
    Api.get(API_URLS.DOCTORS)
      .then((res) => {
        const mappedDoctors = res.data.doctors.map((doc: any) => ({
          name: doc.name,
          degree: doc.qualification || "",
          role: doc.specialization || "",
          img:
            doc.photo?.original_url.replace(
              'http://localhost:8000',API_URLS.BASE_URL
            )
        }));

        setDoctors(mappedDoctors);
        setFilteredDoctors(mappedDoctors);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* ================= FILTER ================= */

  useEffect(() => {
    const filtered = doctors.filter((doc) => {
      const search = searchTerm.toLowerCase();
      return (
        doc.name.toLowerCase().includes(search) ||
        doc.role.toLowerCase().includes(search) ||
        doc.degree.toLowerCase().includes(search)
      );
    });

    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  /* ================= SUBMIT APPOINTMENT ================= */

  const submitAppointment = async () => {
    if (!selectedDoctor) return;

    try {
      setBtnLoading(true);

      await Api.post(API_URLS.APPOINTMENTS, {
        doctor_name: selectedDoctor.name,
        name: form.name,
        email: form.email,
        phone: form.phone,
        date: form.date,
        time: form.time,
        symptoms: form.symptoms,
        description: form.description,
      });

      Alert.alert(
        "✅ Appointment Booked",
        "Our team will contact you shortly."
      );

      setShowPopup(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        symptoms: "",
        description: "",
      });
    } catch (err) {
      Alert.alert("❌ Failed", "Please try again later.");
    } finally {
      setBtnLoading(false);
    }
  };

  /* ================= RENDER DOCTOR ================= */

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
          <Text style={styles.outlinedText}>View Profile</Text>
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
      <Text style={styles.title}>Find a Doctor</Text>
      <TextInput
        style={styles.search}
        placeholder="Search by name, degree or speciality"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* DOCTORS LIST */}
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={filteredDoctors}
          renderItem={renderDoctor}
          keyExtractor={(_, i) => i.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* PROFILE MODAL */}
      <Modal visible={showProfile} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Image
              source={{ uri: selectedDoctor?.img }}
              style={styles.profileImg}
            />
            <Text style={styles.profileName}>
              {selectedDoctor?.name}
            </Text>
            <Text>{selectedDoctor?.degree}</Text>
            <Text style={{ color: "#606C32" }}>
              {selectedDoctor?.role}
            </Text>

            <TouchableOpacity
              style={styles.mainBtn}
              onPress={() => {
                setShowProfile(false);
                setShowPopup(true);
              }}
            >
              <Text style={{ color: "#fff" }}>Book Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowProfile(false)}>
              <Text style={{ color: "red", marginTop: 10 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOOKING MODAL */}
      <Modal visible={showPopup} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Book with {selectedDoctor?.name}
            </Text>

            {Object.keys(form).map((key) => (
              <TextInput
                key={key}
                placeholder={key}
                style={styles.input}
                onChangeText={(t) =>
                  setForm((p) => ({ ...p, [key]: t }))
                }
              />
            ))}

            <TouchableOpacity
              style={styles.mainBtn}
              onPress={submitAppointment}
              disabled={btnLoading}
            >
              <Text style={{ color: "#fff" }}>
                {btnLoading ? "Processing..." : "Submit"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowPopup(false)}>
              <Text style={{ color: "red", marginTop: 10 }}>Cancel</Text>
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
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },

  title: { fontSize: 26, fontWeight: "bold", color: "#606C32" },

  search: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },

  card: {
    backgroundColor: "#fff",
    width: width / 2 - 24,
    margin: 8,
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
  },

  img: { width: "100%", height: 140, borderRadius: 12 },

  name: { fontWeight: "bold", marginTop: 6 },
  degree: { fontSize: 12, color: "#555" },
  role: { color: "#606C32", fontWeight: "600" },

  btnRow: { flexDirection: "row", marginTop: 10 },

  outlinedBtn: {
    borderWidth: 1,
    borderColor: "#606C32",
    padding: 6,
    borderRadius: 20,
    marginHorizontal: 4,
  },

  outlinedText: { color: "#606C32", fontSize: 12 },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
  },

  modalCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },

  modalTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 10 },

  profileImg: { width: 120, height: 120, borderRadius: 60 },

  profileName: { fontSize: 20, fontWeight: "bold", color: "#606C32" },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },

  mainBtn: {
    backgroundColor: "#606C32",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
});
