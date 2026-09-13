import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";



// WEBSOCKET CONFIGURATION


const WS_URL = "http://localhost:8082/ws";



// GLOBAL STOMP CLIENT


let stompClient = null;



// CONNECTION STATE


let isConnecting = false;



// CONNECT WEBSOCKET


export const connectWebSocket = (
    onConnected,
    onError
) => {

    
    // Already connected
    

    if (
        stompClient &&
        stompClient.connected
    ) {

        console.log(
            "WebSocket is already connected."
        );

        if (onConnected) {
            onConnected();
        }

        return;
    }


    
    // Already connecting
    

    if (isConnecting) {

        console.log(
            "WebSocket connection is already in progress."
        );

        return;
    }


    console.log("======================================");
    console.log("CONNECTING TO WEBSOCKET");
    console.log("URL:", WS_URL);
    console.log("======================================");


    isConnecting = true;


    
    // Create STOMP client
    

    const client = new Client({

        // ---------------------------------------------
        // SockJS connection
        // ---------------------------------------------

        webSocketFactory: () => {

            console.log(
                "Creating SockJS connection..."
            );

            return new SockJS(WS_URL);

        },


        // ---------------------------------------------
        // Reconnect automatically
        // ---------------------------------------------

        reconnectDelay: 5000,


        // ---------------------------------------------
        // STOMP debug logs
        // ---------------------------------------------

        debug: (message) => {

            console.log(
                "[STOMP]",
                message
            );

        },


        // ---------------------------------------------
        // Connected
        // ---------------------------------------------

        onConnect: (frame) => {

            isConnecting = false;

            console.log("======================================");
            console.log("STOMP CONNECTION SUCCESSFUL");
            console.log(
                "CONNECTED FRAME:",
                frame
            );
            console.log("======================================");


            // Make sure this client is still the
            // active client.

            if (stompClient !== client) {

                console.warn(
                    "Ignoring connection from an old WebSocket client."
                );

                return;
            }


            if (onConnected) {
                onConnected();
            }

        },


        // ---------------------------------------------
        // STOMP error
        // ---------------------------------------------

        onStompError: (frame) => {

            isConnecting = false;

            console.error("======================================");
            console.error("STOMP ERROR");
            console.error(
                "Message:",
                frame.headers?.message
            );
            console.error(
                "Details:",
                frame.body
            );
            console.error("======================================");


            if (onError) {
                onError(frame);
            }

        },


        // ---------------------------------------------
        // WebSocket error
        // ---------------------------------------------

        onWebSocketError: (error) => {

            isConnecting = false;

            console.error("======================================");
            console.error(
                "WEBSOCKET ERROR:",
                error
            );
            console.error("======================================");


            if (onError) {
                onError(error);
            }

        },


        // ---------------------------------------------
        // WebSocket closed
        // ---------------------------------------------

        onWebSocketClose: (event) => {

            isConnecting = false;

            console.warn("======================================");
            console.warn(
                "WEBSOCKET CONNECTION CLOSED"
            );
            console.warn(
                "Close event:",
                event
            );
            console.warn("======================================");

        }

    });


    
    // Store client
    

    stompClient = client;


    
    // Activate STOMP client
    

    try {

        client.activate();

    } catch (error) {

        isConnecting = false;

        // Only clear if this is still the active client

        if (stompClient === client) {
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



// SUBSCRIBE TO CONVERSATION


export const subscribeToConversation = (
    conversationId,
    onMessage
) => {

    
    // Validate conversation ID
    

    if (!conversationId) {

        console.error(
            "Cannot subscribe. Conversation ID is missing."
        );

        return null;
    }


    
    // Check connection
    

    if (
        !stompClient ||
        !stompClient.connected
    ) {

        console.warn(
            "Cannot subscribe. WebSocket is not connected."
        );

        return null;
    }


    const conversationIdString =
        String(conversationId);


    const destination =
        `/topic/conversation/${conversationIdString}`;


    console.log("======================================");
    console.log(
        "CREATING STOMP SUBSCRIPTION"
    );
    console.log(
        "Conversation ID:",
        conversationIdString
    );
    console.log(
        "Destination:",
        destination
    );
    console.log("======================================");


    try {

        const subscription =
            stompClient.subscribe(

                destination,

                (message) => {

                    console.log(
                        "======================================"
                    );

                    console.log(
                        "STOMP MESSAGE RECEIVED"
                    );

                    console.log(
                        "Destination:",
                        message.headers?.destination
                    );

                    console.log(
                        "Raw body:",
                        message.body
                    );

                    console.log(
                        "======================================"
                    );


                    try {

                        const receivedMessage =
                            JSON.parse(
                                message.body
                            );


                        console.log(
                            "Parsed realtime message:",
                            receivedMessage
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


        console.log(
            "STOMP subscription created successfully."
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



// SEND MESSAGE


export const sendWebSocketMessage = (
    conversationId,
    senderId,
    senderRole,
    content
) => {

    
    // Validate connection
    

    if (
        !stompClient ||
        !stompClient.connected
    ) {

        console.error(
            "Cannot send message. WebSocket is not connected."
        );

        return false;

    }


    
    // Validate conversation ID
    

    if (!conversationId) {

        console.error(
            "Cannot send message. Conversation ID is missing."
        );

        return false;

    }


    
    // Validate sender ID
    

    if (!senderId) {

        console.error(
            "Cannot send message. Sender ID is missing."
        );

        return false;

    }


    
    // Validate content
    

    if (
        !content ||
        !content.trim()
    ) {

        console.error(
            "Cannot send empty message."
        );

        return false;

    }


    
    // Message data
    

    const messageData = {

        conversationId:
            String(conversationId),

        senderId:
            String(senderId),

        senderRole,

        content:
            content.trim()

    };


    console.log("======================================");
    console.log(
        "SENDING STOMP MESSAGE"
    );
    console.log(
        "Destination:",
        "/app/chat.send"
    );
    console.log(
        "Message:",
        messageData
    );
    console.log("======================================");


    try {

        stompClient.publish({

            destination:
                "/app/chat.send",

            body:
                JSON.stringify(
                    messageData
                )

        });


        console.log(
            "STOMP message published successfully."
        );


        return true;

    } catch (error) {

        console.error(
            "Failed to publish STOMP message:",
            error
        );

        return false;

    }

};



// DISCONNECT WEBSOCKET


export const disconnectWebSocket = () => {

    
    // No connection
    

    if (!stompClient) {

        console.log(
            "No WebSocket connection to disconnect."
        );

        isConnecting = false;

        return;

    }


    console.log(
        "Disconnecting WebSocket..."
    );


    const client =
        stompClient;


    

    stompClient = null;

    isConnecting = false;


    try {

       
        client.reconnectDelay = 0;


       
      

        client
            .deactivate()
            .then(() => {

                console.log(
                    "WebSocket disconnected successfully."
                );

            })
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



// CHECK CONNECTION


export const isWebSocketConnected = () => {

    return (
        stompClient !== null &&
        stompClient.connected
    );

};