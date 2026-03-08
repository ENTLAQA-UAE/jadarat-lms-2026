'use client';

import { useState } from 'react';
import { type TabsBlock } from '@/types/authoring';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TiptapEditor } from './TiptapEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LayoutList, Plus, Trash2 } from 'lucide-react';

interface TabsBlockEditorProps {
  block: TabsBlock;
  onChange: (data: Partial<TabsBlock['data']>) => void;
}

export function TabsBlockEditor({ block, onChange }: TabsBlockEditorProps) {
  const { data } = block;
  const [previewActiveTab, setPreviewActiveTab] = useState<string>(
    data.tabs[0]?.id ?? ''
  );

  const addTab = () => {
    const newTab = {
      id: uuidv4(),
      label: '',
      content: '',
    };
    onChange({ tabs: [...data.tabs, newTab] });
  };

  const removeTab = (tabId: string) => {
    const newTabs = data.tabs.filter((tab) => tab.id !== tabId);
    onChange({ tabs: newTabs });
    if (previewActiveTab === tabId && newTabs.length > 0) {
      setPreviewActiveTab(newTabs[0].id);
    }
  };

  const updateTab = (
    tabId: string,
    field: 'label' | 'content',
    value: string
  ) => {
    onChange({
      tabs: data.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, [field]: value } : tab
      ),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <LayoutList className="h-4 w-4" />
          Tabs Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs editor */}
        <div className="space-y-3">
          {data.tabs.map((tab, index) => (
            <div
              key={tab.id}
              className="rounded-lg border border-border bg-muted/20 p-3"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Tab {index + 1}
                </span>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTab(tab.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  disabled={data.tabs.length <= 1}
                  title="Remove tab"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor={`tab-label-${tab.id}`} className="text-xs">
                    Label
                  </Label>
                  <Input
                    id={`tab-label-${tab.id}`}
                    value={tab.label}
                    onChange={(e) =>
                      updateTab(tab.id, 'label', e.target.value)
                    }
                    placeholder="Tab label"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Content</Label>
                  <TiptapEditor
                    content={tab.content}
                    onChange={(html) => updateTab(tab.id, 'content', html)}
                    placeholder="Write tab content..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add tab button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addTab}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Tab
        </Button>

        {/* Style selector */}
        <div className="space-y-2 border-t border-border pt-4">
          <Label>Tab Style</Label>
          <Select
            value={data.style}
            onValueChange={(value: 'horizontal' | 'vertical') =>
              onChange({ style: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tab preview */}
        {data.tabs.length > 0 && (
          <div className="space-y-2 border-t border-border pt-4">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div
              className={`overflow-hidden rounded-lg border border-border ${
                data.style === 'vertical' ? 'flex' : ''
              }`}
            >
              {/* Tab headers */}
              <div
                className={`bg-muted/50 ${
                  data.style === 'vertical'
                    ? 'flex flex-col border-r border-border'
                    : 'flex border-b border-border'
                }`}
              >
                {data.tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPreviewActiveTab(tab.id)}
                    className={`px-3 py-2 text-xs font-medium transition-colors ${
                      previewActiveTab === tab.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    } ${
                      data.style === 'vertical'
                        ? 'border-b border-border text-left last:border-b-0'
                        : ''
                    }`}
                  >
                    {tab.label || `Tab ${data.tabs.indexOf(tab) + 1}`}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 p-3">
                <p className="text-xs text-muted-foreground">
                  {data.tabs.find((t) => t.id === previewActiveTab)?.content ||
                    'No content'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
