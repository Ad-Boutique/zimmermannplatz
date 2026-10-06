#!/usr/bin/env python3
"""Sicherheitscheck Wohnungsfinder: jeder Wert in assets/js/units.js gegen Preisliste und Verkaufsplaene.

Aufruf: python3 tools/check-units.py
Quellen: docs/quellen/preisliste-topografie-2026-09-30.xlsx, assets/plaene/zimmermannplatz-6-top-*.pdf
Prueft je Einheit: Wohnnutzflaeche, Zimmer, jede Freiflaeche (Wert und Art), Kellerabteil, Kaufpreis gegen die Liste;
Wohnnutzflaeche, Freiflaechen, Kellerabteil, Raumhoehe und Plan-Kennung (z. B. EG/2) gegen das Plan-PDF;
dazu Vollstaendigkeit (jede Liste-Zeile im Finder, keine Einheit ohne Quelle) und vorhandene Plan-Dateien (PDF, JPG).
"""
import json, os, re, sys, zipfile
from xml.etree import ElementTree as ET
from pypdf import PdfReader

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = os.path.join(ROOT, "docs/quellen/preisliste-topografie-2026-09-30.xlsx")
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
errors, checks = [], 0

def ok(cond, msg):
    global checks
    checks += 1
    if not cond: errors.append(msg)

# units.js lesen
src = open(os.path.join(ROOT, "assets/js/units.js"), encoding="utf-8").read()
arr = src[src.find("window.Z6_UNITS = [") + len("window.Z6_UNITS = "):]
arr = arr[:arr.find("];") + 1]
arr = re.sub(r"(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:", r'\1 "\2":', arr)
units = {u["top"]: u for u in json.loads(arr)}

# Preisliste lesen (ohne openpyxl)
z = zipfile.ZipFile(XLSX)
ss = ["".join(t.text or "" for t in si.iter("{%s}t" % NS["m"])) for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS)]
rows = []
for row in ET.fromstring(z.read("xl/worksheets/sheet1.xml")).iter("{%s}row" % NS["m"]):
    r = {}
    for c in row.findall("m:c", NS):
        v = c.find("m:v", NS)
        if v is None: continue
        r[re.match(r"[A-Z]+", c.get("r")).group(0)] = ss[int(v.text)] if c.get("t") == "s" else v.text
    rows.append(r)
head = rows[0]
liste = {}
for r in rows[1:]:
    if not r.get("B") or not re.match(r"^\d", str(r.get("B"))): continue
    top = str(r["B"]).replace("-", "+")
    num = lambda k: round(float(r[k]), 2) if r.get(k) not in (None, "") else None
    liste[top] = {"area": num("E"), "rooms": int(float(r["D"])) if r.get("D") else None, "loggia": num("F"), "balcony": num("G"),
                  "terrace": num("H"), "roof": num("I"), "garden": num("J"), "storage": num("L"), "price": round(float(r["M"])) if r.get("M") else None}

ART = {"Loggia": "loggia", "Balkon": "balcony", "Terrasse": "terrace", "Podest": "terrace", "Dachterrasse": "roof", "Garten": "garden"}
de = lambda n: ("%.2f" % n).replace(".", ",")

ok(set(liste) == set(units), "Einheiten unterschiedlich: nur Liste %s, nur Finder %s" % (sorted(set(liste) - set(units)), sorted(set(units) - set(liste))))
for top, u in units.items():
    L = liste.get(top)
    if not L: continue
    ok(abs(u["area"] - L["area"]) < 0.005, "Top %s Fläche Finder %s, Liste %s" % (top, u["area"], L["area"]))
    ok(u["rooms"] == L["rooms"], "Top %s Zimmer Finder %s, Liste %s" % (top, u["rooms"], L["rooms"]))
    ok(abs(u["storage"] - L["storage"]) < 0.005, "Top %s Kellerabteil Finder %s, Liste %s" % (top, u["storage"], L["storage"]))
    ok(u["price"] == L["price"], "Top %s Preis Finder %s, Liste %s" % (top, u["price"], L["price"]))
    summe = {}
    for o in u["out"]:
        k = ART.get(o["type"]); ok(k is not None, "Top %s unbekannte Freifläche %s" % (top, o["type"]))
        if k: summe[k] = round(summe.get(k, 0) + o["m2"], 2)
    for k in ("loggia", "balcony", "terrace", "roof", "garden"):
        ok(abs(summe.get(k, 0) - (L[k] or 0)) < 0.005, "Top %s %s Finder %s, Liste %s" % (top, k, summe.get(k, 0), L[k]))

    # Plan-PDF
    base = os.path.join(ROOT, "assets/plaene/zimmermannplatz-6-" + u["plan"])
    ok(os.path.exists(base + ".pdf"), "Top %s Plan-PDF fehlt" % top)
    ok(os.path.exists(base + ".jpg"), "Top %s Plan-Bild fehlt" % top)
    if not os.path.exists(base + ".pdf"): continue
    t = re.sub(r"\s+", " ", PdfReader(base + ".pdf").pages[0].extract_text() or "")
    kenn = {0: "EG", 1: "1ST", 2: "2ST", 3: "3ST", 4: "1DG", 5: "2DG"}[u["level"]] + "/" + top.replace("+", "-")
    ok(kenn in t, "Top %s Plan-Kennung %s nicht im Plan" % (top, kenn))
    ok((de(u["area"]) + "m2") in t.replace(" m2", "m2"), "Top %s Fläche %s nicht im Plan" % (top, de(u["area"])))
    ok((de(u["storage"]) + "m2") in t.replace(" m2", "m2"), "Top %s Kellerabteil %s nicht im Plan" % (top, de(u["storage"])))
    for o in u["out"]:
        ok((de(o["m2"]) + " m2") in t or (de(o["m2"]) + "m2") in t, "Top %s %s %s nicht im Plan" % (top, o["type"], de(o["m2"])))
        label = {"Terrasse": r"Terr(?:asse|\.)"}.get(o["type"], o["type"])
        ok(re.search(label, t) is not None, "Top %s Bezeichnung %s nicht im Plan" % (top, o["type"]))
    h = u["height"].split(",")[0].replace("bis ", "").replace(" cm", "").replace(" ", "")
    ok(h.replace("/", " / ") in t or h in t.replace(" ", "") or ("0 - " + h) in t, "Top %s Raumhöhe %s nicht im Plan" % (top, u["height"]))

ok(os.path.exists(os.path.join(ROOT, "assets/plaene/zimmermannplatz-6-verkaufsplaene-gesamt.pdf")), "Gesamt-PDF fehlt")
# Flaechen-Tabelle der Justimmo-Zuordnung (api/_lib/zuordnung.js) muss mit dem Finder uebereinstimmen
api = open(os.path.join(ROOT, "api/_lib/zuordnung.js"), encoding="utf-8").read()
fl = dict((k, float(v)) for k, v in re.findall(r'"([\d+]+)":\s*([\d.]+)', api[api.find("const FLAECHE"):api.find("const STATUS")]))
ok(set(fl) == set(units), "zuordnung.js FLAECHE: Einheiten weichen ab %s" % sorted(set(fl) ^ set(units)))
for top, u in units.items():
    ok(abs(fl.get(top, -1) - u["area"]) < 0.005, "zuordnung.js FLAECHE Top %s %s statt %s" % (top, fl.get(top), u["area"]))
print("Prüfungen: %d, Fehler: %d" % (checks, len(errors)))
for e in errors: print("  FEHLER", e)
sys.exit(1 if errors else 0)
