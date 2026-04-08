import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  uploadLabReportWithFile,
  uploadLabReport,
  getLabTestById,
  getPatients,
} from "../../api/labApi";

export default function UploadReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [testData, setTestData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [existingUrl, setExistingUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // ------------------ FETCH TEST AND PATIENT DATA ------------------
  const fetchTestData = async () => {
    try {
      if (!user?.id) {
        console.log("User not loaded yet");
        return;
      }

      console.log("Fetching test data for ID:", id);
      const testRes = await getLabTestById(id);
      const currentTest = testRes.data;

      if (currentTest) {
        setTestData(currentTest);
        setText(currentTest.reportText || "");
        setExistingUrl(currentTest.reportUrl || "");
      }

      const patientsRes = await getPatients();
      const currentPatient = patientsRes.data.find(
        (p) => p.id === currentTest?.patientId
      );
      setPatientData(currentPatient);
    } catch (err) {
      console.error("Error fetching test data:", err);
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else {
        alert("Failed to load test data");
      }
    }
  };

  useEffect(() => {
    if (id && user?.id) {
      fetchTestData();
    }
  }, [id, user]);

  // ------------------ VALIDATE BEFORE UPLOAD ------------------
  const validateUpload = () => {
    if (!text.trim() && !file) {
      alert("⚠ Please either enter report text OR upload a file before submitting.");
      return false;
    }
    return true;
  };

  // ------------------ HANDLE REPORT UPLOAD ------------------
  const handleSubmit = async () => {
    if (!user?.id) {
      alert("Please login again.");
      navigate("/login");
      return;
    }

    if (!testData?.paid && !testData?.isPaid) {
      alert("⚠ Payment required before uploading report");
      return;
    }

    if (!validateUpload()) return;

    setUploading(true);

    try {
      let response;

      if (file) {
        console.log("Uploading file through backend...");
        response = await uploadLabReportWithFile(id, file, text);
      } else {
        console.log("Updating text only...");
        const reportData = {
          reportText: text.trim(),
          reportUrl: existingUrl,
        };
        response = await uploadLabReport(id, reportData);
      }

      let updatedData;
      if (response.data && response.data.data) {
        updatedData = response.data.data;
      } else if (response.data) {
        updatedData = response.data;
      }

      if (updatedData) {
        setTestData(updatedData);
        setText(updatedData.reportText || "");
        setExistingUrl(updatedData.reportUrl || "");
      }

      setUploadSuccess(true);

      const hasReportNow =
        (updatedData?.reportUrl && updatedData.reportUrl.trim() !== "") ||
        (updatedData?.reportText && updatedData.reportText.trim() !== "");

      alert(
        hasReportNow
          ? "✅ Report Updated Successfully"
          : "✅ Report Uploaded Successfully"
      );

      await fetchTestData();
      setFile(null);

      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Upload failed", error);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else {
        alert(
          error.response?.data?.message ||
            error.response?.data ||
            "Upload failed. Please try again."
        );
      }
    } finally {
      setUploading(false);
    }
  };

  // ------------------ HANDLE VIEW/DOWNLOAD REPORT ------------------
  const handleViewDownloadReport = () => {
    // Directly use the reportUrl from testData instead of making an API call
    const fileUrl = testData?.reportUrl;
    
    if (!fileUrl) {
      alert("No report file available.");
      return;
    }

    // Open the Cloudinary URL directly in a new tab
    // Cloudinary URLs are public, so no authentication needed
    window.open(fileUrl, '_blank');
  };

  if (!testData) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test details...</p>
        </div>
      </div>
    );
  }

  const isPaid = testData.paid || testData.isPaid;
  const hasReport =
    (testData.reportUrl && testData.reportUrl.trim() !== "") ||
    (testData.reportText && testData.reportText.trim() !== "");

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20 font-sans">
      {uploadSuccess && (
        <div className="fixed top-24 right-6 z-50 animate-slide-down">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span>Report uploaded successfully!</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate("/hospital/addLabTest")}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 font-semibold"
          >
            ← Back
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {hasReport ? "View & Edit Lab Report" : "Upload Lab Report"}
            </h2>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">
              Test ID: {id?.slice(-8)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className={`px-4 py-1 rounded-full text-xs font-bold border`}>
              {testData?.status || "Pending"}
            </div>

            <div
              className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isPaid ? "✅ Paid" : "⚠ Unpaid"}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* LEFT SIDE - Patient & Test Information */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
              Patient Information
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-sm">Full Name</span>
                <span className="font-bold text-slate-800">
                  {patientData?.firstName} {patientData?.lastName}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-sm">Patient ID</span>
                <span className="font-semibold text-blue-600">
                  {testData?.patientId}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-sm">Contact</span>
                <span className="font-medium text-slate-700">
                  {patientData?.contactNumber || "N/A"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Email</span>
                <span className="font-medium text-slate-700">
                  {patientData?.email || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-3xl shadow-xl text-white ${
            isPaid ? "bg-gradient-to-br from-blue-600 to-blue-700" : "bg-gradient-to-br from-gray-500 to-gray-600"
          }`}>
            <h3 className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">
              Test Details
            </h3>
            <div className="text-2xl font-bold mb-1">{testData?.testType}</div>
            <div className="text-blue-100 text-sm opacity-80 italic mb-2 font-light">
              Test Date: {testData?.testDate}
            </div>
            <div className="text-blue-100 text-sm opacity-80 italic mb-4 font-light">
              Requested: {testData?.requestedDate}
            </div>

            <div className="bg-white/20 p-3 rounded-xl border border-white/30 flex justify-between items-center">
              <span className="text-sm font-medium">Billed Amount</span>
              <span className="text-xl font-black">Rs {testData?.price}</span>
            </div>

            {isPaid && testData?.paidAt && (
              <div className="mt-4 p-2 bg-green-500/30 rounded-lg text-center text-xs">
                💰 Paid on {new Date(testData.paidAt).toLocaleDateString()}
              </div>
            )}

            {!isPaid && (
              <div className="mt-4 p-2 bg-red-500/30 rounded-lg text-center text-xs">
                ⚠ Unpaid - Please complete payment from Reports page
              </div>
            )}
          </div>

          {/* UPLOADED REPORT PREVIEW SECTION */}
          {isPaid && hasReport && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>📄</span> Uploaded Report
              </h3>
              
              {/* Report File Section - Fixed download button */}
              {testData.reportUrl && testData.reportUrl.trim() !== "" && (
                <div className="mb-4">
                  <button
                    onClick={handleViewDownloadReport}
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 underline font-medium"
                  >
                    <span>📄</span> View / Download Report File
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to view or download the report (PDF/Image)
                  </p>
                </div>
              )}
              
              {/* Report Text Section */}
              {testData.reportText && testData.reportText.trim() !== "" && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-600 mb-2">Report Findings:</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{testData.reportText}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE - Report Upload Section */}
        <div className="md:col-span-7">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            {!isPaid ? (
              // LOCKED STATE - Payment Required
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Payment Required</h3>
                <p className="text-gray-600 mb-6">
                  This test hasn't been paid for yet.<br />
                  Please complete the payment from the Reports page first.
                </p>
                <button
                  onClick={() => navigate("/lab/reports")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                >
                  Go to Reports
                </button>
              </div>
            ) : (
              // UNLOCKED STATE - Can upload report
              <>
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold flex items-center gap-2">
                  <span>✅</span>
                  Payment confirmed - You can now upload or edit the report
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                  {hasReport ? "Edit Report Findings" : "Upload Report Findings"}
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Report Text / Findings {!file && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full min-h-[200px] p-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter detailed report findings here... (Required if no file is attached)"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {!file ? "Either report text OR file is required" : "Optional if file is attached"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Attach File (PDF/Image) {!text.trim() && <span className="text-red-500">*</span>}
                    </label>
                    <input 
                      type="file" 
                      onChange={(e) => setFile(e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="w-full p-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Supported formats: PDF, JPG, PNG, DOC (Max 5MB)
                      {!text.trim() && " - Required if no text is entered"}
                    </p>
                    {file && (
                      <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                        <span>✅</span> Selected: {file.name}
                      </div>
                    )}
                    {existingUrl && !file && (
                      <div className="mt-2 text-sm text-blue-600 flex items-center gap-1">
                        <span>📎</span> Current file attached
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <p className="text-sm text-yellow-800 flex items-start gap-2">
                      <span>ℹ️</span>
                      <span>You must provide either report text OR upload a file. Both can be provided together.</span>
                    </p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="w-full py-4 rounded-2xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Uploading...
                      </span>
                    ) : (
                      hasReport ? "✏️ Update Report" : "📤 Upload Report"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}