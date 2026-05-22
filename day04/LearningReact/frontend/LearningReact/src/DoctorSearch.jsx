import { useState } from 'react';
import axios from 'axios';
import AppointmentRequest from './AppointmentRequest.jsx';

export default function DoctorSearch() {
  const [filters, setFilters] = useState({
    q: '',
    city: '',
    hospitalType: '',
    hospitalName: '',
    specialization: '',
    minFee: '',
    maxFee: '',
    minExperience: ''
  });

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      setSelectedDoctor(null);

      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value.trim() !== '')
      );

      const res = await axios.get('http://localhost:5000/api/doctors/search', {
        params
      });

      const list = Array.isArray(res.data.doctors) ? res.data.doctors : [];
      setDoctors(list);

      if (!list.length) {
        const terms = [];
        if (filters.q) terms.push(`"${filters.q}"`);
        if (filters.city) terms.push(`city "${filters.city}"`);
        if (filters.specialization) terms.push(`specialization "${filters.specialization}"`);
        if (filters.hospitalName) terms.push(`hospital "${filters.hospitalName}"`);
        if (filters.hospitalType) terms.push(filters.hospitalType);
        setMessage(`No doctor found for ${terms.join(', ') || 'the selected search filters'}.`);
      } else {
        setMessage('');
      }
    } catch (err) {
      setDoctors([]);
      setMessage(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-emerald-900">Doctor Search</div>
          <nav className="hidden md:flex gap-8 text-gray-600">
            <a href="#" className="hover:text-gray-900">Home</a>
            <a href="#" className="hover:text-gray-900">Find Doctors</a>
            <a href="#" className="hover:text-gray-900">Appointments</a>
          </nav>
          <button className="bg-emerald-900 text-white px-5 py-2 rounded-md">
            Login
          </button>
        </div>
      </header>

      <section className="relative">
        <div className="h-[320px] md:h-[420px] bg-[#f5f7f4] flex items-center justify-center px-6">
          <div className="max-w-5xl w-full text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-emerald-950 mb-6">
              Find the right doctor for every need
            </h1>

            <form
              onSubmit={handleSearch}
              className="bg-white shadow-xl rounded-2xl p-4 md:p-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4"
            >
              <input
                name="q"
                value={filters.q}
                onChange={handleChange}
                placeholder="Disease, cure, doctor name"
                className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                name="city"
                value={filters.city}
                onChange={handleChange}
                placeholder="Location / city"
                className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                name="hospitalName"
                value={filters.hospitalName}
                onChange={handleChange}
                placeholder="Hospital name"
                className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                name="specialization"
                value={filters.specialization}
                onChange={handleChange}
                placeholder="Department / specialization"
                className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                name="hospitalType"
                value={filters.hospitalType}
                onChange={handleChange}
                className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Hospital type</option>
                <option value="Private">Private</option>
                <option value="Government">Government</option>
              </select>
              <input
                name="minExperience"
                value={filters.minExperience}
                onChange={handleChange}
                placeholder="Min experience"
                className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                name="minFee"
                value={filters.minFee}
                onChange={handleChange}
                placeholder="Min fee"
                className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                name="maxFee"
                value={filters.maxFee}
                onChange={handleChange}
                placeholder="Max fee"
                className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="submit"
                className="bg-emerald-900 text-white rounded-lg px-6 py-3 font-semibold md:col-span-2 lg:col-span-4"
              >
                {loading ? 'Searching...' : 'Search Doctor'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        {message && (
          <div className="mb-6 text-center text-lg font-medium text-red-600">
            {message}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white border rounded-2xl shadow-sm p-5">
              <h3 className="text-xl font-bold text-gray-900">{doctor.fullName}</h3>
              <p className="text-emerald-700 font-medium">{doctor.specialization}</p>
              <p className="text-gray-600 mt-2">{doctor.hospital?.name || 'N/A'}</p>
              <p className="text-gray-600">{doctor.clinicLocation?.city || 'N/A'}</p>
              <p className="text-gray-600">Type: {doctor.hospitalType || 'N/A'}</p>
              <p className="text-gray-600">Fee: {doctor.fees?.regular ?? 'N/A'}</p>
              <p className="text-gray-600">Experience: {doctor.experienceYears ?? 0} years</p>

              <button
                className="mt-4 w-full bg-emerald-900 text-white rounded-lg py-2 font-semibold"
                onClick={() => setSelectedDoctor(doctor)}
              >
                Send Appointment Request
              </button>
            </div>
          ))}
        </div>

        {selectedDoctor && (
          <div className="mt-10">
            <AppointmentRequest
              doctor={selectedDoctor}
              token={localStorage.getItem('token')}
              onSuccess={() => {
                setMessage('Appointment request sent successfully');
                setSelectedDoctor(null);
              }}
            />
          </div>
        )}
      </section>
    </div>
  );
}