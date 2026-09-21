import { useRef } from "react";
import { Camera, Trash2 } from "lucide-react";
import Input from "@/components/common/Input";
import { isValidUrl, type PersonalInfo } from "@/lib/resume-types";
import { useToast } from "@/context/ToastContext";

interface Props {
  value: PersonalInfo;
  onChange: (v: PersonalInfo) => void;
}

/** Resizes an uploaded image to a small square data URL so it stays within payload limits. */
function fileToDataUrl(file: File, size = 240): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PersonalInfoForm({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const set = (k: keyof PersonalInfo) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [k]: e.target.value });

  const emailError = value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email) ? "Enter a valid email" : undefined;
  const urlErr = (v: string) => (v && !isValidUrl(v) ? "Enter a valid URL" : undefined);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be smaller than 5MB.");
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange({ ...value, photo: dataUrl });
    } catch {
      toast.error("Could not read that image.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-100 border overflow-hidden grid place-items-center text-gray-400" style={{ borderColor: "var(--color-border)" }}>
          {value.photo ? <img src={value.photo} alt="Profile preview" className="h-full w-full object-cover" /> : <Camera size={22} />}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Profile Photo <span className="text-gray-400 font-normal">(optional)</span></span>
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
              <Camera size={14} /> Upload
            </button>
            {value.photo && (
              <button type="button" className="btn btn-ghost btn-sm text-red-600" onClick={() => onChange({ ...value, photo: "" })}>
                <Trash2 size={14} /> Remove
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} aria-label="Upload profile photo" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full Name" required placeholder="Sumit Bhoyar" value={value.fullName} onChange={set("fullName")} name="fullName" />
        <Input label="Professional Title" placeholder="B.Tech CSE Student | Full Stack Developer" value={value.title} onChange={set("title")} name="title" />
        <Input label="Email" type="email" placeholder="you@example.com" value={value.email} onChange={set("email")} error={emailError} name="pi-email" />
        <Input label="Phone" placeholder="+91 98765 43210" value={value.phone} onChange={set("phone")} name="phone" />
        <Input label="Location" placeholder="Nagpur, Maharashtra" value={value.location} onChange={set("location")} name="location" className="sm:col-span-2" />
        <Input label="LinkedIn" placeholder="linkedin.com/in/username" value={value.linkedin} onChange={set("linkedin")} error={urlErr(value.linkedin)} name="linkedin" />
        <Input label="GitHub" placeholder="github.com/username" value={value.github} onChange={set("github")} error={urlErr(value.github)} name="github" />
        <Input label="Portfolio" placeholder="yourname.dev" value={value.portfolio} onChange={set("portfolio")} error={urlErr(value.portfolio)} name="portfolio" className="sm:col-span-2" />
      </div>
    </div>
  );
}
