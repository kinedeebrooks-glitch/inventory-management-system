/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  initDb, 
  subscribeToDb, 
  getActiveUser, 
  setActiveTheme, 
  getActiveTheme,
  getCurrencies,
  getSelectedCurrency,
  setSelectedCurrency
} from "./dbStore";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./components/AdminDashboard";
import ManagerDashboard from "./components/ManagerDashboard";
import StaffSales from "./components/StaffSales";
import ReportsPanel from "./components/ReportsPanel";
import BackupSystem from "./components/BackupSystem";
import SelfHealingCenter from "./components/SelfHealingCenter";
import ProfileSettings from "./components/ProfileSettings";
import { 
  Shield, 
  User, 
  Menu, 
  FileText, 
  Bell, 
  AlertTriangle, 
  UserCheck, 
  HelpCircle,
  Database,
  ArrowRightLeft
} from "lucide-react";

export default function App() {
  const [, setTick] = useState(0);

  // Initialize DB & LocalStorage records
  useEffect(() => {
    initDb();
    
    // Subscribe to localStorage/state changes reactively
    const unsubscribe = subscribeToDb(() => {
      setTick(t => t + 1);
    });

    // Check pre-saved active theme
    const activeTheme = getActiveTheme();
    setActiveTheme(activeTheme);

    return () => unsubscribe();
  }, []);

  const currentUser = getActiveUser();

  // Tab state controller
  // Default to sales entry for staff, otherwise dashboard
  const defaultTab = currentUser?.role === "staff" ? "sales_entry" : "dashboard";
  const [currentTab, setCurrentTab] = useState(defaultTab);

  // Auto-correct tab when switching roles or users to prevent unauthorized views
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "staff" && currentTab !== "sales_entry" && currentTab !== "profile") {
        setCurrentTab("sales_entry");
      } else if (currentUser.role !== "staff" && currentTab === "sales_entry" && defaultTab === "dashboard") {
        setCurrentTab("dashboard");
      }
    }
  }, [currentUser?.role]);

  if (!currentUser) {
    return <LoginScreen />;
  }

  // Render correct component based on active navigation tab
  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        if (currentUser.role === "administrator") {
          return <AdminDashboard />;
        } else if (currentUser.role === "manager") {
          return <ManagerDashboard user={currentUser} setCurrentTab={setCurrentTab} />;
        }
        return <div className="p-8 text-center text-red-500 font-mono text-sm border rounded-xl bg-red-50">CRITICAL ERROR: Unauthorized access of administrative summaries.</div>;
      
      case "inventory":
        // Admin catalog CRUD is shared on AdminDashboard, but let's route to specific views
        if (currentUser.role === "administrator") {
          return <AdminDashboard />;
        } else {
          return <ManagerDashboard user={currentUser} setCurrentTab={setCurrentTab} />;
        }

      case "sales_entry":
        return <StaffSales user={currentUser} />;

      case "suppliers":
        if (currentUser.role === "administrator") {
          return <AdminDashboard />;
        } else {
          return <ManagerDashboard user={currentUser} setCurrentTab={setCurrentTab} />;
        }

      case "reports":
        if (currentUser.role === "administrator" || (currentUser.role === "manager" && currentUser.permissions.viewReports)) {
          return <ReportsPanel />;
        }
        return (
          <div className="p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-xl text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-amber-900 dark:text-amber-400">ACCESS RESTRICTED BY OWNER POLICY</h4>
            <p className="text-xs text-amber-700 dark:text-amber-500 max-w-md mx-auto">
              Your account has been restricted from viewing the gross metrics dashboards. Contact Admin to adjust Manager Permissions.
            </p>
          </div>
        );

      case "backups":
        if (currentUser.role === "administrator") {
          return <BackupSystem />;
        }
        return <div className="p-8 text-red-500 font-mono text-xs">Permission level deficit. Administrator credentials required.</div>;

      case "healing":
        if (currentUser.role === "administrator") {
          return <SelfHealingCenter />;
        }
        return <div className="p-8 text-red-500 font-mono text-xs">Permission level deficit. Administrator credentials required.</div>;

      case "profile":
        return <ProfileSettings user={currentUser} />;

      default:
        return <div className="p-8">Section frame error.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* 1. Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} user={currentUser} />

      {/* 2. Main Content Frame */}
      <main className="flex-1 flex flex-col min-w-0 font-sans p-4 md:p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Top Header Breadcrumb bar */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-widest font-black">
              <span>BBIMS INTRANET NODE</span>
              <span>/</span>
              <span className="text-blue-500">{currentTab}</span>
            </div>
            <h1 className="text-xl font-bold font-sans text-slate-900 dark:text-white capitalize flex items-center gap-2">
              {currentTab.replace("_", " ")}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Display Currency switcher */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold select-none">DISPLAY:</span>
              <select
                id="header-currency-selector"
                value={getSelectedCurrency()}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer font-bold text-xs"
              >
                {getCurrencies().map((c) => (
                  <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick action buttons / info profile */}
            <button
              onClick={() => setCurrentTab("profile")}
              className="py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-xs flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-350 transition"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <div className="hidden sm:flex flex-col text-right font-mono text-[10px] text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300">Server Time (EST)</span>
              <span>2026-06-22 UTC</span>
            </div>
          </div>
        </header>

        {/* Tab content viewer frame */}
        <div id="core-tab-viewport" className="flex-1">
          {renderTabContent()}
        </div>

      </main>
    </div>
  );
}

