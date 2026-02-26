import dynamic from "next/dynamic";

const CertificateSettings = dynamic(
  () => import("@/components/app/organizationSettings/certificates"),
  { ssr: false }
);

export default function CertificateSettingsPage() {
  return (
    <div className="w-full h-full p-4 sm:p-6">
      <CertificateSettings />
    </div>
  );
}
