import { useParams, useNavigate } from 'react-router-dom'
import { useAlgorithm, useUpdateAlgorithm } from '../lib/algorithms'
import { useCreateDrawing } from '../lib/drawings'
import { useSession } from '../lib/auth'
import ExcalidrawEditor from '../components/ExcalidrawEditor'
import './AlgorithmDetailPage.css'

const difficultyLabel: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

export default function AlgorithmDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: algo, isLoading } = useAlgorithm(id)
  const { user } = useSession()
  const updateAlgorithm = useUpdateAlgorithm()
  const createDrawing = useCreateDrawing()

  if (isLoading) return <p>加载中...</p>
  if (!algo) return <p>题目不存在。</p>

  const handleCreateDrawing = () => {
    createDrawing.mutate(algo.title + ' - 解题思路', {
      onSuccess: (drawing) => {
        updateAlgorithm.mutate({ id: algo.id, drawing_id: drawing.id })
      },
    })
  }

  return (
    <div className="algo-detail">
      <button className="btn-back" onClick={() => navigate('/algorithm')}>
        ← 返回列表
      </button>

      <div className="algo-detail-header">
        <h1>{algo.title}</h1>
        {algo.difficulty && (
          <span className={`badge badge-${algo.difficulty}`}>
            {difficultyLabel[algo.difficulty]}
          </span>
        )}
      </div>

      {algo.tags.length > 0 && (
        <div className="card-tags">
          {algo.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}

      {algo.link && (
        <a href={algo.link} target="_blank" rel="noreferrer" className="algo-link">
          查看原题 →
        </a>
      )}

      {algo.notes && (
        <div className="algo-notes">
          <h2>笔记</h2>
          <p>{algo.notes}</p>
        </div>
      )}

      <div className="algo-drawing-section">
        <h2>解题思路</h2>
        {algo.drawing_id ? (
          <ExcalidrawEditor drawingId={algo.drawing_id} readOnly={!user} />
        ) : user ? (
          <button
            className="btn-primary"
            onClick={handleCreateDrawing}
            disabled={createDrawing.isPending}
          >
            {createDrawing.isPending ? '创建中...' : '新建画板'}
          </button>
        ) : (
          <p className="empty-hint">暂无解题画板。</p>
        )}
      </div>
    </div>
  )
}
