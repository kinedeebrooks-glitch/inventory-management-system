export type UserRole = "administrator" | "manager" | "staff";

export interface ManagerPermissions {
  addInventory: boolean;
  editInventory: boolean;
  createRequests: boolean;
  viewReports: boolean;
  printReports: boolean;
  viewSuppliers: boolean;
  exportData: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
  profilePicture: string; // URL or base64 or placeholder
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  address: string;
  isDisabled: boolean;
  isFirstLogin: boolean;
  permissions: ManagerPermissions;
}

export interface Product {
  id: string; // e.g. PROD-1001
  name: string;
  category: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  currentQuantity: number;
  minimumQuantity: number;
  supplier: string;
  dateAdded: string;
  lastUpdated: string;
  isArchived: boolean;
}

export interface Sale {
  id: string; // e.g. SALE-5001
  buyerName: string;
  productId: string;
  productName: string;
  quantityPurchased: number;
  unitPrice: number;
  totalPrice: number;
  currency: string; // e.g., USD, EUR, etc.
  amountPaid: number;
  date: string;
  receiptNumber: string;
  salespersonName: string;
  isSuspicious: boolean;
  suspiciousReason?: string;
  status: "saved" | "submitted";
}

export interface SupplierRequest {
  id: string; // e.g. REQ-3001
  requestNumber: string;
  productName: string;
  quantityNeeded: number;
  supplierName: string;
  priorityLevel: "low" | "medium" | "high";
  reason: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected" | "ordered" | "delivered";
  notes?: string;
}

export type LogType = "security" | "audit" | "login" | "error" | "system";
export type LogSeverity = "info" | "warning" | "error" | "alert" | "critical";

export interface SystemLog {
  id: string;
  timestamp: string;
  type: LogType;
  message: string;
  severity: LogSeverity;
  username?: string;
  ipAddress: string;
  device?: string;
}

export interface BackupRecord {
  id: string;
  timestamp: string;
  filename: string;
  size: string;
  type: string; // "Full System" | "Inventory" | "Sales" | "Suppliers"
  driveStatus: "Synced" | "Local Only";
  sheetsStatus: "Synced" | "Local Only";
}

export interface CloudSettings {
  googleSheetsBackupEnabled: boolean;
  googleSheetsId: string;
  googleDriveBackupEnabled: boolean;
  googleDriveFolder: string;
  autoBackupOnThreshold: boolean;
  syncFrequency: "instant" | "daily" | "weekly" | "manual";
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateToUSD: number;
}
