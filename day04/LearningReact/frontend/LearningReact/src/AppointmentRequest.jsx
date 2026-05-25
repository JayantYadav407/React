// ✅ FILE: components/AppointmentRequest.jsx

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  Clock3,
  User2,
  Phone,
  Cake,
  VenusAndMars,
  NotebookText,
  Send,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MapPin,
  IndianRupee,
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatDateISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDayName = (dateStr) => {
  const [y, m, d] = String(dateStr || '').split('-').map(Number);
  if (!y || !m || !d) return '';
  return DAYS[new Date(y, m - 1, d).getDay()];
};

const toMinutes = (time) => {
  if (!time || typeof time !== 'string') return NaN;
  const m = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
};

const normalizeTime = (time) => {
  const mins = toMinutes(time);
  if (Number.isNaN(mins)) return '';
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
};

const getAgeFromDob = (dob) => {
  if (!dob) return '';
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? String(age) : '';
};

const getMinDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateISO(tomorrow);
};

const getMaxDate = () => {
  const max = new Date();
  max.setDate(max.getDate() + 60);
  return formatDateISO(max);
};

const isSameDate = (a, b) => a === b;

const buildAvailableDays = (doctor) => {
  if (!doctor?.availability || !Array.isArray(doctor.availability)) return [];
  return doctor.availability
    .filter((d) => d && d.day)
    .map((d) => ({
      day: d.day,
      isClosed: !!d.isClosed,
      slots: Array.isArray(d.slots)
        ? d.slots
            .map((s) => ({
              startTime: normalizeTime(s.startTime),
              endTime: normalizeTime(s.endTime),
              isBooked: !!s.isBooked,
              appointmentId: s.appointmentId || null,
            }))
            .filter((s) => s.startTime && s.endTime)
        : [],
    }));
};

export default function AppointmentRequest({ doctor, token, onSuccess, refetchDoctor }) {
  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: '',
    reason: '',
    preferredDate: '',
    preferredTime: '',
  });

  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [dateWarning, setDateWarning] = useState('');
  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [blackoutDates, setBlackoutDates] = useState([]);
  const [selectedSession, setSelectedSession] = useState('all');

  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        if (!authToken) {
          setPrefillLoading(false);
          return;
        }

        const res = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const p = res.data.patient || res.data.user || res.data;
        setForm((prev) => ({
          ...prev,
          patientName: p.name || '',
          patientPhone: p.phone || '',
          patientAge: p.dob ? getAgeFromDob(p.dob) : '',
          patientGender: p.gender || '',
        }));
      } catch (err) {
        console.error('Profile prefill failed:', err);
      } finally {
        setPrefillLoading(false);
      }
    };

    fetchPatientProfile();
  }, [authToken]);

  useEffect(() => {
    const normalized = buildAvailableDays(doctor);
    setDoctorSchedule(normalized);
    setBlackoutDates(
      Array.isArray(doctor?.blackoutDates)
        ? doctor.blackoutDates.map((d) => formatDateISO(new Date(d)))
        : []
    );
  }, [doctor]);

  const selectedDateDay = useMemo(() => {
    if (!form.preferredDate) return '';
    return getDayName(form.preferredDate);
  }, [form.preferredDate]);

  const selectedDaySchedule = useMemo(() => {
    return doctorSchedule.find((d) => d.day === selectedDateDay) || null;
  }, [doctorSchedule, selectedDateDay]);

  const isBlackoutDate = useMemo(() => {
    if (!form.preferredDate) return false;
    return blackoutDates.some((d) => isSameDate(d, form.preferredDate));
  }, [blackoutDates, form.preferredDate]);

  useEffect(() => {
    if (!form.preferredDate) {
      setAvailableSlots([]);
      setDateWarning('');
      return;
    }

    if (isBlackoutDate) {
      setAvailableSlots([]);
      setDateWarning('Doctor is on leave for the selected date.');
      return;
    }

    if (!selectedDaySchedule) {
      setAvailableSlots([]);
      setDateWarning('Doctor is not available on this day.');
      return;
    }

    if (selectedDaySchedule.isClosed) {
      setAvailableSlots([]);
      setDateWarning('Doctor is closed on this day.');
      return;
    }

    const slots = (selectedDaySchedule.slots || [])
      .map((slot) => ({
        ...slot,
        startMinutes: toMinutes(slot.startTime),
        endMinutes: toMinutes(slot.endTime),
      }))
      .filter(
        (slot) =>
          Number.isFinite(slot.startMinutes) &&
          Number.isFinite(slot.endMinutes) &&
          slot.startMinutes < slot.endMinutes
      )
      .sort((a, b) => a.startMinutes - b.startMinutes);

    let displaySlots = slots;

    if (selectedSession === 'morning') {
      displaySlots = slots.filter((s) => s.startMinutes < 12 * 60);
    } else if (selectedSession === 'evening') {
      displaySlots = slots.filter((s) => s.startMinutes >= 12 * 60);
    }

    setAvailableSlots(
      displaySlots.map((s) => ({
        startTime: s.startTime,
        endTime: s.endTime,
        isBooked: s.isBooked,
        appointmentId: s.appointmentId,
      }))
    );

    setDateWarning(
      displaySlots.length ? '' : 'No bookable slots available for this session.'
    );
    if (form.preferredTime) {
      const stillValid = displaySlots.some(
        (s) => form.preferredTime >= s.startTime && form.preferredTime < s.endTime
      );
      if (!stillValid) {
        setForm((prev) => ({ ...prev, preferredTime: '' }));
      }
    }
  }, [form.preferredDate, selectedDaySchedule, selectedSession, isBlackoutDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'preferredDate') {
      setError('');
      setMessage('');
    }
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

      if (!authToken) {
        setError('Please login first');
        return;
      }

      if (!form.patientName.trim()) {
        setError('Patient name is required');
        return;
      }

      if (!form.preferredDate) {
        setError('Preferred date is required');
        return;
      }

      if (!form.preferredTime) {
        setError('Preferred time is required');
        return;
      }

      const selectedDate = new Date(form.preferredDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const minDate = new Date(getMinDate() + 'T00:00:00');
      const maxDate = new Date(getMaxDate() + 'T00:00:00');

      if (selectedDate < minDate || selectedDate > maxDate) {
        setError('Please select a date within the next 60 days');
        return;
      }

      if (selectedDate < today) {
        setError('Please select an upcoming date');
        return;
      }

      const dayName = getDayName(form.preferredDate);
      const daySchedule = doctorSchedule.find((d) => d.day === dayName);

      if (!daySchedule || daySchedule.isClosed) {
        setError('Doctor is not available on the selected day');
        return;
      }

      if (blackoutDates.some((d) => isSameDate(d, form.preferredDate))) {
        setError('Doctor is on leave for the selected date');
        return;
      }

      const validSlot = (daySchedule.slots || []).find((slot) => {
        const start = toMinutes(slot.startTime);
        const end = toMinutes(slot.endTime);
        const chosen = toMinutes(form.preferredTime);
        return chosen >= start && chosen < end;
      });

      if (!validSlot) {
        setError('Please choose a valid time from the available schedule');
        return;
      }

      if (validSlot.isBooked) {
        setError('Selected slot is already booked');
        return;
      }

      const payload = {
        patientName: form.patientName.trim(),
        patientPhone: form.patientPhone.trim(),
        patientAge: form.patientAge ? Number(form.patientAge) : null,
        patientGender: form.patientGender,
        reason: form.reason.trim(),
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
      };

      const res = await axios.post(
        `http://localhost:5000/api/appointments/${doctorId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // ✅ NEW: after booking, refresh doctor schedule
      setMessage(res.data.message || 'Appointment request sent successfully');
      if (refetchDoctor) {
        await refetchDoctor(); // typically an async function passed from parent
      }

      setForm((prev) => ({
        ...prev,
        reason: '',
        preferredDate: '',
        preferredTime: '',
      }));

      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to send appointment request'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[28px] shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">
            Request Appointment
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Send an appointment request to{' '}
            {doctor?.fullName || doctor?.name || 'this doctor'}.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl font-bold text-sm">
          <IndianRupee size={16} />
          Regular fee: ₹{doctor?.fees?.regular ?? '—'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <InfoCard
          icon={<Clock3 size={18} />}
          label="Booking window"
          value="Next 60 days"
        />
        <InfoCard
          icon={<MapPin size={18} />}
          label="Hospital"
          value={
            doctor?.hospital?.name || doctor?.clinicLocation?.address || 'Clinic'
          }
        />
        <InfoCard
          icon={<CalendarDays size={18} />}
          label="Schedule status"
          value={doctorSchedule.length ? 'Available schedule loaded' : 'No schedule configured'}
        />
      </div>

      {message && (
        <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700 flex items-start gap-2">
          <CheckCircle2 size={18} className="mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700 flex items-start gap-2">
          <AlertTriangle size={18} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <Field
          label="Patient Name"
          icon={<User2 size={16} />}
        >
          <input
            name="patientName"
            value={form.patientName}
            onChange={handleChange}
            placeholder={prefillLoading ? 'Loading profile...' : 'Patient name'}
            className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            required
          />
        </Field>

        <Field
          label="Phone Number"
          icon={<Phone size={16} />}
        >
          <input
            name="patientPhone"
            value={form.patientPhone}
            onChange={handleChange}
            placeholder="Phone number"
            className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </Field>

        <Field
          label="Age"
          icon={<Cake size={16} />}
        >
          <input
            name="patientAge"
            type="number"
            value={form.patientAge}
            onChange={handleChange}
            placeholder="Age"
            className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </Field>

        <Field
          label="Gender"
          icon={<VenusAndMars size={16} />}
        >
          <select
            name="patientGender"
            value={form.patientGender}
            onChange={handleChange}
            className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field
            label="Reason for Visit"
            icon={<NotebookText size={16} />}
          >
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Reason for visit"
              className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              rows="4"
            />
          </Field>
        </div>

        <Field
          label="Preferred Date"
          icon={<CalendarDays size={16} />}
        >
          <input
            name="preferredDate"
            type="date"
            value={form.preferredDate}
            onChange={handleChange}
            min={getMinDate()}
            max={getMaxDate()}
            className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            required
          />
        </Field>

        <Field
          label="Preferred Time"
          icon={<Clock3 size={16} />}
        >
          <select
            name="preferredTime"
            value={form.preferredTime}
            onChange={handleChange}
            className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            required
            disabled={!form.preferredDate || !!dateWarning}
          >
            <option value="">Select time</option>
            {availableSlots.map((slot) => {
              if (slot.isBooked) return null; // 🔒 hide booked slots
              return (
                <option
                  key={`${slot.startTime}-${slot.endTime}`}
                  value={slot.startTime}
                >
                  {slot.startTime} - {slot.endTime}
                </option>
              );
            })}
          </select>
        </Field>

        <div className="md:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-emerald-900 text-white rounded-2xl px-6 py-3 font-semibold disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {loading ? 'Sending...' : 'Send Appointment Request'}
          </button>

          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                reason: '',
                preferredDate: '',
                preferredTime: '',
              }))
            }
            className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 rounded-2xl px-6 py-3 font-semibold"
          >
            Reset Date/Time
          </button>
        </div>
      </form>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-3">
            <Clock3 size={16} />
            Available sessions
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'morning', 'evening'].map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setSelectedSession(x)}
                className={`px-4 py-2 rounded-full text-sm font-bold capitalize border transition ${
                  selectedSession === x
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {x}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {form.preferredDate
              ? `Selected date: ${form.preferredDate} (${selectedDateDay || 'Unknown'})`
              : 'Select a date to see schedule-based slot options.'}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-3">
            <AlertTriangle size={16} />
            Date checks
          </div>
          {dateWarning ? (
            <p className="text-sm text-amber-700">{dateWarning}</p>
          ) : (
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• Booking allowed only within the next 60 days.</li>
              <li>• Leave dates and closed days are blocked automatically.</li>
              <li>• Time must match the doctor’s configured schedule.</li>
              <li>• Booked slots are hidden from selection.</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[11px] uppercase font-black tracking-widest text-slate-400">
          {label}
        </p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}