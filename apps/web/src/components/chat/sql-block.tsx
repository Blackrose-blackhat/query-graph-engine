"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Database, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SqlBlockProps {
  sql: string;
}

export function SqlBlock({ sql }: SqlBlockProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!sql) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Database className="h-3 w-3" />
        SQL
        {open ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
      {open && (
        <div className="relative mt-1 rounded-md overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 z-10"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          <SyntaxHighlighter
            language="sql"
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: "0.75rem",
              fontSize: "0.75rem",
              borderRadius: "0.375rem",
            }}
            wrapLongLines
          >
            {sql}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
