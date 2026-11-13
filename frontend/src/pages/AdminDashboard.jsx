import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, UserPlus, Edit, Trash2, Building2, PlusCircle,
  FileText, ClipboardCheck, ShieldAlert, Calendar, ListChecks,
  SlidersHorizontal, Layers, CheckCircle, Factory, BarChart3,
  Search, X, Loader, AlertTriangle, Eye, ExternalLink
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
          ? "bg-[#2A0D0D]/95 border-red-500/50 text-red-400" 
          : isLoading 
          ? "bg-[#1A1005]/95 border-[#ff9100]/50 text-[#ff9100]" 
          : "bg-[#0A1A10]/95 border-emerald-500/50 text-emerald-400"
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

  // Active Section: 'forms' (Default when entering Admin page) | 'users' | 'companies'
  const [activeSection, setActiveSection] = useState("forms");

  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================
  // 1. ALL 10 CONSULTANCY FORMS
  // ==========================================
  const formsList = [
    {
      id: "process-change-requisition",
      name: "Process Change Requisition Form",
      qf: "QF/07/MRO-15",
      rev: "Rev.03 (04.10.2021)",
      category: "Change Management",
      icon: FileText,
      description: "Initiate and classify 4M (Man, Machine, Material, Method) process changes across foundry and machine shop.",
    },
    {
      id: "feasibility-report",
      name: "Feasibility Report for Change Request",
      qf: "QF/07/MRO-02",
      rev: "Rev.01 (10.06.2015)",
      category: "Engineering Evaluation",
      icon: ClipboardCheck,
      description: "CFT technical review, machine capacity, inspection requirement, and resource evaluation.",
    },
    {
      id: "risk-analysis",
      name: "Risk Analysis Check Sheet",
      qf: "QF/07/MKT-14",
      rev: "Rev.02 (13.02.2019)",
      category: "Risk & Quality Assurance",
      icon: ShieldAlert,
      description: "Multi-point risk matrix for 4M categories evaluating severity, controls, and QCD impact.",
    },
    {
      id: "timing-plan",
      name: "Timing Plan",
      qf: "QF/01/MKT-09",
      rev: "Rev.05 (01.12.2024)",
      category: "APQP & Milestones",
      icon: Calendar,
      description: "APQP 5-phase schedule tracking customer enquiry, feasibility, tooling, and SOP implementation.",
    },
    {
      id: "change-tracking-1",
      name: "Checklist for Managing and Tracking Change (Part 1)",
      qf: "QF/07/MRO-03",
      rev: "Part 1 (01.12.2003)",
      category: "Engineering & Drawings",
      icon: ListChecks,
      description: "Drawing revisions, material specifications, control plan, and documentation changes.",
    },
    {
      id: "change-tracking-2",
      name: "Checklist for Managing and Tracking Change (Part 2)",
      qf: "QF/07/MRO-03",
      rev: "Part 2 (01.12.2003)",
      category: "Tooling & Quality",
      icon: SlidersHorizontal,
      description: "Gauge calibration, tool life study, boundary samples, and FMEA updates.",
    },
    {
      id: "change-tracking-3",
      name: "Checklist for Managing and Tracking Change (Part 3)",
      qf: "QF/07/MRO-03",
      rev: "Part 3 (01.12.2003)",
      category: "Process Trials & Parameters",
      icon: Layers,
      description: "Trial batch validation, melting/machining parameter logs, and initial capability check.",
    },
    {
      id: "change-tracking-4",
      name: "Checklist for Managing and Tracking Change (Part 4)",
      qf: "QF/07/MRO-03",
      rev: "Part 4 (01.12.2003)",
      category: "Final Signoff",
      icon: CheckCircle,
      description: "CFT signoff, plant head endorsement, customer notification, and ERP closeout.",
    },
    {
      id: "ptr-initiation",
      name: "PTR Initiation Form",
      qf: "QF/07/MRO-16",
      rev: "Rev.01 (14.08.2017)",
      category: "Production Trials",
      icon: Factory,
      description: "Production Trial Run authorization and trial lot inspection record.",
    },
    {
      id: "ppap-initiation",
      name: "PPAP Initiation Form cum Production Report",
      qf: "QF/07/MRO-05",
      rev: "Rev.01 (20.08.2016)",
      category: "PPAP Submission",
      icon: BarChart3,
      description: "Level 1-5 PPAP package initiation, run-at-rate validation, and PSW internal sign-off.",
    },
  ];

  // ==========================================
  // 2. USERS & ROLES STATE
  // ==========================================
  const [users, setUsers] = useState([
    { id: 1, employeeId: "EMP001", username: "admin", role: "admin", department: "Management" },
    { id: 2, employeeId: "EMP002", username: "supervisor1", role: "supervisor", department: "ShopFloor" },
    { id: 3, employeeId: "EMP003", username: "cft_leader", role: "cft", department: "CrossFunctionalTeam" },
    { id: 4, employeeId: "EMP004", username: "planthead", role: "planthead", department: "PlantHead" },
    { id: 5, employeeId: "EMP005", username: "operator1", role: "operator", department: "Machining" },
    { id: 6, employeeId: "EMP006", username: "quality_head", role: "quality_head", department: "Quality Assurance" },
  ]);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userFormData, setUserFormData] = useState({
    id: "",
    employeeId: "",
    username: "",
    password: "",
    role: "operator",
    department: "Machining",
  });

  // ==========================================
  // 3. COMPANIES MANAGEMENT STATE
  // ==========================================
  const [companies, setCompanies] = useState([
    {
      id: 1,
      code: "SAC-001",
      name: "Sakthi Auto Component Limited",
      division: "Foundry Division & Machine Shop",
      plant: "Pallagoundenpalayam, Tirupur",
      contactPerson: "Corporate Operations",
      email: "contact@sakthiauto.com",
      status: "Active",
      isHost: true,
    },
    {
      id: 2,
      code: "TAT-102",
      name: "Tata Motors Limited",
      division: "Commercial & Passenger Vehicles",
      plant: "Pune / Sanand",
      contactPerson: "OEM Sourcing Head",
      email: "procurement@tatamotors.com",
      status: "Active",
      isHost: false,
    },
    {
      id: 3,
      code: "ASH-204",
      name: "Ashok Leyland Limited",
      division: "Commercial Vehicle Division",
      plant: "Ennore / Hosur",
      contactPerson: "Vendor Quality Incharge",
      email: "vendor_quality@ashokleyland.com",
      status: "Active",
      isHost: false,
    },
    {
      id: 4,
      code: "HYU-301",
      name: "Hyundai Motor India Ltd",
      division: "Powertrain & Chassis Division",
      plant: "Sriperumbudur, Chennai",
      contactPerson: "Supplier Development Manager",
      email: "sdm@hmil.net",
      status: "Active",
      isHost: false,
    },
    {
      id: 5,
      code: "MSI-405",
      name: "Maruti Suzuki India Limited",
      division: "Driveline & Brake Components",
      plant: "Gurugram / Manesar",
      contactPerson: "Purchase & Quality Head",
      email: "sqa@maruti.co.in",
      status: "Active",
      isHost: false,
    },
    {
      id: 6,
      code: "MAH-508",
      name: "Mahindra & Mahindra Ltd",
      division: "Automotive & Farm Equipment",
      plant: "Chakan / Zaheerabad",
      contactPerson: "Lead QA Engineer",
      email: "component_qa@mahindra.com",
      status: "Active",
      isHost: false,
    },
  ]);

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    id: "",
    code: "",
    name: "",
    division: "",
    plant: "",
    contactPerson: "",
    email: "",
    status: "Active",
  });

  // Modal for Form Action / Quick Preview
  const [previewModal, setPreviewModal] = useState({ show: false, form: null });

  // Role Definitions & Display Badges
  const roleBadges = {
    admin: { label: "Admin", bg: "bg-red-500/20 text-red-400 border-red-500/40" },
    planthead: { label: "Plant Head", bg: "bg-purple-500/20 text-purple-400 border-purple-500/40" },
    cft: { label: "CFT Leader", bg: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
    quality_head: { label: "Quality Head", bg: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
    supervisor: { label: "Supervisor", bg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" },
    operator: { label: "Operator", bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
    hod: { label: "HOD", bg: "bg-orange-500/20 text-orange-400 border-orange-500/40" },
  };

  // Fetch users from backend if available
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/auth/users", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data.users && data.users.length > 0) {
            setUsers(data.users);
          }
        }
      } catch (e) {
        // Fallback to initial seeded users
      }
    };
    fetchUsers();
  }, []);

  // Handle Save User
  const handleSaveUser = (e) => {
    e.preventDefault();
    if (isEditingUser) {
      setUsers(users.map((u) => (u.id === userFormData.id ? { ...u, ...userFormData } : u)));
      setNotification({ show: true, type: "success", message: `User "${userFormData.username}" updated successfully!` });
    } else {
      const newUser = {
        ...userFormData,
        id: Date.now(),
      };
      setUsers([...users, newUser]);
      setNotification({ show: true, type: "success", message: `New user "${userFormData.username}" added with role "${userFormData.role}"!` });
    }
    setIsUserModalOpen(false);
  };

  // Handle Delete User
  const handleDeleteUser = (id, username) => {
    if (window.confirm(`Are you sure you want to remove user "${username}"?`)) {
      setUsers(users.filter((u) => u.id !== id));
      setNotification({ show: true, type: "success", message: `User "${username}" deleted.` });
    }
  };

  // Handle Save Company
  const handleSaveCompany = (e) => {
    e.preventDefault();
    if (isEditingCompany) {
      setCompanies(companies.map((c) => (c.id === companyFormData.id ? { ...c, ...companyFormData } : c)));
      setNotification({ show: true, type: "success", message: `Company "${companyFormData.name}" updated successfully!` });
    } else {
      const newComp = {
        ...companyFormData,
        id: Date.now(),
        code: companyFormData.code.toUpperCase(),
        isHost: false,
      };
      setCompanies([...companies, newComp]);
      setNotification({ show: true, type: "success", message: `Company "${companyFormData.name}" added successfully!` });
    }
    setIsCompanyModalOpen(false);
  };

  // Handle Delete Company
  const handleDeleteCompany = (id, name, isHost) => {
    if (isHost) {
      alert("Sakthi Auto Component Limited is the host corporate organization and cannot be deleted.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete company "${name}"?`)) {
      setCompanies(companies.filter((c) => c.id !== id));
      setNotification({ show: true, type: "success", message: `Company "${name}" removed.` });
    }
  };

  // Filtered lists
  const filteredUsers = users.filter((u) =>
    (u.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.employeeId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.department || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredForms = formsList.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.qf.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.plant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.division.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#1e1e1e] text-gray-200 flex flex-col font-sans">
      <NotificationToast data={notification} onClose={() => setNotification((prev) => ({ ...prev, show: false }))} />

      {/* Top Main Navigation Header */}
      <Header />

      {/* Main Administrative Workplace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        
        {/* =========================================================================
            LEFT NAVIGATION PANEL (TOP TO BOTTOM)
            Sections:
            1. Add / Manage Users along with roles
            2. Forms Directory & Preview (All 10 Consultancy Forms)
            3. Companies (Show current companies & Add company)
        ========================================================================= */}
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-3">
          <div className="bg-[#2d2d2d] border border-[#3f3f3f] rounded-2xl p-4 shadow-xl">
            <div className="px-3 py-2 border-b border-[#3f3f3f] mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9100]">
                Admin Control Center
              </span>
              <h2 className="text-sm font-black text-white uppercase tracking-wider mt-0.5">
                Management Modules
              </h2>
            </div>

            <nav className="flex flex-col gap-2">
              {/* SECTION 1: FORMS DIRECTORY / PREVIEW (FIRST BY DEFAULT) */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("forms");
                  setSearchQuery("");
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  activeSection === "forms"
                    ? "bg-gradient-to-r from-blue-500/20 to-blue-500/5 border-blue-500 text-white shadow-lg"
                    : "bg-[#252525] border-[#383838] text-gray-400 hover:text-white hover:bg-[#333333]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${
                    activeSection === "forms"
                      ? "bg-blue-600 text-white border-blue-400"
                      : "bg-[#1e1e1e] text-gray-400 border-[#383838]"
                  }`}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider">
                      Preview All Forms
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      10 Consultancy Forms
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-blue-400">
                  10
                </span>
              </button>

              {/* SECTION 2: ADD / MANAGE USERS */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("users");
                  setSearchQuery("");
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  activeSection === "users"
                    ? "bg-gradient-to-r from-[#ff9100]/20 to-[#ff9100]/5 border-[#ff9100] text-white shadow-lg"
                    : "bg-[#252525] border-[#383838] text-gray-400 hover:text-white hover:bg-[#333333]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${
                    activeSection === "users"
                      ? "bg-[#ff9100] text-white border-[#ffaa33]"
                      : "bg-[#1e1e1e] text-gray-400 border-[#383838]"
                  }`}>
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider">
                      Add / Manage Users
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      Roles & Privileges
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-[#ff9100]">
                  {users.length}
                </span>
              </button>

              {/* SECTION 3: COMPANIES */}
              <button
                type="button"
                onClick={() => {
                  setActiveSection("companies");
                  setSearchQuery("");
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  activeSection === "companies"
                    ? "bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 border-emerald-500 text-white shadow-lg"
                    : "bg-[#252525] border-[#383838] text-gray-400 hover:text-white hover:bg-[#333333]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${
                    activeSection === "companies"
                      ? "bg-emerald-600 text-white border-emerald-400"
                      : "bg-[#1e1e1e] text-gray-400 border-[#383838]"
                  }`}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider">
                      Companies
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">
                      Clients & Plant Hubs
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-emerald-400">
                  {companies.length}
                </span>
              </button>
            </nav>
          </div>
        </aside>

        {/* =========================================================================
            RIGHT MAIN DISPLAY WORKSPACE
        ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#2d2d2d] border border-[#3f3f3f] rounded-2xl p-6 sm:p-8 shadow-2xl">
          
          {/* =========================================================================
              VIEW 1: ADD / MANAGE USERS ALONG WITH ROLES
          ========================================================================= */}
          {activeSection === "users" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#3f3f3f]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ff9100] bg-[#ff9100]/10 px-2.5 py-1 rounded-md border border-[#ff9100]/30">
                      User Management
                    </span>
                    <span className="text-xs text-gray-400 font-mono">({users.length} Active Accounts)</span>
                  </div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-wider mt-1">
                    System Users & Roles
                  </h1>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employee, role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-[#3f3f3f] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#ff9100] focus:bg-[#1e1e1e] focus:text-white"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setIsEditingUser(false);
                      setUserFormData({
                        id: "",
                        employeeId: `EMP${String(users.length + 1).padStart(3, "0")}`,
                        username: "",
                        password: "",
                        role: "operator",
                        department: "Machining",
                      });
                      setIsUserModalOpen(true);
                    }}
                    className="bg-[#ff9100] hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 whitespace-nowrap border border-[#ffaa33]"
                  >
                    <UserPlus size={16} /> Add User
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-xl border border-[#3f3f3f] bg-[#222222]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#181818] text-gray-300 border-b border-[#3f3f3f]">
                    <tr>
                      <th className="p-4 w-32 font-black uppercase tracking-wider text-[10px]">Emp ID</th>
                      <th className="p-4 font-black uppercase tracking-wider text-[10px]">Username</th>
                      <th className="p-4 font-black uppercase tracking-wider text-[10px]">Role Privilege</th>
                      <th className="p-4 font-black uppercase tracking-wider text-[10px]">Department</th>
                      <th className="p-4 w-28 text-center font-black uppercase tracking-wider text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          No users found matching &ldquo;{searchQuery}&rdquo;.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const roleInfo = roleBadges[user.role?.toLowerCase()] || {
                          label: user.role,
                          bg: "bg-gray-700 text-gray-300 border-gray-600",
                        };
                        return (
                          <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="p-4 font-mono font-bold text-[#ff9100]">
                              {user.employeeId}
                            </td>
                            <td className="p-4 font-bold text-white text-sm">
                              {user.username}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${roleInfo.bg}`}>
                                {roleInfo.label}
                              </span>
                            </td>
                            <td className="p-4 text-gray-300 font-medium">
                              {user.department || "General"}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  title="Edit User"
                                  onClick={() => {
                                    setIsEditingUser(true);
                                    setUserFormData({
                                      id: user.id,
                                      employeeId: user.employeeId,
                                      username: user.username,
                                      password: "",
                                      role: user.role,
                                      department: user.department || "General",
                                    });
                                    setIsUserModalOpen(true);
                                  }}
                                  className="p-2 rounded-lg bg-[#2d2d2d] border border-[#3f3f3f] text-blue-400 hover:text-white hover:bg-blue-600 transition-all"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  title="Delete User"
                                  onClick={() => handleDeleteUser(user.id, user.username)}
                                  className="p-2 rounded-lg bg-[#2d2d2d] border border-[#3f3f3f] text-red-400 hover:text-white hover:bg-red-600 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: FORMS DIRECTORY & PREVIEW (ALL 10 CONSULTANCY FORMS)
          ========================================================================= */}
          {activeSection === "forms" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#3f3f3f]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/30">
                      Standard Quality Forms
                    </span>
                    <span className="text-xs text-gray-400 font-mono">(10 Forms Active)</span>
                  </div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-wider mt-1">
                    Form Preview & Operating Records
                  </h1>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search form by name or QF..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#3f3f3f] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:bg-[#1e1e1e] focus:text-white"
                  />
                </div>
              </div>

              {/* Form Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredForms.map((form) => {
                  const FormIcon = form.icon || FileText;
                  return (
                    <div
                      key={form.id}
                      className="bg-[#242424] border border-[#3a3a3a] rounded-2xl p-5 hover:border-blue-500/50 transition-all flex flex-col justify-between gap-4 group hover:shadow-xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3.5 rounded-xl bg-[#1e1e1e] border border-[#3a3a3a] text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                          <FormIcon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-black font-mono text-[#ff9100] bg-orange-950/40 border border-[#ff9100]/30 px-2 py-0.5 rounded-md">
                              {form.qf}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {form.rev}
                            </span>
                          </div>
                          <h3 className="font-bold text-white text-sm leading-snug group-hover:text-blue-300 transition-colors">
                            {form.name}
                          </h3>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#333333] flex items-center justify-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewModal({ show: true, form })}
                            title="Quick Preview"
                            className="bg-[#1e1e1e] hover:bg-[#333333] text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-[#3f3f3f] transition-all"
                          >
                            <Eye size={13} /> Preview
                          </button>
                          <button
                            onClick={() => navigate(`/forms/${form.id}`)}
                            title="Open / Fill Form"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
                          >
                            <ExternalLink size={13} /> Open
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: COMPANIES (CURRENT COMPANIES & ADD COMPANY)
          ========================================================================= */}
          {activeSection === "companies" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#3f3f3f]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                      Corporate Network
                    </span>
                    <span className="text-xs text-gray-400 font-mono">({companies.length} Registered Companies)</span>
                  </div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-wider mt-1">
                    Automotive Companies & Clients
                  </h1>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search company or plant..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-[#3f3f3f] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500 focus:bg-[#1e1e1e] focus:text-white"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setIsEditingCompany(false);
                      setCompanyFormData({
                        id: "",
                        code: `OEM-${String(companies.length + 1).padStart(3, "0")}`,
                        name: "",
                        division: "Commercial & Passenger Vehicles",
                        plant: "",
                        contactPerson: "",
                        email: "",
                        status: "Active",
                      });
                      setIsCompanyModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 whitespace-nowrap border border-emerald-400"
                  >
                    <PlusCircle size={16} /> Add Company
                  </button>
                </div>
              </div>

              {/* Companies Table */}
              <div className="overflow-x-auto rounded-xl border border-[#3f3f3f] bg-[#222222]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#181818] text-gray-300 border-b border-[#3f3f3f]">
                    <tr>
                      <th className="p-4 w-28 font-black uppercase tracking-wider text-[10px]">Code</th>
                      <th className="p-4 font-black uppercase tracking-wider text-[10px]">Company Name</th>
                      <th className="p-4 font-black uppercase tracking-wider text-[10px]">Division / Sector</th>
                      <th className="p-4 font-black uppercase tracking-wider text-[10px]">Plant Location</th>
                      <th className="p-4 w-28 text-center font-black uppercase tracking-wider text-[10px]">Status</th>
                      <th className="p-4 w-28 text-center font-black uppercase tracking-wider text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333333]">
                    {filteredCompanies.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-4 font-mono font-black text-emerald-400">
                          {c.code}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {c.name}
                            {c.isHost && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#ff9100]/20 border border-[#ff9100]/40 text-[#ff9100]">
                                Host
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-300 font-medium">
                          {c.division}
                        </td>
                        <td className="p-4 text-gray-300 font-medium">
                          {c.plant}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            c.status === "Active"
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-600/40"
                              : "bg-red-950/60 text-red-400 border border-red-600/40"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              title="Edit Company"
                              onClick={() => {
                                setIsEditingCompany(true);
                                setCompanyFormData(c);
                                setIsCompanyModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-[#2d2d2d] border border-[#3f3f3f] text-blue-400 hover:text-white hover:bg-blue-600 transition-all"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              title="Delete Company"
                              disabled={c.isHost}
                              onClick={() => handleDeleteCompany(c.id, c.name, c.isHost)}
                              className={`p-2 rounded-lg bg-[#2d2d2d] border border-[#3f3f3f] ${
                                c.isHost
                                  ? "text-gray-600 cursor-not-allowed opacity-50"
                                  : "text-red-400 hover:text-white hover:bg-red-600 transition-all"
                              }`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* =========================================================================
          MODAL 1: ADD / EDIT USER MODAL
          Completely fixes the "white screen" / unstyled select dropdown error!
      ========================================================================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#2d2d2d] border border-[#4a4a4a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#1f1f1f] px-6 py-4 flex justify-between items-center border-b border-[#ff9100]">
              <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <Users size={16} className="text-[#ff9100]" />
                {isEditingUser ? "Edit System User" : "Add New System User"}
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-gray-400 hover:text-white bg-black/20 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Employee ID
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. EMP007"
                  value={userFormData.employeeId}
                  onChange={(e) => setUserFormData({ ...userFormData, employeeId: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#4a4a4a] p-3 rounded-xl text-white text-xs outline-none focus:border-[#ff9100] focus:bg-[#1e1e1e] focus:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Username
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. j.saravanan"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#4a4a4a] p-3 rounded-xl text-white text-xs outline-none focus:border-[#ff9100] focus:bg-[#1e1e1e] focus:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Password {isEditingUser && "(Leave blank to keep unchanged)"}
                </label>
                <input
                  type="password"
                  placeholder={isEditingUser ? "••••••••" : "Enter secure password"}
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#4a4a4a] p-3 rounded-xl text-white text-xs outline-none focus:border-[#ff9100] focus:bg-[#1e1e1e] focus:text-white"
                />
              </div>

              {/* Styled Role Selector (NO WHITE SCREEN ERROR) */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Role Privilege
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  className="w-full bg-[#1e1e1e] text-white border border-[#4a4a4a] p-3 rounded-xl text-xs outline-none focus:border-[#ff9100] focus:bg-[#1e1e1e] focus:text-white"
                >
                  <option value="admin" className="bg-[#1e1e1e] text-white py-2">Admin (Full System Access)</option>
                  <option value="planthead" className="bg-[#1e1e1e] text-white py-2">Plant Head (Approving Authority)</option>
                  <option value="cft" className="bg-[#1e1e1e] text-white py-2">CFT Leader (Cross-Functional Team)</option>
                  <option value="quality_head" className="bg-[#1e1e1e] text-white py-2">Quality Head (QA / QC Lead)</option>
                  <option value="supervisor" className="bg-[#1e1e1e] text-white py-2">Supervisor (Shop Floor Lead)</option>
                  <option value="operator" className="bg-[#1e1e1e] text-white py-2">Operator (Line Operations)</option>
                  <option value="hod" className="bg-[#1e1e1e] text-white py-2">Department HOD</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Machine Shop, Foundry, Quality"
                  value={userFormData.department}
                  onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#4a4a4a] p-3 rounded-xl text-white text-xs outline-none focus:border-[#ff9100] focus:bg-[#1e1e1e] focus:text-white"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 bg-[#1e1e1e] py-3 text-xs font-black uppercase text-gray-400 rounded-xl hover:text-white border border-[#4a4a4a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#ff9100] hover:bg-orange-500 text-white py-3 text-xs font-black uppercase tracking-wider rounded-xl border border-[#ffaa33] shadow-lg"
                >
                  {isEditingUser ? "Update User" : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD / EDIT COMPANY MODAL
      ========================================================================= */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#2d2d2d] border border-[#4a4a4a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-[#1f1f1f] px-6 py-4 flex justify-between items-center border-b border-emerald-500">
              <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <Building2 size={16} className="text-emerald-500" />
                {isEditingCompany ? "Edit Company" : "Add Automotive Company"}
              </h3>
              <button
                type="button"
                onClick={() => setIsCompanyModalOpen(false)}
                className="text-gray-400 hover:text-white bg-black/20 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCompany} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Company Code
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. TAT-102"
                  value={companyFormData.code}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, code: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#4a4a4a] p-3 rounded-xl text-white text-xs outline-none focus:border-emerald-500 focus:bg-[#1e1e1e] focus:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Company Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ashok Leyland Ltd"
                  value={companyFormData.name}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#4a4a4a] p-3 rounded-xl text-white text-xs outline-none focus:border-emerald-500 focus:bg-[#1e1e1e] focus:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Division / Sector
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Commercial Vehicles, Chassis"
                  value={companyFormData.division}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, division: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#4a4a4a] p-3 rounded-xl text-white text-xs outline-none focus:border-emerald-500 focus:bg-[#1e1e1e] focus:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                  Plant / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chennai / Hosur"
                  value={companyFormData.plant}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, plant: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-[#4a4a4a] p-3 rounded-xl text-white text-xs outline-none focus:border-emerald-500 focus:bg-[#1e1e1e] focus:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. QA Manager"
                    value={companyFormData.contactPerson}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, contactPerson: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-[#4a4a4a] p-3 rounded-xl text-white text-xs outline-none focus:border-emerald-500 focus:bg-[#1e1e1e] focus:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">
                    Status
                  </label>
                  <select
                    value={companyFormData.status}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, status: e.target.value })}
                    className="w-full bg-[#1e1e1e] text-white border border-[#4a4a4a] p-3 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-[#1e1e1e] focus:text-white"
                  >
                    <option value="Active" className="bg-[#1e1e1e] text-white">Active</option>
                    <option value="Inactive" className="bg-[#1e1e1e] text-white">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="flex-1 bg-[#1e1e1e] py-3 text-xs font-black uppercase text-gray-400 rounded-xl hover:text-white border border-[#4a4a4a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 text-xs font-black uppercase tracking-wider rounded-xl border border-emerald-400 shadow-lg"
                >
                  {isEditingCompany ? "Update Company" : "Save Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: QUICK FORM PREVIEW MODAL
      ========================================================================= */}
      {previewModal.show && previewModal.form && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#2d2d2d] border border-[#4a4a4a] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="bg-[#1f1f1f] px-6 py-4 flex justify-between items-center border-b border-blue-500">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-400" />
                <h3 className="text-white font-black text-sm uppercase tracking-wider">
                  {previewModal.form.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal({ show: false, form: null })}
                className="text-gray-400 hover:text-white bg-black/20 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#1e1e1e] p-4 rounded-xl border border-[#3f3f3f] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#ff9100]">Document Code</span>
                  <span className="text-xs font-mono font-black text-white">{previewModal.form.qf}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Effective Revision</span>
                  <span className="text-xs font-mono text-gray-300">{previewModal.form.rev}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Classification</span>
                  <span className="text-xs font-bold text-blue-400">{previewModal.form.category}</span>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed bg-[#242424] p-3.5 rounded-xl border border-[#3a3a3a]">
                {previewModal.form.description}
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewModal({ show: false, form: null })}
                  className="flex-1 bg-[#1e1e1e] py-3 text-xs font-black uppercase text-gray-400 rounded-xl hover:text-white border border-[#4a4a4a]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetId = previewModal.form.id;
                    setPreviewModal({ show: false, form: null });
                    navigate(`/forms/${targetId}`);
                  }}
                  className="flex-[1.5] bg-blue-600 hover:bg-blue-500 text-white py-3 text-xs font-black uppercase tracking-wider rounded-xl border border-blue-400 shadow-lg flex items-center justify-center gap-2"
                >
                  <ExternalLink size={15} /> Open Form Full View
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
