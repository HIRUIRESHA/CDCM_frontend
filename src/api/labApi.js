// import api from "./api";

// /*TEST CATEGORY (Hospital)*/


// // Get all test categories
// export const getTestCategories = (hospitalId) =>
//   api.get(`/api/hospital/tests/${hospitalId}`);

// // Add test category
// export const addTestCategory = (hospitalId, data) =>
//   api.post(`/api/hospital/tests/${hospitalId}`, data);

// // Update test category
// export const updateTestCategory = (id, data) =>
//   api.put(`/api/hospital/tests/${id}`, data);

// // Delete test category
// export const deleteTestCategory = (id) =>
//   api.delete(`/api/hospital/tests/${id}`);



// /* LAB TEST (Patient Tests)*/

// // Get patients (dropdown)
// export const getPatients = () =>
//   api.get("/api/lab/patients");

// // Add lab test
// export const addLabTest = (data) =>
//   api.post("/api/lab/add", data);

// // Get all lab tests
// export const getAllLabTests = () =>
//   api.get("/api/lab/all");

// // Get single test
// export const getLabTestById = (id) =>
//   api.get(`/api/lab/${id}`);

// // Update lab test
// export const updateLabTest = (id, data) =>
//   api.put(`/api/lab/update/${id}`, data);

// // Text-only report upload
// export const uploadLabReport = (id, data) =>
//   api.put(`/api/lab/upload-report/${id}`, data);

// // File upload through backend
// export const uploadLabReportWithFile = (id, file, reportText) => {
//   const formData = new FormData();
  
//   if (file) {
//     formData.append("file", file);
//   }
  
//   if (reportText && reportText.trim()) {
//     formData.append("reportText", reportText);
//   }
  
//   return api.post(`/api/lab/upload-report-with-file/${id}`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
// };

// export const deleteLabTest = (id) =>
//   api.delete(`/api/lab/delete/${id}`);

// // Get tests for logged patient
// export const getPatientTests = (patientId) =>
//   api.get(`/api/lab/patient/${patientId}`);

// // Pay for test
// export const payForTest = (id) =>
//   api.post(`/api/lab/pay/${id}`);

// // Get the download URL
// export const downloadLabReport = (id) => {
//   return api.get(`/api/lab/download-report/${id}`);
// };

import api from "./api";

/*TEST CATEGORY (Hospital)*/
export const getTestCategories = (hospitalId) =>
  api.get(`/api/hospital/tests/${hospitalId}`);

export const addTestCategory = (hospitalId, data) =>
  api.post(`/api/hospital/tests/${hospitalId}`, data);

export const updateTestCategory = (id, data) =>
  api.put(`/api/hospital/tests/${id}`, data);

export const deleteTestCategory = (id) =>
  api.delete(`/api/hospital/tests/${id}`);


/* LAB TEST (Patient Tests)*/

// Get patients (dropdown)
export const getPatients = () =>
  api.get("/api/lab/patients");

// Add lab test
export const addLabTest = (data) =>
  api.post("/api/lab/add", data);

// Get all lab tests
export const getAllLabTests = () =>
  api.get("/api/lab/all");

// Get single test
export const getLabTestById = (id) =>
  api.get(`/api/lab/${id}`);

// Update lab test
export const updateLabTest = (id, data) =>
  api.put(`/api/lab/update/${id}`, data);

// Text-only report upload
export const uploadLabReport = (id, data) =>
  api.put(`/api/lab/upload-report/${id}`, data);

// File upload through backend
export const uploadLabReportWithFile = (id, file, reportText) => {
  const formData = new FormData();
  
  if (file) {
    formData.append("file", file);
  }
  
  if (reportText && reportText.trim()) {
    formData.append("reportText", reportText);
  }
  
  return api.post(`/api/lab/upload-report-with-file/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteLabTest = (id) =>
  api.delete(`/api/lab/delete/${id}`);

// Get tests for logged patient
export const getPatientTests = (patientId) =>
  api.get(`/api/lab/patient/${patientId}`);

// Pay for test
export const payForTest = (id) =>
  api.post(`/api/lab/pay/${id}`);

// ✅ FIXED: Get download URL
export const getDownloadUrl = (id) =>
  api.get(`/api/lab/download-report/${id}`);

// ✅ NEW: Direct file download through backend (bypasses CORS)
export const downloadReportFile = (id) =>
  api.get(`/api/lab/download-report-file/${id}`, {
    responseType: 'blob' // Important for file download
  });