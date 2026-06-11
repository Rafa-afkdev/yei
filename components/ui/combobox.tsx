"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";

export interface ComboItem {
  value: string;
  label: string;
  description?: string;
}

interface ComboboxProps {
  items: ComboItem[];
  value?: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  renderItem?: (item: ComboItem) => React.ReactNode;
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Seleccionar...",
  emptyText = "Sin resultados",
  className,
  renderItem,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selected = items.find(i => i.value === value) || null;

  const filtered = React.useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(i =>
      i.label.toLowerCase().includes(q) ||
      (i.description?.toLowerCase().includes(q) ?? false)
    );
  }, [items, query]);

  React.useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen(o => !o)}
      >
        <span className={cn("truncate text-left", !selected && "text-muted-foreground")}> 
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 ml-2 opacity-60" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className="pr-8"
              />
              {query && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setQuery("")}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-64 overflow-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                    value === item.value && "bg-accent/60"
                  )}
                >
                  {renderItem ? (
                    renderItem(item)
                  ) : (
                    <div>
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      )}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
