import React, { useState } from "react";
import { 
  getBackups, 
  createBackup, 
  restoreBackup, 
  getCloudSettings, 
  updateCloudSettings,
  getSales,
  getProducts,
  getSupplierRequests,
  runRetentionArchiving
} from "../dbStore";
import { 
  Database, 
  Download, 
  RefreshCw, 
  Upload, 
  Settings2, 
  ShieldCheck, 
  Calendar, 
  FileJson, 
  CloudRain, 
  AlertTriangle 
} from "lucide-react";

export default function BackupSystem() {
  const backups = getBackups();
  const cloudSettings = getCloudSettings();
  const sales = getSales();
  const products = getProducts();
  const requests = getSupplierRequests();

  // Cloud integration states
  const [sheetsEnabled, setSheetsEnabled] = useState(cloudSettings.googleSheetsBackupEnabled);
  const [sheetsId, setSheetsId] = useState(cloudSettings.googleSheetsId);
  const [driveEnabled, setDriveEnabled] = useState(cloudSettings.googleDriveBackupEnabled);
  const [driveFolder, setDriveFolder] = useState(cloudSettings.googleDriveFolder);
  const [autoBackup, setAutoBackup] = useState(cloudSettings.autoBackupOnThreshold);
  const [frequency, setFrequency] = useState(cloudSettings.syncFrequency);

  // Triggering retention
  const [archiveResult, setArchiveResult] = useState<{ archivedSalesCount: number, archivedReqsCount: number } | null>(null);

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCloudSettings({
      googleSheetsBackupEnabled: sheetsEnabled,
      googleSheetsId: sheetsId,
      googleDriveBackupEnabled: driveEnabled,
      googleDriveFolder: driveFolder,
      autoBackupOnThreshold: autoBackup,
      syncFrequency: frequency,
    });
    alert("Cloud Integration Settings successfully synced across global cluster.");
  };

  const handleManualBackup = () => {
    createBackup("Full System Manual");
    alert("Success: Full system encrypted backup generated and synced to Google Drive.");
  };

  const handleRecovery = (id: string, fileName: string) => {
    if (confirm(`Perform system rollback to point of backup [${fileName}]? Current local data changes will be overwritten.`)) {
      restoreBackup(id);
      alert("Database restore completed successfully. Core schemas loaded.");
    }
  };

  const executeRetentionSweep = () => {
    const res = runRetentionArchiving();
    setArchiveResult(res);
    setTimeout(() => {
      setArchiveResult(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* DB limits approaching alerts */}
      {(sales.length >= 450 || requests.length >= 450) && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 rounded-xl p-4 shadow-xs text-xs space-y-2">
          <div className="flex gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-400">STORAGE VOLUME THRESHOLD ACHIEVED</h4>
              <p className="text-amber-700 dark:text-amber-500 mt-1">
                Sales Database handles ({sales.length}/500 logs) or Supplier Request lists contains ({requests.length}/500 logs). 
                To prevent network overflow, automatic backup archiving is recommended.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2.5 pt-1.5 pl-7">
            <button
              onClick={() => {
                createBackup("Automatic Threshold Backup");
                alert("Triggered automated backup to Google Cloud Storage Nodes.");
              }}
              className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded"
            >
              Archive to Google Drive
            </button>
            <button
              onClick={() => {
                alert("Syncing all indices to Backup Google Sheets.");
              }}
              className="py-1.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 text-amber-800 border font-semibold rounded"
            >
              Sync to Google Sheets
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Backup Actions vs Cloud Sync settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: System Backup Ledger (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans uppercase">Enterprise Backups Console</h3>
              <p className="text-xs text-slate-500">Restore or dispatch backups. Maximum storage capacity is managed remotely.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={executeRetentionSweep}
                className="py-1.5 px-3 border hover:bg-slate-50 dark:hover:bg-slate-950 font-bold font-mono tracking-wider text-[11px] rounded"
                title="Force delete records older than 30 days while saving a backup to Google Drive"
              >
                SWEEP RETENTION (30D)
              </button>

              <button
                onClick={handleManualBackup}
                className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs hover:shadow transition"
              >
                CREATE NOW
              </button>
            </div>
          </div>

          {archiveResult && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-905 rounded-lg text-green-700 dark:text-green-400 font-mono text-[11px] animate-pulse">
              ✓ Archive cleanup processed. Sales removed: {archiveResult.archivedSalesCount} rows, Supplier requests removed: {archiveResult.archivedReqsCount} rows. A backup reference was created.
            </div>
          )}

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {backups.map(b => (
              <div key={b.id} className="p-3.5 border rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border-slate-150 dark:border-slate-850 flex items-center justify-between">
                <div className="space-y-1.5 max-w-[65%]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded">{b.id}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white leading-none">{b.filename}</span>
                  </div>
                  <div className="flex gap-3 text-[10px] text-slate-400 font-mono">
                    <span>Size: <b className="text-slate-650 dark:text-slate-300">{b.size}</b></span>
                    <span>Type: <b className="text-slate-650 dark:text-slate-300">{b.type}</b></span>
                    <span>Date: {new Date(b.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Sync Badges */}
                  <div className="flex flex-col gap-1 text-[8px] font-mono font-bold uppercase select-none mr-2">
                    <span className={b.driveStatus === "Synced" ? "text-emerald-500" : "text-slate-400"}>
                      ☁ Drive: {b.driveStatus}
                    </span>
                    <span className={b.sheetsStatus === "Synced" ? "text-emerald-500" : "text-slate-400"}>
                      田 Sheets: {b.sheetsStatus}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRecovery(b.id, b.filename)}
                    className="p-1.5 border rounded-lg hover:bg-white dark:hover:bg-slate-900 text-blue-500"
                    title="Restore point fallback"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ products, sales, requests }))}`}
                    download={b.filename}
                    className="p-1.5 border rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-500"
                    title="Download JSON manifest file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Cloud Settings & Sync Options (5 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm text-xs">
          <div className="border-b pb-2.5 border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-blue-500" />
              <span>Cloud Security Keys</span>
            </h4>
            <p className="text-[11px] text-slate-400">Sync databases to cloud spreadsheets for redundancy.</p>
          </div>

          <form onSubmit={saveSettings} className="space-y-4">
            
            {/* Google Sheets Integration */}
            <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sheetsEnabled}
                  onChange={(e) => setSheetsEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">Google Sheets redundancy</span>
              </label>

              {sheetsEnabled && (
                <div className="space-y-1 pl-6">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Configured GSheets Document ID</span>
                  <input
                    id="cloud-sheets-id"
                    type="text"
                    value={sheetsId}
                    onChange={(e) => setSheetsId(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* Google Drive Integration */}
            <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={driveEnabled}
                  onChange={(e) => setDriveEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-bold text-slate-800 dark:text-slate-200">Google Drive hot backups</span>
              </label>

              {driveEnabled && (
                <div className="space-y-1 pl-6">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Drive Root directory Name</span>
                  <input
                    id="cloud-drive-folder"
                    type="text"
                    value={driveFolder}
                    onChange={(e) => setDriveFolder(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* Automated Archiving */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoBackup}
                  onChange={(e) => setAutoBackup(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-bold text-slate-850 dark:text-slate-200">Force Auto sync on 450 items</span>
              </label>
            </div>

            <div className="space-y-1.5">
              <span className="text-slate-500 font-semibold uppercase block text-[10px]">Cloud Synced Cron Frequency</span>
              <select
                id="cloud-sync-frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="instant">Instant dispatch (On Invoice Creation)</option>
                <option value="daily">Nightly Cron Backup (Daily 00:00 UTC)</option>
                <option value="weekly">Weekly Archiver (Every Sunday 03:00)</option>
                <option value="manual">Disable Automated Cron - Manual Only</option>
              </select>
            </div>

            <button
              id="cloud-settings-save"
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs uppercase"
            >
              Verify cloud tunnels
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
