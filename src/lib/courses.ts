import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'

export interface Course {
  id: string
  name: string
  semester: string | null
  total_weeks: number
  created_at: string
}

export interface CourseWeek {
  id: string
  course_id: string
  week_number: number
  topic: string | null
  drawing_id: string
  created_at: string
}

const COURSES_KEY = ['courses']
const WEEKS_KEY = ['course_weeks']

// ---- 课程 CRUD ----

export function useCourses() {
  return useQuery({
    queryKey: COURSES_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Course[]
    },
  })
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: [...COURSES_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Course
    },
    enabled: !!id,
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; semester?: string; total_weeks?: number }) => {
      const { data, error } = await supabase
        .from('courses')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data as Course
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY })
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_KEY })
    },
  })
}

// ---- 课程周 CRUD ----

export function useCourseWeeks(courseId: string | undefined) {
  return useQuery({
    queryKey: [...WEEKS_KEY, courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_weeks')
        .select('*')
        .eq('course_id', courseId!)
        .order('week_number', { ascending: true })
      if (error) throw error
      return data as CourseWeek[]
    },
    enabled: !!courseId,
  })
}

export function useCreateCourseWeek() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { course_id: string; week_number: number; topic?: string; drawing_id: string }) => {
      const { data, error } = await supabase
        .from('course_weeks')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data as CourseWeek
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...WEEKS_KEY, data.course_id] })
    },
  })
}

export function useUpdateCourseWeek() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; topic?: string } & Partial<CourseWeek>) => {
      const { data, error } = await supabase
        .from('course_weeks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as CourseWeek
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...WEEKS_KEY, data.course_id] })
    },
  })
}

export function useDeleteCourseWeek() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase.from('course_weeks').delete().eq('id', id)
      if (error) throw error
      return courseId
    },
    onSuccess: (courseId) => {
      queryClient.invalidateQueries({ queryKey: [...WEEKS_KEY, courseId] })
    },
  })
}
