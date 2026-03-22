import api from "./api";

/*TEST CATEGORY (Hospital)*/


// Get all test categories
export const getTestCategories = (hospitalId) =>
  api.get(`/api/hospital/tests/${hospitalId}`);

// Add test category
export const addTestCategory = (hospitalId, data) =>
  api.post(`/api/hospital/tests/${hospitalId}`, data);

// Update test category
export const updateTestCategory = (id, data) =>
  api.put(`/api/hospital/tests/${id}`, data);

// Delete test category
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

export const uploadLabReport = (id, data) =>
  api.put(`/api/lab/upload-report/${id}`, data);

export const deleteLabTest = (id) =>
  api.delete(`/api/lab/delete/${id}`);