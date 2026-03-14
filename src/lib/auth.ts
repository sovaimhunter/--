import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'

const AUTH_QUERY_KEY = ['auth', 'session']

export function useSession() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    },
    staleTime: Infinity,
  })

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        queryClient.setQueryData(AUTH_QUERY_KEY, session)
      }
    )
    return () => subscription.unsubscribe()
  }, [queryClient])

  return {
    session: query.data ?? null,
    user: query.data?.user ?? null,
    loading: query.isLoading,
  }
}

export function useSignIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data.session
    },
    onSuccess: (session) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, session)
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null)
      queryClient.invalidateQueries()
    },
  })
}
