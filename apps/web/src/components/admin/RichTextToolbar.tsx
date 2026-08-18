import React, { useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Upload,
  Link,
  Minus
} from 'lucide-react';
import { fetchApi } from '../../services/api-client';
import { useToast } from '../ui/toast';

export interface RichTextToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  onChange: (newContent: string) => void;
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ textareaRef, content, onChange }) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to wrap selected text or insert HTML snippet at cursor position
  const insertHtmlAtCursor = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const replacement = `${prefix}${selectedText || 'Nội dung văn bản'}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);

    onChange(newContent);

    // Reset focus & cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 16));
    }, 50);
  };

  // Upload images from local computer
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      showToast('Đang tải ảnh lên...', `Đang tải ${files.length} tệp ảnh từ máy tính...`, 'info');

      // Get bearer token from localStorage
      const token = localStorage.getItem('mbs_access_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const API_URL = 'http://localhost:4000/api/v1/media/upload';
      const res = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Không thể tải ảnh lên');

      const uploadedFiles: any[] = data.data || [];
      if (uploadedFiles.length > 0) {
        const imgTags = uploadedFiles
          .map(
            (f) =>
              `<figure class="my-4 text-center">\n  <img src="${f.url}" alt="${f.originalName}" class="mx-auto rounded-xl border border-slate-800 shadow-lg max-w-full h-auto" />\n  <figcaption class="text-xs text-slate-400 mt-2 italic">${f.originalName}</figcaption>\n</figure>\n`
          )
          .join('\n');

        insertHtmlAtCursor(imgTags, '');
        showToast('Tải ảnh thành công', `Đã chèn ${uploadedFiles.length} ảnh từ máy tính vào nội dung`, 'success');
      }
    } catch (err: any) {
      showToast('Lỗi tải ảnh', err.message || 'Không thể tải tệp lên từ máy tính', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl mb-2 text-slate-300">
      {/* Hidden File Input for Multi-image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="image/*"
        className="hidden"
      />

      {/* Button: Upload Images from Computer */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
        title="Tải & chèn một hoặc nhiều ảnh từ máy tính vào nội dung"
      >
        <Upload className="w-3.5 h-3.5 text-emerald-400" />
        <span>Tải ảnh từ máy tính</span>
      </button>

      <div className="w-px h-5 bg-slate-800 mx-1"></div>

      {/* Formatting Group: Bold, Italic, Underline, Strikethrough */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<strong>', '</strong>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="In đậm (Bold <strong>)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<em>', '</em>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="In nghiêng (Italic <em>)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<u>', '</u>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Gạch chân (Underline <u>)"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<del>', '</del>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Gạch ngang (Strikethrough <del>)"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-800 mx-1"></div>

      {/* Text Alignment Group: Left, Center, Right, Justify */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<p style="text-align: left;">', '</p>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Căn trái (Align Left)"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<p style="text-align: center;">', '</p>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer font-bold"
          title="Căn giữa (Align Center)"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<p style="text-align: right;">', '</p>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Căn phải (Align Right)"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<p style="text-align: justify;">', '</p>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Căn đều 2 bên (Justify)"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-800 mx-1"></div>

      {/* Headings: H2, H3, H4 */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<h2 className="text-xl font-bold text-white my-3">', '</h2>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Tiêu đề H2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<h3 className="text-lg font-bold text-emerald-400 my-2">', '</h3>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Tiêu đề H3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<h4 className="text-base font-bold text-slate-200 my-2">', '</h4>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Tiêu đề H4"
        >
          <Heading4 className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-800 mx-1"></div>

      {/* Lists, Quote, Link & Divider */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<ul class="list-disc list-inside space-y-1 my-2">\n  <li>', '</li>\n</ul>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Danh sách chấm tròn (Unordered List)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<ol class="list-decimal list-inside space-y-1 my-2">\n  <li>', '</li>\n</ol>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Danh sách số (Ordered List)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('<blockquote class="border-l-4 border-emerald-500 pl-4 py-2 my-3 italic text-slate-300 bg-slate-900/50 rounded-r-xl">\n  ', '\n</blockquote>')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Khối trích dẫn (Blockquote)"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Nhập đường dẫn liên kết (URL):', 'https://');
            if (url) insertHtmlAtCursor(`<a href="${url}" target="_blank" class="text-emerald-400 underline font-semibold">`, '</a>');
          }}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Chèn đường dẫn liên kết (Hyperlink)"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => insertHtmlAtCursor('\n<hr class="my-4 border-slate-800" />\n')}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Đường phân cách (Horizontal Rule)"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
