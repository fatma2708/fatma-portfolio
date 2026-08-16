import React, {useCallback, useEffect, useRef, useState} from "react";
import {gsap} from "gsap";
import {Copy, Send, Sparkles, Trash2, X} from "lucide-react";
import {WELCOME} from "../../knowledge";
import {chat, FaiApiError} from "../../services/api";
import {usePage} from "../../contexts/PageContext";
import {renderMarkdown} from "./markdown";
import "./fai.scss";

const SUGGESTIONS = [
  "Who are you?",
  "What projects has Fatma built?",
  "What are Fatma's skills?",
  "How can I contact Fatma?",
  "What is Fatma's experience?",
  "What are Fatma's career goals?"
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    onChange();
    if (media.addEventListener) {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);
  return reduced;
}

let uidCounter = 0;
const uid = () => `fai-${Date.now()}-${uidCounter++}`;

const WELCOME_ID = "fai-welcome";

export default function FaiChat() {
  const reduced = useReducedMotion();
  const {section: currentSection, project: currentProject} = usePage();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{id: WELCOME_ID, role: "assistant", text: WELCOME}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const windowRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!open || reduced) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        windowRef.current,
        {opacity: 0, y: 18, scale: 0.94, filter: "blur(12px)"},
        {opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "back.out(1.35)"}
      );
    });
    return () => ctx.revert();
  }, [open, reduced]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = event => {
      if (event.key === "Escape") closeChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open) {
      if (inputRef.current) inputRef.current.focus();
    } else if (buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const openChat = () => setOpen(true);

  const closeChat = () => {
    if (abortRef.current) abortRef.current.abort();
    if (reduced || !windowRef.current) {
      setOpen(false);
      return;
    }
    gsap.to(windowRef.current, {
      opacity: 0,
      y: 18,
      scale: 0.94,
      filter: "blur(12px)",
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => setOpen(false)
    });
  };

  const clearChat = () => {
    if (abortRef.current) abortRef.current.abort();
    setLoading(false);
    setMessages([{id: WELCOME_ID, role: "assistant", text: WELCOME}]);
    if (inputRef.current) inputRef.current.focus();
  };

  const copyMessage = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(current => (current === id ? null : current)), 1600);
  };

  const ask = useCallback(
    async text => {
      const trimmed = String(text || "").trim();
      if (!trimmed || loading) return;

      const userMessage = {id: uid(), role: "user", text: trimmed};
      const pendingId = uid();
      const pendingMessage = {id: pendingId, role: "assistant", text: "", loading: true};

      setMessages(previous => [...previous, userMessage, pendingMessage]);
      setInput("");
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const history = messages
          .filter(m => m.id !== WELCOME_ID && !m.loading)
          .map(m => ({role: m.role === "user" ? "user" : "assistant", content: m.text}));

        const data = await chat({
          message: trimmed,
          conversationHistory: history,
          currentSection,
          currentProject,
          signal: controller.signal
        });

        setMessages(previous =>
          previous.map(m =>
            m.id === pendingId ? {...m, text: data.response, loading: false} : m
          )
        );

        if (data.followUpSuggestions && data.followUpSuggestions.length) {
          const suggestionsId = uid();
          setMessages(previous => [
            ...previous,
            {id: suggestionsId, role: "assistant", suggestions: data.followUpSuggestions}
          ]);
        }
      } catch (error) {
        if (error instanceof FaiApiError && error.code === "TIMEOUT") {
          setMessages(previous =>
            previous.map(m =>
              m.id === pendingId
                ? {...m, text: "It took too long to respond. Please try again.", loading: false}
                : m
            )
          );
        } else if (error instanceof FaiApiError && error.code === "NETWORK") {
          setMessages(previous =>
            previous.map(m =>
              m.id === pendingId
                ? {...m, text: "I can't reach my server right now. Please try again later.", loading: false}
                : m
            )
          );
        } else {
          setMessages(previous =>
            previous.map(m =>
              m.id === pendingId
                ? {...m, text: "Something went wrong. Please try again.", loading: false}
                : m
            )
          );
        }
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [loading, messages, currentSection, currentProject]
  );

  const handleSubmit = event => {
    event.preventDefault();
    if (input.trim()) ask(input);
  };

  const handleKeyDown = event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (input.trim()) ask(input);
    }
  };

  const handleSuggestionClick = text => {
    ask(text);
  };

  return (
    <>
      {!open && (
        <button
          ref={buttonRef}
          type="button"
          className="fai-launcher"
          onClick={openChat}
          aria-label="Open F.A.I. chat — ask me anything about Fatma"
        >
          <Sparkles className="fai-spark" aria-hidden="true" />
          <span className="fai-tooltip" role="tooltip">
            Ask F.A.I.
          </span>
        </button>
      )}

      {open && (
        <div
          className="fai-window"
          ref={windowRef}
          role="dialog"
          aria-modal="true"
          aria-label="F.A.I. — Fatma Artificial Intelligence chat"
        >
          <header className="fai-header">
            <div className="fai-avatar" aria-hidden="true">
              🤖
            </div>
            <div className="fai-titles">
              <p className="fai-name">
                F.A.I. <span>Fatma Artificial Intelligence</span>
              </p>
              <p className="fai-status">
                <span className="fai-dot" aria-hidden="true" />
                {loading ? "Thinking…" : "Ask me anything about Fatma"}
              </p>
            </div>
            <div className="fai-header-actions">
              <button
                type="button"
                className="fai-icon-btn"
                onClick={clearChat}
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <Trash2 />
              </button>
              <button
                type="button"
                className="fai-icon-btn fai-close-btn"
                onClick={closeChat}
                aria-label="Close chat"
                title="Close"
              >
                <X />
              </button>
            </div>
          </header>

          <div className="fai-messages" ref={scrollRef}>
            {messages.map(message => (
              <div key={message.id} className={`fai-msg ${message.role}`}>
                {message.suggestions ? (
                  <div className="fai-suggestions">
                    {message.suggestions.map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        className="fai-suggestion-chip"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={loading}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : message.role === "assistant" ? (
                  <div className="fai-bubble">
                    {message.loading ? (
                      <span className="fai-typing">
                        <span className="fai-dot-anim" />
                        <span className="fai-dot-anim" />
                        <span className="fai-dot-anim" />
                      </span>
                    ) : (
                      renderMarkdown(message.text)
                    )}
                  </div>
                ) : (
                  <div className="fai-bubble fai-bubble-user">{message.text}</div>
                )}
                {message.role === "assistant" && !message.loading && !message.suggestions && message.id !== WELCOME_ID && (
                  <button
                    type="button"
                    className="fai-copy"
                    onClick={() => copyMessage(message.id, message.text)}
                    aria-label="Copy message"
                  >
                    {copiedId === message.id ? "Copied" : <Copy />}
                  </button>
                )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="fai-suggestions">
                {SUGGESTIONS.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    className="fai-suggestion-chip"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={loading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form className="fai-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="fai-text-input"
              placeholder="Ask me anything…"
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              aria-label="Type a message to F.A.I."
              autoComplete="off"
            />
            <button
              type="submit"
              className="fai-send-btn"
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
