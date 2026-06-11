import React, { useRef, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, Save, FileText, Type, Info,
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link, Minus, Undo2, Redo2,
  Heading1, Heading2, Highlighter, Quote, Edit3, Loader2
} from 'lucide-react';
import termsApi from '../../../../services/termsApi';

const ToolbarBtn = ({ icon: Icon, label, onClick }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={label}
    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#1a2b4b] transition-all"
  >
    {Icon && <Icon className="w-4 h-4" />}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />;

const Toggle = ({ label, subLabel, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
    <div>
      <p className="text-sm font-bold text-[#1a2b4b]">{label}</p>
      {subLabel && <p className="text-[10px] text-gray-400 font-medium">{subLabel}</p>}
    </div>
    <button
      type="button"
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${enabled ? 'right-1' : 'left-1'}`} />
    </button>
  </div>
);

const EditVersionModal = ({ terms, onClose }) => {
  const editorRef = useRef(null);
  const [versionLabel, setVersionLabel] = useState(terms.versionLabel || '');
  const [isActive, setIsActive] = useState(terms.status === 'active');
  const [isReadOnly, setIsReadOnly] = useState(terms.isReadOnly || false);
  const [error, setError] = useState('');

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => termsApi.updateTerms({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['terms']);
      onClose();
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to update.'),
  });

  const exec = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '\u00a0\u00a0\u00a0\u00a0');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-white w-full max-w-5xl rounded-[2.5rem] shadow-[0_24px_80px_-10px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[92vh]"
        style={{ animation: 'modalIn 0.2s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <style>{`
          @keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
          #tc-edit-editor:empty:before{content:attr(data-placeholder);color:#9ca3af;pointer-events:none;font-weight:500;}
          #tc-edit-editor blockquote{border-left:3px solid #145be9;padding:4px 12px;color:#374151;background:#eff6ff;border-radius:0 8px 8px 0;margin:8px 0;font-style:italic;}
          #tc-edit-editor ul{list-style:disc;padding-left:24px;}
          #tc-edit-editor ol{list-style:decimal;padding-left:24px;}
          #tc-edit-editor h1{font-size:1.5rem;font-weight:800;color:#1a2b4b;margin:8px 0;}
          #tc-edit-editor h2{font-size:1.2rem;font-weight:700;color:#1a2b4b;margin:6px 0;}
          #tc-edit-editor a{color:#145be9;text-decoration:underline;}
          #tc-edit-editor hr{border:none;border-top:2px solid #e5e7eb;margin:1rem 0;}
          #tc-edit-editor li::marker{font-weight:inherit;font-style:inherit;}
          #tc-edit-editor li:has(b),#tc-edit-editor li:has(strong){font-weight:bold;}
          #tc-edit-editor li:has(i),#tc-edit-editor li:has(em){font-style:italic;}
          mark{background:#fef08a;border-radius:3px;padding:0 2px;}
        `}</style>

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#fcfcfd] flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Edit3 className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-[#1a2b4b] text-xl font-black tracking-tight leading-none mb-1">Edit T&amp;C Version</h2>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{terms.versionId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left: Editor */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a2b4b] ml-1 flex items-center">
                  <Type className="w-4 h-4 mr-2 text-amber-500" />
                  Version Name / Label <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={versionLabel}
                  onChange={(e) => { setVersionLabel(e.target.value); setError(''); }}
                  className="w-full bg-[#f8faff] border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl px-6 py-4 text-sm font-semibold transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a2b4b] ml-1 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-amber-500" />
                  Terms &amp; Conditions Content <span className="text-red-500 ml-1">*</span>
                </label>

                <div className="border-2 border-transparent focus-within:border-amber-400 rounded-2xl overflow-hidden bg-[#f8faff] focus-within:bg-white transition-all">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-0.5 px-4 py-3 border-b border-gray-100 bg-white">
                    <ToolbarBtn icon={Undo2}         label="Undo"           onClick={() => exec('undo')} />
                    <ToolbarBtn icon={Redo2}         label="Redo"           onClick={() => exec('redo')} />
                    <Divider />
                    <ToolbarBtn icon={Heading1}      label="Heading 1"      onClick={() => exec('formatBlock', 'h1')} />
                    <ToolbarBtn icon={Heading2}      label="Heading 2"      onClick={() => exec('formatBlock', 'h2')} />
                    <Divider />
                    <ToolbarBtn icon={Bold}          label="Bold"           onClick={() => exec('bold')} />
                    <ToolbarBtn icon={Italic}        label="Italic"         onClick={() => exec('italic')} />
                    <ToolbarBtn icon={Underline}     label="Underline"      onClick={() => exec('underline')} />
                    <ToolbarBtn icon={Strikethrough} label="Strikethrough"  onClick={() => exec('strikeThrough')} />
                    <ToolbarBtn icon={Highlighter}   label="Highlight"      onClick={() => exec('backColor', '#fef08a')} />
                    <Divider />
                    <ToolbarBtn icon={AlignLeft}     label="Align Left"     onClick={() => exec('justifyLeft')} />
                    <ToolbarBtn icon={AlignCenter}   label="Align Center"   onClick={() => exec('justifyCenter')} />
                    <ToolbarBtn icon={AlignRight}    label="Align Right"    onClick={() => exec('justifyRight')} />
                    <ToolbarBtn icon={AlignJustify}  label="Justify"        onClick={() => exec('justifyFull')} />
                    <Divider />
                    <ToolbarBtn icon={List}          label="Bullet List"    onClick={() => exec('insertUnorderedList')} />
                    <ToolbarBtn icon={ListOrdered}   label="Ordered List"   onClick={() => exec('insertOrderedList')} />
                    <Divider />
                    <ToolbarBtn icon={Quote}         label="Blockquote"     onClick={() => exec('formatBlock', 'blockquote')} />
                    <ToolbarBtn icon={Link}          label="Insert Link"    onClick={() => { const u = window.prompt('URL:'); if (u) exec('createLink', u); }} />
                    <ToolbarBtn icon={Minus}         label="Horizontal Rule" onClick={() => exec('insertHTML', '<hr style="border:none;border-top:2px solid #e5e7eb;margin:1rem 0;" />')} />
                  </div>

                  {/* Editor */}
                  <div
                    id="tc-edit-editor"
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onKeyDown={handleTabKey}
                    data-placeholder="Edit your Terms & Conditions..."
                    dangerouslySetInnerHTML={{ __html: terms.content }}
                    className="min-h-[300px] px-6 py-5 text-sm text-[#1a2b4b] outline-none leading-relaxed custom-scrollbar overflow-y-auto"
                    style={{ maxHeight: '380px' }}
                  />

                  <div className="px-6 py-2 border-t border-gray-100 bg-gray-50">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Rich Text Editor</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Settings */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-100/50">
                <div className="flex items-center space-x-2 mb-4">
                  <Info className="w-4 h-4 text-amber-500" />
                  <h3 className="text-amber-600 text-xs font-black uppercase tracking-widest">Configuration</h3>
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
                    subLabel="Lock after saving"
                    enabled={isReadOnly}
                    onToggle={() => setIsReadOnly(!isReadOnly)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-[#fcfcfd] flex items-center justify-between flex-shrink-0">
          <span className="text-xs hidden sm:block">
            {error
              ? <span className="text-rose-500 font-bold">{error}</span>
              : <span className="text-gray-400 font-medium">Editing rich-text content.</span>}
          </span>
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="px-6 py-3 text-gray-500 font-bold text-sm hover:text-rose-500 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              disabled={updateMutation.isPending}
              onClick={() => {
                const content = editorRef.current?.innerHTML?.trim();
                if (!versionLabel.trim()) return setError('Version name is required.');
                if (!content || editorRef.current?.innerText?.trim() === '') return setError('Content is required.');
                updateMutation.mutate({
                  id: terms._id,
                  data: {
                    versionLabel: versionLabel.trim(),
                    content,
                    status: isActive ? 'active' : terms.status === 'active' ? 'draft' : terms.status,
                    isDefault: isActive,
                    isReadOnly,
                  },
                });
              }}
              className="flex items-center space-x-2 bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-[0_4px_14px_0_rgba(245,158,11,0.4)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVersionModal;
