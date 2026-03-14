import { useParams, useNavigate } from 'react-router-dom'
import { useCourse, useCourseWeeks, useCreateCourseWeek, useUpdateCourseWeek } from '../lib/courses'
import { useCreateDrawing } from '../lib/drawings'
import { useSession } from '../lib/auth'
import ExcalidrawEditor from '../components/ExcalidrawEditor'
import './CourseDetailPage.css'

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: course, isLoading: courseLoading } = useCourse(id)
  const { data: weeks = [], isLoading: weeksLoading } = useCourseWeeks(id)
  const { user } = useSession()
  const createDrawing = useCreateDrawing()
  const createWeek = useCreateCourseWeek()
  const updateWeek = useUpdateCourseWeek()

  if (courseLoading || weeksLoading) return <p>加载中...</p>
  if (!course) return <p>课程不存在。</p>

  const existingWeekNumbers = new Set(weeks.map((w) => w.week_number))
  const nextWeek = (() => {
    for (let i = 1; i <= course.total_weeks; i++) {
      if (!existingWeekNumbers.has(i)) return i
    }
    return null
  })()

  const handleAddWeek = () => {
    if (!nextWeek) return
    const topic = prompt(`第 ${nextWeek} 周主题（可留空）：`)
    if (topic === null) return
    createDrawing.mutate(`${course.name} - 第${nextWeek}周`, {
      onSuccess: (drawing) => {
        createWeek.mutate({
          course_id: course.id,
          week_number: nextWeek,
          topic: topic || undefined,
          drawing_id: drawing.id,
        })
      },
    })
  }

  const handleEditTopic = (week: typeof weeks[0]) => {
    const newTopic = prompt('修改主题：', week.topic ?? '')
    if (newTopic !== null) {
      updateWeek.mutate({ id: week.id, topic: newTopic || undefined })
    }
  }

  return (
    <div className="course-detail">
      <button className="btn-back" onClick={() => navigate('/course')}>
        ← 返回课程列表
      </button>

      <div className="course-detail-header">
        <h1>{course.name}</h1>
        {course.semester && <span className="course-semester">{course.semester}</span>}
      </div>

      {user && nextWeek && (
        <button
          className="btn-primary"
          onClick={handleAddWeek}
          disabled={createDrawing.isPending || createWeek.isPending}
        >
          {createDrawing.isPending || createWeek.isPending ? '创建中...' : `添加第 ${nextWeek} 周`}
        </button>
      )}

      <div className="weeks-list">
        {weeks.map((week) => (
          <div key={week.id} className="week-card">
            <div className="week-header">
              <h2>第 {week.week_number} 周</h2>
              {week.topic && <span className="week-topic">{week.topic}</span>}
              {user && (
                <button className="btn-sm" onClick={() => handleEditTopic(week)}>
                  编辑主题
                </button>
              )}
            </div>
            <ExcalidrawEditor drawingId={week.drawing_id} readOnly={!user} />
          </div>
        ))}
        {weeks.length === 0 && <p className="empty-hint">暂无周记录，点击上方按钮添加。</p>}
      </div>
    </div>
  )
}
