import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Plus,
  Trash2,
  Save,
  CalendarDays,
  Clock3,
  DoorClosed,
  AlertTriangle,
  Copy
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PRESETS = [
  {
    name: 'Morning OPD',
    slots: [{ startTime: '09:00', endTime: '13:00', isBooked: false, appointmentId: null }]
  },
  {
    name: 'Evening OPD',
    slots: [{ startTime: '17:00', endTime: '20:00', isBooked: false, appointmentId: null }]
  },
  {
    name: 'Full Day',
    slots: [
      { startTime: '09:00', endTime: '13:00', isBooked: false, appointmentId: null },
      { startTime: '17:00', endTime: '20:00', isBooked: false, appointmentId: null }
    ]
  }
];

const makeDefaultDay = (day) => ({
  day,
  isClosed: false,
  slots: [
    { startTime: '09:00', endTime: '13:00', isBooked: false, appointmentId: null },
    { startTime: '17:00', endTime: '20:00', isBooked: false, appointmentId: null }
  ]
});

const createDefaultAvailability = () => DAYS.map(makeDefaultDay);

const normalizeTime = (t) => {
  if (!t) return '';
  const m = String(t).match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : String(t);
};

const toMinutes = (time) => {
  const m = String(time).match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return NaN;
  return Number(m[1]) * 60 + Number(m[2]);
};

const formatDateISO = (date) => date.toISOString().split('T')[0];

const next60Days = () => {
  const arr = [];
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    arr.push(formatDateISO(d));
  }
  return arr;
};

export default function SchedulePage({ apiBase = 'http://localhost:5000', token, doctor, onUpdated }) {
  const [availability, setAvailability] = useState(createDefaultAvailability());
  const [blackoutDates, setBlackoutDates] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedPreset, setSelectedPreset] = useState('Full Day');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const tokenValue = token || localStorage.getItem('token');

  useEffect(() => {
    if (doctor?.availability?.length) {
      const map = DAYS.map((day) => {
        const found = doctor.availability.find((x) => x.day === day);
        return found
          ? {
              day,
              isClosed: !!found.isClosed,
              slots: (found.slots || []).map((s) => ({
                startTime: normalizeTime(s.startTime),
                endTime: normalizeTime(s.endTime),
                isBooked: !!s.isBooked,
                appointmentId: s.appointmentId || null
              }))
            }
          : makeDefaultDay(day);
      });
      setAvailability(map);
    }
    if (doctor?.blackoutDates?.length) {
      setBlackoutDates(doctor.blackoutDates.map((d) => formatDateISO(new Date(d))));
    }
  }, [doctor]);

  const currentDay = useMemo(
    () => availability.find((d) => d.day === selectedDay) || makeDefaultDay(selectedDay),
    [availability, selectedDay]
  );

  const updateDay = (day, updater) => {
    setAvailability((prev) => prev.map((item) => (item.day === day ? updater(item) : item)));
  };

  const applyPreset = () => {
    const preset = PRESETS.find((p) => p.name === selectedPreset);
    if (!preset) return;
    updateDay(selectedDay, (dayObj) => ({
      ...dayObj,
      isClosed: false,
      slots: preset.slots.map((s) => ({
        ...s,
        isBooked: false,
        appointmentId: null
      }))
    }));
  };

  const addSlot = () => {
    updateDay(selectedDay, (dayObj) => ({
      ...dayObj,
      isClosed: false,
      slots: [...dayObj.slots, { startTime: '14:00', endTime: '16:00', isBooked: false, appointmentId: null }]
    }));
  };

  const removeSlot = (index) => {
    updateDay(selectedDay, (dayObj) => {
      const slots = dayObj.slots.filter((_, i) => i !== index);
      return { ...dayObj, slots, isClosed: slots.length === 0 ? true : dayObj.isClosed };
    });
  };

  const updateSlot = (index, field, value) => {
    updateDay(selectedDay, (dayObj) => {
      const slots = [...dayObj.slots];
      slots[index] = { ...slots[index], [field]: value };
      return { ...dayObj, isClosed: false, slots };
    });
  };

  const toggleClosed = () => {
    updateDay(selectedDay, (dayObj) => ({
      ...dayObj,
      isClosed: !dayObj.isClosed
    }));
  };

  const copyTodayToAll = () => {
    const source = availability.find((d) => d.day === selectedDay);
    if (!source) return;
    setAvailability((prev) =>
      prev.map((d) =>
        d.day === selectedDay
          ? d
          : {
              ...d,
              slots: source.slots.map((s) => ({ ...s })),
              isClosed: source.isClosed
            }
      )
    );
  };

  const validateSchedule = (items) => {
    for (const day of items) {
      if (day.isClosed) continue;
      const slots = (day.slots || [])
        .map((s) => ({
          startTime: normalizeTime(s.startTime),
          endTime: normalizeTime(s.endTime)
        }))
        .filter((s) => s.startTime && s.endTime);

      if (slots.length === 0) return `${day.day} has no slots`;
      slots.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
      for (let i = 0; i < slots.length; i++) {
        const st = toMinutes(slots[i].startTime);
        const et = toMinutes(slots[i].endTime);
        if (!(st < et)) return `${day.day}: invalid time range`;
        if (i > 0) {
          const prevEnd = toMinutes(slots[i - 1].endTime);
          if (st - prevEnd < 10) return `${day.day}: minimum 10 minute gap required between slots`;
        }
      }
    }
    return '';
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const validation = validateSchedule(availability);
      if (validation) {
        setError(validation);
        setSaving(false);
        return;
      }

      const res = await axios.put(
        `${apiBase}/api/doctors/me/schedule`,
        { availability, blackoutDates },
        {
          headers: {
            Authorization: `Bearer ${tokenValue}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage(res.data.message || 'Schedule saved successfully');
      if (onUpdated) onUpdated(res.data.doctor);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const toggleLeaveDate = (date) => {
    setBlackoutDates((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]));
  };

  const dayStatus = (dayObj) => {
    if (dayObj.isClosed) return 'Closed';
    if ((dayObj.slots || []).length === 0) return 'No slots';
    return `${dayObj.slots.length} slot(s)`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Manage Schedule</h2>
          <p className="text-slate-500 text-sm">
            Set weekly OPD hours, breaks, and leave days for the next 60 days.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-emerald-700 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      {message && <div className="mb-4 text-emerald-700 font-semibold">{message}</div>}
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6">
        <div className="border border-slate-200 rounded-3xl p-4 bg-slate-50">
          <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
            <CalendarDays size={18} />
            Weekly Days
          </div>
          <div className="space-y-2">
            {availability.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                  selectedDay === day.day
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{day.day}</span>
                  <span className="text-xs opacity-80">{dayStatus(day)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-slate-200 rounded-3xl p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedDay}</h3>
                <p className="text-sm text-slate-500">Use multiple sessions to reflect OPD breaks.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className="border rounded-xl px-3 py-2"
                >
                  {PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <button onClick={applyPreset} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold">
                  Apply Preset
                </button>
                <button onClick={addSlot} className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center gap-2">
                  <Plus size={16} /> Add Slot
                </button>
                <button onClick={toggleClosed} className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 font-bold flex items-center gap-2">
                  <DoorClosed size={16} /> {currentDay.isClosed ? 'Open Day' : 'Mark Closed'}
                </button>
                <button onClick={copyTodayToAll} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center gap-2">
                  <Copy size={16} /> Copy to All
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {currentDay.isClosed ? (
              <div className="p-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 flex items-center gap-3">
                <AlertTriangle size={18} />
                This day is marked as leave/closed.
              </div>
            ) : (
              (currentDay.slots || []).map((slot, index) => (
                <div key={`${currentDay.day}-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 p-4 rounded-3xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                      className="w-full border rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">End Time</label>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                      className="w-full border rounded-xl px-3 py-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeSlot(index)}
                      className="w-full md:w-auto px-4 py-2 rounded-xl bg-red-50 text-red-700 font-bold flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border border-slate-200 rounded-3xl p-5 bg-slate-50">
            <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
              <Clock3 size={18} />
              Next 60 Days Leave Planner
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {next60Days().map((date) => {
                const active = blackoutDates.includes(date);
                return (
                  <button
                    key={date}
                    onClick={() => toggleLeaveDate(date)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                      active
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {date}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Click a date to mark it as leave or remove the leave mark.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}