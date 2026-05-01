import { useEffect, useState } from "react";
import axios from "axios";

export default function VideoConference() {
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id || user?._id;

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadSchedules = async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8082/api/schedules/doctor/${doctorId}`
      );

      const videoSchedules = res.data.filter(
        (s) => s.type === "VIDEO"
      );

      setSchedules(videoSchedules);
    } catch (err) {
      console.error("Error loading video schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [doctorId]);

  const acceptSchedule = async (id) => {
    await axios.put(`http://localhost:8082/api/schedules/accept/${id}`);
    loadSchedules();
  };

  const rejectSchedule = async (id) => {
    await axios.put(`http://localhost:8082/api/schedules/reject/${id}`);
    loadSchedules();
  };

  const cancelSchedule = (id) => setCancelTargetId(id);

  const confirmCancel = async () => {
    try {
      await axios.put(
        `http://localhost:8082/api/schedules/cancel/${cancelTargetId}`
      );
      showToast("success", "Schedule cancelled successfully.");
      loadSchedules();
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to cancel schedule.");
    } finally {
      setCancelTargetId(null);
    }
  };

  const pendingCount = schedules.filter((s) => s.status === "PENDING").length;
  const acceptedCount = schedules.filter((s) => s.status === "ACCEPTED").length;
  const rejectedCount = schedules.filter((s) => s.status === "REJECTED").length;
  const cancelledCount = schedules.filter((s) => s.status === "CANCELLED").length;

  return (
    <div className="min-h-screen bg-[#f0f2f8] font-inter p-10">

      {/* HEADER */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 font-medium">Video Consultation</p>
        <h1 className="text-3xl font-bold text-gray-900">My Video Schedule</h1>
        <p className="text-sm text-gray-500">
          Manage your online consultation sessions
        </p>
      </div>

      {/* STATS (ONE LINE FIXED) */}
      {!loading && schedules.length > 0 && (
        <div className="grid grid-cols-5 gap-3 mb-8 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl">
            <p className="text-[11px]">Total</p>
            <h2 className="text-2xl font-bold">{schedules.length}</h2>
          </div>

          <div className="bg-gradient-to-r from-teal-500 to-green-400 text-white p-4 rounded-2xl">
            <p className="text-[11px]">Accepted</p>
            <h2 className="text-2xl font-bold">{acceptedCount}</h2>
          </div>

          <div className="bg-gradient-to-r from-orange-400 to-yellow-300 text-white p-4 rounded-2xl">
            <p className="text-[11px]">Pending</p>
            <h2 className="text-2xl font-bold">{pendingCount}</h2>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-4 rounded-2xl">
            <p className="text-[11px]">Rejected</p>
            <h2 className="text-2xl font-bold">{rejectedCount}</h2>
          </div>

          <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white p-4 rounded-2xl">
            <p className="text-[11px]">Cancelled</p>
            <h2 className="text-2xl font-bold">{cancelledCount}</h2>
          </div>

        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow">

        <div className="flex justify-between p-6 border-b">
          <h2 className="font-semibold">Video Schedule Overview</h2>
          <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full">
            {pendingCount} Pending
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading...</div>
        ) : schedules.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No video schedules yet
          </div>
        ) : (
          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Time</th>
                <th className="p-4 text-left">Patient</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {schedules.map((s) => {
                const id = s.id || s._id;

                return (
                  <tr key={id} className="border-b hover:bg-gray-50">

                    <td className="p-4 font-semibold">{s.date}</td>

                    <td className="p-4">
                      {s.startTime} - {s.endTime}
                    </td>

                    <td className="p-4">
                      <div className="font-medium">
                        {s.patientName || "Patient"}
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          s.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : s.status === "ACCEPTED"
                            ? "bg-green-100 text-green-700"
                            : s.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="p-4 flex gap-2">

                      {s.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => acceptSchedule(id)}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() => rejectSchedule(id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {s.status === "ACCEPTED" && (
                        <button
                          onClick={() => cancelSchedule(id)}
                          className="bg-gray-200 px-3 py-1 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        )}
      </div>

      {/* MODAL */}
      {cancelTargetId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80">
            <h2 className="font-semibold mb-2">Cancel schedule?</h2>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCancelTargetId(null)}
                className="px-3 py-1 text-sm"
              >
                Keep
              </button>

              <button
                onClick={confirmCancel}
                className="bg-red-500 text-white px-3 py-1 text-sm rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white shadow px-4 py-3 rounded-xl">
          <p className="text-sm font-semibold">
            {toast.type === "success" ? "Success" : "Error"}
          </p>
          <p className="text-xs text-gray-500">{toast.msg}</p>
        </div>
      )}

    </div>
  );
}