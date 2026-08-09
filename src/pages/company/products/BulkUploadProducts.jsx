import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, UploadCloud, FileText, Download, 
  CheckCircle2, AlertCircle, Loader2, X, CloudUpload,
  Image as ImageIcon, FileCheck, Layers, Info
} from 'lucide-react';
import { extractStructuredText } from '../../../utils/pdfTextExtractor';
import productApi from '../../../services/productApi';

const BulkUploadProducts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const csvInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const pdfInputRef = useRef(null);


  const [isDraggingCsv, setIsDraggingCsv] = useState(false);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  
  const [selectedCsv, setSelectedCsv] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [imageAssignments, setImageAssignments] = useState([]);
  const [pdfAssignments, setPdfAssignments] = useState([]);
  const [matches, setMatches] = useState({ images: 0, pdfs: 0 });
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [pdfParsedData, setPdfParsedData] = useState(null);
  const [isPdfParsing, setIsPdfParsing] = useState(false);
  const [pdfParseError, setPdfParseError] = useState(null);
  const [activeSource, setActiveSource] = useState('csv');
  
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
  const activeData = activeSource === 'pdf' ? pdfParsedData : parsedData;
  const hasProductData = Boolean(activeData?.length);

  useEffect(() => {
    if (!activeData) {
      setMatches({ images: 0, pdfs: 0 });
      return;
    }

    const assignedImages = imageAssignments.filter((item) => item.assignedIndex !== null).length;
    const assignedPdfs = pdfAssignments.filter((item) => item.assignedIndex !== null).length;
    setMatches({ images: assignedImages, pdfs: assignedPdfs });
  }, [activeData, imageAssignments, pdfAssignments]);

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
    setImageAssignments([]);
    setPdfAssignments([]);
    setErrorMsg(null);
  };

  const handleCsvFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setErrorMsg("Please upload a valid .csv file.");
      return;
    }
    setSelectedCsv(file);
    setParsedData(null);
    setImageAssignments([]);
    setPdfAssignments([]);
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target.result);
    reader.readAsText(file);
  };

  const handlePdfFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setPdfParseError('Please upload a valid .pdf file.');
      return;
    }

    setSelectedPdf(file);
    setPdfParsedData(null);
    setParsedData(null);
    setImageAssignments([]);
    setPdfAssignments([]);
    setPdfParseError(null);
    setIsPdfParsing(true);

    try {
      const rawData = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: rawData }).promise;
      const rows = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const lineGroups = [];

        content.items.forEach((item) => {
          const transform = item.transform || [];
          const x = transform[4] ?? 0;
          const y = transform[5] ?? 0;
          const text = String(item.str || '').trim();
          if (!text) return;

          const existing = lineGroups.find((line) => Math.abs(line.y - y) <= 5);
          if (existing) {
            existing.items.push({ text, x });
          } else {
            lineGroups.push({ y, items: [{ text, x }] });
          }
        });

        lineGroups.sort((a, b) => b.y - a.y).forEach((line) => {
          const sortedItems = line.items.sort((a, b) => a.x - b.x);
          rows.push(sortedItems);
        });
      }

      const headerIndex = rows.findIndex((line) =>
        line.some((item) => item.text.toLowerCase().includes('sku'))
      );

      if (headerIndex === -1) {
        throw new Error('PDF validation failed: no header row containing SKU was found.');
      }

      const headerLine = rows[headerIndex];
      if (headerLine.length < 8) {
        throw new Error('PDF header row did not include the expected 8 columns.');
      }

      const boundaries = headerLine.slice(0, -1).map((item, index) =>
        (item.x + headerLine[index + 1].x) / 2
      );

      const bucketRow = (lineItems) => {
        const buckets = Array(headerLine.length).fill(null).map(() => []);
        lineItems.forEach((item) => {
          let bucketIndex = boundaries.findIndex((boundary) => item.x < boundary);
          if (bucketIndex === -1) bucketIndex = boundaries.length;
          buckets[bucketIndex].push(item.text);
        });
        return buckets.map((cells) => cells.join(' ').trim());
      };

      const records = [];
      for (let i = headerIndex + 1; i < rows.length; i++) {
        const columns = bucketRow(rows[i]);
        if (!columns[0] || !columns[1]) continue;

        records.push({
          name: columns[0],
          sku: columns[1],
          category: columns[2] || '',
          status: columns[3] || '',
          basePrice: columns[4] || '',
          currency: columns[5] || '',
          unit: columns[6] || '',
          portOfImport: columns[7] || '',
          description: '',
          addressDetail: ''
        });
      }

      if (records.length === 0) {
        throw new Error('No valid product rows were found after parsing the PDF.');
      }

      setPdfParsedData(records);
      setParsedData(records);
      setImageAssignments([]);
      setPdfAssignments([]);
      setPdfParseError(null);
    } catch (err) {
      setPdfParseError(err.message || 'Failed to parse PDF.');
    } finally {
      setIsPdfParsing(false);
    }
  };

  const handleImageSelection = (files) => {
    const newFiles = Array.from(files || []).filter((file) => file.type?.startsWith('image/'));
    if (newFiles.length === 0) {
      setErrorMsg('Please choose valid image files.');
      return;
    }

    setImageAssignments((prev) => [
      ...prev,
      ...newFiles.map((file) => ({ file, assignedIndex: null }))
    ]);
    setErrorMsg(null);
  };

  const removeImageAssignment = (index) => {
    setImageAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePdfSelection = (files) => {
    const newFiles = Array.from(files || []).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    if (newFiles.length === 0) {
      setErrorMsg('Please choose valid PDF files.');
      return;
    }

    setPdfAssignments((prev) => [
      ...prev,
      ...newFiles.map((file) => ({ file, assignedIndex: null }))
    ]);
    setErrorMsg(null);
  };

  const removePdfAssignment = (index) => {
    setPdfAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageAssignmentChange = (assignmentIndex, value) => {
    const parsedValue = value === '' ? null : Number(value);

    setImageAssignments((prev) => prev.map((item, index) => {
      if (index === assignmentIndex) {
        return { ...item, assignedIndex: parsedValue };
      }

      if (parsedValue !== null && item.assignedIndex === parsedValue) {
        return { ...item, assignedIndex: null };
      }

      return item;
    }));
  };

  const handlePdfAssignmentChange = (assignmentIndex, value) => {
    const parsedValue = value === '' ? null : Number(value);

    setPdfAssignments((prev) => prev.map((item, index) => {
      if (index === assignmentIndex) {
        return { ...item, assignedIndex: parsedValue };
      }

      if (parsedValue !== null && item.assignedIndex === parsedValue) {
        return { ...item, assignedIndex: null };
      }

      return item;
    }));
  };

  // ── Asset Category Counts ─────────────────────────────────────────
  const getImageStats = () => {
    const totalImages = imageAssignments.length;
    const assignedImages = imageAssignments.filter((item) => item.assignedIndex !== null).length;
    const totalPdfs = pdfAssignments.length;
    const assignedPdfs = pdfAssignments.filter((item) => item.assignedIndex !== null).length;
    return { totalImages, assignedImages, totalPdfs, assignedPdfs };
  };

  const stats = getImageStats();

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
    if (!activeData) return;

    const unassignedCount = imageAssignments.filter((item) => item.assignedIndex === null).length;
    if (unassignedCount > 0) {
      setErrorMsg(`${unassignedCount} image(s) have no product assigned and will be skipped.`);
    }

    const formData = new FormData();
    formData.append('products', JSON.stringify(activeData));
    imageAssignments.forEach(({ file, assignedIndex }) => {
      if (assignedIndex !== null) {
        formData.append(`productImage_${assignedIndex}`, file);
      }
    });
    pdfAssignments.forEach(({ file, assignedIndex }) => {
      if (assignedIndex !== null) {
        formData.append(`cataloguePdf_${assignedIndex}`, file);
      }
    });

    uploadMutation.mutate(formData);
  };

  const resetState = () => {
    setSelectedCsv(null);
    setParsedData(null);
    setSelectedPdf(null);
    setPdfParsedData(null);
    setPdfParseError(null);
    setActiveSource('csv');
    setImageAssignments([]);
    setPdfAssignments([]);
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
            Import inventory items and match photos/PDFs by their position in the upload order.
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
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{activeSource === 'csv' ? 'CSV Spreadsheet Format' : 'PDF Catalogue Format'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-5 py-3 rounded-2xl font-black text-sm bg-[#145be9] text-white shadow-lg shadow-blue-500/20">
                  CSV
                </span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.15em] text-[#145be9] bg-white border border-[#145be9] hover:bg-[#f0f7ff] transition-all"
                >
                  Download CSV Template
                </button>
              </div>

              {!(activeSource === 'pdf' ? selectedPdf : selectedCsv) ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingCsv(true); }}
                  onDragLeave={() => setIsDraggingCsv(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingCsv(false);
                    const file = e.dataTransfer.files[0];
                    if (activeSource === 'csv') handleCsvFile(file);
                    else handlePdfFile(file);
                  }}
                  className={`border-3 border-dashed rounded-[2rem] p-12 lg:p-16 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                    isDraggingCsv ? 'border-[#145be9] bg-blue-50/50 scale-[1.01]' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-20 h-20 rounded-[1.75rem] bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <CloudUpload className="w-10 h-10 text-gray-300" />
                  </div>
                  <h4 className="text-[#1a2b4b] font-black text-lg mb-2">Drop your {activeSource.toUpperCase()} here</h4>
                  <p className="text-gray-400 text-sm font-medium mb-8">
                    {activeSource === 'csv' ? 'Make sure your file includes columns for Name and SKU.' : 'Upload a PDF catalogue with a SKU header row and product rows in columns.'}
                  </p>
                  <input
                    type="file"
                    accept={activeSource === 'csv' ? '.csv' : '.pdf'}
                    ref={csvInputRef}
                    onChange={(e) => activeSource === 'csv' ? handleCsvFile(e.target.files[0]) : handlePdfFile(e.target.files[0])}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="px-10 py-4 bg-white border border-gray-200 text-[#1a2b4b] font-black rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 text-sm"
                  >
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
                      <h4 className="text-[#1a2b4b] font-black text-lg truncate max-w-[250px]">{activeSource === 'csv' ? selectedCsv?.name : selectedPdf?.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Ready
                        </span>
                        <span className="text-[#1a2b4b] font-bold text-xs">{activeData?.length || 0} Products Identified</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (activeSource === 'csv') {
                        setSelectedCsv(null);
                        setParsedData(null);
                      } else {
                        setSelectedPdf(null);
                        setPdfParsedData(null);
                      }
                    }}
                    className="p-3 bg-white text-gray-400 hover:text-rose-500 rounded-xl transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {activeSource === 'pdf' && (
                <div className="mt-6 space-y-3">
                  {isPdfParsing && (
                    <div className="rounded-3xl bg-blue-50 border border-blue-100 p-5 text-blue-700 text-sm font-medium">
                      Parsing PDF catalogue, please wait...
                    </div>
                  )}
                  {pdfParseError && (
                    <div className="rounded-3xl bg-rose-50 border border-rose-100 p-5 text-rose-600 text-sm font-medium">
                      {pdfParseError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Image Assignment */}
            <div className={`bg-white rounded-[2.5rem] p-8 lg:p-10 border border-gray-100 shadow-sm transition-all ${!hasProductData ? 'opacity-70' : ''}`}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-rose-50 rounded-[1.25rem] flex items-center justify-center text-rose-500">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[#1a2b4b] font-black text-lg">2. Assign Product Images</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Manual image-to-product mapping</p>
                </div>
              </div>

              {!hasProductData ? (
                <div className="border-3 border-dashed border-gray-100 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center bg-gray-50/70">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-gray-100 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <h4 className="text-[#1a2b4b] font-black text-sm mb-1 uppercase tracking-widest">Upload product data first</h4>
                  <p className="text-gray-400 text-xs font-medium">Parse a CSV or PDF catalogue to enable image assignment.</p>
                </div>
              ) : (
                <>
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingMedia(true); }}
                    onDragLeave={() => setIsDraggingMedia(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDraggingMedia(false); handleImageSelection(e.dataTransfer.files); }}
                    className={`border-3 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                      isDraggingMedia ? 'border-rose-300 bg-rose-50/50 scale-[1.01]' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center mb-4">
                      <Layers className="w-8 h-8 text-gray-300" />
                    </div>
                    <h4 className="text-[#1a2b4b] font-black text-sm mb-1 uppercase tracking-widest">Select product images</h4>
                    <p className="text-gray-400 text-xs font-medium mb-6">Choose one or more image files and map each one to a product from the list below.</p>
                    
                    <input type="file" multiple accept="image/*" ref={mediaInputRef} onChange={(e) => handleImageSelection(e.target.files)} className="hidden" id="media-upload" />
                    <label htmlFor="media-upload" className="px-8 py-3.5 bg-[#1a2b4b] text-white font-black rounded-xl cursor-pointer hover:bg-black transition-all shadow-lg active:scale-95 text-xs">
                      Select Images
                    </label>
                  </div>

                  {imageAssignments.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                        <span>Image assignment table</span>
                        <span>{imageAssignments.filter((item) => item.assignedIndex !== null).length} of {activeData.length} products have an image assigned.</span>
                      </div>
                      <div className="space-y-3">
                        {imageAssignments.map((assignment, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-gray-50 px-3 py-3 border border-gray-100">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img
                                src={URL.createObjectURL(assignment.file)}
                                alt={assignment.file.name}
                                className="w-14 h-14 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                              />
                              <span className="truncate text-gray-700 font-semibold text-sm" title={assignment.file.name}>{assignment.file.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <select
                                value={assignment.assignedIndex ?? ''}
                                onChange={(e) => handleImageAssignmentChange(idx, e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 bg-white"
                              >
                                <option value="">-- Unassigned --</option>
                                {activeData.map((product, productIndex) => (
                                  <option key={productIndex} value={productIndex}>
                                    {productIndex + 1}. {product.name || 'Unnamed'} ({product.sku || 'No SKU'})
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => removeImageAssignment(idx)}
                                className="p-2 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 rounded-[2rem] border border-dashed border-gray-200 p-6">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">
                      <span>Catalogue PDFs</span>
                      <span>{pdfAssignments.filter((item) => item.assignedIndex !== null).length} of {activeData.length} products have a PDF assigned.</span>
                    </div>

                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingMedia(true); }}
                      onDragLeave={() => setIsDraggingMedia(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDraggingMedia(false); handlePdfSelection(e.dataTransfer.files); }}
                      className="border-2 border-dashed border-gray-200 rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center"
                    >
                      <div className="w-12 h-12 rounded-[1rem] bg-gray-50 flex items-center justify-center mb-3">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <h4 className="text-[#1a2b4b] font-black text-sm mb-1 uppercase tracking-widest">Upload catalogues</h4>
                      <p className="text-gray-400 text-xs font-medium mb-4">Attach a PDF catalogue to any product row below.</p>
                      <input type="file" multiple accept=".pdf" ref={pdfInputRef} onChange={(e) => handlePdfSelection(e.target.files)} className="hidden" id="pdf-upload" />
                      <label htmlFor="pdf-upload" className="px-6 py-3 bg-white border border-gray-200 text-[#1a2b4b] font-black rounded-xl cursor-pointer hover:bg-gray-50 transition-all text-xs">
                        Select PDFs
                      </label>
                    </div>

                    {pdfAssignments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {pdfAssignments.map((assignment, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-gray-50 px-3 py-3 border border-gray-100">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-14 h-14 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0">
                                <FileText className="w-6 h-6" />
                              </div>
                              <span className="truncate text-gray-700 font-semibold text-sm" title={assignment.file.name}>{assignment.file.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <select
                                value={assignment.assignedIndex ?? ''}
                                onChange={(e) => handlePdfAssignmentChange(idx, e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 bg-white"
                              >
                                <option value="">-- Unassigned --</option>
                                {activeData.map((product, productIndex) => (
                                  <option key={productIndex} value={productIndex}>
                                    {productIndex + 1}. {product.name || 'Unnamed'} ({product.sku || 'No SKU'})
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => removePdfAssignment(idx)}
                                className="p-2 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
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
                    <span className="text-2xl font-black">{activeData?.length || 0}</span>
                 </div>
                 <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-gray-300 font-bold text-sm">Images Selected</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black block">{stats.totalImages}</span>
                      <span className="text-[10px] font-black text-emerald-400 uppercase">Files</span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <Layers className="w-5 h-5 text-rose-400" />
                      </div>
                      <span className="text-gray-300 font-bold text-sm">PDF Catalogues</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black block">{stats.totalPdfs}</span>
                      <span className="text-[10px] font-black text-rose-400 uppercase">Files</span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-gray-300 font-bold text-sm">Assigned Images</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black block">{matches.images}</span>
                      <span className="text-[10px] font-black text-emerald-400 uppercase">Pairs</span>
                    </div>
                 </div>

                 <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                        <Layers className="w-5 h-5 text-rose-400" />
                      </div>
                      <span className="text-gray-300 font-bold text-sm">Assigned PDFs</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black block">{matches.pdfs}</span>
                      <span className="text-[10px] font-black text-rose-400 uppercase">Pairs</span>
                    </div>
                 </div>
               </div>

               <div className="mt-8 pt-8 border-t border-white/10 relative z-10 flex items-start gap-4">
                 <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-300 flex-shrink-0">
                    <Info className="w-4 h-4" />
                 </div>
                 <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                   Media files are assigned in upload order: the 1st file goes to the 1st product row, the 2nd to the 2nd, and so on. Extensions like .png, .jpg, .webp, and .pdf are supported.
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
          disabled={!activeData || uploadMutation.isPending}
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
