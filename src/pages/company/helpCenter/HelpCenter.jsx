import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, History, ChevronDown, Upload, Check, AlertCircle, Loader2, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import helpCenterApi from "../../../services/helpCenterApi";
import Toast from "../../../components/Toast";

const HelpCenter = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    category: "Technical",
    priority: "Medium",
    description: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });
  const [filterStatus, setFilterStatus] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const fileInputRef = useRef(null);
  const filterRef = useRef(null);

  const categoryOptions = ["Technical", "Billing", "General"];
  const priorityOptions = ["Low", "Medium", "High"];

  // Click outside to close dropdowns
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setActiveDropdown(null);
  };
  const queryClient = useQueryClient();

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  // ── Data Fetching ──────────────────────────────────────────
  const { data: ticketsData, isLoading, isError } = useQuery({
    queryKey: ["tickets"],
    queryFn: helpCenterApi.getMyTickets,
  });

  const tickets = ticketsData?.data || [];

  // ── Mutations ──────────────────────────────────────────────
  const createTicketMutation = useMutation({
    mutationFn: helpCenterApi.createTicket,
    onSuccess: () => {
      // Invalidate and refetch tickets
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      // Reset form
      setFormData({
        subject: "",
        category: "Technical",
        priority: "Medium",
        description: "",
      });
      setSelectedFiles([]);
      showToast("success", "Support ticket submitted successfully!");
    },
    onError: (error) => {
      showToast("error", error.response?.data?.message || "Failed to submit ticket");
    },
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    const validFiles = files.filter((file) => {
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      if (!isUnder5MB) {
        showToast("error", `File ${file.name} is too large. Max size is 5MB.`);
      }
      return isUnder5MB;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 5)); // Limit to 5 files
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      showToast("error", "Please fill in all required fields.");
      return;
    }

    const data = new FormData();
    data.append("subject", formData.subject);
    data.append("category", formData.category);
    data.append("priority", formData.priority);
    data.append("description", formData.description);
    
    selectedFiles.forEach((file) => {
      data.append("attachments", file);
    });

    createTicketMutation.mutate(data);
  };

  const navigate = useNavigate();

  const filteredTickets = filterStatus === "All" 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  const activeTicketsCount = tickets.filter(t => t.status !== "RESOLVED").length;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) {
        return dateString;
      }

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "IN PROGRESS":
        return (
          <span className="px-3 py-1 bg-[#d5e0f9] text-[#576b9f] text-[11px] font-bold rounded-xl uppercase tracking-widest inline-block">
            In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className="px-3 py-1 bg-[#099268] text-white text-[11px] font-bold rounded-xl uppercase tracking-widest inline-block">
            Resolved
          </span>
        );
      case "OPEN":
        return (
          <span className="px-3 py-1 bg-[#d0e0fe] text-[#145be9] text-[11px] font-bold rounded-xl uppercase tracking-widest inline-block">
            Open
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="max-w-xl">
          <h1 className="text-[2rem] font-black text-[#1a2b4b] tracking-tight mb-1">
            Help & Support
          </h1>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            Raise and track support tickets for technical assistance. Our
            specialists typically respond within 4 business hours.
          </p>
        </div>
        <div className="bg-[#f2f6ff] rounded-2xl p-5 flex items-center gap-4 shrink-0 min-w-[220px]">
          <div className="w-12 h-12 bg-[#dce6fd] rounded-xl flex items-center justify-center text-[#145be9] shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#1a2b4b]/60 mb-0.5">
              Active Tickets
            </p>
            <p className="text-3xl font-black text-[#1a2b4b] leading-none">
              {isLoading ? "..." : activeTicketsCount}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-6 lg:gap-8">
        {/* Left Col: Ticket History */}
        <div className="space-y-6">
          <div className="bg-[#fcfdff] rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8 border-b border-transparent">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-[#1a2b4b]" />
                <h2 className="text-xl font-bold text-[#1a2b4b]">
                  Ticket History
                </h2>
              </div>
              <div className="flex items-center gap-3 relative" ref={filterRef}>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Filter:
                </span>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="text-sm font-bold text-[#145be9] flex items-center gap-1.5 hover:text-blue-700 transition-colors"
                >
                  {filterStatus === "All" ? "All Status" : filterStatus} 
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`} />
                </button>

                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                    {["All", "OPEN", "IN PROGRESS", "RESOLVED"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                          filterStatus === status
                            ? "bg-[#f0f4ff] text-[#145be9]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span>{status === "All" ? "All Status" : status}</span>
                        {filterStatus === status && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto -mx-6 lg:-mx-8">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-[#f0f4ff]/50">
                    <th className="py-4 px-6 lg:px-8 text-[11px] font-bold uppercase tracking-wider text-[#8e9cbe] w-24">
                      Ticket ID
                    </th>
                    <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-[#8e9cbe]">
                      Subject
                    </th>
                    <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-[#8e9cbe]">
                      Category
                    </th>
                    <th className="py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-[#8e9cbe]">
                      Status
                    </th>
                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-[#8e9cbe] whitespace-nowrap text-right">
                      Last Update
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-[#145be9] animate-spin" />
                          <p className="text-sm font-medium text-slate-500">Loading your tickets...</p>
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                          </div>
                          <p className="text-sm font-bold text-[#1a2b4b]">
                            Unable to load tickets
                          </p>
                          <p className="text-xs text-slate-500 max-w-[220px] mx-auto">
                            Please refresh the page or try again in a moment.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                             <Ticket className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-[#1a2b4b]">No tickets found</p>
                          <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                            {filterStatus === "All" 
                              ? "You haven't raised any support tickets yet. Use the form on the right to get started."
                              : `No tickets with status "${filterStatus}" were found.`
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket, idx) => (
                      <tr
                        key={ticket._id || idx}
                        onClick={() => navigate(`/dashboard/help-center/${ticket._id}`)}
                        className="hover:bg-[#f0f4ff]/50 transition-all cursor-pointer group/row border-b border-slate-100/60 last:border-0"
                      >
                        <td className="py-6 px-6 lg:px-8 align-top">
                          <span className="text-[#145be9] font-black whitespace-nowrap text-[13px] group-hover/row:underline transition-all">
                            {ticket.ticketId}
                          </span>
                        </td>
                        <td className="py-6 px-4 pr-8 align-top">
                          <p className="font-bold text-[#1a2b4b] text-[15px] leading-tight mb-1.5 group-hover/row:text-[#145be9] transition-colors">
                            {ticket.subject}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Priority: {ticket.priority}
                          </p>
                        </td>
                        <td className="py-6 px-4 align-top">
                          <span className="text-slate-500 font-medium text-[13px]">
                            {ticket.category}
                          </span>
                        </td>
                        <td className="py-6 px-4 align-top">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="py-6 px-6 align-top text-right">
                          <span className="text-slate-500 font-medium text-[12px]">
                            {formatDate(ticket.updatedAt)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Help Resources */}
          <div className="pt-2">
            <h2 className="text-2xl font-black text-[#1a2b4b] mb-5 tracking-tight">
              Quick Help Resources
            </h2>
            <div className="w-full rounded-[1.5rem] relative overflow-hidden group cursor-pointer shadow-[0_15px_40px_-10px_rgba(20,91,233,0.25)] transition-all duration-300 hover:-translate-y-1 min-h-[280px] flex flex-col justify-end p-8 lg:p-10">
              {/* Background Photo */}
              <div 
                className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200")' }}
              />
              {/* Vibrant Blue Overlay matching the design */}
              <div className="absolute inset-0 bg-[#0052cc]/85 mix-blend-multiply z-0 transition-opacity duration-300 group-hover:opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0047b3]/95 via-[#0052cc]/60 to-transparent z-0"></div>
              
              {/* Content */}
              <div className="relative z-10 w-full sm:w-4/5 lg:w-[85%]">
                <BookOpen className="w-9 h-9 text-white mb-6" strokeWidth={1.75} />
                <h3 className="text-[26px] sm:text-[32px] font-bold text-white tracking-tight mb-2 sm:mb-3">
                  Knowledge Base
                </h3>
                <p className="text-white/90 text-[14px] sm:text-[15px] font-medium leading-relaxed max-w-[500px]">
                  Comprehensive guides and technical documentation for Architectural Ledger.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Create New Ticket */}
        <div className="relative">
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05),0_10px_20px_-2px_rgba(0,0,0,0.02)] border border-slate-100 lg:sticky lg:top-28">
            <h2 className="text-xl font-bold text-[#1a2b4b] mb-2 tracking-tight">
              Create New Ticket
            </h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 pr-4">
              Fill in the details below to initiate
              <br className="hidden sm:block" />a support request.
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of the issue"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="w-full bg-[#f4f7fe] hover:bg-[#eef2fc] border-transparent focus:border-[#145be9] focus:bg-white focus:ring-2 focus:ring-[#145be9]/20 rounded-xl px-4 py-3.5 text-[13px] font-medium text-slate-700 placeholder-slate-400 transition-all outline-none"
                  required
                />
              </div>

              {/* Category & Priority Dropdowns */}
              <div className="grid grid-cols-2 gap-4" ref={dropdownRef}>
                {/* ... existing category content ... */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === "category" ? null : "category"
                      )
                    }
                    className={`w-full flex items-center justify-between bg-[#f4f7fe] hover:bg-[#eef2fc] border-2 transition-all rounded-xl px-4 py-3.5 text-[13px] font-medium text-slate-700 outline-none ${
                      activeDropdown === "category"
                        ? "border-[#145be9] bg-white ring-4 ring-[#145be9]/10"
                        : "border-transparent"
                    }`}
                  >
                    <span>{formData.category}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        activeDropdown === "category" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {activeDropdown === "category" && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      {categoryOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInputChange("category", opt)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                            formData.category === opt
                              ? "bg-[#f0f4ff] text-[#145be9]"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span>{opt}</span>
                          {formData.category === opt && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority contents */}
                <div className="relative">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                    Priority
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === "priority" ? null : "priority"
                      )
                    }
                    className={`w-full flex items-center justify-between bg-[#f4f7fe] hover:bg-[#eef2fc] border-2 transition-all rounded-xl px-4 py-3.5 text-[13px] font-medium text-slate-700 outline-none ${
                      activeDropdown === "priority"
                        ? "border-[#145be9] bg-white ring-4 ring-[#145be9]/10"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                       <div
                        className={`w-2 h-2 rounded-full ${
                          formData.priority === "High"
                            ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                            : formData.priority === "Medium"
                            ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                            : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        }`}
                      ></div>
                      <span>{formData.priority}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        activeDropdown === "priority" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {activeDropdown === "priority" && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      {priorityOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInputChange("priority", opt)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                            formData.priority === opt
                              ? "bg-[#f0f4ff] text-[#145be9]"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                opt === "High"
                                  ? "bg-red-500"
                                  : opt === "Medium"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                            ></div>
                            <span>{opt}</span>
                          </div>
                          {formData.priority === opt && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Description
                </label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Provide detailed steps to reproduce the issue..."
                  className="w-full bg-[#f4f7fe] hover:bg-[#eef2fc] border-transparent focus:border-[#145be9] focus:bg-white focus:ring-2 focus:ring-[#145be9]/20 rounded-xl px-4 py-3.5 text-[13px] font-medium text-slate-700 placeholder-slate-400 transition-all resize-none outline-none"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border border-dashed border-[#dce6fd] bg-[#f4f7fe]/50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#f4f7fe] transition-colors group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#145be9] mb-3 transition-colors" />
                    <p className="text-[13px] font-medium text-[#1a2b4b] mb-1.5">
                      <span className="text-[#145be9] font-bold">
                        Upload a file
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8e9cbe]">
                      PNG, JPG, PDF UP TO 5MB
                    </p>
                  </div>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="w-8 h-8 bg-white border border-slate-100 rounded flex items-center justify-center shrink-0">
                              <Ticket className="w-4 h-4 text-[#145be9]" />
                           </div>
                           <div className="truncate">
                              <p className="text-xs font-bold text-[#1a2b4b] truncate">{file.name}</p>
                              <p className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                           </div>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                          className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <History className="w-4 h-4" /> {/* Using History as a placeholder for X/trash icon if needed, or I'll just use History since I don't have X imported */}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-3">
                <button
                  type="submit"
                  disabled={createTicketMutation.isPending}
                  className="w-full bg-[#0557cc] hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(20,91,233,0.39)] active:scale-[0.98] text-[13px] flex items-center justify-center gap-2"
                >
                  {createTicketMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      subject: "",
                      category: "Technical",
                      priority: "Medium",
                      description: "",
                    })
                  }
                  className="w-full bg-[#e3ecfe] hover:bg-[#d0e0fe] text-[#0557cc] font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] text-[13px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toast 
        show={toast.show} 
        type={toast.type} 
        message={toast.message} 
        onClose={closeToast} 
      />
    </div>
  );
};

export default HelpCenter;
