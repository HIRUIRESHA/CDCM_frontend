// ConversationList.jsx — unread tracked via localStorage, no backend field needed
import React from "react";

const STORAGE_KEY = "lastSeenMessages";

const getSeenMap = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
};

export const markConversationSeen = (conversationId, lastMessage) => {
    const seenMap = getSeenMap();
    seenMap[conversationId] = lastMessage || "";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seenMap));
};

const isConversationUnread = (conversation) => {
    const seenMap = getSeenMap();
    const lastSeen = seenMap[conversation.id];
    // Never opened before -> only unread if it actually has a message
    if (lastSeen === undefined) {
        return Boolean(conversation.lastMessage);
    }
    return conversation.lastMessage !== lastSeen;
};

const ConversationList = ({
    conversations,
    selectedConversation,
    onSelectConversation,
    currentUser
}) => {

    const getOtherPersonName = (conversation) => {
        if (currentUser?.role === "DOCTOR") {
            return conversation.patientName || "Patient";
        }
        return conversation.doctorName || "Doctor";
    };

    return (
        <div className="w-full md:w-80 border-r border-[#E7E5E0] bg-white flex flex-col">

            <div className="p-5 border-b border-[#E7E5E0]">
                <h2 className="text-[19px] font-semibold text-[#1C2027]">Messages</h2>
                <p className="text-[13px] text-[#8A8D93] mt-1">Your conversations</p>
            </div>

            <div className="overflow-y-auto flex-1">
                {conversations.length === 0 ? (
                    <div className="p-5 text-center text-[14px] text-[#8A8D93]">
                        No conversations yet.
                    </div>
                ) : (
                    conversations.map((conversation) => {

                        const isSelected = selectedConversation?.id === conversation.id;
                        const isUnread = !isSelected && isConversationUnread(conversation);

                        return (
                            <button
                                key={conversation.id}
                                onClick={() => {
                                    markConversationSeen(conversation.id, conversation.lastMessage);
                                    onSelectConversation(conversation);
                                }}
                                className={`relative w-full text-left p-4 border-b border-[#F0EEE9] transition-colors focus:outline-none focus-visible:bg-[#EFF4FF] ${
                                    isSelected
                                        ? "bg-[#EFF4FF]"
                                        : isUnread
                                            ? "bg-[#F0F6FF] hover:bg-[#E6F0FF]"
                                            : "bg-white hover:bg-[#FAFAF8]"
                                }`}
                            >
                                {isSelected && (
                                    <span className="absolute left-0 top-0 h-full w-[3px] bg-[#2563EB]" />
                                )}
                                {isUnread && (
                                    <span className="absolute left-0 top-0 h-full w-[3px] bg-[#2563EB]" />
                                )}

                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            isUnread ? "bg-[#2563EB]" : "bg-[#EEECE6]"
                                        }`}
                                    >
                                        <span
                                            className={`font-semibold text-[15px] ${
                                                isUnread ? "text-white" : "text-[#5B5F66]"
                                            }`}
                                        >
                                            {getOtherPersonName(conversation).charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span
                                                className={`truncate text-[14.5px] ${
                                                    isUnread
                                                        ? "font-semibold text-[#1C2027]"
                                                        : "font-medium text-[#3A3D42]"
                                                }`}
                                            >
                                                {getOtherPersonName(conversation)}
                                            </span>

                                            {isUnread && (
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] flex-shrink-0" />
                                            )}
                                        </div>

                                        <p className="text-[12.5px] text-[#8A8D93] mt-0.5">
                                            Appointment #{conversation.appointmentNumber || conversation.appointmentId}
                                        </p>

                                        {conversation.lastMessage && (
                                            <p
                                                className={`text-[12.5px] mt-1 truncate ${
                                                    isUnread ? "text-[#1C2027] font-medium" : "text-[#A3A6AB]"
                                                }`}
                                            >
                                                {conversation.lastMessage}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ConversationList;