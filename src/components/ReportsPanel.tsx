import React, { useState } from "react";
import { getSales, getProducts, getSupplierRequests, getCurrencies, getSelectedCurrency, setSelectedCurrency } from "../dbStore";
import { 
  LineChart, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Printer, 
  ShieldAlert, 
  Check, 
  HelpCircle, 
  User, 
  Eye, 
  Globe, 
  RefreshCw 
} from "lucide-react";

export default function ReportsPanel() {
  const sales = getSales();
  const products = getProducts();
  const requests = getSupplierRequests();

  // Selected Reporting Currency state
  const currenciesList = getCurrencies();
  const selectedCurrencyCode = getSelectedCurrency();
  const currentCurrency = currenciesList.find(c => c.code === selectedCurrencyCode) || currenciesList[0];

  // Filters
  const [salesTimeFrame, setSalesTimeFrame] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");
  const [supplierStatusFilter, setSupplierStatusFilter] = useState<"all" | "pending" | "approved" | "delivered">("all");

  // Sums and counts
  const totalUSDRevenue = sales.reduce((sum, s) => sum + s.totalPrice, 0);
  const totalWholesaleUSDCost = sales.reduce((sum, s) => {
    const prod = products.find(p => p.id === s.productId);
    const cost = prod ? prod.costPrice : 0;
    return sum + (cost * s.quantityPurchased);
  }, 0);

  const convertedRevenue = totalUSDRevenue * currentCurrency.rateToUSD;
  const convertedProfit = (totalUSDRevenue - totalWholesaleUSDCost) * currentCurrency.rateToUSD;

  const lowStockCount = products.filter(p => !p.isArchived && p.currentQuantity <= p.minimumQuantity).length;
  const outOfStockCount = products.filter(p => !p.isArchived && p.currentQuantity === 0).length;

  const suspiciousSales = sales.filter(s => s.isSuspicious === true);

  // Helper: Format amount with currently selected symbol and rates
  const formatAmount = (usdVal: number) => {
    const newVal = usdVal * currentCurrency.rateToUSD;
    return `${currentCurrency.symbol}${newVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currentCurrency.code}`;
  };

  // Export to CSV helper
  const triggerExportCSV = (reportType: "sales" | "inventory" | "suppliers") => {
    let headers = "";
    let rows = "";
    let filename = "";

    if (reportType === "sales") {
      headers = "ID,Buyer Name,Product Name,Quantity,Unit Price,Total Price,Salesperson,Date,Flagged Suspicious\n";
      rows = sales.map(s => 
        `"${s.id}","${s.buyerName}","${s.productName}",${s.quantityPurchased},${s.unitPrice},${s.totalPrice},"${s.salespersonName}","${s.date}",${s.isSuspicious}`
      ).join("\n");
      filename = `bbims_sales_report_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (reportType === "inventory") {
      headers = "Product ID,Product Name,Category,Cost Price,Selling Price,Quantity,Min Quantity,Supplier,Date Added\n";
      rows = products.map(p => 
        `"${p.id}","${p.name}","${p.category}",${p.costPrice},${p.sellingPrice},${p.currentQuantity},${p.minimumQuantity},"${p.supplier}","${p.dateAdded}"`
      ).join("\n");
      filename = `bbims_inventory_report_${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      headers = "Request Number,Product Name,Quantity Needed,Supplier,Priority,Status,Submission Date\n";
      rows = requests.map(r => 
        `"${r.requestNumber}","${r.productName}",${r.quantityNeeded},"${r.supplierName}","${r.priorityLevel}","${r.status}","${r.requestDate}"`
      ).join("\n");
      filename = `bbims_supplier_purchsing_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerExportFakePDF = () => {
    alert("System Action: Standard PDF container rendered successfully using browser print layout. Ready to save.");
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Currency Conversion Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs text-xs">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white uppercase flex items-center gap-1.5 font-mono">
            <Globe className="w-4.5 h-4.5 text-blue-500" />
            <span>Multi-Currency Remote Exchanger</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            BBIMS offers real-time conversions to facilitate business monitoring when traveling outside the country. Selected rate: <b>1 USD = {currentCurrency.rateToUSD} {currentCurrency.code}</b>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400 font-semibold font-mono">Convert Dashboard:</span>
          <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border">
            {currenciesList.map(curr => (
              <button
                key={curr.code}
                onClick={() => setSelectedCurrency(curr.code)}
                className={`px-3 py-1 text-[11px] font-mono font-bold rounded-md transition ${
                  selectedCurrencyCode === curr.code
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {curr.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue cards converted */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Converted Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative shadow-sm">
          <span className="text-slate-400 font-bold uppercase tracking-wider font-mono block text-xs">Reported Revenue</span>
          <strong className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 grid gap-1">
            <span>{formatAmount(totalUSDRevenue)}</span>
          </strong>
          <span className="text-[11px] text-slate-500 block mt-2">
            Converted from ${totalUSDRevenue.toFixed(2)} USD (Invoice value)
          </span>
        </div>

        {/* Coverted gross margin profit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative shadow-sm">
          <span className="text-slate-400 font-bold uppercase tracking-wider font-mono block text-xs">Estimated Gross Profits</span>
          <strong className="text-2xl font-black text-green-600 dark:text-green-500 tracking-tight mt-1 grid gap-1">
            <span>{formatAmount(totalUSDRevenue - totalWholesaleUSDCost)}</span>
          </strong>
          <span className="text-[11px] text-slate-500 block mt-2">
            Margin: {totalUSDRevenue > 0 ? (((totalUSDRevenue - totalWholesaleUSDCost) / totalUSDRevenue) * 100).toFixed(1) : 0}% markup
          </span>
        </div>

        {/* Warehouse safety indicators */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative shadow-sm leading-relaxed">
          <span className="text-slate-400 font-bold uppercase tracking-wider font-mono block text-xs">Safety Audit Sheet</span>
          <div className="mt-3 grid grid-cols-2 text-xs font-mono">
            <div>
              <span className="text-slate-400 block font-sans">Low stock items:</span>
              <strong className={lowStockCount > 0 ? "text-amber-500" : "text-green-500"}>{lowStockCount} items</strong>
            </div>

            <div>
              <span className="text-slate-400 block font-sans">Out of stock:</span>
              <strong className={outOfStockCount > 0 ? "text-rose-500" : "text-slate-500"}>{outOfStockCount} items</strong>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 block mt-3">Refreshed: Real-time.</span>
        </div>

      </div>

      {/* Flagged Suspicious Transactions Alert Box */}
      {suspiciousSales.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-650 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-red-900 dark:text-red-400 font-sans uppercase">
                AUTOMATED SUSPICIOUS TRANSACTIONS DETECTOR ({suspiciousSales.length})
              </h4>
              <p className="text-[11px] text-red-700 dark:text-red-550">
                The business core security compiler automatically flagged these purchases for administrative verification:
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {suspiciousSales.map(item => (
              <div key={item.id} className="p-3 bg-white dark:bg-slate-900/80 border border-red-150 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{item.id} (Receipt: {item.receiptNumber})</span>
                  <span className="text-[10px] text-rose-500 font-bold font-mono uppercase tracking-wider bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded">
                    Audit Warn
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 leading-relaxed">
                  <div>
                    <span className="text-slate-400 block">Swiped customer:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{item.buyerName}</strong>
                    <span className="text-[10px] text-slate-400 block">{item.productName} x {item.quantityPurchased} units</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Flagged Conflict:</span>
                    <p className="text-red-600 dark:text-red-400 italic text-[10px]">{item.suspiciousReason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports workspace & export commands */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800 flex-col sm:flex-row gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans uppercase">Audit Export Console</h3>
            <p className="text-xs text-slate-500">Produce backup spreadsheets and invoices compiled for compliance.</p>
          </div>

          <button
            onClick={triggerExportFakePDF}
            className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition uppercase tracking-wide shrink-0"
          >
            <Printer className="w-3.5 h-3.5" /> Produce PDF Document
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
          
          {/* Sales Report Card */}
          <div className="p-4 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Financial Segment</span>
              <h5 className="font-bold text-slate-800 dark:text-white">Commercial Invoices ledger</h5>
              <p className="text-[11px] text-slate-500">Record values of all payments, client buyer details and dates.</p>
            </div>
            <button
              onClick={() => triggerExportCSV("sales")}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Export Sales CSV
            </button>
          </div>

          {/* Inventory Report Card */}
          <div className="p-4 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Logistics Segment</span>
              <h5 className="font-bold text-slate-800 dark:text-white">Active Warehouse Inventory</h5>
              <p className="text-[11px] text-slate-500">Writ of quantity values, safety limits, suppliers and item prices.</p>
            </div>
            <button
              onClick={() => triggerExportCSV("inventory")}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Export Stock CSV
            </button>
          </div>

          {/* Supplier Report Card */}
          <div className="p-4 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Vendor Segment</span>
              <h5 className="font-bold text-slate-800 dark:text-white">supplier Requisition Ledgers</h5>
              <p className="text-[11px] text-slate-500">Table of all manager orders dispatched, priorities and states.</p>
            </div>
            <button
              onClick={() => triggerExportCSV("suppliers")}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Export Orders CSV
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
