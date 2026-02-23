'use client'

import { useCallback, useRef } from 'react'
import { Trash2, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { CertificateElement, CertificateLang, TextElement, ImageElement, FontFamily } from './types'
import { FONT_DISPLAY_NAMES, DYNAMIC_VARIABLES } from './constants'
import { createClient } from '@/utils/supabase'
import { useAppSelector } from '@/hooks/redux.hook'

interface PropertiesPanelProps {
  element: CertificateElement | null
  lang: CertificateLang
  canvasBg: string
  canvasBgImage?: string
  onUpdateElement: (id: string, changes: Partial<CertificateElement>) => void
  onRemoveElement: (id: string) => void
  onSetCanvasBg: (color: string) => void
  onSetCanvasBgImage: (url: string | undefined) => void
}

export default function PropertiesPanel({
  element,
  lang,
  canvasBg,
  canvasBgImage,
  onUpdateElement,
  onRemoveElement,
  onSetCanvasBg,
  onSetCanvasBgImage,
}: PropertiesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bgInputRef = useRef<HTMLInputElement>(null)
  const { user: { organization_id } } = useAppSelector((state) => state.user)
  const isAr = lang === 'ar'

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      const supabase = createClient()
      const path = `LMS Resources/${organization_id}/certificate-assets/${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from('LMS Resources')
        .upload(path, file, { upsert: true })
      if (error) return null
      const { data } = await supabase.storage
        .from('LMS Resources')
        .createSignedUrl(path, 630720000)
      return data?.signedUrl ?? null
    },
    [organization_id]
  )

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !element) return
      const url = await uploadImage(file)
      if (url) onUpdateElement(element.id, { src: url } as Partial<ImageElement>)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [element, onUpdateElement, uploadImage]
  )

  const handleBgImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const url = await uploadImage(file)
      if (url) onSetCanvasBgImage(url)
      if (bgInputRef.current) bgInputRef.current.value = ''
    },
    [onSetCanvasBgImage, uploadImage]
  )

  return (
    <div className="w-[240px] border-l bg-card flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Canvas Properties (always visible) */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {isAr ? 'الخلفية' : 'Background'}
            </Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs w-12">{isAr ? 'لون' : 'Color'}</Label>
                <Input
                  type="color"
                  value={canvasBg}
                  onChange={(e) => onSetCanvasBg(e.target.value)}
                  className="h-8 w-full cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs w-12">{isAr ? 'صورة' : 'Image'}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => bgInputRef.current?.click()}
                >
                  {canvasBgImage ? (isAr ? 'تغيير' : 'Change') : (isAr ? 'رفع' : 'Upload')}
                </Button>
                {canvasBgImage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onSetCanvasBgImage(undefined)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBgImageChange}
              />
            </div>
          </div>

          {!element && (
            <p className="text-xs text-muted-foreground text-center py-4">
              {isAr ? 'اختر عنصرًا لتعديل خصائصه' : 'Select an element to edit its properties'}
            </p>
          )}

          {element && (
            <>
              <Separator />

              {/* Position & Size */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {isAr ? 'الموضع والحجم' : 'Position & Size'}
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-[10px]">X</Label>
                    <Input
                      type="number"
                      value={element.x}
                      onChange={(e) => onUpdateElement(element.id, { x: Number(e.target.value) })}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">Y</Label>
                    <Input
                      type="number"
                      value={element.y}
                      onChange={(e) => onUpdateElement(element.id, { y: Number(e.target.value) })}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">W</Label>
                    <Input
                      type="number"
                      value={element.width}
                      onChange={(e) => onUpdateElement(element.id, { width: Number(e.target.value) })}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">H</Label>
                    <Input
                      type="number"
                      value={element.height}
                      onChange={(e) => onUpdateElement(element.id, { height: Number(e.target.value) })}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Text-specific Properties */}
              {element.type === 'text' && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {isAr ? 'النص' : 'Text'}
                    </Label>

                    {/* Content */}
                    <div>
                      <Label className="text-[10px]">{isAr ? 'المحتوى' : 'Content'}</Label>
                      {element.content.startsWith('{{') ? (
                        <Select
                          value={element.content}
                          onValueChange={(v) => onUpdateElement(element.id, { content: v })}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DYNAMIC_VARIABLES.map((v) => (
                              <SelectItem key={v.key} value={v.key} className="text-xs">
                                {isAr ? v.labelAr : v.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={element.content}
                          onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
                          className="h-7 text-xs"
                          dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        />
                      )}
                    </div>

                    {/* Font Family */}
                    <div>
                      <Label className="text-[10px]">{isAr ? 'الخط' : 'Font'}</Label>
                      <Select
                        value={element.fontFamily}
                        onValueChange={(v) => onUpdateElement(element.id, { fontFamily: v as FontFamily })}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(FONT_DISPLAY_NAMES) as [FontFamily, string][]).map(
                            ([key, name]) => (
                              <SelectItem key={key} value={key} className="text-xs">
                                {name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Font Size */}
                    <div>
                      <Label className="text-[10px]">{isAr ? 'الحجم' : 'Size'}</Label>
                      <Input
                        type="number"
                        min={8}
                        max={120}
                        value={element.fontSize}
                        onChange={(e) => onUpdateElement(element.id, { fontSize: Number(e.target.value) })}
                        className="h-7 text-xs"
                      />
                    </div>

                    {/* Font Weight */}
                    <div>
                      <Label className="text-[10px]">{isAr ? 'الوزن' : 'Weight'}</Label>
                      <Select
                        value={element.fontWeight}
                        onValueChange={(v) => onUpdateElement(element.id, { fontWeight: v as 'normal' | 'bold' })}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal" className="text-xs">
                            {isAr ? 'عادي' : 'Normal'}
                          </SelectItem>
                          <SelectItem value="bold" className="text-xs">
                            {isAr ? 'غامق' : 'Bold'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color */}
                    <div>
                      <Label className="text-[10px]">{isAr ? 'اللون' : 'Color'}</Label>
                      <Input
                        type="color"
                        value={element.color}
                        onChange={(e) => onUpdateElement(element.id, { color: e.target.value })}
                        className="h-7 cursor-pointer"
                      />
                    </div>

                    {/* Text Align */}
                    <div>
                      <Label className="text-[10px]">{isAr ? 'المحاذاة' : 'Align'}</Label>
                      <div className="flex gap-1 mt-1">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <Button
                            key={align}
                            variant={element.textAlign === align ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1 h-7 text-[10px]"
                            onClick={() => onUpdateElement(element.id, { textAlign: align })}
                          >
                            {align === 'left' ? (isAr ? 'يسار' : 'L') : align === 'center' ? (isAr ? 'وسط' : 'C') : (isAr ? 'يمين' : 'R')}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Image-specific Properties */}
              {element.type === 'image' && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {isAr ? 'الصورة' : 'Image'}
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-3 w-3 mr-1" />
                      {element.src ? (isAr ? 'تغيير الصورة' : 'Change Image') : (isAr ? 'رفع صورة' : 'Upload Image')}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <div>
                      <Label className="text-[10px]">{isAr ? 'الملاءمة' : 'Fit'}</Label>
                      <Select
                        value={element.objectFit}
                        onValueChange={(v) => onUpdateElement(element.id, { objectFit: v as 'contain' | 'cover' })}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contain" className="text-xs">Contain</SelectItem>
                          <SelectItem value="cover" className="text-xs">Cover</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Delete */}
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-xs h-8"
                onClick={() => onRemoveElement(element.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {isAr ? 'حذف العنصر' : 'Delete Element'}
              </Button>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
