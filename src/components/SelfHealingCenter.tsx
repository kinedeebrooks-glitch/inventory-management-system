import React, { useState } from "react";
import { 
  getLogs, 
  isDatabaseConnected, 
  setDatabaseConnected, 
  runSystemResetAndRepair,
  addLog
} from "../dbStore";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Hammer, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  Bug, 
  Terminal, 
  Download 
} from "lucide-react";

export default function SelfHealingCenter() {
  const logs = getLogs();
  const dbConnected = isDatabaseConnected();
  const [isHealing, setIsHealing] = useState(false);
  const [repairSuccess, setRepairSuccess] = useState(false);

  // Diagnostic checklist states
  const errorLogsCount = logs.filter(l => l.severity === "error" || l.severity === "critical" || l.severity === "alert").length;
  const loginIssuesCount = logs.filter(l => l.type === "login" && l.severity !== "info").length;

  const runAutomaticDiagnosticsAndRepair = () => {
    setIsHealing(true);
    setRepairSuccess(false);

    // Simulated step-by-step repair logs
    setTimeout(() => {
      // 1. Reconnect database automatically
      setDatabaseConnected(true);
      
      // 2. Clear out schema errors, log repairs
      addLog("system", "Automatic diagnostics executed. Re-established active PostgreSQL cloud tunnels.", "info", "system-diagnostic");
      addLog("system", "Re-indexed primary user, transaction keys, and product categories.", "info", "system-diagnostic");
      
      setIsHealing(false);
      setRepairSuccess(true);
    }, 2500);
  };

  const forceDisconnectDb = () => {
    setDatabaseConnected(false);
    addLog("system", "CRITICAL WARNING: Database PostgreSQL connection failed. Ingress timed out (Code: ERR_CONN_TIMEOUT).", "critical", "tester");
    alert("Warning: Database PostgreSQL disconnected. Simulated connection error activated.");
  };

  const triggerExportDiagnostics = () => {
    const diagnosticText = `BBIMS SYSTEM DIAGNOSTIC REPORT\n============================\nTime: ${new Date().toISOString()}\nDatabase Access: ${dbConnected ? "STABLE" : "DISCONNECTED"}\nFailed Login Incidents: ${loginIssuesCount}\nSystem Flagged Errors: ${errorLogsCount}\nRecent logs count: ${logs.length}\n`;
    const blob = new Blob([diagnosticText + "\nLogs Details:\n" + JSON.stringify(logs, null, 2)], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bbims_diagnostics_${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-xs">
      
      {/* Upper health indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Heartbeat */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-950/20 text-green-500 rounded-lg flex items-center justify-center animate-pulse">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block font-mono text-[10px]">Diagnostics Heartbeat</span>
            <strong className="text-sm font-extrabold text-slate-800 dark:text-white block mt-0.5">BBIMS CORE ENGINE STABLE</strong>
            <span className="text-[10px] text-slate-400">Response payload: 2ms</span>
          </div>
        </div>

        {/* Database Tunnel State */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative shadow-sm flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            dbConnected 
              ? "bg-blue-100 dark:bg-blue-950/20 text-blue-500" 
              : "bg-red-100 dark:bg-red-950/20 text-red-500 animate-bounce"
          }`}>
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block font-mono text-[10px]">PostgreSQL connection</span>
            <strong className={`text-sm font-extrabold block mt-0.5 ${dbConnected ? "text-blue-600 dark:text-blue-400" : "text-rose-500"}`}>
              {dbConnected ? "CONNECTED" : "DISCONNECTED"}
            </strong>
            <span className="text-[10px] text-slate-400">Database Pool: 15/15 nodes active</span>
          </div>
        </div>

         {/* Warning count */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative shadow-sm flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            errorLogsCount > 0 ? "bg-amber-100 dark:bg-amber-950/20 text-amber-500" : "bg-slate-100 dark:bg-slate-850 text-slate-500"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block font-mono text-[10px]">System Error registers</span>
            <strong className="text-sm font-extrabold text-slate-800 dark:text-white block mt-0.5">
              {errorLogsCount} Incidents logged
            </strong>
            <span className="text-[10px] text-slate-400">Failed auth alerts: {loginIssuesCount}</span>
          </div>
        </div>

      </div>

      {/* Main diagnostics engine & automatic repair triggers */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Repair Workspace (7 cols) */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans uppercase">Diagnostics Control Center</h3>
              <p className="text-xs text-slate-500">Run automatic healing macros to repair database connection deficits.</p>
            </div>

            <button
              onClick={triggerExportDiagnostics}
              className="py-1.5 px-3 border hover:bg-slate-50 dark:hover:bg-slate-950 rounded font-bold font-mono text-[11px] uppercase transition"
            >
              Export System Report
            </button>
          </div>

          {!dbConnected ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold uppercase text-red-900 dark:text-red-400">CRITICAL PROBLEM IDENTIFIED</h4>
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 leading-relaxedHeight">
                    <b>Problem:</b> Database connection failed. The core system lost connection pool links to the remote PostgreSQL storage nodes.
                  </p>
                  <p className="text-[11px] text-red-500 mt-1">
                    <b>Suggested Fix:</b> Trigger full pool automatic repair. Re-establish encrypted sockets.
                  </p>
                </div>
              </div>

              <div className="pl-7 pt-1 flex gap-2">
                <button
                  onClick={runAutomaticDiagnosticsAndRepair}
                  disabled={isHealing}
                  className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow flex items-center gap-1 uppercase tracking-wider text-[10px]"
                >
                  <Hammer className="w-3.5 h-3.5" />
                  <span>{isHealing ? "Running repair..." : "Run Automatic Repair"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-905 rounded-xl text-green-700 dark:text-green-400 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <h4 className="font-bold uppercase text-green-900 dark:text-green-400">Smart diagnostics engine: CLEAR</h4>
                  <p className="text-[11px] mt-0.5">All tables, credentials, file synchronization, and database sockets are active.</p>
                </div>
              </div>

              {/* Developer simulator tool */}
              <button
                onClick={forceDisconnectDb}
                className="py-1 px-2.5 hover:bg-red-50 dark:hover:bg-red-950/50 text-[9px] text-slate-400 hover:text-red-500 font-mono border rounded transition"
                title="Mock PostgreSQL database breakdown to inspect self-healing mechanics"
              >
                [Simulation Db Break]
              </button>
            </div>
          )}

          {isHealing && (
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-3 border flex flex-col items-center justify-center text-center py-8">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <div className="space-y-1">
                <h5 className="font-bold text-slate-800 dark:text-white font-mono uppercase tracking-widest text-[10px]">Diagnostics macro executing</h5>
                <p className="text-slate-450 text-[10px]">Re-indexing primary columns, flushing pools, testing network bypass keys...</p>
              </div>
            </div>
          )}

          {repairSuccess && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl text-blue-700 dark:text-blue-400 flex items-center gap-2.5 font-mono">
              <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <b className="uppercase block">Repair Macro succeeded:</b>
                <span className="block mt-0.5 text-[10px]">Re-established DB Connection. Core schema tables restored. Security logs purged.</span>
              </div>
            </div>
          )}

          {/* Core Master Reset */}
          <div className="p-4 border-2 border-dashed border-red-200 dark:border-slate-800 rounded-xl space-y-2.5 bg-red-50/10">
            <h4 className="font-extrabold uppercase text-xs text-rose-500">Master Factory System Override</h4>
            <p className="text-[11px] text-slate-450 leading-relaxed">
              Resets and wipes all transaction registers, user overrides, and items catalog back to original brand-new factory configuration. 
              Useful for purging old test state. This resets your session to sign out.
            </p>
            <button
              onClick={() => {
                if (confirm(`CRITICAL DESTRUCTIVE SEED OVERRIDE: Destroy all transaction files and restore factory schema?`)) {
                  runSystemResetAndRepair();
                  alert("Factory settings reseeded. Relogin required.");
                  window.location.reload();
                }
              }}
              className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded uppercase tracking-wider text-[9px]"
            >
              Force full factor reseed
            </button>
          </div>

        </div>

        {/* Logs viewport (5 cols) */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="border-b pb-2.5 border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider font-mono">System Audit Telemetry</h4>
            <p className="text-[11px] text-slate-400">Live feed of internal security events, login attempts and actions.</p>
          </div>

          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1 font-mono text-[10px] leading-relaxed select-all">
            {logs.map(log => {
              const isErr = log.severity === "error" || log.severity === "critical" || log.severity === "alert";
              const isWarn = log.severity === "warning";
              return (
                <div key={log.id} className="p-2 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-850">
                  <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold mb-1">
                    <span>{new Date(log.timestamp).toLocaleTimeString()} · {log.id}</span>
                    <span className={`uppercase font-black ${isErr ? "text-red-500 bg-red-100 dark:bg-red-950/20 px-1 rounded" : isWarn ? "text-amber-500" : "text-green-500"}`}>
                      {log.severity}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-[10px]">{log.message}</p>
                  <div className="mt-1 flex gap-2 text-[8px] text-slate-400 select-none">
                    <span>IP: {log.ipAddress}</span>
                    {log.username && <span>User: @{log.username}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
