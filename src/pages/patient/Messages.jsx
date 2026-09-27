import React, {
    useEffect,
    useState,
    useCallback
} from "react";

import {
    getPatientConversations
} from "../../services/chatService";

import ConversationList
    from "../../components/chat/ConversationList";

import ChatWindow
    from "../../components/chat/ChatWindow";

import {
    useAuth
} from "../../context/AuthContext";


const Messages = () => {

    const { user } = useAuth();

    const [conversations, setConversations] =
        useState([]);

    const [selectedConversationId, setSelectedConversationId] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    
    // LOAD CONVERSATIONS
    

    useEffect(() => {

        if (!user?.id) {

            setLoading(false);

            return;
        }

        loadConversations();

    }, [user?.id]);


    const loadConversations = async () => {

        try {

            setLoading(true);

            console.log(
                "Loading patient conversations..."
            );


            const data =
                await getPatientConversations(
                    user.id
                );


            console.log(
                "RAW PATIENT CONVERSATION DATA:",
                data
            );


            const conversationList =
                Array.isArray(data)
                    ? data
                    : [];


            setConversations(
                conversationList
            );

        } catch (error) {

            console.error(
                "Failed to load conversations:",
                error
            );

            setConversations([]);

        } finally {

            setLoading(false);

        }

    };


    
    // HANDLE REALTIME MESSAGE
    
    

    const handleConversationMessage =
        useCallback((newMessage) => {

            if (
                !newMessage ||
                !newMessage.conversationId
            ) {

                return;

            }


            const conversationId =
                String(
                    newMessage.conversationId
                );


            console.log(
                "======================================"
            );

            console.log(
                "REALTIME PATIENT CONVERSATION UPDATE"
            );

            console.log(
                "Conversation ID:",
                conversationId
            );

            console.log(
                "Message:",
                newMessage
            );

            console.log(
                "======================================"
            );


            setConversations(
                (previousConversations) => {

                    return previousConversations.map(
                        (conversation) => {

                            if (
                                String(
                                    conversation.id
                                ) !== conversationId
                            ) {

                                return conversation;

                            }


                            return {
                                ...conversation,

                                // Update latest message
                                lastMessage:
                                    newMessage.content ||
                                    conversation.lastMessage ||
                                    "",

                                // Update latest message time
                                lastMessageAt:
                                    newMessage.sentAt ||
                                    conversation.lastMessageAt ||
                                    new Date().toISOString()
                            };

                        }
                    );

                }
            );

        }, []);


    
    // KEEP SELECTED CONVERSATION VALID
    

    useEffect(() => {

        
        // Automatically select first conversation
        

        if (
            selectedConversationId === null &&
            conversations.length > 0
        ) {

            const firstConversation =
                conversations[0];


            if (firstConversation?.id) {

                const firstConversationId =
                    String(
                        firstConversation.id
                    );


                console.log(
                    "Auto-selecting first patient conversation:",
                    firstConversationId
                );


                setSelectedConversationId(
                    firstConversationId
                );

            }

            return;

        }


       
        // Check whether selected conversation still exists
       

        if (
            selectedConversationId !== null
        ) {

            const stillExists =
                conversations.some(
                    (conversation) =>
                        String(
                            conversation.id
                        ) ===
                        String(
                            selectedConversationId
                        )
                );


            if (!stillExists) {

                console.log(
                    "Selected patient conversation no longer exists."
                );


                setSelectedConversationId(
                    null
                );

            }

        }

    }, [
        conversations,
        selectedConversationId
    ]);


    
    // SELECT CONVERSATION
    

    const handleSelectConversation = (
        conversation
    ) => {

        if (!conversation?.id) {

            console.error(
                "Conversation ID is missing:",
                conversation
            );

            return;

        }


        const conversationId =
            String(
                conversation.id
            );


        console.log(
            "Selecting patient conversation:",
            conversationId
        );


        if (
            String(selectedConversationId) ===
            conversationId
        ) {

            return;

        }


        setSelectedConversationId(
            conversationId
        );

    };


    
    // GET SELECTED CONVERSATION
    

    const selectedConversation =
        conversations.find(
            (conversation) =>
                String(
                    conversation.id
                ) ===
                String(
                    selectedConversationId
                )
        ) || null;


    
    // NOT LOGGED IN
    

    if (!user) {

        return (

            <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-[#FAFAF8] px-6">

                <p className="text-[15px] text-[#5B5F66]">

                    Please login to view messages.

                </p>

            </div>

        );

    }


    
    // PAGE
    

    return (

        <div className="h-[calc(100vh-80px)] bg-[#FAFAF8] p-4 md:p-6">

            <div className="h-full bg-white rounded-xl border border-[#E7E5E0] overflow-hidden flex">

                {loading ? (

                    <div className="flex-1 flex items-center justify-center text-[#8A8D93] text-[14px]">

                        Loading conversations...

                    </div>

                ) : (

                    <>

                        {/* ================================================= */}
                        {/* CONVERSATION LIST */}
                        {/* ================================================= */}

                        <ConversationList
                            conversations={
                                conversations
                            }

                            selectedConversationId={
                                selectedConversationId
                            }

                            onSelectConversation={
                                handleSelectConversation
                            }

                            currentUser={
                                user
                            }
                        />


                        {/* ================================================= */}
                        {/* CHAT WINDOW */}
                        {/* ================================================= */}

                        <ChatWindow
                            conversation={
                                selectedConversation
                            }

                            conversations={
                                conversations
                            }

                            currentUser={
                                user
                            }

                            onConversationMessage={
                                handleConversationMessage
                            }
                        />

                    </>

                )}

            </div>

        </div>

    );

};


export default Messages;