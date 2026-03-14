import { useState } from 'react'
import type { AlgorithmInsert } from '../lib/algorithms'
import './AlgorithmForm.css'

interface Props {
  onSubmit: (data: AlgorithmInsert) => void
  onCancel: () => void
  loading?: boolean
  initial?: Partial<AlgorithmInsert>
}

export default function AlgorithmForm({ onSubmit, onCancel, loading, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [difficulty, setDifficulty] = useState<string>(initial?.difficulty ?? '')
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '')
  const [link, setLink] = useState(initial?.link ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      difficulty: (difficulty || null) as AlgorithmInsert['difficulty'],
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      link: link || null,
      notes: notes || null,
    })
  }

  return (
    <form className="algo-form" onSubmit={handleSubmit}>
      <label>
        题目名称 *
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <label>
        难度
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">未选择</option>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>
      </label>

      <label>
        标签（逗号分隔）
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="dp, tree, bfs" />
      </label>

      <label>
        原题链接
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
      </label>

      <label>
        笔记
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '保存中...' : '保存'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          取消
        </button>
      </div>
    </form>
  )
}
