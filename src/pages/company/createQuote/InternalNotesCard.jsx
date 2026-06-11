import React from 'react';
import { PencilLine } from 'lucide-react';

const InternalNotesCard = ({ notes, setNotes }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 font-sans flex-grow flex flex-col min-h-[200px]">
      <div className="flex items-center gap-2 mb-4">
        <PencilLine className="w-4 h-4 text-gray-400" />
        <h3 className="text-gray-500 font-bold text-[11px] uppercase tracking-widest">Internal Notes</h3>
      </div>
      
      <textarea 
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="flex-grow w-full bg-[#f8fafc] border-none rounded-xl p-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none font-medium"
        placeholder="Add private references, project constraints, or delivery terms for your team..."
      ></textarea>
    </div>
  );
};

export default InternalNotesCard;
