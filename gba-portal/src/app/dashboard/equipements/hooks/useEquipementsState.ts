import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { readLocal, writeLocal } from '@/lib/dashboard/storage'

export type RequestStatus = 'EN_ATTENTE' | 'VALIDE' | 'LIVRE' | 'REFUSE'

export type RequestItem = { name: string; qty: number; sku?: string }

export type EquipmentRequest = {
  id: string
  title: string
  team: string
  category: 'Textile' | 'Matériel' | 'Medical'
  priority: 'Normal' | 'Urgent'
  status: RequestStatus
  createdAt: string
  items: RequestItem[]
  note?: string
}

type StockItem = {
  id: string
  name: string
  sku: string
  qty: number
  min: number
  updatedAt?: string
}

type StockMove = {
  id: string
  type: 'IN' | 'OUT'
  itemId: string
  itemName: string
  qty: number
  reason: string
  at: string
}

const STORAGE_KEY_REQUESTS = 'gba-dashboard-equipements-requests-v1'
const STOCK_ITEMS_KEY = 'gba-dashboard-stock-items-v1'
const STOCK_MOVES_KEY = 'gba-dashboard-stock-moves-v1'

const INITIAL_FORM: Partial<EquipmentRequest> = {
  title: '',
  team: 'U15',
  category: 'Matériel',
  priority: 'Normal',
  items: [{ name: 'Chasubles', qty: 10, sku: 'GBA-CHA-20' }],
  note: '',
}

const INITIAL_REQUESTS: EquipmentRequest[] = [
  {
    id: 'r1',
    title: 'Réassort chasubles',
    team: 'U15',
    category: 'Matériel',
    priority: 'Normal',
    status: 'EN_ATTENTE',
    createdAt: '2026-02-10 11:02',
    items: [
      { name: 'Chasubles', qty: 10, sku: 'GBA-CHA-20' },
      { name: 'Cones', qty: 30 },
    ],
    note: 'Séances intenses cette semaine.',
  },
  {
    id: 'r2',
    title: 'Maillots match',
    team: 'R1',
    category: 'Textile',
    priority: 'Urgent',
    status: 'VALIDE',
    createdAt: '2026-02-09 18:40',
    items: [
      { name: 'Maillot domicile (M)', qty: 6, sku: 'GBA-MAI-2526-M' },
      { name: 'Chaussettes', qty: 12 },
    ],
  },
  {
    id: 'r3',
    title: 'Trousse secours',
    team: 'U18',
    category: 'Medical',
    priority: 'Normal',
    status: 'LIVRE',
    createdAt: '2026-02-08 09:12',
    items: [
      { name: 'Bande cohésive', qty: 6 },
      { name: 'Spray froid', qty: 2, sku: 'GBA-MED-SF' },
    ],
  },
]

function lowered(value: string) {
  return (value ?? '').toLowerCase()
}

function getInitialStatus(searchParams: ReturnType<typeof useSearchParams>): RequestStatus | 'ALL' {
  const status = searchParams?.get('status')
  const delivery = searchParams?.get('delivery')

  if (delivery === 'todo') return 'EN_ATTENTE'
  if (status && ['EN_ATTENTE', 'VALIDE', 'LIVRE', 'REFUSE'].includes(status)) {
    return status as RequestStatus
  }
  return 'ALL'
}

function getInitialQuery(searchParams: ReturnType<typeof useSearchParams>) {
  return searchParams?.get('q') ?? searchParams?.get('query') ?? ''
}

function getPersistedRequests() {
  return readLocal<EquipmentRequest[]>(STORAGE_KEY_REQUESTS, INITIAL_REQUESTS)
}

function applyDeliveryToStock(req: EquipmentRequest) {
  const stockItems = readLocal<StockItem[]>(STOCK_ITEMS_KEY, [])
  const stockMoves = readLocal<StockMove[]>(STOCK_MOVES_KEY, [])

  const updatedItems = stockItems.map((item) => {
    const bySku = req.items.find(
      (requestItem) => requestItem.sku && lowered(requestItem.sku) === lowered(item.sku)
    )
    const byName = req.items.find(
      (requestItem) => !requestItem.sku && lowered(item.name).includes(lowered(requestItem.name))
    )
    const match = bySku ?? byName

    if (!match) return item

    return {
      ...item,
      qty: Math.max(0, Number(item.qty ?? 0) - Number(match.qty ?? 0)),
      updatedAt: '2026-02-10',
    }
  })

  const outQty = req.items.reduce((acc, item) => acc + Number(item.qty ?? 0), 0)

  const newMoves: StockMove[] = [
    {
      id: `m${Math.random().toString(16).slice(2)}`,
      type: 'OUT',
      itemId: 'bulk',
      itemName: `Livraison équipements (${req.team})`,
      qty: outQty,
      reason: `Demande livrée: ${req.title}`,
      at: '2026-02-10 18:05',
    },
    ...stockMoves,
  ]

  writeLocal(STOCK_ITEMS_KEY, updatedItems)
  writeLocal(STOCK_MOVES_KEY, newMoves)

  const lowAfter = updatedItems.filter((item) => Number(item.qty) < Number(item.min ?? 0)).length
  return { lowAfter }
}

export function useEquipementsState() {
  const searchParams = useSearchParams()

  const [requests, setRequests] = useState<EquipmentRequest[]>(() => getPersistedRequests())
  const [q, setQ] = useState(() => getInitialQuery(searchParams))
  const [status, setStatus] = useState<RequestStatus | 'ALL'>(() => getInitialStatus(searchParams))
  const [selectedId, setSelectedId] = useState<string | null>(
    () => getPersistedRequests()[0]?.id ?? null
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<Partial<EquipmentRequest>>(INITIAL_FORM)

  const [isDeliverOpen, setIsDeliverOpen] = useState(false)
  const [deliverDeduct, setDeliverDeduct] = useState(true)
  const [deliverInfo, setDeliverInfo] = useState<{ lowAfter?: number } | null>(null)

  useEffect(() => {
    writeLocal(STORAGE_KEY_REQUESTS, requests)
  }, [requests])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()

    return requests
      .filter((request) => (status === 'ALL' ? true : request.status === status))
      .filter((request) => {
        if (!query) return true
        const haystack =
          `${request.title} ${request.team} ${request.category} ${request.priority}`.toLowerCase()
        return haystack.includes(query)
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [requests, q, status])

  const selected = useMemo(() => {
    return requests.find((request) => request.id === selectedId) ?? filtered[0] ?? null
  }, [requests, selectedId, filtered])

  const counts = useMemo(() => {
    const pending = requests.filter((request) => request.status === 'EN_ATTENTE').length
    const urgent = requests.filter(
      (request) => request.priority === 'Urgent' && request.status !== 'LIVRE'
    ).length

    return { pending, urgent }
  }, [requests])

  const openModal = () => {
    setForm(INITIAL_FORM)
    setIsModalOpen(true)
  }

  const addItemRow = () => {
    setForm((previous) => ({
      ...previous,
      items: [...(previous.items ?? []), { name: 'Article', qty: 1, sku: '' }],
    }))
  }

  const updateItemRow = (idx: number, patch: { name?: string; qty?: number; sku?: string }) => {
    setForm((previous) => ({
      ...previous,
      items: (previous.items ?? []).map((item: RequestItem, index) =>
        index === idx ? { ...item, ...patch } : item
      ),
    }))
  }

  const removeItemRow = (idx: number) => {
    setForm((previous) => ({
      ...previous,
      items: (previous.items ?? []).filter((_, index) => index !== idx),
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    window.setTimeout(() => {
      const newReq: EquipmentRequest = {
        id: `r${Math.random().toString(16).slice(2)}`,
        title: String(form.title ?? '').trim() || 'Demande équipements',
        team: String(form.team ?? 'U15'),
        category: (form.category ?? 'Matériel') as EquipmentRequest['category'],
        priority: (form.priority ?? 'Normal') as EquipmentRequest['priority'],
        status: 'EN_ATTENTE',
        createdAt: '2026-02-10 18:06',
        items: (form.items ?? []) as RequestItem[],
        note: String(form.note ?? ''),
      }

      setRequests((previous) => [newReq, ...previous])
      setSelectedId(newReq.id)
      setIsSubmitting(false)
      setIsModalOpen(false)
    }, 650)
  }

  const setReqStatus = (id: string, newStatus: RequestStatus) => {
    setRequests((previous) =>
      previous.map((request) => (request.id === id ? { ...request, status: newStatus } : request))
    )
  }

  const openDeliver = () => {
    if (!selected) return
    setDeliverInfo(null)
    setDeliverDeduct(true)
    setIsDeliverOpen(true)
  }

  const confirmDeliver = () => {
    if (!selected) return

    setReqStatus(selected.id, 'LIVRE')

    if (deliverDeduct) {
      const info = applyDeliveryToStock(selected)
      setDeliverInfo({ lowAfter: info?.lowAfter })
    }

    setIsDeliverOpen(false)
  }

  return {
    q,
    setQ,
    status,
    setStatus,
    filtered,
    selected,
    selectedId,
    setSelectedId,
    counts,
    isModalOpen,
    setIsModalOpen,
    isSubmitting,
    form,
    setForm,
    openModal,
    addItemRow,
    updateItemRow,
    removeItemRow,
    submit,
    setReqStatus,
    isDeliverOpen,
    setIsDeliverOpen,
    deliverDeduct,
    setDeliverDeduct,
    deliverInfo,
    openDeliver,
    confirmDeliver,
  }
}
