import React from "react";
import Link from "next/link";
import { CommentEntity } from "@/utils/dtos/comment.dto";

interface CommentContentProps {
  content: string;
}

export const CommentContent: React.FC<CommentContentProps> = ({ content }) => {
  const parseContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const hashtagRegex = /#(\w+)/g;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    const combinedRegex = new RegExp(`${urlRegex.source}|${hashtagRegex.source}`, 'gi');
    let match;
    while ((match = combinedRegex.exec(text)) !== null) {
      const matchText = match[0];
      const start = match.index;

      if (lastIndex < start) {
        elements.push(text.slice(lastIndex, start));
      }

      if (urlRegex.test(matchText)) {
        const href = matchText.startsWith("http") ? matchText : `https://${matchText}`;
        elements.push(
          <a
            key={start}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 transition"
          >
            {matchText}
          </a>
        );
      } else if (hashtagRegex.test(matchText)) {
        const tagName = matchText.slice(1);
        elements.push(
          <Link
            key={start}
            href={`/community/?tags=${encodeURIComponent(tagName)}`}
            target="_blank"
            className="text-purple-600 font-semibold hover:text-purple-800 hover:underline transition"
          >
            {matchText}
          </Link>
        );
      }

      lastIndex = start + matchText.length;
    }

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements;
  };

  return <p className="text-gray-700 text-base whitespace-pre-wrap">{parseContent(content)}</p>;
};
