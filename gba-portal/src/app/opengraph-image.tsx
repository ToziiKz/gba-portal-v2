import { ImageResponse } from 'next/og'

import { getBaseUrl } from '@/lib/site'

export const runtime = 'edge'

export const alt = 'ESPACE GBA — Le club, ses valeurs, son histoire'
export const size = {
  width: 1200,
  height: 630,
}

export default function OpenGraphImage() {
  const baseUrl = getBaseUrl()
  const logoUrl = `${baseUrl}/gba-logo.png`

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 72,
        backgroundColor: '#020202',
        backgroundImage:
          'radial-gradient(900px 500px at 20% 20%, rgba(0,161,255,0.35), transparent 55%), radial-gradient(900px 500px at 80% 10%, rgba(0,255,255,0.18), transparent 60%), linear-gradient(180deg, rgba(10,10,10,1) 0%, rgba(2,2,2,1) 55%, rgba(0,0,0,1) 100%)',
        color: 'white',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 40 }}>
        <img
          src={logoUrl}
          width={92}
          height={92}
          alt="GBA"
          style={{ borderRadius: 24, opacity: 0.95 }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{ fontSize: 22, letterSpacing: 10, opacity: 0.75, textTransform: 'uppercase' }}
          >
            Groupement Bruche Ackerland
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: 2, marginTop: 8 }}>
            ESPACE GBA
          </div>
        </div>
      </div>

      <div
        style={{ fontSize: 34, fontWeight: 600, opacity: 0.88, maxWidth: 980, lineHeight: 1.15 }}
      >
        Le club, ses valeurs, son histoire.
      </div>
      <div style={{ marginTop: 18, fontSize: 24, opacity: 0.7, maxWidth: 980, lineHeight: 1.3 }}>
        Jeunes, communauté, partenaires, actus & boutique — une vitrine premium du GBA.
      </div>

      <div style={{ marginTop: 44, display: 'flex', gap: 14 }}>
        {['Club', 'Jeunes', 'Actus', 'Boutique'].map((tag) => (
          <div
            key={tag}
            style={{
              fontSize: 18,
              letterSpacing: 6,
              textTransform: 'uppercase',
              padding: '10px 16px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    size
  )
}
