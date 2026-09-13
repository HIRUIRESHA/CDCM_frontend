import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    getMessages
} from "../../services/chatService";

import {
    connectWebSocket,
    subscribeToConversation,
    sendWebSocketMessage,
    disconnectWebSocket
} from "../../services/webSocketService";


const ChatWindow = ({
    conversation,
    conversations = [],
    currentUser,
    onConversationMessage
}) => {

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [connected, setConnected] = useState(false);


    
    // REFS
    

    const messagesEndRef =
        useRef(null);

    // Store all active subscriptions
    const subscriptionsRef =
        useRef([]);

    // Currently opened conversation
    const activeConversationRef =
        useRef(null);

    // Keep latest callback without forcing subscriptions
    // to be recreated every render
    const onConversationMessageRef =
        useRef(onConversationMessage);


    
    // UPDATE CALLBACK REF
    

    useEffect(() => {

        onConversationMessageRef.current =
            onConversationMessage;

    }, [onConversationMessage]);


    
    // CONNECT WEBSOCKET
    

    useEffect(() => {

        if (!currentUser?.id) {
            return;
        }

        let mounted = true;


        console.log(
            "======================================"
        );

        console.log(
            "Connecting to WebSocket..."
        );

        console.log(
            "Current user:",
            currentUser.id
        );

        console.log(
            "======================================"
        );


        connectWebSocket(

            () => {

                if (!mounted) {
                    return;
                }

                console.log(
                    "======================================"
                );

                console.log(
                    "WEBSOCKET CONNECTED"
                );

                console.log(
                    "======================================"
                );

                setConnected(true);

            },

            (error) => {

                if (!mounted) {
                    return;
                }

                console.error(
                    "WebSocket connection error:",
                    error
                );

                setConnected(false);

            }

        );


        return () => {

            mounted = false;

            console.log(
                "Cleaning up WebSocket..."
            );


            setConnected(false);


            
            // Remove all subscriptions
            

            subscriptionsRef.current.forEach(
                (subscription) => {

                    try {

                        subscription.unsubscribe();

                    } catch (error) {

                        console.error(
                            "Failed to unsubscribe:",
                            error
                        );

                    }

                }
            );


            subscriptionsRef.current = [];


            activeConversationRef.current =
                null;


            
            // Disconnect WebSocket
            
            disconnectWebSocket();

        };

    }, [currentUser?.id]);


    
    // UPDATE ACTIVE CONVERSATION REF
    

    useEffect(() => {

        activeConversationRef.current =
            conversation?.id
                ? String(conversation.id)
                : null;

    }, [conversation?.id]);


    
    // LOAD EXISTING MESSAGES
    

    useEffect(() => {

        if (!conversation?.id) {

            setMessages([]);

            return;

        }


        const conversationId =
            String(conversation.id);


        console.log(
            "======================================"
        );

        console.log(
            "Opening conversation:",
            conversationId
        );

        console.log(
            "======================================"
        );


        activeConversationRef.current =
            conversationId;


        let cancelled = false;


        const loadMessages = async () => {

            try {

                setLoading(true);


                console.log(
                    "Loading messages for conversation:",
                    conversationId
                );


                const data =
                    await getMessages(
                        conversationId
                    );


                if (cancelled) {
                    return;
                }


                const databaseMessages =
                    Array.isArray(data)
                        ? data
                        : [];


                console.log(
                    "Existing messages:",
                    databaseMessages
                );


                setMessages(
                    (currentMessages) => {

                        const mergedMessages = [
                            ...databaseMessages
                        ];


                        currentMessages.forEach(
                            (currentMessage) => {

                                if (!currentMessage) {
                                    return;
                                }


                                // Only keep messages belonging
                                // to the currently opened chat
                                if (
                                    currentMessage.conversationId &&
                                    String(
                                        currentMessage.conversationId
                                    ) !== conversationId
                                ) {

                                    return;

                                }


                                const alreadyExists =
                                    mergedMessages.some(
                                        (databaseMessage) => {

                                            if (
                                                databaseMessage?.id &&
                                                currentMessage?.id
                                            ) {

                                                return (
                                                    String(
                                                        databaseMessage.id
                                                    ) ===
                                                    String(
                                                        currentMessage.id
                                                    )
                                                );

                                            }

                                            return false;

                                        }
                                    );


                                if (!alreadyExists) {

                                    mergedMessages.push(
                                        currentMessage
                                    );

                                }

                            }
                        );


                        // Sort oldest -> newest
                        mergedMessages.sort(
                            (a, b) => {

                                const timeA =
                                    a?.sentAt
                                        ? new Date(
                                              a.sentAt
                                          ).getTime()
                                        : 0;


                                const timeB =
                                    b?.sentAt
                                        ? new Date(
                                              b.sentAt
                                          ).getTime()
                                        : 0;


                                return (
                                    timeA -
                                    timeB
                                );

                            }
                        );


                        return mergedMessages;

                    }
                );

            } catch (error) {

                if (!cancelled) {

                    console.error(
                        "Failed to load messages:",
                        error
                    );

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        };


        loadMessages();


        return () => {

            cancelled = true;

        };

    }, [conversation?.id]);


    
    // CONVERSATION IDS
    //
    // IMPORTANT:
    // Only the IDs are used as dependency.
    //
    // When lastMessage changes, subscriptions will NOT
    // be destroyed and recreated.
    

    const conversationIdsKey =
        conversations
            .map(
                (item) =>
                    item?.id
                        ? String(item.id)
                        : null
            )
            .filter(Boolean)
            .join("|");


    
    // SUBSCRIBE TO ALL CONVERSATIONS
    

    useEffect(() => {

        if (
            !connected ||
            !conversationIdsKey
        ) {

            return;

        }


        console.log(
            "======================================"
        );

        console.log(
            "SUBSCRIBING TO ALL CONVERSATIONS"
        );

        console.log(
            "Conversation IDs:",
            conversationIdsKey
        );

        console.log(
            "======================================"
        );


        
        // Remove old subscriptions
       

        subscriptionsRef.current.forEach(
            (subscription) => {

                try {

                    subscription.unsubscribe();

                } catch (error) {

                    console.error(
                        "Failed to remove subscription:",
                        error
                    );

                }

            }
        );


        subscriptionsRef.current = [];


        
        // Subscribe to every conversation
        

        const conversationIdList =
            conversationIdsKey
                .split("|")
                .filter(Boolean);


        conversationIdList.forEach(
            (conversationId) => {

                console.log(
                    "Creating subscription for:",
                    conversationId
                );


                const subscription =
                    subscribeToConversation(

                        conversationId,

                        (newMessage) => {

                            console.log(
                                "======================================"
                            );

                            console.log(
                                "REALTIME MESSAGE RECEIVED"
                            );

                            console.log(
                                "Conversation:",
                                conversationId
                            );

                            console.log(
                                "Message:",
                                newMessage
                            );

                            console.log(
                                "======================================"
                            );


                            
                            // Ignore malformed messages
                            

                            if (
                                !newMessage?.conversationId
                            ) {

                                return;

                            }


                            const messageConversationId =
                                String(
                                    newMessage.conversationId
                                );


                            
                            // Safety check
                            

                            if (
                                messageConversationId !==
                                conversationId
                            ) {

                                console.warn(
                                    "Conversation ID mismatch:",
                                    {
                                        subscriptionConversationId:
                                            conversationId,
                                        messageConversationId
                                    }
                                );

                                return;

                            }


                            

                            if (
                                onConversationMessageRef.current
                            ) {

                                onConversationMessageRef.current(
                                    newMessage
                                );

                            }


                            
                            // If this is NOT the currently opened chat,
                            // don't add it to ChatWindow messages.
                            

                            if (
                                activeConversationRef.current !==
                                messageConversationId
                            ) {

                                console.log(
                                    "Message belongs to another conversation."
                                );

                                console.log(
                                    "Updating conversation list only."
                                );

                                return;

                            }


                            
                            // Add realtime message to current chat
                            

                            setMessages(
                                (previousMessages) => {

                                    const alreadyExists =
                                        previousMessages.some(
                                            (message) => {

                                                if (
                                                    message?.id &&
                                                    newMessage?.id
                                                ) {

                                                    return (
                                                        String(
                                                            message.id
                                                        ) ===
                                                        String(
                                                            newMessage.id
                                                        )
                                                    );

                                                }

                                                return false;

                                            }
                                        );


                                    if (
                                        alreadyExists
                                    ) {

                                        console.log(
                                            "Duplicate realtime message ignored:",
                                            newMessage?.id
                                        );

                                        return previousMessages;

                                    }


                                    const updatedMessages = [
                                        ...previousMessages,
                                        newMessage
                                    ];


                                    updatedMessages.sort(
                                        (a, b) => {

                                            const timeA =
                                                a?.sentAt
                                                    ? new Date(
                                                          a.sentAt
                                                      ).getTime()
                                                    : 0;


                                            const timeB =
                                                b?.sentAt
                                                    ? new Date(
                                                          b.sentAt
                                                      ).getTime()
                                                    : 0;


                                            return (
                                                timeA -
                                                timeB
                                            );

                                        }
                                    );


                                    return updatedMessages;

                                }
                            );

                        }

                    );


                if (subscription) {

                    subscriptionsRef.current.push(
                        subscription
                    );

                    console.log(
                        "Subscription created:",
                        conversationId
                    );

                }

            }
        );


        // -----------------------------------------------------
        // Cleanup
        // -----------------------------------------------------

        return () => {

            console.log(
                "Cleaning up conversation subscriptions..."
            );


            subscriptionsRef.current.forEach(
                (subscription) => {

                    try {

                        subscription.unsubscribe();

                    } catch (error) {

                        console.error(
                            "Failed to unsubscribe:",
                            error
                        );

                    }

                }
            );


            subscriptionsRef.current = [];

        };

    }, [
        connected,
        conversationIdsKey
    ]);


    
    // AUTO SCROLL
    

    useEffect(() => {

        if (!messagesEndRef.current) {
            return;
        }


        messagesEndRef.current.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);


    
    // SEND MESSAGE
    

    const handleSend = () => {

        const messageText =
            text.trim();


        if (
            !messageText ||
            sending ||
            !conversation?.id ||
            !currentUser?.id
        ) {

            return;

        }


        if (!connected) {

            console.error(
                "Cannot send message. WebSocket is not connected."
            );

            return;

        }


        const conversationId =
            String(
                conversation.id
            );


        const senderId =
            String(
                currentUser.id
            );


        console.log(
            "======================================"
        );

        console.log(
            "SENDING MESSAGE"
        );

        console.log(
            "Conversation:",
            conversationId
        );

        console.log(
            "Sender:",
            senderId
        );

        console.log(
            "Role:",
            currentUser.role
        );

        console.log(
            "Content:",
            messageText
        );

        console.log(
            "======================================"
        );


        setSending(true);


        try {

            const success =
                sendWebSocketMessage(

                    conversationId,

                    senderId,

                    currentUser.role,

                    messageText

                );


            if (success) {

                console.log(
                    "Message sent successfully through WebSocket."
                );

                setText("");

            } else {

                console.error(
                    "Message could not be sent."
                );

            }

        } catch (error) {

            console.error(
                "Failed to send WebSocket message:",
                error
            );

        } finally {

            setSending(false);

        }

    };


    
    // ENTER KEY
    

    const handleKeyDown = (
        event
    ) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSend();

        }

    };


    
    // EMPTY STATE
    

    if (!conversation) {

        return (

            <div className="flex-1 flex items-center justify-center bg-gray-50">

                <div className="text-center text-gray-400">

                    <div className="text-5xl mb-3">
                        💬
                    </div>

                    <p className="font-medium">
                        Select a conversation
                    </p>

                    <p className="text-sm mt-1">
                        Choose an appointment to start messaging
                    </p>

                </div>

            </div>

        );

    }


    
    // CONVERSATION NAME
    

    const conversationName =
        currentUser?.role === "DOCTOR"
            ? conversation.patientName ||
              "Patient"
            : conversation.doctorName ||
              "Doctor";


    
    // APPOINTMENT NUMBER
    

    const appointmentNumber =
        conversation.appointmentNumber ||
        conversation.appointmentId ||
        "N/A";


    
    // APPOINTMENT DATE
    

    const appointmentDate =
        conversation.appointmentDate ||
        "N/A";


    
    // HOSPITAL NAME
    

    const hospitalName =
        conversation.hospitalName ||
        "N/A";


    
    // RENDER
    

    return (

        <div className="flex-1 flex flex-col bg-gray-50">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="bg-white border-b p-4">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        {/* Profile Circle */}

                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">

                            {conversationName
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        {/* Conversation Information */}

                        <div>

                            <h2 className="font-bold text-gray-800">

                                {conversationName}

                            </h2>


                            <p className="text-sm text-gray-500">

                                Appointment #
                                {appointmentNumber}

                            </p>


                            <p className="text-sm text-gray-400">

                                Date:{" "}
                                {appointmentDate}

                            </p>


                            <p className="text-sm text-gray-400">

                                Hospital:{" "}
                                {hospitalName}

                            </p>

                        </div>

                    </div>


                    {/* ================================================= */}
                    {/* WEBSOCKET STATUS */}
                    {/* ================================================= */}

                    <div className="flex items-center gap-2 text-sm">

                        <span
                            className={`w-2.5 h-2.5 rounded-full ${
                                connected
                                    ? "bg-green-500"
                                    : "bg-red-500"
                            }`}
                        />


                        <span
                            className={
                                connected
                                    ? "text-green-600"
                                    : "text-red-500"
                            }
                        >

                            {connected
                                ? "Online"
                                : "Connecting..."}

                        </span>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* MESSAGES */}
            {/* ================================================= */}

            <div className="flex-1 overflow-y-auto p-5">

                {loading ? (

                    <div className="text-center text-gray-400">

                        Loading messages...

                    </div>

                ) : messages.length === 0 ? (

                    <div className="text-center text-gray-400 mt-10">

                        <div className="text-4xl mb-3">
                            👋
                        </div>

                        <p>
                            No messages yet.
                        </p>

                        <p className="text-sm mt-1">
                            Start the conversation.
                        </p>

                    </div>

                ) : (

                    messages.map(
                        (message, index) => {

                            const isMine =
                                String(
                                    message?.senderId
                                ) ===
                                String(
                                    currentUser?.id
                                );


                            return (

                                <div
                                    key={
                                        message?.id ||
                                        `${message?.sentAt}-${index}`
                                    }
                                    className={`mb-4 flex ${
                                        isMine
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >

                                    <div
                                        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                                            isMine
                                                ? "bg-blue-600 text-white rounded-br-sm"
                                                : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                                        }`}
                                    >

                                        <p className="break-words whitespace-pre-wrap">

                                            {message?.content}

                                        </p>


                                        <p
                                            className={`text-xs mt-1 ${
                                                isMine
                                                    ? "text-blue-100"
                                                    : "text-gray-400"
                                            }`}
                                        >

                                            {message?.sentAt
                                                ? new Date(
                                                      message.sentAt
                                                  ).toLocaleTimeString(
                                                      [],
                                                      {
                                                          hour: "2-digit",
                                                          minute: "2-digit"
                                                      }
                                                  )
                                                : ""}

                                        </p>

                                    </div>

                                </div>

                            );

                        }
                    )

                )}


                <div ref={messagesEndRef} />

            </div>


            {/* ================================================= */}
            {/* INPUT */}
            {/* ================================================= */}

            <div className="bg-white border-t p-4">

                <div className="flex gap-3">

                    <input
                        type="text"
                        value={text}
                        onChange={(event) =>
                            setText(
                                event.target.value
                            )
                        }
                        onKeyDown={
                            handleKeyDown
                        }
                        placeholder={
                            connected
                                ? "Type a message..."
                                : "Connecting to chat..."
                        }
                        disabled={
                            !connected ||
                            sending
                        }
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />


                    <button
                        onClick={
                            handleSend
                        }
                        disabled={
                            !text.trim() ||
                            sending ||
                            !connected
                        }
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >

                        {sending
                            ? "Sending..."
                            : "Send"}

                    </button>

                </div>

            </div>

        </div>

    );

};


export default ChatWindow;