export default function PdfPreviewer({ pdfLink }: any) {
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      {!pdfLink.includes("provided") ? (
        <iframe
          src={pdfLink}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        />
      ) : (
        <p>Certificate not found.</p>
      )}
    </div>
  );
}
