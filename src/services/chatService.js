import api from "../api/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";


// =========================================================
// CHAT API
// =========================================================


// =========================================================
// GET PATIENT CONVERSATIONS
// =========================================================

export const getPatientConversations = async (
    patientId
) => {

    if (!patientId) {
        return [];
    }

    const response = await api.get(
        `/api/chat/patient/${patientId}`
    );

    return Array.isArray(response.data)
        ? response.data
        : [];
};


// =========================================================
// GET DOCTOR CONVERSATIONS
// =========================================================

export const getDoctorConversations = async (
    doctorId
) => {

    if (!doctorId) {
        return [];
    }

    const response = await api.get(
        `/api/chat/doctor/${doctorId}`
    );

    return Array.isArray(response.data)
        ? response.data
        : [];
};


// =========================================================
// GET MESSAGES
// =========================================================

export const getMessages = async (
    conversationId
) => {

    if (!conversationId) {
        return [];
    }

    const response = await api.get(
        `/api/chat/${conversationId}/messages`
    );

    return Array.isArray(response.data)
        ? response.data
        : [];
};


// =========================================================
// SEND MESSAGE
// =========================================================

export const sendMessage = async (
    conversationId,
    data
) => {

    if (!conversationId) {
        throw new Error(
            "Conversation ID is required."
        );
    }

    const response = await api.post(
        `/api/chat/${conversationId}/messages`,
        data
    );

    return response.data;
};



// =========================================================
// WEBSOCKET CONFIGURATION
// =========================================================

const WS_URL =
    "https://cdcm-backend.onrender.com/ws";


// =========================================================
// GLOBAL STOMP CLIENT
// =========================================================

let stompClient = null;


// =========================================================
// CONNECTION STATE
// =========================================================

let isConnecting = false;


// =========================================================
// CONNECT WEBSOCKET
// =========================================================

export const connectWebSocket = (
    onConnected,
    onError
) => {

    // -----------------------------------------------------
    // Already connected
    // -----------------------------------------------------

    if (
        stompClient &&
        stompClient.connected
    ) {

        if (onConnected) {
            onConnected();
        }

        return;
    }


    // -----------------------------------------------------
    // Already connecting
    // -----------------------------------------------------

    if (isConnecting) {
        return;
    }


    isConnecting = true;


    // -----------------------------------------------------
    // Create STOMP client
    // -----------------------------------------------------

    const client = new Client({

        webSocketFactory: () => {
            return new SockJS(WS_URL);
        },


        // -------------------------------------------------
        // Reconnect after connection loss
        // -------------------------------------------------

        reconnectDelay: 5000,


        // -------------------------------------------------
        // Disable heavy STOMP console logging
        // -------------------------------------------------

        debug: () => {},


        // -------------------------------------------------
        // Connected
        // -------------------------------------------------

        onConnect: (frame) => {

            isConnecting = false;


            // Make sure this is still the
            // active client.

            if (
                stompClient !== client
            ) {
                return;
            }


            console.log(
                "WebSocket connected."
            );


            if (onConnected) {
                onConnected(frame);
            }

        },


        // -------------------------------------------------
        // STOMP error
        // -------------------------------------------------

        onStompError: (frame) => {

            isConnecting = false;

            console.error(
                "STOMP error:",
                frame.headers?.message ||
                "Unknown error"
            );


            if (onError) {
                onError(frame);
            }

        },


        // -------------------------------------------------
        // WebSocket error
        // -------------------------------------------------

        onWebSocketError: (error) => {

            isConnecting = false;

            console.error(
                "WebSocket error:",
                error
            );


            if (onError) {
                onError(error);
            }

        },


        // -------------------------------------------------
        // WebSocket closed
        // -------------------------------------------------

        onWebSocketClose: () => {

            isConnecting = false;

        }

    });


    // -----------------------------------------------------
    // Store client
    // -----------------------------------------------------

    stompClient = client;


    // -----------------------------------------------------
    // Activate
    // -----------------------------------------------------

    try {

        client.activate();

    } catch (error) {

        isConnecting = false;


        if (
            stompClient === client
        ) {
            stompClient = null;
        }


        console.error(
            "Failed to activate WebSocket:",
            error
        );


        if (onError) {
            onError(error);
        }

    }

};



// =========================================================
// SUBSCRIBE TO CONVERSATION
// =========================================================

export const subscribeToConversation = (
    conversationId,
    onMessage
) => {

    if (!conversationId) {
        return null;
    }


    if (
        !stompClient ||
        !stompClient.connected
    ) {

        console.warn(
            "WebSocket is not connected."
        );

        return null;
    }


    const conversationIdString =
        String(conversationId);


    const destination =
        `/topic/conversation/${conversationIdString}`;


    try {

        const subscription =
            stompClient.subscribe(
                destination,
                (message) => {

                    try {

                        const receivedMessage =
                            JSON.parse(
                                message.body
                            );


                        if (onMessage) {

                            onMessage(
                                receivedMessage
                            );

                        }

                    } catch (error) {

                        console.error(
                            "Failed to parse WebSocket message:",
                            error
                        );

                    }

                }
            );


        return subscription;

    } catch (error) {

        console.error(
            "Failed to subscribe to conversation:",
            error
        );

        return null;

    }

};



// =========================================================
// SEND MESSAGE THROUGH WEBSOCKET
// =========================================================

export const sendWebSocketMessage = (
    conversationId,
    senderId,
    senderRole,
    content
) => {

    // -----------------------------------------------------
    // Validate connection
    // -----------------------------------------------------

    if (
        !stompClient ||
        !stompClient.connected
    ) {

        console.error(
            "Cannot send message. WebSocket is not connected."
        );

        return false;
    }


    // -----------------------------------------------------
    // Validate conversation
    // -----------------------------------------------------

    if (!conversationId) {

        console.error(
            "Conversation ID is missing."
        );

        return false;
    }


    // -----------------------------------------------------
    // Validate sender
    // -----------------------------------------------------

    if (!senderId) {

        console.error(
            "Sender ID is missing."
        );

        return false;
    }


    // -----------------------------------------------------
    // Validate content
    // -----------------------------------------------------

    if (
        !content ||
        !content.trim()
    ) {

        console.error(
            "Cannot send empty message."
        );

        return false;
    }


    // -----------------------------------------------------
    // Message data
    // -----------------------------------------------------

    const messageData = {

        conversationId:
            String(conversationId),

        senderId:
            String(senderId),

        senderRole,

        content:
            content.trim()

    };


    try {

        stompClient.publish({

            destination:
                "/app/chat.send",

            body:
                JSON.stringify(
                    messageData
                )

        });


        return true;

    } catch (error) {

        console.error(
            "Failed to publish WebSocket message:",
            error
        );

        return false;

    }

};



// =========================================================
// DISCONNECT WEBSOCKET
// =========================================================

export const disconnectWebSocket = () => {

    if (!stompClient) {

        isConnecting = false;

        return;

    }


    const client =
        stompClient;


    stompClient = null;

    isConnecting = false;


    try {

        client.reconnectDelay = 0;


        client
            .deactivate()
            .catch((error) => {

                console.error(
                    "Failed to disconnect WebSocket:",
                    error
                );

            });

    } catch (error) {

        console.error(
            "Failed to disconnect WebSocket:",
            error
        );

    }

};




// CHECK WEBSOCKET CONNECTION


export const isWebSocketConnected = () => {

    return (
        stompClient !== null &&
        stompClient.connected
    );

};