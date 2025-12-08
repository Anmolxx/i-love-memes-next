import React from "react";
import Link from "next/link";

interface CommentContentProps {
  content: string;
}

export const CommentContent: React.FC<CommentContentProps> = ({ content }) => {
  const parseContent = (text: string) => {
    const hashtagRegex = /#(\w+)/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const domainRegex = /\b(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/g;

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    const combinedRegex = new RegExp(
      `${emailRegex.source}|${domainRegex.source}|${hashtagRegex.source}`,
      "gi"
    );
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      const matchText = match[0];
      const start = match.index;

      if (lastIndex < start) {
        elements.push(text.slice(lastIndex, start));
      }

      if (emailRegex.test(matchText)) {
        const domain = matchText.split("@")[1].toLowerCase();
        let emailHref = `mailto:${matchText}`;
        if (domain.includes("gmail")) emailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${matchText}`;
        else if (domain.includes("yahoo")) emailHref = `https://mail.yahoo.com/d/folders/1?.src=compose&to=${matchText}`;
        else emailHref = `https://outlook.office.com/mail/deeplink/compose?to=${matchText}`; 

        elements.push(
          <a
            key={start}
            href={emailHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 underline hover:text-green-800 transition"
          >
            {matchText}
          </a>
        );
      } else if (domainRegex.test(matchText)) {
  
        if (!matchText.includes("@")) {
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
        } else {
          elements.push(matchText); 
        }
      } else if (hashtagRegex.test(matchText)) {
        const tagName = matchText.slice(1);
        elements.push(
          <Link
            key={start}
            href={`/community/?tags=${encodeURIComponent(tagName)}`}
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
