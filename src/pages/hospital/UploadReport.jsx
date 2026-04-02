import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadLabReport, getAllLabTests, getPatients } from "../../api/labApi";

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

    // 🔒 FRONTEND PAYMENT CHECK
    if (!testData?.isPaid) {
      alert("Payment required before uploading report");
      return;
    }

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

      await uploadLabReport(id, reportData);

      alert(
        existingUrl || testData?.reportText
          ? "Report Updated Successfully"
          : "Report Uploaded Successfully"
      );

      navigate(-1);
    } catch (error) {
      console.error("Upload failed", error);

      const errorMessage =
        error.response?.data || "Upload failed. Please try again.";
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

          <div className="flex flex-col items-end gap-1">
            <div
              className={`px-4 py-1 rounded-full text-xs font-bold border ${
                testData?.status === "Completed"
                  ? "bg-green-50 text-green-600 border-green-200"
                  : "bg-amber-50 text-amber-600 border-amber-200"
              }`}
            >
              {testData?.status || "Loading..."}
            </div>

            {/* 💰 PAYMENT STATUS */}
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                testData?.isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {testData?.isPaid ? "Paid" : "Unpaid"}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* LEFT SIDE */}
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

        {/* RIGHT SIDE */}
        <div className="md:col-span-7">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">

            {/* 🔴 PAYMENT WARNING */}
            {!testData?.isPaid && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
                ⚠ Payment required before uploading report
              </div>
            )}

            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full"></span>
              {existingUrl || text ? "Edit Findings" : "Upload Final Findings"}
            </h3>

            <div className="space-y-6">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full min-h-[200px] p-4 border rounded-2xl"
              />

              <input type="file" onChange={(e) => setFile(e.target.files[0])} />

              <button
                onClick={handleSubmit}
                disabled={uploading || !testData?.isPaid}
                className={`w-full py-4 rounded-2xl font-bold text-white ${
                  uploading || !testData?.isPaid
                    ? "bg-slate-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {uploading ? "Processing..." : "Upload Report"}
              </button>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}