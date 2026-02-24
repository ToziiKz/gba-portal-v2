export type PlanningPole = "École de foot" | "Pré-formation" | "Formation";

export type PlanningDay = "Lun" | "Mar" | "Mer" | "Jeu" | "Ven" | "Sam" | "Dim";

export type PlanningSession = {
  id: string;
  pole: PlanningPole;
  team: string;
  day: PlanningDay;
  start: string; // HH:MM
  end: string; // HH:MM
  location: string;
  staff: string[];
  note?: string;
  updatedAtLabel: string;
};

export const planningPoles: PlanningPole[] = [
  "École de foot",
  "Pré-formation",
  "Formation",
];

export const planningDays: PlanningDay[] = [
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
  "Dim",
];

export const planningSessionsMock: PlanningSession[] = [
  {
    id: "sess-ecole-u9-mer-1",
    pole: "École de foot",
    team: "U9",
    day: "Mer",
    start: "14:00",
    end: "15:30",
    location: "Terrain Annexe",
    staff: ["K. Durand"],
    note: "Ateliers technique + jeu réduit",
    updatedAtLabel: "hier",
  },
  {
    id: "sess-ecole-u11-sam-1",
    pole: "École de foot",
    team: "U11",
    day: "Sam",
    start: "10:00",
    end: "11:30",
    location: "Terrain Principal",
    staff: ["A. Leroy", "M. Petit"],
    updatedAtLabel: "aujourd’hui",
  },
  {
    id: "sess-prefo-u13-mar-1",
    pole: "Pré-formation",
    team: "U13",
    day: "Mar",
    start: "18:00",
    end: "19:30",
    location: "Terrain Synthétique",
    staff: ["S. Martin"],
    updatedAtLabel: "il y a 2j",
  },
  {
    id: "sess-prefo-u15-jeu-1",
    pole: "Pré-formation",
    team: "U15",
    day: "Jeu",
    start: "18:30",
    end: "20:00",
    location: "Terrain Synthétique",
    staff: ["S. Martin", "R. Moreau"],
    note: "Séance intensité / transitions",
    updatedAtLabel: "il y a 3j",
  },
  {
    id: "sess-form-u17-lun-1",
    pole: "Formation",
    team: "U17",
    day: "Lun",
    start: "19:00",
    end: "20:30",
    location: "Terrain Principal",
    staff: ["N. Bernard"],
    updatedAtLabel: "aujourd’hui",
  },
  {
    id: "sess-form-u18-ven-1",
    pole: "Formation",
    team: "U18",
    day: "Ven",
    start: "19:30",
    end: "21:00",
    location: "Terrain Principal",
    staff: ["N. Bernard", "C. Gomez"],
    note: "Mise en place match",
    updatedAtLabel: "hier",
  },
  {
    id: "sess-match-u17-dim-1",
    pole: "Formation",
    team: "U17",
    day: "Dim",
    start: "15:00",
    end: "16:45",
    location: "Extérieur",
    staff: ["N. Bernard"],
    note: "Match championnat (mock)",
    updatedAtLabel: "aujourd’hui",
  },
];
