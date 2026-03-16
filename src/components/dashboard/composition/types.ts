export type CompositionPlayer = {
  id: string;
  name: string;
  teamId: string | null;
  teamName: string;
  category: string;
  numberLabel: string;
};

export type PositionedPlayer = {
  player: CompositionPlayer;
  shirtNumber: string;
};

export type FormationSlot = {
  id: string;
  label: string;
  shortLabel: string;
  top: string;
  left: string;
};

export type SquadFormat = "11" | "8" | "5" | "4";

export type FormationPreset = {
  id: string;
  label: string;
  format: SquadFormat;
  slots: FormationSlot[];
};

export const FORMATION_PRESETS: FormationPreset[] = [
  {
    id: "4-3-3",
    label: "4-3-3",
    format: "11",
    slots: [
      { id: "gk", label: "Gardien", shortLabel: "GB", top: "88%", left: "50%" },
      {
        id: "lb",
        label: "Défenseur gauche",
        shortLabel: "DG",
        top: "72%",
        left: "18%",
      },
      {
        id: "lcb",
        label: "Défenseur central gauche",
        shortLabel: "DC",
        top: "74%",
        left: "38%",
      },
      {
        id: "rcb",
        label: "Défenseur central droit",
        shortLabel: "DC",
        top: "74%",
        left: "62%",
      },
      {
        id: "rb",
        label: "Défenseur droit",
        shortLabel: "DD",
        top: "72%",
        left: "82%",
      },
      {
        id: "lcm",
        label: "Milieu gauche",
        shortLabel: "MG",
        top: "52%",
        left: "28%",
      },
      {
        id: "cm",
        label: "Milieu axial",
        shortLabel: "MC",
        top: "48%",
        left: "50%",
      },
      {
        id: "rcm",
        label: "Milieu droit",
        shortLabel: "MD",
        top: "52%",
        left: "72%",
      },
      {
        id: "lw",
        label: "Attaquant gauche",
        shortLabel: "AG",
        top: "26%",
        left: "24%",
      },
      {
        id: "st",
        label: "Avant-centre",
        shortLabel: "BU",
        top: "18%",
        left: "50%",
      },
      {
        id: "rw",
        label: "Attaquant droit",
        shortLabel: "AD",
        top: "26%",
        left: "76%",
      },
    ],
  },
  {
    id: "4-4-2",
    label: "4-4-2",
    format: "11",
    slots: [
      { id: "gk", label: "Gardien", shortLabel: "GB", top: "88%", left: "50%" },
      {
        id: "lb",
        label: "Défenseur gauche",
        shortLabel: "DG",
        top: "72%",
        left: "18%",
      },
      {
        id: "lcb",
        label: "Défenseur central gauche",
        shortLabel: "DC",
        top: "74%",
        left: "38%",
      },
      {
        id: "rcb",
        label: "Défenseur central droit",
        shortLabel: "DC",
        top: "74%",
        left: "62%",
      },
      {
        id: "rb",
        label: "Défenseur droit",
        shortLabel: "DD",
        top: "72%",
        left: "82%",
      },
      {
        id: "lm",
        label: "Milieu gauche",
        shortLabel: "MG",
        top: "49%",
        left: "18%",
      },
      {
        id: "lcm",
        label: "Milieu axial gauche",
        shortLabel: "MC",
        top: "50%",
        left: "39%",
      },
      {
        id: "rcm",
        label: "Milieu axial droit",
        shortLabel: "MC",
        top: "50%",
        left: "61%",
      },
      {
        id: "rm",
        label: "Milieu droit",
        shortLabel: "MD",
        top: "49%",
        left: "82%",
      },
      {
        id: "ls",
        label: "Attaquant gauche",
        shortLabel: "AT",
        top: "25%",
        left: "38%",
      },
      {
        id: "rs",
        label: "Attaquant droit",
        shortLabel: "AT",
        top: "25%",
        left: "62%",
      },
    ],
  },
  {
    id: "3-5-2",
    label: "3-5-2",
    format: "11",
    slots: [
      { id: "gk", label: "Gardien", shortLabel: "GB", top: "88%", left: "50%" },
      {
        id: "lcb",
        label: "Défenseur gauche",
        shortLabel: "DC",
        top: "72%",
        left: "28%",
      },
      {
        id: "cb",
        label: "Défenseur central",
        shortLabel: "DC",
        top: "74%",
        left: "50%",
      },
      {
        id: "rcb",
        label: "Défenseur droit",
        shortLabel: "DC",
        top: "72%",
        left: "72%",
      },
      {
        id: "lwb",
        label: "Piston gauche",
        shortLabel: "PG",
        top: "52%",
        left: "14%",
      },
      {
        id: "lcm",
        label: "Milieu axial gauche",
        shortLabel: "MC",
        top: "52%",
        left: "35%",
      },
      {
        id: "cm",
        label: "Milieu axial",
        shortLabel: "MC",
        top: "48%",
        left: "50%",
      },
      {
        id: "rcm",
        label: "Milieu axial droit",
        shortLabel: "MC",
        top: "52%",
        left: "65%",
      },
      {
        id: "rwb",
        label: "Piston droit",
        shortLabel: "PD",
        top: "52%",
        left: "86%",
      },
      {
        id: "ls",
        label: "Attaquant gauche",
        shortLabel: "AT",
        top: "24%",
        left: "38%",
      },
      {
        id: "rs",
        label: "Attaquant droit",
        shortLabel: "AT",
        top: "24%",
        left: "62%",
      },
    ],
  },
  {
    id: "foot-8-losange",
    label: "Foot à 8 · Losange",
    format: "8",
    slots: [
      { id: "gk", label: "Gardien", shortLabel: "GB", top: "84%", left: "50%" },
      {
        id: "ld",
        label: "Défenseur gauche",
        shortLabel: "DG",
        top: "66%",
        left: "26%",
      },
      {
        id: "cd",
        label: "Défenseur axial",
        shortLabel: "DC",
        top: "68%",
        left: "50%",
      },
      {
        id: "rd",
        label: "Défenseur droit",
        shortLabel: "DD",
        top: "66%",
        left: "74%",
      },
      {
        id: "dm",
        label: "Milieu défensif",
        shortLabel: "MDF",
        top: "49%",
        left: "50%",
      },
      {
        id: "lm",
        label: "Milieu gauche",
        shortLabel: "MG",
        top: "35%",
        left: "28%",
      },
      {
        id: "rm",
        label: "Milieu droit",
        shortLabel: "MD",
        top: "35%",
        left: "72%",
      },
      {
        id: "st",
        label: "Attaquant",
        shortLabel: "BU",
        top: "20%",
        left: "50%",
      },
    ],
  },
  {
    id: "foot-5-1-2-1",
    label: "Foot à 5 · 1-2-1",
    format: "5",
    slots: [
      { id: "gk", label: "Gardien", shortLabel: "GB", top: "82%", left: "50%" },
      {
        id: "def",
        label: "Défenseur",
        shortLabel: "DEF",
        top: "58%",
        left: "50%",
      },
      {
        id: "mg",
        label: "Côté gauche",
        shortLabel: "CG",
        top: "38%",
        left: "28%",
      },
      {
        id: "md",
        label: "Côté droit",
        shortLabel: "CD",
        top: "38%",
        left: "72%",
      },
      {
        id: "st",
        label: "Attaquant",
        shortLabel: "BU",
        top: "20%",
        left: "50%",
      },
    ],
  },
  {
    id: "foot-4-gk-losange",
    label: "Foot à 4 · Gardien + 3",
    format: "4",
    slots: [
      { id: "gk", label: "Gardien", shortLabel: "GB", top: "82%", left: "50%" },
      {
        id: "def",
        label: "Défenseur",
        shortLabel: "DEF",
        top: "56%",
        left: "50%",
      },
      {
        id: "ag",
        label: "Attaquant gauche",
        shortLabel: "AG",
        top: "28%",
        left: "34%",
      },
      {
        id: "ad",
        label: "Attaquant droit",
        shortLabel: "AD",
        top: "28%",
        left: "66%",
      },
    ],
  },
];

export function detectSquadFormat(
  category: string | null | undefined,
): SquadFormat {
  const value = String(category ?? "")
    .toLowerCase()
    .replace(/\s+/g, "");

  if (value.includes("u6") || value.includes("u7") || value.includes("baby")) {
    return "4";
  }

  if (value.includes("u8") || value.includes("u9")) {
    return "5";
  }

  if (
    value.includes("u10") ||
    value.includes("u11") ||
    value.includes("u12") ||
    value.includes("u13")
  ) {
    return "8";
  }

  return "11";
}

export function getFormationsForFormat(format: SquadFormat) {
  return FORMATION_PRESETS.filter((preset) => preset.format === format);
}
