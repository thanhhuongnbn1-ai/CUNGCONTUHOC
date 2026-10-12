import React from 'react';
import katex from 'katex';

/**
 * LatexRenderer Component
 * Parses and renders text containing LaTeX formulas:
 * - Block math: $$...$$ or \[...\]
 * - Inline math: $...$ or \(...\)
 * - Ordinary text outside delimiters
 * Gracefully handles syntax errors with throwOnError: false.
 */
export const LatexRenderer = ({ content = '', className = '' }) => {
  if (!content) return null;

  // Function to render math snippet safely
  const renderMath = (mathCode, displayMode = false) => {
    try {
      return katex.renderToString(mathCode.trim(), {
        displayMode,
        throwOnError: false,
        strict: false
      });
    } catch (err) {
      console.warn('KaTeX render error:', err);
      return `<span class="text-red-500 font-mono text-xs">${mathCode}</span>`;
    }
  };

  // Helper to parse string into segments of text, inline math, and display math
  const parseLatexContent = (rawText) => {
    if (typeof rawText !== 'string') return [{ type: 'text', content: String(rawText) }];

    const segments = [];
    // Regular expression matching:
    // 1) $$...$$ (display math)
    // 2) $...$ (inline math)
    // 3) \[...\] (display math)
    // 4) \(...\) (inline math)
    const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(rawText)) !== null) {
      // Push preceding plain text if any
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: rawText.substring(lastIndex, match.index)
        });
      }

      const token = match[0];
      if (token.startsWith('$$') && token.endsWith('$$')) {
        segments.push({
          type: 'math_display',
          content: token.slice(2, -2)
        });
      } else if (token.startsWith('\\[') && token.endsWith('\\]')) {
        segments.push({
          type: 'math_display',
          content: token.slice(2, -2)
        });
      } else if (token.startsWith('\\(') && token.endsWith('\\)')) {
        segments.push({
          type: 'math_inline',
          content: token.slice(2, -2)
        });
      } else if (token.startsWith('$') && token.endsWith('$')) {
        segments.push({
          type: 'math_inline',
          content: token.slice(1, -1)
        });
      }

      lastIndex = regex.lastIndex;
    }

    // Push remaining plain text
    if (lastIndex < rawText.length) {
      segments.push({
        type: 'text',
        content: rawText.substring(lastIndex)
      });
    }

    return segments;
  };

  const segments = parseLatexContent(content);

  return (
    <span className={`inline-block leading-relaxed ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          return <span key={idx} className="whitespace-pre-wrap">{seg.content}</span>;
        }

        const isDisplay = seg.type === 'math_display';
        const html = renderMath(seg.content, isDisplay);

        if (isDisplay) {
          return (
            <div
              key={idx}
              className="my-2 py-1 px-3 bg-amber-50/50 rounded-xl overflow-x-auto text-center border border-amber-200/50"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        return (
          <span
            key={idx}
            className="inline-block px-1 mx-0.5 rounded bg-orange-50/40"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </span>
  );
};

export default LatexRenderer;
