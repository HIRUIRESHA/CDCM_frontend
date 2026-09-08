// Messages.jsx (Doctor) — same logic, restyled shell
import React, { useEffect, useState } from "react";

import {
    getDoctorConversations
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
                await getDoctorConversations(
                    user.id
                );

            console.log("RAW CONVERSATION DATA:", data); 

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
            <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-[#FAFAF8] px-6">
                <p className="text-[15px] text-[#5B5F66]">
                    Please login to view messages.
                </p>
            </div>
        );
    }


    return (

        <div className="h-[calc(100vh-80px)] bg-[#FAFAF8] p-4 md:p-6">

            <div className="h-full bg-white rounded-xl border border-[#E7E5E0] overflow-hidden flex">

                {loading ? (

                    <div className="flex-1 flex items-center justify-center text-[#8A8D93] text-[14px]">
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