"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { createClient } from "@/utils/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/hooks/redux.hook";
import type { CertificateTemplateJSON } from "@/components/certificate-builder/types";

const CertificateBuilder = dynamic(
    () => import("@/components/certificate-builder/CertificateBuilder"),
    { ssr: false }
);

export default function Certificate() {
    const { toast } = useToast();
    const { settings, loading: loadingTheme } = useAppSelector((state) => state.organization);

    const [existingTemplate, setExistingTemplate] = useState<CertificateTemplateJSON | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [builderOpen, setBuilderOpen] = useState(false);

    const fetchTemplate = useCallback(async () => {
        setIsLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
            .from("organization_settings")
            .select("certificate_template_json")
            .eq("organization_id", settings.organization_id)
            .single();

        if (!error && data?.certificate_template_json) {
            setExistingTemplate(data.certificate_template_json as CertificateTemplateJSON);
        }

        setIsLoading(false);
    }, [settings.organization_id]);

    useEffect(() => {
        if (settings.organization_id) {
            fetchTemplate();
        }
    }, [fetchTemplate, settings.organization_id]);

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
                        <CardTitle>Certificate Settings</CardTitle>
                        <CardDescription>
                            Design and customize your certificate template.
                        </CardDescription>
                    </div>
                    <Button
                        className="flex gap-2 h-9"
                        onClick={() => setBuilderOpen(true)}
                    >
                        <Pencil className="w-4 h-4" />
                        {existingTemplate ? "Edit Template" : "Build Template"}
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-[200px] w-full" />
                    ) : existingTemplate ? (
                        <div className="space-y-3">
                            <Label className="text-sm text-muted-foreground">
                                Current template
                            </Label>
                            <div
                                className="relative border rounded-lg overflow-hidden bg-muted/30"
                                style={{ aspectRatio: '842/595', maxWidth: 500 }}
                            >
                                <div
                                    className="w-full h-full"
                                    style={{
                                        backgroundColor: existingTemplate.canvas.backgroundColor,
                                        backgroundImage: existingTemplate.canvas.backgroundImage
                                            ? `url(${existingTemplate.canvas.backgroundImage})`
                                            : undefined,
                                        backgroundSize: 'cover',
                                    }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded">
                                            {existingTemplate.lang === 'ar' ? 'عربي' : 'English'} — {existingTemplate.elements.length} elements
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                No certificate template configured yet. Build one to start issuing certificates.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setBuilderOpen(true)}
                            >
                                Build Your First Template
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <CertificateBuilder
                open={builderOpen}
                onOpenChange={(open) => {
                    setBuilderOpen(open);
                    if (!open) fetchTemplate();
                }}
                initialTemplate={existingTemplate}
                organizationId={settings.organization_id}
            />
        </>
    );
}
