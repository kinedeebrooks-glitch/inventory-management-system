import React, { useState } from "react";
import { UserProfile } from "../types";
import { 
  getActiveUser, 
  setActiveUser, 
  setImpersonation, 
  getImpersonationRole,
  getActiveTheme,
  setActiveTheme
} from "../dbStore";
import { 
  Shield, 
  User, 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  Truck, 
  LineChart, 
  Settings, 
  LogOut, 
  Activity, 
  Sun, 
  Moon, 
  ChevronRight, 
  Phone,
  CornerDownLeft,
  X,
  Menu,
  Database,
  RefreshCw
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile;
}

export default function Sidebar({ currentTab, setCurrentTab, user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = getActiveTheme();

  // Determine if this is a nested impersonation session
  const isImpersonating = (user as any).impersonating === true;

  const handleLogout = () => {
    setActiveUser(null);
  };

  const stopImpersonating = () => {
    setImpersonation(null);
  };

  const toggleTheme = () => {
    setActiveTheme(theme === "light" ? "dark" : "light");
  };

  // WhatsApp click trigger
  const handleWhatsAppContact = () => {
    const defaultNum = user.whatsappNumber || "15550248844"; // default manager
    const message = `Hello Manager, I am using the BBIMS system and request technical assistance on current operation. Code: ${Math.floor(Math.random()*10000)}`;
    const url = `https://wa.me/${defaultNum}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard & Alerts",
      icon: LayoutDashboard,
      roles: ["administrator", "manager"],
    },
    {
      id: "inventory",
      label: "Inventory Catalog",
      icon: Package,
      roles: ["administrator", "manager"],
    },
    {
      id: "sales_entry",
      label: "Sales Entry Portal",
      icon: DollarSign,
      roles: ["administrator", "manager", "staff"],
    },
    {
      id: "suppliers",
      label: "Supplier Purchasing",
      icon: Truck,
      roles: ["administrator", "manager"],
    },
    {
      id: "reports",
      label: "Business Analytics",
      icon: LineChart,
      roles: ["administrator", "manager"],
    },
    {
      id: "backups",
      label: "Cloud Integration",
      icon: Database,
      roles: ["administrator"],
    },
    {
      id: "healing",
      label: "Health & Self-Healing",
      icon: Activity,
      roles: ["administrator"],
    },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 shrink-0 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white uppercase">BBIMS</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:shadow-sm"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          >
            {isOpen ? <X className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Main Sidebar Panel container */}
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative z-50 w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out border-r border-slate-800`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-sans font-black text-sm tracking-widest text-white uppercase">BROOKS</h1>
                <span className="text-[10px] text-blue-400 font-mono tracking-widest block uppercase">INTRANET</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="hidden md:flex p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
              title="Toggle Dark Mode"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

          {/* Connected Admin Impersonation Action */}
          {isImpersonating && (
            <div className="m-4 p-3 bg-indigo-950/70 border border-indigo-700/50 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-semibold">
                <CornerDownLeft className="w-3.5 h-3.5 animate-bounce" />
                <span>Impersonation Session</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Operating as <b>{user.fullName}</b>. You have administrative override power.
              </p>
              <button
                onClick={stopImpersonating}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-[10px] rounded justify-center items-center flex gap-1 shadow-sm uppercase transition"
              >
                <RefreshCw className="w-3 h-3 animate-spin" /> Restore Owner View
              </button>
            </div>
          )}

          {/* User Profile Summary */}
          <div className="p-6 bg-slate-950/40 border-b border-slate-800 flex items-center gap-3">
            <img
              src={user.profilePicture || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120"}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border border-slate-800"
              referrerPolicy="no-referrer"
            />
            <div className="truncate">
              <span className="block text-xs text-slate-400 capitalize font-mono">{user.role}</span>
              <h2 className="text-sm font-bold text-slate-200 truncate">{user.fullName}</h2>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {filteredItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition duration-250 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className="w-4.5 h-4.5" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-blue-100" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* WhatsApp & Signout footer */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <button
            onClick={handleWhatsAppContact}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all font-sans"
          >
            <Phone className="w-4 h-4 fill-emerald-100 text-emerald-100" />
            <span>Contact Manager</span>
          </button>

          <button
            onClick={handleLogout}
            id="sidebar-signout-btn"
            className="w-full py-2 bg-slate-850 hover:bg-red-950/30 text-rose-400 hover:text-rose-300 font-mono text-[11px] rounded-lg justify-center items-center flex gap-1.5 transition uppercase tracking-wider"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Log Out</span>
          </button>
        </div>
      </aside>

      {/* Desktop Overlay for Mobile Drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
        />
      )}
    </>
  );
}
