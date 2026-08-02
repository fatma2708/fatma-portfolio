import React, {useEffect, useRef, useState} from "react";
import {gsap} from "gsap";
import {Copy, RefreshCw, Send, Sparkles, Trash2, X} from "lucide-react";
import {usePage} from "../../contexts/PageContext";
import {SUGGESTIONS, WELCOME, detectLanguage} from "../../knowledge";
import {chat as apiChat} from "../../services/api";
import {renderMarkdown} from "./markdown";
import "./fai.scss";

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

function ThinkingDots() {
  return (
    <div className="fai-msg assistant" role="status" aria-live="polite" aria-label="F.A.I. is thinking">
      <div className="fai-bubble fai-thinking">
        <span className="fai-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="fai-thinking-label">F.A.I. is thinking</span>
      </div>
    </div>
  );
}

export default function FaiChat() {
  const reduced = useReducedMotion();
  const {section, project} = usePage();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{id: WELCOME_ID, role: "assistant", text: WELCOME}]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const windowRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const lastPromptRef = useRef("");

  const showChips = messages.length === 1;

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
  }, [messages, status, followUps, open]);

  const openChat = () => {
    setOpen(true);
  };

  const closeChat = () => {
    if (abortRef.current) abortRef.current.abort();
    setFollowUps([]);
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
    setMessages([{id: WELCOME_ID, role: "assistant", text: WELCOME}]);
    setFollowUps([]);
    setError(null);
    setStatus("idle");
    setInput("");
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

  const friendlyError = (errorValue, lang) => {
    const french = lang === "fr";
    const code = errorValue && errorValue.code;
    switch (code) {
      case "MISSING_API_KEY":
        return french
          ? "La clé API Gemini n'est pas configurée côté serveur. Ajoute GEMINI_API_KEY dans le fichier server/.env puis redémarre le serveur."
          : "The Gemini API key isn't configured on the server. Add GEMINI_API_KEY to server/.env and restart the server.";
      case "UNAUTHORIZED":
        return french
          ? "La clé API semble invalide. Vérifie GEMINI_API_KEY dans le fichier server/.env."
          : "The API key looks invalid. Check GEMINI_API_KEY in server/.env.";
      case "QUOTA_EXCEEDED":
        return french
          ? "Le quota de l'IA est épuisé pour l'instant. Réessaie un peu plus tard."
          : "The AI provider's quota is exhausted right now. Please try again later.";
      case "RATE_LIMIT":
        return french
          ? "Trop de requêtes d'un coup — patiente un instant et réessaie."
          : "Too many requests at once — please wait a moment and try again.";
      case "TIMEOUT":
        return french ? "La réponse a pris trop de temps. Réessaie." : "The response took too long. Please try again.";
      case "NETWORK":
        return french
          ? "Problème de réseau. Vérifie ta connexion et réessaie."
          : "Network problem. Check your connection and try again.";
      case "BLOCKED":
        return french
          ? "Je ne peux pas répondre à cette question. Essaie autre chose."
          : "I can't answer that one. Try asking something else.";
      case "EMPTY":
        return french ? "Je n'ai pas reçu de réponse. Réessaie." : "I didn't get a response. Please try again.";
      case "VALIDATION":
        return french ? "Le message n'est pas valide. Réessaie." : "That message wasn't valid. Please try again.";
      case "INTERNAL":
      default:
        return french
          ? "Oups, une erreur s'est produite. Réessaie dans un instant."
          : "Oops, something went wrong. Please try again in a moment.";
    }
  };

  const send = async rawPrompt => {
    const text = (rawPrompt ?? input).trim();
    if (!text || status === "thinking" || status === "streaming") return;

    const language = detectLanguage(text);
    lastPromptRef.current = text;
    setInput("");
    setError(null);
    setFollowUps([]);

    const userMessage = {id: uid(), role: "user", text};
    const history = [...messages, userMessage];
    const assistantId = uid();
    setMessages(history);
    setStatus("thinking");

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 90000);

    const conversationHistory = messages
      .filter(message => message.role === "user" || message.role === "assistant")
      .map(message => ({role: message.role, content: message.text}));

    const payload = {
      message: text,
      conversationHistory,
      currentSection: section,
      currentProject: project,
      language,
      signal: controller.signal
    };

    try {
      const result = await apiChat(payload);

      if (!result.response || !result.response.trim()) {
        throw Object.assign(new Error("The server returned an empty response."), {code: "EMPTY"});
      }

      const answer = result.response;
      setMessages(previous => [...previous, {id: assistantId, role: "assistant", text: answer}]);
      const suggestions = Array.isArray(result.followUpSuggestions) ? result.followUpSuggestions : [];
      setFollowUps(suggestions);
    } catch (requestError) {
      setMessages(previous => previous.filter(message => message.id !== assistantId && message.id !== userMessage.id));
      setError(friendlyError(requestError, language));
    } finally {
      clearTimeout(timeout);
      abortRef.current = null;
      setStatus("idle");
    }
  };

  const retry = () => {
    if (lastPromptRef.current) send(lastPromptRef.current);
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
                Ask me anything about Fatma.
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

          {status === "streaming" && <div className="fai-stream-bar" aria-hidden="true" />}

          <div className="fai-messages" ref={scrollRef}>
            {messages.map(message => (
              <div key={message.id} className={`fai-msg ${message.role}`}>
                {message.role === "assistant" ? (
                  <div className="fai-bubble">{renderMarkdown(message.text)}</div>
                ) : (
                  <div className="fai-bubble fai-bubble-user">{message.text}</div>
                )}
                {message.role === "assistant" && message.id !== WELCOME_ID && (
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

            {status === "thinking" && <ThinkingDots />}

            {error && (
              <div className="fai-error" role="alert">
                <span>{error}</span>
                <button type="button" className="fai-retry" onClick={retry}>
                  <RefreshCw /> Retry
                </button>
              </div>
            )}

            {showChips && (
              <div className="fai-chips">
                {SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={`${suggestion.prompt}-${index}`}
                    type="button"
                    className="fai-chip"
                    onClick={() => send(suggestion.prompt)}
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            )}

            {followUps.length > 0 && status === "idle" && (
              <div className="fai-followups" role="group" aria-label="Suggested follow-up questions">
                {followUps.map(followUp => (
                  <button key={followUp} type="button" className="fai-chip fai-followup" onClick={() => send(followUp)}>
                    {followUp}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="fai-input"
            onSubmit={event => {
              event.preventDefault();
              send();
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              placeholder="Ask me anything…"
              aria-label="Message F.A.I."
              onChange={event => {
                setInput(event.target.value);
                const element = event.target;
                element.style.height = "auto";
                element.style.height = `${Math.min(element.scrollHeight, 130)}px`;
              }}
              onKeyDown={event => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
            />
            <button
              type="submit"
              className="fai-send"
              disabled={!input.trim() || status === "thinking" || status === "streaming"}
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
