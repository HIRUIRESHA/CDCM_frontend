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
    currentUser
}) => {

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [connected, setConnected] = useState(false);

    const messagesEndRef = useRef(null);
    const subscriptionRef = useRef(null);


    // =====================================================
    // CONNECT WEBSOCKET
    // =====================================================

    useEffect(() => {

        if (!currentUser?.id) {
            return;
        }

        console.log("Connecting to WebSocket...");

        connectWebSocket(
            () => {
                console.log("WebSocket connected");

                setConnected(true);
            },
            (error) => {
                console.error(
                    "WebSocket connection error:",
                    error
                );

                setConnected(false);
            }
        );

        return () => {

            console.log(
                "Disconnecting WebSocket..."
            );

            if (subscriptionRef.current) {

                subscriptionRef.current.unsubscribe();

                subscriptionRef.current = null;
            }

            disconnectWebSocket();

            setConnected(false);
        };

    }, [currentUser?.id]);


    // =====================================================
    // LOAD EXISTING MESSAGES
    // =====================================================

    useEffect(() => {

        if (!conversation?.id) {

            setMessages([]);

            return;
        }

        loadMessages();

    }, [conversation?.id]);


    const loadMessages = async () => {

        if (!conversation?.id) {
            return;
        }

        try {

            setLoading(true);

            const data =
                await getMessages(
                    conversation.id
                );

            setMessages(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load messages:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // SUBSCRIBE TO CONVERSATION
    // =====================================================

    useEffect(() => {

        if (
            !conversation?.id ||
            !connected
        ) {
            return;
        }

        console.log(
            "Subscribing to conversation:",
            conversation.id
        );


        // Remove previous subscription
        if (subscriptionRef.current) {

            subscriptionRef.current.unsubscribe();

            subscriptionRef.current = null;
        }


        // Create new subscription
        const subscription =
            subscribeToConversation(
                conversation.id,
                (newMessage) => {

                    console.log(
                        "New WebSocket message:",
                        newMessage
                    );


                    setMessages((previous) => {

                        // Prevent duplicate messages
                        const alreadyExists =
                            previous.some(
                                (message) =>
                                    message.id ===
                                    newMessage.id
                            );


                        if (alreadyExists) {

                            return previous;

                        }


                        return [
                            ...previous,
                            newMessage
                        ];

                    });

                }
            );


        subscriptionRef.current =
            subscription || null;


        // Cleanup when conversation changes
        return () => {

            if (subscriptionRef.current) {

                subscriptionRef.current.unsubscribe();

                subscriptionRef.current = null;
            }

        };

    }, [
        conversation?.id,
        connected
    ]);


    // =====================================================
    // AUTO SCROLL
    // =====================================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);


    // =====================================================
    // SEND MESSAGE
    // =====================================================

    const handleSend = () => {

        const messageText =
            text.trim();


        if (
            !messageText ||
            sending ||
            !conversation ||
            !currentUser
        ) {
            return;
        }


        // Check WebSocket connection
        if (!connected) {

            console.error(
                "Cannot send message. WebSocket is not connected."
            );

            return;
        }


        setSending(true);


        try {

            const success =
                sendWebSocketMessage(
                    conversation.id,
                    currentUser.id,
                    currentUser.role,
                    messageText
                );


            if (success) {

                // Clear input
                setText("");

            } else {

                console.error(
                    "Message could not be sent."
                );

            }

        } catch (error) {

            console.error(
                "Failed to send message:",
                error
            );

        } finally {

            setSending(false);

        }
    };


    // =====================================================
    // ENTER KEY
    // =====================================================

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSend();

        }

    };


    // =====================================================
    // EMPTY STATE
    // =====================================================

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


    // =====================================================
    // CONVERSATION NAME
    // =====================================================

    const conversationName =
        currentUser?.role === "DOCTOR"
            ? conversation.patientName || "Patient"
            : conversation.doctorName || "Doctor";


    // =====================================================
    // APPOINTMENT NUMBER
    // =====================================================

    const appointmentNumber =
        conversation.appointmentNumber ||
        conversation.appointmentId ||
        "N/A";


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="flex-1 flex flex-col bg-gray-50">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="bg-white border-b p-4">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        {/* Avatar */}

                        <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">

                            {conversationName
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        {/* User information */}

                        <div>

                            <h2 className="font-bold text-gray-800">

                                {conversationName}

                            </h2>


                            <p className="text-sm text-gray-500">

                                Appointment #
                                {appointmentNumber}

                            </p>

                        </div>

                    </div>


                    {/* WebSocket status */}

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

                    messages.map((message) => {

                        const isMine =
                            message.senderId ===
                            currentUser?.id;


                        return (

                            <div
                                key={message.id}
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

                                    {/* Message content */}

                                    <p className="break-words whitespace-pre-wrap">

                                        {message.content}

                                    </p>


                                    {/* Message time */}

                                    <p
                                        className={`text-xs mt-1 ${
                                            isMine
                                                ? "text-blue-100"
                                                : "text-gray-400"
                                        }`}
                                    >

                                        {message.sentAt
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

                    })

                )}


                {/* Auto-scroll target */}

                <div ref={messagesEndRef} />

            </div>


            {/* ================================================= */}
            {/* MESSAGE INPUT */}
            {/* ================================================= */}

            <div className="bg-white border-t p-4">

                <div className="flex gap-3">


                    {/* Input */}

                    <input
                        type="text"
                        value={text}
                        onChange={(event) =>
                            setText(
                                event.target.value
                            )
                        }
                        onKeyDown={handleKeyDown}
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


                    {/* Send button */}

                    <button
                        onClick={handleSend}
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