export type EquipmentPole = 'École de foot' | 'Pré-formation' | 'Formation'

export type EquipmentItemType = 'maillot' | 'short' | 'chaussettes' | 'survet' | 'veste'

export type EquipmentItem = {
  type: EquipmentItemType
  size: string | null
  given: boolean
  givenAt?: string
}

export type DashboardEquipmentPlayer = {
  id: string
  name: string
  category: string
  teamName: string
  pole: EquipmentPole
  notes?: string
  items: EquipmentItem[]
}

export const equipmentPoles: EquipmentPole[] = ['École de foot', 'Pré-formation', 'Formation']

export const equipmentItemLabels: Record<EquipmentItemType, string> = {
  maillot: 'Maillot',
  short: 'Short',
  chaussettes: 'Chaussettes',
  survet: 'Survêtement',
  veste: 'Veste',
}

export const dashboardEquipmentMock: DashboardEquipmentPlayer[] = [
  {
    id: 'plr_001',
    name: 'Enzo Leroy',
    category: 'U13',
    teamName: 'U13 A',
    pole: 'Pré-formation',
    notes: 'Manque la taille du survêtement',
    items: [
      { type: 'maillot', size: '12 ans', given: true, givenAt: '2026-01-10' },
      { type: 'short', size: '12 ans', given: true, givenAt: '2026-01-10' },
      { type: 'chaussettes', size: '31-34', given: true, givenAt: '2026-01-10' },
      { type: 'survet', size: null, given: false },
      { type: 'veste', size: '12 ans', given: false },
    ],
  },
  {
    id: 'plr_002',
    name: 'Noah Martin',
    category: 'U11',
    teamName: 'U11',
    pole: 'École de foot',
    items: [
      { type: 'maillot', size: '10 ans', given: true, givenAt: '2026-01-12' },
      { type: 'short', size: '10 ans', given: true, givenAt: '2026-01-12' },
      { type: 'chaussettes', size: '27-30', given: true, givenAt: '2026-01-12' },
      { type: 'survet', size: '10 ans', given: true, givenAt: '2026-01-20' },
      { type: 'veste', size: '10 ans', given: true, givenAt: '2026-01-20' },
    ],
  },
  {
    id: 'plr_003',
    name: 'Lina Bernard',
    category: 'U15F',
    teamName: 'U15F',
    pole: 'Formation',
    notes: 'Reste à remettre le maillot (échange de taille)',
    items: [
      { type: 'maillot', size: 'S', given: false },
      { type: 'short', size: 'S', given: true, givenAt: '2026-01-08' },
      { type: 'chaussettes', size: '35-38', given: true, givenAt: '2026-01-08' },
      { type: 'survet', size: 'S', given: true, givenAt: '2026-01-15' },
      { type: 'veste', size: 'S', given: true, givenAt: '2026-01-15' },
    ],
  },
  {
    id: 'plr_004',
    name: 'Adam Benali',
    category: 'U18',
    teamName: 'U18',
    pole: 'Formation',
    items: [
      { type: 'maillot', size: 'M', given: true, givenAt: '2025-12-18' },
      { type: 'short', size: 'M', given: true, givenAt: '2025-12-18' },
      { type: 'chaussettes', size: '39-42', given: true, givenAt: '2025-12-18' },
      { type: 'survet', size: 'M', given: false },
      { type: 'veste', size: 'M', given: false },
    ],
  },
  {
    id: 'plr_005',
    name: 'Chloé Dupont',
    category: 'U9',
    teamName: 'U9',
    pole: 'École de foot',
    items: [
      { type: 'maillot', size: '8 ans', given: false },
      { type: 'short', size: '8 ans', given: false },
      { type: 'chaussettes', size: '23-26', given: false },
      { type: 'survet', size: '8 ans', given: false },
      { type: 'veste', size: '8 ans', given: false },
    ],
  },
]
