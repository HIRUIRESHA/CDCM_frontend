
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = "https://cdcm-backend.onrender.com/api/schedules";

const DoctorSchedules = () => {
  const { user } = useAuth();

  // The logged-in hospital ID comes from AuthContext,
  // the same way as DoctorManagement.
  const hospitalId = user?.id;

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!user || !hospitalId) {
      setError("Hospital ID not found.");
      setLoading(false);
      return;
    }

    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/hospital/${hospitalId}`
        );

        setSchedules(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        console.error("Failed to load doctor schedules:", err);
        setError("Unable to load doctor schedules.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [user, hospitalId]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const query = search.trim().toLowerCase();

      const doctorName = (
        schedule.doctorName || ""
      ).toLowerCase();

      const specialty = (
        schedule.specialty || ""
      ).toLowerCase();

      const matchesSearch =
        doctorName.includes(query) ||
        specialty.includes(query);

      const matchesDate =
        !selectedDate ||
        schedule.date === selectedDate;

      return matchesSearch && matchesDate;
    });
  }, [schedules, search, selectedDate]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "—";

    const [hour, minute] = time.split(":");

    const date = new Date();

    date.setHours(
      Number(hour),
      Number(minute),
      0,
      0
    );

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getScheduleStatus = (schedule) => {
    if (schedule.status !== "ACCEPTED") {
      return schedule.status || "PENDING";
    }

    return Number(schedule.availableSlots) > 0
      ? "AVAILABLE"
      : "FULL";
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";

      case "FULL":
        return "bg-red-50 text-red-700 border border-red-200";

      case "ACCEPTED":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";

      case "PENDING":
        return "bg-amber-50 text-amber-700 border border-amber-200";

      case "REJECTED":
      case "CANCELLED":
        return "bg-red-50 text-red-700 border border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-sm text-gray-500">
            Loading doctor schedules...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Doctor Schedules
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View doctors' schedules and appointment availability.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-xs font-medium text-gray-500">
            Total Schedules
          </p>

          <p className="mt-1 text-2xl font-bold text-teal-600">
            {schedules.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctor or specialization..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Date */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />

          {/* Clear */}
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedDate("");
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Clear Filters
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px]">

            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Doctor
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Specialization
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Time
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Type
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Room / Link
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Booked
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Available
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredSchedules.length > 0 ? (

                filteredSchedules.map((schedule) => {

                  const isVideo =
                    schedule.type?.toUpperCase() === "VIDEO";

                  const status =
                    getScheduleStatus(schedule);

                  return (
                    <tr
                      key={schedule.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* Doctor */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {schedule.doctorName || "Doctor"}
                        </p>
                      </td>

                      {/* Specialization */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {schedule.specialty || "—"}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(schedule.date)}
                      </td>

                      {/* Time */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        <div className="flex flex-col">
                          <span>
                            {formatTime(schedule.startTime)}
                          </span>

                          <span className="text-xs text-gray-400">
                            to {formatTime(schedule.endTime)}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">

                        {isVideo ? (
                          <span className="inline-flex rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                            Telemedicine
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Physical
                          </span>
                        )}

                      </td>

                      {/* Room / Link */}
                      <td className="px-5 py-4 text-sm">

                        {isVideo ? (

                          schedule.meetingLink ? (
                            <a
                              href={schedule.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-teal-600 hover:text-teal-700 hover:underline"
                            >
                              Online Meeting
                            </a>
                          ) : (
                            <span className="text-gray-500">
                              Online
                            </span>
                          )

                        ) : (

                          <span className="text-gray-600">
                            {schedule.roomNumber
                              ? `Room ${schedule.roomNumber}`
                              : "—"}
                          </span>

                        )}

                      </td>

                      {/* Booked */}
                      <td className="px-5 py-4 text-center">
                        <span className="font-semibold text-gray-900">
                          {schedule.bookedPatientCount ?? 0}
                        </span>
                      </td>

                      {/* Available */}
                      <td className="px-5 py-4 text-center">

                        <span
                          className={`font-semibold ${
                            Number(schedule.availableSlots) > 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {schedule.availableSlots ?? 0}
                        </span>

                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                            status
                          )}`}
                        >
                          {status === "AVAILABLE"
                            ? "Available"
                            : status === "FULL"
                            ? "Full"
                            : status}
                        </span>

                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-12 text-center"
                  >
                    <div className="text-sm font-medium text-gray-500">
                      No doctor schedules found.
                    </div>

                    <p className="mt-1 text-xs text-gray-400">
                      Try changing your search or date filter.
                    </p>
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* Result count */}
      <div className="mt-3 text-xs text-gray-500">
        Showing {filteredSchedules.length} of{" "}
        {schedules.length} schedules
      </div>

    </div>
  );
};

export default DoctorSchedules;
