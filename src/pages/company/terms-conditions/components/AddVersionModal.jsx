import React, { useRef, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, Save, FileText, Type, Info,
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Minus, Undo2, Redo2,
  Heading1, Heading2, Highlighter, Quote, Plus, Loader2
} from 'lucide-react';
import termsApi from '../../../../services/termsApi';

// ── Toolbar Button Component ─────────────────────────────────────────────────
const ToolbarBtn = ({ icon: Icon, label, onClick, active = false, danger = false }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault(); // Keep editor focused
      onClick();
    }}
    title={label}
    className={`
      w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm font-bold
      ${active
        ? 'bg-[#145be9] text-white shadow-sm shadow-blue-500/30'
        : danger
          ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-600'
          : 'text-gray-500 hover:bg-gray-100 hover:text-[#1a2b4b]'
      }
    `}
  >
    {Icon ? <Icon className="w-4 h-4" /> : null}
  </button>
);

// ── Toolbar Divider ───────────────────────────────────────────────────────────
const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />;

// ── Toggle Component ──────────────────────────────────────────────────────────
const Toggle = ({ label, subLabel, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-100 shadow-sm shadow-blue-500/5">
    <div>
      <p className="text-sm font-bold text-[#1a2b4b]">{label}</p>
      {subLabel && <p className="text-[10px] text-gray-400 font-medium">{subLabel}</p>}
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${enabled ? 'right-1' : 'left-1'}`}
      />
    </button>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AddVersionModal = ({ onClose }) => {
  const editorRef = useRef(null);
  const [versionLabel, setVersionLabel] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: termsApi.createTerms,
    onSuccess: () => {
      queryClient.invalidateQueries(['terms']);
      onClose();
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to save. Please try again.'),
  });

  const exec = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleEditorInput = () => {
    const text = editorRef.current?.innerText?.trim();
    setIsEmpty(!text || text.length === 0);
  };

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '\u00a0\u00a0\u00a0\u00a0');
    }
  };

  const insertHorizontalRule = () => {
    exec('insertHTML', '<hr style="border:none;border-top:2px solid #e5e7eb;margin:1rem 0;" />');
  };

  const insertBlockquote = () => {
    exec('formatBlock', 'blockquote');
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-5xl rounded-[2.5rem] shadow-[0_24px_80px_-10px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[92vh]"
        style={{ animation: 'modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);   }
          }
          #tc-editor:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
            font-weight: 500;
          }
          #tc-editor blockquote {
            border-left: 3px solid #145be9;
            padding: 4px 12px;
            color: #374151;
            background: #eff6ff;
            border-radius: 0 8px 8px 0;
            margin: 8px 0;
            font-style: italic;
          }
          #tc-editor ul { list-style: disc;    padding-left: 24px; }
          #tc-editor ol { list-style: decimal; padding-left: 24px; }
          #tc-editor h1 { font-size: 1.5rem; font-weight: 800; color: #1a2b4b; margin: 8px 0; }
          #tc-editor h2 { font-size: 1.2rem; font-weight: 700; color: #1a2b4b; margin: 6px 0; }
          #tc-editor a  { color: #145be9; text-decoration: underline; }
          #tc-editor hr { border: none; border-top: 2px solid #e5e7eb; margin: 1rem 0; }
          mark { background: #fef08a; border-radius: 3px; padding: 0 2px; }

          /* Marker inherits font-weight so it goes bold when the li content is bold */
          #tc-editor li::marker { font-weight: inherit; font-style: inherit; }

          /* When the whole li contains a bold/strong child, make the li itself bold
             so ::marker picks it up via inheritance */
          #tc-editor li:has(b),
          #tc-editor li:has(strong) { font-weight: bold; }

          /* Same for italic */
          #tc-editor li:has(i),
          #tc-editor li:has(em) { font-style: italic; }
        `}</style>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#fcfcfd] flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-[#145be9]" />
            </div>
            <div>
              <h2 className="text-[#1a2b4b] text-xl font-black tracking-tight leading-none mb-1">Create New T&amp;C Version</h2>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Configure legal terms for future quotations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left: Version Name + Rich Text Editor */}
            <div className="lg:col-span-8 space-y-6">

              {/* Version Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a2b4b] ml-1 flex items-center">
                  <Type className="w-4 h-4 mr-2 text-blue-500" />
                  Version Name / Label <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={versionLabel}
                  onChange={(e) => { setVersionLabel(e.target.value); setError(''); }}
                  placeholder="e.g. Standard Terms 2024"
                  className="w-full bg-[#f8faff] border-2 border-transparent focus:border-[#145be9] focus:bg-white rounded-2xl px-6 py-4 text-sm font-semibold transition-all outline-none"
                />
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a2b4b] ml-1 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Detailed Terms &amp; Conditions <span className="text-red-500 ml-1">*</span>
                </label>

                {/* Editor Container */}
                <div className="border-2 border-transparent focus-within:border-[#145be9] rounded-2xl overflow-hidden bg-[#f8faff] focus-within:bg-white transition-all">

                  {/* ── Toolbar ─────────────────────────────────────────── */}
                  <div className="flex flex-wrap items-center gap-0.5 px-4 py-3 border-b border-gray-100 bg-white">

                    {/* History */}
                    <ToolbarBtn icon={Undo2}       label="Undo"                  onClick={() => exec('undo')} />
                    <ToolbarBtn icon={Redo2}       label="Redo"                  onClick={() => exec('redo')} />
                    <Divider />

                    {/* Headings */}
                    <ToolbarBtn icon={Heading1}    label="Heading 1"             onClick={() => exec('formatBlock', 'h1')} />
                    <ToolbarBtn icon={Heading2}    label="Heading 2"             onClick={() => exec('formatBlock', 'h2')} />
                    <Divider />

                    {/* Text Style */}
                    <ToolbarBtn icon={Bold}        label="Bold (Ctrl+B)"         onClick={() => exec('bold')} />
                    <ToolbarBtn icon={Italic}      label="Italic (Ctrl+I)"       onClick={() => exec('italic')} />
                    <ToolbarBtn icon={Underline}   label="Underline (Ctrl+U)"    onClick={() => exec('underline')} />
                    <ToolbarBtn icon={Strikethrough} label="Strikethrough"       onClick={() => exec('strikeThrough')} />
                    <ToolbarBtn icon={Highlighter} label="Highlight"             onClick={() => exec('backColor', '#fef08a')} />
                    <Divider />

                    {/* Alignment */}
                    <ToolbarBtn icon={AlignLeft}    label="Align Left"           onClick={() => exec('justifyLeft')} />
                    <ToolbarBtn icon={AlignCenter}  label="Align Center"         onClick={() => exec('justifyCenter')} />
                    <ToolbarBtn icon={AlignRight}   label="Align Right"          onClick={() => exec('justifyRight')} />
                    <ToolbarBtn icon={AlignJustify} label="Justify"              onClick={() => exec('justifyFull')} />
                    <Divider />

                    {/* Lists */}
                    <ToolbarBtn icon={List}         label="Bullet List"          onClick={() => exec('insertUnorderedList')} />
                    <ToolbarBtn icon={ListOrdered}  label="Ordered List"         onClick={() => exec('insertOrderedList')} />
                    <Divider />

                    {/* Extras */}
                    <ToolbarBtn icon={Quote}        label="Blockquote"           onClick={insertBlockquote} />
                    <ToolbarBtn icon={Link}         label="Insert Link"          onClick={insertLink} />
                    <ToolbarBtn icon={Minus}        label="Horizontal Divider"   onClick={insertHorizontalRule} />

                    {/* Font Size */}
                    <Divider />
                    <select
                      onMouseDown={(e) => e.stopPropagation()}
                      onChange={(e) => exec('fontSize', e.target.value)}
                      defaultValue=""
                      className="h-8 rounded-lg text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 outline-none hover:border-gray-300 transition-colors cursor-pointer"
                      title="Font Size"
                    >
                      <option value="" disabled>Size</option>
                      <option value="1">Small</option>
                      <option value="3">Normal</option>
                      <option value="5">Large</option>
                      <option value="7">Heading</option>
                    </select>
                  </div>

                  {/* ── Editable Content Area ────────────────────────────── */}
                  <div
                    id="tc-editor"
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleEditorInput}
                    onKeyDown={handleTabKey}
                    data-placeholder="Start typing your Terms & Conditions here... Use the toolbar above to format your content."
                    className="min-h-[320px] px-6 py-5 text-sm text-[#1a2b4b] outline-none leading-relaxed custom-scrollbar overflow-y-auto"
                    style={{ maxHeight: '400px' }}
                  />

                  {/* Word count footer */}
                  <div className="px-6 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Rich Text Editor</span>
                    {isEmpty && (
                      <span className="text-[10px] text-amber-500 font-bold">Content required</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Settings Panel */}
            <div className="lg:col-span-4 space-y-6">

              {/* Configuration */}
              <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100/50">
                <div className="flex items-center space-x-2 mb-4">
                  <Info className="w-4 h-4 text-[#145be9]" />
                  <h3 className="text-[#145be9] text-xs font-black uppercase tracking-widest">Configuration</h3>
                </div>
                <div className="space-y-3">
                  <Toggle
                    label="Set as Active"
                    subLabel="Auto-apply to new quotes"
                    enabled={isActive}
                    onToggle={() => setIsActive(!isActive)}
                  />
                  <Toggle
                    label="Read Only"
                    subLabel="Lock after creation"
                    enabled={isReadOnly}
                    onToggle={() => setIsReadOnly(!isReadOnly)}
                  />
                </div>
              </div>

              {/* Formatting Tips */}
              <div className="bg-[#f0f4ff] rounded-3xl p-6 border border-blue-100/50">
                <h3 className="text-[#145be9] text-xs font-black uppercase tracking-widest mb-4">Formatting Tips</h3>
                <ul className="space-y-2.5 text-xs text-gray-600 font-medium">
                  {[
                    ['B', 'Bold', '#145be9'],
                    ['I', 'Italic', '#8b5cf6'],
                    ['U', 'Underline', '#059669'],
                  ].map(([key, label, color]) => (
                    <li key={key} className="flex items-center space-x-3">
                      <kbd className="px-2 py-0.5 rounded-lg border border-gray-200 bg-white text-[11px] font-black" style={{ color }}>Ctrl+{key}</kbd>
                      <span className="text-gray-500">{label}</span>
                    </li>
                  ))}
                  <li className="flex items-start space-x-3 pt-1 border-t border-blue-100 mt-2">
                    <span className="text-gray-400 leading-relaxed text-[11px]">Use the toolbar to insert bullet lists, headings, blockquotes, and horizontal dividers to structure your terms.</span>
                  </li>
                </ul>
              </div>

              {/* Warning Note */}
              <div className="bg-amber-50/70 rounded-3xl p-5 border border-amber-100/80">
                <p className="text-amber-800 text-xs font-semibold leading-relaxed">
                  <span className="font-black italic">Note:</span> Activating this version will archive the current active version. Existing quotes retain their locked terms.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="px-8 py-5 border-t border-gray-100 bg-[#fcfcfd] flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-gray-400 font-medium hidden sm:block">
            {error
              ? <span className="text-rose-500 font-bold">{error}</span>
              : 'Your content is formatted with rich text support.'}
          </span>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-500 font-bold text-sm hover:text-rose-500 transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => {
                const content = editorRef.current?.innerHTML?.trim();
                if (!versionLabel.trim()) return setError('Version name is required.');
                if (!content || editorRef.current?.innerText?.trim() === '') return setError('Terms content is required.');
                createMutation.mutate({
                  versionLabel: versionLabel.trim(),
                  content,
                  status: isActive ? 'active' : 'draft',
                  isDefault: isActive,
                  isReadOnly,
                });
              }}
              className="flex items-center space-x-2 bg-[#145be9] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgba(20,91,233,0.39)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{createMutation.isPending ? 'Saving...' : 'Save Version'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVersionModal;
