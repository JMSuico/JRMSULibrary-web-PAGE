import React, { useState, useEffect } from 'react';

interface HtmlSyntaxEditorProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

/**
 * HtmlSyntaxEditor
 * Splits HTML content so that HTML tags (e.g., <p>, <strong>) are rendered as 
 * un-editable "pale" blocks, while the inner text remains fully editable.
 * Prevents accidental deletion of layout tags in the Content Manager.
 */
export const HtmlSyntaxEditor: React.FC<HtmlSyntaxEditorProps> = ({ value, onChange, id }) => {
  const [parts, setParts] = useState<string[]>([]);

  useEffect(() => {
    // Regex splits by HTML tags. Captures the tags so they are kept in the array.
    // e.g. "<p>Hello</p>" -> ["", "<p>", "Hello", "</p>", ""]
    const splitParts = (value || '').split(/(<[^>]+>)/g).filter(Boolean);
    if (splitParts.length === 0) {
      setParts(['']); // ensure at least one editable node
    } else {
      setParts(splitParts);
    }
  }, [value]);

  const handlePartChange = (index: number, newText: string) => {
    const newParts = [...parts];
    newParts[index] = newText;
    setParts(newParts);
    onChange(newParts.join(''));
  };

  return (
    <div 
      id={id}
      className="prose prose-sm max-w-none bg-white border border-gray-200 rounded-md p-4 min-h-[100px] flex flex-wrap items-center gap-x-[1px] gap-y-1 font-mono text-sm leading-relaxed"
    >
      {parts.map((part, i) => {
        const isTag = part.startsWith('<') && part.endsWith('>');
        if (isTag) {
          return (
            <span 
              key={`${i}-${part}`} 
              className="px-1.5 py-0.5 bg-blue-50 text-blue-300 rounded mx-0.5 select-none text-xs font-semibold"
              contentEditable={false}
              title="This HTML tag is locked and cannot be edited."
            >
              {part}
            </span>
          );
        }
        return (
          <span
            key={i}
            contentEditable={true}
            suppressContentEditableWarning
            className="outline-none min-w-[20px] inline-block text-gray-700"
            onBlur={(e) => handlePartChange(i, e.currentTarget.textContent || '')}
            onInput={(e) => {
              // Optional: You could update local state here on input if you want real-time, 
              // but onBlur is safer for contentEditable to avoid cursor jumping.
            }}
          >
            {part}
          </span>
        );
      })}
    </div>
  );
};
