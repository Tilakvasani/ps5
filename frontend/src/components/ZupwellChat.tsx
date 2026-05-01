"use client";

/**
 * ZupwellChat.tsx — Floating AI Chat Widget
 * ==========================================
 * Drop this component anywhere in your Next.js layout (e.g. app/layout.tsx).
 * It renders a floating chat bubble in the bottom-right corner.
 *
 * Features:
 *  - Reads auth token from Zustand store → auto-fills user name/email for tickets
 *  - Multi-turn conversation with the LangGraph agent
 *  - Ticket creation confirmation with reference number
 *  - Session persisted in localStorage (session_id) + Redis (backend)
 *  - Smooth animations, typing indicator, auto-scroll
 *
 * Usage in layout.tsx:
 *   import ZupwellChat from "@/components/ZupwellChat";
 *   // Inside <body>: <ZupwellChat />
 *
 * Environment variable:
 *   NEXT_PUBLIC_CHAT_API_URL=http://localhost:8000
 *
 * FIX APPLIED:
 *  - Added isMounted guard (useState + useEffect) to prevent SSR rendering.
 *    The component uses localStorage/sessionStorage which don't exist on the
 *    server, causing a hydration mismatch where the server HTML-encodes quotes
 *    (' → &#x27;) but the client renders raw quotes.
 *  - Added suppressHydrationWarning to <style> tag as an extra safety net.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
  ticketRef?: string;
  intent?: string;
}

interface ApiResponse {
  response: string;
  intent: string;
  confidence: string;
  ticket_ref?: string;
  session_id: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL || "https://whatsappchatbot-jfki.onrender.com";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = localStorage.getItem("zupwell_chat_session");
  if (!sid) {
    sid = `ws_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("zupwell_chat_session", sid);
  }
  return sid;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    null
  );
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ZupwellChat() {
  // ── FIX: isMounted guard ─────────────────────────────────────────────────
  // Prevents any server-side rendering of this component. Since the component
  // relies on localStorage (sessionId, auth token), rendering on the server
  // produces different output than the client, causing React's hydration to
  // report a mismatch. Returning null until after mount ensures the component
  // is only ever rendered in the browser.
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [sessionId] = useState(() => getOrCreateSessionId());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Welcome message on first open ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: uid(),
          role: "bot",
          text: "👋 Hi! I'm Zupwell's AI support assistant.\n\nI can help you with products, orders, shipping, refunds, or raise a support ticket.\n\nWhat can I help you with today? 😊",
          timestamp: new Date(),
          intent: "greeting",
        },
      ]);
    }
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: uid(),
      role: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();

      const botMsg: Message = {
        id: uid(),
        role: "bot",
        text: data.response,
        timestamp: new Date(),
        ticketRef: data.ticket_ref,
        intent: data.intent,
      };
      setMessages((prev) => [...prev, botMsg]);

      if (!isOpen) setHasUnread(true);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "bot",
          text: "Sorry, I'm having trouble connecting right now. 😔\n\nPlease try again or contact us at info@zupwell.com",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, isOpen]);

  // ── Enter key handler ────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Quick replies ─────────────────────────────────────────────────────────────
  const quickReplies = [
    "What products do you offer?",
    "How long does delivery take?",
    "I want to raise a ticket",
    "What is your return policy?",
  ];

  // ── FIX: Return null on server / before mount ─────────────────────────────
  if (!isMounted) return null;
  // ─────────────────────────────────────────────────────────────────────────

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Global styles — suppressHydrationWarning prevents quote-encoding mismatch ── */}
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .zw-chat-root * { box-sizing: border-box; }

        .zw-fab {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          box-shadow: 0 4px 20px rgba(34,197,94,0.45), 0 2px 8px rgba(0,0,0,0.15);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
          color: white; font-size: 26px;
        }
        .zw-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 28px rgba(34,197,94,0.55), 0 2px 10px rgba(0,0,0,0.18);
        }
        .zw-fab.open { background: linear-gradient(135deg, #374151 0%, #1f2937 100%); }

        .zw-badge {
          position: absolute; top: -2px; right: -2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #ef4444; border: 2px solid white;
          font-size: 10px; font-weight: 700; color: white;
          display: flex; align-items: center; justify-content: center;
        }

        .zw-window {
          position: fixed; bottom: 96px; right: 24px; z-index: 9998;
          width: 380px; height: 580px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
          display: flex; flex-direction: column; overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          transform-origin: bottom right;
          animation: zw-pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes zw-pop-in {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        @media (max-width: 440px) {
          .zw-window { width: calc(100vw - 32px); bottom: 88px; right: 16px; height: 70vh; }
          .zw-fab    { bottom: 16px; right: 16px; }
        }

        /* Header */
        .zw-header {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          padding: 16px 18px;
          display: flex; align-items: center; gap: 12px;
          flex-shrink: 0;
        }
        .zw-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .zw-header-text { flex: 1; }
        .zw-header-name { color: white; font-weight: 600; font-size: 15px; line-height: 1.2; }
        .zw-header-status { color: rgba(255,255,255,0.8); font-size: 12px; display: flex; align-items: center; gap: 4px; }
        .zw-status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #86efac; animation: zw-pulse 2s infinite;
        }
        @keyframes zw-pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .zw-close-btn {
          background: rgba(255,255,255,0.15); border: none; cursor: pointer;
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 18px; transition: background 0.15s;
        }
        .zw-close-btn:hover { background: rgba(255,255,255,0.25); }

        /* Messages */
        .zw-messages {
          flex: 1; overflow-y: auto; padding: 16px 14px;
          display: flex; flex-direction: column; gap: 10px;
          background: #f8faf8;
        }
        .zw-messages::-webkit-scrollbar { width: 4px; }
        .zw-messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

        .zw-msg-row { display: flex; gap: 8px; align-items: flex-end; }
        .zw-msg-row.user { flex-direction: row-reverse; }

        .zw-msg-icon {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }

        .zw-bubble {
          max-width: 78%; padding: 10px 14px; border-radius: 16px;
          font-size: 14px; line-height: 1.55; white-space: pre-wrap; word-break: break-word;
          animation: zw-msg-in 0.2s ease;
        }
        @keyframes zw-msg-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

        .zw-bubble.bot {
          background: white; color: #1f2937;
          border-radius: 16px 16px 16px 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }
        .zw-bubble.user {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white; border-radius: 16px 16px 4px 16px;
        }

        .zw-ticket-badge {
          margin-top: 8px; padding: 6px 10px;
          background: #f0fdf4; border: 1px solid #86efac;
          border-radius: 8px; font-size: 12px; color: #15803d;
          font-family: 'DM Mono', monospace; font-weight: 500;
        }

        .zw-time {
          font-size: 10px; color: #9ca3af; margin-top: 2px;
          padding: 0 4px; text-align: center;
        }
        .zw-msg-row.user .zw-time { text-align: right; }

        /* Typing indicator */
        .zw-typing {
          display: flex; align-items: center; gap: 4px;
          padding: 10px 14px; background: white;
          border-radius: 16px 16px 16px 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.07);
          width: fit-content;
        }
        .zw-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #6b7280;
          animation: zw-bounce 1.2s infinite;
        }
        .zw-dot:nth-child(2) { animation-delay: 0.2s; }
        .zw-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes zw-bounce {
          0%,60%,100% { transform: translateY(0); }
          30%          { transform: translateY(-6px); }
        }

        /* Quick replies */
        .zw-quick-replies {
          padding: 8px 14px 0; display: flex; gap: 6px; flex-wrap: wrap; flex-shrink: 0;
          background: #f8faf8;
        }
        .zw-quick-btn {
          padding: 5px 11px; border-radius: 20px; font-size: 12px; font-weight: 500;
          border: 1.5px solid #22c55e; background: white; color: #16a34a;
          cursor: pointer; transition: all 0.15s; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .zw-quick-btn:hover { background: #22c55e; color: white; }

        /* Input area */
        .zw-input-area {
          padding: 12px 14px 14px;
          border-top: 1px solid #f0f0f0;
          background: white; flex-shrink: 0;
          display: flex; align-items: flex-end; gap: 8px;
        }
        .zw-textarea {
          flex: 1; resize: none; border: 1.5px solid #e5e7eb;
          border-radius: 12px; padding: 10px 12px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          line-height: 1.4; outline: none; max-height: 100px;
          color: #1f2937; background: #fafafa;
          transition: border-color 0.15s;
        }
        .zw-textarea:focus { border-color: #22c55e; background: white; }
        .zw-textarea::placeholder { color: #9ca3af; }
        .zw-send-btn {
          width: 40px; height: 40px; border-radius: 50%; border: none;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white; cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s, opacity 0.15s;
          font-size: 16px;
        }
        .zw-send-btn:hover:not(:disabled) { transform: scale(1.08); }
        .zw-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .zw-footer {
          text-align: center; padding: 6px 14px 10px;
          font-size: 10px; color: #9ca3af; background: white;
        }
        .zw-footer a { color: #16a34a; text-decoration: none; }
      `}</style>

      <div className="zw-chat-root">
        {/* ── Chat window ── */}
        {isOpen && (
          <div className="zw-window" role="dialog" aria-label="Zupwell Support Chat">
            {/* Header */}
            <div className="zw-header">
              <div className="zw-avatar">🌿</div>
              <div className="zw-header-text">
                <div className="zw-header-name">Zupwell Support</div>
                <div className="zw-header-status">
                  <span className="zw-status-dot" />
                  AI Assistant · Usually replies instantly
                </div>
              </div>
              <button className="zw-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="zw-messages">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div className={`zw-msg-row ${msg.role}`}>
                    {msg.role === "bot" && <div className="zw-msg-icon">🌿</div>}
                    <div>
                      <div className={`zw-bubble ${msg.role}`}>
                        {msg.text}
                        {msg.ticketRef && (
                          <div className="zw-ticket-badge">
                            🎫 Ticket: {msg.ticketRef}
                          </div>
                        )}
                      </div>
                      <div className="zw-time">
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="zw-msg-row">
                  <div className="zw-msg-icon">🌿</div>
                  <div className="zw-typing">
                    <div className="zw-dot" />
                    <div className="zw-dot" />
                    <div className="zw-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies — only show when there's just the welcome message */}
            {messages.length === 1 && !isLoading && (
              <div className="zw-quick-replies">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    className="zw-quick-btn"
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => sendMessage(), 0);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="zw-input-area">
              <textarea
                ref={inputRef}
                className="zw-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about Zupwell..."
                rows={1}
                disabled={isLoading}
              />
              <button
                className="zw-send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                ➤
              </button>
            </div>

            <div className="zw-footer">
              Powered by Zupwell AI ·{" "}
              <a href="mailto:info@zupwell.com">info@zupwell.com</a>
            </div>
          </div>
        )}

        {/* ── FAB button ── */}
        <button
          className={`zw-fab ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? "✕" : "💬"}
          {hasUnread && !isOpen && <span className="zw-badge">1</span>}
        </button>
      </div>
    </>
  );
}