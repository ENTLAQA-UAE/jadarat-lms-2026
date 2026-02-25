'use client'

import { useState, useCallback } from 'react'
import { Save, X, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from 'sonner'
import Canvas from './Canvas'
import ElementToolbar from './ElementToolbar'
import PropertiesPanel from './PropertiesPanel'
import { useTemplateState } from './hooks/useTemplateState'
import type { CertificateTemplateJSON, CertificateLang } from './types'
import { createClient } from '@/utils/supabase'
import { useAppSelector } from '@/hooks/redux.hook'

interface CertificateBuilderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTemplate?: CertificateTemplateJSON
  organizationId: number | string
}

export default function CertificateBuilder({
  open,
  onOpenChange,
  initialTemplate,
  organizationId,
}: CertificateBuilderProps) {
  const {
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
  } = useTemplateState(initialTemplate)

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('organization_settings')
        .update({ certificate_template_json: state.template })
        .eq('organization_id', organizationId)

      if (error) {
        toast.error(error.message)
      } else {
        toast.success(
          state.template.lang === 'ar'
            ? 'تم حفظ قالب الشهادة بنجاح'
            : 'Certificate template saved successfully'
        )
        markClean()
      }
    } catch (err) {
      toast.error('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }, [state.template, organizationId, markClean])

  const handleClose = useCallback(() => {
    if (state.isDirty) {
      const confirmMsg =
        state.template.lang === 'ar'
          ? 'لديك تغييرات غير محفوظة. هل تريد المغادرة؟'
          : 'You have unsaved changes. Are you sure you want to leave?'
      if (!window.confirm(confirmMsg)) return
    }
    onOpenChange(false)
  }, [state.isDirty, state.template.lang, onOpenChange])

  const toggleLang = useCallback(() => {
    const newLang: CertificateLang = state.template.lang === 'ar' ? 'en' : 'ar'
    setLang(newLang)
  }, [state.template.lang, setLang])

  const isAr = state.template.lang === 'ar'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[100vw] w-[100vw] h-[100dvh] max-h-[100dvh] p-0 rounded-none border-0 gap-0 [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-12 border-b bg-card shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">
              {isAr ? 'بناء قالب الشهادة' : 'Certificate Builder'}
            </h2>
            {state.isDirty && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {isAr ? 'غير محفوظ' : 'Unsaved'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={toggleLang}
            >
              <Languages className="h-3.5 w-3.5" />
              {state.template.lang === 'ar' ? 'AR → EN' : 'EN → AR'}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleSave}
              disabled={isSaving || !state.isDirty}
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving
                ? isAr ? 'جاري الحفظ...' : 'Saving...'
                : isAr ? 'حفظ' : 'Save'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleClose}
              aria-label={isAr ? "إغلاق" : "Close"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100dvh - 48px)' }}>
          <ElementToolbar
            lang={state.template.lang}
            onAddElement={addElement}
            onLoadTemplate={setTemplate}
          />

          <Canvas
            template={state.template}
            selectedElementId={state.selectedElementId}
            onSelectElement={selectElement}
            onMoveElement={moveElement}
            onResizeElement={resizeElement}
          />

          <PropertiesPanel
            element={selectedElement}
            lang={state.template.lang}
            canvasBg={state.template.canvas.backgroundColor}
            canvasBgImage={state.template.canvas.backgroundImage}
            onUpdateElement={updateElement}
            onRemoveElement={removeElement}
            onSetCanvasBg={setCanvasBg}
            onSetCanvasBgImage={setCanvasBgImage}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
