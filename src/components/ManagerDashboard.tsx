import React, { useState } from "react";
import { 
  getProducts, 
  getSupplierRequests, 
  addSupplierRequest, 
  updateSupplierRequest,
  getUsers, 
  addLog,
  getLogs,
  formatCurrency
} from "../dbStore";
import { Product, SupplierRequest, UserProfile } from "../types";
import { 
  Briefcase, 
  Search, 
  Plus, 
  Bell, 
  Truck, 
  AlertTriangle, 
  FileSpreadsheet, 
  Printer, 
  Clock, 
  CheckCircle, 
  X,
  FileText,
  User,
  Heart
} from "lucide-react";

interface ManagerDashboardProps {
  user: UserProfile;
  setCurrentTab: (tab: string) => void;
}

export default function ManagerDashboard({ user, setCurrentTab }: ManagerDashboardProps) {
  // DB States
  const products = getProducts();
  const requests = getSupplierRequests();
  const activePermissions = user.permissions;

  // Search/Filters
  const [searchProd, setSearchProd] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");

  // Supplier Form modal state
  const [showReqModal, setShowReqModal] = useState(false);
  const [reqProduct, setReqProduct] = useState("");
  const [reqQty, setReqQty] = useState(1);
  const [reqSupplier, setReqSupplier] = useState("");
  const [reqPriority, setReqPriority] = useState<"low" | "medium" | "high">("medium");
  const [reqReason, setReqReason] = useState("");

  const suppliers = Array.from(new Set(products.map(p => p.supplier))).filter(Boolean);
  const lowStockProducts = products.filter(p => !p.isArchived && p.currentQuantity <= p.minimumQuantity);

  // Requisition submission
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activePermissions.createRequests) {
      alert("Operational Alert: Supplier Request Dispatch is restricted by Administrator Policy.");
      return;
    }

    addSupplierRequest({
      productName: reqProduct,
      quantityNeeded: Number(reqQty),
      supplierName: reqSupplier || "Apex Global Logistics",
      priorityLevel: reqPriority,
      reason: reqReason,
      status: "pending",
    });

    addLog("system", `Manager @${user.username} raised purchasing request for ${reqProduct} x ${reqQty} from ${reqSupplier}`, "info", user.username);
    
    // reset form
    setShowReqModal(false);
    setReqProduct("");
    setReqQty(1);
    setReqSupplier("");
    setReqPriority("medium");
    setReqReason("");
  };

  const openRaiseRequest = (productName?: string, supplierName?: string) => {
    if (productName) setReqProduct(productName);
    if (supplierName) setReqSupplier(supplierName);
    setShowReqModal(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchProd.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchProd.toLowerCase());
    const matchesSupplier = supplierFilter === "all" || p.supplier === supplierFilter;

    return matchesSearch && matchesSupplier && !p.isArchived;
  });

  return (
    <div className="space-y-6">
      
      {/* Dynamic Authorization Notification */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Manager Session: <b>{user.fullName}</b>
          </span>
        </div>
        <div className="flex gap-1.5 font-mono text-[9px] text-slate-400 font-bold uppercase shrink-0">
          <span>Permissions:</span>
          <span className={activePermissions.addInventory ? "text-green-500" : "text-slate-500"}>[Add: {activePermissions.addInventory ? "YES" : "NO"}]</span>
          <span className={activePermissions.createRequests ? "text-green-500" : "text-slate-500"}>[Requests: {activePermissions.createRequests ? "YES" : "NO"}]</span>
          <span className={activePermissions.viewReports ? "text-green-500" : "text-slate-500"}>[Reports: {activePermissions.viewReports ? "YES" : "NO"}]</span>
        </div>
      </div>

      {/* Main Widgets: Inventory View + Supplier Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (8 cols): Inventory grid */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans uppercase">Enterprise Stock Audit</h3>
              <p className="text-xs text-slate-500">Analyze prices, wholesale suppliers, and minimum threshold quantities.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                id="manager-supplier-filter"
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="all">All Suppliers</option>
                {suppliers.map(sup => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  id="manager-search-input"
                  type="text"
                  placeholder="Query catalogue..."
                  value={searchProd}
                  onChange={(e) => setSearchProd(e.target.value)}
                  className="pl-8 pr-2.5 py-1.5 w-40 sm:w-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded text-slate-850 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Reference ID</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Selling Price</th>
                  <th className="p-3 text-center">Safety Level</th>
                  <th className="p-3 text-right">Purchase Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                      No inventory matches current parameters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const isLow = p.currentQuantity <= p.minimumQuantity;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{p.id}</td>
                        <td className="p-3">
                          <strong className="text-slate-900 dark:text-white block font-sans">{p.name}</strong>
                          <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">{p.supplier}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 rounded text-slate-800 dark:text-slate-300 text-[10px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(p.sellingPrice)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            p.currentQuantity === 0
                              ? "bg-red-100 dark:bg-red-950/30 text-rose-500"
                              : isLow
                              ? "bg-amber-100 dark:bg-amber-950/20 text-amber-500"
                              : "bg-green-100 dark:bg-green-950/20 text-green-500"
                          }`}>
                            {p.currentQuantity} units
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => openRaiseRequest(p.name, p.supplier)}
                            disabled={!activePermissions.createRequests}
                            className={`py-1 px-2.5 font-bold rounded-lg text-[10px] uppercase transition flex items-center gap-1.5 ml-auto ${
                              activePermissions.createRequests
                                ? "bg-blue-600 dark:bg-blue-600/20 text-white dark:text-blue-400 hover:bg-blue-700 hover:text-white dark:hover:bg-blue-600"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            <Truck className="w-3 h-3" /> Raise Order
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): Low stock triggers & Supplier Request ledger */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Stock Limit Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider uppercase font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Critical Alerts ({lowStockProducts.length})</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Staff Hidden</span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs text-slate-400 font-mono">
                ✓ Perfect stocks: All items reside safely above minimum.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="p-2.5 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between font-mono font-bold text-[9px] text-slate-400">
                      <span>{p.id}</span>
                      <span className="text-rose-500">Safety Breach</span>
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white truncate">{p.name}</h5>
                    <div className="grid grid-cols-2 text-[10px] text-slate-500 pt-1 border-t border-dashed border-amber-200/50 dark:border-amber-900/20">
                      <span>In Stock: <strong className="text-slate-800 dark:text-slate-200">{p.currentQuantity}</strong></span>
                      <span>Min Required: <strong className="text-slate-800 dark:text-slate-200">{p.minimumQuantity}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supplier Requisitions status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-wider uppercase font-mono flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Order Dispatches ({requests.length})</span>
              </h4>
              <button
                onClick={() => openRaiseRequest()}
                disabled={!activePermissions.createRequests}
                className="py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold font-mono tracking-wider disabled:opacity-40 transition"
              >
                DISPATCH NEW
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {requests.length === 0 ? (
                <div className="text-center p-8 text-slate-400 font-mono text-[10px]">
                  No vendor despatches initiated.
                </div>
              ) : (
                requests.map(r => {
                  const isPending = r.status === "pending";
                  const isApproved = r.status === "approved";
                  const isDelivered = r.status === "delivered";
                  return (
                    <div key={r.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[10px] text-slate-500">{r.requestNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold font-mono uppercase ${
                          isDelivered 
                            ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400" 
                            : isApproved 
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : r.status === "rejected"
                            ? "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400"
                            : "bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400"
                        }`}>
                          {r.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-bold text-slate-900 dark:text-white truncate">{r.productName}</h5>
                        <p className="text-[10px] text-slate-400">Order size: <b className="text-slate-700 dark:text-slate-300">{r.quantityNeeded} units</b> to <b>{r.supplierName}</b></p>
                      </div>

                      {r.notes && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded text-[10px] font-mono text-slate-500 italic">
                          "{r.notes}"
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL WINDOW: REQUISITION WIZARD */}
      {showReqModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                <Truck className="w-5 h-5 text-blue-500 shrink-0" />
                <span>Supplier Purveyor Requisition</span>
              </h3>
              <button
                onClick={() => setShowReqModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Product Name / Item Title</label>
                <input
                  id="supplier-req-product"
                  type="text"
                  required
                  placeholder="e.g. Titanium Fusion storage drive"
                  value={reqProduct}
                  onChange={(e) => setReqProduct(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Quantity Needed</label>
                  <input
                    id="supplier-req-qty"
                    type="number"
                    min="1"
                    required
                    value={reqQty}
                    onChange={(e) => setReqQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Supplier Vendor</label>
                  <input
                    id="supplier-req-vendor"
                    type="text"
                    required
                    placeholder="e.g. Silicon Valley Distribution"
                    value={reqSupplier}
                    onChange={(e) => setReqSupplier(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Urgency Priority level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map(prio => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setReqPriority(prio)}
                      className={`py-2 border font-mono font-bold uppercase rounded-lg text-[9px] tracking-wider transition ${
                        reqPriority === prio
                          ? "bg-blue-600 border-transparent text-white shadow-sm"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Motivation (Describe Need)</label>
                <textarea
                  id="supplier-req-reason"
                  required
                  placeholder="Need safety buffer of 50 units because Silicon supplier has transit delay scheduled..."
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-950 dark:text-white focus:outline-none h-20"
                />
              </div>

              <button
                id="supplier-req-submit"
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow uppercase"
              >
                Dispatch Purchase Requisition
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
