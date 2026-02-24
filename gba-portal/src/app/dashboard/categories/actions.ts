'use server'

import { requireRole } from '@/lib/dashboard/authz'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { log } from '@/lib/logger'

export type Category = {
  id: string
  name: string
  pole: string
  age_range_label?: string
  teams_label?: string
  teams_count: number
  players_estimate: number
  lead_staff: { id: string; name: string; role: string }[]
  notes?: string
  updated_at: string
}

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*').order('name')

  if (error) {
    log.error('Error fetching categories:', error)
    return []
  }
  return data as Category[]
}

export async function createCategory(formData: FormData) {
  const { supabase } = await requireRole('resp_sportif')

  const name = formData.get('name') as string
  const pole = formData.get('pole') as string
  const age_range_label = formData.get('age_range_label') as string
  const teams_label = formData.get('teams_label') as string
  const notes = formData.get('notes') as string
  const teams_count = parseInt((formData.get('teams_count') as string) || '0')
  const players_estimate = parseInt((formData.get('players_estimate') as string) || '0')

  const { error } = await supabase.from('categories').insert({
    name,
    pole,
    age_range_label,
    teams_label,
    teams_count,
    players_estimate,
    notes,
    lead_staff: [], // Initialize empty staff
  })

  if (error) {
    log.error('Error creating category:', error)
    throw new Error('Failed to create category')
  }

  revalidatePath('/dashboard/categories')
}

export async function updateCategory(id: string, formData: FormData) {
  const { supabase } = await requireRole('resp_sportif')

  const name = formData.get('name') as string
  const pole = formData.get('pole') as string
  const age_range_label = formData.get('age_range_label') as string
  const teams_label = formData.get('teams_label') as string
  const notes = formData.get('notes') as string
  const teams_count = parseInt((formData.get('teams_count') as string) || '0')
  const players_estimate = parseInt((formData.get('players_estimate') as string) || '0')

  const { error } = await supabase
    .from('categories')
    .update({
      name,
      pole,
      age_range_label,
      teams_label,
      teams_count,
      players_estimate,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    log.error('Error updating category:', error)
    throw new Error('Failed to update category')
  }

  revalidatePath('/dashboard/categories')
}

export async function deleteCategory(id: string) {
  const { supabase } = await requireRole('resp_sportif')
  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) {
    log.error('Error deleting category:', error)
    throw new Error('Failed to delete category')
  }
  revalidatePath('/dashboard/categories')
}
