import React from "react";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeUrl(url) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(url);
}

const INLINE = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/;

export function renderInline(text) {
  const nodes = [];
  let rest = String(text);

  while (rest.length) {
    const match = rest.match(INLINE);
    if (!match) {
      nodes.push(rest);
      break;
    }
    if (match.index > 0) nodes.push(rest.slice(0, match.index));

    if (match[1]) {
      nodes.push(
        <code key={nodes.length} className="fai-ic">
          {match[1]}
        </code>
      );
    } else if (match[2]) {
      nodes.push(<strong key={nodes.length}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={nodes.length}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      const url = isSafeUrl(match[5]) ? match[5] : null;
      nodes.push(
        url ? (
          <a key={nodes.length} href={url} target="_blank" rel="noreferrer noopener">
            {match[4]}
          </a>
        ) : (
          match[4]
        )
      );
    }

    rest = rest.slice(match.index + match[0].length);
  }

  return nodes;
}

const TOKEN = new RegExp(
  [
    /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/.source,
    /\b(?:const|let|var|function|return|import|from|export|class|def|if|else|elif|for|while|print|async|await|new|try|except|raise|true|false|None|null)\b/.source,
    /\b\d+(?:\.\d+)?\b/.source,
    /(?:#[^\n]*|\/\/[^\n]*)/.source
  ].join("|"),
  "g"
);

export function highlightCode(code) {
  const escaped = escapeHtml(code);
  const nodes = [];
  let last = 0;
  let match;
  let key = 0;

  while ((match = TOKEN.exec(escaped))) {
    if (match.index > last) nodes.push(escaped.slice(last, match.index));
    const token = match[0];
    let className = "fai-tok";
    if (/^["']/.test(token)) className = "fai-tok fai-tok-str";
    else if (/^\d/.test(token)) className = "fai-tok fai-tok-num";
    else if (/^(#|\/\/)/.test(token)) className = "fai-tok fai-tok-com";
    else className = "fai-tok fai-tok-kw";
    nodes.push(
      <span key={key++} className={className}>
        {token}
      </span>
    );
    last = match.index + token.length;
  }
  if (last < escaped.length) nodes.push(escaped.slice(last));
  return nodes;
}

export function renderMarkdown(text) {
  const blocks = String(text || "").split(/\n{2,}/);

  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    const fence = trimmed.match(/^```(\w*)\n([\s\S]*?)\n?```$/);
    if (fence) {
      return (
        <div key={index} className="fai-codeblock">
          {fence[1] && <span className="fai-code-lang">{fence[1]}</span>}
          <pre className="fai-code">
            <code>{highlightCode(fence[2])}</code>
          </pre>
        </div>
      );
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag = `h${heading[1].length}`;
      return (
        <Tag key={index} className="fai-h">
          {renderInline(heading[2])}
        </Tag>
      );
    }

    const listLines = trimmed.split("\n");
    if (listLines.every(line => /^[-*]\s+/.test(line))) {
      return (
        <ul key={index} className="fai-list">
          {listLines.map((line, lineIndex) => (
            <li key={lineIndex}>{renderInline(line.replace(/^[-*]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    if (listLines.every(line => /^\d+\.\s+/.test(line))) {
      return (
        <ol key={index} className="fai-list">
          {listLines.map((line, lineIndex) => (
            <li key={lineIndex}>{renderInline(line.replace(/^\d+\.\s+/, ""))}</li>
          ))}
        </ol>
      );
    }

    const paragraphNodes = [];
    listLines.forEach((line, lineIndex) => {
      if (lineIndex > 0) paragraphNodes.push(<br key={`br-${lineIndex}`} />);
      paragraphNodes.push(...renderInline(line));
    });
    return (
      <p key={index} className="fai-p">
        {paragraphNodes}
      </p>
    );
  });
}
