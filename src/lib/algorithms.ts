import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'

export interface Algorithm {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard' | null
  tags: string[]
  link: string | null
  notes: string | null
  drawing_id: string | null
  created_at: string
  updated_at: string
}

export type AlgorithmInsert = Pick<Algorithm, 'title'> &
  Partial<Pick<Algorithm, 'difficulty' | 'tags' | 'link' | 'notes' | 'drawing_id'>>

export type AlgorithmUpdate = Partial<AlgorithmInsert>

const QUERY_KEY = ['algorithms']

export function useAlgorithms() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('algorithms')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Algorithm[]
    },
  })
}

export function useAlgorithm(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('algorithms')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Algorithm
    },
    enabled: !!id,
  })
}

export function useCreateAlgorithm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AlgorithmInsert) => {
      const { data, error } = await supabase
        .from('algorithms')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data as Algorithm
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateAlgorithm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: AlgorithmUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('algorithms')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Algorithm
    },
    onSuccess: (data) => {
      queryClient.setQueryData([...QUERY_KEY, data.id], data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteAlgorithm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('algorithms')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
