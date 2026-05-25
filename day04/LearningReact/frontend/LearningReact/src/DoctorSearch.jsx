import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AppointmentRequest from './AppointmentRequest.jsx';
import {
  Search,
  MapPin,
  Building2,
  Stethoscope,
  Clock3,
  IndianRupee,
  BadgeCheck,
  Phone,
  Mail,
  Star,
  Mic,
  Sparkles,
  CalendarDays
} from 'lucide-react';

export default function DoctorSearch() {
  const [filters, setFilters] = useState({
    q: '',
    city: '',
    hospitalType: '',
    hospitalName: '',
    specialization: '',
    minFee: '',
    maxFee: '',
    minExperience: '',
    symptomDescription: ''
  });

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const recognition = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        setFilters((prev) => ({
          ...prev,
          symptomDescription: event.results[0][0].transcript
        }));
        setIsListening(false);
      };

      recognition.current.onerror = () => setIsListening(false);
      recognition.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognition.current) return;
    if (isListening) {
      recognition.current.stop();
    } else {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const handleChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSelectedDoctor(null);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v?.toString().trim() !== '')
      );
      const res = await axios.get('http://localhost:5000/api/doctors/search', { params });
      setDoctors(res.data.doctors || []);
      setMessage(res.data.count ? `${res.data.count} doctor(s) found` : 'No doctors found');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomSearch = async () => {
    if (!filters.symptomDescription.trim()) return;
    setLoading(true);
    setMessage('');
    setSelectedDoctor(null);

    try {
      const pos = await new Promise((resolve) =>
        navigator.geolocation.getCurrentPosition(
          resolve,
          () => resolve({ coords: { latitude: null, longitude: null } })
        )
      );

      const res = await axios.post('http://localhost:5000/api/doctors/ai-search', {
        symptom: filters.symptomDescription,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      });

      setDoctors(res.data.doctors || []);
      setMessage(res.data.doctors?.length ? 'AI match found' : 'No AI matches found');
    } catch (err) {
      setMessage('AI search failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatFee = (fee) => {
    if (fee === null || fee === undefined || fee === '') return 'N/A';
    return `₹${Number(fee).toLocaleString('en-IN')}`;
  };

  const getAvailabilityLabel = (doctor) => {
    const available =
      doctor.available ??
      doctor.isAvailable ??
      doctor.availability ??
      doctor.status;

    if (typeof available === 'boolean') return available ? 'Available Today' : 'Not Available';
    if (typeof available === 'string') return available;
    return 'Check Availability';
  };

  const isDoctorAvailable = (doctor) => {
    const available =
      doctor.available ??
      doctor.isAvailable ??
      doctor.availability ??
      doctor.status;

    if (typeof available === 'boolean') return available;
    if (typeof available === 'string') {
      return ['available', 'yes', 'true', 'open', 'active'].includes(available.toLowerCase());
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-emerald-900 text-2xl">Find Doctors</h1>
            <p className="text-sm text-gray-500">Search by symptoms, specialty, fee, and location</p>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-emerald-900 to-emerald-700 py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            How are you feeling today?
          </h2>
          <p className="text-emerald-100 text-center mb-6">
            Describe your symptoms or search manually to find the right doctor.
          </p>

          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col md:flex-row gap-3 border border-emerald-100">
            <textarea
              className="flex-1 px-4 py-3 outline-none text-gray-700 h-24 md:h-14 resize-none rounded-xl"
              placeholder="Describe symptoms naturally (e.g. 'I have persistent cough and fever')..."
              value={filters.symptomDescription}
              onChange={(e) =>
                setFilters({ ...filters, symptomDescription: e.target.value })
              }
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleVoice}
                className={`px-4 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Use Voice"
              >
                <Mic size={16} />
                {isListening ? 'Listening' : 'Voice'}
              </button>
              <button
                type="button"
                onClick={handleSymptomSearch}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <Sparkles size={16} />
                {loading ? 'Analyzing...' : 'AI Search'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 -mt-8">
        <form
          onSubmit={handleSearch}
          className="bg-white shadow-xl rounded-2xl p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4 border border-gray-100"
        >
          <input
            name="q"
            value={filters.q}
            onChange={handleChange}
            placeholder="Doctor Name / Disease"
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            name="city"
            value={filters.city}
            onChange={handleChange}
            placeholder="City"
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            name="hospitalName"
            value={filters.hospitalName}
            onChange={handleChange}
            placeholder="Hospital Name"
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            name="specialization"
            value={filters.specialization}
            onChange={handleChange}
            placeholder="Specialization"
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            name="hospitalType"
            value={filters.hospitalType}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Hospital Type</option>
            <option value="Private">Private</option>
            <option value="Government">Government</option>
          </select>
          <input
            name="minExperience"
            value={filters.minExperience}
            onChange={handleChange}
            placeholder="Min Years Experience"
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            name="minFee"
            value={filters.minFee}
            onChange={handleChange}
            placeholder="Min Fee"
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            name="maxFee"
            value={filters.maxFee}
            onChange={handleChange}
            placeholder="Max Fee"
            className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-900 text-white rounded-lg py-3 font-bold hover:bg-emerald-950 transition col-span-full flex items-center justify-center gap-2"
          >
            <Search size={16} />
            Apply Advanced Filters
          </button>
        </form>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {message && (
          <div className="text-center text-emerald-700 font-semibold mb-6">
            {message}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => {
            const available = isDoctorAvailable(doctor);
            const availabilityLabel = getAvailabilityLabel(doctor);

            return (
              <div
                key={doctor._id}
                className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {doctor.fullName || doctor.name || 'Unknown Doctor'}
                    </h3>
                    <p className="text-emerald-700 font-medium mt-1">
                      {doctor.specialization || doctor.specialty || 'General'}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      available === true
                        ? 'bg-emerald-50 text-emerald-700'
                        : available === false
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {availabilityLabel}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                    <span>
                      {doctor.clinicLocation?.address || doctor.address || 'Clinic address not available'}
                      {doctor.clinicLocation?.city ? `, ${doctor.clinicLocation.city}` : ''}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Building2 size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                    <span>
                      {doctor.hospital?.name || doctor.hospitalName || 'Hospital not available'}
                      {doctor.hospitalType ? ` • ${doctor.hospitalType}` : ''}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <IndianRupee size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                    <span>
                      Consultation Fee: <span className="font-semibold text-gray-900">{formatFee(doctor.fees?.regular ?? doctor.fee)}</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock3 size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                    <span>
                      Experience: <span className="font-semibold text-gray-900">{doctor.experienceYears || doctor.experience || 'N/A'} years</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                    <span>{doctor.phone || 'Phone not available'}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Mail size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                    <span>{doctor.email || 'Email not available'}</span>
                  </div>

                  {doctor.about && (
                    <p className="text-sm text-gray-500 line-clamp-3">
                      {doctor.about}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-semibold">
                      {doctor.department || 'General'}
                    </span>
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-semibold">
                      {doctor.hospitalType || 'Hospital'}
                    </span>
                    <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Star size={12} />
                      Available for booking
                    </span>
                  </div>
                </div>

                <button
                  className="mt-5 w-full bg-emerald-100 text-emerald-900 rounded-xl py-3 font-bold hover:bg-emerald-200 transition flex items-center justify-center gap-2"
                  onClick={() => setSelectedDoctor(doctor)}
                  type="button"
                >
                  <CalendarDays size={16} />
                  View & Book Appointment
                </button>
              </div>
            );
          })}
        </div>

        {selectedDoctor && (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-3xl border shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BadgeCheck className="text-emerald-600" size={20} />
                Doctor Profile
              </h3>

              <div className="space-y-3 text-sm text-gray-700">
                <p><span className="font-semibold">Name:</span> {selectedDoctor.fullName || selectedDoctor.name || 'N/A'}</p>
                <p><span className="font-semibold">Specialization:</span> {selectedDoctor.specialization || selectedDoctor.specialty || 'N/A'}</p>
                <p><span className="font-semibold">Experience:</span> {selectedDoctor.experienceYears || selectedDoctor.experience || 'N/A'} years</p>
                <p><span className="font-semibold">Fee:</span> {formatFee(selectedDoctor.fees?.regular ?? selectedDoctor.fee)}</p>
                <p>
                  <span className="font-semibold">Clinic:</span>{' '}
                  {selectedDoctor.clinicLocation?.address || selectedDoctor.address || 'N/A'}
                  {selectedDoctor.clinicLocation?.city ? `, ${selectedDoctor.clinicLocation.city}` : ''}
                </p>
                <p>
                  <span className="font-semibold">Hospital:</span>{' '}
                  {selectedDoctor.hospital?.name || selectedDoctor.hospitalName || 'N/A'}
                </p>
                <p><span className="font-semibold">Availability:</span> {getAvailabilityLabel(selectedDoctor)}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border shadow-lg p-6">
              <AppointmentRequest
                doctor={selectedDoctor}
                token={localStorage.getItem('token')}
                onSuccess={() => {
                  setMessage('Request sent!');
                  setSelectedDoctor(null);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}