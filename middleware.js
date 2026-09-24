/* Host-Routing vor dem Dateisystem.
   Auf zimmermannplatz6.at wird jeder Seitenaufruf auf die Coming-soon-Seite umgeschrieben,
   auch die Startseite. Ein Rewrite in vercel.json reicht dafuer nicht, weil Vercel Rewrites
   erst anwendet, wenn kein statisches File passt, und "/" auf index.html trifft.
   Die Adresse in der Browserzeile bleibt stehen, ausgeliefert wird coming-soon.html.
   Auf zimmermannplatz.ad.boutique passiert nichts, dort laeuft die vollstaendige Website. */

export const config = {
  matcher: ["/((?!assets/|api/|_vercel/|favicon\\.ico).*)"]
};

const COMING_SOON_HOST = /^(www\.)?zimmermannplatz6\.at$/i;
const TARGET = "/coming-soon.html";

export default function middleware(request) {
  const host = (request.headers.get("host") || "").split(":")[0];
  if (!COMING_SOON_HOST.test(host)) return;

  const url = new URL(request.url);
  if (url.pathname === TARGET) return;

  url.pathname = TARGET;
  url.search = "";
  return Response.rewrite(url);
}
