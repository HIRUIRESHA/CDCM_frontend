import React, { useEffect, useState, useCallback } from "react";
import { getPatientConversations } from "../../services/chatService";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";
import { useAuth } from "../../context/AuthContext";

const Messages = () => {
    const { user } = useAuth();

    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadConversations = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const data = await getPatientConversations(user.id);

            setConversations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load conversations:", error);
            setConversations([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const handleConversationMessage = useCallback((newMessage) => {
        if (!newMessage || !newMessage.conversationId) {
            return;
        }

        const conversationId = String(newMessage.conversationId);

        setConversations((previousConversations) =>
            previousConversations.map((conversation) => {
                if (String(conversation.id) !== conversationId) {
                    return conversation;
                }

                return {
                    ...conversation,
                    lastMessage:
                        newMessage.content ||
                        conversation.lastMessage ||
                        "",
                    lastMessageAt:
                        newMessage.sentAt ||
                        conversation.lastMessageAt ||
                        new Date().toISOString(),
                };
            })
        );
    }, []);

    useEffect(() => {
        if (
            selectedConversationId === null &&
            conversations.length > 0
        ) {
            const firstConversation = conversations[0];

            if (firstConversation?.id) {
                setSelectedConversationId(
                    String(firstConversation.id)
                );
            }

            return;
        }

        if (selectedConversationId !== null) {
            const stillExists = conversations.some(
                (conversation) =>
                    String(conversation.id) ===
                    String(selectedConversationId)
            );

            if (!stillExists) {
                setSelectedConversationId(null);
            }
        }
    }, [conversations, selectedConversationId]);

    const handleSelectConversation = (conversation) => {
        if (!conversation?.id) {
            console.error(
                "Conversation ID is missing:",
                conversation
            );
            return;
        }

        setSelectedConversationId(String(conversation.id));
    };

    const selectedConversation =
        conversations.find(
            (conversation) =>
                String(conversation.id) ===
                String(selectedConversationId)
        ) || null;

    if (!user) {
        return (
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#f2f4fc] px-6">
                <div className="w-full max-w-md rounded-[24px] border border-indigo-100 bg-white p-8 text-center shadow-[0_10px_40px_rgba(79,70,229,0.08)]">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                        <svg
                            className="h-7 w-7 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 10h8M8 14h5m7-2a8 8 0 01-8 8H7l-4 2 1.5-4A8 8 0 1119 12z"
                            />
                        </svg>
                    </div>

                    <h2 className="text-xl font-bold text-[#1F2937]">
                        Sign in to view messages
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                        Please login to access your conversations
                        with doctors and hospitals.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#f2f4fc] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto flex min-h-[calc(100vh-128px)] max-w-[1500px] flex-col">

                {/* PAGE HEADER */}
                <div className="relative mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#17265e] via-[#4f46e5] to-[#0f766e] px-6 py-6 shadow-[0_12px_35px_rgba(30,41,100,0.18)] sm:px-8 sm:py-7">

                    <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10" />

                    <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/5" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                                <svg
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8 10h8M8 14h5m7-2a8 8 0 01-8 8H7l-4 2 1.5-4A8 8 0 1119 12z"
                                    />
                                </svg>
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100">
                                    Patient Portal
                                </p>

                                <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                    Messages
                                </h1>

                                <p className="mt-1 text-sm text-indigo-100">
                                    Communicate with your doctors
                                    and manage your conversations.
                                </p>
                            </div>
                        </div>

                        <div className="relative flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white">
                                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-white/20 px-2 text-xs font-bold">
                                    {conversations.length}
                                </span>

                                <span>
                                    {conversations.length === 1
                                        ? "Conversation"
                                        : "Conversations"}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={loadConversations}
                                disabled={loading}
                                title="Refresh conversations"
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <svg
                                    className={`h-5 w-5 ${
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 4v5h5M20 20v-5h-5M5.2 15a7.5 7.5 0 0012.6 2M18.8 9a7.5 7.5 0 00-12.6-2"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN MESSAGE CARD */}
                <div className="flex min-h-[550px] flex-1 flex-col overflow-hidden rounded-[24px] border border-indigo-100 bg-white shadow-[0_10px_35px_rgba(30,41,100,0.08)]">

                    {/* CARD HEADER */}
                    <div className="flex flex-shrink-0 items-center justify-between border-b border-indigo-50 bg-white px-5 py-4 sm:px-6">

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                                <svg
                                    className="h-5 w-5 text-indigo-600"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M8 10h8M8 14h5m7-2a8 8 0 01-8 8H7l-4 2 1.5-4A8 8 0 1119 12z"
                                    />
                                </svg>
                            </div>

                            <div>
                                <h2 className="text-sm font-bold text-[#111827] sm:text-base">
                                    Doctor Conversations
                                </h2>

                                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                                    View and manage your messages
                                </p>
                            </div>
                        </div>

                        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 sm:flex">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Messaging
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="flex min-h-0 flex-1 overflow-hidden">

                        {loading ? (
                            <div className="flex h-full w-full items-center justify-center bg-[#f8faff]">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />

                                    <p className="text-sm text-[#6B7280]">
                                        Loading your conversations...
                                    </p>
                                </div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-[#f8faff] px-6 text-center">

                                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-indigo-50 to-emerald-50">
                                    <svg
                                        className="h-9 w-9 text-indigo-500"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8 10h8M8 14h5m7-2a8 8 0 01-8 8H7l-4 2 1.5-4A8 8 0 1119 12z"
                                        />
                                    </svg>
                                </div>

                                <h2 className="text-xl font-bold text-[#1F2937]">
                                    No conversations yet
                                </h2>

                                <p className="mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
                                    Your conversations with doctors
                                    and hospitals will appear here
                                    when you start a conversation.
                                </p>

                                <button
                                    type="button"
                                    onClick={loadConversations}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 4v5h5M20 20v-5h-5M5.2 15a7.5 7.5 0 0012.6 2M18.8 9a7.5 7.5 0 00-12.6-2"
                                        />
                                    </svg>

                                    Refresh
                                </button>
                            </div>
                        ) : (
                            <div className="flex h-full min-h-0 w-full">

                                {/* CONVERSATION SIDEBAR */}
                                <aside className="flex h-full w-full flex-shrink-0 flex-col border-r border-indigo-50 bg-white md:w-[320px] lg:w-[350px] xl:w-[380px]">

                                    <div className="flex flex-shrink-0 items-center justify-between border-b border-[#F0F0F0] px-5 py-4">

                                        <div>
                                            <h3 className="text-sm font-bold text-[#111827]">
                                                Recent Chats
                                            </h3>

                                            <p className="mt-0.5 text-xs text-[#9CA3AF]">
                                                Your doctor conversations
                                            </p>
                                        </div>

                                        <div className="flex h-8 min-w-8 items-center justify-center rounded-full bg-indigo-50 px-2 text-xs font-bold text-indigo-600">
                                            {conversations.length}
                                        </div>
                                    </div>

                                    <div className="min-h-0 flex-1 overflow-y-auto">
                                        <ConversationList
                                            conversations={conversations}
                                            selectedConversationId={
                                                selectedConversationId
                                            }
                                            onSelectConversation={
                                                handleSelectConversation
                                            }
                                            currentUser={user}
                                        />
                                    </div>
                                </aside>

                                {/* CHAT AREA */}
                                <div className="hidden min-w-0 flex-1 flex-col bg-[#f8faff] md:flex">

                                    {selectedConversation ? (
                                        <ChatWindow
                                            conversation={
                                                selectedConversation
                                            }
                                            conversations={
                                                conversations
                                            }
                                            currentUser={user}
                                            onConversationMessage={
                                                handleConversationMessage
                                            }
                                        />
                                    ) : (
                                        <div className="flex h-full flex-1 flex-col items-center justify-center px-6 text-center">

                                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-indigo-50 to-emerald-50">
                                                <svg
                                                    className="h-9 w-9 text-indigo-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M8 10h8M8 14h5m7-2a8 8 0 01-8 8H7l-4 2 1.5-4A8 8 0 1119 12z"
                                                    />
                                                </svg>
                                            </div>

                                            <h2 className="text-lg font-bold text-[#1F2937]">
                                                Select a conversation
                                            </h2>

                                            <p className="mt-2 max-w-sm text-sm leading-6 text-[#6B7280]">
                                                Choose a conversation
                                                from the left to view
                                                your messages with a
                                                doctor.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="pt-4 text-center text-xs text-[#9CA3AF]">
                    Messages are securely handled through
                    the patient communication system.
                </div>
            </div>
        </div>
    );
};

export default Messages;