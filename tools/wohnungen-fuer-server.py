#!/usr/bin/env python3
"""Erzeugt api/_lib/wohnungen.js aus assets/js/units.js (Wohnungsdaten des Finders fuer den Server, z. B. fuer den Agency Hub).
Nach jeder Aenderung an units.js ausfuehren: python3 tools/wohnungen-fuer-server.py
tools/check-units.py prueft, dass beide Dateien uebereinstimmen."""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, "assets/js/units.js"), encoding="utf-8").read()
arr = src[src.find("window.Z6_UNITS = [") + len("window.Z6_UNITS = "):]
arr = arr[:arr.find("];") + 1]
arr = re.sub(r"(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:", r'\1 "\2":', arr)
units = json.loads(arr)
keep = ("top", "levelName", "rooms", "area", "out", "storage", "height", "kind", "zone", "plan")
data = {u["top"]: {k: u.get(k) for k in keep} for u in units}
out = ("/* Erzeugt von tools/wohnungen-fuer-server.py aus assets/js/units.js, nicht von Hand aendern.\n"
       "   Wohnungsdaten des Finders fuer den Server (Uebergabe an den Agency Hub). */\n"
       "module.exports = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
open(os.path.join(ROOT, "api/_lib/wohnungen.js"), "w", encoding="utf-8").write(out)
print("api/_lib/wohnungen.js: %d Einheiten" % len(data))
