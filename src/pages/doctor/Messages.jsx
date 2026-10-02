import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  getDoctorConversations,
} from "../../services/chatService";

import ConversationList from "../../components/chat/ConversationList";
import ChatWindow from "../../components/chat/ChatWindow";
import { useAuth } from "../../context/AuthContext";

const Messages = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState(null);

  const [loading, setLoading] = useState(true);


  // =========================================================
  // LOAD CONVERSATIONS
  // =========================================================

  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data =
        await getDoctorConversations(user.id);

      setConversations(
        Array.isArray(data)
          ? data
          : []
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

  }, [user?.id]);


  // =========================================================
  // LOAD WHEN USER IS AVAILABLE
  // =========================================================

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);


  // =========================================================
  // HANDLE REAL-TIME MESSAGES
  // =========================================================

  const handleConversationMessage =
    useCallback((newMessage) => {

      if (!newMessage?.conversationId) {
        return;
      }

      const conversationId =
        String(newMessage.conversationId);


      setConversations((previous) => {

        return previous.map(
          (conversation) => {

            if (
              String(conversation.id) !==
              conversationId
            ) {
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

          }
        );

      });

    }, []);


  // =========================================================
  // KEEP SELECTED CONVERSATION VALID
  // =========================================================

  useEffect(() => {

    // -------------------------------------------------------
    // Automatically select first conversation
    // -------------------------------------------------------

    if (
      selectedConversationId === null &&
      conversations.length > 0
    ) {

      const firstConversation =
        conversations[0];

      if (firstConversation?.id) {

        setSelectedConversationId(
          String(firstConversation.id)
        );

      }

      return;
    }


    // -------------------------------------------------------
    // Check whether selected conversation still exists
    // -------------------------------------------------------

    if (
      selectedConversationId !== null
    ) {

      const stillExists =
        conversations.some(
          (conversation) =>
            String(conversation.id) ===
            String(selectedConversationId)
        );


      if (!stillExists) {

        setSelectedConversationId(null);

      }

    }

  }, [
    conversations,
    selectedConversationId,
  ]);


  // =========================================================
  // SELECT CONVERSATION
  // =========================================================

  const handleSelectConversation =
    (conversation) => {

      if (!conversation?.id) {
        return;
      }

      const conversationId =
        String(conversation.id);


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


  // =========================================================
  // SELECTED CONVERSATION
  // =========================================================

  const selectedConversation =
    conversations.find(
      (conversation) =>
        String(conversation.id) ===
        String(selectedConversationId)
    ) || null;


  // =========================================================
  // LOGIN REQUIRED
  // =========================================================

  if (!user) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">

        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl text-indigo-600">
            ✉
          </div>


          <h2 className="text-xl font-bold text-slate-800">
            Login Required
          </h2>


          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Please login to access your patient
            conversations.
          </p>

        </div>

      </div>

    );

  }


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div className="min-h-screen bg-[#f5f7fb] font-inter">


      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">


            {/* ================================================= */}
            {/* LEFT HEADER */}
            {/* ================================================= */}

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-lg shadow-indigo-200">
                ✉
              </div>


              <div>

                <div className="flex items-center gap-2">

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                    Doctor Portal
                  </p>

                  <span className="h-1 w-1 rounded-full bg-slate-300" />

                  <span className="text-xs font-medium text-slate-400">
                    Messaging
                  </span>

                </div>


                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Patient Messages
                </h1>


                <p className="mt-1 text-sm text-slate-500">
                  Communicate securely with your patients
                </p>

              </div>

            </div>


            {/* ================================================= */}
            {/* RIGHT HEADER */}
            {/* ================================================= */}

            <div className="flex items-center gap-3">


              {/* =============================================== */}
              {/* CONVERSATION COUNT */}
              {/* =============================================== */}

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600">

                  {conversations.length}

                </div>


                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Conversations
                  </p>

                  <p className="text-sm font-semibold text-slate-700">
                    Active chats
                  </p>

                </div>

              </div>


              {/* =============================================== */}
              {/* REFRESH */}
              {/* =============================================== */}

              <button
                onClick={loadConversations}
                disabled={loading}
                className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Refresh conversations"
              >

                <span
                  className={`text-lg ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                >
                  ↻
                </span>


                <span className="hidden sm:inline">
                  Refresh
                </span>

              </button>

            </div>

          </div>

        </div>

      </header>


      {/* ===================================================== */}
      {/* MAIN */}
      {/* ===================================================== */}

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">


        {/* =================================================== */}
        {/* MESSAGING CARD */}
        {/* =================================================== */}

        <section
          className="
            flex
            h-[calc(100vh-230px)]
            min-h-[600px]
            flex-col
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-[0_8px_30px_rgba(15,23,42,0.06)]
          "
        >


          {/* ================================================= */}
          {/* PANEL HEADER */}
          {/* ================================================= */}

          <div className="flex shrink-0 flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">


            {/* =============================================== */}
            {/* PANEL TITLE */}
            {/* =============================================== */}

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
                ☏
              </div>


              <div>

                <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                  Patient Conversations
                </h2>


                <p className="text-xs text-slate-400">
                  Select a conversation to view messages
                </p>

              </div>

            </div>


            {/* =============================================== */}
            {/* ONLINE INDICATOR */}
            {/* =============================================== */}

            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

              <span className="relative flex h-2.5 w-2.5">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />

              </span>

              Messaging active

            </div>

          </div>


          {/* ================================================= */}
          {/* CHAT AREA */}
          {/* ================================================= */}

          <div className="flex min-h-0 flex-1 flex-col md:flex-row">


            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {loading ? (

              <div className="flex min-h-0 flex-1 flex-col items-center justify-center">

                <div className="h-11 w-11 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

                <p className="mt-4 text-sm font-semibold text-slate-600">
                  Loading conversations
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Please wait...
                </p>

              </div>


            ) : conversations.length === 0 ? (


              /* ================================================= */
              /* EMPTY STATE */
              /* ================================================= */

              <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-16 text-center">

                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 text-4xl text-indigo-500">
                  ✉
                </div>


                <h3 className="text-xl font-bold text-slate-800">
                  No conversations yet
                </h3>


                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Patient conversations will appear
                  here when a conversation becomes
                  available.
                </p>


                <button
                  onClick={loadConversations}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                >

                  <span>
                    ↻
                  </span>

                  Refresh conversations

                </button>

              </div>


            ) : (


              /* ================================================= */
              /* CONVERSATIONS + CHAT */
              /* ================================================= */

              <div className="flex min-h-0 flex-1 flex-col md:flex-row">


                {/* ================================================= */}
                {/* SIDEBAR */}
                {/* ================================================= */}

                <aside
                  className="
                    flex
                    h-full
                    min-h-0
                    w-full
                    shrink-0
                    flex-col
                    border-b
                    border-slate-200
                    bg-white
                    md:w-[320px]
                    md:border-b-0
                    md:border-r
                    lg:w-[360px]
                    xl:w-[390px]
                  "
                >


                  {/* ============================================= */}
                  {/* SIDEBAR HEADER */}
                  {/* ============================================= */}

                  <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-4">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Recent Chats
                      </p>


                      <p className="mt-0.5 text-xs text-slate-400">

                        {conversations.length}

                        {" "}

                        conversation
                        {conversations.length !== 1
                          ? "s"
                          : ""}

                      </p>

                    </div>


                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-indigo-600 shadow-sm">

                      {conversations.length}

                    </div>

                  </div>


                  {/* ============================================= */}
                  {/* CONVERSATION LIST */}
                  {/* ============================================= */}

                  <div className="min-h-0 flex-1 overflow-hidden">

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

                      currentUser={user}
                    />

                  </div>

                </aside>


                {/* ================================================= */}
                {/* CHAT WINDOW */}
                {/* ================================================= */}

                <div className="min-h-0 min-w-0 flex-1 bg-[#f8fafc]">


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


                    /* ============================================= */
                    /* SELECT CONVERSATION */
                    /* ============================================= */

                    <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 text-center">

                      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-4xl text-indigo-400 shadow-sm ring-1 ring-slate-100">
                        💬
                      </div>


                      <h3 className="text-xl font-bold text-slate-800">
                        Select a conversation
                      </h3>


                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                        Choose a patient from the
                        conversation list to view
                        messages and continue your
                        conversation.
                      </p>


                      <div className="mt-6 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">

                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        {conversations.length}

                        {" "}

                        conversations available

                      </div>

                    </div>

                  )}

                </div>

              </div>

            )}

          </div>

        </section>


        {/* ===================================================== */}
        {/* FOOTER INFO */}
        {/* ===================================================== */}

        <div className="mt-5 flex flex-col gap-2 px-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <p>
            Doctor Portal · Patient Messaging
          </p>


          <div className="flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span>
              Keep patient conversations professional
              and confidential.
            </span>

          </div>

        </div>

      </main>

    </div>

  );
};

export default Messages;