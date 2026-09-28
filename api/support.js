const TOPICS = new Set([
  "Photo access",
  "Missing or incorrect matches",
  "Teaching faces",
  "Purchase or restore",
  "Backup or transfer",
  "Feedback or feature request",
  "Something else",
]);

function text(value, limit) {
  return typeof value === "string" ? value.trim().slice(0, limit + 1) : "";
}

function parseBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body !== "string") return {};
  try {
    if (request.headers["content-type"]?.includes("application/json")) {
      return JSON.parse(request.body);
    }
    return Object.fromEntries(new URLSearchParams(request.body));
  } catch {
    return {};
  }
}

module.exports = async function support(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const origin = request.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.host) {
        return response.status(403).json({ error: "Invalid origin" });
      }
    } catch {
      return response.status(403).json({ error: "Invalid origin" });
    }
  }

  if (Number(request.headers["content-length"] || 0) > 12000) {
    return response.status(413).json({ error: "Request too large" });
  }

  const body = parseBody(request);
  if (text(body["bot-field"], 100)) {
    return response.status(200).json({ ok: true });
  }

  const name = text(body.name, 120);
  const email = text(body.email, 254);
  const topic = text(body.topic, 80);
  const iosVersion = text(body["ios-version"], 80);
  const appVersion = text(body["app-version"], 80);
  const message = text(body.message, 5000);
  const requestId = text(body["request-id"], 36) || require("node:crypto").randomUUID();

  if (
    !name || name.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
    !TOPICS.has(topic) ||
    !message || message.length > 5000 ||
    iosVersion.length > 80 || appVersion.length > 80 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)
  ) {
    return response.status(400).json({ error: "Please check the form and try again." });
  }

  const { RESEND_API_KEY, SUPPORT_FROM_EMAIL, SUPPORT_TO_EMAIL } = process.env;
  if (!RESEND_API_KEY || !SUPPORT_FROM_EMAIL || !SUPPORT_TO_EMAIL) {
    console.error("Support form email configuration is missing");
    return response.status(503).json({ error: "Support form is unavailable." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `at-that-age-support/${requestId}`,
      },
      body: JSON.stringify({
        from: SUPPORT_FROM_EMAIL,
        to: [SUPPORT_TO_EMAIL],
        reply_to: email,
        subject: `At That Age support: ${topic}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Topic: ${topic}`,
          `iOS version: ${iosVersion || "Not provided"}`,
          `App version: ${appVersion || "Not provided"}`,
          "",
          message,
        ].join("\n"),
      }),
    });
    if (!result.ok) {
      console.error("Support form email failed", result.status);
      return response.status(502).json({ error: "Support request could not be sent." });
    }
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error("Support form email request failed", error.name);
    return response.status(502).json({ error: "Support request could not be sent." });
  } finally {
    clearTimeout(timeout);
  }
};
