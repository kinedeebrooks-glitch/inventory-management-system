import React, { useState } from "react";
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  archiveProduct, 
  restoreProduct,
  adjustStock, 
  getUsers, 
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  setImpersonation,
  getSupplierRequests,
  getSales,
  getLogs,
  getCurrencies,
  saveCurrencies,
  getSystemDefaultCurrency,
  setSystemDefaultCurrency,
  fetchExchangeRates,
  formatCurrency
} from "../dbStore";
import { Product, UserProfile, ManagerPermissions } from "../types";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Archive, 
  RotateCcw, 
  UserPlus, 
  Sliders, 
  Key, 
  AlertTriangle, 
  Users, 
  Package, 
  TrendingUp, 
  Database,
  ShieldCheck,
  UserCheck,
  Eye,
  Settings,
  FolderMinus,
  Minimize2,
  PhoneCall,
  Check,
  X,
  History,
  Lock,
  Unlock,
  Coins,
  Globe,
  RefreshCw
} from "lucide-react";

export default function AdminDashboard() {
  // DB States
  const products = getProducts();
  const users = getUsers();
  const sales = getSales();
  const requests = getSupplierRequests();
  const logs = getLogs();

  // Search/Filters
  const [searchProd, setSearchProd] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  // Modals / Dropdowns / Tabs toggle
  const [activeTab, setActiveTab] = useState<"inventory" | "users" | "stocks" | "currencies">("inventory");
  
  // Product state form
  const [showProdModal, setShowProdModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProd, setSelectedProd] = useState<Product | null>(null);
  
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCost, setProdCost] = useState(0);
  const [prodSelling, setProdSelling] = useState(0);
  const [prodQuantity, setProdQuantity] = useState(0);
  const [prodMinQty, setProdMinQty] = useState(0);
  const [prodSupplier, setProdSupplier] = useState("");

  // Stock edit state form
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockAction, setStockAction] = useState<"increase" | "reduce" | "adjust" | "transfer">("increase");
  const [stockQty, setStockQty] = useState(0);
  const [stockNote, setStockNote] = useState("");

  // User state form
  const [showUserModal, setShowUserModal] = useState(false);
  const [userMode, setUserMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userUsername, setUserUsername] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [userRole, setUserRole] = useState<"administrator" | "manager" | "staff">("staff");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userWhatsApp, setUserWhatsApp] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userPasswordPlain, setUserPasswordPlain] = useState("");

  // Reset Password auxiliary state
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdTargetUser, setPwdTargetUser] = useState<UserProfile | null>(null);
  const [newPwdPlain, setNewPwdPlain] = useState("");

  // Currency Management state form
  const [currCode, setCurrCode] = useState("");
  const [currSymbol, setCurrSymbol] = useState("");
  const [currRate, setCurrRate] = useState(1.0);
  const [isCurrEditing, setIsCurrEditing] = useState(false);
  const [currEditingOriginalCode, setCurrEditingOriginalCode] = useState<string | null>(null);
  const [currIsSyncing, setCurrIsSyncing] = useState(false);
  const [currSuccessMsg, setCurrSuccessMsg] = useState("");
  const [currErrorMsg, setCurrErrorMsg] = useState("");

  const handleCurrencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrErrorMsg("");
    setCurrSuccessMsg("");
    
    const code = currCode.trim().toUpperCase();
    const symbol = currSymbol.trim();
    const rate = Number(currRate);
    
    if (!code || !symbol || isNaN(rate) || rate <= 0) {
      setCurrErrorMsg("Please supply valid currency details. Code and symbol are required, rate must be a positive number.");
      return;
    }
    
    const currs = getCurrencies();
    
    if (isCurrEditing && currEditingOriginalCode) {
      const updated = currs.map(c => {
        if (c.code === currEditingOriginalCode) {
          return { code, symbol, rateToUSD: rate };
        }
        return c;
      });
      saveCurrencies(updated);
      
      if (getSystemDefaultCurrency() === currEditingOriginalCode) {
        setSystemDefaultCurrency(code);
      }
      
      setCurrSuccessMsg(`Currency details for ${code} with rate ${rate} updated successfully!`);
    } else {
      if (currs.some(c => c.code === code)) {
        setCurrErrorMsg(`A currency configuration for code ${code} already exists.`);
        return;
      }
      const updated = [...currs, { code, symbol, rateToUSD: rate }];
      saveCurrencies(updated);
      setCurrSuccessMsg(`Currency ${code} (${symbol}) with rate ${rate} added successfully!`);
    }
    
    setCurrCode("");
    setCurrSymbol("");
    setCurrRate(1.0);
    setIsCurrEditing(false);
    setCurrEditingOriginalCode(null);
  };

  const handleEditCurrency = (c: { code: string, symbol: string, rateToUSD: number }) => {
    setCurrCode(c.code);
    setCurrSymbol(c.symbol);
    setCurrRate(c.rateToUSD);
    setIsCurrEditing(true);
    setCurrEditingOriginalCode(c.code);
    setCurrSuccessMsg("");
    setCurrErrorMsg("");
  };

  const handleDeleteCurrency = (codeToDelete: string) => {
    setCurrErrorMsg("");
    setCurrSuccessMsg("");
    
    if (codeToDelete === "USD") {
      setCurrErrorMsg("The USD base currency is a protected asset and cannot be deleted.");
      return;
    }
    if (codeToDelete === getSystemDefaultCurrency()) {
      setCurrErrorMsg(`The currency '${codeToDelete}' is set as the System Default. Redefine the system default first before deleting.`);
      return;
    }
    
    const currs = getCurrencies();
    const updated = currs.filter(c => c.code !== codeToDelete);
    saveCurrencies(updated);
    setCurrSuccessMsg(`Supported currency configuration for ${codeToDelete} has been successfully deleted.`);
  };

  const handleFetchRatesFromAPI = async () => {
    setCurrIsSyncing(true);
    setCurrErrorMsg("");
    setCurrSuccessMsg("");
    
    const rates = await fetchExchangeRates();
    if (!rates) {
      setCurrErrorMsg("Exchange rate sync failed. Check internet access or open endpoints availability.");
      setCurrIsSyncing(false);
      return;
    }
    
    const currs = getCurrencies();
    const updated = currs.map(c => {
      if (c.code === "USD") return c;
      if (rates[c.code] !== undefined) {
        return { ...c, rateToUSD: rates[c.code] };
      }
      return c;
    });
    
    saveCurrencies(updated);
    setCurrSuccessMsg(`Online Sync Complete! Automatically synchronized exchange rate values relative to USD.`);
    setCurrIsSyncing(false);
  };

  // Active Category lists
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  // Monitor stock level alerts
  const lowStockProducts = products.filter(p => !p.isArchived && p.currentQuantity <= p.minimumQuantity);

  // Handle product save
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === "add") {
      addProduct({
        name: prodName,
        category: prodCategory || "General",
        description: prodDesc,
        costPrice: Number(prodCost),
        sellingPrice: Number(prodSelling),
        currentQuantity: Number(prodQuantity),
        minimumQuantity: Number(prodMinQty),
        supplier: prodSupplier || "Direct Wholesale",
      });
    } else if (modalMode === "edit" && selectedProd) {
      updateProduct({
        ...selectedProd,
        name: prodName,
        category: prodCategory || "General",
        description: prodDesc,
        costPrice: Number(prodCost),
        sellingPrice: Number(prodSelling),
        currentQuantity: Number(prodQuantity),
        minimumQuantity: Number(prodMinQty),
        supplier: prodSupplier,
      });
    }

    setShowProdModal(false);
    resetProdForm();
  };

  const resetProdForm = () => {
    setSelectedProd(null);
    setProdName("");
    setProdCategory("");
    setProdDesc("");
    setProdCost(0);
    setProdSelling(0);
    setProdQuantity(0);
    setProdMinQty(0);
    setProdSupplier("");
  };

  const openEditProduct = (p: Product) => {
    setSelectedProd(p);
    setModalMode("edit");
    setProdName(p.name);
    setProdCategory(p.category);
    setProdDesc(p.description);
    setProdCost(p.costPrice);
    setProdSelling(p.sellingPrice);
    setProdQuantity(p.currentQuantity);
    setProdMinQty(p.minimumQuantity);
    setProdSupplier(p.supplier);
    setShowProdModal(true);
  };

  const openAddProduct = () => {
    resetProdForm();
    setModalMode("add");
    setShowProdModal(true);
  };

  // Handle stock transactions
  const handleStockActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct || stockQty <= 0) return;

    adjustStock(stockProduct.id, stockQty, stockAction, stockNote);
    setShowStockModal(false);
    setStockQty(0);
    setStockNote("");
    setStockProduct(null);
  };

  const openStockModal = (p: Product) => {
    setStockProduct(p);
    setShowStockModal(true);
  };

  // User CRUD handlers
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (userMode === "create") {
      if (!userPasswordPlain) {
        alert("Initial password is required.");
        return;
      }
      createUser({
        username: userUsername,
        fullName: userFullName,
        role: userRole,
        profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        phoneNumber: userPhone,
        whatsappNumber: userWhatsApp || userPhone.replace(/\D/g, ""),
        email: userEmail,
        address: userAddress,
        isDisabled: false,
        isFirstLogin: true, // Forces reset at first login
        permissions: {
          addInventory: true,
          editInventory: false,
          createRequests: true,
          viewReports: true,
          printReports: true,
          viewSuppliers: true,
          exportData: false,
        },
      }, userPasswordPlain);
    } else if (userMode === "edit" && selectedUser) {
      updateUser({
        ...selectedUser,
        username: userUsername,
        fullName: userFullName,
        role: userRole,
        phoneNumber: userPhone,
        whatsappNumber: userWhatsApp,
        email: userEmail,
        address: userAddress,
      });
    }

    setShowUserModal(false);
    resetUserForm();
  };

  const resetUserForm = () => {
    setSelectedUser(null);
    setUserUsername("");
    setUserFullName("");
    setUserRole("staff");
    setUserEmail("");
    setUserPhone("");
    setUserWhatsApp("");
    setUserAddress("");
    setUserPasswordPlain("");
  };

  const openEditUser = (u: UserProfile) => {
    setSelectedUser(u);
    setUserMode("edit");
    setUserUsername(u.username);
    setUserFullName(u.fullName);
    setUserRole(u.role);
    setUserEmail(u.email);
    setUserPhone(u.phoneNumber);
    setUserWhatsApp(u.whatsappNumber);
    setUserAddress(u.address);
    setShowUserModal(true);
  };

  const openCreateUser = () => {
    resetUserForm();
    setUserMode("create");
    setShowUserModal(true);
  };

  // Toggle user account locking state (disable/enable)
  const toggleUserLock = (u: UserProfile) => {
    updateUser({
      ...u,
      isDisabled: !u.isDisabled,
    });
  };

  // Password override reset trigger
  const handlePasswordOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdTargetUser || !newPwdPlain) return;
    
    resetPassword(pwdTargetUser.id, newPwdPlain, true); // True forces user password reset on next login
    setShowPwdModal(false);
    setNewPwdPlain("");
    setPwdTargetUser(null);
    alert(`Success: Password for @${pwdTargetUser.username} resettled. They will be forced to change it upon login.`);
  };

  // Manager Permissions controller checkboxes
  const handlePermissionToggle = (managerUser: UserProfile, permKey: keyof ManagerPermissions) => {
    const nextPerms = {
      ...managerUser.permissions,
      [permKey]: !managerUser.permissions[permKey],
    };
    updateUser({
      ...managerUser,
      permissions: nextPerms,
    });
  };

  // Impersonating Manager or Staff session
  const startImpersonationSession = (role: "manager" | "staff") => {
    setImpersonation(role);
    alert(`Rerouting to simulated ${role.toUpperCase()} View. You maintain full administrative safety.`);
  };

  // Filter products for display in admin table
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchProd.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchProd.toLowerCase()) ||
                          p.supplier.toLowerCase().includes(searchProd.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesArchive = showArchived ? p.isArchived : !p.isArchived;

    return matchesSearch && matchesCategory && matchesArchive;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. Low stock continuous alert monitors */}
      {lowStockProducts.length > 0 && (
        <div id="low-stock-alert-banner" className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-xl p-4 shadow-sm animate-pulse-slow">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 tracking-wider">
                ACTIVE SYSTEM LOW STOCK ALERT ({lowStockProducts.length})
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-500">
                The core engine detected the following enterprise items are currently equal to or below the localized safety threshold:
              </p>
              
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="p-2.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold text-[10px] text-slate-500">{p.id}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          p.currentQuantity === 0 
                            ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400" 
                            : "bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400"
                        }`}>
                          {p.currentQuantity === 0 ? "OUT OF STOCK" : "LIMIT RISK"}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white truncate">{p.name}</h4>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Remaining:</span>
                        <strong className="text-slate-900 dark:text-white font-mono text-xs">{p.currentQuantity} units</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Required Limit:</span>
                        <strong className="text-slate-900 dark:text-white font-mono text-xs">{p.minimumQuantity} units</strong>
                      </div>
                      <div className="col-span-2 mt-1">
                        <span className="text-slate-400 block">Assigned Supplier:</span>
                        <span className="text-slate-700 dark:text-slate-300 truncate font-semibold block">{p.supplier}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Admin Mini Stats Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative shadow-sm">
          <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider font-mono">Products</span>
          <strong className="text-2xl font-black text-slate-800 dark:text-white mt-1 block tracking-tight">
            {products.filter(p => !p.isArchived).length}
          </strong>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {products.filter(p => p.isArchived).length} Archived in Drive
          </span>
          <div className="absolute right-4 bottom-4 text-blue-500 opacity-20">
            <Package className="w-8 h-8" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative shadow-sm">
          <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider font-mono">Active Personnel</span>
          <strong className="text-2xl font-black text-slate-800 dark:text-white mt-1 block tracking-tight">
            {users.length}
          </strong>
          <span className="text-[10px] text-green-500 mt-1 block font-semibold flex items-center gap-0.5">
            <UserCheck className="w-3 h-3" /> Fully Authorized
          </span>
          <div className="absolute right-4 bottom-4 text-indigo-500 opacity-20">
            <Users className="w-8 h-8" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative shadow-sm">
          <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider font-mono">Gross Revenues</span>
          <strong className="text-2xl font-black text-slate-850 dark:text-white mt-1 block tracking-tight">
            {formatCurrency(sales.reduce((sum, s) => sum + s.totalPrice, 0))}
          </strong>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Across {sales.length} historical invoices
          </span>
          <div className="absolute right-4 bottom-4 text-emerald-500 opacity-20">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative shadow-sm">
          <span className="text-xs text-amber-500 dark:text-amber-400 font-bold block uppercase tracking-wider font-mono">Low Stocks</span>
          <strong className="text-2xl font-black text-amber-600 dark:text-amber-500 mt-1 block tracking-tight">
            {lowStockProducts.length}
          </strong>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Automated alerts dispatched
          </span>
          <div className="absolute right-4 bottom-4 text-amber-500 opacity-20">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* 3. Primary Workspace Sub Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === "inventory"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Inventory Catalog CRUD
        </button>
        <button
          onClick={() => setActiveTab("stocks")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === "stocks"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Stock Dispatches & Adjustments
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === "users"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          User Security & Permissions
        </button>
        <button
          onClick={() => setActiveTab("currencies")}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
            activeTab === "currencies"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          Supported Currencies
        </button>
      </div>

      {/* TAB CONTAINER 1: INVENTORY CRUD */}
      {activeTab === "inventory" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Category selector */}
              <select
                id="search-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Category Pipelines</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Show archived toggle */}
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                  showArchived 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border-blue-500" 
                    : "bg-transparent text-slate-400 hover:text-slate-600 border-slate-200 dark:border-slate-800"
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Show Archived Catalog</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  id="search-inventory-input"
                  type="text"
                  placeholder="ID, item name, supplier..."
                  value={searchProd}
                  onChange={(e) => setSearchProd(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <button
                id="add-product-modal-trigger"
                onClick={openAddProduct}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-md shrink-0 uppercase transition"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4 font-bold">Product ID</th>
                  <th className="p-4 font-bold">Title Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold text-right">(Cost / Sell)</th>
                  <th className="p-4 font-bold text-center">In Stock</th>
                  <th className="p-4 font-bold">Wholesale Supplier</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                      No corresponding product entries matched current filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const isLow = p.currentQuantity <= p.minimumQuantity;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition">
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{p.id}</td>
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          <span className="block truncate max-w-[200px]" title={p.name}>{p.name}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[200px]" title={p.description}>{p.description}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded font-semibold text-[10px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono font-medium">
                          <span className="text-slate-400 text-[10px] block font-normal">Cost: {formatCurrency(p.costPrice)}</span>
                          <span className="text-slate-900 dark:text-white block">{formatCurrency(p.sellingPrice)}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            p.currentQuantity === 0
                              ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                              : isLow
                              ? "bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400"
                              : "bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                          }`}>
                            {p.currentQuantity} / Min: {p.minimumQuantity}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium truncate max-w-[130px]" title={p.supplier}>{p.supplier}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!p.isArchived ? (
                              <>
                                <button
                                  onClick={() => openEditProduct(p)}
                                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-500"
                                  title="Edit Configuration"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    archiveProduct(p.id);
                                  }}
                                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-300"
                                  title="Archive File to Cloud"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  restoreProduct(p.id);
                                }}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 hover:text-green-500"
                                title="Restore from archive"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm(`Perform permanent hard deletion on "${p.name}"? This is destructive.`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500"
                              title="Destructive Hard Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* TAB CONTAINER 2: STOCKS MANAGEMENT */}
      {activeTab === "stocks" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans uppercase">Enterprise Stock Allocation</h3>
            <p className="text-xs text-slate-500">Provide adjustments, dispatches, audits, and transfers on core inventory nodes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => {
              const checkLow = p.currentQuantity <= p.minimumQuantity;
              return (
                <div key={p.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-xs hover:border-blue-500/55 transition text-xs">
                  <div className="space-y-1.5 max-w-[65%]">
                    <span className="font-mono text-[10px] text-slate-400 font-bold block">{p.id}</span>
                    <h4 className="font-bold text-slate-800 dark:text-white truncate" title={p.name}>{p.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Total Available:</span>
                      <strong className={`font-mono ${checkLow ? "text-amber-500" : "text-green-500"}`}>{p.currentQuantity} units</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => openStockModal(p)}
                    className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 hover:text-white font-semibold rounded-lg flex items-center gap-1.5 transition text-[11px]"
                  >
                    Adjust Stock
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTAINER 3: USER SECURITY & MANAGER PERMISSIONS */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Active personnel directory */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans uppercase">Personnel Accounts Office</h3>
                <p className="text-xs text-slate-500">Add staff, reset accounts, restrict access controls or trigger administrator impersonations.</p>
              </div>
              <button
                id="create-user-modal-trigger"
                onClick={openCreateUser}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition"
              >
                <UserPlus className="w-4 h-4" /> Create User
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(u => {
                const isAdmin = u.role === "administrator";
                const isManager = u.role === "manager";
                return (
                  <div key={u.id} className={`p-4 border rounded-xl flex flex-col justify-between relative shadow-xs transition ${
                    u.isDisabled 
                      ? "border-red-200 dark:border-red-950/40 bg-red-50/10" 
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  }`}>
                    
                    {/* Role badge */}
                    <span className={`absolute top-3 right-3 px-1.5 py-0.5 rounded-full text-[8px] font-bold font-mono uppercase tracking-wider ${
                      isAdmin 
                        ? "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400" 
                        : isManager 
                        ? "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400" 
                        : "bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                    }`}>
                      {u.role}
                    </span>

                    <div className="flex gap-3 mb-4">
                      <img
                        src={u.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                        alt={u.fullName}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-xs truncate">
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{u.fullName}</h4>
                        <span className="text-slate-400 block font-mono">@{u.username}</span>
                        <span className="text-slate-400 block truncate">{u.email}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {!isAdmin && (
                          <>
                            {/* Impersonate */}
                            <button
                              onClick={() => startImpersonationSession(u.role as any)}
                              className="py-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] text-blue-500 font-bold font-mono tracking-wider border rounded uppercase transition"
                              title={`Impersonate ${u.fullName} sandbox`}
                            >
                              Impersonate
                            </button>

                            {/* Lock Toggle */}
                            <button
                              onClick={() => toggleUserLock(u)}
                              className={`p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 border rounded transition ${
                                u.isDisabled ? "text-red-500 hover:text-green-500" : "text-green-500 hover:text-red-500"
                              }`}
                              title={u.isDisabled ? "Enable User Account" : "Disable User Account"}
                            >
                              {u.isDisabled ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setPwdTargetUser(u);
                            setShowPwdModal(true);
                          }}
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-950 hover:bg-blue-600 hover:text-white text-[10px] text-slate-500 rounded border font-semibold flex items-center gap-1 transition"
                          title="Override password reset"
                        >
                          <Key className="w-3 h-3" /> Reset
                        </button>

                        {!isAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`Do you wish to permanently delete the profile of ${u.fullName}?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 border rounded"
                            title="Delete staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manager Permission controller workspace list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans uppercase">Manager Roles & Security Delegation</h3>
              <p className="text-xs text-slate-500">Fine-tune exactly which database permissions are shared with Managers in real-time.</p>
            </div>

            {users.filter(u => u.role === "manager").map(manager => (
              <div key={manager.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-3 border text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={manager.profilePicture}
                    className="w-8 h-8 rounded-full border shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{manager.fullName}</h4>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Manager Operational Policy Profile</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-lg border">
                  {(Object.keys(manager.permissions) as Array<keyof ManagerPermissions>).map(permKey => {
                    const label = permKey
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase());

                    return (
                      <label key={permKey} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={manager.permissions[permKey]}
                          onChange={() => handlePermissionToggle(manager, permKey)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-1 cursor-pointer"
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTAINER 4: SUPPORTED CURRENCIES */}
      {activeTab === "currencies" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Form Column */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 font-sans">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                {isCurrEditing ? `Edit [${currEditingOriginalCode}] Fiat Config` : "Register Supported Currency"}
              </h3>
              <p className="text-xs text-slate-500">
                Define details and exchange rates relative to USD (E.g. 1 USD = X Currency units).
              </p>
              
              <form onSubmit={handleCurrencySubmit} className="space-y-4 text-xs">
                {currSuccessMsg && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-850 rounded-lg text-[11px] text-emerald-800 dark:text-emerald-400 font-medium">
                    {currSuccessMsg}
                  </div>
                )}
                {currErrorMsg && (
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-850 rounded-lg text-[11px] text-red-800 dark:text-red-400 font-medium font-mono">
                    {currErrorMsg}
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Currency Code (3 chars)</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    disabled={isCurrEditing && currEditingOriginalCode === "USD"}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white uppercase focus:outline-none"
                    placeholder="E.g. CAD, AUD, NGN"
                    value={currCode}
                    onChange={(e) => setCurrCode(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Symbol</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none"
                    placeholder="E.g. $, €, ₦"
                    value={currSymbol}
                    onChange={(e) => setCurrSymbol(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">Exchange Rate (Units per 1 USD)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    disabled={isCurrEditing && currEditingOriginalCode === "USD"}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none"
                    placeholder="E.g. 1.35 (representing 1 USD = 1.35 CAD)"
                    value={currRate}
                    onChange={(e) => setCurrRate(Number(e.target.value))}
                  />
                  {currCode && currRate > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      Calculated: 1 USD = {currRate} {currCode.toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                  >
                    {isCurrEditing ? "Update configuration" : "Add currency"}
                  </button>
                  {isCurrEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrCode("");
                        setCurrSymbol("");
                        setCurrRate(1.0);
                        setIsCurrEditing(false);
                        setCurrEditingOriginalCode(null);
                        setCurrSuccessMsg("");
                        setCurrErrorMsg("");
                      }}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 font-semibold rounded-lg transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            {/* List and Sync Column */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Settings / System Default panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-sans">
                     System Default Currency
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Sets the native corporate currency used as the primary fallback for analytics.
                  </p>
                </div>
                <div>
                  <select
                    id="sys-default-currency-selector"
                    value={getSystemDefaultCurrency()}
                    onChange={(e) => setSystemDefaultCurrency(e.target.value)}
                    className="py-2 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-white"
                  >
                    {getCurrencies().map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Currencies Directory Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                      Active Currency Exchange Directory
                    </h3>
                    <p className="text-xs text-slate-500">
                      View details, update rates, or pull latest online rates directly from the live network.
                    </p>
                  </div>
                  
                  <button
                    id="realtime-currency-sync-btn"
                    onClick={handleFetchRatesFromAPI}
                    disabled={currIsSyncing}
                    className={`py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition ${
                      currIsSyncing ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {currIsSyncing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Fetching Rates...</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4" />
                        <span>Auto-Sync Real-Time Rates</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="overflow-x-auto font-sans">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] uppercase font-bold text-slate-400">
                        <th className="py-2">Currency ID</th>
                        <th className="py-2">Currency System Name</th>
                        <th className="py-2">Exchange rate (For 1 USD)</th>
                        <th className="py-2">Value of 1 Unit in USD</th>
                        <th className="py-2 text-right">Settings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {getCurrencies().map(c => {
                        const isDefault = c.code === getSystemDefaultCurrency();
                        const isUSDBase = c.code === "USD";
                        const oneUnitValue = c.rateToUSD > 0 ? (1 / c.rateToUSD) : 0;
                        return (
                          <tr key={c.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <td className="py-3 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                {c.symbol}
                              </span>
                              <span>{c.code}</span>
                              {isDefault && (
                                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-bold text-[8px] uppercase">
                                  Default
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-slate-500 dark:text-slate-400 font-medium">
                              {c.code === "USD" ? "United States Dollar (Base)" :
                               c.code === "EUR" ? "Eurozone Common Currency" :
                               c.code === "GBP" ? "Great British Pound" :
                               c.code === "NGN" ? "Nigerian Naira" :
                               c.code === "GHS" ? "Ghanaian Cedi" : "International Fiat Config"}
                            </td>
                            <td className="py-3 font-mono text-slate-800 dark:text-slate-350">
                              1 USD = <b className="text-slate-900 dark:text-white">{c.rateToUSD}</b> {c.code}
                            </td>
                            <td className="py-3 font-mono text-slate-500 font-semibold text-[11px]">
                              {isUSDBase ? "1.00 USD" : `${oneUnitValue.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} USD`}
                            </td>
                            <td className="py-3 text-right space-x-2">
                              <button
                                onClick={() => handleEditCurrency(c)}
                                className="py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 hover:text-white font-semibold rounded-md transition duration-200"
                              >
                                Edit Rates
                              </button>
                              {!isUSDBase && (
                                <button
                                  onClick={() => handleDeleteCurrency(c.code)}
                                  disabled={isDefault}
                                  className={`py-1 px-2.5 rounded-md font-semibold font-mono text-[10px] uppercase tracking-wider transition ${
                                    isDefault 
                                      ? "bg-slate-100 dark:bg-slate-850 text-slate-350 dark:text-slate-650 cursor-not-allowed" 
                                      : "bg-red-50 hover:bg-red-600 dark:bg-red-950/20 text-red-600 hover:text-white dark:hover:bg-red-600"
                                  }`}
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>
            
          </div>
        </div>
      )}

      {/* MODAL WINDOW 1: PRODUCT EDITOR FORM */}
      {showProdModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {modalMode === "add" ? "Register New Catalog Product" : `Edit Configuration [${selectedProd?.id}]`}
              </h3>
              <button
                onClick={() => setShowProdModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Product Name</label>
                  <input
                    id="modal-prod-name"
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none"
                    placeholder="Enterprise High-Gain Antennas"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Category Pipeline</label>
                  <input
                    id="modal-prod-category"
                    type="text"
                    required
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none"
                    placeholder="Network Hardware"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Supplier Name</label>
                  <input
                    id="modal-prod-supplier"
                    type="text"
                    required
                    value={prodSupplier}
                    onChange={(e) => setProdSupplier(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none"
                    placeholder="Global Tech Distributor"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Product Description</label>
                  <textarea
                    id="modal-prod-desc"
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none h-16"
                    placeholder="Enter short core product details here..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Wholesale Cost Price ($)</label>
                  <input
                    id="modal-prod-cost"
                    type="number"
                    step="0.01"
                    required
                    value={prodCost}
                    onChange={(e) => setProdCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Retail Selling Price ($)</label>
                  <input
                    id="modal-prod-selling"
                    type="number"
                    step="0.01"
                    required
                    value={prodSelling}
                    onChange={(e) => setProdSelling(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Current Qty In Stock</label>
                  <input
                    id="modal-prod-qty"
                    type="number"
                    required
                    disabled={modalMode === "edit"} // Prevent bypass simple stock adjustment logs
                    value={prodQuantity}
                    onChange={(e) => setProdQuantity(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Minimum Limit (Threshold)</label>
                  <input
                    id="modal-prod-min"
                    type="number"
                    required
                    value={prodMinQty}
                    onChange={(e) => setProdMinQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="modal-prod-submit-btn"
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow uppercase tracking-wider text-[11px]"
              >
                Store Configuration Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 2: STOCK INJECTIONS ADJUSTMENTS */}
      {showStockModal && stockProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                Stock Operations: {stockProduct.name}
              </h3>
              <button
                onClick={() => setShowStockModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockActionSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select Operation Type</label>
                <select
                  id="stock-operation-select"
                  value={stockAction}
                  onChange={(e) => setStockAction(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="increase">Increase Stock (Arrival from Supplier)</option>
                  <option value="reduce">Reduce Stock (Loss / Spoilage / Manual Exit)</option>
                  <option value="adjust">Stock adjustment audit value (Overwrite Quantity)</option>
                  <option value="transfer">Inter-warehouse Stock Node Transfer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Quantity (Units)</label>
                <input
                  id="stock-operation-qty"
                  type="number"
                  min="1"
                  required
                  value={stockQty}
                  onChange={(e) => setStockQty(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Operation Motivation / Notes</label>
                <input
                  id="stock-operation-notes"
                  type="text"
                  required
                  placeholder="e.g. Received shipment ref: #9901, audit corrections."
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                id="stock-operation-submit"
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow uppercase"
              >
                Log Adjusted Stock Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 3: PERSONNEL EDITOR */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">
                {userMode === "create" ? "Create New Personnel Profile" : "Edit Profile configuration"}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUserSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Username handle</label>
                  <input
                    id="modal-user-username"
                    type="text"
                    required
                    placeholder="lawson.ops"
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Authority Role</label>
                  <select
                    id="modal-user-role"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="administrator">Owner (Administrator)</option>
                    <option value="manager">Operational Manager</option>
                    <option value="staff">Sales Staff</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Full Name</label>
                  <input
                    id="modal-user-fullname"
                    type="text"
                    required
                    placeholder="Elena Rostova"
                    value={userFullName}
                    onChange={(e) => setUserFullName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Work Email</label>
                  <input
                    id="modal-user-email"
                    type="email"
                    required
                    placeholder="ops@brooks.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone Mobile Number</label>
                  <input
                    id="modal-user-phone"
                    type="text"
                    required
                    placeholder="+1 (555) 123-0099"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">WhatsApp Mobile Number</label>
                  <input
                    id="modal-user-whatsapp"
                    type="text"
                    placeholder="15551230099 (Numbers only)"
                    value={userWhatsApp}
                    onChange={(e) => setUserWhatsApp(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Residential Address</label>
                  <input
                    id="modal-user-address"
                    type="text"
                    placeholder="Apt 20B Blue Bay, FL"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {userMode === "create" && (
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-cyan-300">Temporary Access Password</label>
                    <input
                      id="modal-user-password"
                      type="text"
                      required
                      placeholder="Will trigger required password change upon initial login"
                      value={userPasswordPlain}
                      onChange={(e) => setUserPasswordPlain(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white focus:outline-none font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              <button
                id="modal-user-submit-btn"
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow uppercase"
              >
                Assemble personnel record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 4: OVERRIDE PASSWORD */}
      {showPwdModal && pwdTargetUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm border border-slate-100 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Override Staff Password</span>
              </h3>
              <button
                onClick={() => setShowPwdModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              You are resetting password security details for <b>{pwdTargetUser.fullName}</b>. 
              The profile will be marked with a "Mandatory Reset Flag" forced upon their next session start.
            </p>

            <form onSubmit={handlePasswordOverride} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">New Temporary Password</label>
                <input
                  id="password-override-input"
                  type="text"
                  required
                  placeholder="e.g. TempReset-2026"
                  value={newPwdPlain}
                  onChange={(e) => setNewPwdPlain(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <button
                id="password-override-submit"
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow uppercase"
              >
                Displace Original Hashed Keys
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
