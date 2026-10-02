#!/usr/bin/env python3
"""Lagekarte: Illustrator-Datei (PDF-kompatibel) in eine animierbare SVG uebersetzen.

Aufruf:  python3 tools/ai2svg.py ~/Downloads/map-zimmermannplatz-6.ai assets/img/lage-karte.svg

Gruppen in der SVG (fuer die Kartenfahrt in main.js):
  .lmap__base    Strassen, Haeuserbloecke, Gruenflaechen, Grundstueck
  .lmap__radius  gestrichelter Radius
  .lmap__notes   Wegezeit-Hinweise (Auto zur A2, Oeffis und Rad in den 1. Bezirk)
  .lmap__pin     Pins 1 bis 6, je mit data-pin und data-tip (Spitze in Kartenkoordinaten)
  .lmap__home    Z6-Pin mit data-tip
Benoetigt nur pypdf. Clip-Pfade werden ignoriert, weil sie in dieser Datei der Zeichenflaeche entsprechen.
"""
import sys, math, json
from pypdf import PdfReader
from pypdf.generic import ContentStream

SRC, OUT = sys.argv[1], sys.argv[2]
r = PdfReader(SRC); page = r.pages[0]
W, H = float(page.mediabox[2]), float(page.mediabox[3])

def hexcol(c):
    return "#%02x%02x%02x" % tuple(max(0, min(255, round(float(v) * 255))) for v in c)
TERRA, OLIVE, IVORY, GREIGE, BRONZE = "#b86a55", "#45442d", "#e6e5db", "#c7beb1", "#8e8170"

def mul(a, b):  # PDF-Matrizen [a b c d e f]
    return [a[0]*b[0]+a[1]*b[2], a[0]*b[1]+a[1]*b[3], a[2]*b[0]+a[3]*b[2], a[2]*b[1]+a[3]*b[3],
            a[4]*b[0]+a[5]*b[2]+b[4], a[4]*b[1]+a[5]*b[3]+b[5]]
def tp(m, x, y):
    X = m[0]*x + m[2]*y + m[4]; Y = m[1]*x + m[3]*y + m[5]
    return X, H - Y
def f(v): return ("%.1f" % v).rstrip("0").rstrip(".")

st = {"ctm": [1,0,0,1,0,0], "fill": "#000000", "stroke": "#000000", "lw": 1.0, "cap": 0, "join": 0, "dash": None}
stack = []; path = []; cur = (0, 0); start = (0, 0); bbox = [1e9, 1e9, -1e9, -1e9]
elements = []
def addpt(x, y):
    bbox[0] = min(bbox[0], x); bbox[1] = min(bbox[1], y); bbox[2] = max(bbox[2], x); bbox[3] = max(bbox[3], y)

def emit(fill, stroke):
    global path, bbox
    if not path: return
    d = " ".join(path)
    sc = math.sqrt(abs(st["ctm"][0]*st["ctm"][3] - st["ctm"][1]*st["ctm"][2])) or 1
    el = {"d": d, "fill": st["fill"] if fill else "none", "stroke": st["stroke"] if stroke else "none",
          "lw": st["lw"]*sc, "cap": st["cap"], "join": st["join"], "dash": st["dash"], "bbox": list(bbox)}
    elements.append(el); path = []; bbox = [1e9, 1e9, -1e9, -1e9]

ops = ContentStream(page.get_contents(), r).operations
for args, op in ops:
    op = op.decode() if isinstance(op, bytes) else op
    a = [float(x) for x in args if isinstance(x, (int, float)) or hasattr(x, "__float__")] if op not in ("d",) else args
    m = st["ctm"]
    if op == "q": stack.append(dict(st, ctm=list(st["ctm"])))
    elif op == "Q": st = stack.pop() if stack else st
    elif op == "cm": st["ctm"] = mul(a, st["ctm"])
    elif op == "w": st["lw"] = a[0]
    elif op == "J": st["cap"] = int(a[0])
    elif op == "j": st["join"] = int(a[0])
    elif op == "d":
        arr = [float(x) for x in args[0]]
        on = [x for x in arr if x > 0]
        st["dash"] = (on[0], on[0]) if on else None
    elif op == "rg": st["fill"] = hexcol(a)
    elif op == "RG": st["stroke"] = hexcol(a)
    elif op == "g": st["fill"] = hexcol([a[0]]*3)
    elif op == "G": st["stroke"] = hexcol([a[0]]*3)
    elif op == "m":
        x, y = tp(m, a[0], a[1]); path.append("M%s %s" % (f(x), f(y))); addpt(x, y); cur = start = (a[0], a[1])
    elif op == "l":
        x, y = tp(m, a[0], a[1]); path.append("L%s %s" % (f(x), f(y))); addpt(x, y); cur = (a[0], a[1])
    elif op in ("c", "v", "y"):
        if op == "c": p1, p2, p3 = (a[0], a[1]), (a[2], a[3]), (a[4], a[5])
        elif op == "v": p1, p2, p3 = cur, (a[0], a[1]), (a[2], a[3])
        else: p1, p2, p3 = (a[0], a[1]), (a[2], a[3]), (a[2], a[3])
        pts = [tp(m, *p) for p in (p1, p2, p3)]
        for x, y in pts: addpt(x, y)
        path.append("C" + " ".join("%s %s" % (f(x), f(y)) for x, y in pts)); cur = p3
    elif op == "h": path.append("Z"); cur = start
    elif op == "re":
        x, y, w, hh = a
        if abs(x) < 0.5 and abs(w - W) < 1 and abs(abs(hh) - H) < 1:  # Zeichenflaechen-Clip
            continue
        pts = [tp(m, x, y), tp(m, x+w, y), tp(m, x+w, y+hh), tp(m, x, y+hh)]
        for p in pts: addpt(*p)
        path.append("M%s %sL%s %sL%s %sL%s %sZ" % tuple(f(v) for p in pts for v in p))
    elif op in ("S",): emit(False, True)
    elif op == "s": path.append("Z"); emit(False, True)
    elif op in ("f", "F", "f*"): emit(True, False)
    elif op in ("B", "B*"): emit(True, True)
    elif op in ("b", "b*"): path.append("Z"); emit(True, True)
    elif op == "n": path = []; bbox = [1e9, 1e9, -1e9, -1e9]

# Texte mit Position
texts = []
def vis(text, cm, tm, fd, fs):
    if text.strip():
        mm = mul(tm, cm); x, y = mm[4], H - mm[5]
        texts.append({"t": text.strip(), "x": x, "y": y, "size": abs(mm[0]) * (fs or 1),
                      "weight": 500 if "Md" in str((fd or {}).get("/BaseFont", "")) else 400})
page.extract_text(visitor_text=vis)

# Klassifizieren
pins = [e for e in elements if e["fill"] == TERRA]
radius = [e for e in elements if e["stroke"] == TERRA and e["dash"]]
icons = [e for e in elements if e["stroke"] == TERRA and not e["dash"] and e["fill"] == "none"]
ivory = [e for e in elements if e["fill"] == IVORY]
used = set(map(id, pins + radius + icons + ivory))
base = [e for e in elements if id(e) not in used]

def area(e): b = e["bbox"]; return (b[2]-b[0]) * (b[3]-b[1])
def center(b): return ((b[0]+b[2]) / 2, (b[1]+b[3]) / 2)
home = max(pins, key=area); pins = [p for p in pins if p is not home]
home_ivory = [e for e in ivory if home["bbox"][0]-5 <= center(e["bbox"])[0] <= home["bbox"][2]+5 and home["bbox"][1]-5 <= center(e["bbox"])[1] <= home["bbox"][3]+5]
base += [e for e in ivory if e not in home_ivory]

nums = [t for t in texts if t["t"].isdigit()]
notes_txt = [t for t in texts if not t["t"].isdigit()]
pin_groups = []
for p in pins:
    cx, cy = center(p["bbox"])
    n = min(nums, key=lambda t: (t["x"]-cx)**2 + (t["y"]-cy)**2) if nums else None
    pin_groups.append({"el": p, "num": n})
pin_groups.sort(key=lambda g: int(g["num"]["t"]) if g["num"] else 99)

# Hinweise: Icons und Texte nach Kartenhaelfte trennen (oben links A2, unten rechts 1. Bezirk)
def side(y): return "a2" if y < H / 2 else "city"
notes = {"a2": {"els": [], "txt": []}, "city": {"els": [], "txt": []}}
for e in icons: notes[side(center(e["bbox"])[1])]["els"].append(e)
for t in notes_txt: notes[side(t["y"])]["txt"].append(t)

def svg_el(e, extra=""):
    attrs = ['d="%s"' % e["d"], 'fill="%s"' % e["fill"]]
    if e["stroke"] != "none":
        attrs += ['stroke="%s"' % e["stroke"], 'stroke-width="%s"' % f(e["lw"])]
        if e["cap"]: attrs.append('stroke-linecap="%s"' % ["butt", "round", "square"][e["cap"]])
        if e["join"]: attrs.append('stroke-linejoin="%s"' % ["miter", "round", "bevel"][e["join"]])
        if e["dash"]: attrs.append('stroke-dasharray="%s %s"' % (f(e["dash"][0]), f(e["dash"][1])))
    return "<path %s%s/>" % (" ".join(attrs), extra)
def svg_text(t, fill):
    return '<text x="%s" y="%s" font-size="%s" font-weight="%d" fill="%s">%s</text>' % (f(t["x"]), f(t["y"]), f(t["size"]), t["weight"], fill, t["t"])

out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" class="lmap" role="img" aria-labelledby="lmapTitle">' % (f(W), f(H)),
       '<title id="lmapTitle">Lagekarte Zimmermannplatz 6 mit U6 Alser Straße, St. Anna Kinderspital, Wiener Privatklinik, AKH Wien, U6 Michelbeuern-AKH und Straßenbahn 43 und 44</title>',
       '<g class="lmap__base" fill="none" stroke-linecap="butt">'] + [svg_el(e) for e in base] + ['</g>']
out += ['<g class="lmap__radius">'] + [svg_el(e) for e in radius] + ['</g>']
out += ['<g class="lmap__notes">']
for k in ("a2", "city"):
    out += ['<g class="lmap__note" data-note="%s"><g class="lmap__notebody">' % k] + [svg_el(e) for e in notes[k]["els"]] + [svg_text(t, TERRA) for t in notes[k]["txt"]] + ['</g></g>']
out += ['</g>', '<g class="lmap__pins">']
for g in pin_groups:
    b = g["el"]["bbox"]; tip = ((b[0]+b[2]) / 2, b[3])
    n = g["num"]["t"] if g["num"] else "?"
    out += ['<g class="lmap__pin" data-pin="%s" data-tip="%s %s"><g class="lmap__pinbody">' % (n, f(tip[0]), f(tip[1])), svg_el(g["el"])]
    if g["num"]: out.append(svg_text(dict(g["num"]), IVORY))
    out.append('</g></g>')
hb = home["bbox"]; htip = ((hb[0]+hb[2]) / 2, hb[3])
out += ['</g>', '<g class="lmap__home" data-tip="%s %s">' % (f(htip[0]), f(htip[1])), svg_el(home)] + [svg_el(e) for e in home_ivory] + ['</g>', '</svg>']
svg = "\n".join(out)
open(OUT, "w").write(svg)

report = {"size_kb": round(len(svg.encode()) / 1024, 1), "base": len(base), "radius": len(radius), "icons": {k: len(v["els"]) for k, v in notes.items()},
          "notes_text": {k: [t["t"] for t in v["txt"]] for k, v in notes.items()}, "pins": [(g["num"]["t"] if g["num"] else None, [round(v) for v in g["el"]["bbox"]]) for g in pin_groups],
          "home_bbox": [round(v) for v in hb], "home_ivory": len(home_ivory), "colors": sorted({e["fill"] for e in elements} | {e["stroke"] for e in elements})}
report["ivory_in_base"] = [[round(v) for v in e["bbox"]] for e in base if e["fill"] == IVORY]
print(json.dumps(report, ensure_ascii=False))
