export type StaffPole =
  | "École de foot"
  | "Pré-formation"
  | "Formation"
  | "Club";

export type StaffRole =
  | "coach"
  | "adjoint"
  | "gardien"
  | "prepa-physique"
  | "dir-sportif"
  | "resp-pole"
  | "administratif"
  | "medical";

export type StaffAvailability = "ok" | "limited" | "off";

export type DashboardStaffMember = {
  id: string;
  fullName: string;
  role: StaffRole;
  pole: StaffPole;
  teamsLabel: string;
  phone?: string | null;
  email?: string | null;
  availability: StaffAvailability;
  availabilityHint: string;
  tags: string[];
  updatedAtLabel: string;
  note?: string;
};

export const staffPoles: StaffPole[] = [
  "École de foot",
  "Pré-formation",
  "Formation",
  "Club",
];

export const staffRoles: Array<{
  id: StaffRole | "all";
  label: string;
  note: string;
}> = [
  { id: "all", label: "Tous", note: "périmètre complet" },
  { id: "dir-sportif", label: "Direction sportive", note: "pilotage" },
  { id: "resp-pole", label: "Resp. pôle", note: "coordination" },
  { id: "coach", label: "Coach", note: "terrain" },
  { id: "adjoint", label: "Adjoint", note: "terrain" },
  { id: "gardien", label: "Spé. gardiens", note: "terrain" },
  { id: "prepa-physique", label: "Prépa physique", note: "terrain" },
  { id: "medical", label: "Médical", note: "suivi" },
  {
    id: "administratif",
    label: "Administratif",
    note: "licences / logistique",
  },
];

export const dashboardStaffMock: DashboardStaffMember[] = [
  {
    id: "stf-001",
    fullName: "Sébastien Morel",
    role: "dir-sportif",
    pole: "Club",
    teamsLabel: "Tous",
    phone: "+33 6 10 00 00 01",
    email: "seb.morel@example.com",
    availability: "ok",
    availabilityHint: "Disponible",
    tags: ["budget", "planning", "staff"],
    updatedAtLabel: "hier",
    note: "Point hebdo le lundi. Arbitre les priorités formations / déplacements.",
  },
  {
    id: "stf-002",
    fullName: "Aïcha Benali",
    role: "resp-pole",
    pole: "École de foot",
    teamsLabel: "U6 → U11",
    phone: "+33 6 10 00 00 02",
    email: "aicha.benali@example.com",
    availability: "limited",
    availabilityHint: "Réponses le soir",
    tags: ["école", "inscriptions", "relations parents"],
    updatedAtLabel: "aujourd’hui",
  },
  {
    id: "stf-003",
    fullName: "Karim Diallo",
    role: "coach",
    pole: "Pré-formation",
    teamsLabel: "U13 A",
    phone: "+33 6 10 00 00 03",
    email: null,
    availability: "ok",
    availabilityHint: "Disponible",
    tags: ["U13", "séances", "match"],
    updatedAtLabel: "aujourd’hui",
  },
  {
    id: "stf-004",
    fullName: "Julie Fournier",
    role: "prepa-physique",
    pole: "Formation",
    teamsLabel: "U16 → U18",
    phone: "+33 6 10 00 00 04",
    email: "julie.fournier@example.com",
    availability: "limited",
    availabilityHint: "Sur créneaux",
    tags: ["PPG", "prévention", "tests"],
    updatedAtLabel: "il y a 2 jours",
    note: "Préférer WhatsApp pour urgences blessures.",
  },
  {
    id: "stf-005",
    fullName: "Nicolas Leroux",
    role: "medical",
    pole: "Club",
    teamsLabel: "Tous",
    phone: "+33 6 10 00 00 05",
    email: "n.leroux@example.com",
    availability: "off",
    availabilityHint: "Indisponible",
    tags: ["blessures", "certificats"],
    updatedAtLabel: "il y a 3 jours",
  },
  {
    id: "stf-006",
    fullName: "Camille Rossi",
    role: "administratif",
    pole: "Club",
    teamsLabel: "Licences",
    phone: "+33 6 10 00 00 06",
    email: "camille.rossi@example.com",
    availability: "ok",
    availabilityHint: "Bureau (journée)",
    tags: ["licences", "paiements", "docs"],
    updatedAtLabel: "hier",
    note: "Centralise les justificatifs (photo, certificat médical).",
  },
];
