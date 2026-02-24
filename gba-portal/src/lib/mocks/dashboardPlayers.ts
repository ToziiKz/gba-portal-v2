export type PlayerPole = "École de foot" | "Pré-formation" | "Formation";

export type PlayerLicenceStatus = "draft" | "pending" | "validated";
export type PlayerEquipmentStatus = "missing" | "partial" | "complete";

export type DashboardPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  category: string;
  pole: PlayerPole;
  team: string;
  position: "G" | "D" | "M" | "A";
  phone?: string;
  guardianName?: string;
  medicalStatusLabel: string;
  licenceStatus: PlayerLicenceStatus;
  equipmentStatus: PlayerEquipmentStatus;
  updatedAtLabel: string;
};

export const dashboardPlayerPoles: PlayerPole[] = [
  "École de foot",
  "Pré-formation",
  "Formation",
];

export const dashboardPlayersMock: DashboardPlayer[] = [
  {
    id: "pl-u9-004",
    firstName: "Mehdi",
    lastName: "Ait Ali",
    birthYear: 2017,
    category: "U9",
    pole: "École de foot",
    team: "GBA U9",
    position: "M",
    guardianName: "Rachid Ait Ali",
    phone: "06 12 34 56 78",
    medicalStatusLabel: "certificat OK",
    licenceStatus: "pending",
    equipmentStatus: "partial",
    updatedAtLabel: "aujourd’hui",
  },
  {
    id: "pl-u11-011",
    firstName: "Sofia",
    lastName: "Carpentier",
    birthYear: 2015,
    category: "U11",
    pole: "École de foot",
    team: "GBA U11 A",
    position: "A",
    guardianName: "Nina Carpentier",
    phone: "06 98 76 54 32",
    medicalStatusLabel: "à renouveler",
    licenceStatus: "draft",
    equipmentStatus: "missing",
    updatedAtLabel: "hier",
  },
  {
    id: "pl-u13-002",
    firstName: "Amadou",
    lastName: "Diallo",
    birthYear: 2013,
    category: "U13",
    pole: "Pré-formation",
    team: "GBA U13",
    position: "D",
    phone: "07 55 00 11 22",
    medicalStatusLabel: "OK",
    licenceStatus: "validated",
    equipmentStatus: "complete",
    updatedAtLabel: "il y a 2j",
  },
  {
    id: "pl-u15-018",
    firstName: "Lucas",
    lastName: "Fernandez",
    birthYear: 2011,
    category: "U15",
    pole: "Pré-formation",
    team: "GBA U15",
    position: "M",
    phone: "06 22 11 33 44",
    medicalStatusLabel: "OK",
    licenceStatus: "pending",
    equipmentStatus: "partial",
    updatedAtLabel: "il y a 3j",
  },
  {
    id: "pl-u17-006",
    firstName: "Nolan",
    lastName: "Girard",
    birthYear: 2009,
    category: "U17",
    pole: "Formation",
    team: "GBA U17",
    position: "G",
    phone: "06 44 33 22 11",
    medicalStatusLabel: "OK",
    licenceStatus: "draft",
    equipmentStatus: "missing",
    updatedAtLabel: "il y a 4j",
  },
  {
    id: "pl-u17-013",
    firstName: "Chi",
    lastName: "Nguyen",
    birthYear: 2009,
    category: "U17",
    pole: "Formation",
    team: "GBA U17",
    position: "A",
    phone: "07 12 12 12 12",
    medicalStatusLabel: "certificat OK",
    licenceStatus: "pending",
    equipmentStatus: "partial",
    updatedAtLabel: "hier",
  },
];
