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

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const subscriptionsRef = useRef([]);
    const activeConversationRef = useRef(null);

    const onConversationMessageRef =
        useRef(onConversationMessage);


    /* =========================================================
       UPDATE CALLBACK REF
    ========================================================= */

    useEffect(() => {

        onConversationMessageRef.current =
            onConversationMessage;

    }, [onConversationMessage]);


    /* =========================================================
       CONNECT WEBSOCKET
    ========================================================= */

    useEffect(() => {

        if (!currentUser?.id) {
            return;
        }

        let mounted = true;

        connectWebSocket(

            () => {

                if (!mounted) return;

                console.log("WebSocket connected");

                setConnected(true);

            },

            (error) => {

                if (!mounted) return;

                console.error(
                    "WebSocket connection error:",
                    error
                );

                setConnected(false);

            }

        );

        return () => {

            mounted = false;

            setConnected(false);

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

            activeConversationRef.current = null;

            disconnectWebSocket();

        };

    }, [currentUser?.id]);


    /* =========================================================
       ACTIVE CONVERSATION
    ========================================================= */

    useEffect(() => {

        activeConversationRef.current =
            conversation?.id
                ? String(conversation.id)
                : null;

    }, [conversation?.id]);


    /* =========================================================
       LOAD MESSAGES
    ========================================================= */

    useEffect(() => {

        if (!conversation?.id) {

            setMessages([]);

            return;

        }

        const conversationId =
            String(conversation.id);

        activeConversationRef.current =
            conversationId;

        let cancelled = false;


        const loadMessages = async () => {

            try {

                setLoading(true);

                const data =
                    await getMessages(
                        conversationId
                    );

                if (cancelled) return;

                const databaseMessages =
                    Array.isArray(data)
                        ? data
                        : [];


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


    /* =========================================================
       CONVERSATION IDS
    ========================================================= */

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


    /* =========================================================
       SUBSCRIBE TO CONVERSATIONS
    ========================================================= */

    useEffect(() => {

        if (
            !connected ||
            !conversationIdsKey
        ) {
            return;
        }


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


        const conversationIdList =
            conversationIdsKey
                .split("|")
                .filter(Boolean);


        conversationIdList.forEach(
            (conversationId) => {

                const subscription =
                    subscribeToConversation(

                        conversationId,

                        (newMessage) => {

                            if (
                                !newMessage?.conversationId
                            ) {
                                return;
                            }


                            const messageConversationId =
                                String(
                                    newMessage.conversationId
                                );


                            if (
                                messageConversationId !==
                                conversationId
                            ) {
                                return;
                            }


                            if (
                                onConversationMessageRef.current
                            ) {

                                onConversationMessageRef.current(
                                    newMessage
                                );

                            }


                            if (
                                activeConversationRef.current !==
                                messageConversationId
                            ) {
                                return;
                            }


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


                                    if (alreadyExists) {

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

                }

            }
        );


        return () => {

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


    /* =========================================================
       AUTO SCROLL
    ========================================================= */

    useEffect(() => {

        if (!messagesEndRef.current) {
            return;
        }


        messagesEndRef.current.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);


    /* =========================================================
       SEND MESSAGE
    ========================================================= */

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
                "WebSocket is not connected."
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


    /* =========================================================
       ENTER KEY
    ========================================================= */

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSend();

        }

    };


    /* =========================================================
       EMPTY STATE
    ========================================================= */

    if (!conversation) {

        return (

            <div className="flex min-h-[600px] items-center justify-center bg-slate-50">

                <div className="max-w-sm px-6 text-center">

                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm ring-1 ring-slate-100">
                        💬
                    </div>

                    <h3 className="text-lg font-bold text-slate-800">
                        Select a conversation
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        Choose a doctor from the conversation
                        list to start messaging.
                    </p>

                </div>

            </div>

        );

    }


    /* =========================================================
       CONVERSATION INFORMATION
    ========================================================= */

    /*
     * The backend may return conversation information
     * using different nested structures.
     *
     * These fallbacks allow the UI to work with:
     *
     * conversation.doctorName
     * conversation.doctor.name
     * conversation.doctor.fullName
     *
     * conversation.appointmentId
     * conversation.appointment.id
     *
     * conversation.hospitalName
     * conversation.hospital.name
     * conversation.appointment.hospital.name
     */


    /* =========================================================
       DOCTOR / PATIENT NAME
    ========================================================= */

    const conversationName =
        currentUser?.role === "DOCTOR"

            ? (
                conversation.patientName ||
                conversation.patientFullName ||
                conversation.patient?.name ||
                conversation.patient?.fullName ||
                conversation.patient?.full_name ||
                "Patient"
            )

            : (
                conversation.doctorName ||
                conversation.doctorFullName ||
                conversation.doctor?.name ||
                conversation.doctor?.fullName ||
                conversation.doctor?.full_name ||
                "Doctor"
            );


    /* =========================================================
       APPOINTMENT NUMBER
    ========================================================= */

    const appointmentNumber =
        conversation.appointmentNumber ||
        conversation.appointmentNo ||
        conversation.appointmentNumberText ||
        conversation.appointmentId ||
        conversation.appointment?.appointmentNumber ||
        conversation.appointment?.appointmentNo ||
        conversation.appointment?.appointmentId ||
        conversation.appointment?.id ||
        "N/A";


    /* =========================================================
       APPOINTMENT DATE
    ========================================================= */

    const appointmentDate =
        conversation.appointmentDate ||
        conversation.appointment?.appointmentDate ||
        conversation.appointment?.date ||
        conversation.appointment?.appointment_date ||
        conversation.date ||
        "N/A";


    /* =========================================================
       HOSPITAL NAME
    ========================================================= */

    const hospitalName =
        conversation.hospitalName ||
        conversation.hospital?.name ||
        conversation.hospital?.hospitalName ||
        conversation.hospital?.fullName ||
        conversation.appointment?.hospitalName ||
        conversation.appointment?.hospital?.name ||
        conversation.appointment?.hospital?.hospitalName ||
        "N/A";


    /* =========================================================
       FORMAT APPOINTMENT DATE
    ========================================================= */

    const formatAppointmentDate = (date) => {

        if (
            !date ||
            date === "N/A"
        ) {
            return "N/A";
        }


        try {

            const parsedDate =
                new Date(date);


            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                return String(date);

            }


            return parsedDate.toLocaleDateString(
                "en-GB",
                {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                }
            );

        } catch (error) {

            return String(date);

        }

    };


    const displayAppointmentDate =
        formatAppointmentDate(
            appointmentDate
        );


    /* =========================================================
       INITIALS
    ========================================================= */

    const initials =
        String(
            conversationName
        )
            .split(" ")
            .filter(Boolean)
            .map(
                (name) =>
                    name.charAt(0)
            )
            .join("")
            .slice(0, 2)
            .toUpperCase();


    /* =========================================================
       FORMAT MESSAGE TIME
    ========================================================= */

    const formatTime = (date) => {

        if (!date) {
            return "";
        }


        try {

            const parsedDate =
                new Date(date);


            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                return "";

            }


            return parsedDate.toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        } catch (error) {

            return "";

        }

    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="flex h-full min-h-0 flex-col bg-[#f8fafc]">


            {/* =====================================================
                CHAT HEADER
            ===================================================== */}

            <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">

                <div className="flex items-start justify-between gap-4">


                    {/* =================================================
                        DOCTOR / PATIENT
                    ================================================= */}

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="relative shrink-0">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white shadow-md shadow-indigo-100">

                                {initials}

                            </div>


                            {/* ONLINE STATUS */}

                            <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                                    connected
                                        ? "bg-emerald-500"
                                        : "bg-amber-400"
                                }`}
                            />

                        </div>


                        <div className="min-w-0">

                            <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">

                                {conversationName}

                            </h2>


                            <div className="mt-0.5 flex items-center gap-2">

                                <span className="text-xs text-slate-400">

                                    {currentUser?.role === "DOCTOR"
                                        ? "Patient conversation"
                                        : "Doctor conversation"}

                                </span>


                                <span className="h-1 w-1 rounded-full bg-slate-300" />


                                <span
                                    className={`text-xs font-semibold ${
                                        connected
                                            ? "text-emerald-600"
                                            : "text-amber-600"
                                    }`}
                                >

                                    {connected
                                        ? "Online"
                                        : "Connecting"}

                                </span>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        CONNECTION STATUS
                    ================================================= */}

                    <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">

                        <span
                            className={`h-2 w-2 rounded-full ${
                                connected
                                    ? "bg-emerald-500"
                                    : "bg-amber-400"
                            }`}
                        />


                        <span className="text-xs font-semibold text-slate-600">

                            {connected
                                ? "Secure connection"
                                : "Connecting..."}

                        </span>

                    </div>

                </div>


                {/* =================================================
                    APPOINTMENT INFORMATION
                ================================================= */}

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">


                    {/* APPOINTMENT */}

                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">

                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Appointment
                        </p>


                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">

                            {appointmentNumber !== "N/A"
                                ? `#${appointmentNumber}`
                                : "N/A"}

                        </p>

                    </div>


                    {/* DATE */}

                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">

                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Date
                        </p>


                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">

                            {displayAppointmentDate}

                        </p>

                    </div>


                    {/* HOSPITAL */}

                    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">

                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Hospital
                        </p>


                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">

                            {hospitalName}

                        </p>

                    </div>

                </div>

            </div>


            {/* =====================================================
                MESSAGES AREA
                ONLY THIS SECTION SCROLLS
            ===================================================== */}

            <div
                ref={messagesContainerRef}
                className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
            >

                {loading ? (

                    <div className="flex min-h-[350px] items-center justify-center">

                        <div className="text-center">

                            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

                            <p className="mt-3 text-sm font-medium text-slate-500">
                                Loading messages...
                            </p>

                        </div>

                    </div>

                ) : messages.length === 0 ? (

                    /* =================================================
                       NO MESSAGES
                    ================================================= */

                    <div className="flex min-h-[350px] flex-col items-center justify-center text-center">

                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm ring-1 ring-slate-100">
                            👋
                        </div>


                        <h3 className="text-base font-bold text-slate-700">
                            Start the conversation
                        </h3>


                        <p className="mt-1.5 max-w-xs text-sm leading-6 text-slate-400">

                            There are no messages yet.
                            Send a message to begin communicating
                            with this doctor.

                        </p>

                    </div>

                ) : (

                    /* =================================================
                       MESSAGE LIST
                    ================================================= */

                    <div className="mx-auto w-full max-w-4xl">


                        {/* CONVERSATION DIVIDER */}

                        <div className="mb-6 flex items-center gap-3">

                            <div className="h-px flex-1 bg-slate-200" />


                            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-400 shadow-sm ring-1 ring-slate-100">

                                Conversation

                            </span>


                            <div className="h-px flex-1 bg-slate-200" />

                        </div>


                        {/* MESSAGES */}

                        {messages.map(
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
                                        className={`mb-5 flex ${
                                            isMine
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >

                                        <div
                                            className={`flex max-w-[85%] gap-2.5 sm:max-w-[70%] ${
                                                isMine
                                                    ? "flex-row-reverse"
                                                    : "flex-row"
                                            }`}
                                        >


                                            {/* AVATAR */}

                                            <div
                                                className={`mt-1 hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold sm:flex ${
                                                    isMine
                                                        ? "bg-indigo-100 text-indigo-600"
                                                        : "bg-slate-200 text-slate-600"
                                                }`}
                                            >

                                                {isMine
                                                    ? "ME"
                                                    : initials}

                                            </div>


                                            {/* MESSAGE */}

                                            <div>

                                                <div
                                                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                                                        isMine
                                                            ? "rounded-br-md bg-indigo-600 text-white"
                                                            : "rounded-bl-md border border-slate-100 bg-white text-slate-700"
                                                    }`}
                                                >

                                                    <p className="break-words whitespace-pre-wrap text-sm leading-6">

                                                        {message?.content}

                                                    </p>

                                                </div>


                                                {/* TIME */}

                                                <div
                                                    className={`mt-1.5 flex items-center gap-1 px-1 ${
                                                        isMine
                                                            ? "justify-end"
                                                            : "justify-start"
                                                    }`}
                                                >

                                                    <span className="text-[10px] text-slate-400">

                                                        {formatTime(
                                                            message?.sentAt
                                                        )}

                                                    </span>


                                                    {isMine && (

                                                        <span className="text-[10px] font-semibold text-indigo-500">

                                                            ✓

                                                        </span>

                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}


                <div ref={messagesEndRef} />

            </div>


            {/* =====================================================
                MESSAGE INPUT
                STAYS AT BOTTOM
            ===================================================== */}

            <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">

                <div className="mx-auto max-w-4xl">


                    {/* INPUT BOX */}

                    <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">


                        {/* TEXT INPUT */}

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
                                    ? "Write a message..."
                                    : "Connecting to secure chat..."
                            }
                            disabled={
                                !connected ||
                                sending
                            }
                            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                        />


                        {/* SEND BUTTON */}

                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={
                                !text.trim() ||
                                sending ||
                                !connected
                            }
                            className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                        >

                            {sending ? (

                                <>

                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                    <span className="hidden sm:inline">
                                        Sending
                                    </span>

                                </>

                            ) : (

                                <>

                                    <span>
                                        ➤
                                    </span>


                                    <span className="hidden sm:inline">
                                        Send
                                    </span>

                                </>

                            )}

                        </button>

                    </div>


                    {/* INPUT FOOTER */}

                    <div className="mt-2 flex items-center justify-between px-1">

                        <p className="text-[10px] text-slate-400">
                            Press Enter to send
                        </p>


                        <p className="text-[10px] text-slate-400">
                            Secure patient communication
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

};


export default ChatWindow;