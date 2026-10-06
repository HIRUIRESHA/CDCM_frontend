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
    conversations = [],
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

        if (!conversation) {
            return "User";
        }

        // -------------------------------------------------
        // DOCTOR LOGGED IN
        // -------------------------------------------------

        if (
            currentUser?.role === "DOCTOR"
        ) {
            return (
                conversation.patientName ||
                conversation.patientFullName ||
                conversation.patient?.name ||
                conversation.patient?.fullName ||
                conversation.patient?.full_name ||
                conversation.patient?.patientName ||
                "Patient"
            );
        }

        // -------------------------------------------------
        // PATIENT LOGGED IN
        // -------------------------------------------------

        return (
            conversation.doctorName ||
            conversation.doctorFullName ||
            conversation.doctor?.name ||
            conversation.doctor?.fullName ||
            conversation.doctor?.full_name ||
            conversation.doctor?.doctorName ||
            "Doctor"
        );
    };


    // =====================================================
    // GET APPOINTMENT NUMBER
    // =====================================================

    const getAppointmentNumber = (
        conversation
    ) => {

        if (!conversation) {
            return "N/A";
        }

        return (
            conversation.appointmentNumber ||
            conversation.appointmentNo ||
            conversation.appointmentNumberText ||
            conversation.appointmentId ||
            conversation.appointment?.appointmentNumber ||
            conversation.appointment?.appointmentNo ||
            conversation.appointment?.appointmentNumberText ||
            conversation.appointment?.appointmentId ||
            conversation.appointment?.id ||
            "N/A"
        );
    };


    // =====================================================
    // GET APPOINTMENT DATE
    // =====================================================

    const getAppointmentDate = (
        conversation
    ) => {

        if (!conversation) {
            return null;
        }

        return (
            conversation.appointmentDate ||
            conversation.appointment?.appointmentDate ||
            conversation.appointment?.date ||
            conversation.appointment?.appointment_date ||
            conversation.date ||
            null
        );
    };


    // =====================================================
    // GET HOSPITAL NAME
    // =====================================================

    const getHospitalName = (
        conversation
    ) => {

        if (!conversation) {
            return "N/A";
        }

        return (
            conversation.hospitalName ||
            conversation.hospital?.name ||
            conversation.hospital?.hospitalName ||
            conversation.hospital?.fullName ||
            conversation.appointment?.hospitalName ||
            conversation.appointment?.hospital?.name ||
            conversation.appointment?.hospital?.hospitalName ||
            conversation.appointment?.hospital?.fullName ||
            "N/A"
        );
    };


    // =====================================================
    // CHECK UNREAD
    // =====================================================

    const isConversationUnread = (
        conversation
    ) => {

        if (!conversation?.id) {
            return false;
        }

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

        console.log(
            "Selected conversation data:",
            conversation
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
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        } catch {

            return String(date);

        }
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="flex h-full min-h-0 w-full flex-col border-r border-[#E7E5E0] bg-white md:w-80">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="flex-shrink-0 border-b border-[#E7E5E0] p-5">

                <h2 className="text-[19px] font-semibold text-[#1C2027]">
                    Messages
                </h2>

                <p className="mt-1 text-[13px] text-[#8A8D93]">
                    Your conversations
                </p>

            </div>


            {/* ================================================= */}
            {/* CONVERSATIONS */}
            {/* ================================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto">

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


                            // ---------------------------------
                            // APPOINTMENT DATA
                            // ---------------------------------

                            const appointmentNumber =
                                getAppointmentNumber(
                                    conversation
                                );

                            const appointmentDate =
                                getAppointmentDate(
                                    conversation
                                );

                            const hospitalName =
                                getHospitalName(
                                    conversation
                                );


                            // ---------------------------------
                            // AVATAR INITIAL
                            // ---------------------------------

                            const avatarInitial =
                                personName
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                "U";


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

                                    className={`relative w-full border-b border-[#F0EEE9] p-4 text-left transition-colors focus:outline-none focus-visible:bg-[#EFF4FF] ${
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
                                            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${
                                                isUnread
                                                    ? "bg-[#2563EB]"
                                                    : "bg-[#EEECE6]"
                                            }`}
                                        >

                                            <span
                                                className={`text-[15px] font-semibold ${
                                                    isUnread
                                                        ? "text-white"
                                                        : "text-[#5B5F66]"
                                                }`}
                                            >

                                                {avatarInitial}

                                            </span>

                                        </div>


                                        {/* ================================================= */}
                                        {/* DETAILS */}
                                        {/* ================================================= */}

                                        <div className="min-w-0 flex-1">


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

                                                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#2563EB]" />

                                                )}

                                            </div>


                                            {/* ============================================= */}
                                            {/* APPOINTMENT NUMBER */}
                                            {/* ============================================= */}

                                            <p className="mt-0.5 truncate text-[12.5px] text-[#8A8D93]">

                                                Appointment #

                                                {appointmentNumber}

                                            </p>


                                            {/* ============================================= */}
                                            {/* APPOINTMENT DATE */}
                                            {/* ============================================= */}

                                            <p className="text-[12.5px] text-[#8A8D93]">

                                                Date:{" "}

                                                {formatAppointmentDate(
                                                    appointmentDate
                                                )}

                                            </p>


                                            {/* ============================================= */}
                                            {/* HOSPITAL */}
                                            {/* ============================================= */}

                                            {hospitalName !== "N/A" && (

                                                <p className="truncate text-[12.5px] text-[#8A8D93]">

                                                    Hospital:{" "}

                                                    {hospitalName}

                                                </p>

                                            )}


                                            {/* ============================================= */}
                                            {/* LAST MESSAGE */}
                                            {/* ============================================= */}

                                            {conversation.lastMessage && (

                                                <p
                                                    className={`mt-1 truncate text-[12.5px] ${
                                                        isUnread
                                                            ? "font-medium text-[#1C2027]"
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