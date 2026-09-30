
import React, { useEffect, useState, useCallback } from "react";
import { getDoctorConversations } from "../../services/chatService";
import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";
import { useAuth } from "../../context/AuthContext";

const Messages = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState(null);
  const [loading, setLoading] = useState(true);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getDoctorConversations(user.id);
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

  // Handle real-time messages
  const handleConversationMessage = useCallback((newMessage) => {
    if (!newMessage?.conversationId) return;

    const conversationId = String(newMessage.conversationId);

    setConversations((previous) =>
      previous.map((conversation) => {
        if (String(conversation.id) !== conversationId) {
          return conversation;
        }

        return {
          ...conversation,
          lastMessage:
            newMessage.content || conversation.lastMessage || "",
          lastMessageAt:
            newMessage.sentAt ||
            conversation.lastMessageAt ||
            new Date().toISOString(),
        };
      })
    );
  }, []);

  // Keep selected conversation valid
  useEffect(() => {
    if (selectedConversationId === null && conversations.length > 0) {
      const firstConversation = conversations[0];

      if (firstConversation?.id) {
        setSelectedConversationId(String(firstConversation.id));
      }
      return;
    }

    if (selectedConversationId !== null) {
      const stillExists = conversations.some(
        (conversation) =>
          String(conversation.id) === String(selectedConversationId)
      );

      if (!stillExists) {
        setSelectedConversationId(null);
      }
    }
  }, [conversations, selectedConversationId]);

  // Select conversation
  const handleSelectConversation = (conversation) => {
    if (!conversation?.id) return;

    const conversationId = String(conversation.id);

    if (String(selectedConversationId) === conversationId) return;

    setSelectedConversationId(conversationId);
  };

  // Get selected conversation
  const selectedConversation =
    conversations.find(
      (conversation) =>
        String(conversation.id) === String(selectedConversationId)
    ) || null;

  // Login required
  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#f2f4fc] p-6">
        <div className="rounded-2xl border border-indigo-100 bg-white p-10 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl text-indigo-600">
            ✉
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Login Required
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Please login to view your messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col bg-[#f2f4fc] p-4 font-inter sm:p-6 lg:p-8">

      {/* Gradient Header */}
      <div className="relative mb-6 overflow-hidden rounded-[24px] bg-gradient-to-r from-[#17265e] via-[#4f46e5] to-[#0f766e] px-5 py-6 text-white shadow-lg sm:px-8 sm:py-7">

        {/* Decorative background circles */}
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[45px] border-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-32 left-[35%] h-64 w-64 rounded-full bg-white/[0.04]" />

        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          {/* Page title */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-3xl shadow-md backdrop-blur-sm">
              ✉
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
                Doctor Portal
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Messages
              </h1>
              <p className="mt-1 text-sm text-indigo-100">
                Communicate with your patients and manage conversations
              </p>
            </div>
          </div>

          {/* Conversation count and refresh */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100">
                Conversations
              </p>
              <p className="mt-1 text-2xl font-bold">
                {conversations.length}
              </p>
            </div>

            <button
              onClick={loadConversations}
              disabled={loading}
              className="flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-4 text-sm font-semibold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Refresh conversations"
            >
              <span className={loading ? "animate-spin" : ""}>↻</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat content */}
      <main className="flex min-h-[500px] flex-1 flex-col overflow-hidden rounded-[24px] border border-indigo-100/80 bg-white shadow-[0_8px_35px_rgba(40,50,100,0.07)]">

        {/* Chat panel heading */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
              ☏
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Patient Conversations
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Select a conversation to start messaging
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Messaging
          </div>
        </div>

        {/* Conversation list and chat window */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-white">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="text-sm font-medium text-slate-500">
                Loading conversations...
              </p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-teal-50 text-4xl text-indigo-500">
                ✉
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No conversations yet
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
                Your patient conversations will appear here when available.
              </p>
              <button
                onClick={loadConversations}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700"
              >
                Refresh conversations
              </button>
            </div>
          ) : (
            <>
              {/* Conversation sidebar */}
              <div className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-r border-slate-100 bg-white md:w-[320px] lg:w-[350px] xl:w-[380px]">
                <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Recent Chats
                  </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  <ConversationList
                    conversations={conversations}
                    selectedConversationId={selectedConversationId}
                    onSelectConversation={handleSelectConversation}
                    currentUser={user}
                  />
                </div>
              </div>

              {/* Chat window */}
              <div
                className={`min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#f8faff] ${
                  selectedConversation
                    ? "flex"
                    : "hidden md:flex"
                }`}
              >
                {selectedConversation ? (
                  <ChatWindow
                    conversation={selectedConversation}
                    conversations={conversations}
                    currentUser={user}
                    onConversationMessage={handleConversationMessage}
                  />
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-teal-50 text-4xl text-indigo-600">
                      ✉
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Your messages
                    </h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">
                      Choose a patient from the conversation list to view
                      messages and continue your conversation.
                    </p>
                    <div className="mt-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-teal-500" />
                      {conversations.length} conversations available
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-slate-400">
        <p>Doctor Portal · Patient Messaging</p>
        <p>Keep patient conversations professional and confidential.</p>
      </div>
    </div>
  );
};

export default Messages;

