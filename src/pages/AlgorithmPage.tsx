import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAlgorithms, useCreateAlgorithm, useDeleteAlgorithm } from '../lib/algorithms'
import { useSession } from '../lib/auth'
import RandomWheel from '../components/RandomWheel'
import AlgorithmForm from '../components/AlgorithmForm'
import './AlgorithmPage.css'

const difficultyLabel: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}

export default function AlgorithmPage() {
  const { data: algorithms = [], isLoading } = useAlgorithms()
  const { user } = useSession()
  const createAlgorithm = useCreateAlgorithm()
  const deleteAlgorithm = useDeleteAlgorithm()
  const [showForm, setShowForm] = useState(false)

  if (isLoading) return <p>加载中...</p>

  return (
    <div className="algorithm-page">
      <div className="algorithm-header">
        <h1>算法</h1>
        {user && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            添加题目
          </button>
        )}
      </div>

      {showForm && (
        <AlgorithmForm
          onSubmit={(data) => {
            createAlgorithm.mutate(data, {
              onSuccess: () => setShowForm(false),
            })
          }}
          onCancel={() => setShowForm(false)}
          loading={createAlgorithm.isPending}
        />
      )}

      {algorithms.length > 0 && (
        <RandomWheel items={algorithms.map((a) => ({ id: a.id, label: a.title }))} />
      )}

      <div className="algorithm-list">
        {algorithms.map((algo) => (
          <div key={algo.id} className="algorithm-card">
            <div className="card-header">
              <Link to={`/algorithm/${algo.id}`} className="card-title">
                {algo.title}
              </Link>
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
            <div className="card-actions">
              {algo.link && (
                <a href={algo.link} target="_blank" rel="noreferrer" className="card-link">
                  原题链接
                </a>
              )}
              {user && (
                <button
                  className="btn-danger-sm"
                  onClick={() => {
                    if (confirm('确定删除？')) deleteAlgorithm.mutate(algo.id)
                  }}
                >
                  删除
                </button>
              )}
            </div>
          </div>
        ))}
        {algorithms.length === 0 && <p className="empty-hint">暂无题目，点击「添加题目」开始。</p>}
      </div>
    </div>
  )
}
