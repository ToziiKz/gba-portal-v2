export type LicencePaymentStatus = "unpaid" | "partial" | "paid";

export type PaymentMethod = "CB" | "Espèces" | "Virement" | "Chèque";

export type LicenceRow = {
  id: string;
  playerName: string;
  team: string;
  category: string;
  pole: "École de foot" | "Pré-formation" | "Formation";
  status: LicencePaymentStatus;
  amountTotalEur: number;
  amountPaidEur: number;
  dueDateLabel: string;
  isOverdue: boolean;
  updatedAtLabel: string;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  lastPaymentMethod: PaymentMethod | null;
};

export const paymentMethods: PaymentMethod[] = [
  "CB",
  "Espèces",
  "Virement",
  "Chèque",
];

export const licenceRowsMock: LicenceRow[] = [
  {
    id: "lic-u9-001",
    playerName: "M. Ait Ali",
    team: "GBA U9",
    category: "U9",
    pole: "École de foot",
    status: "unpaid",
    amountTotalEur: 160,
    amountPaidEur: 0,
    dueDateLabel: "15 fév.",
    isOverdue: false,
    updatedAtLabel: "aujourd’hui",
    contactName: "Karim Ait Ali",
    contactEmail: "karim.aitali@example.com",
    contactPhone: "+33 6 12 34 56 78",
    lastPaymentMethod: null,
  },
  {
    id: "lic-u11-014",
    playerName: "S. Carpentier",
    team: "GBA U11 A",
    category: "U11",
    pole: "École de foot",
    status: "partial",
    amountTotalEur: 170,
    amountPaidEur: 50,
    dueDateLabel: "10 fév.",
    isOverdue: true,
    updatedAtLabel: "hier",
    contactName: "Lucie Carpentier",
    contactEmail: "lucie.carpentier@example.com",
    contactPhone: "+33 7 88 90 12 34",
    lastPaymentMethod: "Espèces",
  },
  {
    id: "lic-u13-008",
    playerName: "A. Diallo",
    team: "GBA U13",
    category: "U13",
    pole: "Pré-formation",
    status: "paid",
    amountTotalEur: 190,
    amountPaidEur: 190,
    dueDateLabel: "05 fév.",
    isOverdue: false,
    updatedAtLabel: "il y a 2j",
    contactName: "Mamadou Diallo",
    contactEmail: "mamadou.diallo@example.com",
    contactPhone: null,
    lastPaymentMethod: "Virement",
  },
  {
    id: "lic-u15-021",
    playerName: "L. Fernandez",
    team: "GBA U15",
    category: "U15",
    pole: "Pré-formation",
    status: "partial",
    amountTotalEur: 200,
    amountPaidEur: 120,
    dueDateLabel: "28 fév.",
    isOverdue: false,
    updatedAtLabel: "il y a 3j",
    contactName: "Isabel Fernandez",
    contactEmail: null,
    contactPhone: "+33 6 44 55 66 77",
    lastPaymentMethod: "Chèque",
  },
  {
    id: "lic-u17-003",
    playerName: "N. Girard",
    team: "GBA U17",
    category: "U17",
    pole: "Formation",
    status: "unpaid",
    amountTotalEur: 220,
    amountPaidEur: 0,
    dueDateLabel: "01 mars",
    isOverdue: false,
    updatedAtLabel: "il y a 4j",
    contactName: "Sophie Girard",
    contactEmail: "s.girard@example.com",
    contactPhone: "+33 6 70 11 22 33",
    lastPaymentMethod: null,
  },
  {
    id: "lic-u17-011",
    playerName: "C. Nguyen",
    team: "GBA U17",
    category: "U17",
    pole: "Formation",
    status: "unpaid",
    amountTotalEur: 220,
    amountPaidEur: 0,
    dueDateLabel: "08 fév.",
    isOverdue: true,
    updatedAtLabel: "hier",
    contactName: "Anh Nguyen",
    contactEmail: "anh.nguyen@example.com",
    contactPhone: null,
    lastPaymentMethod: null,
  },
];
