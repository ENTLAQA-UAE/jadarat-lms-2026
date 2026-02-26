import { useReducer, useCallback, useRef, useEffect } from 'react'
import type {
  BuilderState,
  BuilderAction,
  CertificateTemplateJSON,
  CertificateElement,
  CertificateLang,
} from '../types'
import { createClassicTemplate } from '../constants'

const MAX_HISTORY = 50

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_TEMPLATE':
      return {
        ...state,
        template: action.payload,
        selectedElementId: null,
        isDirty: false,
      }

    case 'SET_LANG': {
      return {
        ...state,
        template: { ...state.template, lang: action.payload },
        isDirty: true,
      }
    }

    case 'SET_CANVAS_BG':
      return {
        ...state,
        template: {
          ...state.template,
          canvas: { ...state.template.canvas, backgroundColor: action.payload },
        },
        isDirty: true,
      }

    case 'SET_CANVAS_BG_IMAGE':
      return {
        ...state,
        template: {
          ...state.template,
          canvas: { ...state.template.canvas, backgroundImage: action.payload },
        },
        isDirty: true,
      }

    case 'ADD_ELEMENT':
      return {
        ...state,
        template: {
          ...state.template,
          elements: [...state.template.elements, action.payload],
        },
        selectedElementId: action.payload.id,
        isDirty: true,
      }

    case 'UPDATE_ELEMENT':
      return {
        ...state,
        template: {
          ...state.template,
          elements: state.template.elements.map((el) =>
            el.id === action.payload.id
              ? ({ ...el, ...action.payload.changes } as CertificateElement)
              : el
          ),
        },
        isDirty: true,
      }

    case 'REMOVE_ELEMENT':
      return {
        ...state,
        template: {
          ...state.template,
          elements: state.template.elements.filter((el) => el.id !== action.payload),
        },
        selectedElementId:
          state.selectedElementId === action.payload ? null : state.selectedElementId,
        isDirty: true,
      }

    case 'MOVE_ELEMENT':
      return {
        ...state,
        template: {
          ...state.template,
          elements: state.template.elements.map((el) =>
            el.id === action.payload.id
              ? { ...el, x: action.payload.x, y: action.payload.y }
              : el
          ),
        },
        isDirty: true,
      }

    case 'RESIZE_ELEMENT':
      return {
        ...state,
        template: {
          ...state.template,
          elements: state.template.elements.map((el) =>
            el.id === action.payload.id
              ? {
                  ...el,
                  width: action.payload.width,
                  height: action.payload.height,
                  ...(action.payload.x !== undefined ? { x: action.payload.x } : {}),
                  ...(action.payload.y !== undefined ? { y: action.payload.y } : {}),
                }
              : el
          ),
        },
        isDirty: true,
      }

    case 'SELECT_ELEMENT':
      return { ...state, selectedElementId: action.payload }

    case 'REORDER_ELEMENT':
      return {
        ...state,
        template: {
          ...state.template,
          elements: state.template.elements.map((el) =>
            el.id === action.payload.id
              ? { ...el, zIndex: action.payload.zIndex }
              : el
          ),
        },
        isDirty: true,
      }

    case 'MARK_CLEAN':
      return { ...state, isDirty: false }

    default:
      return state
  }
}

export function useTemplateState(initial?: CertificateTemplateJSON) {
  const defaultTemplate = initial ?? createClassicTemplate('en')

  const [state, dispatch] = useReducer(builderReducer, {
    template: defaultTemplate,
    selectedElementId: null,
    isDirty: false,
  })

  // Undo/redo history
  const historyRef = useRef<CertificateTemplateJSON[]>([defaultTemplate])
  const historyIndexRef = useRef(0)
  const isUndoRedoRef = useRef(false)

  // Track template changes for undo history
  useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false
      return
    }
    const current = historyRef.current[historyIndexRef.current]
    if (JSON.stringify(current) === JSON.stringify(state.template)) return

    // Truncate any future states after current index
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current.push(state.template)
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift()
    } else {
      historyIndexRef.current++
    }
  }, [state.template])

  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    isUndoRedoRef.current = true
    historyIndexRef.current--
    dispatch({ type: 'SET_TEMPLATE', payload: historyRef.current[historyIndexRef.current] })
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    isUndoRedoRef.current = true
    historyIndexRef.current++
    dispatch({ type: 'SET_TEMPLATE', payload: historyRef.current[historyIndexRef.current] })
  }, [])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const selectedElement = state.selectedElementId
    ? state.template.elements.find((el) => el.id === state.selectedElementId) ?? null
    : null

  const addElement = useCallback(
    (el: CertificateElement) => dispatch({ type: 'ADD_ELEMENT', payload: el }),
    []
  )

  const updateElement = useCallback(
    (id: string, changes: Partial<CertificateElement>) =>
      dispatch({ type: 'UPDATE_ELEMENT', payload: { id, changes } }),
    []
  )

  const removeElement = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_ELEMENT', payload: id }),
    []
  )

  const moveElement = useCallback(
    (id: string, x: number, y: number) =>
      dispatch({ type: 'MOVE_ELEMENT', payload: { id, x, y } }),
    []
  )

  const resizeElement = useCallback(
    (id: string, width: number, height: number, x?: number, y?: number) =>
      dispatch({ type: 'RESIZE_ELEMENT', payload: { id, width, height, x, y } }),
    []
  )

  const selectElement = useCallback(
    (id: string | null) => dispatch({ type: 'SELECT_ELEMENT', payload: id }),
    []
  )

  const setTemplate = useCallback(
    (t: CertificateTemplateJSON) => {
      historyRef.current = [t]
      historyIndexRef.current = 0
      dispatch({ type: 'SET_TEMPLATE', payload: t })
    },
    []
  )

  const setLang = useCallback(
    (lang: CertificateLang) => dispatch({ type: 'SET_LANG', payload: lang }),
    []
  )

  const setCanvasBg = useCallback(
    (color: string) => dispatch({ type: 'SET_CANVAS_BG', payload: color }),
    []
  )

  const setCanvasBgImage = useCallback(
    (url: string | undefined) => dispatch({ type: 'SET_CANVAS_BG_IMAGE', payload: url }),
    []
  )

  const markClean = useCallback(() => dispatch({ type: 'MARK_CLEAN' }), [])

  return {
    state,
    selectedElement,
    addElement,
    updateElement,
    removeElement,
    moveElement,
    resizeElement,
    selectElement,
    setTemplate,
    setLang,
    setCanvasBg,
    setCanvasBgImage,
    markClean,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}
