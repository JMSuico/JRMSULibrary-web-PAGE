import React, { useState, useEffect } from 'react';
import { Trash2, Plus, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface BlockTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

type BlockType = 'p' | 'li';

interface Block {
  id: string;
  type: BlockType;
  content: string;
  align: 'left' | 'center' | 'right' | 'justify';
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export const BlockTextEditor: React.FC<BlockTextEditorProps> = ({ value, onChange, id }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Parse HTML value into blocks on first mount.
  // Safe to use [] because the parent passes key={slug}, guaranteeing a fresh
  // component instance every time a different content item is opened for editing.
  useEffect(() => {
    if (!value) {
      setBlocks([{ id: generateId(), type: 'p', content: '', align: 'justify' }]);
      return;
    }

    const doc = new DOMParser().parseFromString(value, 'text/html');
    const nodes = Array.from(doc.querySelectorAll('p, li'));

    if (nodes.length === 0) {
      // Fallback: plain text with no HTML tags
      setBlocks([{ id: generateId(), type: 'p', content: doc.body.textContent || '', align: 'justify' }]);
    } else {
      const parsedBlocks = nodes.map(node => {
        let align: Block['align'] = 'justify';
        const htmlElement = node as HTMLElement;
        if (htmlElement.style.textAlign) {
          align = htmlElement.style.textAlign as Block['align'];
        }
        return {
          id: generateId(),
          type: node.tagName.toLowerCase() as BlockType,
          content: node.innerHTML || '',
          align
        };
      });
      setBlocks(parsedBlocks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // [] is intentional — key prop on the parent ensures fresh mount per item

  // Serialize blocks to HTML and trigger onChange
  const triggerChange = (newBlocks: Block[]) => {
    let html = '';
    let inList = false;

    newBlocks.forEach(block => {
      const alignAttr = ` style="text-align: ${block.align};"`;
      if (block.type === 'li') {
        if (!inList) {
          html += '<ul>\n';
          inList = true;
        }
        html += `  <li${alignAttr}>${block.content}</li>\n`;
      } else {
        if (inList) {
          html += '</ul>\n';
          inList = false;
        }
        html += `<p${alignAttr}>${block.content}</p>\n`;
      }
    });

    if (inList) {
      html += '</ul>\n';
    }

    onChange(html);
  };

  const addBlock = (type: BlockType) => {
    const newBlocks = [...blocks, { id: generateId(), type, content: '', align: 'justify' as const }];
    setBlocks(newBlocks);
    triggerChange(newBlocks);
  };

  const removeBlock = (id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    if (newBlocks.length === 0) {
      newBlocks.push({ id: generateId(), type: 'p', content: '', align: 'justify' as const }); // ensure at least one block exists
    }
    setBlocks(newBlocks);
    triggerChange(newBlocks);
  };

  const updateBlockContent = (id: string, newContent: string) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, content: newContent } : b);
    setBlocks(newBlocks);
    triggerChange(newBlocks);
  };

  const updateBlockAlign = (id: string, newAlign: 'left' | 'center' | 'right' | 'justify') => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, align: newAlign } : b);
    setBlocks(newBlocks);
    triggerChange(newBlocks);
  };

  // Calculate numbers for list items
  let currentListIndex = 1;

  return (
    <div id={id} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
        {blocks.map((block) => {
          const isListItem = block.type === 'li';
          const listNumber = isListItem ? currentListIndex++ : null;

          return (
            <div key={block.id} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm group transition-all">
              {/* Type Indicator (Untouchable) */}
              <div className="shrink-0 mt-1 select-none">
                {isListItem ? (
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold ring-2 ring-blue-50">
                    {listNumber}
                  </span>
                ) : (
                  <span className="w-7 h-7 rounded bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold" title="Paragraph">
                    ¶
                  </span>
                )}
              </div>

              {/* Editable Text Area */}
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  className={`w-full text-sm text-gray-700 border-none outline-none resize-y min-h-[40px] focus:ring-0 p-1 bg-transparent text-${block.align === 'justify' ? 'justify' : block.align}`}
                  style={{ textAlign: block.align }}
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  placeholder={isListItem ? "Enter list item text..." : "Enter paragraph text..."}
                  rows={2}
                />
                
                {/* Formatting Tools */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100 border-t border-gray-100 pt-2">
                  <button type="button" onClick={() => updateBlockAlign(block.id, 'left')} className={`p-1.5 rounded ${block.align === 'left' ? 'bg-navy/10 text-navy' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`} title="Align Left"><AlignLeft size={14} /></button>
                  <button type="button" onClick={() => updateBlockAlign(block.id, 'center')} className={`p-1.5 rounded ${block.align === 'center' ? 'bg-navy/10 text-navy' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`} title="Align Center"><AlignCenter size={14} /></button>
                  <button type="button" onClick={() => updateBlockAlign(block.id, 'right')} className={`p-1.5 rounded ${block.align === 'right' ? 'bg-navy/10 text-navy' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`} title="Align Right"><AlignRight size={14} /></button>
                  <button type="button" onClick={() => updateBlockAlign(block.id, 'justify')} className={`p-1.5 rounded ${block.align === 'justify' ? 'bg-navy/10 text-navy' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`} title="Justify"><AlignJustify size={14} /></button>
                </div>
              </div>

              {/* Actions */}
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                className="shrink-0 text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 mt-1"
                title="Remove block"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => addBlock('p')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Paragraph
        </button>
        <button
          type="button"
          onClick={() => addBlock('li')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add List Item
        </button>
      </div>
    </div>
  );
};
