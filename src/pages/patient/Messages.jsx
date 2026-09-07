import React, { useEffect, useState } from "react";

import {
    getPatientConversations
} from "../../services/chatService";

import ConversationList
    from "../../components/chat/ConversationList";

import ChatWindow
    from "../../components/chat/ChatWindow";

import { useAuth } from "../../context/AuthContext";

import {
    connectWebSocket,
    disconnectWebSocket
} from "../../services/webSocketService";

const Messages = () => {

    const { user } = useAuth();

    const [conversations, setConversations] =
        useState([]);

    const [selectedConversation, setSelectedConversation] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        if (!user?.id) {
            return;
        }

        loadConversations();

    }, [user?.id]);

    useEffect(() => {

    connectWebSocket(
        () => {
            console.log(
                "Patient WebSocket connected"
            );
        },
        (error) => {
            console.error(
                "Patient WebSocket error:",
                error
            );
        }
    );


    return () => {

        disconnectWebSocket();

    };

}, []);


    const loadConversations = async () => {

        try {

            setLoading(true);

            const data =
                await getPatientConversations(
                    user.id
                );

            setConversations(data);

        } catch (error) {

            console.error(
                "Failed to load conversations:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    if (!user) {

        return (
            <div className="p-6">
                Please login to view messages.
            </div>
        );
    }


    return (

        <div className="h-[calc(100vh-80px)] bg-gray-50 p-4 md:p-6">

            <div className="h-full bg-white rounded-2xl shadow-sm overflow-hidden flex">

                {loading ? (

                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Loading conversations...
                    </div>

                ) : (

                    <>

                        <ConversationList
                            conversations={conversations}
                            selectedConversation={selectedConversation}
                            onSelectConversation={setSelectedConversation}
                            currentUser={user}
                        />


                        <ChatWindow
                            conversation={selectedConversation}
                            currentUser={user}
                        />

                    </>

                )}

            </div>

        </div>
    );
};

export default Messages;