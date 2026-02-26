'use client'

import { useCallback, useRef } from 'react'
import { Type, ImageIcon, QrCode, Variable } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { CertificateElement, CertificateLang, TextElement, ImageElement, QRCodeElement } from './types'
import { DYNAMIC_VARIABLES, VARIABLE_CATEGORIES, FONTS_BY_LANG, DEFAULT_TEMPLATES } from './constants'
import type { CertificateTemplateJSON } from './types'
import { createClient } from '@/utils/supabase'
import { useAppSelector } from '@/hooks/redux.hook'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

interface ElementToolbarProps {
  lang: CertificateLang
  onAddElement: (el: CertificateElement) => void
  onLoadTemplate: (t: CertificateTemplateJSON) => void
}

export default function ElementToolbar({
  lang,
  onAddElement,
  onLoadTemplate,
}: ElementToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user: { organization_id } } = useAppSelector((state) => state.user)
  const isAr = lang === 'ar'

  const addText = useCallback(() => {
    const el: TextElement = {
      id: uid(),
      type: 'text',
      x: 171,
      y: 200,
      width: 500,
      height: 40,
      rotation: 0,
      zIndex: 10,
      content: isAr ? 'نص جديد' : 'New Text',
      fontFamily: FONTS_BY_LANG[lang],
      fontSize: 20,
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'center',
    }
    onAddElement(el)
  }, [lang, isAr, onAddElement])

  const addVariable = useCallback(
    (variable: string) => {
      const el: TextElement = {
        id: uid(),
        type: 'text',
        x: 171,
        y: 200,
        width: 500,
        height: 40,
        rotation: 0,
        zIndex: 10,
        content: variable,
        fontFamily: FONTS_BY_LANG[lang],
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a2e',
        textAlign: 'center',
      }
      onAddElement(el)
    },
    [lang, onAddElement]
  )

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const supabase = createClient()
      const path = `LMS Resources/${organization_id}/certificate-assets/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('LMS Resources')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return
      }

      const { data: urlData } = await supabase.storage
        .from('LMS Resources')
        .createSignedUrl(path, 630720000) // ~20 years

      if (!urlData?.signedUrl) return

      const el: ImageElement = {
        id: uid(),
        type: 'image',
        x: 50,
        y: 50,
        width: 120,
        height: 80,
        rotation: 0,
        zIndex: 10,
        src: urlData.signedUrl,
        objectFit: 'contain',
      }
      onAddElement(el)

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [organization_id, onAddElement]
  )

  const addQR = useCallback(() => {
    const el: QRCodeElement = {
      id: uid(),
      type: 'qr',
      x: 720,
      y: 470,
      width: 80,
      height: 80,
      rotation: 0,
      zIndex: 10,
    }
    onAddElement(el)
  }, [onAddElement])

  return (
    <div className="w-[220px] border-r bg-card flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Add Elements */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {isAr ? 'العناصر' : 'Elements'}
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button variant="outline" size="sm" className="flex flex-col h-16 gap-1" onClick={addText}>
                <Type className="h-4 w-4" />
                <span className="text-[10px]">{isAr ? 'نص' : 'Text'}</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-16 gap-1" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="h-4 w-4" />
                <span className="text-[10px]">{isAr ? 'صورة' : 'Image'}</span>
              </Button>
              <Button variant="outline" size="sm" className="flex flex-col h-16 gap-1 col-span-2" onClick={addQR}>
                <QrCode className="h-4 w-4" />
                <span className="text-[10px]">{isAr ? 'رمز QR' : 'QR Code'}</span>
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <Separator />

          {/* Dynamic Variables - Grouped by Category */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Variable className="h-3 w-3" />
              {isAr ? 'المتغيرات' : 'Variables'}
            </Label>
            <div className="mt-2 space-y-3">
              {VARIABLE_CATEGORIES.map((cat) => {
                const vars = DYNAMIC_VARIABLES.filter((v) => v.category === cat.key)
                if (vars.length === 0) return null
                return (
                  <div key={cat.key}>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      {isAr ? cat.labelAr : cat.labelEn}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {vars.map((v) => (
                        <Button
                          key={v.key}
                          variant="ghost"
                          size="sm"
                          className="justify-start text-xs h-7 font-mono px-2"
                          onClick={() => addVariable(v.key)}
                        >
                          {isAr ? v.labelAr : v.labelEn}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Starter Templates */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {isAr ? 'قوالب جاهزة' : 'Templates'}
            </Label>
            <div className="flex flex-col gap-1 mt-2">
              {DEFAULT_TEMPLATES.map((t) => (
                <Button
                  key={t.name}
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs h-8"
                  onClick={() => onLoadTemplate(t.create(lang))}
                >
                  {isAr ? t.nameAr : t.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
