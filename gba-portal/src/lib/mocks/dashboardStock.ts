export type StockLocation = "Clubhouse" | "Local équipement" | "Terrain";
export type StockPole =
  | "École de foot"
  | "Pré-formation"
  | "Formation"
  | "Club";

export type StockItemKind =
  | "maillot"
  | "short"
  | "chaussettes"
  | "ballon"
  | "plots"
  | "chandail"
  | "gourde"
  | "trousse";

export type StockRow = {
  id: string;
  label: string;
  kind: StockItemKind;
  pole: StockPole;
  location: StockLocation;
  sizeLabel?: string;
  sku?: string;
  qty: number;
  minQty: number;
  updatedAtLabel: string;
  note?: string;
};

export const stockPoles: StockPole[] = [
  "Club",
  "École de foot",
  "Pré-formation",
  "Formation",
];

export const stockLocations: StockLocation[] = [
  "Clubhouse",
  "Local équipement",
  "Terrain",
];

export const stockKinds: Array<{
  id: StockItemKind | "all";
  label: string;
  note: string;
}> = [
  { id: "all", label: "Tout", note: "inventaire" },
  { id: "maillot", label: "Maillots", note: "jeux/entraînement" },
  { id: "short", label: "Shorts", note: "dotation" },
  { id: "chaussettes", label: "Chaussettes", note: "dotation" },
  { id: "ballon", label: "Ballons", note: "entraînement" },
  { id: "plots", label: "Plots", note: "atelier" },
  { id: "chandail", label: "Chandails", note: "hiver" },
  { id: "gourde", label: "Gourdes", note: "déplacements" },
  { id: "trousse", label: "Trousse", note: "soins" },
];

export const dashboardStockMock: StockRow[] = [
  {
    id: "stk-001",
    label: "Maillot entraînement Nike (Junior)",
    kind: "maillot",
    pole: "École de foot",
    location: "Local équipement",
    sizeLabel: "6-8 ans",
    sku: "GBA-NK-TR-JR-06",
    qty: 18,
    minQty: 12,
    updatedAtLabel: "hier",
    note: "Réassort prévu avant vacances.",
  },
  {
    id: "stk-002",
    label: "Maillot match (Senior)",
    kind: "maillot",
    pole: "Club",
    location: "Clubhouse",
    sizeLabel: "L",
    sku: "GBA-MT-SR-L",
    qty: 4,
    minQty: 8,
    updatedAtLabel: "il y a 3j",
    note: "Stock faible (tailles L/XL).",
  },
  {
    id: "stk-003",
    label: "Short entraînement (Junior)",
    kind: "short",
    pole: "Pré-formation",
    location: "Local équipement",
    sizeLabel: "12-14 ans",
    sku: "GBA-SH-JR-12",
    qty: 9,
    minQty: 10,
    updatedAtLabel: "aujourd’hui",
  },
  {
    id: "stk-004",
    label: "Chaussettes club",
    kind: "chaussettes",
    pole: "Club",
    location: "Clubhouse",
    sizeLabel: "39-42",
    sku: "GBA-SOCK-39",
    qty: 22,
    minQty: 15,
    updatedAtLabel: "il y a 1 sem.",
  },
  {
    id: "stk-005",
    label: "Ballon taille 4",
    kind: "ballon",
    pole: "École de foot",
    location: "Terrain",
    sku: "BALL-4-TRAIN",
    qty: 7,
    minQty: 12,
    updatedAtLabel: "aujourd’hui",
    note: "Plusieurs ballons à regonfler.",
  },
  {
    id: "stk-006",
    label: "Ballon taille 5",
    kind: "ballon",
    pole: "Formation",
    location: "Terrain",
    sku: "BALL-5-TRAIN",
    qty: 14,
    minQty: 10,
    updatedAtLabel: "hier",
  },
  {
    id: "stk-007",
    label: "Plots (x50)",
    kind: "plots",
    pole: "Club",
    location: "Terrain",
    sku: "PLOT-SET-50",
    qty: 3,
    minQty: 2,
    updatedAtLabel: "il y a 2 sem.",
  },
  {
    id: "stk-008",
    label: "Trousse premiers secours",
    kind: "trousse",
    pole: "Club",
    location: "Clubhouse",
    sku: "MED-KIT",
    qty: 1,
    minQty: 1,
    updatedAtLabel: "il y a 1 mois",
    note: "À re-checker: compresses, sprays froid.",
  },
];
