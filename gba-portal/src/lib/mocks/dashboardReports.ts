export type ReportPeriod = "7d" | "30d" | "season";
export type ReportPole = "École de foot" | "Pré-formation" | "Formation";

export type DashboardReportKpi = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  hint: string;
  trend: "up" | "down" | "flat";
};

export type DashboardReportAlert = {
  id: string;
  title: string;
  desc: string;
  severity: "info" | "warning" | "critical";
  owner: string;
  updatedAtLabel: string;
};

export type DashboardReportBreakdownRow = {
  id: string;
  label: string;
  value: number;
  total: number;
  note?: string;
};

export type DashboardReportPack = {
  period: ReportPeriod;
  pole: ReportPole | "all";
  updatedAtLabel: string;
  kpis: DashboardReportKpi[];
  alerts: DashboardReportAlert[];
  licenceBreakdown: DashboardReportBreakdownRow[];
  equipmentBreakdown: DashboardReportBreakdownRow[];
  attendanceBreakdown: DashboardReportBreakdownRow[];
};

export const reportPeriods: Array<{
  id: ReportPeriod;
  label: string;
  note: string;
}> = [
  { id: "7d", label: "7 jours", note: "opérationnel" },
  { id: "30d", label: "30 jours", note: "tendance" },
  { id: "season", label: "Saison", note: "macro" },
];

export const reportPoles: Array<ReportPole> = [
  "École de foot",
  "Pré-formation",
  "Formation",
];

export const dashboardReportsMock: DashboardReportPack[] = [
  {
    period: "7d",
    pole: "all",
    updatedAtLabel: "ce matin",
    kpis: [
      {
        id: "attendance",
        label: "Taux de présence",
        value: 87,
        unit: "%",
        hint: "objectif 90%",
        trend: "up",
      },
      {
        id: "licences",
        label: "Licences à encaisser",
        value: 14,
        hint: "3 en retard",
        trend: "flat",
      },
      {
        id: "equipment",
        label: "Équipements incomplets",
        value: 9,
        hint: "tailles manquantes ou non remis",
        trend: "down",
      },
      {
        id: "sessions",
        label: "Séances planifiées",
        value: 18,
        hint: "planning semaine",
        trend: "up",
      },
    ],
    alerts: [
      {
        id: "a1",
        title: "Relancer les paiements U17",
        desc: "3 licences en retard (pré-formation).",
        severity: "critical",
        owner: "Trésorerie",
        updatedAtLabel: "il y a 2j",
      },
      {
        id: "a2",
        title: "Tailles manquantes (dotations)",
        desc: "Renseigner 4 tailles avant commande (école de foot).",
        severity: "warning",
        owner: "Intendance",
        updatedAtLabel: "hier",
      },
      {
        id: "a3",
        title: "Séances sans staff confirmé",
        desc: "2 créneaux marqués “staff à confirmer”.",
        severity: "info",
        owner: "Coordination",
        updatedAtLabel: "ce matin",
      },
    ],
    licenceBreakdown: [
      {
        id: "l1",
        label: "École de foot",
        value: 5,
        total: 42,
        note: "1 retard",
      },
      {
        id: "l2",
        label: "Pré-formation",
        value: 7,
        total: 36,
        note: "2 retards",
      },
      { id: "l3", label: "Formation", value: 2, total: 28, note: "0 retard" },
    ],
    equipmentBreakdown: [
      {
        id: "e1",
        label: "Tailles manquantes",
        value: 4,
        total: 64,
        note: "avant commande",
      },
      {
        id: "e2",
        label: "Dotation non remise",
        value: 6,
        total: 64,
        note: "maillots / shorts",
      },
      {
        id: "e3",
        label: "Chaussettes à échanger",
        value: 2,
        total: 64,
        note: "taille",
      },
    ],
    attendanceBreakdown: [
      { id: "p1", label: "Présents", value: 96, total: 110 },
      { id: "p2", label: "Retards", value: 7, total: 110 },
      { id: "p3", label: "Justifiés", value: 3, total: 110 },
      { id: "p4", label: "Absents", value: 4, total: 110 },
    ],
  },
  {
    period: "30d",
    pole: "all",
    updatedAtLabel: "cette semaine",
    kpis: [
      {
        id: "attendance",
        label: "Taux de présence",
        value: 84,
        unit: "%",
        hint: "variations selon période examens",
        trend: "down",
      },
      {
        id: "licences",
        label: "Licences à encaisser",
        value: 21,
        hint: "5 en retard",
        trend: "up",
      },
      {
        id: "equipment",
        label: "Équipements incomplets",
        value: 11,
        hint: "principalement pré-formation",
        trend: "flat",
      },
      {
        id: "sessions",
        label: "Séances planifiées",
        value: 72,
        hint: "incl. amicaux",
        trend: "up",
      },
    ],
    alerts: [
      {
        id: "a4",
        title: "Rattraper les licences (période)",
        desc: "Relance groupée prévue (mail/SMS).",
        severity: "warning",
        owner: "Trésorerie",
        updatedAtLabel: "il y a 4j",
      },
    ],
    licenceBreakdown: [
      {
        id: "l1",
        label: "École de foot",
        value: 8,
        total: 42,
        note: "2 retards",
      },
      {
        id: "l2",
        label: "Pré-formation",
        value: 10,
        total: 36,
        note: "3 retards",
      },
      { id: "l3", label: "Formation", value: 3, total: 28, note: "0 retard" },
    ],
    equipmentBreakdown: [
      {
        id: "e1",
        label: "Tailles manquantes",
        value: 6,
        total: 64,
        note: "+2 nouveaux",
      },
      { id: "e2", label: "Dotation non remise", value: 7, total: 64, note: "" },
      {
        id: "e3",
        label: "Chaussettes à échanger",
        value: 4,
        total: 64,
        note: "",
      },
    ],
    attendanceBreakdown: [
      { id: "p1", label: "Présents", value: 376, total: 452 },
      { id: "p2", label: "Retards", value: 34, total: 452 },
      { id: "p3", label: "Justifiés", value: 19, total: 452 },
      { id: "p4", label: "Absents", value: 23, total: 452 },
    ],
  },
];
