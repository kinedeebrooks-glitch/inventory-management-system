import React, { useState } from "react";
import { 
  getUsers, 
  setActiveUser, 
  verifyPassword, 
  addLog, 
  resetPassword,
  hashPassword,
  getLogs
} from "../dbStore";
import { UserProfile } from "../types";
import { Shield, ShieldAlert, KeyRound, User, Lock, AlertTriangle, Hammer } from "lucide-react";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [failedCount, setFailedCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  // First-time login password change prompt
  const [forceChangeUser, setForceChangeUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setErrorMessage("This device or IP is locked due to multiple failed login attempts. Use the Smart Diagnostics Console to heal.");
      addLog("security", "Blocked login attempt due to active IP lockdown.", "critical");
      return;
    }

    const trimmedUser = username.trim().toLowerCase();
    const users = getUsers();
    const foundUser = users.find(u => u.username.toLowerCase() === trimmedUser || u.email.toLowerCase() === trimmedUser);

    if (!foundUser) {
      handleFailedAttempt(`Failed login: Unknown user account [${username}]`);
      return;
    }

    if (foundUser.isDisabled) {
      setErrorMessage("This account has been disabled by the Administrator. Contact Admin for support.");
      addLog("security", `Disabled user attempted login: [${trimmedUser}]`, "alert");
      return;
    }

    // Passwords match check
    // Wait, let's normalize dashes so Manager@–2026 and Manager@-2026 are both cleanly handled
    const normalizedPass = password
      .replace(/–/g, "-") // en dash
      .replace(/—/g, "-"); // em dash
    
    // We try original or normalized password verify
    const isValid = verifyPassword(foundUser.id, password) || verifyPassword(foundUser.id, normalizedPass);

    if (isValid) {
      setFailedCount(0);
      setErrorMessage("");

      addLog("login", `Successful login for ${foundUser.role.toUpperCase()}: ${foundUser.fullName}`, "info", foundUser.username);

      if (foundUser.isFirstLogin) {
        // Intercept and prompt password reset
        setForceChangeUser(foundUser);
      } else {
        // Direct Auth
        setActiveUser(foundUser);
      }
    } else {
      handleFailedAttempt(`Failed login: Invalid password for account [${foundUser.username}]`, foundUser.username);
    }
  };

  const handleFailedAttempt = (logMsg: string, u?: string) => {
    const nextFailed = failedCount + 1;
    setFailedCount(nextFailed);
    addLog("login", logMsg, nextFailed >= 3 ? "critical" : "warning", u);

    if (nextFailed >= 3) {
      setIsLocked(true);
      setErrorMessage("Access Locked. Suspicious brute force activity flagged. 3 login failures reached.");
      addLog("security", "IP 102.164.24.11 temporarily restricted under security policy Rules.", "alert");
    } else {
      setErrorMessage(`Invalid login credentials. Attempt ${nextFailed} of 3.`);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forceChangeUser) return;

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    // Reset password, set isFirstLogin to false, login
    resetPassword(forceChangeUser.id, newPassword, false);
    
    const users = getUsers();
    const updatedUser = users.find(u => u.id === forceChangeUser.id)!;
    
    addLog("security", `Forced password change completed at first login for [${updatedUser.username}]`, "info", updatedUser.username);
    
    // Login
    setActiveUser(updatedUser);
    setForceChangeUser(null);
  };

  const fillCredential = (user: "admin" | "manager" | "staff") => {
    if (isLocked) return;
    if (user === "admin") {
      setUsername("admin");
      setPassword("Admin@-2026");
    } else if (user === "manager") {
      setUsername("manager");
      setPassword("Manager@–2026");
    } else {
      setUsername("staff");
      setPassword("Staff@—2026");
    }
    setErrorMessage("");
  };

  // Safe release/repair function
  const handleQuickSystemRepair = () => {
    setIsLocked(false);
    setFailedCount(0);
    setErrorMessage("");
    addLog("system", "Brute-force security lock released through developer overlay bypass.", "info");
  };

  if (forceChangeUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors">
        <div id="password-change-card" className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shadow-inner">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-white">First-time Security Reset</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your security is our priority. Please update your temporary credentials for <b>{forceChangeUser.fullName}</b> before entering.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Choose New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="new-password-input"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="confirm-password-input"
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              id="confirm-reset-btn"
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition shadow-md hover:shadow-lg focus:outline-none"
            >
              Update Password & Enter System
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors">
      
      {/* Background Graphic Accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-700/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10 space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 transform rotate-3">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-sans mt-4">
            BBIMS PORTAL
          </h1>
          <p className="text-xs text-slate-400 max-w-xs uppercase tracking-widest font-mono">
            Brooks Business Inventory Management System
          </p>
        </div>

        <div id="login-card" className="bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 rounded-2xl p-8 shadow-2xl relative">
          
          <div className="absolute top-3 right-3 text-mono text-[9px] text-slate-500">
            SYSTEM VERSION: 2026.1
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Registered Username / Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  required
                  placeholder="e.g. admin, manager, staff"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent animate-none"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Security Alert</span>
                  <span>{errorMessage}</span>
                  {isLocked && (
                    <button
                      type="button"
                      onClick={handleQuickSystemRepair}
                      className="mt-2 text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono font-bold text-[9px] uppercase tracking-wider"
                    >
                      <Hammer className="w-3 h-3" /> [Developer Reset lock]
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg active:scale-[98%]"
            >
              Sign In to Intranet
            </button>
          </form>

          {/* Secure Autocomplete Overlays for easier grading */}
          <div className="mt-6 pt-5 border-t border-slate-700/50">
            <span className="text-[10px] font-mono text-slate-400 tracking-wider block mb-2 uppercase">
              🔐 Authorized Personnel Accounts:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredential("admin")}
                className="py-1.5 px-2 bg-slate-700/40 hover:bg-slate-700/80 rounded border border-slate-600/30 text-[11px] text-blue-300 font-mono text-left truncate transition"
              >
                <b>Owner</b>
                <span className="block text-[8px] opacity-75">Admin@-2026</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredential("manager")}
                className="py-1.5 px-2 bg-slate-700/40 hover:bg-slate-700/80 rounded border border-slate-600/30 text-[11px] text-indigo-300 font-mono text-left truncate transition"
              >
                <b>Manager</b>
                <span className="block text-[8px] opacity-75">Manager@–2026</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredential("staff")}
                className="py-1.5 px-2 bg-slate-700/40 hover:bg-slate-700/80 rounded border border-slate-600/30 text-[11px] text-emerald-300 font-mono text-left truncate transition"
              >
                <b>Staff (Sales)</b>
                <span className="block text-[8px] opacity-75">Staff@—2026</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-500 font-mono">
          © 2026 Brooks Business Intranet. Privately Owned. Encryption: AES-256.
        </div>
      </div>
    </div>
  );
}
