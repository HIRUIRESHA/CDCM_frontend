import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadLabReport, getAllLabTests, getPatients, addLabTest } from "../../api/labApi";

export default function UploadReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [testData, setTestData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [existingUrl, setExistingUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const testsRes = await getAllLabTests();
      const currentTest = testsRes.data.find((t) => t.id === id);

      if (currentTest) {
        setTestData(currentTest);

        if (currentTest.reportText) setText(currentTest.reportText);
        if (currentTest.reportUrl) setExistingUrl(currentTest.reportUrl);

        const patientsRes = await getPatients();
        const currentPatient = patientsRes.data.find(
          (p) => p.id === currentTest.patientId
        );
        setPatientData(currentPatient);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    setUploading(true);

    let reportData = {
      reportText: text,
      reportUrl: existingUrl,
    };

    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "lab_unsigned_preset");
        formData.append("folder", "lab_reports");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dannasesv/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        reportData.reportUrl = data.secure_url;
      }

      // Sends only reportText and reportUrl to the backend
      await uploadLabReport(id, reportData);

      alert(
        existingUrl || testData?.reportText
          ? "Report Updated Successfully"
          : "Report Uploaded Successfully"
      );

      navigate(-1);
    } catch (error) {
      console.error("Upload failed", error);
      
      const errorMessage = error.response?.data || "Upload failed. Please try again.";
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20 font-sans">
      
      {/* header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => navigate("/hospital/addLabTest")}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 font-semibold"
          >
            ← Back to Add Test
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {existingUrl || text ? "Edit Lab Report" : "Generate Lab Report"}
            </h2>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">
              Test ID: T-{id?.slice(-5)}
            </p>
          </div>

          <div
            className={`px-4 py-1 rounded-full text-xs font-bold border ${
              testData?.status === "Completed"
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-amber-50 text-amber-600 border-amber-200"
            }`}
          >
            {testData?.status || "Loading..."}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        
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
                  P-{testData?.patientId}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500 text-sm">Contact</span>
                <span className="font-medium text-slate-700">
                  {patientData?.contactNumber}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">Email</span>
                <span className="font-medium text-slate-700">
                  {patientData?.email}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-3xl shadow-xl text-white">
            <h3 className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-4">
              Test Details
            </h3>
            <div className="text-2xl font-bold mb-1">{testData?.testType}</div>
            <div className="text-blue-100 text-sm opacity-80 italic mb-4 font-light">
              Performed on: {testData?.testDate}
            </div>

            {existingUrl && (
              <a
                href={existingUrl}
                target="_blank"
                rel="noreferrer"
                className="block mb-4 text-xs bg-white/10 hover:bg-white/20 p-2 rounded-lg text-center transition-all underline"
              >
                View Current Attachment ↗
              </a>
            )}

            <div className="bg-blue-500/30 p-3 rounded-xl border border-blue-400/30 flex justify-between items-center">
              <span className="text-sm font-medium">Billed Amount</span>
              <span className="text-xl font-black">Rs {testData?.price}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full"></span>
              {existingUrl || text ? "Edit Findings" : "Upload Final Findings"}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                  Medical Observations
                </label>
                <textarea
                  placeholder="Enter detailed test results, observations, or doctor's notes here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[200px] p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                  {existingUrl ? "Replace Attachment (Optional)" : "Attachment (PDF/Image)"}
                </label>

                <div className="relative group">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-dashed border-slate-300 p-2 rounded-2xl group-hover:border-blue-400 transition-colors"
                  />
                </div>

                <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">
                  *Supported formats: PDF, JPG, PNG (Max 5MB)
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={uploading}
                className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-3 ${
                  uploading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 shadow-green-200"
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  existingUrl || text ? "Update Report" : "Finalize & Upload Report"
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}