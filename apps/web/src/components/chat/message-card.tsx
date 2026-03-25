"use client";

import { AlertCircle } from "lucide-react";
import { SqlBlock } from "./sql-block";
import { ResultTable } from "./result-table";
import { JsonUIRenderer } from "./render-catalog";
import type { ChatMessage } from "@/lib/types";

import ReactMarkdown from "react-markdown";

interface MessageCardProps {
  message: ChatMessage;
}

export function MessageCard({ message }: MessageCardProps) {
  const isUser = message.role === "user";
  const isError = message.error;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[90%] w-full rounded-lg px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground ml-auto w-auto"
            : isError
              ? "bg-destructive/10 border border-destructive/30"
              : "bg-card border shadow-sm"
        }`}
      >
        {isError && (
          <div className="flex items-center gap-1.5 text-destructive text-xs mb-1">
            <AlertCircle className="h-3 w-3" /> Error
          </div>
        )}
        <div className="text-sm max-w-none leading-relaxed">
          <ReactMarkdown
            components={{
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5 my-2 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />
              ),
              li: ({ node, ...props }) => <li className="" {...props} />,
              p: ({ node, ...props }) => (
                <p className="mb-3 last:mb-0" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-foreground" {...props} />
              ),
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
        {!isUser && message.sql && <SqlBlock sql={message.sql} />}

        {!isUser && message.spec ? (
          <JsonUIRenderer spec={message.spec as any} />
        ) : (
          !isUser &&
          message.data &&
          message.data.length > 0 && <ResultTable data={message.data} />
        )}
      </div>
    </div>
  );
}
