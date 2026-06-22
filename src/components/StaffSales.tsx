import React, { useState, useEffect } from "react";
import { getProducts, addSale, getSales, formatCurrency } from "../dbStore";
import { UserProfile, Sale, Product } from "../types";
import { 
  DollarSign, 
  ShoppingCart, 
  User, 
  FileText, 
  Check, 
  Save, 
  Printer, 
  Eye, 
  Lock, 
  X,
  CreditCard,
  Plus,
  Trash2,
  Receipt,
  RotateCcw
} from "lucide-react";

interface StaffSalesProps {
  user: UserProfile;
}

export default function StaffSales({ user }: StaffSalesProps) {
  const products = getProducts().filter(p => !p.isArchived);
  const sales = getSales();

  // Sales form parameters
  const [buyerName, setBuyerName] = useState("");
  const [selectedProdId, setSelectedProdId] = useState("");
  const [qtyPurchased, setQtyPurchased] = useState(1);
  const [customPrice, setCustomPrice] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);

  // Computed Values
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Interactive modal preview receipt
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);

  // Auto-fetch price when product selection shifts
  useEffect(() => {
    const selectedProd = products.find(p => p.id === selectedProdId);
    if (selectedProd) {
      setCustomPrice(selectedProd.sellingPrice);
    } else {
      setCustomPrice(0);
    }
  }, [selectedProdId]);

  // Recalculate Total
  useEffect(() => {
    const calculatedTotal = Number(customPrice) * Number(qtyPurchased);
    setTotalPrice(Number(calculatedTotal.toFixed(2)));
    setAmountPaid(Number(calculatedTotal.toFixed(2))); // Default full paid
  }, [customPrice, qtyPurchased]);

  // Submit sale handler
  const executeSubmitSale = (status: "saved" | "submitted") => {
    if (!buyerName.trim()) {
      alert("Validation Error: Please specify the Buyer or Corporate Name.");
      return;
    }

    if (!selectedProdId) {
      alert("Validation Error: Please select a product from the list.");
      return;
    }

    const selectedProd = products.find(p => p.id === selectedProdId);
    if (!selectedProd) return;

    if (qtyPurchased <= 0) {
      alert("Validation Error: Quantity must be greater than zero.");
      return;
    }

    // Capacity checks
    if (status === "submitted" && selectedProd.currentQuantity < qtyPurchased) {
      alert(`Critical stock failure: There are only ${selectedProd.currentQuantity} units remaining. Cannot complete purchase of ${qtyPurchased} units.`);
      return;
    }

    const newSale = addSale({
      buyerName,
      productId: selectedProdId,
      productName: selectedProd.name,
      quantityPurchased: Number(qtyPurchased),
      unitPrice: Number(customPrice),
      totalPrice,
      currency: "USD",
      amountPaid: Number(amountPaid),
      salespersonName: user.fullName,
      status,
    });

    if (newSale) {
      setActiveReceipt(newSale); // open printed receipt pop-up
      
      // Wipe form input fields
      setBuyerName("");
      setSelectedProdId("");
      setQtyPurchased(1);
      setCustomPrice(0);
      setTotalPrice(0);
      setAmountPaid(0);
    }
  };

  const selectedProductObj = products.find(p => p.id === selectedProdId);

  // Handles standard print trigger
  const handlePrintReceiptTrigger = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Sales Entry Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Form Container (7 cols) */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b pb-3 border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-sans">Staff Invoice Creator</h3>
            <p className="text-xs text-slate-500">Record payments, discounts, and dispatch receipts instantly to storage nodes.</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Buyer Corporate / Personal Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="sales-buyer-name"
                    type="text"
                    required
                    placeholder="e.g. Vanguard Tech Solutions Ltd"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select Catalog Product</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <ShoppingCart className="w-4 h-4" />
                  </span>
                  <select
                    id="sales-product-select"
                    value={selectedProdId}
                    onChange={(e) => setSelectedProdId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Choose item --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.id}] - stock quantity: {p.currentQuantity}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Quantity Purchased</label>
                <input
                  id="sales-quantity"
                  type="number"
                  min="1"
                  required
                  value={qtyPurchased}
                  onChange={(e) => setQtyPurchased(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Assigned Unit Price ($)</label>
                <input
                  id="sales-unit-price"
                  type="number"
                  step="0.01"
                  required
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
                {customPrice > 0 && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block mt-1 font-sans">
                    Equivalent: {formatCurrency(customPrice)}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Evaluated Total Price ($)</label>
                <input
                  id="sales-total-disabled"
                  type="text"
                  disabled
                  value={`$${totalPrice.toFixed(2)}`}
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 font-mono font-bold"
                />
                {totalPrice > 0 && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block mt-1 font-sans">
                    Equivalent: {formatCurrency(totalPrice)}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Actual Amount Paid ($)</label>
                <input
                  id="sales-amount-paid"
                  type="number"
                  step="0.01"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
                {amountPaid > 0 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1 font-sans">
                    Equivalent: {formatCurrency(amountPaid)}
                  </span>
                )}
              </div>
            </div>

            {/* Suspicious Alerts Warn for Staff live */}
            {selectedProductObj && customPrice < selectedProductObj.costPrice && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 font-sans text-[11px] leading-relaxed">
                🚨 <b>Wholesale Deficit:</b> Custom price ({formatCurrency(customPrice)}) is below wholesale cost value ({formatCurrency(selectedProductObj.costPrice)}). 
                This transaction will be flagged as **POTENTIALLY SUSPICIOUS** for Admin review.
              </div>
            )}

            {qtyPurchased > 100 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/10 border border-amber-200 rounded-lg text-amber-700 dark:text-amber-500 font-mono text-[11px] leading-relaxed">
                ⚠️ <b>Bulk Alert:</b> Quantity above retail limit (&gt;100). Flagged for administrative verification logs.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button
                type="button"
                id="submit-save-sale-btn"
                onClick={() => executeSubmitSale("saved")}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <Save className="w-4 h-4" /> Save Pending
              </button>

              <button
                type="button"
                id="submit-register-sale-btn"
                onClick={() => executeSubmitSale("submitted")}
                className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition hover:scale-[101%]"
              >
                <Check className="w-4 h-4" /> Submit & restock
              </button>
            </div>

          </form>
        </div>

        {/* Right Dashboard Ledger (5 cols) */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm text-xs">
          <div className="border-b pb-2.5 border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider font-mono">Invoice Records Office</h4>
            <p className="text-[11px] text-slate-400">Review your past dispatch sales. Invoice limits evaluated at 500 records.</p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {sales.length === 0 ? (
              <div className="text-center p-8 text-slate-400 font-mono text-[10px]">
                No transaction invoices entered today.
              </div>
            ) : (
              sales.slice().reverse().map(item => {
                const isTemp = item.status === "saved";
                return (
                  <div key={item.id} className="p-3 border rounded-xl space-y-2 bg-slate-50/50 dark:bg-slate-950/20 border-slate-150 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{item.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase ${
                        isTemp 
                          ? "bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400" 
                          : "bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div>
                      <strong className="text-slate-900 dark:text-white block font-sans truncate max-w-[180px]">{item.buyerName}</strong>
                      <span className="text-[10px] text-slate-400 block truncate">{item.productName} x {item.quantityPurchased} units</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-dashed border-slate-200 dark:border-slate-800 pt-2 text-[10px]">
                      <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold text-xs">{formatCurrency(item.totalPrice)}</span>
                      
                      <button
                        onClick={() => setActiveReceipt(item)}
                        className="p-1 px-2.5 border rounded flex items-center gap-1 hover:bg-white dark:hover:bg-slate-900 text-slate-500 font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Receipt
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* RECEIPT PRINTING OVERLAY MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-950 dark:text-white border-2 border-slate-300 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 relative shadow-2xl print:shadow-none print:border-0 print:p-0">
            
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Receipt Body starts here */}
            <div id="receipt-printed-area" className="space-y-6 font-sans text-xs">
              <div className="text-center space-y-1.5 pb-4 border-b-2 border-dashed border-slate-350 dark:border-slate-850">
                <div className="flex justify-center">
                  <Receipt className="w-9 h-9 text-slate-700 dark:text-slate-300 animate-bounce" />
                </div>
                <h3 className="font-extrabold text-base tracking-wider uppercase">BROOKS ENTERPRISE</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest font-mono">Privately Owned Intranet Node</p>
                <p className="text-[9px] text-slate-400">Atlanta, USA · Lagos, NG · London, UK</p>
              </div>

              <div className="grid grid-cols-2 gap-y-1.5 text-[10px] pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Receipt Code:</span>
                <strong className="text-right font-mono font-bold">{activeReceipt.receiptNumber}</strong>

                <span className="text-slate-500 font-medium">System ID:</span>
                <span className="text-right font-mono">{activeReceipt.id}</span>

                <span className="text-slate-500 font-medium">Session Timestamp:</span>
                <span className="text-right font-mono">{new Date(activeReceipt.date).toLocaleString()}</span>

                <span className="text-slate-500 font-medium">Salesperson:</span>
                <span className="text-right font-semibold">{activeReceipt.salespersonName}</span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider block">Shipment Consumed:</span>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">{activeReceipt.productName}</h4>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                    <span>{activeReceipt.quantityPurchased} units @ {formatCurrency(activeReceipt.unitPrice)}</span>
                    <strong className="font-mono text-slate-900 dark:text-white text-xs">{formatCurrency(activeReceipt.totalPrice)}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-y-2">
                <span className="font-extrabold uppercase tracking-wide text-xs">Evaluation Sum:</span>
                <strong className="text-right font-mono text-base text-blue-600 dark:text-blue-400">{formatCurrency(activeReceipt.totalPrice)}</strong>

                <span className="text-slate-500 font-semibold">Total Amount Swiped:</span>
                <strong className="text-right font-mono font-bold">{formatCurrency(activeReceipt.amountPaid)}</strong>

                <span className="text-slate-500 font-semibold">Underpaid Balance:</span>
                <span className="text-right font-mono font-semibold text-rose-500">
                  {formatCurrency(Math.max(0, activeReceipt.totalPrice - activeReceipt.amountPaid))}
                </span>
                
                <span className="text-slate-500 font-semibold">Receipt Status:</span>
                <span className="text-right font-bold uppercase tracking-widest text-[9px] text-green-500 font-mono">
                  {activeReceipt.status === "submitted" ? "COMMITTED" : "PENDING ENTRY"}
                </span>
              </div>

              {activeReceipt.isSuspicious && (
                <div className="p-3 bg-red-100/30 border border-red-200 text-red-700 rounded-xl text-[10px] font-mono leading-relaxed">
                  ⚠️ <b>Wholesale Audit Check:</b> This invoice was marked for review. Reason: {activeReceipt.suspiciousReason}
                </div>
              )}

              <p className="text-center text-[10px] text-slate-500 font-mono pt-4 select-none leading-relaxed">
                Thank you for your valuable corporate business. All items are authenticated securely under BBIMS internal license.
              </p>
            </div>

            {/* Print trigger actions */}
            <div className="flex gap-2.5 mt-6 print:hidden">
              <button
                onClick={handlePrintReceiptTrigger}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow transition"
              >
                <Printer className="w-4 h-4" /> Trigger Print
              </button>
              
              <button
                onClick={() => setActiveReceipt(null)}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
