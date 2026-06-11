import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, UploadCloud, FileText, Download, 
  CheckCircle2, AlertCircle, Loader2, X, CloudUpload,
  Image as ImageIcon, FileCheck, Layers, Info
} from 'lucide-react';
import productApi from '../../../services/productApi';

const BulkUploadProducts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const csvInputRef = useRef(null);
  const mediaInputRef = useRef(null);

  const [isDraggingCsv, setIsDraggingCsv] = useState(false);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  
  const [selectedCsv, setSelectedCsv] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [matches, setMatches] = useState({ images: 0, pdfs: 0 });
  
  const [errorMsg, setErrorMsg] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);

  // ── CSV Template Download ─────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const headers = "name,sku,category,description,basePrice,unit,currency,status,portOfImport,addressDetail\n";
    const sample = "Black Granite Paving,MAT-GRN-001,Materials,Premium 20mm granite slabs,45.50,sqm,INR,active,Mundra Port,Warehouse A-4\n";
    
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "product_import_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Smart Matching Logic ──────────────────────────────────────────
  useEffect(() => {
    if (!parsedData || mediaFiles.length === 0) {
      setMatches({ images: 0, pdfs: 0 });
      return;
    }

    const skus = new Set(parsedData.map(p => p.sku.toLowerCase().trim()));
    let imageMatches = 0;
    let pdfMatches = 0;

    mediaFiles.forEach(file => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')).toLowerCase().trim();
      
      if (skus.has(baseName)) {
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) imageMatches++;
        else if (ext === '.pdf') pdfMatches++;
      }
    });

    setMatches({ images: imageMatches, pdfs: pdfMatches });
  }, [parsedData, mediaFiles]);

  // ── CSV Parsing ──────────────────────────────────────────────────
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setErrorMsg("File must contain at least a header row and one data row.");
      return;
    }
    
    const headerMapping = {
      'name': 'name',
      'product name': 'name',
      'sku': 'sku',
      'item code': 'sku',
      'category': 'category',
      'description': 'description',
      'baseprice': 'basePrice',
      'base price': 'basePrice',
      'price': 'basePrice',
      'unit': 'unit',
      'currency': 'currency',
      'status': 'status',
      'portofimport': 'portOfImport',
      'port': 'portOfImport',
      'addressdetail': 'addressDetail',
      'warehouse': 'addressDetail'
    };

    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const headers = rawHeaders.map(h => {
      const normalizedKey = h.toLowerCase().replace(/_/g, ' ');
      return headerMapping[normalizedKey] || h;
    });

    if (!headers.includes('sku') || !headers.includes('name')) {
      setErrorMsg('CSV validation failed: Missing required "name" or "sku" columns.');
      return;
    }

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
        const row = {};
        headers.forEach((h, index) => {
            row[h] = values[index] !== undefined ? values[index] : '';
        });
        if (row.sku && row.name) records.push(row);
    }

    if (records.length === 0) {
      setErrorMsg("No valid records found. Ensure Name and SKU are provided.");
      return;
    }

    setParsedData(records);
    setErrorMsg(null);
  };

  const handleCsvFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setErrorMsg("Please upload a valid .csv file.");
      return;
    }
    setSelectedCsv(file);
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target.result);
    reader.readAsText(file);
  };

  const handleMediaFiles = (files) => {
    const newFiles = Array.from(files);
    setMediaFiles(prev => [...prev, ...newFiles]);
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ── Asset Category Counts ─────────────────────────────────────────
  const getMediaStats = () => {
    const images = mediaFiles.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f.name)).length;
    const pdfs = mediaFiles.filter(f => /\.pdf$/i.test(f.name)).length;
    return { images, pdfs };
  };

  const stats = getMediaStats();

  // ── API Upload ───────────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: productApi.bulkCreateProducts,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['products']);
      setUploadResults(response.data);
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message || 'Server error occurred during upload.');
    }
  });

  const handleUpload = () => {
    if (!parsedData) return;
    
    const formData = new FormData();
    formData.append('products', JSON.stringify(parsedData));
    mediaFiles.forEach(file => {
      formData.append('files', file);
    });

    uploadMutation.mutate(formData);
  };

  const resetState = () => {
    setSelectedCsv(null);
    setParsedData(null);
    setMediaFiles([]);
    setUploadResults(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-4 sm:p-6 lg:p-10 font-sans w-full overflow-hidden">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <button 
            onClick={() => navigate('/dashboard/products')}
            className="flex items-center text-gray-400 hover:text-[#145be9] font-bold text-[10px] uppercase tracking-[0.2em] transition-all mb-4 group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Products
          </button>
          <h1 className="text-[#1a2b4b] text-[2.5rem] font-black mb-1 tracking-tight leading-tight">Bulk Product Import</h1>
          <p className="text-gray-500 font-medium text-sm max-w-lg leading-relaxed">
            Import inventory items and automatically link photos/PDFs using SKUs.
          </p>
        </div>
        <button 
          onClick={handleDownloadTemplate}
          className="px-6 py-3.5 rounded-[1.25rem] text-sm font-bold text-white bg-[#0557cc] hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2.5 active:scale-95"
        >
          <Download className="w-5 h-5" />
          <span>Download Template</span>
        </button>
      </div>

      {uploadResults ? (
        /* ── Results View ── */
        <div className="bg-white rounded-[2.5rem] p-12 lg:p-20 border border-gray-100 shadow-sm text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-4xl font-black text-[#1a2b4b] mb-4">Import Successful</h2>
          
          <div className="flex items-center justify-center space-x-6 lg:space-x-10 mb-12">
            <div className="bg-[#f8fafc] rounded-3xl p-8 min-w-[180px] border border-gray-50">
              <div className="text-emerald-500 font-black text-5xl mb-2">{uploadResults.created}</div>
              <div className="text-gray-400 font-black text-[11px] uppercase tracking-widest">Added to Ledger</div>
            </div>
            <div className="bg-[#f8fafc] rounded-3xl p-8 min-w-[180px] border border-gray-50">
              <div className="text-rose-500 font-black text-5xl mb-2">{uploadResults.skipped}</div>
              <div className="text-gray-400 font-black text-[11px] uppercase tracking-widest">Skipped Items</div>
            </div>
          </div>

          {uploadResults.errors && uploadResults.errors.length > 0 && (
            <div className="max-w-2xl mx-auto text-left bg-rose-50/30 border border-rose-100 rounded-3xl p-8 mb-12">
              <h4 className="flex items-center text-rose-800 font-black text-xs uppercase tracking-[0.15em] mb-4">
                <AlertCircle className="w-4 h-4 mr-2" /> Skip Logs & Conflicts
              </h4>
              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                {uploadResults.errors.map((err, i) => (
                  <p key={i} className="text-rose-600 text-[13px] font-semibold leading-relaxed flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-200 rounded-full flex-shrink-0"></span>
                    {err}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={resetState}
              className="w-full sm:w-auto px-10 py-4 bg-gray-100 text-[#475569] font-black rounded-2xl hover:bg-gray-200 transition-all text-[15px]"
            >
              Upload New Batch
            </button>
            <Link 
              to="/dashboard/products"
              className="w-full sm:w-auto px-12 py-4 bg-[#1a2b4b] text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 text-[15px] active:scale-95"
            >
              Go to Product Management
            </Link>
          </div>
        </div>
      ) : (
        /* ── Upload Workflow ── */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Upload Area */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Step 1: CSV Data */}
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-50 rounded-[1.25rem] flex items-center justify-center text-[#145be9]">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[#1a2b4b] font-black text-lg">1. Upload Product Data</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">CSV Spreadsheet Format</p>
                </div>
              </div>

              {!selectedCsv ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingCsv(true); }}
                  onDragLeave={() => setIsDraggingCsv(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDraggingCsv(false); handleCsvFile(e.dataTransfer.files[0]); }}
                  className={`border-3 border-dashed rounded-[2rem] p-12 lg:p-16 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                    isDraggingCsv ? 'border-[#145be9] bg-blue-50/50 scale-[1.01]' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-20 h-20 rounded-[1.75rem] bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <CloudUpload className="w-10 h-10 text-gray-300" />
                  </div>
                  <h4 className="text-[#1a2b4b] font-black text-lg mb-2">Drop your CSV here</h4>
                  <p className="text-gray-400 text-sm font-medium mb-8">Make sure your file includes columns for Name and SKU.</p>
                  
                  <input type="file" accept=".csv" ref={csvInputRef} onChange={(e) => handleCsvFile(e.target.files[0])} className="hidden" id="csv-upload" />
                  <label htmlFor="csv-upload" className="px-10 py-4 bg-white border border-gray-200 text-[#1a2b4b] font-black rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 text-sm">
                    Browse Files
                  </label>
                </div>
              ) : (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-500">
                      <FileCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-[#1a2b4b] font-black text-lg truncate max-w-[250px]">{selectedCsv.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Ready
                        </span>
                        <span className="text-[#1a2b4b] font-bold text-xs">{parsedData?.length || 0} Products Identified</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedCsv(null); setParsedData(null); }}
                    className="p-3 bg-white text-gray-400 hover:text-rose-500 rounded-xl transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Media Assets */}
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-rose-50 rounded-[1.25rem] flex items-center justify-center text-rose-500">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[#1a2b4b] font-black text-lg">2. Upload Photos & PDF Catalogues</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Matched by Filename = SKU</p>
                </div>
              </div>

              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDraggingMedia(true); }}
                onDragLeave={() => setIsDraggingMedia(false)}
                onDrop={(e) => { e.preventDefault(); setIsDraggingMedia(false); handleMediaFiles(e.dataTransfer.files); }}
                className={`border-3 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                  isDraggingMedia ? 'border-rose-300 bg-rose-50/50 scale-[1.01]' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center mb-4">
                  <Layers className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="text-[#1a2b4b] font-black text-sm mb-1 uppercase tracking-widest">Bulk Media Zone</h4>
                <p className="text-gray-400 text-xs font-medium mb-6">Drop all product photos and PDFs here.</p>
                
                <input type="file" multiple accept="image/*,.pdf" ref={mediaInputRef} onChange={(e) => handleMediaFiles(e.target.files)} className="hidden" id="media-upload" />
                <label htmlFor="media-upload" className="px-8 py-3.5 bg-[#1a2b4b] text-white font-black rounded-xl cursor-pointer hover:bg-black transition-all shadow-lg active:scale-95 text-xs">
                  Select Batch Files
                </label>
              </div>

              {mediaFiles.length > 0 && (
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                  {mediaFiles.map((file, idx) => (
                    <div key={idx} className="bg-gray-50 group rounded-xl p-3 border border-gray-100 flex items-center justify-between relative truncate">
                      <div className="flex items-center gap-2.5 truncate">
                        {file.type.includes('image') ? (
                          <ImageIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        ) : (
                          <Layers className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        )}
                        <span className="text-[11px] font-black text-gray-500 truncate" title={file.name}>{file.name}</span>
                      </div>
                      <button onClick={() => removeMediaFile(idx)} className="ml-2 text-gray-300 hover:text-rose-500 p-1 flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setMediaFiles([])}
                    className="col-span-full py-3 text-center text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-500 transition-colors"
                  >
                    Clear All Files
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Status & Info */}
          <div className="space-y-8">
            <div className="bg-[#1a2b4b] rounded-[2.5rem] p-8 lg:p-10 text-white shadow-xl shadow-[#1a2b4b]/20 relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-[80px]"></div>
               
               <h3 className="font-black text-xl mb-8 relative z-10">Smart Match Status</h3>
               
               <div className="space-y-6 relative z-10">
                 <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-300" />
                      </div>
                      <span className="text-gray-300 font-bold text-sm">Target Products</span>
                    </div>
                    <span className="text-2xl font-black">{parsedData?.length || 0}</span>
                 </div>

                 <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-gray-300 font-bold text-sm">Image Matches</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black block">{matches.images}</span>
                      <span className="text-[10px] font-black text-emerald-400 uppercase">Assigned</span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                        <Layers className="w-5 h-5 text-rose-400" />
                      </div>
                      <span className="text-gray-300 font-bold text-sm">Catalogue Matches</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black block">{matches.pdfs}</span>
                      <span className="text-[10px] font-black text-rose-400 uppercase">Assigned</span>
                    </div>
                 </div>
               </div>

               <div className="mt-8 pt-8 border-t border-white/10 relative z-10 flex items-start gap-4">
                 <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-300 flex-shrink-0">
                    <Info className="w-4 h-4" />
                 </div>
                 <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                   Ensure your media files match the <span className="text-white font-black">SKU</span> exactly (e.g. <span className="bg-white/10 px-1.5 py-0.5 rounded text-blue-200">SKU001.jpg</span>). Extensions like .png, .jpg, .webp, and .pdf are supported.
                 </p>
               </div>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#1a2b4b] font-black text-sm mb-1 uppercase tracking-wider">Validation Error</p>
                  <p className="text-rose-600 text-[13px] font-medium leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="sticky bottom-4 lg:bottom-8 z-50 bg-white/95 backdrop-blur-md border border-gray-100 rounded-[2rem] p-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 mt-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={() => navigate('/dashboard/products')}
          className="w-full sm:w-auto px-10 py-4 text-[#475569] font-black text-sm hover:bg-gray-100 rounded-2xl transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!selectedCsv || uploadMutation.isPending}
          className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-blue-600 text-white px-16 py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group overflow-hidden relative"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Importing Batch...</span>
            </>
          ) : (
            <>
              <span>Initialize Bulk Import</span>
              <CloudUpload className="w-5 h-5 transform group-hover:-translate-y-1 transition-transform" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default BulkUploadProducts;
