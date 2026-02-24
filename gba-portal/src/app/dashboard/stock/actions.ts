'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getDashboardScope } from '@/lib/dashboard/getDashboardScope'
import { log } from '@/lib/logger'

export type StockItem = {
  id: string
  label: string
  kind: string
  pole: string
  location: string
  sizeLabel: string | null
  sku: string | null
  qty: number
  minQty: number
  note: string | null
  updatedAt: string
}

export async function getStockItems() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stock_items')
    .select('*')
    .order('label', { ascending: true })

  if (error) {
    log.error('Error fetching stock items:', error)
    return []
  }

  return (data || []).map(
    (item: {
      id: string
      label: string
      kind: string
      pole: string
      location: string
      size_label: string | null
      sku: string | null
      qty: number
      min_qty: number
      note: string | null
      updated_at: string
    }) => ({
      ...item,
      sizeLabel: item.size_label,
      minQty: item.min_qty,
      updatedAt: item.updated_at,
    })
  ) as StockItem[]
}

export async function updateStockQuantity(
  itemId: string,
  delta: number,
  reason: string,
  note?: string
) {
  const scope = await getDashboardScope()
  if (!['admin', 'staff', 'coach'].includes(scope.role)) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // 1. Get current item to ensure it exists and calc new qty
  const { data: item, error: fetchError } = await supabase
    .from('stock_items')
    .select('qty')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) {
    return { error: 'Item not found' }
  }

  const newQty = Math.max(0, item.qty + delta)

  // 2. Update item
  const { error: updateError } = await supabase
    .from('stock_items')
    .update({ qty: newQty, updated_at: new Date().toISOString() })
    .eq('id', itemId)

  if (updateError) {
    return { error: 'Failed to update stock' }
  }

  // 3. Log movement (optional but recommended)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  await supabase.from('stock_movements').insert({
    stock_item_id: itemId,
    change_amount: delta,
    reason: note ? `${reason} - ${note}` : reason,
    performed_by: user?.id, // nullable if user not in auth (e.g. dev mock), but standard for real app
  })

  revalidatePath('/dashboard/stock')
  return { success: true, newQty }
}
