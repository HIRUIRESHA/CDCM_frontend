import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = "http://localhost:8082/ws";

let stompClient = null;


// ==========================================
// CONNECT
// ==========================================

export const connectWebSocket = (onConnected, onError) => {

    stompClient = new Client({

        webSocketFactory: () => {
            return new SockJS(WS_URL);
        },

        reconnectDelay: 5000,

        debug: (str) => {
            console.log("[STOMP]", str);
        },

        onConnect: () => {

            console.log(
                "WebSocket connected"
            );

            if (onConnected) {
                onConnected();
            }
        },

        onStompError: (frame) => {

            console.error(
                "STOMP error:",
                frame
            );

            if (onError) {
                onError(frame);
            }
        },

        onWebSocketError: (error) => {

            console.error(
                "WebSocket error:",
                error
            );

            if (onError) {
                onError(error);
            }
        }
    });


    stompClient.activate();
};


// ==========================================
// SUBSCRIBE TO CONVERSATION
// ==========================================

export const subscribeToConversation = (
    conversationId,
    onMessage
) => {

    if (
        !stompClient ||
        !stompClient.connected
    ) {

        console.warn(
            "WebSocket is not connected"
        );

        return null;
    }


    return stompClient.subscribe(
        `/topic/conversation/${conversationId}`,
        (message) => {

            try {

                const receivedMessage =
                    JSON.parse(message.body);

                if (onMessage) {
                    onMessage(receivedMessage);
                }

            } catch (error) {

                console.error(
                    "Failed to parse WebSocket message:",
                    error
                );

            }
        }
    );
};


// ==========================================
// SEND MESSAGE
// ==========================================

export const sendWebSocketMessage = (
    conversationId,
    senderId,
    senderRole,
    content
) => {

    if (
        !stompClient ||
        !stompClient.connected
    ) {

        console.error(
            "WebSocket is not connected"
        );

        return false;
    }


    stompClient.publish({

        destination: "/app/chat.send",

        body: JSON.stringify({

            conversationId,

            senderId,

            senderRole,

            content

        })
    });


    return true;
};


// ==========================================
// DISCONNECT
// ==========================================

export const disconnectWebSocket = () => {

    if (stompClient) {

        stompClient.deactivate();

        stompClient = null;

        console.log(
            "WebSocket disconnected"
        );
    }
};