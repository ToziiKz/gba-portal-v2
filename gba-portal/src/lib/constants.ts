export const POLES = [
  { id: 'FORMATION', label: 'Pôle Formation' },
  { id: 'PRE_FORMATION', label: 'Pôle Pré-Formation' },
  { id: 'ECOLE_DE_FOOT', label: 'Pôle École de Foot' },
  { id: 'FEMININES', label: 'Pôle Féminines' },
] as const

export const CATEGORIES_BY_POLE: Record<string, string[]> = {
  FORMATION: ['U18', 'U16', 'U15', 'U14'],
  PRE_FORMATION: ['U13', 'U11'],
  ECOLE_DE_FOOT: ['U9', 'U8', 'U7', 'U6', 'Babyfoot'],
  FEMININES: ['U18F', 'U15F', 'U13F', 'U11F'],
}

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
  { value: 'Mixte', label: 'Mixte' },
]
