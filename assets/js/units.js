/* Wohnungsliste laut Topographie / Ausfuehrung zur Ausschreibung, VERS-02 vom 01.09.2026 (1600_TOPO_AUSSCHR_01.9.2026_VS2.pdf).
   Aufgenommen sind alle Wohnungen, die Teil der Sanierung bzw. des Dachausbaus sind.
   Nicht aufgenommen (unbefristet vermietet, nicht Teil der Sanierung): Tuer 3, 9, 13, 16, 18. Nicht aufgenommen: Tuer 1 Geschaeftslokal (125,37 m2).
   Flaechen sind Netto-Nutzflaechen in m2 exakt aus der Topographie. Zimmerzahl = Wohnkueche/Wohnzimmer plus Zimmer.
   Einlagerungsraum im Keller: laut Topographie jeder Wohnung zugeteilt, Zuteilung "zu klaeren". */
window.Z6_UNITS = [
  { top: "2",     level: 0, levelName: "Erdgeschoss", rooms: 4, area: 82.61,  out: [{ type: "Terrasse (erdberührt)", m2: 10.97 }], zone: "bestand", kind: "Bestand, Sanierung",
    program: "Vorraum, WC, Wohnküche, Schrankraum, Zimmer 1, Gang, Bad, Abstellraum, Zimmer 2, Zimmer 3", status: "frei" },
  { top: "4",     level: 1, levelName: "1. Stock", rooms: 2, area: 55.35,  out: [{ type: "Balkon", m2: 10.98 }], zone: "bestand", kind: "Bestand, Sanierung",
    program: "Vorraum, WC, Bad, Wohnküche, Zimmer", status: "frei" },
  { top: "5",     level: 1, levelName: "1. Stock", rooms: 2, area: 55.15,  out: [], zone: "bestand", kind: "Bestand, Sanierung",
    program: "Vorraum, Abstellraum, Bad, Wohnküche, Zimmer", status: "frei" },
  { top: "6",     level: 1, levelName: "1. Stock", rooms: 2, area: 51.78,  out: [], zone: "bestand", kind: "Bestand, Sanierung",
    program: "Vorraum, WC mit Vorraum, Abstellraum, Wohnküche, Schrankraum, WC/Dusche, Zimmer", status: "frei" },
  { top: "7",     level: 1, levelName: "1. Stock", rooms: 3, area: 86.70,  out: [], zone: "bestand", kind: "Bestand, Sanierung",
    program: "Vorraum, WC, Abstellraum, WC/Dusche, Wohnküche, Schrankraum, Zimmer 1, Bad, Zimmer 2", status: "frei" },
  { top: "8",     level: 1, levelName: "1. Stock", rooms: 3, area: 72.72,  out: [{ type: "Balkon", m2: 5.50 }], zone: "bestand", kind: "Bestand, Sanierung",
    program: "Vorraum, WC, Garderobe, Wohnküche, Gang, Abstellraum, Zimmer 1, Zimmer 2, Bad", status: "frei" },
  { top: "10+11", level: 2, levelName: "2. Stock", rooms: 3, area: 81.68,  out: [], zone: "bestand", kind: "Bestand, Sanierung und Zusammenlegung",
    program: "Vorzimmer, WC mit Vorraum, Wohnküche, Schrankraum, WC/Dusche, Zimmer 1, Zimmer 2, Schrankraum, Bad", status: "frei" },
  { top: "12",    level: 2, levelName: "2. Stock", rooms: 3, area: 110.08, out: [], zone: "bestand", kind: "Bestand, Sanierung",
    program: "Vorraum, WC, Abstellraum, Wirtschaftsraum, Wohnküche, Zimmer 1, Bad 1, Zimmer 2, Bad 2", status: "frei" },
  { top: "14+15", level: 3, levelName: "3. Stock", rooms: 4, area: 119.83, out: [{ type: "Balkon", m2: 10.98 }], zone: "bestand", kind: "Bestand, Sanierung und Zusammenlegung",
    program: "Vorraum, WC, Wohnküche, Gang, Bad, Zimmer, Zimmer, Abstellraum, Zimmer, WC/Dusche", status: "frei" },
  { top: "17",    level: 3, levelName: "3. Stock", rooms: 3, area: 109.74, out: [], zone: "bestand", kind: "Bestand, Sanierung",
    program: "Vorraum, WC, Abstellraum, Wirtschaftsraum, Wohnküche, Zimmer 1, Bad 1, Zimmer 2, Bad 2", status: "frei" },
  { top: "19",    level: 4, levelName: "1. Dachgeschoss", rooms: 2, area: 54.02,  out: [{ type: "Loggia", m2: 3.34 }], zone: "dach", kind: "Dachgeschoss, Neubau",
    program: "Vorraum, WC, Bad, Wohnküche, Zimmer", status: "frei" },
  { top: "20",    level: 4, levelName: "1. Dachgeschoss", rooms: 3, area: 86.10,  out: [{ type: "Terrasse", m2: 5.02 }], zone: "dach", kind: "Dachgeschoss, Neubau",
    program: "Vorraum, WC, Bad, Zimmer 1, Wohnküche, Zimmer 2, WC/Dusche", status: "frei" },
  { top: "21",    level: 4, levelName: "1. Dachgeschoss", rooms: 3, area: 83.65,  out: [{ type: "Loggia", m2: 3.37 }], zone: "dach", kind: "Dachgeschoss, Neubau",
    program: "Vorraum, Zimmer 1, WC, Bad, Wohnküche, Zimmer 2", status: "frei" },
  { top: "22",    level: 4, levelName: "1. Dachgeschoss", rooms: 4, area: 115.82, out: [{ type: "Loggia", m2: 3.35 }, { type: "Balkon", m2: 7.01 }], zone: "dach", kind: "Dachgeschoss, Neubau",
    program: "Vorraum, Garderobe, WC, Abstellraum, Wohnküche, Schrankraum, Bad, Zimmer 3, Gang, WC/Dusche, Zimmer 1, Zimmer 2", status: "frei" },
  { top: "23",    level: 5, levelName: "2. Dachgeschoss", rooms: 4, area: 160.10, out: [{ type: "Terrasse", m2: 16.89 }, { type: "Dachterrasse", m2: 76.75 }], zone: "dach", kind: "Dachgeschoss, Neubau",
    program: "Vorraum, Abstellraum, WC, Dusche, Wohnzimmer, Zimmer 1, Küche, Vorzimmer, Bad, WC, Schrankraum, Zimmer 2, Zimmer 3", status: "frei" },
  { top: "24",    level: 5, levelName: "2. Dachgeschoss", rooms: 4, area: 136.22, out: [{ type: "Terrasse", m2: 17.75 }, { type: "Dachterrasse", m2: 57.89 }], zone: "dach", kind: "Dachgeschoss, Neubau",
    program: "Vorraum, Abstellraum, WC/Dusche, Bad, Wohnküche, Zimmer 1, Zimmer 2, Zimmer 3", status: "frei" }
];
