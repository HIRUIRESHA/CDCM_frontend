
// ConversationList.jsx
// Unread messages tracked using localStorage + React state

import React, { useState } from "react";

const STORAGE_KEY = "lastSeenMessages";

// =========================================================
// GET SEEN MAP
// =========================================================

const getSeenMap = () => {
    try {
        return (
            JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || {}
        );
    } catch {
        return {};
    }
};

// =========================================================
// MARK CONVERSATION AS SEEN
// =========================================================

export const markConversationSeen = (
    conversationId,
    lastMessage
) => {
    const seenMap = getSeenMap();

    seenMap[String(conversationId)] =
        lastMessage || "";

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(seenMap)
    );

    return seenMap;
};

// =========================================================
// COMPONENT
// =========================================================

const ConversationList = ({
    conversations,
    selectedConversationId,
    onSelectConversation,
    currentUser
}) => {

    // =====================================================
    // SEEN MAP STATE
    // =====================================================

    const [seenMap, setSeenMap] =
        useState(getSeenMap());


    // =====================================================
    // GET OTHER PERSON NAME
    // =====================================================

    const getOtherPersonName = (
        conversation
    ) => {

        if (
            currentUser?.role === "DOCTOR"
        ) {
            return (
                conversation.patientName ||
                "Patient"
            );
        }

        return (
            conversation.doctorName ||
            "Doctor"
        );
    };


    // =====================================================
    // CHECK UNREAD
    // =====================================================

    const isConversationUnread = (
        conversation
    ) => {

        // Selected/open conversation is NEVER unread
        if (
            String(selectedConversationId) ===
            String(conversation.id)
        ) {
            return false;
        }

        const conversationId =
            String(conversation.id);

        const lastSeen =
            seenMap[conversationId];


        // ---------------------------------------------
        // Never opened before
        // ---------------------------------------------

        if (lastSeen === undefined) {

            return Boolean(
                conversation.lastMessage
            );

        }


        // ---------------------------------------------
        // New message after last seen message
        // ---------------------------------------------

        return (
            conversation.lastMessage &&
            conversation.lastMessage !== lastSeen
        );
    };


    // =====================================================
    // HANDLE CONVERSATION CLICK
    // =====================================================

    const handleConversationClick = (
        conversation
    ) => {

        if (!conversation?.id) {
            return;
        }

        const conversationId =
            String(conversation.id);

        console.log(
            "Conversation clicked:",
            conversationId
        );


        // ---------------------------------------------
        // Mark conversation as seen immediately
        // ---------------------------------------------

        const updatedSeenMap =
            markConversationSeen(
                conversationId,
                conversation.lastMessage
            );


        // ---------------------------------------------
        // Update React state immediately
        // This removes the unread indicator
        // without waiting for another render
        // ---------------------------------------------

        setSeenMap(updatedSeenMap);


        // ---------------------------------------------
        // Select conversation
        // ---------------------------------------------

        onSelectConversation(
            conversation
        );
    };


    // =====================================================
    // FORMAT APPOINTMENT DATE
    // =====================================================

    const formatAppointmentDate = (
        date
    ) => {

        if (!date) {
            return "N/A";
        }

        try {

            const parsedDate =
                new Date(date);

            if (isNaN(parsedDate.getTime())) {
                return date;
            }

            return parsedDate.toLocaleDateString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        } catch {

            return date;

        }
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="w-full md:w-80 border-r border-[#E7E5E0] bg-white flex flex-col">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="p-5 border-b border-[#E7E5E0]">

                <h2 className="text-[19px] font-semibold text-[#1C2027]">
                    Messages
                </h2>

                <p className="text-[13px] text-[#8A8D93] mt-1">
                    Your conversations
                </p>

            </div>


            {/* ================================================= */}
            {/* CONVERSATIONS */}
            {/* ================================================= */}

            <div className="overflow-y-auto flex-1">

                {conversations.length === 0 ? (

                    <div className="p-5 text-center text-[14px] text-[#8A8D93]">
                        No conversations yet.
                    </div>

                ) : (

                    conversations.map(
                        (conversation) => {

                            // ---------------------------------
                            // SELECTED
                            // ---------------------------------

                            const isSelected =
                                String(
                                    selectedConversationId
                                ) ===
                                String(
                                    conversation.id
                                );


                            // ---------------------------------
                            // UNREAD
                            // ---------------------------------

                            const isUnread =
                                isConversationUnread(
                                    conversation
                                );


                            // ---------------------------------
                            // PERSON NAME
                            // ---------------------------------

                            const personName =
                                getOtherPersonName(
                                    conversation
                                );


                            return (

                                <button

                                    key={
                                        conversation.id
                                    }

                                    onClick={() =>
                                        handleConversationClick(
                                            conversation
                                        )
                                    }

                                    className={`relative w-full text-left p-4 border-b border-[#F0EEE9] transition-colors focus:outline-none focus-visible:bg-[#EFF4FF] ${
                                        isSelected
                                            ? "bg-[#EFF4FF]"
                                            : isUnread
                                                ? "bg-[#F0F6FF] hover:bg-[#E6F0FF]"
                                                : "bg-white hover:bg-[#FAFAF8]"
                                    }`}
                                >


                                    {/* ================================================= */}
                                    {/* SELECTED / UNREAD INDICATOR */}
                                    {/* ================================================= */}

                                    {(isSelected || isUnread) && (

                                        <span className="absolute left-0 top-0 h-full w-[3px] bg-[#2563EB]" />

                                    )}


                                    <div className="flex items-center gap-3">


                                        {/* ================================================= */}
                                        {/* AVATAR */}
                                        {/* ================================================= */}

                                        <div
                                            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                isUnread
                                                    ? "bg-[#2563EB]"
                                                    : "bg-[#EEECE6]"
                                            }`}
                                        >

                                            <span
                                                className={`font-semibold text-[15px] ${
                                                    isUnread
                                                        ? "text-white"
                                                        : "text-[#5B5F66]"
                                                }`}
                                            >

                                                {personName
                                                    .charAt(0)
                                                    .toUpperCase()}

                                            </span>

                                        </div>


                                        {/* ================================================= */}
                                        {/* DETAILS */}
                                        {/* ================================================= */}

                                        <div className="flex-1 min-w-0">


                                            {/* ============================================= */}
                                            {/* NAME + UNREAD DOT */}
                                            {/* ============================================= */}

                                            <div className="flex items-center justify-between gap-2">

                                                <span
                                                    className={`truncate text-[14.5px] ${
                                                        isUnread
                                                            ? "font-semibold text-[#1C2027]"
                                                            : "font-medium text-[#3A3D42]"
                                                    }`}
                                                >

                                                    {personName}

                                                </span>


                                                {isUnread && (

                                                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] flex-shrink-0" />

                                                )}

                                            </div>


                                            {/* ============================================= */}
                                            {/* APPOINTMENT NUMBER */}
                                            {/* ============================================= */}

                                            <p className="text-[12.5px] text-[#8A8D93] mt-0.5">

                                                Appointment #
                                                {
                                                    conversation.appointmentNumber ||
                                                    conversation.appointmentId ||
                                                    "N/A"
                                                }

                                            </p>


                                            {/* ============================================= */}
                                            {/* APPOINTMENT DATE */}
                                            {/* ============================================= */}

                                            <p className="text-[12.5px] text-[#8A8D93]">

                                                Date:{" "}

                                                {formatAppointmentDate(
                                                    conversation.appointmentDate
                                                )}

                                            </p>


                                            {/* ============================================= */}
                                            {/* LAST MESSAGE */}
                                            {/* ============================================= */}

                                            {conversation.lastMessage && (

                                                <p
                                                    className={`text-[12.5px] mt-1 truncate ${
                                                        isUnread
                                                            ? "text-[#1C2027] font-medium"
                                                            : "text-[#A3A6AB]"
                                                    }`}
                                                >

                                                    {
                                                        conversation.lastMessage
                                                    }

                                                </p>

                                            )}

                                        </div>

                                    </div>

                                </button>

                            );

                        }
                    )

                )}

            </div>

        </div>

    );
};

export default ConversationList;

