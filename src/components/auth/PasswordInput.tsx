import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function PasswordInput({ label, error, id, ...rest }: Props) {
  const [show, setShow] = useState(false);
  const inputId = id ?? rest.name ?? "password";
  return (
    <div>
      <label htmlFor={inputId} className="label">
        {label}
        <span className="req">*</span>
      </label>
      <div className="relative">
        <input id={inputId} type={show ? "text" : "password"} className={`input pr-11 ${error ? "has-error" : ""}`} {...rest} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
