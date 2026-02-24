import { getRelances } from './actions'
import RelancesClient from './RelancesClient'

export const dynamic = 'force-dynamic'

export default async function DashboardRelancesPage() {
  const relances = await getRelances()

  return <RelancesClient initialRelances={relances} />
}
