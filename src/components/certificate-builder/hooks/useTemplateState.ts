import { useReducer, useCallback } from 'react'
import type {
  BuilderState,
  BuilderAction,
  CertificateTemplateJSON,
  CertificateElement,
  CertificateLang,
} from '../types'
import { createClassicTemplate } from '../constants'

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
    (t: CertificateTemplateJSON) => dispatch({ type: 'SET_TEMPLATE', payload: t }),
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
  }
}
