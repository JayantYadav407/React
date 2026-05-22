import { useState } from 'react';
import axios from 'axios';

export default function AppointmentRequest({ doctor, token, onSuccess }) {
  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: '',
    reason: '',
    preferredDate: '',
    preferredTime: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage('');
      setError('');

      const doctorId = doctor?._id || doctor?.id;
      if (!doctorId) {
        setError('Doctor not selected');
        return;
      }

      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        setError('Please login first');
        return;
      }

      const payload = {
        ...form,
        patientAge: form.patientAge ? Number(form.patientAge) : null
      };

      const res = await axios.post(
        `http://localhost:5000/api/appointments/${doctorId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      setMessage(res.data.message || 'Appointment request sent successfully');
      setForm({
        patientName: '',
        patientPhone: '',
        patientAge: '',
        patientGender: '',
        reason: '',
        preferredDate: '',
        preferredTime: ''
      });

      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send appointment request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-emerald-900">Request Appointment</h2>
        <p className="text-sm text-gray-600">
          Send an appointment request to {doctor?.fullName || 'this doctor'}
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input
          name="patientName"
          value={form.patientName}
          onChange={handleChange}
          placeholder="Patient name"
          className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />

        <input
          name="patientPhone"
          value={form.patientPhone}
          onChange={handleChange}
          placeholder="Phone number"
          className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <input
          name="patientAge"
          type="number"
          value={form.patientAge}
          onChange={handleChange}
          placeholder="Age"
          className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <select
          name="patientGender"
          value={form.patientGender}
          onChange={handleChange}
          className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <textarea
          name="reason"
          value={form.reason}
          onChange={handleChange}
          placeholder="Reason for visit"
          className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 md:col-span-2"
          rows="4"
        />

        <input
          name="preferredDate"
          type="date"
          value={form.preferredDate}
          onChange={handleChange}
          className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />

        <input
          name="preferredTime"
          type="time"
          value={form.preferredTime}
          onChange={handleChange}
          className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-900 text-white rounded-lg px-6 py-3 font-semibold md:col-span-2 disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send Appointment Request'}
        </button>
      </form>
    </div>
  );
}