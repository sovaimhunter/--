import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCourses, useCreateCourse, useDeleteCourse } from '../lib/courses'
import { useSession } from '../lib/auth'
import './CoursePage.css'

export default function CoursePage() {
  const { data: courses = [], isLoading } = useCourses()
  const { user } = useSession()
  const createCourse = useCreateCourse()
  const deleteCourse = useDeleteCourse()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [semester, setSemester] = useState('')
  const [totalWeeks, setTotalWeeks] = useState('14')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCourse.mutate(
      { name, semester: semester || undefined, total_weeks: parseInt(totalWeeks) || 14 },
      { onSuccess: () => { setShowForm(false); setName(''); setSemester(''); setTotalWeeks('14') } },
    )
  }

  if (isLoading) return <p>加载中...</p>

  return (
    <div className="course-page">
      <div className="course-header">
        <h1>课程</h1>
        {user && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            添加课程
          </button>
        )}
      </div>

      {showForm && (
        <form className="course-form" onSubmit={handleSubmit}>
          <label>
            课程名称 *
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            学期
            <input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="2026-Spring" />
          </label>
          <label>
            总周数
            <input type="number" value={totalWeeks} onChange={(e) => setTotalWeeks(e.target.value)} min={1} max={30} />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={createCourse.isPending}>
              {createCourse.isPending ? '创建中...' : '创建'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              取消
            </button>
          </div>
        </form>
      )}

      <div className="course-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <Link to={`/course/${course.id}`} className="course-card-link">
              <h2>{course.name}</h2>
              {course.semester && <span className="course-semester">{course.semester}</span>}
              <span className="course-weeks">{course.total_weeks} 周</span>
            </Link>
            {user && (
              <button
                className="btn-danger-sm"
                onClick={() => { if (confirm('确定删除该课程？')) deleteCourse.mutate(course.id) }}
              >
                删除
              </button>
            )}
          </div>
        ))}
        {courses.length === 0 && <p className="empty-hint">暂无课程，点击「添加课程」开始。</p>}
      </div>
    </div>
  )
}
