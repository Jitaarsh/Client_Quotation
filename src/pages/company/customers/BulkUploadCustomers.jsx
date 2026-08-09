import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, UploadCloud, FileText, Download, 
  CheckCircle2, AlertCircle, Loader2, X ,CloudUpload
} from 'lucide-react';
import customerApi from '../../../services/customerApi';

const BulkUploadCustomers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Results after upload
  const [uploadResults, setUploadResults] = useState(null);

  // ── CSV Template Download ─────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const headers = "fullName,businessName,email,phone,country,state,city,category,leadType,assignedUser,currency\n";
    const sample = "John Doe,Acme Corp,john@acme.com,1234567890,India,Maharashtra,Mumbai,corporate,hot,Jane Smith,INR\n";
    
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "customer_import_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── CSV Parsing (Native JS) ───────────────────────────────────────
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setErrorMsg("File must contain at least a header row and one data row.");
      return;
    }
    
    // Header normalization mapping
    const headerMapping = {
      'fullname': 'fullName',
      'full name': 'fullName',
      'businessname': 'businessName',
      'business name': 'businessName',
      'email': 'email',
      'email address': 'email',
      'phone': 'phone',
      'phone number': 'phone',
      'contact': 'phone',
      'country': 'country',
      'state': 'state',
      'city': 'city',
      'category': 'category',
      'leadtype': 'leadType',
      'lead type': 'leadType',
      'assigneduser': 'assignedUser',
      'assigned user': 'assignedUser',
      'currency': 'currency'
    };

    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const headers = rawHeaders.map(h => {
      const normalizedKey = h.toLowerCase().replace(/_/g, ' ');
      return headerMapping[normalizedKey] || h;
    });

    if (!headers.includes('email')) {
      setErrorMsg('CSV validation failed: Missing required "email" column.');
      return;
    }

    const toTitleCase = (str) => {
      if (!str) return '';
      return str.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    };

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
        const row = {};
        
        headers.forEach((h, index) => {
            let val = values[index] !== undefined ? values[index] : '';
            
            // Normalize values based on field type
            if (['fullName', 'city', 'state', 'country', 'businessName'].includes(h)) {
              val = toTitleCase(val);
            } else if (['email', 'category', 'leadType'].includes(h)) {
              val = val.toLowerCase();
            } else if (h === 'currency') {
              val = val.toUpperCase();
            }
            
            row[h] = val;
        });
        
        if (row.email) {
            records.push(row);
        }
    }

    if (records.length === 0) {
      setErrorMsg("No valid records found in the CSV file. Ensure emails are provided.");
      return;
    }

    setParsedData(records);
    setErrorMsg(null);
  };

  const processFile = (file) => {
    if (!file) return;
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrorMsg("Invalid file type. Please upload a .csv file.");
      setSelectedFile(null);
      setParsedData(null);
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    setUploadResults(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      parseCSV(e.target.result);
    };
    reader.readAsText(file);
  };

  // ── Drag & Drop Handlers ──────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // ── API Upload Mutation ───────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: customerApi.bulkCreateCustomers,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['customers']);
      setUploadResults(response.data); // data contains { created, skipped, errors: [] }
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message || 'Server error occurred during upload.');
    }
  });

  const handleUpload = () => {
    if (!parsedData || parsedData.length === 0) return;
    uploadMutation.mutate({ customers: parsedData });
  };

  const resetState = () => {
    setSelectedFile(null);
    setParsedData(null);
    setUploadResults(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-4 sm:p-6 lg:p-10 font-sans w-full overflow-hidden">
      
      {/* ── Top Navigation & Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-500 hover:text-black font-bold text-xs uppercase tracking-widest transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Directory
          </button>
          <h1 className="text-[#1a2b4b] text-[2rem] font-black mb-1 tracking-tight leading-tight">Bulk Import</h1>
          <p className="text-gray-500 font-medium text-sm max-w-lg leading-relaxed">
            Upload multiple customers to your ledger instantly using a CSV file.
          </p>
        </div>
        <button 
          onClick={handleDownloadTemplate}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#145be9] bg-[#dce9fe] hover:bg-[#cde0fe] transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* ── Results View ── */}
      {uploadResults ? (
        <div className="bg-white rounded-[2.5rem] p-12 border border-gray-100 shadow-sm text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-[#1a2b4b] mb-4">Import Complete</h2>
          
          <div className="flex items-center justify-center space-x-8 mb-10">
            <div className="bg-slate-50 rounded-2xl p-6 min-w-[140px]">
              <div className="text-emerald-500 font-black text-4xl mb-1">{uploadResults.created}</div>
              <div className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Added</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 min-w-[140px]">
              <div className="text-rose-500 font-black text-4xl mb-1">{uploadResults.skipped}</div>
              <div className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Skipped</div>
            </div>
          </div>

          {uploadResults.errors && uploadResults.errors.length > 0 && (
            <div className="text-left bg-rose-50/50 border border-rose-100 rounded-2xl p-6 mb-10 max-h-48 overflow-y-auto custom-scrollbar">
              <h4 className="flex items-center text-rose-800 font-bold text-xs uppercase tracking-widest mb-3">
                <AlertCircle className="w-4 h-4 mr-2" /> Skipped Row Details
              </h4>
              <ul className="space-y-1">
                {uploadResults.errors.map((err, i) => (
                  <li key={i} className="text-rose-600 text-[13px] font-medium leading-relaxed">&bull; {err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-center space-x-4">
            <button 
              onClick={resetState}
              className="px-8 py-3.5 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Upload Another File
            </button>
            <Link 
              to="/dashboard"
              className="px-8 py-3.5 bg-black text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              View Directory
            </Link>
          </div>
        </div>
      ) : (
        /* ── Upload Box ── */
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl border border-rose-100 flex items-start animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm mb-0.5">Validation Error</h4>
                <p className="text-[13px] font-medium opacity-90 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* DND Target */}
          {!parsedData ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-3 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden ${
                isDragging 
                  ? 'border-[#145be9] bg-blue-50/50 scale-[1.02]' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 transition-colors ${isDragging ? 'bg-[#145be9] text-white' : 'bg-slate-100 text-slate-400'}`}>
                <UploadCloud className="w-10 h-10" />
              </div>
              <h3 className="text-[#1a2b4b] text-xl font-bold mb-2">Drag and drop your CSV file</h3>
              <p className="text-gray-400 text-sm font-medium mb-8">or click below to browse from your computer</p>
              
              <input 
                type="file" 
                accept=".csv"
                ref={fileInputRef}
                onChange={(e) => processFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label 
                htmlFor="file-upload"
                className="bg-black text-white px-8 py-3.5 rounded-xl font-bold text-sm cursor-pointer hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                Browse Files
              </label>
            </div>
          ) : (
            /* File Selected / Ready State */
            <div className="border border-slate-100 rounded-[2rem] p-8 bg-slate-50 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-slate-100 text-emerald-500 relative">
                <FileText className="w-8 h-8" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white border-2 border-white">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              
              <h3 className="text-[#1a2b4b] text-xl font-bold mb-1 truncate max-w-[200px]">{selectedFile.name}</h3>
              <p className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest mb-8 border border-emerald-100">
                {parsedData.length} records detected
              </p>
            </div>
          )}
        </div>
      )}

        {/* Upload Action */}
        <div className="sticky bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 -mx-4 -mb-4 lg:-mx-8 lg:-mb-8 px-4 lg:px-8 py-4 lg:py-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 mt-8 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto text-slate-500 font-bold text-[15px] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all px-6 py-3.5 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className={`w-full sm:w-auto flex items-center justify-center space-x-3 bg-[#0557cc] text-white px-12 py-3.5 rounded-xl font-bold hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group whitespace-nowrap`}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                <span>Upload Customers</span>
              </>
            )}
          </button>
        </div>

    </div>
  );
};

export default BulkUploadCustomers;
