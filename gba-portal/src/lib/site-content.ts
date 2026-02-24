export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contact@gba-portal.fr'

export const KEY_STATS = [
  { label: 'Équipes', value: '30+', sub: 'Toutes les catégories jeunes représentées' },
  { label: 'Joueurs', value: '370+', sub: 'Du Babyfoot à U18' },
  { label: 'Soutiens', value: '100+', sub: 'Entreprises locales engagées' },
]

export const SPONSORS_LIST = [
  {
    name: 'Céramique +',
    role: 'Magasin carrelage',
    impact: 'Partenaire local engagé pour les infrastructures et la vie du club.',
    logoUrl: '/sponsors/ceramique-plus.png',
  },
  {
    name: 'France Pare-Brise',
    role: 'Réparation pare-brise',
    impact: 'Interventions rapides, prise en charge, et soutien local au club.',
    logoUrl: '/sponsors/france-pare-brise.png',
  },
  {
    name: 'Restaurant Au Lion',
    role: 'Restaurant',
    impact: 'Partenaire convivial des moments club et des événements locaux.',
    logoUrl: '/sponsors/restaurant-au-lion.png',
  },
  {
    name: 'Marka Sport',
    role: 'Impression & distribution',
    impact: 'Équipement, marquage et distribution — partenaire terrain du GBA.',
    logoUrl: '/sponsors/marka-sport.png',
  },
  {
    name: 'LCR',
    role: 'Constructeur immobilier',
    impact: 'Les Constructeurs Réunis — partenaire engagé aux côtés du GBA.',
    logoUrl: '/sponsors/lcr.png',
  },
  {
    name: 'Origami',
    role: 'Agence immobilière',
    impact: 'Partenaire local engagé aux côtés du GBA.',
    logoUrl: '/sponsors/origami.jpg',
  },
]

export const NAV_LINKS = [
  { label: 'Le Club', href: '/#manifesto' },
  { label: 'Boutique', href: '/shop', highlight: true },
  { label: 'Actus', href: '/news' },
  { label: 'Sponsors', href: '/sponsors' },
  { label: 'Contact', href: '/contact' },
]
