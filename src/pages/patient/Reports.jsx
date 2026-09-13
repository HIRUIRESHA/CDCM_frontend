import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getPatientTests } from "../../api/labApi";
import axios from "axios";
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

  // ------------------ PAYHERE PAYMENT ------------------
  const handlePayment = async (test) => {
    try {
      setPayingId(test.id);

      // 1. Get hash from backend
      const res = await axios.get(
        `http://localhost:8082/api/payments/generate-hash/${test.id}/${test.price}`
      );

      const data = res.data;

      // 2. Build PayHere object
      const payment = {
        sandbox: true,
        merchant_id: data.merchantId,
        order_id: test.id,
        amount: data.amount,
        currency: data.currency,
        hash: data.hash,

        return_url: "http://localhost:5173/payment-success",
        cancel_url: "http://localhost:5173/payment-failed",
        notify_url: "http://localhost:8082/api/payments/notify",

        items: `Lab Test - ${test.testType}`,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        phone: user.phone || "0771234567",
        address: "Sri Lanka",
        city: "Colombo",
        country: "Sri Lanka",
      };

      // 3. PayHere callbacks
      window.payhere.onCompleted = async function () {
    try {
      
      const token = localStorage.getItem("token");

await axios.post(
  `http://localhost:8082/api/lab/pay/${test.id}`,
  {},
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      // refresh UI after updating DB
      await fetchTests();

      alert("Payment Successful ✅");
    } catch (err) {
      console.error("Payment update failed:", err);
      alert("Payment completed but backend update failed ❌");
    }
  };

      window.payhere.onDismissed = function () {
        alert("Payment cancelled ❌");
      };

      window.payhere.onError = function (error) {
        console.error("PayHere Error:", error);
        alert("Payment error ❌");
      };

      // 4. Start payment
      window.payhere.startPayment(payment);

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

                <p className="text-sm text-gray-500">
                  Date: {test.testDate}
                </p>

                <p className="mt-2">
                  Status: <b>{test.status}</b>
                </p>

                <p className="mt-1">
                  Price: <b>Rs {test.price}</b>
                </p>

                {/* PAYMENT SECTION */}
                <div className="mt-4">
                  {isPaid ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">
                        ✅ Payment Completed
                      </span>

                      {test.paidAt && (
                        <span className="text-xs text-gray-500">
                          on {new Date(test.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-red-600 font-semibold">
                        ⚠ Payment Pending
                      </span>

                      <button
                        onClick={() => handlePayment(test)}
                        disabled={payingId === test.id}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                      >
                        {payingId === test.id ? "Processing..." : "Pay Now"}
                      </button>
                    </div>
                  )}
                </div>

                {/* REPORT SECTION */}
                {isPaid && (
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-blue-600 font-semibold mb-2">
                      Report Section
                    </p>

                    {test.reportStatus === "Uploaded" ? (
                      <div className="space-y-2">

                        {test.reportUrl && (
                          <div className="flex gap-3">
                            <a
                              href={test.reportUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 underline"
                            >
                              📄 View Report
                            </a>

                            <a
                              href={test.reportUrl}
                              download
                              className="text-green-600 underline"
                            >
                              💾 Download Report
                            </a>
                          </div>
                        )}

                        {test.reportText && (
                          <div className="mt-2 bg-white p-3 rounded border">
                            <p className="text-sm text-gray-700">
                              {test.reportText}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Report not uploaded yet
                        </p>

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