"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase";
import { CertificateTemplate } from "@/app/dashboard/@org_admin/organization-settings/types";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/hooks/redux.hook";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { capitalize, upperCase } from "lodash";
import EditCertificate from "./edit-certificate";

const CertificateSkeleton = dynamic(() => import("./skeletons/CertificateSkelton"), { ssr: false });

export default function Certificate() {
    const { toast } = useToast();
    const { settings, loading: loadingTheme } = useAppSelector((state) => state.organization);

    const [certificates, setCertificates] = useState<CertificateTemplate[]>([]);
    const [selectedCertificate, setSelectedCertificate] = useState<CertificateTemplate>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedCertificateToEdit, setSelectedCertificateToEdit] = useState<number | undefined>();

    const fetchCertificates = useCallback(async () => {
        const supabase = createClient();
        setIsLoading(true);

        const { data, error } = await supabase.rpc("get_certificates");

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        setCertificates(data);

        // Check if a certificate is already selected from settings
        const selectedCert = data.find(
            (e: CertificateTemplate) => e.id === settings.certificate?.certificateTemplate
        );

        // If no certificate is selected, use the first one as default
        if (!selectedCert && data.length > 0) {
            setSelectedCertificate(data[0]);
            await updateCertificateInDB(data[0].id); // Update DB to reflect the default selection
        } else {
            setSelectedCertificate(selectedCert);
        }

        setIsLoading(false);
    }, [settings.certificate?.certificateTemplate, toast]);


    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    const updateCertificateInDB = async (certificateId: number | null) => {
        const supabase = createClient();
        const { error } = await supabase.from("organization_settings").update({
            certificate_template: certificateId,
        }).eq('organization_id', settings.organization_id);

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Certificate updated successfully",
                variant: "default",
            });
        }
    };

    const handleEditClick = (itemId: number) => {
        setSelectedCertificateToEdit((prev) => (prev === itemId ? undefined : itemId));
    };

    const handleCertificateClick = async (item: CertificateTemplate) => {
        if (selectedCertificate?.id === item.id) {
            setSelectedCertificate(undefined);
            await updateCertificateInDB(null);
        } else {
            setSelectedCertificate(item);
            await updateCertificateInDB(item.id);
        }
    };

    if (loadingTheme) {
        return <CertificateSkeleton />;
    }

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <div>
                    <CardTitle>Certificate Settings</CardTitle>
                    <CardDescription>Select and customize your certificate design.</CardDescription>
                </div>
                <EditCertificate selected={selectedCertificate} />
            </CardHeader>
            <CardContent className="grid max-h-[400px] overflow-auto">
                <Label htmlFor="design" className="text-base">
                    Certificate Design
                </Label>
                <div className="flex gap-4 mt-2 overflow-auto" id="design">
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, index) => <Skeleton key={index} className="w-[180px] h-[180px]" />)
                    ) : (
                        certificates.map((item) => {
                            const isActive = item.id === selectedCertificate?.id;
                            const isEditable = item.id === selectedCertificateToEdit;

                            return (
                                <div key={item.id} className={`relative rounded-md mt-4 ${isActive ? "border-2 border-primary" : ""}`}>
                                    {isActive && (
                                        <Badge className="absolute w-6 h-6 -right-3 -top-3 p-1">
                                            <Check />
                                        </Badge>
                                    )}
                                    <Button variant="secondary" className="w-[180px] h-[180px] p-0" onClick={() => handleEditClick(item.id)}>
                                        {isEditable ? (
                                            <div className="flex flex-col gap-2">
                                                <Button onClick={() => handleCertificateClick(item)}>
                                                    {isActive ? "Unselect This" : "Use This"}
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" onClick={(e) => e.stopPropagation()}>
                                                            Preview
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                        <DialogHeader>
                                                            <DialogTitle>{capitalize(upperCase(item.name))}</DialogTitle>
                                                        </DialogHeader>
                                                        <Image alt={item.name} src={item.thumbnail} width={400} height={400} />
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        ) : (
                                            <Image
                                                alt={item.name}
                                                src={isActive ? settings.certificate?.certificatePreview ?? item.thumbnail : item.thumbnail}
                                                width={180}
                                                height={180}
                                                className="object-contain w-full h-full"
                                            />
                                        )}
                                    </Button>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
