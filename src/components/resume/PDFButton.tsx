import { useState } from "react";
import { Download, Printer } from "lucide-react";
import Button from "@/components/common/Button";
import { useToast } from "@/context/ToastContext";
import { exportResumePdf, safeFilename } from "@/utils/pdf";
import { EXPORT_ROOT_ID } from "./ResumePreview";

interface Props {
  filename: string;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "dark";
  showPrint?: boolean;
}

export default function PDFButton({ filename, size = "md", variant = "primary", showPrint = true }: Props) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const download = async () => {
    setLoading(true);
    try {
      await exportResumePdf(safeFilename(filename), EXPORT_ROOT_ID);
      toast.success("PDF downloaded successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate PDF. Try Print instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={download} loading={loading} size={size} variant={variant} icon={<Download size={16} />}>
        {loading ? "Generating..." : "Download PDF"}
      </Button>
      {showPrint && (
        <Button onClick={() => window.print()} size={size} variant="secondary" icon={<Printer size={16} />}>
          <span className="hidden sm:inline">Print Resume</span>
          <span className="sm:hidden">Print</span>
        </Button>
      )}
    </div>
  );
}
