import api from "../api/api";


// ==========================================
// GET PATIENT CONVERSATIONS
// ==========================================

export const getPatientConversations = async (patientId) => {

    const response = await api.get(
        `/api/chat/patient/${patientId}`
    );

    return response.data;
};


// ==========================================
// GET DOCTOR CONVERSATIONS
// ==========================================

export const getDoctorConversations = async (doctorId) => {

    const response = await api.get(
        `/api/chat/doctor/${doctorId}`
    );

    return response.data;
};


// ==========================================
// GET MESSAGES
// ==========================================

export const getMessages = async (conversationId) => {

    const response = await api.get(
        `/api/chat/${conversationId}/messages`
    );

    return response.data;
};


// ==========================================
// SEND MESSAGE
// ==========================================

export const sendMessage = async (
    conversationId,
    data
) => {

    const response = await api.post(
        `/api/chat/${conversationId}/messages`,
        data
    );

    return response.data;
};

