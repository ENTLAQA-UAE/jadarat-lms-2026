"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Copy, Trash2, Star } from "lucide-react";
import { createClient } from "@/utils/supabase";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/hooks/redux.hook";
import type { CertificateTemplateJSON } from "@/components/certificate-builder/types";

const CertificateBuilder = dynamic(
    () => import("@/components/certificate-builder/CertificateBuilder"),
    { ssr: false }
);

interface TemplateRecord {
    id: number;
    name: string;
    name_ar: string | null;
    template_json: CertificateTemplateJSON;
    is_default: boolean;
    created_at: string;
    updated_at: string | null;
}

export default function Certificate() {
    const { settings, loading: loadingTheme } = useAppSelector((state) => state.organization);
    const { user } = useAppSelector((state) => state.user);
    const organizationId = settings.organization_id || user.organization_id;

    const [templates, setTemplates] = useState<TemplateRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [builderOpen, setBuilderOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TemplateRecord | null>(null);

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase.rpc('get_certificate_templates');

        if (!error && data) {
            setTemplates(data as TemplateRecord[]);
        } else {
            // Fallback: load from organization_settings for backward compatibility
            const { data: orgData } = await supabase
                .from("organization_settings")
                .select("certificate_template_json")
                .eq("organization_id", organizationId)
                .single();

            if (orgData?.certificate_template_json) {
                setTemplates([{
                    id: 0,
                    name: 'Default Template',
                    name_ar: 'القالب الافتراضي',
                    template_json: orgData.certificate_template_json as CertificateTemplateJSON,
                    is_default: true,
                    created_at: new Date().toISOString(),
                    updated_at: null,
                }]);
            }
        }

        setIsLoading(false);
    }, [organizationId]);

    useEffect(() => {
        if (organizationId) {
            fetchTemplates();
        }
    }, [fetchTemplates, organizationId]);

    const handleCreateNew = () => {
        setEditingTemplate(null);
        setBuilderOpen(true);
    };

    const handleEdit = (template: TemplateRecord) => {
        setEditingTemplate(template);
        setBuilderOpen(true);
    };

    const handleClone = async (template: TemplateRecord) => {
        const supabase = createClient();
        const { error } = await supabase.rpc('upsert_certificate_template', {
            template_name: `${template.name} (Copy)`,
            template_name_ar: template.name_ar ? `${template.name_ar} (نسخة)` : null,
            template_json: template.template_json,
            set_default: false,
        });

        if (error) {
            toast.error('Failed to clone template');
        } else {
            toast.success('Template cloned successfully');
            fetchTemplates();
        }
    };

    const handleDelete = async (template: TemplateRecord) => {
        if (template.is_default) {
            toast.error('Cannot delete the default template');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this template? This cannot be undone.')) {
            return;
        }

        const supabase = createClient();
        const { error } = await supabase.rpc('delete_certificate_template', {
            template_id: template.id,
        });

        if (error) {
            toast.error('Failed to delete template');
        } else {
            toast.success('Template deleted');
            fetchTemplates();
        }
    };

    const handleSetDefault = async (template: TemplateRecord) => {
        const supabase = createClient();
        const { error } = await supabase.rpc('upsert_certificate_template', {
            template_id: template.id,
            template_name: template.name,
            template_name_ar: template.name_ar,
            template_json: template.template_json,
            set_default: true,
        });

        if (error) {
            toast.error('Failed to set default template');
        } else {
            toast.success('Default template updated');
            fetchTemplates();
        }
    };

    if (loadingTheme) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-72 mt-1" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Certificate Templates</CardTitle>
                        <CardDescription>
                            Manage your certificate templates. Set a default template or assign specific templates to courses.
                        </CardDescription>
                    </div>
                    <Button
                        className="flex gap-2 h-9"
                        onClick={handleCreateNew}
                    >
                        <Plus className="w-4 h-4" />
                        New Template
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
                            ))}
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                No certificate templates configured yet. Create one to start issuing certificates.
                            </p>
                            <Button variant="outline" onClick={handleCreateNew}>
                                Build Your First Template
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="border rounded-lg overflow-hidden group hover:border-primary/50 transition-colors"
                                >
                                    {/* Template Preview */}
                                    <div
                                        className="relative aspect-[842/595] bg-muted/30 cursor-pointer"
                                        onClick={() => handleEdit(template)}
                                        style={{
                                            backgroundColor: template.template_json.canvas.backgroundColor,
                                            backgroundImage: template.template_json.canvas.backgroundImage
                                                ? `url(${template.template_json.canvas.backgroundImage})`
                                                : undefined,
                                            backgroundSize: 'cover',
                                        }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                            <Button variant="secondary" size="sm" className="gap-1.5">
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </Button>
                                        </div>
                                        {template.is_default && (
                                            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                                                Default
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Template Info */}
                                    <div className="p-3 border-t">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium truncate">{template.name}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {template.template_json.lang === 'ar' ? 'عربي' : 'English'} — {template.template_json.elements.length} elements
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                {!template.is_default && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0"
                                                        onClick={() => handleSetDefault(template)}
                                                        title="Set as default"
                                                    >
                                                        <Star className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    onClick={() => handleClone(template)}
                                                    title="Clone template"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                </Button>
                                                {!template.is_default && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(template)}
                                                        title="Delete template"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <CertificateBuilder
                open={builderOpen}
                onOpenChange={(open) => {
                    setBuilderOpen(open);
                    if (!open) fetchTemplates();
                }}
                initialTemplate={editingTemplate?.template_json}
                organizationId={organizationId}
                templateId={editingTemplate?.id}
                templateName={editingTemplate?.name}
                onSaved={() => fetchTemplates()}
            />
        </>
    );
}
