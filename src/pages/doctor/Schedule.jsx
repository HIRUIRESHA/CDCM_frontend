import { useEffect, useState } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  .schedule-root {
    min-height: 100vh;
    background: #f0f2f5;
    font-family: 'DM Sans', sans-serif;
    padding: 2.5rem;
    background-image: radial-gradient(circle at 20% 20%, #e8f0fe 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, #fce8e6 0%, transparent 50%);
  }

  .schedule-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 2.5rem;
  }

  .schedule-title-block {}

  .schedule-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #6b7ae8;
    margin-bottom: 0.35rem;
  }

  .schedule-title {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: #1a1d2e;
    line-height: 1.1;
    margin: 0;
  }

  .schedule-count-badge {
    background: #1a1d2e;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.4rem 0.9rem;
    border-radius: 100px;
    letter-spacing: 0.05em;
  }

  /* Card Table Container */
  .schedule-card {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 4px 24px rgba(26, 29, 46, 0.07), 0 1px 4px rgba(26, 29, 46, 0.04);
    overflow: hidden;
  }

  .schedule-table {
    width: 100%;
    border-collapse: collapse;
  }

  .schedule-table thead tr {
    background: #1a1d2e;
  }

  .schedule-table thead th {
    font-family: 'Syne', sans-serif;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
    padding: 1.1rem 1.4rem;
    text-align: left;
  }

  .schedule-table thead th:first-child {
    border-radius: 0;
  }

  .schedule-table tbody tr {
    border-bottom: 1px solid #f0f2f5;
    transition: background 0.15s ease;
  }

  .schedule-table tbody tr:last-child {
    border-bottom: none;
  }

  .schedule-table tbody tr:hover {
    background: #f7f8ff;
  }

  .schedule-table tbody td {
    padding: 1.1rem 1.4rem;
    font-size: 0.88rem;
    color: #2d3148;
    font-weight: 400;
    vertical-align: middle;
  }

  /* Date cell */
  .date-cell {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    color: #1a1d2e;
  }

  /* Time cell */
  .time-range {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    color: #4a5080;
  }

  .time-sep {
    width: 16px;
    height: 1px;
    background: #c0c4db;
    display: inline-block;
  }

  /* Hospital cell */
  .hospital-name {
    font-weight: 500;
    color: #1a1d2e;
    display: block;
    font-size: 0.88rem;
  }

  .hospital-location {
    font-size: 0.75rem;
    color: #8890b0;
    margin-top: 0.1rem;
    display: block;
  }

  /* Status badges */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-family: 'Syne', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.3rem 0.75rem;
    border-radius: 100px;
  }

  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .badge-pending {
    background: #fff8e6;
    color: #b07c00;
    border: 1px solid #f5d780;
  }
  .badge-pending .badge-dot { background: #f0b429; }

  .badge-accepted {
    background: #e8faf0;
    color: #1a7a45;
    border: 1px solid #86e0b0;
  }
  .badge-accepted .badge-dot { background: #22c55e; }

  .badge-rejected {
    background: #fff0f0;
    color: #b02020;
    border: 1px solid #f0a0a0;
  }
  .badge-rejected .badge-dot { background: #ef4444; }

  /* Action buttons */
  .action-group {
    display: flex;
    gap: 0.5rem;
  }

  .btn {
    font-family: 'Syne', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.45rem 1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.18s ease;
    outline: none;
  }

  .btn-accept {
    background: #1a7a45;
    color: #fff;
    box-shadow: 0 2px 8px rgba(26, 122, 69, 0.25);
  }
  .btn-accept:hover {
    background: #155e35;
    box-shadow: 0 4px 14px rgba(26, 122, 69, 0.35);
    transform: translateY(-1px);
  }
  .btn-accept:active { transform: translateY(0); }

  .btn-reject {
    background: #fff0f0;
    color: #b02020;
    border: 1px solid #f0a0a0;
    box-shadow: none;
  }
  .btn-reject:hover {
    background: #ffe0e0;
    border-color: #e06060;
    transform: translateY(-1px);
  }
  .btn-reject:active { transform: translateY(0); }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 5rem 2rem;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    background: #f0f2f5;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 1.6rem;
  }

  .empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a1d2e;
    margin: 0 0 0.4rem;
  }

  .empty-sub {
    font-size: 0.85rem;
    color: #8890b0;
    margin: 0;
  }

  /* Loading state */
  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 5rem 2rem;
    color: #8890b0;
    font-size: 0.88rem;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid #e0e2ef;
    border-top-color: #6b7ae8;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .schedule-root { padding: 1.25rem; }
    .schedule-title { font-size: 1.5rem; }
    .schedule-table thead { display: none; }
    .schedule-table tbody tr {
      display: block;
      padding: 1rem;
      margin-bottom: 0.75rem;
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 2px 10px rgba(26,29,46,0.07);
      border: none;
    }
    .schedule-table tbody td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.4rem 0;
      border: none;
      font-size: 0.84rem;
    }
    .schedule-table tbody td::before {
      content: attr(data-label);
      font-family: 'Syne', sans-serif;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #8890b0;
    }
    .schedule-card { background: transparent; box-shadow: none; border-radius: 0; }
  }
`;

export default function SchedulePage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id || user?._id;

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSchedules = async () => {
    if (!doctorId) {
      console.error("Doctor ID not found in localStorage");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8082/api/schedules/doctor/${doctorId}`
      );
      setSchedules(res.data);
    } catch (err) {
      console.error("Error loading schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [doctorId]);

  const acceptSchedule = async (id) => {
    try {
      await axios.put(`http://localhost:8082/api/schedules/accept/${id}`);
      loadSchedules();
    } catch (err) {
      console.error("Error accepting schedule:", err);
    }
  };

  const rejectSchedule = async (id) => {
    try {
      await axios.put(`http://localhost:8082/api/schedules/reject/${id}`);
      loadSchedules();
    } catch (err) {
      console.error("Error rejecting schedule:", err);
    }
  };

  const pendingCount = schedules.filter((s) => s.status === "PENDING").length;

  return (
    <>
      <style>{styles}</style>

      <div className="schedule-root">
        <div className="schedule-header">
          <div className="schedule-title-block">
            <p className="schedule-eyebrow">Doctor Portal</p>
            <h1 className="schedule-title">My Schedules</h1>
          </div>
          {!loading && schedules.length > 0 && (
            <span className="schedule-count-badge">
              {pendingCount > 0
                ? `${pendingCount} Pending`
                : `${schedules.length} Total`}
            </span>
          )}
        </div>

        {loading ? (
          <div className="schedule-card">
            <div className="loading-state">
              <div className="spinner" />
              Loading schedules…
            </div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="schedule-card">
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p className="empty-title">No schedules yet</p>
              <p className="empty-sub">
                Schedules assigned to you will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="schedule-card">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Hospital</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => {
                  const scheduleId = s.id || s._id;
                  return (
                    <tr key={scheduleId}>
                      <td data-label="Date">
                        <span className="date-cell">{s.date}</span>
                      </td>

                      <td data-label="Time">
                        <span className="time-range">
                          {s.startTime}
                          <span className="time-sep" />
                          {s.endTime}
                        </span>
                      </td>

                      <td data-label="Hospital">
                        <span className="hospital-name">
                          {s.hospitalName || "Unknown Hospital"}
                        </span>
                        {s.hospitalLocation && (
                          <span className="hospital-location">
                            📍 {s.hospitalLocation}
                          </span>
                        )}
                      </td>

                      <td data-label="Status">
                        {s.status === "PENDING" && (
                          <span className="badge badge-pending">
                            <span className="badge-dot" />
                            Pending
                          </span>
                        )}
                        {s.status === "ACCEPTED" && (
                          <span className="badge badge-accepted">
                            <span className="badge-dot" />
                            Accepted
                          </span>
                        )}
                        {s.status === "REJECTED" && (
                          <span className="badge badge-rejected">
                            <span className="badge-dot" />
                            Rejected
                          </span>
                        )}
                      </td>

                      <td data-label="Action">
                        {s.status === "PENDING" && (
                          <div className="action-group">
                            <button
                              onClick={() => acceptSchedule(scheduleId)}
                              className="btn btn-accept"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectSchedule(scheduleId)}
                              className="btn btn-reject"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}