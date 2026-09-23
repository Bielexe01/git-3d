import { useId, useRef, type ReactNode } from "react";

const control =
  "mt-2 w-full border-b border-bone/20 bg-transparent py-3 text-lg text-bone outline-none placeholder:text-bone/30 focus:border-brass";

export function Block({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="border-t border-bone/15 py-10">
      <h2 className="font-display text-3xl tracking-tight md:text-4xl">{title}</h2>
      {hint ? <p className="mt-3 max-w-[52ch] text-sm text-bone-dim">{hint}</p> : null}
      <div className="mt-8 grid gap-8">{children}</div>
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  name,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  placeholder?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="block">
      <span className="block text-xs tracking-[0.16em] text-brass">{label.toUpperCase()}</span>
      <input
        id={id}
        data-field={name}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className={control}
      />
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  name,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  placeholder?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="block">
      <span className="block text-xs tracking-[0.16em] text-brass">{label.toUpperCase()}</span>
      <textarea
        id={id}
        data-field={name}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className={`${control} resize-y leading-relaxed`}
      />
    </label>
  );
}

export function FileButton({
  label,
  accept,
  name,
  disabled,
  onPick,
}: {
  label: string;
  accept: string;
  name: string;
  disabled?: boolean;
  onPick: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        className="inline-flex border border-bone/25 px-4 py-2 text-sm tracking-[0.12em] disabled:opacity-40"
        onClick={() => ref.current?.click()}
      >
        {label}
      </button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        data-field={name}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onPick(file);
        }}
      />
    </>
  );
}

export function TextButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="text-sm text-bone-dim disabled:opacity-30">
      {children}
    </button>
  );
}

export function LinkHint({ value }: { value: string }) {
  if (!value.trim() || /^https?:\/\/\S+$/i.test(value.trim())) return null;
  return <p className="text-sm text-brass">Comece o link com https://</p>;
}
