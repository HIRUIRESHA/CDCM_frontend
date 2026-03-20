import { useEffect, useState } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  .schedule-root {
    min-height: 100vh;
    background: #f0f2f8;
    font-family: 'Inter', sans-serif;
    padding: 2.5rem 2.5rem 2.5rem 2rem;
  }

  .schedule-header {
    margin-bottom: 2rem;
  }

  .schedule-greeting {
    font-size: 0.78rem;
    font-weight: 500;
    color: #8890b0;
    margin-bottom: 0.25rem;
    letter-spacing: 0.02em;
  }

  .schedule-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1a1d2e;
    margin: 0 0 0.35rem;
    line-height: 1.2;
  }

  .schedule-subtitle {
    font-size: 0.85rem;
    color: #8890b0;
    margin: 0;
  }

  /* Stat Cards */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    border-radius: 16px;
    padding: 1.4rem 1.6rem;
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 100px; height: 100px;
    border-radius: 50%;
    background: rgba(255,255,255,0.12);
  }

  .stat-card::after {
    content: '';
    position: absolute;
    bottom: -20px; right: 20px;
    width: 60px; height: 60px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
  }

  .stat-card-blue   { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  .stat-card-teal   { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
  .stat-card-orange { background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%); }

  .stat-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: rgba(255,255,255,0.22);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
    margin-bottom: 0.85rem;
    position: relative; z-index: 1;
  }

  .stat-label {
    font-size: 0.75rem;
    font-weight: 500;
    opacity: 0.85;
    margin-bottom: 0.25rem;
    position: relative; z-index: 1;
  }

  .stat-value {
    font-size: 1.9rem;
    font-weight: 700;
    line-height: 1;
    position: relative; z-index: 1;
  }

  .stat-sub {
    font-size: 0.72rem;
    opacity: 0.75;
    margin-top: 0.2rem;
    position: relative; z-index: 1;
  }

  /* Main Card */
  .schedule-card {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 2px 16px rgba(26, 29, 46, 0.07);
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.4rem 1.8rem;
    border-bottom: 1px solid #f0f2f8;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1d2e;
    margin: 0;
  }

  .card-badge {
    background: #1a1d2e;
    color: #fff;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.3rem 0.85rem;
    border-radius: 100px;
    letter-spacing: 0.04em;
  }

  /* Table */
  .schedule-table {
    width: 100%;
    border-collapse: collapse;
  }

  .schedule-table thead tr {
    background: #f7f8ff;
    border-bottom: 1px solid #edf0f7;
  }

  .schedule-table thead th {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8890b0;
    padding: 0.9rem 1.6rem;
    text-align: left;
  }

  .schedule-table tbody tr {
    border-bottom: 1px solid #f4f5fb;
    transition: background 0.15s ease;
  }

  .schedule-table tbody tr:last-child { border-bottom: none; }
  .schedule-table tbody tr:hover { background: #fafbff; }

  .schedule-table tbody td {
    padding: 1rem 1.6rem;
    font-size: 0.875rem;
    color: #2d3148;
    vertical-align: middle;
  }

  .date-cell {
    font-weight: 600;
    font-size: 0.875rem;
    color: #1a1d2e;
  }

  .time-range {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.84rem;
    color: #4a5080;
    background: #f4f5fb;
    padding: 0.3rem 0.75rem;
    border-radius: 8px;
    font-weight: 500;
  }

  .time-sep {
    width: 14px; height: 1px;
    background: #b0b6d0;
    display: inline-block;
    flex-shrink: 0;
  }

  .hospital-name {
    font-weight: 500;
    color: #1a1d2e;
    display: block;
    font-size: 0.875rem;
  }

  .hospital-location {
    font-size: 0.74rem;
    color: #8890b0;
    margin-top: 0.15rem;
    display: block;
  }

  /* Badges */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 0.3rem 0.8rem;
    border-radius: 100px;
  }

  .badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .badge-pending  { background: #fff8e6; color: #b07c00; border: 1px solid #f5d780; }
  .badge-pending .badge-dot { background: #f0b429; }

  .badge-accepted { background: #e8faf0; color: #1a7a45; border: 1px solid #86e0b0; }
  .badge-accepted .badge-dot { background: #22c55e; }

  .badge-rejected { background: #fff0f0; color: #b02020; border: 1px solid #f0a0a0; }
  .badge-rejected .badge-dot { background: #ef4444; }

  /* Buttons */
  .action-group { display: flex; gap: 0.5rem; }

  .btn {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.42rem 1.1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.18s ease;
    outline: none;
    letter-spacing: 0.02em;
  }

  .btn-accept {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(17, 153, 142, 0.3);
  }
  .btn-accept:hover {
    box-shadow: 0 4px 14px rgba(17, 153, 142, 0.45);
    transform: translateY(-1px);
  }
  .btn-accept:active { transform: translateY(0); }

  .btn-reject {
    background: #fff0f0;
    color: #b02020;
    border: 1px solid #f0a0a0;
  }
  .btn-reject:hover {
    background: #ffe0e0;
    border-color: #e06060;
    transform: translateY(-1px);
  }
  .btn-reject:active { transform: translateY(0); }

  /* States */
  .empty-state { text-align: center; padding: 5rem 2rem; }
  .empty-icon {
    width: 64px; height: 64px;
    background: #f0f2f8;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.25rem;
    font-size: 1.6rem;
  }
  .empty-title { font-size: 1rem; font-weight: 700; color: #1a1d2e; margin: 0 0 0.4rem; }
  .empty-sub   { font-size: 0.84rem; color: #8890b0; margin: 0; }

  .loading-state {
    display: flex; align-items: center; justify-content: center;
    gap: 0.75rem; padding: 5rem 2rem;
    color: #8890b0; font-size: 0.875rem;
  }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid #e0e2ef;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 900px) {
    .stats-row { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 640px) {
    .schedule-root { padding: 1.25rem; }
    .schedule-title { font-size: 1.4rem; }
    .stats-row { grid-template-columns: 1fr; }
    .schedule-table thead { display: none; }
    .schedule-table tbody tr {
      display: block;
      padding: 1rem 1.2rem;
      margin-bottom: 0.75rem;
      border-radius: 14px;
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

  const pendingCount  = schedules.filter((s) => s.status === "PENDING").length;
  const acceptedCount = schedules.filter((s) => s.status === "ACCEPTED").length;

  return (
    <>
      <style>{styles}</style>

      <div className="schedule-root">

        {/* Header */}
        <div className="schedule-header">
          <p className="schedule-greeting">Doctor Portal</p>
          <h1 className="schedule-title">My Schedule</h1>
          <p className="schedule-subtitle">Manage and review your assigned hospital shifts</p>
        </div>

        {/* Stat Cards */}
        {!loading && schedules.length > 0 && (
          <div className="stats-row">
            <div className="stat-card stat-card-blue">
              <div className="stat-icon">📅</div>
              <div className="stat-label">Total Schedules</div>
              <div className="stat-value">{schedules.length}</div>
              <div className="stat-sub">All assigned shifts</div>
            </div>
            <div className="stat-card stat-card-teal">
              <div className="stat-icon">✅</div>
              <div className="stat-label">Accepted</div>
              <div className="stat-value">{acceptedCount}</div>
              <div className="stat-sub">Confirmed shifts</div>
            </div>
            <div className="stat-card stat-card-orange">
              <div className="stat-icon">⏳</div>
              <div className="stat-label">Pending</div>
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-sub">Awaiting your response</div>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="schedule-card">
          <div className="card-header">
            <h2 className="card-title">Schedule Overview</h2>
            {!loading && schedules.length > 0 && (
              <span className="card-badge">
                {pendingCount > 0 ? `${pendingCount} Pending` : `${schedules.length} Total`}
              </span>
            )}
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              Loading schedules…
            </div>
          ) : schedules.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p className="empty-title">No schedules yet</p>
              <p className="empty-sub">Schedules assigned to you will appear here.</p>
            </div>
          ) : (
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
                            <span className="badge-dot" /> Pending
                          </span>
                        )}
                        {s.status === "ACCEPTED" && (
                          <span className="badge badge-accepted">
                            <span className="badge-dot" /> Accepted
                          </span>
                        )}
                        {s.status === "REJECTED" && (
                          <span className="badge badge-rejected">
                            <span className="badge-dot" /> Rejected
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
          )}
        </div>
      </div>
    </>
  );
}