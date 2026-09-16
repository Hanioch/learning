"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Option } from "@/lib/taxonomy";

type Props = {
  label: string;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  /** Ajoute une entrée « tout » en tête, qui renvoie la chaîne vide. */
  emptyLabel?: string;
  disabled?: boolean;
};

/**
 * Liste déroulante maison : un `<select>` natif ne se style pas de la même
 * façon d'un OS à l'autre, et on veut l'ouverture animée et la description
 * de chaque entrée.
 */
export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "Choisir…",
  emptyLabel,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const entries: Array<{ id: string; label: string; brief?: string }> = emptyLabel
    ? [{ id: "", label: emptyLabel }, ...options]
    : options;

  const selected = entries.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelectorAll("li")[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [open, activeIndex]);

  const openAt = () => {
    const index = entries.findIndex((o) => o.id === value);
    setActiveIndex(index < 0 ? 0 : index);
    setOpen(true);
  };

  const commit = (index: number) => {
    const entry = entries[index];
    if (!entry) return;
    onChange(entry.id);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openAt();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % entries.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + entries.length) % entries.length);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(entries.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </span>

      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openAt())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left text-[0.95rem] transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={`truncate ${selected ? "" : "text-muted"}`}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          viewBox="0 0 12 12"
          aria-hidden
          className={`h-3 w-3 shrink-0 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M2 4.5 6 8.5 10 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="animate-fade-up absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-lg shadow-black/5"
        >
          {entries.map((entry, index) => {
            const isSelected = entry.id === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={entry.id || "__all__"}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(index)}
                className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${
                  isActive ? "bg-accent-soft" : ""
                }`}
              >
                <span
                  className={`block text-[0.95rem] ${
                    isSelected ? "font-semibold text-accent" : ""
                  }`}
                >
                  {entry.label}
                </span>
                {entry.brief && (
                  <span className="mt-0.5 block text-xs leading-snug text-muted">
                    {entry.brief.length > 78
                      ? `${entry.brief.slice(0, 78)}…`
                      : entry.brief}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
