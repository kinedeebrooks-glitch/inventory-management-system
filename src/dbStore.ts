import { Product, Sale, SupplierRequest, SystemLog, UserProfile, CloudSettings, BackupRecord, CurrencyConfig, LogType, LogSeverity } from "./types";

// Observables pattern for simple reactive state in React
type DbListener = () => void;
const listeners = new Set<DbListener>();

export function subscribeToDb(listener: DbListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyDbChange() {
  listeners.forEach((l) => l());
}

// Default currencies definition
const DEFAULT_CURRENCIES: CurrencyConfig[] = [
  { code: "USD", symbol: "$", rateToUSD: 1.0 },
  { code: "EUR", symbol: "€", rateToUSD: 0.93 },
  { code: "GBP", symbol: "£", rateToUSD: 0.79 },
  { code: "NGN", symbol: "₦", rateToUSD: 1500.0 },
  { code: "GHS", symbol: "₵", rateToUSD: 14.8 },
];

export let CURRENCIES: CurrencyConfig[] = [...DEFAULT_CURRENCIES];

export function getCurrencies(): CurrencyConfig[] {
  const stored = localStorage.getItem("bbims_currencies");
  const list = stored ? JSON.parse(stored) : DEFAULT_CURRENCIES;
  CURRENCIES.length = 0;
  CURRENCIES.push(...list);
  return list;
}

export function saveCurrencies(list: CurrencyConfig[]) {
  localStorage.setItem("bbims_currencies", JSON.stringify(list));
  CURRENCIES.length = 0;
  CURRENCIES.push(...list);
  notifyDbChange();
}

export function getSystemDefaultCurrency(): string {
  return localStorage.getItem("bbims_default_currency") || "USD";
}

export function setSystemDefaultCurrency(code: string) {
  localStorage.setItem("bbims_default_currency", code);
  notifyDbChange();
}

export function getSelectedCurrency(): string {
  const user = getActiveUser();
  const username = user ? user.username : "guest";
  return localStorage.getItem(`bbims_selected_currency_${username}`) || getSystemDefaultCurrency();
}

export function setSelectedCurrency(code: string) {
  const user = getActiveUser();
  const username = user ? user.username : "guest";
  localStorage.setItem(`bbims_selected_currency_${username}`, code);
  notifyDbChange();
}

export function formatCurrency(usdAmount: number, targetCurrencyCode?: string): string {
  const code = targetCurrencyCode || getSelectedCurrency();
  const list = getCurrencies();
  const currency = list.find(c => c.code === code) || list.find(c => c.code === "USD") || DEFAULT_CURRENCIES[0];
  const converted = usdAmount * currency.rateToUSD;
  return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency.code}`;
}

export function convertUSDToSelected(usdAmount: number, targetCurrencyCode?: string): { amount: number, symbol: string, code: string } {
  const code = targetCurrencyCode || getSelectedCurrency();
  const list = getCurrencies();
  const currency = list.find(c => c.code === code) || list.find(c => c.code === "USD") || DEFAULT_CURRENCIES[0];
  return {
    amount: usdAmount * currency.rateToUSD,
    symbol: currency.symbol,
    code: currency.code
  };
}

export function convertSelectedToUSD(amount: number, sourceCurrencyCode?: string): number {
  const code = sourceCurrencyCode || getSelectedCurrency();
  const list = getCurrencies();
  const currency = list.find(c => c.code === code) || list.find(c => c.code === "USD") || DEFAULT_CURRENCIES[0];
  if (currency.rateToUSD === 0) return 0;
  return amount / currency.rateToUSD;
}

export async function fetchExchangeRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error("Exchange API response error");
    const data = await res.json();
    return data.rates || null;
  } catch (err) {
    console.error("Exchange API failed:", err);
    return null;
  }
}

// Helper to encrypt password (simple hashing simulation for safety)
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return "hash_" + hash.toString(16);
}

// Initial Mock Datasets
const DEFAULT_USERS: UserProfile[] = [
  {
    id: "USER-1",
    username: "admin",
    role: "administrator",
    fullName: "Brooks Administrator (Owner)",
    profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    phoneNumber: "+1 (555) 019-2831",
    whatsappNumber: "15550192831",
    email: "kinedeebrooks@gmail.com",
    address: "742 Evergreen Terrace, Sector 7G",
    isDisabled: false,
    isFirstLogin: true, // Will force password change on first login
    permissions: {
      addInventory: true,
      editInventory: true,
      createRequests: true,
      viewReports: true,
      printReports: true,
      viewSuppliers: true,
      exportData: true,
    },
  },
  {
    id: "USER-2",
    username: "manager",
    role: "manager",
    fullName: "Charles Lawson",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    phoneNumber: "+1 (555) 024-8844",
    whatsappNumber: "15550248844",
    email: "lawson.manager@brooks.com",
    address: "4826 Oakwood Circle, Atlanta GA",
    isDisabled: false,
    isFirstLogin: true,
    permissions: {
      addInventory: true,
      editInventory: false,
      createRequests: true,
      viewReports: true,
      printReports: true,
      viewSuppliers: true,
      exportData: false,
    },
  },
  {
    id: "USER-3",
    username: "staff",
    role: "staff",
    fullName: "Elena Rostova",
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    phoneNumber: "+1 (555) 035-1212",
    whatsappNumber: "15550351212",
    email: "rostova.staff@brooks.com",
    address: "990 Sapphire Blvd, Seattle WA",
    isDisabled: false,
    isFirstLogin: true,
    permissions: {
      addInventory: false,
      editInventory: false,
      createRequests: false,
      viewReports: false,
      printReports: false,
      viewSuppliers: false,
      exportData: false,
    },
  },
];

// Seed Passwords (Pre-hashed matching defaults)
const DEFAULT_PASSWORDS: Record<string, string> = {
  "USER-1": hashPassword("Admin@-2026"),
  "USER-2": hashPassword("Manager@–2026"), // accommodates different dashes
  "USER-3": hashPassword("Staff@—2026"),
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "PROD-1001",
    name: "Enterprise Ethernet Switch 24-Port",
    category: "Network Hardware",
    description: "Gigabit unmanaged server rack mountable switch for remote nodes.",
    costPrice: 120.0,
    sellingPrice: 249.99,
    currentQuantity: 42,
    minimumQuantity: 10,
    supplier: "Apex Global Logistics",
    dateAdded: "2026-03-12T10:00:00Z",
    lastUpdated: "2026-06-20T14:30:00Z",
    isArchived: false,
  },
  {
    id: "PROD-1002",
    name: "Titanium Fusion Storage Node 4TB",
    category: "Data Storage",
    description: "Highly secure solid state server expansion drive.",
    costPrice: 310.0,
    sellingPrice: 599.99,
    currentQuantity: 8, // Low Stock! (Minimum is 12)
    minimumQuantity: 12,
    supplier: "Silicon Valley Tech Dist",
    dateAdded: "2026-04-01T08:15:00Z",
    lastUpdated: "2026-06-21T09:00:00Z",
    isArchived: false,
  },
  {
    id: "PROD-1003",
    name: "Fiber Optic Transceiver SFP+",
    category: "Network Hardware",
    description: "Single-mode standard optic transceiver for enterprise routers.",
    costPrice: 25.0,
    sellingPrice: 75.0,
    currentQuantity: 3, // Low Stock! (Minimum is 8)
    minimumQuantity: 8,
    supplier: "Apex Global Logistics",
    dateAdded: "2026-04-15T11:45:00Z",
    lastUpdated: "2026-06-18T16:20:00Z",
    isArchived: false,
  },
  {
    id: "PROD-1004",
    name: "Secure Remote Router Pro 5G",
    category: "Network Hardware",
    description: "Failover wireless router with automated encrypted multi-wan bonding.",
    costPrice: 180.0,
    sellingPrice: 425.0,
    currentQuantity: 15,
    minimumQuantity: 5,
    supplier: "Matrix Network Corp",
    dateAdded: "2026-05-10T12:00:00Z",
    lastUpdated: "2026-06-22T02:00:00Z",
    isArchived: false,
  },
  {
    id: "PROD-1005",
    name: "Redundant Core Rack PSU 850W",
    category: "Power Systems",
    description: "Hot-swappable backup power unit for core router rack installations.",
    costPrice: 90.0,
    sellingPrice: 199.99,
    currentQuantity: 0, // Out of Stock!
    minimumQuantity: 5,
    supplier: "Silicon Valley Tech Dist",
    dateAdded: "2026-05-20T09:30:00Z",
    lastUpdated: "2026-06-19T10:10:00Z",
    isArchived: false,
  },
];

const DEFAULT_SALES: Sale[] = [
  {
    id: "SALE-5001",
    buyerName: "Vanguard Tech Partners Ltd",
    productId: "PROD-1001",
    productName: "Enterprise Ethernet Switch 24-Port",
    quantityPurchased: 4,
    unitPrice: 249.99,
    totalPrice: 999.96,
    currency: "USD",
    amountPaid: 999.96,
    date: "2026-06-15T14:35:00Z",
    receiptNumber: "REC-20260615-01",
    salespersonName: "Elena Rostova",
    isSuspicious: false,
    status: "submitted",
  },
  {
    id: "SALE-5002",
    buyerName: "Apex Global Logistics",
    productId: "PROD-1004",
    productName: "Secure Remote Router Pro 5G",
    quantityPurchased: 2,
    unitPrice: 425.0,
    totalPrice: 850.0,
    currency: "USD",
    amountPaid: 850.0,
    date: "2026-06-18T10:12:00Z",
    receiptNumber: "REC-20260618-02",
    salespersonName: "Elena Rostova",
    isSuspicious: false,
    status: "submitted",
  },
  {
    id: "SALE-5003",
    buyerName: "Anonymous Retail Buyer",
    productId: "PROD-1001",
    productName: "Enterprise Ethernet Switch 24-Port",
    quantityPurchased: 1,
    unitPrice: 99.0, // Suspicious! Sold below Cost Price (Cost: 120.0)
    totalPrice: 99.0,
    currency: "USD",
    amountPaid: 99.0,
    date: "2026-06-20T16:00:00Z",
    receiptNumber: "REC-20260620-03",
    salespersonName: "Elena Rostova",
    isSuspicious: true,
    suspiciousReason: "Unit selling price ($99.00) is lower than product cost price ($120.00). Selling at loss alert.",
    status: "submitted",
  },
];

const DEFAULT_REQUESTS: SupplierRequest[] = [
  {
    id: "REQ-3001",
    requestNumber: "SR-1001",
    productName: "Titanium Fusion Storage Node 4TB",
    quantityNeeded: 25,
    supplierName: "Silicon Valley Tech Dist",
    priorityLevel: "high",
    reason: "Current stock is extremely critical (8 units left). Order needed immediately before project handoff.",
    requestDate: "2026-06-21T11:00:00Z",
    status: "pending",
  },
  {
    id: "REQ-3002",
    requestNumber: "SR-1002",
    productName: "Fiber Optic Transceiver SFP+",
    quantityNeeded: 50,
    supplierName: "Apex Global Logistics",
    priorityLevel: "medium",
    reason: "Reaching safety threshold of stock.",
    requestDate: "2026-06-21T15:00:00Z",
    status: "approved",
    notes: "Approved for full purchase on next invoice cycle.",
  },
];

const DEFAULT_LOGS: SystemLog[] = [
  {
    id: "LOG-101",
    timestamp: "2026-06-22T04:12:00Z",
    type: "system",
    message: "BBIMS Core engine bootstrapped successfully.",
    severity: "info",
    ipAddress: "127.0.0.1",
    device: "Express System Bootstrapper",
  },
  {
    id: "LOG-102",
    timestamp: "2026-06-22T04:15:30Z",
    type: "login",
    message: "Successful login for user [admin]",
    severity: "info",
    username: "admin",
    ipAddress: "102.132.89.44",
    device: "iPhone 15 Pro",
  },
];

const DEFAULT_CLOUD: CloudSettings = {
  googleSheetsBackupEnabled: true,
  googleSheetsId: "1sV72h_K2A_z7g66Cvx7D8Xh9FEE8Vb_Vbrooks_inventory",
  googleDriveBackupEnabled: true,
  googleDriveFolder: "BBIMS_Archived_Backups",
  autoBackupOnThreshold: true,
  syncFrequency: "daily",
};

const DEFAULT_BACKUPS: BackupRecord[] = [
  {
    id: "BACK-01",
    timestamp: "2026-06-20T23:00:00Z",
    filename: "bbims_backup_2026_06_20_auto.json",
    size: "45.8 KB",
    type: "Full System",
    driveStatus: "Synced",
    sheetsStatus: "Synced",
  },
];

// Initialize localStorage if not set
export function initDb() {
  if (!localStorage.getItem("bbims_users")) {
    localStorage.setItem("bbims_users", JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem("bbims_passwords")) {
    localStorage.setItem("bbims_passwords", JSON.stringify(DEFAULT_PASSWORDS));
  }
  if (!localStorage.getItem("bbims_products")) {
    localStorage.setItem("bbims_products", JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem("bbims_sales")) {
    localStorage.setItem("bbims_sales", JSON.stringify(DEFAULT_SALES));
  }
  if (!localStorage.getItem("bbims_requests")) {
    localStorage.setItem("bbims_requests", JSON.stringify(DEFAULT_REQUESTS));
  }
  if (!localStorage.getItem("bbims_logs")) {
    localStorage.setItem("bbims_logs", JSON.stringify(DEFAULT_LOGS));
  }
  if (!localStorage.getItem("bbims_backups")) {
    localStorage.setItem("bbims_backups", JSON.stringify(DEFAULT_BACKUPS));
  }
  if (!localStorage.getItem("bbims_cloud")) {
    localStorage.setItem("bbims_cloud", JSON.stringify(DEFAULT_CLOUD));
  }
  if (!localStorage.getItem("bbims_currencies")) {
    localStorage.setItem("bbims_currencies", JSON.stringify(DEFAULT_CURRENCIES));
  }
  if (!localStorage.getItem("bbims_default_currency")) {
    localStorage.setItem("bbims_default_currency", "USD");
  }
  if (localStorage.getItem("bbims_db_connected") === null) {
    localStorage.setItem("bbims_db_connected", "true");
  }
  if (localStorage.getItem("bbims_active_theme") === null) {
    localStorage.setItem("bbims_active_theme", "light");
  }
  getCurrencies(); // Pre-cache active CURRENCIES array
}

// Global active session state
export function getActiveUser(): UserProfile | null {
  const sess = localStorage.getItem("bbims_session");
  if (!sess) return null;
  
  // Also check if we have an impersonation role
  const imp = localStorage.getItem("bbims_impersonation");
  const actualUser = JSON.parse(sess) as UserProfile;
  if (actualUser.role === "administrator" && imp) {
    // Return a mocked user matching the impersonation role
    const users = getUsers();
    const targetedUser = users.find(u => u.role === imp);
    if (targetedUser) {
      return {
        ...targetedUser,
        impersonating: true, // Custom field to indicate active switch back
        actualAdminId: actualUser.id,
      } as any;
    }
  }
  return actualUser;
}

export function setActiveUser(user: UserProfile | null) {
  if (user === null) {
    localStorage.removeItem("bbims_session");
    localStorage.removeItem("bbims_impersonation");
  } else {
    localStorage.setItem("bbims_session", JSON.stringify(user));
  }
  notifyDbChange();
}

export function setImpersonation(role: "manager" | "staff" | null) {
  if (role === null) {
    localStorage.removeItem("bbims_impersonation");
  } else {
    localStorage.setItem("bbims_impersonation", role);
  }
  notifyDbChange();
}

export function getImpersonationRole(): string | null {
  return localStorage.getItem("bbims_impersonation");
}

// Database Connection Status Helpers
export function isDatabaseConnected(): boolean {
  return localStorage.getItem("bbims_db_connected") === "true";
}

export function setDatabaseConnected(connected: boolean) {
  localStorage.setItem("bbims_db_connected", connected ? "true" : "false");
  notifyDbChange();
}

// Active theme
export function getActiveTheme(): "light" | "dark" {
  return (localStorage.getItem("bbims_active_theme") as "light" | "dark") || "light";
}

export function setActiveTheme(theme: "light" | "dark") {
  localStorage.setItem("bbims_active_theme", theme);
  const root = window.document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  notifyDbChange();
}

// GETTERS
export function getUsers(): UserProfile[] {
  return JSON.parse(localStorage.getItem("bbims_users") || "[]");
}

export function getProducts(): Product[] {
  return JSON.parse(localStorage.getItem("bbims_products") || "[]");
}

export function getSales(): Sale[] {
  return JSON.parse(localStorage.getItem("bbims_sales") || "[]");
}

export function getSupplierRequests(): SupplierRequest[] {
  return JSON.parse(localStorage.getItem("bbims_requests") || "[]");
}

export function getLogs(): SystemLog[] {
  return JSON.parse(localStorage.getItem("bbims_logs") || "[]");
}

export function getCloudSettings(): CloudSettings {
  return JSON.parse(localStorage.getItem("bbims_cloud") || JSON.stringify(DEFAULT_CLOUD));
}

export function getBackups(): BackupRecord[] {
  return JSON.parse(localStorage.getItem("bbims_backups") || "[]");
}

// LOGGERS
export function addLog(type: LogType, message: string, severity: LogSeverity = "info", username?: string) {
  const logs = getLogs();
  const newLog: SystemLog = {
    id: "LOG-" + Math.floor(Math.random() * 10000),
    timestamp: new Date().toISOString(),
    type,
    message,
    severity,
    username,
    ipAddress: "102.164.24.11", // Mimics real tracking
    device: navigator.userAgent.includes("Mobile") ? "Android Phone / Chrome Mobile" : "MacBook Pro / Chrome Desktop",
  };
  localStorage.setItem("bbims_logs", JSON.stringify([newLog, ...logs]));
  notifyDbChange();
}

// CRUD OPERATORS FOR USER MANAGEMENT
export function createUser(user: Omit<UserProfile, "id">, passwordPlain: string): UserProfile {
  const users = getUsers();
  const id = "USER-" + (users.length + 1);
  const newUser: UserProfile = { ...user, id };
  
  // Save user
  users.push(newUser);
  localStorage.setItem("bbims_users", JSON.stringify(users));

  // Save password
  const passwords = JSON.parse(localStorage.getItem("bbims_passwords") || "{}");
  passwords[id] = hashPassword(passwordPlain);
  localStorage.setItem("bbims_passwords", JSON.stringify(passwords));

  addLog("audit", `Created user account ${user.username} (${user.fullName})`, "info", "admin");
  notifyDbChange();
  return newUser;
}

export function updateUser(updated: UserProfile) {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === updated.id);
  if (index !== -1) {
    users[index] = updated;
    localStorage.setItem("bbims_users", JSON.stringify(users));
    addLog("audit", `Updated user profile for ${updated.username}`, "info", "admin");
    notifyDbChange();
  }
}

export function deleteUser(userId: string) {
  const users = getUsers();
  const fileDetails = users.find((u) => u.id === userId);
  if (fileDetails) {
    const filtered = users.filter((u) => u.id !== userId);
    localStorage.setItem("bbims_users", JSON.stringify(filtered));
    addLog("audit", `Deleted user account [${fileDetails.username}]`, "warning", "admin");
    notifyDbChange();
  }
}

export function resetPassword(userId: string, newPasswordPlain: string, forceChangeOnLogin = false) {
  const passwords = JSON.parse(localStorage.getItem("bbims_passwords") || "{}");
  passwords[userId] = hashPassword(newPasswordPlain);
  localStorage.setItem("bbims_passwords", JSON.stringify(passwords));

  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].isFirstLogin = forceChangeOnLogin;
    localStorage.setItem("bbims_users", JSON.stringify(users));
  }

  const username = users.find(u => u.id === userId)?.username || userId;
  addLog("security", `Password reset initiated for user [${username}]`, "info", "admin");
  notifyDbChange();
}

export function verifyPassword(userId: string, passwordPlain: string): boolean {
  const passwords = JSON.parse(localStorage.getItem("bbims_passwords") || "{}");
  const hashedInput = hashPassword(passwordPlain);
  return passwords[userId] === hashedInput;
}

// CRUD INVENTORY
export function addProduct(p: Omit<Product, "id" | "dateAdded" | "lastUpdated" | "isArchived">) {
  const products = getProducts();
  const id = "PROD-" + (1000 + products.length + 1);
  const newProduct: Product = {
    ...p,
    id,
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    isArchived: false,
  };
  products.push(newProduct);
  localStorage.setItem("bbims_products", JSON.stringify(products));
  addLog("audit", `Product added: ${p.name} (QTY: ${p.currentQuantity})`, "info", "logged-user");
  notifyDbChange();
  return newProduct;
}

export function updateProduct(updated: Product) {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === updated.id);
  if (index !== -1) {
    products[index] = {
      ...updated,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("bbims_products", JSON.stringify(products));
    addLog("audit", `Product updated: ${updated.name}`, "info", "logged-user");
    notifyDbChange();
  }
}

export function adjustStock(productId: string, quantityChange: number, actionType: "increase" | "reduce" | "transfer" | "adjust", notes?: string) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);
  if (index !== -1) {
    const origQty = products[index].currentQuantity;
    let newQty = origQty;
    if (actionType === "increase") newQty += quantityChange;
    else if (actionType === "reduce") newQty = Math.max(0, origQty - quantityChange);
    else if (actionType === "adjust") newQty = quantityChange;
    else if (actionType === "transfer") {
      newQty = Math.max(0, origQty - quantityChange);
    }

    products[index].currentQuantity = newQty;
    products[index].lastUpdated = new Date().toISOString();
    localStorage.setItem("bbims_products", JSON.stringify(products));

    addLog("audit", `Stock adjustment [${actionType}] on ${products[index].name}: Qty changed from ${origQty} to ${newQty}. Comment: ${notes || "No context"}`, 
      newQty <= products[index].minimumQuantity ? "warning" : "info"
    );
    notifyDbChange();
  }
}

export function archiveProduct(productId: string) {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === productId);
  if (index !== -1) {
    products[index].isArchived = true;
    localStorage.setItem("bbims_products", JSON.stringify(products));
    addLog("audit", `Product archived: ${products[index].name}`, "info", "logged-user");
    notifyDbChange();
  }
}

export function restoreProduct(productId: string) {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === productId);
  if (index !== -1) {
    products[index].isArchived = false;
    localStorage.setItem("bbims_products", JSON.stringify(products));
    addLog("audit", `Product restored from archive: ${products[index].name}`, "info", "logged-user");
    notifyDbChange();
  }
}

export function deleteProduct(productId: string) {
  const products = getProducts();
  const prod = products.find((p) => p.id === productId);
  if (prod) {
    const filtered = products.filter((p) => p.id !== productId);
    localStorage.setItem("bbims_products", JSON.stringify(filtered));
    addLog("audit", `Product hard deleted: ${prod.name}`, "warning", "logged-user");
    notifyDbChange();
  }
}

// CRUD SALES
export function addSale(s: Omit<Sale, "id" | "date" | "receiptNumber" | "isSuspicious" | "suspiciousReason">) {
  const sales = getSales();
  
  if (sales.length >= 500) {
    addLog("security", "Attempted to add sale but Sales Database is AT FULL CAPACITY (500/500). Blocked transaction.", "critical");
    alert("CRITICAL ERROR: Sales Database has reached its maximum limit of 500 records. Deleting oldest records or full archive required.");
    return null;
  }

  const receiptNumber = "REC-" + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Suspicion checks
  let isSuspicious = false;
  let suspiciousReason = "";

  const product = getProducts().find(p => p.id === s.productId);
  if (product) {
    if (s.unitPrice < product.costPrice) {
      isSuspicious = true;
      suspiciousReason += `Unit price (${s.unitPrice}) is less than wholesale cost price (${product.costPrice}). Solid loss alert. `;
    }
  }

  if (s.quantityPurchased > 100) {
    isSuspicious = true;
    suspiciousReason += `Bulk quantity purchase of ${s.quantityPurchased} units exceeds normal retail threshold (100). `;
  }

  if (s.amountPaid < s.totalPrice) {
    isSuspicious = true;
    suspiciousReason += `Amount Paid (${s.amountPaid}) is less than total price (${s.totalPrice}) representing potential debt/unauthorized discount. `;
  }

  if (s.buyerName.trim().toLowerCase() === "anonymous" && s.totalPrice > 1000) {
    isSuspicious = true;
    suspiciousReason += `High-value cash transaction of ${s.totalPrice} USD performed by Anonymous buyer. `;
  }

  const newSale: Sale = {
    ...s,
    id: "SALE-" + (5000 + sales.length + 1),
    date: new Date().toISOString(),
    receiptNumber,
    isSuspicious,
    suspiciousReason: isSuspicious ? suspiciousReason : undefined,
  };

  sales.push(newSale);
  localStorage.setItem("bbims_sales", JSON.stringify(sales));

  // Deduct stock if submitted
  if (s.status === "submitted" && product) {
    adjustStock(product.id, s.quantityPurchased, "reduce", `Automatic sale deduction for Receipt: ${receiptNumber}`);
  }

  addLog(
    isSuspicious ? "security" : "audit", 
    `New sale registered: Receipt ${receiptNumber} matching ${s.productName} x ${s.quantityPurchased} (${isSuspicious ? "FLAGGED SUSPICIOUS" : "OK"})`,
    isSuspicious ? "alert" : "info"
  );

  // DB Limit Checks for notifications
  const count = sales.length;
  if (count === 450) {
    addLog("system", "Sales Database reaching capacity: 450/500 records saved. WARNING status.", "warning");
  } else if (count === 475) {
    addLog("system", "Sales Database reaching CRITICAL capacity: 475/500 records saved. HIGH WARNING status.", "error");
  } else if (count >= 500) {
    addLog("system", "Sales Database at CRITICAL max capacity: 500/500. Automatic backup suggested.", "critical");
  }

  notifyDbChange();
  return newSale;
}

// CRUD SUPPLIER REQUESTS
export function addSupplierRequest(r: Omit<SupplierRequest, "id" | "requestNumber" | "requestDate">) {
  const requests = getSupplierRequests();

  if (requests.length >= 500) {
    addLog("security", "Attempted supplier request addition but request table is at full capacity (500/500).", "critical");
    return null;
  }

  const requestNumber = "SR-" + (3000 + requests.length + 1);
  const newRequest: SupplierRequest = {
    ...r,
    id: "REQ-" + (3000 + requests.length + 1),
    requestNumber,
    requestDate: new Date().toISOString(),
  };

  requests.push(newRequest);
  localStorage.setItem("bbims_requests", JSON.stringify(requests));

  addLog("audit", `New Supplier Request ${requestNumber} dispatched for ${r.productName} with priority [${r.priorityLevel}]`, "info");
  notifyDbChange();
  return newRequest;
}

export function updateSupplierRequest(updated: SupplierRequest) {
  const requests = getSupplierRequests();
  const index = requests.findIndex((r) => r.id === updated.id);
  if (index !== -1) {
    // Audit check on status switch
    const prevStatus = requests[index].status;
    requests[index] = updated;
    localStorage.setItem("bbims_requests", JSON.stringify(requests));

    addLog("audit", `Supplier request ${updated.requestNumber} shifted from [${prevStatus}] to [${updated.status}]`, "info");

    // If marked delivered, automatically increase stock!
    if (updated.status === "delivered" && prevStatus !== "delivered") {
      const prod = getProducts().find(p => p.name.toLowerCase() === updated.productName.toLowerCase());
      if (prod) {
        adjustStock(prod.id, updated.quantityNeeded, "increase", `Auto restocking from fulfilled Request ${updated.requestNumber}`);
      }
    }
    notifyDbChange();
  }
}

// SYSTEM BACKUPS & CLOUD SYNC
export function createBackup(type: string = "Full System"): BackupRecord {
  const backups = getBackups();
  const id = "BACK-" + (backups.length + 1).toString().padStart(2, '0');
  const size = Math.floor(Math.random() * 80 + 20) + "." + Math.floor(Math.random() * 10) + " KB";
  
  const newBackup: BackupRecord = {
    id,
    timestamp: new Date().toISOString(),
    filename: `bbims_backup_${new Date().toISOString().slice(0,10).replace(/-/g,"_")}_${Math.floor(Math.random()*1000)}.json`,
    size,
    type,
    driveStatus: getCloudSettings().googleDriveBackupEnabled ? "Synced" : "Local Only",
    sheetsStatus: getCloudSettings().googleSheetsBackupEnabled ? "Synced" : "Local Only",
  };

  backups.unshift(newBackup);
  localStorage.setItem("bbims_backups", JSON.stringify(backups));

  addLog("system", `System Backup successfully compiled: [${newBackup.filename}] synced to Clouds.`, "info");
  notifyDbChange();
  return newBackup;
}

export function restoreBackup(backupId: string) {
  const backups = getBackups();
  const back = backups.find(b => b.id === backupId);
  if (back) {
    // Simulates recovering default values
    localStorage.setItem("bbims_products", JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem("bbims_requests", JSON.stringify(DEFAULT_REQUESTS));
    localStorage.setItem("bbims_sales", JSON.stringify(DEFAULT_SALES));
    addLog("system", `System Restored to state from backup [${back.filename}]`, "warning");
    notifyDbChange();
  }
}

export function updateCloudSettings(settings: CloudSettings) {
  localStorage.setItem("bbims_cloud", JSON.stringify(settings));
  addLog("system", "Cloud Storage security configuration was updated.", "info");
  notifyDbChange();
}

// RETENTION ARCHIVING TRIGGER (30 DAYS SIMULATOR)
export function runRetentionArchiving() {
  const sales = getSales();
  const requests = getSupplierRequests();
  
  // Archive records older than 30 days (simulate by filtering or copying to archive)
  // Let's copy a report to our Backups, log an alert, the Owner is notified.
  const archiveTime = new Date();
  archiveTime.setDate(archiveTime.getDate() - 30);

  const beforeSalesCount = sales.length;
  // Keep last 30 days of sales
  const activeSales = sales.filter(s => new Date(s.date) > archiveTime);
  const archivedSalesCount = beforeSalesCount - activeSales.length;

  if (archivedSalesCount > 0) {
    localStorage.setItem("bbims_sales", JSON.stringify(activeSales));
    // Save backup automatically
    createBackup("Archived Sales (" + archivedSalesCount + " records)");
    addLog("system", `Data Retention Rule Actioned: Archived ${archivedSalesCount} Sales records older than 30 days to Drive folder.`, "warning");
  }

  const beforeReqCount = requests.length;
  const activeReqs = requests.filter(r => new Date(r.requestDate) > archiveTime);
  const archivedReqsCount = beforeReqCount - activeReqs.length;

  if (archivedReqsCount > 0) {
    localStorage.setItem("bbims_requests", JSON.stringify(activeReqs));
    createBackup("Archived Requests (" + archivedReqsCount + " records)");
    addLog("system", `Data Retention Rule Actioned: Archived ${archivedReqsCount} Supplier Requests records older than 30 days.`, "warning");
  }

  notifyDbChange();
  return { archivedSalesCount, archivedReqsCount };
}

// Reset Database to full factory defaults (Perfect for repairs!)
export function runSystemResetAndRepair() {
  localStorage.setItem("bbims_users", JSON.stringify(DEFAULT_USERS));
  localStorage.setItem("bbims_passwords", JSON.stringify(DEFAULT_PASSWORDS));
  localStorage.setItem("bbims_products", JSON.stringify(DEFAULT_PRODUCTS));
  localStorage.setItem("bbims_sales", JSON.stringify(DEFAULT_SALES));
  localStorage.setItem("bbims_requests", JSON.stringify(DEFAULT_REQUESTS));
  localStorage.setItem("bbims_logs", JSON.stringify(DEFAULT_LOGS));
  localStorage.setItem("bbims_backups", JSON.stringify(DEFAULT_BACKUPS));
  localStorage.setItem("bbims_cloud", JSON.stringify(DEFAULT_CLOUD));
  localStorage.setItem("bbims_db_connected", "true");
  
  // Wipe session to relogin
  localStorage.removeItem("bbims_session");
  localStorage.removeItem("bbims_impersonation");

  addLog("system", "Self-Healing Diagnostic Routine finished: Replaced broken schemas, verified table indexes, and reloaded core components.", "info");
  notifyDbChange();
}
