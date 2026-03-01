'use client';

import { useState } from 'react';
import { Download, Loader2, FileArchive, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEditorStore } from '@/stores/editor.store';
import {
  generateScormPackage,
  type ScormVersion,
} from '@/lib/scorm/package-generator';

// ============================================================
// PROPS
// ============================================================

interface ExportDialogProps {
  courseId: number;
  courseTitle: string;
  courseDescription: string;
}

// ============================================================
// HELPERS
// ============================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// ============================================================
// EXPORT DIALOG COMPONENT
// ============================================================

export function ExportDialog({
  courseId,
  courseTitle,
  courseDescription,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ScormVersion>('1.2');
  const [isExporting, setIsExporting] = useState(false);

  const content = useEditorStore((s) => s.content);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const result = await generateScormPackage({
        courseId,
        courseTitle,
        courseDescription,
        content,
        version: selectedVersion,
        organizationId: 0,
        authorName: '',
      });

      // Create a download link and trigger browser download
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename ?? `${courseTitle.replace(/\s+/g, '_')}_SCORM_${selectedVersion}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Export complete: ${result.fileCount} files, ${formatFileSize(result.blob.size)}`,
        { icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
      );

      setOpen(false);
    } catch (err) {
      console.error('SCORM export failed:', err);
      toast.error(
        err instanceof Error
          ? `Export failed: ${err.message}`
          : 'Failed to export SCORM package',
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="flex items-center gap-2">
          <FileArchive className="h-5 w-5 text-muted-foreground" />
          Export Course
        </DialogTitle>
        <DialogDescription>
          Export your course as a SCORM package (.zip) that can be uploaded to
          any SCORM-compatible LMS.
        </DialogDescription>

        <div className="space-y-6 pt-2">
          {/* SCORM Version selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">SCORM Version</Label>
            <RadioGroup
              value={selectedVersion}
              onValueChange={(value) =>
                setSelectedVersion(value as ScormVersion)
              }
              className="grid gap-3"
            >
              <label
                htmlFor="scorm-12"
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5"
              >
                <RadioGroupItem value="1.2" id="scorm-12" />
                <div>
                  <p className="text-sm font-medium">SCORM 1.2</p>
                  <p className="text-xs text-muted-foreground">
                    Widest LMS compatibility. Recommended for most use cases.
                  </p>
                </div>
              </label>

              <label
                htmlFor="scorm-2004"
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/50 has-[data-state=checked]:border-primary has-[data-state=checked]:bg-primary/5"
              >
                <RadioGroupItem value="2004" id="scorm-2004" />
                <div>
                  <p className="text-sm font-medium">SCORM 2004</p>
                  <p className="text-xs text-muted-foreground">
                    Advanced sequencing and navigation. Requires SCORM 2004 LMS
                    support.
                  </p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Export button */}
          <div className="flex justify-end">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="gap-1.5"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting ? 'Generating...' : 'Export SCORM Package'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
