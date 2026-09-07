import React from "react";

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
        <div className="w-full md:w-80 border-r bg-white">

            {/* Header */}
            <div className="p-5 border-b">

                <h2 className="text-xl font-bold text-gray-800">
                    Messages
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                    Your conversations
                </p>

            </div>


            {/* Conversations */}
            <div className="overflow-y-auto">

                {conversations.length === 0 ? (

                    <div className="p-5 text-center text-gray-500">
                        No conversations yet.
                    </div>

                ) : (

                    conversations.map((conversation) => (

                        <button
                            key={conversation.id}
                            onClick={() =>
                                onSelectConversation(conversation)
                            }
                            className={`w-full text-left p-4 border-b hover:bg-gray-50 transition ${
                                selectedConversation?.id === conversation.id
                                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                                    : ""
                            }`}
                        >

                            <div className="flex items-center gap-3">

                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">

                                    <span className="text-blue-600 font-semibold text-lg">
                                        {getOtherPersonName(conversation)
                                            .charAt(0)
                                            .toUpperCase()}
                                    </span>

                                </div>


                                {/* Details */}
                                <div className="flex-1 min-w-0">

                                    {/* Name */}
                                    <div className="flex items-center justify-between gap-2">

                                        <span className="font-semibold text-gray-800 truncate">
                                            {getOtherPersonName(conversation)}
                                        </span>

                                    </div>


                                    {/* Appointment */}
                                    <p className="text-sm text-gray-500 mt-1">
                                        Appointment #
                                        {conversation.appointmentNumber ||
                                            conversation.appointmentId}
                                    </p>


                                    {/* Last message */}
                                    {conversation.lastMessage && (

                                        <p className="text-xs text-gray-400 mt-1 truncate">
                                            {conversation.lastMessage}
                                        </p>

                                    )}

                                </div>

                            </div>

                        </button>

                    ))

                )}

            </div>

        </div>
    );
};

export default ConversationList;