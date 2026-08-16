/**
 * F.A.I. — backend API client.
 *
 * All chat traffic goes through the F.A.I. server (see `server/`). The
 * Groq API key lives ONLY on the server, never in the browser bundle.
 *
 * Contract (POST {FAI_API_URL}/api/chat):
 *   body    { message, conversationHistory?, currentSection?,
 *             currentProject?, language? }
 *   success { response, followUpSuggestions }
 *   error   { error: { code, message } }
 */

const API_URL = (process.env.REACT_APP_FAI_API_URL || "http://localhost:4000").replace(/\/+$/, "");
const DEFAULT_TIMEOUT_MS = 90000;

export class FaiApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "FaiApiError";
    this.code = code;
  }
}

async function request(path, payload, signal) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", onAbort, {once: true});
    }
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (error) {
    if (error && error.name === "AbortError") {
      throw new FaiApiError("TIMEOUT", "The request timed out.");
    }
    throw new FaiApiError("NETWORK", `Network error while contacting F.A.I. (${API_URL}).`);
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener("abort", onAbort);
  }

  if (!response.ok) {
    let code = "REQUEST";
    let message = "The F.A.I. server returned an error.";
    try {
      const data = await response.json();
      if (data && data.error) {
        code = data.error.code || code;
        message = data.error.message || message;
      }
    } catch (_) {
      /* non-JSON error body */
    }
    throw new FaiApiError(code, message);
  }

  return response.json();
}

/**
 * Sends a chat message to the F.A.I. server.
 * @param {{message: string, conversationHistory?: Array, currentSection?: string,
 *          currentProject?: string, language?: string, signal?: AbortSignal}} options
 * @returns {Promise<{response: string, followUpSuggestions: string[]}>}
 */
export async function chat({message, conversationHistory, currentSection, currentProject, language, signal}) {
  return request("/api/chat", {message, conversationHistory, currentSection, currentProject, language}, signal);
}

export {DEFAULT_TIMEOUT_MS};
