import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileDown, Calendar, Users, X, Loader, AlertTriangle, CheckCircle,
  Settings, Edit, Trash2, UserPlus, Eye, BookOpen, Clock,
  BarChart3, Factory, Layers, ListChecks, ClipboardCheck,
  ShieldAlert, SlidersHorizontal, Package, PlusSquare, FileText
} from "lucide-react";
import Header from "../components/Header";

const NotificationToast = ({ data, onClose }) => {
  const isError = data.type === "error";
  const isLoading = data.type === "loading";

  useEffect(() => {
    if (data.show && !isLoading) {
      const timer = setTimeout(() => onClose(), 3500);
      return () => clearTimeout(timer);
    }
  }, [data.show, isLoading, onClose]);

  if (!data.show) return null;

  return (
    <div className="fixed top-24 right-6 z-[2000] animate-in slide-in-from-right-8 duration-300">
      <div className={`flex items-center gap-4 px-6 py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md border ${
        isError 
          ? "bg-[#2A0D0D]/90 border-red-500/50 text-red-400" 
          : isLoading 
          ? "bg-[#1A1005]/90 border-[#ff9100]/50 text-[#ff9100]" 
          : "bg-[#0A1A10]/90 border-green-500/50 text-green-400"
      }`}>
        <div className="flex-shrink-0 bg-black/20 p-2 rounded-lg shadow-inner">
          {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : isError ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
        </div>
        <div className="flex flex-col">
          <h4 className="text-[10px] font-black tracking-widest uppercase mb-0.5 opacity-80">
            {isLoading ? "System Processing" : isError ? "System Alert" : "Success"}
          </h4>
          <p className="text-sm font-bold tracking-wide">{data.message}</p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("grid");
  const [actionModal, setActionModal] = useState({ show: false, selectedForm: null });
  const [pdfModal, setPdfModal] = useState({ show: false, selectedForm: null });
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [datePickerModal, setDatePickerModal] = useState({ show: false, selectedForm: null });
  const [viewDate, setViewDate] = useState("");
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // === 10 CONSULTANCY FORMS (Exact names requested) ===
  const forms = [
    { name: "Change Requisition Form", id: "change-requisition", icon: FileText, qf: "QF/07/MRO-15" },
    { name: "Feasibility Report for Change Request", id: "feasibility-report", icon: ClipboardCheck, qf: "QF/07/MRO-02" },
    { name: "Risk Analysis Check Sheet", id: "risk-analysis", icon: ShieldAlert, qf: "QF/07/MKT-14" },
    { name: "Timing Plan", id: "timing-plan", icon: Calendar, qf: "QF/01/MKT-09" },
    { name: "Checklist for Managing and Tracking Change (Part 1 - Engineering & Docs)", id: "change-tracking-1", icon: ListChecks, qf: "QF/07/MRO-03" },
    { name: "Checklist for Managing and Tracking Change (Part 2 - Tooling & Quality)", id: "change-tracking-2", icon: SlidersHorizontal, qf: "QF/07/MRO-03" },
    { name: "Checklist for Managing and Tracking Change (Part 3 - Trial & Process Specs)", id: "change-tracking-3", icon: Layers, qf: "QF/07/MRO-03" },
    { name: "Checklist for Managing and Tracking Change (Part 4 - Implementation & Signoff)", id: "change-tracking-4", icon: CheckCircle, qf: "QF/07/MRO-03" },
    { name: "PTR Initiation Form", id: "ptr-initiation", icon: Factory, qf: "QF/07/MRO-16" },
    { name: "PPAP Initiation Form cum Production Report", id: "ppap-initiation", icon: BarChart3, qf: "QF/07/MRO-05" },

    // CORE SAKTHI ADMIN OPTIONS (Preserved with exact UI)
    { name: "Manage QF Values", id: "qf-settings", isSpecial: true, icon: BookOpen },
    { name: "Add / Manage Users", id: "users", isSpecial: true, icon: Users },
    { name: "Add / Manage Components", id: "components", isSpecial: true, icon: Package }, 
    { name: "Add / Manage Delays", id: "delays", isSpecial: true, icon: Clock },
  ];

  // ==========================================
  // USERS MANAGEMENT STATE
  // ==========================================
  const [users, setUsers] = useState([
    { id: 1, employeeId: "EMP-001", username: "admin", role: "admin" },
    { id: 2, employeeId: "EMP-042", username: "cft_leader", role: "supervisor" },
    { id: 3, employeeId: "EMP-088", username: "quality_head", role: "hod" },
    { id: 4, employeeId: "EMP-104", username: "foundry_operator", role: "operator" },
  ]);
  const [isAddUserModal, setIsAddUserModal] = useState(false);
  const [isEditUserModal, setIsEditUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ id: "", username: "", employeeId: "", password: "", role: "operator" });

  // ==========================================
  // COMPONENTS MANAGEMENT STATE
  // ==========================================
  const [components, setComponents] = useState([
    { code: "SK-BRK-01", description: "Brake Caliper Housing", pouredWeight: 4.85, cavity: 2, castedWeight: 3.20, isActive: "Active" },
    { code: "SK-STR-04", description: "Steering Knuckle L/R", pouredWeight: 6.20, cavity: 2, castedWeight: 4.55, isActive: "Active" },
    { code: "SK-HUB-02", description: "Wheel Hub Front", pouredWeight: 3.40, cavity: 4, castedWeight: 2.15, isActive: "Active" },
  ]);
  const [isCompModal, setIsCompModal] = useState(false);
  const [compForm, setCompForm] = useState({ code: "", description: "", pouredWeight: "", cavity: "", castedWeight: "", isActive: "Active" });

  // ==========================================
  // DELAYS MANAGEMENT STATE
  // ==========================================
  const [delays, setDelays] = useState([
    { id: 1, reasonName: "Pattern Alignment Check" },
    { id: 2, reasonName: "Core Mask Setting Delay" },
    { id: 3, reasonName: "Sand Moisture Adjustment" },
    { id: 4, reasonName: "First Moulding Quality Check" },
  ]);
  const [isDelayModal, setIsDelayModal] = useState(false);
  const [delayForm, setDelayForm] = useState({ id: "", reasonName: "" });

  // ==========================================
  // QF VALUES STATE
  // ==========================================
  const [qfSettings] = useState([
    { formName: "Change Requisition", qfValue: "QF/07/MRO-15", rev: "03", effectiveDate: "2021-10-04" },
    { formName: "Feasibility Report", qfValue: "QF/07/MRO-02", rev: "01", effectiveDate: "2015-06-10" },
    { formName: "Risk Analysis", qfValue: "QF/07/MKT-14", rev: "02", effectiveDate: "2019-02-13" },
    { formName: "Timing Plan", qfValue: "QF/01/MKT-09", rev: "05", effectiveDate: "2024-12-01" },
    { formName: "Checklist Tracking", qfValue: "QF/07/MRO-03", rev: "01", effectiveDate: "2003-12-01" },
    { formName: "PTR Initiation", qfValue: "QF/07/MRO-16", rev: "01", effectiveDate: "2017-08-14" },
    { formName: "PPAP Initiation", qfValue: "QF/07/MRO-05", rev: "01", effectiveDate: "2016-08-20" },
  ]);

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (isEditUserModal) {
      setUsers(users.map(u => u.id === userForm.id ? userForm : u));
      setIsEditUserModal(false);
      setNotification({ show: true, type: "success", message: "User updated successfully" });
    } else {
      const newUser = { ...userForm, id: Date.now() };
      setUsers([...users, newUser]);
      setIsAddUserModal(false);
      setNotification({ show: true, type: "success", message: "User added successfully" });
    }
  };

  const handleSaveComponent = (e) => {
    e.preventDefault();
    setComponents([...components, compForm]);
    setIsCompModal(false);
    setNotification({ show: true, type: "success", message: "Component added successfully" });
  };

  const handleSaveDelay = (e) => {
    e.preventDefault();
    const newD = { id: delays.length + 1, reasonName: delayForm.reasonName };
    setDelays([...delays, newD]);
    setIsDelayModal(false);
    setNotification({ show: true, type: "success", message: "Delay reason added successfully" });
  };

  // Handle Card Click
  const handleGridClick = (form) => {
    if (form.isSpecial) {
      setActiveView(form.id);
    } else {
      setActionModal({ show: true, selectedForm: form });
    }
  };

  const handleOpenFormDirectly = (form) => {
    setActionModal({ show: false, selectedForm: null });
    navigate(`/forms/${form.id}`);
  };

  const handleExportPdf = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPdfModal({ show: false, selectedForm: null });
      setNotification({ show: true, type: "success", message: `Report "${pdfModal.selectedForm?.name}" exported successfully!` });
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-[#2d2d2d] flex flex-col relative font-sans">
      <NotificationToast data={notification} onClose={() => setNotification((prev) => ({ ...prev, show: false }))} />

      {/* Subtle Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,145,0,0.03)_0%,transparent_70%)] pointer-events-none"></div>

      <Header />

      {/* =========================================================================
          VIEW 1: USERS MANAGEMENT
      ========================================================================= */}
      {activeView === "users" && (
        <div className="flex-1 flex flex-col items-center py-10 px-6 relative z-10 max-w-[1400px] mx-auto w-full">
          <button
            onClick={() => setActiveView("grid")}
            className="self-start mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-[#383838] hover:bg-[#4a4a4a] px-5 py-2.5 rounded-xl border border-[#4a4a4a] shadow-md font-bold uppercase tracking-wider text-xs"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="bg-[#383838] border border-[#4a4a4a] w-full rounded-2xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center border-b border-[#4a4a4a] pb-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#ff9100]/10 p-3 rounded-xl border border-[#ff9100]/30 shadow-inner">
                  <Users size={28} className="text-[#ff9100]" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-tight">System Users</h1>
                  <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-[0.2em]">Manage access & privileges</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setUserForm({ id: "", username: "", employeeId: "", password: "", role: "operator" });
                  setIsAddUserModal(true);
                }}
                className="bg-[#ff9100] hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-[0_4px_15px_rgba(255,145,0,0.3)] flex items-center gap-2 border border-[#ffaa33]"
              >
                <UserPlus size={16} /> Add User
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#4a4a4a] shadow-inner bg-[#2d2d2d]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1A2634] text-gray-300 border-b border-[#4a4a4a]">
                  <tr>
                    <th className="p-4 w-32 text-center uppercase tracking-widest text-[10px] font-black">Emp ID</th>
                    <th className="p-4 uppercase tracking-widest text-[10px] font-black">Username</th>
                    <th className="p-4 w-48 uppercase tracking-widest text-[10px] font-black">Role Privilege</th>
                    <th className="p-4 w-32 text-center uppercase tracking-widest text-[10px] font-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4a4a4a]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 text-center font-black text-gray-500 font-mono tracking-wider group-hover:text-[#ff9100] transition-colors">{u.employeeId}</td>
                      <td className="p-4 font-bold text-gray-200 text-base">{u.username}</td>
                      <td className="p-4">
                        <span className="bg-[#222] border border-[#4a4a4a] text-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-inner">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => {
                              setUserForm(u);
                              setIsEditUserModal(true);
                            }}
                            className="bg-[#222] border border-[#4a4a4a] p-2 rounded-lg text-blue-400 hover:text-white hover:bg-blue-600 transition-all shadow-sm"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setUsers(users.filter(x => x.id !== u.id));
                              setNotification({ show: true, type: "success", message: "User deleted" });
                            }}
                            className="bg-[#222] border border-[#4a4a4a] p-2 rounded-lg text-red-500 hover:text-white hover:bg-red-600 transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: COMPONENTS MANAGEMENT
      ========================================================================= */}
      {activeView === "components" && (
        <div className="flex-1 flex flex-col items-center py-10 px-6 relative z-10 max-w-[1400px] mx-auto w-full">
          <button
            onClick={() => setActiveView("grid")}
            className="self-start mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-[#383838] hover:bg-[#4a4a4a] px-5 py-2.5 rounded-xl border border-[#4a4a4a] shadow-md font-bold uppercase tracking-wider text-xs"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="bg-[#383838] border border-[#4a4a4a] w-full rounded-2xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center border-b border-[#4a4a4a] pb-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-900/20 p-3 rounded-xl border border-blue-500/30 shadow-inner">
                  <Package size={28} className="text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-tight">Master Components</h1>
                  <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-[0.2em]">Part codes, weights & cavities</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCompForm({ code: "", description: "", pouredWeight: "", cavity: "", castedWeight: "", isActive: "Active" });
                  setIsCompModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-lg flex items-center gap-2 border border-blue-400"
              >
                <PlusSquare size={16} /> Add Component
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#4a4a4a] shadow-inner bg-[#2d2d2d]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1A2634] text-gray-300 border-b border-[#4a4a4a]">
                  <tr>
                    <th className="p-4 uppercase tracking-widest text-[10px] font-black">Part Code</th>
                    <th className="p-4 uppercase tracking-widest text-[10px] font-black">Description</th>
                    <th className="p-4 text-center uppercase tracking-widest text-[10px] font-black">Poured Wt (kg)</th>
                    <th className="p-4 text-center uppercase tracking-widest text-[10px] font-black">Cavity</th>
                    <th className="p-4 text-center uppercase tracking-widest text-[10px] font-black">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4a4a4a]">
                  {components.map((c) => (
                    <tr key={c.code} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-black text-blue-400 font-mono tracking-wider">{c.code}</td>
                      <td className="p-4 font-bold text-gray-200">{c.description}</td>
                      <td className="p-4 text-center font-mono font-bold text-gray-300">{c.pouredWeight}</td>
                      <td className="p-4 text-center font-mono font-bold text-gray-300">{c.cavity}</td>
                      <td className="p-4 text-center">
                        <span className="bg-green-900/30 text-green-400 border border-green-500/40 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          {c.isActive}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: DELAYS MANAGEMENT
      ========================================================================= */}
      {activeView === "delays" && (
        <div className="flex-1 flex flex-col items-center py-10 px-6 relative z-10 max-w-[1400px] mx-auto w-full">
          <button
            onClick={() => setActiveView("grid")}
            className="self-start mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-[#383838] hover:bg-[#4a4a4a] px-5 py-2.5 rounded-xl border border-[#4a4a4a] shadow-md font-bold uppercase tracking-wider text-xs"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="bg-[#383838] border border-[#4a4a4a] w-full rounded-2xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center border-b border-[#4a4a4a] pb-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-900/20 p-3 rounded-xl border border-purple-500/30 shadow-inner">
                  <Clock size={28} className="text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-tight">Delay Reasons</h1>
                  <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-[0.2em]">Manage Production Delays</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDelayForm({ id: "", reasonName: "" });
                  setIsDelayModal(true);
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-lg flex items-center gap-2 border border-purple-400"
              >
                <PlusSquare size={16} /> Add Delay
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#4a4a4a] shadow-inner bg-[#2d2d2d]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1A2634] text-gray-300 border-b border-[#4a4a4a]">
                  <tr>
                    <th className="p-4 w-24 text-center uppercase tracking-widest text-[10px] font-black">ID</th>
                    <th className="p-4 uppercase tracking-widest text-[10px] font-black">Reason Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4a4a4a]">
                  {delays.map((d) => (
                    <tr key={d.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-center font-black text-purple-400 font-mono">{d.id}</td>
                      <td className="p-4 font-bold text-gray-200">{d.reasonName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: MANAGE QF VALUES
      ========================================================================= */}
      {activeView === "qf-settings" && (
        <div className="flex-1 flex flex-col items-center py-10 px-6 relative z-10 max-w-[1400px] mx-auto w-full">
          <button
            onClick={() => setActiveView("grid")}
            className="self-start mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-[#383838] hover:bg-[#4a4a4a] px-5 py-2.5 rounded-xl border border-[#4a4a4a] shadow-md font-bold uppercase tracking-wider text-xs"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="bg-[#383838] border border-[#4a4a4a] w-full rounded-2xl p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 border-b border-[#4a4a4a] pb-6 mb-6">
              <div className="bg-[#ff9100]/10 p-3 rounded-xl border border-[#ff9100]/30 shadow-inner">
                <BookOpen size={28} className="text-[#ff9100]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-widest leading-tight">Quality Form (QF) Values</h1>
                <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase tracking-[0.2em]">Form document numbers, rev numbers & dates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qfSettings.map((qf, idx) => (
                <div key={idx} className="bg-[#2d2d2d] border border-[#4a4a4a] p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">{qf.formName}</h3>
                    <p className="font-mono text-xs text-[#ff9100] font-black">{qf.qfValue} (Rev: {qf.rev})</p>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-[#222] px-3 py-1.5 rounded-lg border border-[#4a4a4a]">
                    Eff: {qf.effectiveDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN GRID VIEW (10 Consultancy Forms + Admin Specials)
      ========================================================================= */}
      {activeView === "grid" && (
        <div className="flex-1 flex flex-col items-center px-6 py-12 relative z-10 w-full max-w-[1500px] mx-auto">
          
          {/* Header Title */}
          <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-[0.2em] uppercase mb-3 drop-shadow-md">
              Sakthi Process Change & Quality Command Center
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-orange-600 via-[#ff9100] to-orange-600 mx-auto rounded-full shadow-[0_0_10px_rgba(255,145,0,0.5)]"></div>
            <p className="mt-3 text-xs uppercase tracking-widest text-gray-400 font-bold">
              Consultancy Standard Operating Forms • Centralized Tracking System
            </p>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full pb-10">
            {forms.map((form, index) => {
              const IconComponent = form.icon || Settings;
              return (
                <button
                  key={form.id}
                  onClick={() => handleGridClick(form)}
                  style={{ animationDelay: `${index * 40}ms` }}
                  className={`
                    group relative flex flex-col items-center justify-center p-8 
                    bg-[#383838] border border-[#4a4a4a] rounded-2xl
                    shadow-[0_8px_20px_rgba(0,0,0,0.3)]
                    hover:-translate-y-1.5 active:translate-y-0
                    transition-all duration-300 ease-out
                    animate-in fade-in zoom-in-95 fill-mode-both overflow-hidden text-center
                    ${form.isSpecial 
                        ? "hover:border-transparent hover:bg-gradient-to-br hover:from-red-900/80 hover:to-[#0A121C] hover:shadow-[0_15px_30px_rgba(220,38,38,0.2)]" 
                        : "hover:border-transparent hover:bg-gradient-to-br hover:from-[#ff9100] hover:to-[#e68200] hover:shadow-[0_15px_30px_rgba(255,145,0,0.3)]"
                    }
                  `}
                >
                  <div className={`mb-5 p-4 rounded-full border shadow-inner transition-colors duration-300 
                    ${form.isSpecial 
                        ? "bg-[#2A0D0D] border-red-900/50 group-hover:bg-white/10 group-hover:border-white/20" 
                        : "bg-[#2d2d2d] border-[#4a4a4a] group-hover:bg-white/20 group-hover:border-white/30"
                    }
                  `}>
                    <IconComponent className={`w-8 h-8 drop-shadow-md transition-colors duration-300
                      ${form.isSpecial 
                          ? "text-red-500 group-hover:text-red-400" 
                          : "text-[#ff9100] group-hover:text-white"
                      }
                    `} strokeWidth={2.5} />
                  </div>

                  <span className={`text-[13px] font-bold text-center tracking-wide leading-snug drop-shadow-sm transition-colors duration-300 mb-2
                    ${form.isSpecial ? "text-gray-300 group-hover:text-white" : "text-gray-200 group-hover:text-white"}
                  `}>
                    {form.name}
                  </span>

                  {form.qf && (
                    <span className="text-[10px] font-mono font-black text-gray-400 group-hover:text-white/80 bg-[#222] group-hover:bg-black/30 px-2.5 py-0.5 rounded-full border border-[#4a4a4a] group-hover:border-white/20">
                      {form.qf}
                    </span>
                  )}

                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 rounded-t-full transition-all duration-300 opacity-50
                    ${form.isSpecial ? "bg-red-500 group-hover:w-1/2" : "bg-white group-hover:w-1/3"}
                  `}></div>
                </button>
              );
            })}
          </div>

        </div>
      )}

      {/* Bottom Glowing Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-[#ff9100] to-orange-600 relative z-20 shadow-[0_-2px_10px_rgba(255,145,0,0.5)]" />

      {/* =========================================================================
          ACTION MODAL (When clicking any of the 10 forms)
      ========================================================================= */}
      {actionModal.show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#383838] border border-[#4a4a4a] w-full max-w-xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden scale-in relative">
            <div className="h-20 bg-[#1A2634] border-b-2 border-[#ff9100] relative flex items-center justify-center">
              <h3 className="text-lg font-black text-white uppercase tracking-widest drop-shadow-md flex items-center gap-2">
                <Settings size={18} className="text-[#ff9100]" /> Form Routing & Actions
              </h3>
              <button 
                onClick={() => setActionModal({ show: false, selectedForm: null })} 
                className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-white bg-black/20 p-2 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-8 py-8 flex flex-col items-center gap-6">
              <div className="bg-[#2d2d2d] border border-[#4a4a4a] w-full p-4 rounded-xl text-center shadow-inner">
                <p className="text-[10px] font-black text-[#ff9100] uppercase tracking-[0.3em] mb-1">Target Form</p>
                <h2 className="text-lg font-bold text-white leading-tight">{actionModal.selectedForm?.name}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {/* 1. Open / Fill Form */}
                <button
                  onClick={() => handleOpenFormDirectly(actionModal.selectedForm)}
                  className="group flex flex-col items-center justify-center gap-3 bg-[#2d2d2d] border border-[#4a4a4a] hover:bg-[#1A2634] hover:border-[#ff9100] p-5 rounded-xl transition-all shadow-md"
                >
                  <div className="bg-[#222] border border-[#4a4a4a] p-3 rounded-lg group-hover:bg-orange-900/30 group-hover:border-[#ff9100]/50 transition-colors shadow-inner">
                    <FileText className="w-6 h-6 text-[#ff9100]" />
                  </div>
                  <div className="text-center">
                    <div className="text-white font-black uppercase tracking-wider text-xs mb-0.5">Open Form</div>
                    <div className="text-gray-500 text-[9px] uppercase font-bold tracking-widest">Entry / Edit</div>
                  </div>
                </button>

                {/* 2. Export PDF */}
                <button
                  onClick={() => {
                    setPdfModal({ show: true, selectedForm: actionModal.selectedForm });
                    setActionModal({ show: false, selectedForm: null });
                  }}
                  className="group flex flex-col items-center justify-center gap-3 bg-[#2d2d2d] border border-[#4a4a4a] hover:bg-[#1A2634] hover:border-blue-500 p-5 rounded-xl transition-all shadow-md"
                >
                  <div className="bg-[#222] border border-[#4a4a4a] p-3 rounded-lg group-hover:bg-blue-900/30 group-hover:border-blue-500/50 transition-colors shadow-inner">
                    <FileDown className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-white font-black uppercase tracking-wider text-xs mb-0.5">Export PDF</div>
                    <div className="text-gray-500 text-[9px] uppercase font-bold tracking-widest">Bulk Download</div>
                  </div>
                </button>

                {/* 3. View by Date */}
                <button
                  onClick={() => {
                    setDatePickerModal({ show: true, selectedForm: actionModal.selectedForm });
                    setActionModal({ show: false, selectedForm: null });
                  }}
                  className="group flex flex-col items-center justify-center gap-3 bg-[#2d2d2d] border border-[#4a4a4a] hover:bg-[#1A2634] hover:border-green-500 p-5 rounded-xl transition-all shadow-md"
                >
                  <div className="bg-[#222] border border-[#4a4a4a] p-3 rounded-lg group-hover:bg-green-900/30 group-hover:border-green-500/50 transition-colors shadow-inner">
                    <Calendar className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-white font-black uppercase tracking-wider text-xs mb-0.5">Lookup Date</div>
                    <div className="text-gray-500 text-[9px] uppercase font-bold tracking-widest">Audit Archive</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PDF EXPORT MODAL
      ========================================================================= */}
      {pdfModal.show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#383838] border border-[#4a4a4a] w-full max-w-md rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="bg-[#1A2634] px-6 py-5 border-b-2 border-blue-500 flex justify-between items-center">
              <h3 className="font-black text-sm text-white uppercase tracking-widest flex items-center gap-2">
                <FileDown size={18} className="text-blue-500" /> Export PDF Record
              </h3>
              <button onClick={() => setPdfModal({ show: false, selectedForm: null })} className="text-gray-400 hover:text-white bg-black/20 p-1.5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="bg-[#2d2d2d] border border-[#4a4a4a] rounded-xl p-3 text-center shadow-inner">
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Target Document</div>
                <div className="text-sm font-bold text-white uppercase leading-tight">{pdfModal.selectedForm?.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Start Date</label>
                  <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="w-full bg-[#222] border border-[#4a4a4a] rounded-xl p-3 text-white text-xs outline-none focus:border-blue-500 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">End Date</label>
                  <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="w-full bg-[#222] border border-[#4a4a4a] rounded-xl p-3 text-white text-xs outline-none focus:border-blue-500 [color-scheme:dark]" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setPdfModal({ show: false, selectedForm: null })} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-300 bg-[#222] border border-[#4a4a4a] rounded-xl">Cancel</button>
                <button onClick={handleExportPdf} disabled={loading} className="flex-[1.5] bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
                  {loading ? <Loader className="animate-spin w-4 h-4" /> : <FileDown className="w-4 h-4" />}
                  {loading ? "Exporting..." : "Generate PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          USER MODAL
      ========================================================================= */}
      {(isAddUserModal || isEditUserModal) && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#383838] border border-[#4a4a4a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#1A2634] px-6 py-4 flex justify-between items-center border-b border-[#ff9100]">
              <h3 className="text-white font-black text-sm uppercase tracking-wider">{isAddUserModal ? "Add System User" : "Edit User"}</h3>
              <button onClick={() => { setIsAddUserModal(false); setIsEditUserModal(false); }} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Employee ID</label>
                <input required type="text" value={userForm.employeeId} onChange={e => setUserForm({ ...userForm, employeeId: e.target.value })} className="w-full bg-[#222] border border-[#4a4a4a] p-2.5 rounded-lg text-white text-xs outline-none focus:border-[#ff9100]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Username</label>
                <input required type="text" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} className="w-full bg-[#222] border border-[#4a4a4a] p-2.5 rounded-lg text-white text-xs outline-none focus:border-[#ff9100]" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Role</label>
                <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="w-full bg-[#222] border border-[#4a4a4a] p-2.5 rounded-lg text-white text-xs outline-none">
                  <option value="operator">Operator</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="hod">HOD</option>
                  <option value="hof">HOF</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => { setIsAddUserModal(false); setIsEditUserModal(false); }} className="flex-1 bg-[#222] py-2.5 text-xs font-black uppercase text-gray-400 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-[#ff9100] text-white py-2.5 text-xs font-black uppercase rounded-lg">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          COMPONENT MODAL
      ========================================================================= */}
      {isCompModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#383838] border border-[#4a4a4a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#1A2634] px-6 py-4 flex justify-between items-center border-b border-blue-500">
              <h3 className="text-white font-black text-sm uppercase tracking-wider">Add Component</h3>
              <button onClick={() => setIsCompModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveComponent} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Part Code</label>
                <input required type="text" value={compForm.code} onChange={e => setCompForm({ ...compForm, code: e.target.value })} className="w-full bg-[#222] border border-[#4a4a4a] p-2.5 rounded-lg text-white text-xs outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Description</label>
                <input required type="text" value={compForm.description} onChange={e => setCompForm({ ...compForm, description: e.target.value })} className="w-full bg-[#222] border border-[#4a4a4a] p-2.5 rounded-lg text-white text-xs outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Poured Wt (kg)</label>
                  <input type="number" step="0.01" value={compForm.pouredWeight} onChange={e => setCompForm({ ...compForm, pouredWeight: e.target.value })} className="w-full bg-[#222] border border-[#4a4a4a] p-2.5 rounded-lg text-white text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Cavity</label>
                  <input type="number" value={compForm.cavity} onChange={e => setCompForm({ ...compForm, cavity: e.target.value })} className="w-full bg-[#222] border border-[#4a4a4a] p-2.5 rounded-lg text-white text-xs outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setIsCompModal(false)} className="flex-1 bg-[#222] py-2.5 text-xs font-black uppercase text-gray-400 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 text-xs font-black uppercase rounded-lg">Save Part</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELAY MODAL
      ========================================================================= */}
      {isDelayModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#383838] border border-[#4a4a4a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#1A2634] px-6 py-4 flex justify-between items-center border-b border-purple-500">
              <h3 className="text-white font-black text-sm uppercase tracking-wider">Add Delay Reason</h3>
              <button onClick={() => setIsDelayModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveDelay} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Reason Name</label>
                <input required type="text" placeholder="e.g. Mold Clamp Inspection" value={delayForm.reasonName} onChange={e => setDelayForm({ ...delayForm, reasonName: e.target.value })} className="w-full bg-[#222] border border-[#4a4a4a] p-2.5 rounded-lg text-white text-xs outline-none focus:border-purple-500" />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setIsDelayModal(false)} className="flex-1 bg-[#222] py-2.5 text-xs font-black uppercase text-gray-400 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2.5 text-xs font-black uppercase rounded-lg">Save Delay</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {datePickerModal.show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#383838] border border-[#4a4a4a] w-full max-w-sm rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="bg-[#1A2634] px-6 py-5 border-b-2 border-green-500 flex justify-between items-center">
              <h3 className="font-black text-sm text-white uppercase tracking-widest flex items-center gap-2">
                <Calendar size={18} className="text-green-500" /> Date Lookup
              </h3>
              <button onClick={() => setDatePickerModal({ show: false, selectedForm: null })} className="text-gray-400 hover:text-white bg-black/20 p-1.5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="bg-[#2d2d2d] border border-[#4a4a4a] rounded-xl p-3 text-center shadow-inner">
                <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Audit Record</div>
                <div className="text-sm font-bold text-white uppercase leading-tight">{datePickerModal.selectedForm?.name}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Target Shift Date</label>
                <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="w-full bg-[#222] border border-[#4a4a4a] rounded-xl p-3 text-white text-xs outline-none focus:border-green-500 [color-scheme:dark]" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDatePickerModal({ show: false, selectedForm: null })} className="flex-1 py-3 text-xs font-black uppercase text-gray-300 bg-[#222] border border-[#4a4a4a] rounded-xl">Cancel</button>
                <button 
                  disabled={!viewDate} 
                  onClick={() => {
                    const formId = datePickerModal.selectedForm?.id;
                    setDatePickerModal({ show: false, selectedForm: null });
                    navigate(`/forms/${formId}?date=${viewDate}`);
                  }} 
                  className="flex-[1.5] bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Load Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
