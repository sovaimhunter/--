import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'

export interface Drawing {
  id: string
  title: string
  elements: unknown[]
  app_state: Record<string, unknown>
  files: Record<string, unknown>
  created_at: string
  updated_at: string
}

const QUERY_KEY = ['drawings']

export function useDrawing(id: string | undefined | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drawings')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Drawing
    },
    enabled: !!id,
  })
}

export function useCreateDrawing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (title: string = '未命名画板') => {
      const { data, error } = await supabase
        .from('drawings')
        .insert({ title })
        .select()
        .single()
      if (error) throw error
      return data as Drawing
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useSaveDrawing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      elements,
      app_state,
      files,
    }: {
      id: string
      elements: unknown[]
      app_state?: Record<string, unknown>
      files?: Record<string, unknown>
    }) => {
      const { data, error } = await supabase
        .from('drawings')
        .update({ elements, app_state, files })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Drawing
    },
    onSuccess: (data) => {
      queryClient.setQueryData([...QUERY_KEY, data.id], data)
    },
  })
}
