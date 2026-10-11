"use client";

// Reusable Google-Ads-styled form primitives. Thin wrappers over the CSS in
// ads-simulator.css so the screens stay declarative.
import React from "react";
import { Icon, type IconName } from "./icons";

export const ValidationContext = React.createContext<Record<string, string>>({});
const FieldContext = React.createContext<{ id: string; label?: string; validationKey?: string } | null>(null);
export function FieldError({ name }: { name: string }) {
  const errors = React.useContext(ValidationContext);
  return errors[name] ? <div className="gads-field-error" role="alert" data-error-field={name}>{errors[name]}</div> : null;
}

export function Button({
  variant = "filled",
  size,
  icon,
  children,
  className = "",
  ...rest
}: {
  variant?: "filled" | "text" | "outline";
  size?: "sm";
  icon?: IconName;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = [
    "gads-btn",
    variant === "text" ? "text" : variant === "outline" ? "outline" : "",
    size === "sm" ? "sm" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={cls} {...rest}>
      {icon ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name={icon} size={18} /> {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function AddLink({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="gads-add-link" {...rest}>
      <Icon name="add" size={18} />
      {children}
    </button>
  );
}

export function Card({
  title,
  hint,
  children,
  right,
}: {
  title?: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="gads-card">
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            {title && <h3>{title}</h3>}
            {hint && <p className="hint">{hint}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function Field({ label, help, children, validationKey }: {
  label?: string; help?: string; children: React.ReactNode; validationKey?: string;
}) {
  const id = React.useId();
  return <FieldContext.Provider value={{ id, label, validationKey }}><div className="gads-field">
    {label && <label className="gads-label" htmlFor={id}>{label}</label>}
    {children}{help && <div className="gads-help">{help}</div>}
  </div></FieldContext.Provider>;
}

export function TextInput({ value, onChange, maxLength, prefix, className = "", validationKey, label, placeholder: _placeholder, ...rest }: {
  value: string; onChange: (v: string) => void; maxLength?: number; prefix?: string; validationKey?: string; label?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "prefix">) {
  const field = React.useContext(FieldContext);
  const errors = React.useContext(ValidationContext);
  const ownId = React.useId();
  const id = rest.id || field?.id || ownId;
  const error = errors[validationKey || field?.validationKey || ""];
  const input = <input {...rest} id={id} aria-label={rest["aria-label"] || label || field?.label}
    aria-invalid={!!error || rest["aria-invalid"]} aria-describedby={error ? `${ownId}-error` : undefined}
    className={`gads-input ${className}`} value={value} maxLength={maxLength} onChange={e => onChange(e.target.value)} />;
  return <div className="gads-form-control">
    {label && <label className="gads-label" htmlFor={id}>{label}</label>}
    {prefix ? <div className="gads-prefix"><span className="px">{prefix}</span>{input}</div> : <div className="gads-input-wrap">{input}
      {maxLength != null && <span className={`gads-input-count ${value.length > maxLength ? "over" : ""}`}>{value.length}/{maxLength}</span>}
    </div>}
    {error && <div className="gads-field-error" id={`${ownId}-error`} role="alert">{error}</div>}
  </div>;
}

export function TextArea({ value, onChange, maxLength, validationKey, label, placeholder: _placeholder, ...rest }: {
  value: string; onChange: (v: string) => void; maxLength?: number; validationKey?: string; label?: string;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value">) {
  const field = React.useContext(FieldContext);
  const errors = React.useContext(ValidationContext);
  const ownId = React.useId();
  const id = rest.id || field?.id || ownId;
  const error = errors[validationKey || field?.validationKey || ""];
  return <div className="gads-form-control">
    {label && <label className="gads-label" htmlFor={id}>{label}</label>}
    <div className="gads-input-wrap"><textarea {...rest} id={id} aria-label={rest["aria-label"] || label || field?.label}
      aria-invalid={!!error} aria-describedby={error ? `${ownId}-error` : undefined}
      className="gads-textarea" value={value} maxLength={maxLength} onChange={e => onChange(e.target.value)} />
      {maxLength != null && <span className={`gads-input-count ${value.length > maxLength ? "over" : ""}`} style={{ top: "auto", bottom: 8, transform: "none" }}>{value.length}/{maxLength}</span>}
    </div>{error && <div className="gads-field-error" id={`${ownId}-error`} role="alert">{error}</div>}
  </div>;
}

export function Select({
  value,
  onChange,
  options,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[] | string[];
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value">) {
  const field = React.useContext(FieldContext);
  const opts = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
  return (
    <select
      id={field?.id}
      aria-label={field?.label}
      className="gads-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    >
      {opts.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <span
      className={`gads-switch ${on ? "on" : ""}`}
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onClick={() => onChange(!on)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange(!on);
        }
      }}
    >
      <span className="track">
        <span className="knob" />
      </span>
      {label && <span>{label}</span>}
    </span>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  sub?: string;
}) {
  return (
    <label className="gads-check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        {label}
        {sub && <div className="sub">{sub}</div>}
      </span>
    </label>
  );
}

export function Radio({
  checked,
  onChange,
  label,
  sub,
  name,
}: {
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
  sub?: string;
  name: string;
}) {
  return (
    <label className="gads-radio">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span>
        {label}
        {sub && <div className="sub">{sub}</div>}
      </span>
    </label>
  );
}

export function OptionCard({
  icon,
  title,
  desc,
  selected,
  disabled,
  onClick,
}: {
  icon?: IconName;
  title: string;
  desc: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`gads-optcard ${selected ? "selected" : ""} ${
        disabled ? "disabled" : ""
      }`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {icon && (
        <span className="oc-ic">
          <Icon name={icon} size={22} />
        </span>
      )}
      <span style={{ flex: 1 }}>
        <span className="oc-t">
          {title}
          {disabled && (
            <span className="gads-badge" style={{ marginLeft: 8 }}>
              Not in this simulator
            </span>
          )}
        </span>
        <span className="oc-d">{desc}</span>
      </span>
      {selected && (
        <span className="oc-check">
          <Icon name="checkCircle" size={22} />
        </span>
      )}
    </button>
  );
}

export function InlineNote({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant?: "warn";
}) {
  return (
    <div className={`gads-inline-note ${variant === "warn" ? "warn" : ""}`}>
      <Icon name="info" size={18} />
      <div>{children}</div>
    </div>
  );
}

// Compact inline chip-input: type + Enter to add tokens.
export function ChipInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = React.useState("");
  const commit = () => {
    const parts = draft
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) onChange([...value, ...parts]);
    setDraft("");
  };
  return (
    <div>
      <input
        className="gads-input"
        value={draft}
        aria-label={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
      />
      {value.length > 0 && (
        <div className="gads-chips">
          {value.map((v, i) => (
            <span className="gads-chip" key={`${v}-${i}`}>
              {v}
              <button
                className="x"
                aria-label={`Remove ${v}`}
                onClick={() => onChange(value.filter((_, j) => j !== i))}
              >
                <Icon name="close" size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Tiny inline SVG sparkline for the planner table.
export function Sparkline({
  data,
  width = 96,
  height = 28,
  color = "#1a73e8",
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const pts = data
    .map((d, i) => {
      const x = i * step;
      const y = height - 2 - ((d - min) / span) * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className="gads-spark" width={width} height={height} aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
