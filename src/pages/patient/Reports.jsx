import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPatientTests, payForTest } from "../../api/labApi";
import { useNavigate } from "react-router-dom";

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  // ------------------ FETCH TESTS ------------------
  const fetchTests = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const res = await getPatientTests(user.id);
      setTests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching tests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [user]);

  // ------------------ HANDLE PAYMENT ------------------
  const handlePayment = async (id) => {
    try {
      setPayingId(id);

      // Call backend to pay
      await payForTest(id);

      // Refresh all tests to get updated status
      await fetchTests();

      alert("Payment Successful ✅");
    } catch (err) {
      console.error(err);
      alert("Payment failed ❌");
    } finally {
      setPayingId(null);
    }
  };

  // ------------------ NAVIGATE TO REPORT UPLOAD ------------------
  const goToUploadReport = (id) => {
    navigate(`/lab/upload/${id}`);
  };

  if (loading) return <p className="p-6">Loading reports...</p>;

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">My Lab Reports</h1>

      {tests.length === 0 ? (
        <p>No lab tests found</p>
      ) : (
        <div className="grid gap-6">
          {tests.map((test) => {
            const isPaid = test.isPaid || test.paid;
            
            return (
              <div key={test.id} className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-bold">{test.testType}</h2>
                <p className="text-sm text-gray-500">Date: {test.testDate}</p>
                <p className="mt-2">
                  Status: <b>{test.status}</b>
                </p>
                <p className="mt-1">
                  Price: <b>Rs {test.price}</b>
                </p>

                {/* 💰 PAYMENT STATUS - Show payment info only */}
                <div className="mt-4">
                  {isPaid ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">✅ Payment Completed</span>
                      {test.paidAt && (
                        <span className="text-xs text-gray-500">
                          on {new Date(test.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-red-600 font-semibold">⚠ Payment Pending</span>
                      <button
                        onClick={() => handlePayment(test.id)}
                        disabled={payingId === test.id}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                      >
                        {payingId === test.id ? "Processing..." : "Pay Now"}
                      </button>
                    </div>
                  )}
                </div>

                {/* 📄 REPORT SECTION - Only show if paid */}
                {isPaid && (
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-blue-600 font-semibold mb-2">Report Section</p>

                    {test.reportStatus === "Uploaded" ? (
                      <div className="space-y-2">
                        {test.reportUrl && (
                          <div className="flex gap-3">
                            <a
                              href={test.reportUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 underline hover:text-blue-700"
                            >
                              📄 View Report
                            </a>
                            <a
                              href={test.reportUrl}
                              download
                              className="text-green-600 underline hover:text-green-700"
                            >
                              💾 Download Report
                            </a>
                          </div>
                        )}
                        {test.reportText && (
                          <div className="mt-2 bg-white p-3 rounded border border-gray-200">
                            <p className="text-sm text-gray-700">{test.reportText}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Report not uploaded yet</p>
                        <button
                          onClick={() => goToUploadReport(test.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          📤 Upload Report
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reports;