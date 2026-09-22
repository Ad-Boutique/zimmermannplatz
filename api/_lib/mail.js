/* Benachrichtigung per Gmail-SMTP, gleiches Muster wie bei UNIO (GMAIL_USER, GMAIL_APP_PASSWORD).
   Empfaenger: NOTIFY_TO (kommagetrennt). Ohne Env-Vars wird nichts versendet, der Lead bleibt in der Datenbank. */
async function notify(inquiry) {
  const user = process.env.GMAIL_USER; const pass = process.env.GMAIL_APP_PASSWORD; const to = process.env.NOTIFY_TO;
  if (!user || !pass || !to) return false;
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  const isFinder = inquiry.source === "finder";
  const subject = isFinder ? `Anfrage Zimmermannplatz 6, Top ${inquiry.top}` : "Vormerkung Zimmermannplatz 6 (Coming soon)";
  const lines = [
    `Quelle: ${inquiry.source}`,
    inquiry.top ? `Top: ${inquiry.top}` : null,
    inquiry.unit_summary ? `Wohnung: ${inquiry.unit_summary}` : null,
    `Name: ${inquiry.name || ""}`,
    `E-Mail: ${inquiry.email}`,
    `Telefon: ${inquiry.phone || ""}`,
    "",
    inquiry.message || "",
    "",
    `Zustimmung Datenschutz: ${inquiry.consent ? "ja" : "nein"}`,
    `Admin: ${process.env.ADMIN_URL || "/admin"}`
  ].filter((l) => l !== null);
  await transporter.sendMail({ from: `Zimmermannplatz 6 <${user}>`, to, replyTo: inquiry.email, subject, text: lines.join("\n") });
  return true;
}
module.exports = { notify };
