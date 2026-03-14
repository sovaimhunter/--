import { useRef, useCallback, useEffect, useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { useSaveDrawing, useDrawing } from '../lib/drawings'
import './ExcalidrawEditor.css'

interface Props {
  drawingId: string
  readOnly?: boolean
  defaultExpanded?: boolean
}

export default function ExcalidrawEditor({ drawingId, readOnly = false, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [fullscreen, setFullscreen] = useState(false)
  const { data: drawing, isLoading } = useDrawing(drawingId)
  const saveDrawing = useSaveDrawing()
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleChange = useCallback(() => {
    if (readOnly || !apiRef.current) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const api = apiRef.current
      if (!api) return

      const elements = api.getSceneElements()
      const appState = api.getAppState()
      const files = api.getFiles()

      saveDrawing.mutate({
        id: drawingId,
        elements: elements as unknown[],
        app_state: {
          viewBackgroundColor: appState.viewBackgroundColor,
          zoom: appState.zoom,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
        },
        files: files as unknown as Record<string, unknown>,
      })
    }, 1500)
  }, [drawingId, readOnly, saveDrawing])

  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return

    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const handleFsChange = () => {
      setFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // 展开/全屏切换后，通知 Excalidraw 重新计算容器位置
  useEffect(() => {
    if (expanded && apiRef.current) {
      // 等 DOM 更新完再 refresh
      requestAnimationFrame(() => {
        apiRef.current?.refresh()
      })
    }
  }, [expanded, fullscreen])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (isLoading) return <div className="excalidraw-loading">加载画板中...</div>
  if (!drawing) return <div className="excalidraw-loading">画板不存在</div>

  return (
    <div className="excalidraw-container">
      <div className="excalidraw-toolbar">
        <button
          className="excalidraw-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '收起画板 ▲' : '展开画板 ▼'}
        </button>
        {expanded && (
          <button className="excalidraw-toggle" onClick={toggleFullscreen}>
            {fullscreen ? '退出全屏' : '全屏'}
          </button>
        )}
      </div>
      <div
        ref={wrapperRef}
        className={`excalidraw-wrapper ${fullscreen ? 'excalidraw-fullscreen' : ''}`}
        style={{ display: expanded ? 'block' : 'none' }}
      >
        <Excalidraw
          excalidrawAPI={(api) => { apiRef.current = api }}
          initialData={{
            elements: drawing.elements as never[],
            appState: {
              ...(drawing.app_state as Record<string, unknown>),
            },
            files: drawing.files as never,
          }}
          viewModeEnabled={readOnly}
          onChange={handleChange}
        />
      </div>
    </div>
  )
}
