'use client';

import { type TableBlock } from '@/types/authoring';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Table2 as TableIcon } from 'lucide-react';

interface TableBlockEditorProps {
  block: TableBlock;
  onChange: (data: Partial<TableBlock['data']>) => void;
}

export function TableBlockEditor({ block, onChange }: TableBlockEditorProps) {
  const { data } = block;

  // --- Column helpers ---
  const addColumn = () => {
    const newHeaders = [...data.headers, ''];
    const newRows = data.rows.map((row) => [...row, '']);
    onChange({ headers: newHeaders, rows: newRows });
  };

  const removeColumn = (colIndex: number) => {
    const newHeaders = data.headers.filter((_, i) => i !== colIndex);
    const newRows = data.rows.map((row) => row.filter((_, i) => i !== colIndex));
    onChange({ headers: newHeaders, rows: newRows });
  };

  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = data.headers.map((h, i) => (i === colIndex ? value : h));
    onChange({ headers: newHeaders });
  };

  // --- Row helpers ---
  const addRow = () => {
    const newRow = data.headers.map(() => '');
    onChange({ rows: [...data.rows, newRow] });
  };

  const removeRow = (rowIndex: number) => {
    onChange({ rows: data.rows.filter((_, i) => i !== rowIndex) });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = data.rows.map((row, ri) =>
      ri === rowIndex
        ? row.map((cell, ci) => (ci === colIndex ? value : cell))
        : row
    );
    onChange({ rows: newRows });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <TableIcon className="h-4 w-4" />
          Table Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Headers */}
        <div className="space-y-2">
          <Label>Column Headers</Label>
          <div className="space-y-2">
            {data.headers.map((header, colIndex) => (
              <div key={colIndex} className="flex items-center gap-2">
                <Input
                  value={header}
                  onChange={(e) => updateHeader(colIndex, e.target.value)}
                  placeholder={`Column ${colIndex + 1}`}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeColumn(colIndex)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={data.headers.length <= 1}
                  title="Remove column"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addColumn}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Column
          </Button>
        </div>

        {/* Rows */}
        <div className="space-y-3 border-t border-border pt-4">
          <Label>Rows</Label>
          <div className="space-y-3">
            {data.rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Row {rowIndex + 1}
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(rowIndex)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    disabled={data.rows.length <= 1}
                    title="Remove row"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${data.headers.length}, 1fr)` }}>
                  {row.map((cell, colIndex) => (
                    <div key={colIndex} className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {data.headers[colIndex] || `Col ${colIndex + 1}`}
                      </span>
                      <Input
                        value={cell}
                        onChange={(e) =>
                          updateCell(rowIndex, colIndex, e.target.value)
                        }
                        placeholder="Cell value"
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addRow}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </div>

        {/* Toggles & Caption */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`table-header-${block.id}`}
              className="cursor-pointer"
            >
              Has Header Row
            </Label>
            <Switch
              id={`table-header-${block.id}`}
              checked={data.has_header_row}
              onCheckedChange={(checked) =>
                onChange({ has_header_row: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`table-striped-${block.id}`}
              className="cursor-pointer"
            >
              Striped Rows
            </Label>
            <Switch
              id={`table-striped-${block.id}`}
              checked={data.striped}
              onCheckedChange={(checked) =>
                onChange({ striped: checked })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`table-caption-${block.id}`}>Caption (optional)</Label>
            <Textarea
              id={`table-caption-${block.id}`}
              value={data.caption ?? ''}
              onChange={(e) =>
                onChange({ caption: e.target.value || undefined })
              }
              placeholder="Table caption"
              className="min-h-[60px] resize-y"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
