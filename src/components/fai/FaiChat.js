import React, {useEffect, useRef, useState} from "react";
import {gsap} from "gsap";
import {Copy, Sparkles, Trash2, X} from "lucide-react";
import {WELCOME} from "../../knowledge";
import {QUESTION_GROUPS, findAnswer} from "../../knowledge/qa";
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

const groupedQuestions = QUESTION_GROUPS.map(group => ({
  label: group.label,
  questions: group.questions.map(item => item.q)
}));

export default function FaiChat() {
  const reduced = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{id: WELCOME_ID, role: "assistant", text: WELCOME}]);
  const [copiedId, setCopiedId] = useState(null);
  const [selected, setSelected] = useState("");

  const windowRef = useRef(null);
  const buttonRef = useRef(null);
  const selectRef = useRef(null);
  const scrollRef = useRef(null);

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
      if (selectRef.current) selectRef.current.focus();
    } else if (buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const openChat = () => setOpen(true);

  const closeChat = () => {
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
    setMessages([{id: WELCOME_ID, role: "assistant", text: WELCOME}]);
    setSelected("");
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

  const ask = question => {
    const trimmed = String(question || "").trim();
    if (!trimmed) return;
    const answer = findAnswer(trimmed);
    setMessages(previous => [
      ...previous,
      {id: uid(), role: "user", text: trimmed},
      {id: uid(), role: "assistant", text: answer}
    ]);
  };

  const handleSelect = event => {
    const question = event.target.value;
    setSelected("");
    if (question) ask(question);
    event.target.blur();
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
                Pick a question below
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
          </div>

          <div className="fai-dropdown-area">
            <GroupedSelect
              ref={selectRef}
              groups={groupedQuestions}
              value={selected}
              onChange={handleSelect}
            />
            <p className="fai-dropdown-hint">Choose a question to see Fatma's answer.</p>
          </div>
        </div>
      )}
    </>
  );
}

const GroupedSelect = React.forwardRef(function GroupedSelect(
  {groups, value, onChange},
  ref
) {
  return (
    <select
      ref={ref}
      className="fai-question-select"
      value={value}
      onChange={onChange}
      aria-label="Choose a question about Fatma"
    >
      <option value="" disabled>
        — Ask me anything about Fatma —
      </option>
      {groups.map(group => (
        <optgroup key={group.label} label={group.label}>
          {group.questions.map(question => (
            <option key={question} value={question}>
              {question}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
});
