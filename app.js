const STORAGE_KEY = "curtain-house-pos-v1";
const DEVICE_ACTIVATION_KEY = "curtain-house-pos-device-activated";
const BACK_OFFICE_URL = "https://pos.curtainhousett.com/";
const EMPLOYEE_SYNC_ENDPOINT = "/.netlify/functions/employees-sync";
const STORE_SYNC_ENDPOINT = "/.netlify/functions/store-sync";
const PRODUCT_PHOTO_MAX_SIZE = 900;
const PRODUCT_PHOTO_QUALITY = 0.72;
const urlParams = new URLSearchParams(window.location.search);
const isPublicCatalogMode = (
  window.location.pathname.startsWith("/catalog")
  || urlParams.get("mode") === "catalog"
  || urlParams.get("catalog") === "public"
);
const isWebPosMode = !isPublicCatalogMode && (
  window.location.pathname.startsWith("/web-pos")
  || urlParams.get("mode") === "web-pos"
);
const isPosAppMode = false;
const isPosRuntime = isWebPosMode;
const isBackOfficeWebsite = !isPosRuntime && !isPublicCatalogMode;
const employeeSyncUrl = () => EMPLOYEE_SYNC_ENDPOINT;
const storeSyncUrl = () => STORE_SYNC_ENDPOINT;

if (isWebPosMode) document.body.classList.add("web-pos-mode");
if (isPublicCatalogMode) document.body.classList.add("public-catalog-mode");
if (isBackOfficeWebsite) document.body.classList.add("backoffice-mode");
if (isWebPosMode) document.title = "Curtain House Web POS";
if (isPublicCatalogMode) document.title = "Curtain House Online Catalog";

function openExternalUrl(url) {
  window.open(url, "_blank", "noopener");
}

function setAppHeight() {
  const height = window.visualViewport?.height || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", `${Math.round(height)}px`);
}

function keepFocusedFieldVisible(event) {
  if (!isPosAppMode) return;
  const field = event.target.closest?.("input, select, textarea");
  if (!field) return;
  setTimeout(() => field.scrollIntoView({ block: "center", behavior: "smooth" }), 260);
}

function closeFloatingMobileMenus(event) {
  if (!isPosRuntime) return;
  if (!event.target.closest("#mobileCatalogMenu, #mobileCatalogSelectBtn")) $("#mobileCatalogMenu")?.classList.add("hidden");
  if (isPosAppMode && !event.target.closest("#mobileMoreMenu, #mobileMoreBtn")) $("#mobileMoreMenu")?.classList.add("hidden");
  if (isPosAppMode && !event.target.closest("#mobileProductCategoryMenu, #pageTitle")) $("#mobileProductCategoryMenu")?.classList.add("hidden");
}

setAppHeight();
window.addEventListener("resize", setAppHeight);
window.addEventListener("orientationchange", () => setTimeout(setAppHeight, 250));
window.visualViewport?.addEventListener("resize", setAppHeight);
document.addEventListener("focusin", keepFocusedFieldVisible);
document.addEventListener("click", closeFloatingMobileMenus);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveState();
});
window.addEventListener("online", () => syncStoreNow({ silent: true }));

const defaultProducts = [
  { id: "p1", name: "#1 Aqua Green", sku: "FAB-001", barcode: "100000000001", category: "Fabric Colours", price: 30, cost: 12, stock: 40, reorderLevel: 5, color: "sage" },
  { id: "p2", name: "#1 Brown", sku: "FAB-002", barcode: "100000000002", category: "Fabric Colours", price: 30, cost: 12, stock: 38, reorderLevel: 5, color: "clay" },
  { id: "p3", name: "#1 Burnt Orange", sku: "FAB-003", barcode: "100000000003", category: "Fabric Colours", price: 30, cost: 12, stock: 24, reorderLevel: 5, color: "sand" },
  { id: "p4", name: "#1 Dark Blue", sku: "FAB-004", barcode: "100000000004", category: "Fabric Colours", price: 30, cost: 12, stock: 31, reorderLevel: 5, color: "ink" },
  { id: "p5", name: "#1 Dark Red", sku: "FAB-005", barcode: "100000000005", category: "Fabric Colours", price: 30, cost: 12, stock: 21, reorderLevel: 5, color: "clay" },
  { id: "p6", name: "#1 Gold", sku: "FAB-006", barcode: "100000000006", category: "Fabric Colours", price: 30, cost: 12, stock: 18, reorderLevel: 5, color: "sand" },
  { id: "p7", name: "#1 Grey Brown", sku: "FAB-007", barcode: "100000000007", category: "Fabric Colours", price: 30, cost: 12, stock: 16, reorderLevel: 5, color: "sage" },
  { id: "p8", name: "#1 Light Red", sku: "FAB-008", barcode: "100000000008", category: "Fabric Colours", price: 30, cost: 12, stock: 29, reorderLevel: 5, color: "lilac" },
  { id: "p9", name: "#1 Light Red Pink", sku: "FAB-009", barcode: "100000000009", category: "Fabric Colours", price: 30, cost: 12, stock: 25, reorderLevel: 5, color: "sky" },
  { id: "p10", name: "#1 Lilac", sku: "FAB-010", barcode: "100000000010", category: "Fabric Colours", price: 30, cost: 12, stock: 27, reorderLevel: 5, color: "lilac" },
  { id: "p11", name: "#1 Orange", sku: "FAB-011", barcode: "100000000011", category: "Fabric Colours", price: 30, cost: 12, stock: 32, reorderLevel: 5, color: "sand" },
  { id: "p12", name: "#1 Peach", sku: "FAB-012", barcode: "100000000012", category: "Fabric Colours", price: 30, cost: 12, stock: 20, reorderLevel: 5, color: "clay" },
  { id: "p13", name: "Bedsheet set (1000 TC)", sku: "BED-1000", barcode: "200000000001", category: "Bedsheet", price: 400, cost: 190, stock: 12, reorderLevel: 3, color: "sage" },
  { id: "p14", name: "Bedsheet set (Plain)", sku: "BED-PLAIN", barcode: "200000000002", category: "Bedsheet", price: 200, cost: 90, stock: 20, reorderLevel: 3, color: "sand" },
  { id: "p15", name: "Gold/Queen/Organic (1) Blue", sku: "BED-GQO1-BLU", barcode: "200000000003", category: "Bedsheet", price: 240, cost: 110, stock: 18, reorderLevel: 4, color: "sky" },
  { id: "p16", name: "Gold/Queen/Organic (1) Gold", sku: "BED-GQO1-GLD", barcode: "200000000004", category: "Bedsheet", price: 240, cost: 110, stock: 18, reorderLevel: 4, color: "sand" },
  { id: "p17", name: "Gold/Queen/Organic (1) Green", sku: "BED-GQO1-GRN", barcode: "200000000005", category: "Bedsheet", price: 240, cost: 110, stock: 18, reorderLevel: 4, color: "sage" },
  { id: "p18", name: "Gold/Queen/Organic (1) Red", sku: "BED-GQO1-RED", barcode: "200000000006", category: "Bedsheet", price: 240, cost: 110, stock: 18, reorderLevel: 4, color: "clay" },
  { id: "p19", name: "Gold/Queen/Organic (2) Blue", sku: "BED-GQO2-BLU", barcode: "200000000007", category: "Bedsheet", price: 240, cost: 110, stock: 18, reorderLevel: 4, color: "sky" },
  { id: "p20", name: "Gold/Queen/Organic (2) Gold", sku: "BED-GQO2-GLD", barcode: "200000000008", category: "Bedsheet", price: 240, cost: 110, stock: 18, reorderLevel: 4, color: "sand" },
  { id: "p21", name: "Rod Pocket (Mercury)", sku: "ROD-MERCURY", barcode: "300000000001", category: "Curtains", price: 70, cost: 35, stock: 16, reorderLevel: 3, color: "ink" },
  { id: "p22", name: "Rod Pocket(Mercury Light)", sku: "ROD-MERCURY-L", barcode: "300000000002", category: "Curtains", price: 60, cost: 30, stock: 16, reorderLevel: 3, color: "sky" },
];

const legacyDemoProductNames = new Set([
  "Linen Sheer Panel",
  "Blackout Curtain Pair",
  "Velvet Drapery Panel",
  "Roller Blind",
  "Day & Night Blind",
  "Wooden Venetian Blind",
  "Classic Curtain Rod",
  "Double Curtain Rod",
  "Crystal Tieback Pair",
  "Magnetic Tieback",
  "Measuring Service",
  "Standard Installation",
]);

const fabricOnlyDemoProductNames = new Set([
  "#1 Aqua Green",
  "#1 Brown",
  "#1 Burnt Orange",
  "#1 Dark Blue",
  "#1 Dark Red",
  "#1 Gold",
  "#1 Grey Brown",
  "#1 Light Red",
  "#1 Light Red Pink",
  "#1 Lilac",
  "#1 Orange",
  "#1 Peach",
]);

const defaultCategories = [
  "Fabric Colours",
  "Bedsheet",
  "Curtains",
  "Blinds",
  "Rods",
  "Accessories",
  "Services",
].map((name, index) => ({ id: `cat-${index + 1}`, name, description: "", status: "Active" }));

const defaultModifiers = [
  { id: "mod-hem", name: "Hem finish", description: "Standard hem, weighted hem, wave hem", amount: 0, status: "Active" },
  { id: "mod-lining", name: "Lining option", description: "Blackout lining or privacy lining", amount: 45, status: "Active" },
  { id: "mod-install", name: "Installation add-on", description: "Add installation service to an order", amount: 150, status: "Active" },
];

const defaultMobileDiscountPresets = [
  { id: "disc-15", name: "15%", type: "percent", value: 15 },
  { id: "disc-20", name: "20%", type: "percent", value: 20 },
  { id: "disc-20-cash", name: "Discount", type: "amount", value: 20 },
  { id: "disc-150-cash", name: "Discount", type: "amount", value: 150 },
  { id: "disc-40-cash", name: "Discount", type: "amount", value: 40 },
  { id: "disc-10-cash", name: "Discount", type: "amount", value: 10 },
  { id: "disc-normal-5", name: "Normal", type: "amount", value: 5 },
  { id: "disc-special-30", name: "Special", type: "amount", value: 30 },
  { id: "disc-special-100", name: "Special", type: "amount", value: 100 },
  { id: "disc-very-special-200", name: "very special", type: "amount", value: 200 },
];

const defaultCustomers = [
  { id: "c1", name: "Alicia James", contact: "868-555-0142", notes: "Prefers neutral linen", visits: 3, points: 84, totalSpent: 842, lastVisit: "28 May 2026" },
  { id: "c2", name: "Marcus Singh", contact: "marcus@example.com", notes: "Office installation", visits: 2, points: 61, totalSpent: 615, lastVisit: "16 May 2026" },
  { id: "c3", name: "Priya's Interiors", contact: "868-555-0188", notes: "Trade customer", visits: 5, points: 210, totalSpent: 2105, lastVisit: "8 Jun 2026" },
];

const defaultOnlineOrders = [
  {
    id: "online-order-362",
    number: "c-362",
    createdAt: "2025-05-17T10:02:00-04:00",
    status: "Confirmed",
    source: "Catalog",
    type: "Delivery",
    deliveryFee: 40,
    paymentMethod: "Cash",
    customer: { name: "Imran Mohammed", phone: "+1 868 728 3360", address: "1 red man lane Don Miguel road San Juan" },
    items: [{ id: "p13", name: "Blackout Curtain", quantity: 4, price: 100, cost: 34, category: "Curtains", photo: "" }],
    notes: "",
  },
  {
    id: "online-order-361",
    number: "c-361",
    createdAt: "2025-04-18T21:05:00-04:00",
    status: "Confirmed",
    source: "Catalog",
    type: "Pickup",
    deliveryFee: 0,
    paymentMethod: "Card",
    customer: { name: "Nicole James", phone: "+1 868 555 0186", address: "Chaguanas" },
    items: [{ id: "p14", name: "Bedsheet set (Plain)", quantity: 1, price: 180, cost: 90, category: "Bedsheet", photo: "" }],
  },
  {
    id: "online-order-360",
    number: "c-360",
    createdAt: "2024-12-27T19:48:00-04:00",
    status: "Pending",
    source: "Catalog",
    type: "Delivery",
    deliveryFee: 25,
    paymentMethod: "Cash",
    customer: { name: "Gailann Mangroo", phone: "+1 868 555 0148", address: "San Fernando" },
    items: [{ id: "p21", name: "Rod Pocket (Mercury)", quantity: 3, price: 80, cost: 35, category: "Curtains", photo: "" }],
  },
];

const defaultEmployees = [
  { id: "e1", name: "Administrator", username: "admin", email: "", phone: "", pin: "5000", role: "Administrator", access: "Full access", status: "Clocked in", sales: 0 },
  { id: "e2", name: "Store Manager", username: "manager", email: "", phone: "", pin: "2000", role: "Store Manager", access: "Full access", status: "Clocked out", sales: 0 },
  { id: "e3", name: "Sales Associate", username: "sales", email: "", phone: "", pin: "1000", role: "Sales Associate", access: "Sales POS only", status: "Clocked out", sales: 0 },
];

const defaultSettings = {
  storeName: "Curtain House",
  companyName: "Curtain House",
  address: "Trinidad & Tobago",
  phone: "868-555-0100",
  email: "sales@curtainhousett.com",
  taxNumber: "",
  logo: "",
  receiptHeader: "Elegant spaces, beautifully finished",
  receiptFooter: "We appreciate your business.",
  thankYouMessage: "Thank you for shopping with us.",
  returnPolicy: "Returns require the original receipt.",
  currency: "TTD - Trinidad & Tobago Dollar",
  taxRate: 12.5,
  taxInclusive: false,
  loyaltySpend: 10,
  lowStock: 5,
  autoPrint: false,
  paperSize: "80mm",
  storeLocation: "Main Store",
  posName: "POS 1",
  reportEmail: "fabindiatrinidad@gmail.com",
  autoEmailSixMonthReports: false,
  reportRetentionMonths: 6,
  nextReportEmailDate: "",
  printerName: "Receipt printer",
  printerConnection: "Browser print",
  cashDrawerEnabled: false,
  customerDisplayEnabled: false,
  customerDisplayMode: "Order preview",
  customerDisplayMessage: "Thank you for shopping with Curtain House.",
  catalogPublished: true,
  catalogMainColor: "#43a047",
  catalogVersion: "new",
  catalogDisplayMode: "grid",
  catalogBanner: "",
  catalogOutOfStock: "available",
  catalogAcceptOrders: true,
  catalogWhatsappOrders: true,
  catalogWhatsapp: "868-555-0100",
  catalogAboutStore: "Beautiful curtains, bedding, and home finishing from Curtain House.",
  catalogFacebook: "",
  catalogInstagram: "",
  catalogTikTok: "",
  catalogWebsite: "",
  catalogPostOrderMessage: "We will contact you shortly to confirm the details of your purchase. Thank you for choosing us!",
};

const loginAccounts = {
  admin: { username: "admin", password: "admin123", name: "Administrator", role: "Admin", email: "fabindiatrinidad@gmail.com" },
  manager: { username: "manager", password: "manager123", name: "Store Manager", role: "Manager", email: "manager@curtainhousett.com" },
  sales: { username: "sales", password: "sales123", name: "Sales Associate", role: "Sales Associate", email: "sales@curtainhousett.com" },
};

const posDeviceAccount = { username: "pos", password: "pos123" };
const defaultEmployeeSync = { updatedAt: "", lastPulledAt: "", lastPushedAt: "" };
const syncCollections = ["products", "transactions", "customers", "openTickets", "shiftHistory", "employees", "categories", "modifiers", "discountPresets", "onlineOrders"];
const deletedRecordCollections = [...syncCollections, "workflowRecords"];
const defaultDeletedRecords = () => Object.fromEntries(deletedRecordCollections.map((collection) => [collection, []]));
const defaultStoreSync = () => ({
  deviceId: `device-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  updatedAt: "",
  lastPulledAt: "",
  lastPushedAt: "",
  pending: false,
});

const workflowDefinitions = {
  "Categories": { description: "Organize items into searchable sales categories.", statuses: ["Active", "Inactive"], fields: [["name", "Category name", "text"], ["description", "Description", "text"], ["status", "Status", "select"]] },
  "Modifiers": { description: "Prepare optional item choices and price additions.", statuses: ["Active", "Inactive"], fields: [["name", "Modifier name", "text"], ["description", "Options / details", "text"], ["amount", "Price adjustment", "number"], ["status", "Status", "select"]] },
  "Discounts": { description: "Create and manage Back Office discount rules.", statuses: ["Active", "Inactive"], fields: [["name", "Discount name", "text"], ["amount", "Discount value", "number"], ["description", "Rule / notes", "text"], ["status", "Status", "select"]] },
  "Purchase Orders": { description: "Order stock from suppliers and track receiving.", statuses: ["Draft", "Ordered", "Part received", "Received", "Cancelled"], fields: [["reference", "PO number", "text"], ["name", "Supplier", "text"], ["description", "Items / notes", "text"], ["amount", "Order total", "number"], ["date", "Expected date", "date"], ["status", "Status", "select"]] },
  "Transfer Orders": { description: "Track stock movement between stores and locations.", statuses: ["Draft", "In transit", "Received", "Cancelled"], fields: [["reference", "Transfer number", "text"], ["name", "From / To", "text"], ["description", "Items / notes", "text"], ["date", "Transfer date", "date"], ["status", "Status", "select"]] },
  "Stock Adjustments": { description: "Record inventory corrections with an audit trail.", statuses: ["Pending", "Approved", "Completed"], fields: [["reference", "Adjustment number", "text"], ["name", "Item / category", "text"], ["description", "Reason", "text"], ["amount", "Quantity change", "number"], ["status", "Status", "select"]] },
  "Inventory Counts": { description: "Plan physical counts and reconcile stock.", statuses: ["Planned", "Counting", "Review", "Completed"], fields: [["reference", "Count number", "text"], ["name", "Location / category", "text"], ["date", "Count date", "date"], ["description", "Notes", "text"], ["status", "Status", "select"]] },
  "Productions": { description: "Track materials used to produce finished curtain products.", statuses: ["Planned", "In production", "Completed", "Cancelled"], fields: [["reference", "Production number", "text"], ["name", "Finished item", "text"], ["description", "Materials / notes", "text"], ["amount", "Quantity", "number"], ["date", "Due date", "date"], ["status", "Status", "select"]] },
  "Suppliers": { description: "Maintain supplier contacts and purchasing notes.", statuses: ["Active", "Inactive"], fields: [["name", "Supplier name", "text"], ["contact", "Phone / email", "text"], ["description", "Products / notes", "text"], ["status", "Status", "select"]] },
  "Inventory History": { description: "Review inventory changes and references.", statuses: ["Recorded"], readOnly: true, fields: [] },
  "Inventory Valuation": { description: "Review stock value using item cost and quantities.", statuses: ["Current"], readOnly: true, fields: [] },
  "Access Rights": { description: "Document employee access profiles and approvals.", statuses: ["Active", "Review", "Inactive"], fields: [["name", "Access profile", "text"], ["description", "Allowed modules / notes", "text"], ["status", "Status", "select"]] },
  "Time Cards": { description: "Track employee clock-in and clock-out records.", statuses: ["Open", "Approved"], fields: [["name", "Employee", "text"], ["date", "Work date", "date"], ["description", "Clock in / out and notes", "text"], ["amount", "Hours", "number"], ["status", "Status", "select"]] },
  "Hours Worked": { description: "Review recorded employee hours.", statuses: ["Recorded", "Approved"], fields: [["name", "Employee", "text"], ["date", "Period ending", "date"], ["amount", "Hours", "number"], ["description", "Notes", "text"], ["status", "Status", "select"]] },
  "Loyalty Points": { description: "Manage customer loyalty point adjustments.", statuses: ["Pending", "Applied"], fields: [["name", "Customer", "text"], ["amount", "Points adjustment", "number"], ["description", "Reason", "text"], ["status", "Status", "select"]] },
  "Customer History": { description: "Record customer contacts and service activity.", statuses: ["Open", "Completed"], fields: [["name", "Customer", "text"], ["date", "Activity date", "date"], ["description", "Activity / notes", "text"], ["status", "Status", "select"]] },
  "Stores": { description: "Maintain stores, stock locations, and contact details.", statuses: ["Active", "Inactive"], fields: [["name", "Store name", "text"], ["contact", "Address / phone", "text"], ["description", "Notes", "text"], ["status", "Status", "select"]] },
  "POS Devices": { description: "Register POS devices and their assigned stores.", statuses: ["Active", "Maintenance", "Inactive"], fields: [["name", "POS device name", "text"], ["reference", "Device ID", "text"], ["description", "Assigned store / notes", "text"], ["status", "Status", "select"]] },
  "Features": { description: "Track planned and enabled Back Office features.", statuses: ["Planned", "Enabled", "Disabled"], fields: [["name", "Feature name", "text"], ["description", "Purpose / notes", "text"], ["status", "Status", "select"]] },
  "Payment Types": { description: "Manage accepted payment methods.", statuses: ["Active", "Inactive"], fields: [["name", "Payment type", "text"], ["description", "Instructions / notes", "text"], ["status", "Status", "select"]] },
  "Loyalty": { description: "Prepare loyalty programmes and reward rules.", statuses: ["Draft", "Active", "Inactive"], fields: [["name", "Programme name", "text"], ["amount", "Spend per point", "number"], ["description", "Reward details", "text"], ["status", "Status", "select"]] },
  "Taxes": { description: "Prepare tax rates and applicability rules.", statuses: ["Active", "Inactive"], fields: [["name", "Tax name", "text"], ["amount", "Tax percent", "number"], ["description", "Applies to", "text"], ["status", "Status", "select"]] },
  "Receipt": { description: "Prepare receipt templates and messages.", statuses: ["Draft", "Active", "Archived"], fields: [["name", "Template name", "text"], ["description", "Header / footer / policy", "text"], ["status", "Status", "select"]] },
  "Open Tickets": { description: "Review saved POS tickets waiting for completion.", statuses: ["Open"], readOnly: true, fields: [] },
  "Curtain Measurement": { description: "Book site visits and capture window measurements.", statuses: ["Requested", "Scheduled", "Measured", "Quoted", "Completed"], fields: [["reference", "Measurement number", "text"], ["name", "Customer", "text"], ["contact", "Phone / address", "text"], ["date", "Visit date", "date"], ["description", "Room, width, drop, style and notes", "text"], ["status", "Status", "select"]] },
  "Customer Orders": { description: "Track made-to-measure orders from quote to completion.", statuses: ["Quote", "Awaiting deposit", "Confirmed", "In production", "Ready", "Completed", "Cancelled"], fields: [["reference", "Order number", "text"], ["name", "Customer", "text"], ["description", "Order details", "text"], ["amount", "Order total", "number"], ["date", "Required date", "date"], ["status", "Status", "select"]] },
  "Deposit Tracking": { description: "Record deposits received against customer orders.", statuses: ["Due", "Part paid", "Paid", "Refunded"], fields: [["reference", "Order / receipt number", "text"], ["name", "Customer", "text"], ["amount", "Deposit amount", "number"], ["date", "Payment date", "date"], ["description", "Payment method / notes", "text"], ["status", "Status", "select"]] },
  "Balance Tracking": { description: "Track outstanding customer order balances.", statuses: ["Outstanding", "Part paid", "Paid", "Overdue"], fields: [["reference", "Order number", "text"], ["name", "Customer", "text"], ["amount", "Balance due", "number"], ["date", "Due date", "date"], ["description", "Notes", "text"], ["status", "Status", "select"]] },
  "Delivery Tracking": { description: "Plan deliveries and record completion.", statuses: ["To schedule", "Scheduled", "Out for delivery", "Delivered", "Failed"], fields: [["reference", "Order number", "text"], ["name", "Customer", "text"], ["contact", "Delivery address / phone", "text"], ["date", "Delivery date", "date"], ["description", "Driver / notes", "text"], ["status", "Status", "select"]] },
  "Installation Scheduling": { description: "Schedule installers and track completed work.", statuses: ["To schedule", "Scheduled", "In progress", "Completed", "Follow-up"], fields: [["reference", "Order number", "text"], ["name", "Customer", "text"], ["contact", "Installation address", "text"], ["date", "Installation date", "date"], ["description", "Installer / scope / notes", "text"], ["status", "Status", "select"]] },
  "Barcode Printing": { description: "Prepare barcode label print jobs for inventory items.", statuses: ["Draft", "Ready", "Printed"], fields: [["reference", "Job number", "text"], ["name", "Item / category", "text"], ["amount", "Label quantity", "number"], ["description", "Label size / notes", "text"], ["status", "Status", "select"]] },
};

const defaultWorkflowRecords = {
  "Stores": [{ id: "wf-store-1", name: "Main Store", contact: "Trinidad & Tobago", description: "Primary sales and stock location", status: "Active", updatedAt: "Initial setup" }],
  "POS Devices": [{ id: "wf-pos-1", name: "POS 1", reference: "MAIN-POS-01", description: "Assigned to Main Store", status: "Active", updatedAt: "Initial setup" }],
  "Payment Types": ["Cash", "Card", "Bank Transfer", "Other"].map((name, index) => ({ id: `wf-pay-${index}`, name, description: "Accepted at Sales POS", status: "Active", updatedAt: "Initial setup" })),
  "Suppliers": [{ id: "wf-supplier-1", name: "Caribbean Fabric Supply", contact: "868-555-0120", description: "Curtain fabric, lining and accessories", status: "Active", updatedAt: "Initial setup" }],
  "Purchase Orders": [{ id: "wf-po-1", reference: "PO-0001", name: "Caribbean Fabric Supply", description: "Blackout lining and curtain hooks", amount: 2450, date: "2026-06-20", status: "Draft", updatedAt: "Initial setup" }],
  "Curtain Measurement": [{ id: "wf-measure-1", reference: "MEAS-0001", name: "Sample Customer", contact: "Port of Spain · 868-555-0199", date: "2026-06-18", description: "Living room: capture width, drop and track type", status: "Scheduled", updatedAt: "Initial setup" }],
  "Customer Orders": [{ id: "wf-order-1", reference: "ORD-0001", name: "Sample Customer", description: "Made-to-measure living room curtains", amount: 3200, date: "2026-07-10", status: "Awaiting deposit", updatedAt: "Initial setup" }],
  "Deposit Tracking": [{ id: "wf-deposit-1", reference: "ORD-0001", name: "Sample Customer", amount: 1000, date: "2026-06-14", description: "Cash deposit required to confirm order", status: "Due", updatedAt: "Initial setup" }],
  "Balance Tracking": [{ id: "wf-balance-1", reference: "ORD-0001", name: "Sample Customer", amount: 2200, date: "2026-07-10", description: "Balance due before delivery", status: "Outstanding", updatedAt: "Initial setup" }],
  "Delivery Tracking": [{ id: "wf-delivery-1", reference: "ORD-0001", name: "Sample Customer", contact: "Port of Spain · 868-555-0199", date: "2026-07-10", description: "Delivery window to be confirmed", status: "To schedule", updatedAt: "Initial setup" }],
  "Installation Scheduling": [{ id: "wf-install-1", reference: "ORD-0001", name: "Sample Customer", contact: "Port of Spain", date: "2026-07-11", description: "Install living room track and curtains", status: "To schedule", updatedAt: "Initial setup" }],
  "Barcode Printing": [{ id: "wf-barcode-1", reference: "CUR-101", name: "Linen Sheer Panel", amount: 12, description: "Standard shelf labels", status: "Ready", updatedAt: "Initial setup" }],
};

let currentUser = null;
let barcodeScanner = null;
let scannerStarting = false;
let lastScannedBarcode = "";
let lastScanTime = 0;
let barcodeScanMode = "sale";
let lastStorageWarningAt = 0;
let saleCompleting = false;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const money = (value) => `TT$${(Number(value) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
const selectedAttr = (value, expected) => String(value) === String(expected) ? "selected" : "";
const checkedAttr = (value) => value ? "checked" : "";
const todayKey = () => new Date().toLocaleDateString("en-CA");

function normalizeProduct(product) {
  const photo = product?.photo || product?.photoData || product?.image || product?.imageUrl || product?.photoUrl || product?.thumbnail || product?.picture || "";
  const catalogVisible = product?.catalogVisible !== false;
  return {
    barcode: "",
    cost: 0,
    tax: defaultSettings.taxRate,
    reorderLevel: defaultSettings.lowStock,
    photo,
    catalogVisible,
    stockHistory: [],
    ...product,
    photo,
    catalogVisible,
  };
}

function normalizeOnlineOrder(order = {}, index = 0) {
  const items = (Array.isArray(order.items) ? order.items : []).map((item) => ({
    id: item.id || crypto.randomUUID(),
    name: item.name || "Catalog item",
    sku: item.sku || "",
    category: item.category || "",
    quantity: Math.max(1, Number(item.quantity) || 1),
    price: Number(item.price) || 0,
    cost: Number(item.cost) || 0,
    photo: item.photo || "",
  }));
  const subtotal = Number(order.subtotal) || items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const deliveryFee = Number(order.deliveryFee) || 0;
  const createdAt = order.createdAt || nowIso();
  return {
    id: order.id || `online-order-${index + 1}-${crypto.randomUUID()}`,
    number: order.number || `c-${362 + index}`,
    createdAt,
    status: order.status || "Pending",
    source: order.source || "Catalog",
    type: order.type || (deliveryFee > 0 ? "Delivery" : "Pickup"),
    deliveryFee,
    paymentMethod: order.paymentMethod || "Cash",
    customer: {
      name: order.customer?.name || order.customerName || "Online customer",
      phone: order.customer?.phone || order.customerPhone || "",
      email: order.customer?.email || "",
      address: order.customer?.address || order.customerAddress || "",
    },
    items,
    notes: order.notes || "",
    subtotal,
    total: Number(order.total) || subtotal + deliveryFee,
    receiptNumber: order.receiptNumber || "",
    timeline: Array.isArray(order.timeline) && order.timeline.length ? order.timeline : [
      { status: order.status || "Pending", at: createdAt },
    ],
    syncUpdatedAt: order.syncUpdatedAt || createdAt,
  };
}

function normalizeCategory(category, index = 0) {
  return {
    id: category.id || `cat-${index + 1}-${crypto.randomUUID()}`,
    name: category.name || "New category",
    description: category.description || "",
    status: category.status || "Active",
  };
}

function normalizeModifier(modifier, index = 0) {
  return {
    id: modifier.id || `mod-${index + 1}-${crypto.randomUUID()}`,
    name: modifier.name || "New modifier",
    description: modifier.description || "",
    amount: Number(modifier.amount) || 0,
    status: modifier.status || "Active",
  };
}

function normalizeDiscountPreset(preset, index = 0) {
  return {
    id: preset.id || `disc-${index + 1}-${crypto.randomUUID()}`,
    name: preset.name || "Discount",
    type: preset.type === "amount" ? "amount" : "percent",
    value: Number(preset.value ?? preset.amount) || 0,
    description: preset.description || "",
    status: preset.status || "Active",
  };
}

function productCategoryRecords(products) {
  const names = [...new Set(products.map((product) => product.category).filter(Boolean))];
  return names.map((name, index) => ({ id: `cat-product-${index + 1}`, name, description: "", status: "Active" }));
}

function normalizeCategories(categories, products) {
  const records = [...(categories || []), ...productCategoryRecords(products)].map(normalizeCategory);
  const seen = new Set();
  return records.filter((category) => {
    const key = category.name.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isLegacyDemoCatalog(products) {
  return products.length === legacyDemoProductNames.size && products.every((product) => legacyDemoProductNames.has(product.name));
}

function isFabricOnlyDemoCatalog(products) {
  return products.length === fabricOnlyDemoProductNames.size && products.every((product) => fabricOnlyDemoProductNames.has(product.name));
}

function normalizeEmployee(employee, index = 0) {
  return {
    id: `employee-${index + 1}`,
    name: `Employee ${index + 1}`,
    username: `employee${index + 1}`,
    email: "",
    phone: "",
    pin: "",
    role: "Sales Associate",
    access: "Sales POS only",
    status: "Clocked out",
    sales: 0,
    ...employee,
    pin: String(employee?.pin || "").replace(/\D/g, "").slice(0, 4),
    sales: Number(employee?.sales) || 0,
  };
}

function normalizeEmployees(employees = []) {
  const normalized = (Array.isArray(employees) ? employees : []).map(normalizeEmployee);
  const defaultIds = new Set(defaultEmployees.map((employee) => employee.id));
  const defaultUsernames = new Set(defaultEmployees.map((employee) => employee.username));
  const usedIds = new Set();
  normalized.forEach((employee, index) => {
    if ((defaultIds.has(employee.id) && !defaultUsernames.has(employee.username)) || usedIds.has(employee.id)) {
      employee.id = `legacy-${employee.id}-${index + 1}`;
    }
    usedIds.add(employee.id);
  });
  normalized.forEach((employee) => {
    if (employee.id === "e1" && employee.pin === "1000") employee.pin = "5000";
    if (employee.id === "e3" && employee.pin === "3000") employee.pin = "1000";
  });
  defaultEmployees.forEach((defaultEmployee) => {
    if (!normalized.some((employee) => employee.username === defaultEmployee.username)) normalized.push({ ...defaultEmployee });
  });
  return normalized;
}

function normalizeDeletedRecords(records = {}) {
  const normalized = defaultDeletedRecords();
  deletedRecordCollections.forEach((collection) => {
    normalized[collection] = Array.isArray(records[collection])
      ? records[collection].filter((entry) => entry?.id).map((entry) => ({ id: entry.id, deletedAt: entry.deletedAt || new Date().toISOString() }))
      : [];
  });
  return normalized;
}

function normalizeSettings(settings = {}) {
  const normalized = { ...defaultSettings, ...settings };
  if (normalized.email === "sales@curtainhouse.example") normalized.email = defaultSettings.email;
  return normalized;
}

function employeeAppRole(employee) {
  if (employee.role === "Administrator") return "Admin";
  if (employee.role === "Store Manager") return "Manager";
  return "Sales Associate";
}

function employeeAccount(employee) {
  return { username: employee.id, name: employee.name, role: employeeAppRole(employee), employeeId: employee.id };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.products && saved?.transactions) {
      const savedProducts = saved.products.map(normalizeProduct);
      const refreshDemoCatalog = isLegacyDemoCatalog(savedProducts) || isFabricOnlyDemoCatalog(savedProducts);
      return {
        ...saved,
        products: refreshDemoCatalog ? structuredClone(defaultProducts).map(normalizeProduct) : savedProducts,
        cart: refreshDemoCatalog ? [] : saved.cart || [],
        discount: refreshDemoCatalog ? 0 : saved.discount || 0,
        fixedDiscount: refreshDemoCatalog ? 0 : saved.fixedDiscount || 0,
        customer: refreshDemoCatalog ? null : saved.customer || null,
        customers: saved.customers || structuredClone(defaultCustomers),
        onlineOrders: (saved.onlineOrders || structuredClone(defaultOnlineOrders)).map(normalizeOnlineOrder),
        openTickets: refreshDemoCatalog ? [] : saved.openTickets || [],
        currentShift: saved.currentShift ? { ...saved.currentShift, movements: saved.currentShift.movements || [] } : null,
        shiftHistory: saved.shiftHistory || [],
        employees: normalizeEmployees(saved.employees || structuredClone(defaultEmployees)),
        employeeSync: { ...defaultEmployeeSync, ...(saved.employeeSync || {}) },
        sync: { ...defaultStoreSync(), ...(saved.sync || saved.employeeSync || {}) },
        deletedRecords: normalizeDeletedRecords(saved.deletedRecords),
        settings: normalizeSettings(saved.settings),
        workflowRecords: { ...structuredClone(defaultWorkflowRecords), ...(saved.workflowRecords || {}) },
        favoriteProductIds: saved.favoriteProductIds || [],
        categories: refreshDemoCatalog ? structuredClone(defaultCategories) : normalizeCategories(saved.categories || structuredClone(defaultCategories), savedProducts),
        modifiers: (saved.modifiers || structuredClone(defaultModifiers)).map(normalizeModifier),
        discountPresets: (saved.discountPresets || structuredClone(defaultMobileDiscountPresets)).map(normalizeDiscountPreset),
      };
    }
  } catch (error) {
    console.warn("Could not load saved store data.", error);
  }
  return {
    products: structuredClone(defaultProducts).map(normalizeProduct),
    customers: structuredClone(defaultCustomers),
    onlineOrders: structuredClone(defaultOnlineOrders).map(normalizeOnlineOrder),
    transactions: [],
    openTickets: [],
    currentShift: null,
    shiftHistory: [],
    employees: normalizeEmployees(structuredClone(defaultEmployees)),
    employeeSync: { ...defaultEmployeeSync },
    sync: defaultStoreSync(),
    deletedRecords: defaultDeletedRecords(),
    settings: normalizeSettings(),
    workflowRecords: structuredClone(defaultWorkflowRecords),
    cart: [],
    discount: 0,
    fixedDiscount: 0,
    customer: null,
    favoriteProductIds: [],
    categories: structuredClone(defaultCategories),
    modifiers: structuredClone(defaultModifiers),
    discountPresets: structuredClone(defaultMobileDiscountPresets),
  };
}

const state = {
  ...loadState(),
  activeView: "sell",
  workspace: "pos",
  activeCategory: "All",
  search: "",
  productSearch: "",
  customerSearch: "",
  receiptSearch: "",
  selectedReceiptId: null,
  customerMode: "order",
  paymentMethod: "Card",
  catalogView: "icon",
  mobileCatalogMode: "all",
  mobileCatalogCategory: "",
  mobileSearchOpen: false,
  mobileInventoryMode: "items",
  mobileInventoryCategory: "All",
  mobileProductSearchOpen: false,
  mobileTicketMode: false,
  mobileEditingItemId: null,
  posSettingsPage: "menu",
  splitPayments: [],
  pendingRefundId: null,
  activeModule: "Customer Orders",
  activeReportNav: "Sales summary",
  expandedNavGroup: "",
  workflowSearch: "",
  publicCatalogSearch: "",
  publicCatalogCategory: "All",
  publicCatalogCart: [],
  orderSearch: "",
  orderStatusFilter: "All status",
  selectedOnlineOrderId: null,
  editingWorkflowId: null,
  editingEmployeeId: null,
  pinEntry: "",
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      products: state.products,
      transactions: state.transactions,
      customers: state.customers,
      onlineOrders: state.onlineOrders,
      openTickets: state.openTickets,
      currentShift: state.currentShift,
      shiftHistory: state.shiftHistory,
      employees: state.employees,
      employeeSync: state.employeeSync,
      sync: state.sync,
      deletedRecords: state.deletedRecords,
      settings: state.settings,
      cart: state.cart,
      discount: state.discount,
      fixedDiscount: state.fixedDiscount,
      customer: state.customer,
      workflowRecords: state.workflowRecords,
      favoriteProductIds: state.favoriteProductIds,
      categories: state.categories,
      modifiers: state.modifiers,
      discountPresets: state.discountPresets,
    }));
  } catch (error) {
    console.warn("Could not save POS data.", error);
    const now = Date.now();
    if (now - lastStorageWarningAt > 6000 && document.getElementById("toast")) {
      lastStorageWarningAt = now;
      showToast("Browser storage is full. Remove large photos or old demo data.");
    }
  }
}

let storeSyncTimer = null;
let applyingStoreSync = false;

function nowIso() {
  return new Date().toISOString();
}

function recordTimestamp(record = {}) {
  return Date.parse(record.syncUpdatedAt || record.updatedAt || record.createdAt || record.openedAt || record.closedAt || record.deletedAt || "") || 0;
}

function mergeSettingsByTimestamp(localSettings = {}, remoteSettings = {}) {
  if (!remoteSettings) return normalizeSettings(localSettings);
  if (!localSettings) return normalizeSettings(remoteSettings);
  return recordTimestamp(remoteSettings) >= recordTimestamp(localSettings)
    ? normalizeSettings({ ...localSettings, ...remoteSettings })
    : normalizeSettings(localSettings);
}

function touchRecord(record) {
  if (record && typeof record === "object") record.syncUpdatedAt = nowIso();
  return record;
}

function normalizeSyncRecord(collection, record, index = 0) {
  if (collection === "products") return normalizeProduct(record);
  if (collection === "employees") return normalizeEmployee(record, index);
  if (collection === "categories") return normalizeCategory(record, index);
  if (collection === "modifiers") return normalizeModifier(record, index);
  if (collection === "discountPresets") return normalizeDiscountPreset(record, index);
  if (collection === "onlineOrders") return normalizeOnlineOrder(record, index);
  return { ...record };
}

function prepareRecordForSync(record) {
  if (!record || typeof record !== "object") return record;
  return {
    ...record,
    syncUpdatedAt: record.syncUpdatedAt || record.createdAt || record.openedAt || nowIso(),
  };
}

function prepareWorkflowRecordsForSync(records = {}) {
  return Object.fromEntries(Object.entries(records).map(([name, entries]) => [
    name,
    (Array.isArray(entries) ? entries : []).map(prepareRecordForSync),
  ]));
}

function mergeRecordArrays(localRecords = [], remoteRecords = [], collection = "") {
  const merged = new Map();
  [...(Array.isArray(localRecords) ? localRecords : []), ...(Array.isArray(remoteRecords) ? remoteRecords : [])].forEach((record, index) => {
    if (!record?.id) return;
    const normalized = normalizeSyncRecord(collection, record, index);
    const existing = merged.get(normalized.id);
    if (!existing || recordTimestamp(normalized) >= recordTimestamp(existing)) merged.set(normalized.id, normalized);
  });
  return [...merged.values()];
}

function mergeDeletedRecords(localRecords = {}, remoteRecords = {}) {
  const merged = normalizeDeletedRecords(localRecords);
  const normalizedRemote = normalizeDeletedRecords(remoteRecords);
  deletedRecordCollections.forEach((collection) => {
    const byId = new Map(merged[collection].map((entry) => [entry.id, entry]));
    normalizedRemote[collection].forEach((entry) => {
      if (!entry?.id) return;
      const existing = byId.get(entry.id);
      if (!existing || Date.parse(entry.deletedAt || "") >= Date.parse(existing.deletedAt || "")) byId.set(entry.id, entry);
    });
    merged[collection] = [...byId.values()];
  });
  return merged;
}

function applyCollectionDeletes(collection, records) {
  const deleted = new Map((state.deletedRecords?.[collection] || []).map((entry) => [entry.id, Date.parse(entry.deletedAt || "") || 0]));
  return records.filter((record) => {
    const deletedAt = deleted.get(record.id);
    return !deletedAt || recordTimestamp(record) > deletedAt;
  });
}

function mergeWorkflowRecords(localRecords = {}, remoteRecords = {}) {
  const moduleNames = new Set([...Object.keys(localRecords || {}), ...Object.keys(remoteRecords || {})]);
  const merged = {};
  moduleNames.forEach((name) => {
    merged[name] = mergeRecordArrays(localRecords?.[name] || [], remoteRecords?.[name] || [], "workflowRecords");
  });
  return merged;
}

function applyWorkflowDeletes(records = {}) {
  const deleted = new Map((state.deletedRecords?.workflowRecords || []).map((entry) => [entry.id, Date.parse(entry.deletedAt || "") || 0]));
  return Object.fromEntries(Object.entries(records).map(([name, entries]) => [
    name,
    entries.filter((record) => {
      const deletedAt = deleted.get(record.id);
      return !deletedAt || recordTimestamp(record) > deletedAt;
    }),
  ]));
}

function rememberDeleted(collection, id) {
  if (!id) return;
  const deletedAt = nowIso();
  state.deletedRecords = normalizeDeletedRecords(state.deletedRecords);
  const list = state.deletedRecords[collection] || [];
  const existing = list.find((entry) => entry.id === id);
  if (existing) existing.deletedAt = deletedAt;
  else list.push({ id, deletedAt });
  state.deletedRecords[collection] = list;
}

function storeSyncDataSnapshot() {
  return {
    products: state.products.map(prepareRecordForSync),
    transactions: state.transactions.map(prepareRecordForSync),
    customers: state.customers.map(prepareRecordForSync),
    onlineOrders: state.onlineOrders.map(prepareRecordForSync),
    openTickets: state.openTickets.map(prepareRecordForSync),
    currentShift: state.currentShift ? prepareRecordForSync(state.currentShift) : null,
    shiftHistory: state.shiftHistory.map(prepareRecordForSync),
    employees: normalizeEmployees(state.employees).map(prepareRecordForSync),
    settings: { ...state.settings, syncUpdatedAt: state.settings.syncUpdatedAt || "" },
    workflowRecords: prepareWorkflowRecordsForSync(state.workflowRecords),
    favoriteProductIds: state.favoriteProductIds,
    categories: state.categories.map(prepareRecordForSync),
    modifiers: state.modifiers.map(prepareRecordForSync),
    discountPresets: state.discountPresets.map(prepareRecordForSync),
    deletedRecords: normalizeDeletedRecords(state.deletedRecords),
  };
}

function applySyncedStore(payload) {
  const data = payload?.data || {};
  if (!data || !Object.keys(data).length) return false;
  applyingStoreSync = true;
  state.deletedRecords = mergeDeletedRecords(state.deletedRecords, data.deletedRecords || {});
  syncCollections.forEach((collection) => {
    state[collection] = applyCollectionDeletes(collection, mergeRecordArrays(state[collection] || [], data[collection] || [], collection));
  });
  if (data.settings) state.settings = mergeSettingsByTimestamp(state.settings, data.settings);
  if (data.workflowRecords) state.workflowRecords = applyWorkflowDeletes(mergeWorkflowRecords(state.workflowRecords, data.workflowRecords));
  if (Object.prototype.hasOwnProperty.call(data, "currentShift")) state.currentShift = data.currentShift ? { ...data.currentShift, movements: data.currentShift.movements || [] } : null;
  if (Array.isArray(data.favoriteProductIds)) state.favoriteProductIds = [...new Set([...state.favoriteProductIds, ...data.favoriteProductIds])];
  state.employeeSync = {
    ...defaultEmployeeSync,
    updatedAt: payload.updatedAt || state.employeeSync?.updatedAt || "",
    lastPulledAt: nowIso(),
    lastPushedAt: state.employeeSync?.lastPushedAt || "",
  };
  state.sync = {
    ...defaultStoreSync(),
    ...state.sync,
    updatedAt: payload.updatedAt || state.sync?.updatedAt || "",
    lastPulledAt: nowIso(),
    pending: false,
  };
  saveState();
  applyingStoreSync = false;
  renderAll();
  return true;
}

function markStoreSyncDirty() {
  if (applyingStoreSync) return;
  state.sync = { ...defaultStoreSync(), ...state.sync, pending: true };
  saveState();
  if (navigator.onLine) scheduleStoreSync();
}

function scheduleStoreSync() {
  clearTimeout(storeSyncTimer);
  storeSyncTimer = setTimeout(() => syncStoreNow({ silent: true }), 1400);
}

async function pullStoreSync({ silent = false } = {}) {
  if (!navigator.onLine) {
    if (!silent) showToast("Offline: using saved store data");
    return false;
  }
  try {
    const response = await fetch(storeSyncUrl(), { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`Store sync failed: ${response.status}`);
    const data = await response.json();
    if (data.source === "default" && !data.updatedAt) return false;
    const applied = applySyncedStore(data);
    if (applied && !silent) showToast("Store data synced");
    return applied;
  } catch (error) {
    console.warn("Could not pull store sync.", error);
    if (!silent) showToast("Could not sync. Using offline store data.");
    return false;
  }
}

async function publishStoreSync({ silent = false, force = false } = {}) {
  if (!navigator.onLine) {
    state.sync = { ...defaultStoreSync(), ...state.sync, pending: true };
    saveState();
    if (!silent) showToast("Offline: changes will sync when internet returns.");
    return false;
  }
  if (!force && !state.sync?.pending) return pullStoreSync({ silent: true });
  try {
    const response = await fetch(storeSyncUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        version: 2,
        source: isPublicCatalogMode ? "catalog" : isWebPosMode ? "web-pos" : "backoffice",
        deviceId: state.sync?.deviceId || defaultStoreSync().deviceId,
        publishedBy: currentUser?.name || "Curtain House",
        data: storeSyncDataSnapshot(),
      }),
    });
    if (!response.ok) throw new Error(`Store publish failed: ${response.status}`);
    const data = await response.json();
    state.sync = { ...defaultStoreSync(), ...state.sync, updatedAt: data.updatedAt || nowIso(), lastPushedAt: nowIso(), pending: false };
    state.employeeSync = { ...defaultEmployeeSync, updatedAt: data.updatedAt || nowIso(), lastPushedAt: nowIso(), lastPulledAt: state.employeeSync?.lastPulledAt || "" };
    applySyncedStore(data);
    if (!silent) showToast("All store data synced");
    return true;
  } catch (error) {
    console.warn("Could not publish store sync.", error);
    state.sync = { ...defaultStoreSync(), ...state.sync, pending: true };
    saveState();
    if (!silent) showToast("Could not sync now. It will retry when online.");
    return false;
  }
}

function syncStoreNow({ silent = false } = {}) {
  return state.sync?.pending ? publishStoreSync({ silent }) : pullStoreSync({ silent });
}

function pullEmployeeSync(options) {
  return syncStoreNow(options);
}

function publishEmployeeSync(options) {
  return publishStoreSync({ ...options, force: true });
}

function totals() {
  const rawSubtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const percentDiscount = rawSubtotal * (state.discount / 100);
  const discountAmount = Math.min(rawSubtotal, percentDiscount + (Number(state.fixedDiscount) || 0));
  const subtotal = rawSubtotal - discountAmount;
  const tax = state.settings.taxInclusive ? subtotal - subtotal / (1 + state.settings.taxRate / 100) : subtotal * (state.settings.taxRate / 100);
  return { rawSubtotal, discountAmount, subtotal, tax, total: state.settings.taxInclusive ? subtotal : subtotal + tax };
}

function productInitial(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function hasManagementAccess() {
  return currentUser?.role === "Admin" || currentUser?.role === "Manager";
}

function backOfficeLoginMessage() {
  return "Back Office is only for Admin and Manager accounts. Sales Associates use the POS PIN screen.";
}

function isBackOfficeWorkspaceView(view) {
  if (isBackOfficeWebsite) return true;
  return ["dashboard", "reports", "customers", "employees", "workflow"].includes(view);
}

function applyRoleAccess() {
  const fullAccess = hasManagementAccess();
  $$("[data-management]").forEach((button) => {
    button.classList.toggle("locked", !fullAccess);
    button.setAttribute("aria-disabled", String(!fullAccess));
  });
  $$("[data-admin-only]").forEach((button) => {
    const locked = currentUser?.role !== "Admin";
    button.classList.toggle("locked", locked);
    button.setAttribute("aria-disabled", String(locked));
  });
  $("#resetBtn").classList.toggle("hidden", !fullAccess);
  $("#sessionName").textContent = isPosRuntime ? (currentUser?.role === "Admin" ? "Owner" : currentUser?.role || "") : currentUser?.name || "";
  $("#sessionRole").textContent = isPosRuntime ? `${currentUser?.name || ""}\n${state.settings.companyName || state.settings.storeName}` : currentUser?.role || "";
  $("#sessionAvatar").textContent = productInitial(currentUser?.name || "User");
  $("#workspaceLabel").textContent = isBackOfficeWebsite ? (currentUser?.email || "fabindiatrinidad@gmail.com") : (currentUser?.role || "Sales POS");
}

function loginUser(account, openShiftPrompt = true) {
  currentUser = account;
  sessionStorage.setItem("curtain-house-session", account.username);
  if (isBackOfficeWebsite && !hasManagementAccess()) {
    currentUser = null;
    sessionStorage.removeItem("curtain-house-session");
    showPasswordLogin(backOfficeLoginMessage());
    return;
  }
  $("#loginScreen").classList.add("hidden");
  $("#pinScreen").classList.add("hidden");
  $("#appShell").classList.remove("auth-hidden");
  applyRoleAccess();
  renderAll();
  if (isBackOfficeWebsite) {
    setView("dashboard");
    setTimeout(() => publishEmployeeSync({ silent: true }), 300);
    return;
  }
  if (state.currentShift) {
    setView("sell");
  } else {
    setView("shifts");
    showToast("Open a shift before starting sales");
    if (openShiftPrompt) setTimeout(() => openShiftForm("open"), 150);
  }
}

function showPasswordLogin(errorMessage = "") {
  currentUser = null;
  $("#sidebar").classList.remove("open");
  document.body.classList.remove("mobile-nav-open");
  $("#appShell").classList.add("auth-hidden");
  $("#pinScreen").classList.add("hidden");
  $("#loginScreen").classList.remove("hidden");
  $("#loginForm").reset();
  $("#loginError").textContent = errorMessage || "Incorrect username or password.";
  $("#loginError").classList.toggle("hidden", !errorMessage);
  setTimeout(() => $("#loginUsername").focus(), 50);
}

function configureLoginScreen() {
  $(".login-brand small").textContent = isPosRuntime ? (isWebPosMode ? "Web POS" : "Sales POS") : "Back Office";
  $("#loginEyebrow").textContent = isPosRuntime ? "First-time POS login" : "Welcome back";
  $("#loginTitle").textContent = isPosRuntime ? "Sign in to activate this POS" : "Sign in to Back Office";
  $("#loginDescription").textContent = isPosRuntime
    ? "Use the one POS account. Staff will enter their own PIN after activation."
    : "Use an Admin or Manager account. Sales is available in Web-POS.";
  $(".demo-accounts").innerHTML = isPosRuntime
    ? `<strong>Web-POS account</strong><span><b>POS:</b> ${posDeviceAccount.username} / ${posDeviceAccount.password}</span><span>Employee PINs sync from Back Office when online.</span>`
    : `<strong>Back Office accounts</strong><span><b>Admin:</b> admin / admin123</span><span><b>Manager:</b> manager / manager123</span><span>Sales Associates sign in on POS with PIN.</span>`;
}

function renderPinDots() {
  $$("#pinDots span").forEach((dot, index) => dot.classList.toggle("filled", index < state.pinEntry.length));
}

function showPinScreen() {
  currentUser = null;
  sessionStorage.removeItem("curtain-house-session");
  state.pinEntry = "";
  renderPinDots();
  $("#pinError").classList.add("hidden");
  $("#sidebar").classList.remove("open");
  document.body.classList.remove("mobile-nav-open");
  $("#appShell").classList.add("auth-hidden");
  $("#loginScreen").classList.add("hidden");
  $("#pinScreen").classList.remove("hidden");
}

async function submitPin() {
  let employee = state.employees.find((entry) => entry.pin === state.pinEntry && entry.status !== "Inactive");
  if (!employee && navigator.onLine) {
    await pullEmployeeSync({ silent: true });
    employee = state.employees.find((entry) => entry.pin === state.pinEntry && entry.status !== "Inactive");
  }
  if (!employee) {
    state.pinEntry = "";
    renderPinDots();
    $("#pinError").classList.remove("hidden");
    return;
  }
  $("#pinError").classList.add("hidden");
  loginUser(employeeAccount(employee));
}

function logoutUser() {
  currentUser = null;
  sessionStorage.removeItem("curtain-house-session");
  $$("dialog[open]").forEach(closeModal);
  if (isPosRuntime && localStorage.getItem(DEVICE_ACTIVATION_KEY)) showPinScreen();
  else showPasswordLogin();
}

function setDate() {
  $("#dateLabel").textContent = new Intl.DateTimeFormat("en-TT", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
}

function categoryNames() {
  const names = [
    ...state.categories.filter((category) => category.status !== "Inactive").map((category) => category.name),
    ...state.products.map((product) => product.category),
  ].filter(Boolean);
  return [...new Set(names)];
}

function activeDiscountPresets() {
  return state.discountPresets.filter((preset) => preset.status !== "Inactive");
}

function discountPresetValueLabel(preset) {
  return preset.type === "percent" ? `${preset.value}%` : money(preset.value);
}

function mobileInventoryTitle() {
  if (state.mobileInventoryMode === "categories") return "Categories";
  if (state.mobileInventoryMode === "modifiers") return "Modifiers";
  if (state.mobileInventoryMode === "discounts") return "Discounts";
  return state.mobileInventoryCategory === "All" ? "All items" : state.mobileInventoryCategory;
}

function renderCategories() {
  const categories = ["All", ...categoryNames()];
  $("#categoryTabs").innerHTML = categories.map((category) => `
    <button class="category-tab ${state.activeCategory === category ? "active" : ""}" data-category="${escapeHtml(category)}">
      ${escapeHtml(category)}
    </button>
  `).join("");
}

function mobileCatalogOptions() {
  const categories = categoryNames();
  return [
    { label: "All items", mode: "all", category: "" },
    { label: "Favorites", mode: "favorites", category: "" },
    { label: "Discounts", mode: "discounts", category: "" },
    ...categories.map((category) => ({ label: category, mode: "category", category })),
  ];
}

function mobileCatalogLabel() {
  if (state.mobileCatalogMode === "favorites") return "Favorites";
  if (state.mobileCatalogMode === "discounts") return "Discounts";
  if (state.mobileCatalogMode === "category") return state.mobileCatalogCategory || "All items";
  return "All items";
}

function updateMobileChrome() {
  if (!isPosAppMode) return;
  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const inTicketView = state.activeView === "sell" && state.mobileTicketMode && itemCount > 0;
  const inInventory = state.activeView === "products";
  $("#pageTitle").dataset.ticketCount = String(itemCount);
  document.body.classList.toggle("mobile-ticket-open", inTicketView);
  document.body.classList.toggle("mobile-search-open", state.activeView === "sell" && state.mobileSearchOpen);
  document.body.classList.toggle("mobile-inventory-open", inInventory);
  document.body.dataset.mobileInventoryMode = inInventory ? state.mobileInventoryMode : "";
  if (inInventory) {
    $("#pageTitle").textContent = mobileInventoryTitle();
    $("#menuBtn").textContent = "←";
    $("#menuBtn").setAttribute("aria-label", "Back to sales");
  } else {
    $("#menuBtn").textContent = inTicketView ? "←" : "☰";
    $("#menuBtn").setAttribute("aria-label", inTicketView ? "Back to items" : "Open menu");
  }
  if (state.activeView !== "sell") {
    $("#mobileMoreMenu")?.classList.add("hidden");
    $("#mobileCatalogMenu")?.classList.add("hidden");
  }
  if (!inInventory) {
    $("#mobileProductCategoryMenu")?.classList.add("hidden");
  }
}

function renderMobileCatalogMenu() {
  if (!isPosRuntime) return;
  $("#mobileCatalogMenu").innerHTML = mobileCatalogOptions().map((option) => {
    const active = option.mode === state.mobileCatalogMode && (option.mode !== "category" || option.category === state.mobileCatalogCategory);
    return `
      <button type="button" class="${active ? "active" : ""}" data-mobile-catalog-mode="${option.mode}" data-mobile-catalog-category="${escapeHtml(option.category)}">
        ${escapeHtml(option.label)}
      </button>
    `;
  }).join("");
}

function setMobileCatalogMode(mode, category = "") {
  state.mobileCatalogMode = mode;
  state.mobileCatalogCategory = category;
  if (mode === "category") state.activeCategory = category;
  if (mode === "all" || mode === "favorites" || mode === "discounts") state.activeCategory = "All";
  state.mobileTicketMode = false;
  state.mobileEditingItemId = null;
  $("#mobileCatalogMenu")?.classList.add("hidden");
  renderCategories();
  renderProducts();
  renderCart();
}

function mobileCatalogProducts(term) {
  const searchTerm = term.trim().toLowerCase();
  return state.products.filter((product) => {
    const mode = isPosRuntime ? state.mobileCatalogMode : "desktop";
    const inMode = mode === "favorites"
      ? state.favoriteProductIds.includes(product.id)
      : mode === "category"
        ? product.category === state.mobileCatalogCategory
        : state.activeCategory === "All" || product.category === state.activeCategory;
    const matches = !searchTerm || `${product.name} ${product.sku} ${product.barcode} ${product.category}`.toLowerCase().includes(searchTerm);
    return inMode && matches;
  });
}

function renderMobileDiscounts(term) {
  const searchTerm = term.trim().toLowerCase();
  const presets = activeDiscountPresets().filter((preset) => `${preset.name} ${preset.value} ${preset.description}`.toLowerCase().includes(searchTerm));
  $("#productGrid").className = "product-grid list-view mobile-discount-list";
  $("#productGrid").innerHTML = presets.map((preset) => `
    <button class="mobile-discount-row" type="button" data-discount-preset="${preset.id}">
      <span class="mobile-discount-icon">◇</span>
      <span>${escapeHtml(preset.name)}</span>
      <strong>${preset.type === "percent" ? `${preset.value}%` : money(preset.value)}</strong>
    </button>
  `).join("");
  $("#catalogEmpty").classList.toggle("hidden", presets.length > 0);
}

function renderMobileFavoritesEmpty() {
  $("#productGrid").className = "product-grid list-view";
  $("#productGrid").innerHTML = `
    <div class="mobile-favorites-empty">
      <p>Add your most used items to<br />Favorites for fast access.</p>
      <button type="button" data-mobile-edit-favorites>Edit Favorites</button>
    </div>
  `;
  $("#catalogEmpty").classList.add("hidden");
}

function renderProducts() {
  const term = state.search.trim().toLowerCase();
  if (isPosRuntime) {
    $("#mobileCatalogLabel").textContent = mobileCatalogLabel();
    $("#mobileSalesSearch").value = state.search;
    $("#mobileSearchRow").classList.toggle("hidden", !state.mobileSearchOpen);
    renderMobileCatalogMenu();
    if (isPosAppMode) updateMobileChrome();
    if (state.mobileCatalogMode === "discounts") {
      renderMobileDiscounts(term);
      return;
    }
    if (state.mobileCatalogMode === "favorites" && !state.favoriteProductIds.length) {
      renderMobileFavoritesEmpty();
      return;
    }
  }
  const products = mobileCatalogProducts(term);

  $("#productGrid").className = `product-grid ${state.catalogView}-view`;
  $("#productGrid").innerHTML = products.map((product) => {
    const low = product.stock <= product.reorderLevel;
    const out = product.stock <= 0;
    return `
      <button class="product-card ${out ? "out" : ""}" data-product-id="${product.id}">
        <div class="product-visual ${product.color}">
          ${product.photo ? `<img src="${product.photo}" alt="" />` : `<span class="product-initial">${productInitial(product.name)}</span>`}
          <span class="stock-pill ${low ? "low" : ""}">${out ? `${product.stock} · Out of stock` : product.stock > 100 ? "Available" : `${product.stock} in stock`}</span>
        </div>
        <div class="product-info">
          <h3>${escapeHtml(product.name)}</h3>
          <small>${escapeHtml(product.category)} · ${escapeHtml(product.sku)}</small>
          <strong>${money(product.price)}</strong>
        </div>
      </button>
    `;
  }).join("");
  $("#catalogEmpty").classList.toggle("hidden", products.length > 0);
}

function renderMobileTicket() {
  if (!isPosAppMode) return;
  const ticketView = $("#mobileTicketView");
  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (!itemCount) {
    state.mobileTicketMode = false;
    state.mobileEditingItemId = null;
  }
  ticketView.classList.toggle("hidden", !state.mobileTicketMode);
  if (!state.mobileTicketMode) {
    ticketView.innerHTML = "";
    updateMobileChrome();
    return;
  }

  const editingItem = state.cart.find((item) => item.id === state.mobileEditingItemId);
  if (editingItem) {
    ticketView.innerHTML = `
      <div class="mobile-quantity-editor">
        <div class="mobile-editor-bar">
          <button type="button" data-mobile-qty-action="cancel">×</button>
          <h2>${escapeHtml(editingItem.name)}</h2>
          <button type="button" data-mobile-qty-action="save">Save</button>
        </div>
        <label>Quantity</label>
        <div class="mobile-quantity-control">
          <button type="button" data-mobile-qty-action="minus" data-item-id="${editingItem.id}">−</button>
          <strong>${editingItem.quantity}</strong>
          <button type="button" data-mobile-qty-action="plus" data-item-id="${editingItem.id}">＋</button>
        </div>
      </div>
    `;
    updateMobileChrome();
    return;
  }

  const summary = totals();
  const discountLine = summary.discountAmount > 0
    ? `<div class="mobile-ticket-row muted"><span>Discount</span><strong>−${money(summary.discountAmount)}</strong></div>`
    : "";
  ticketView.innerHTML = `
    <div class="mobile-ticket-scroll">
      ${state.customer ? `<div class="mobile-ticket-customer"><span>Customer</span><strong>${escapeHtml(state.customer.name)}</strong><small>${escapeHtml(state.customer.contact || "")}</small></div>` : ""}
      ${state.cart.map((item) => `
        <button class="mobile-ticket-line" type="button" data-mobile-edit-line="${item.id}">
          <span>${escapeHtml(item.name)} <small>x ${item.quantity}</small></span>
          <strong>${money(item.price * item.quantity)}</strong>
        </button>
      `).join("")}
      <div class="mobile-ticket-divider"></div>
      ${discountLine}
      <div class="mobile-ticket-row muted"><span>VAT (${state.settings.taxRate}%)</span><strong>${money(summary.tax)}</strong></div>
      <div class="mobile-ticket-row total"><span>Total</span><strong>${money(summary.total)}</strong></div>
    </div>
    <div class="mobile-ticket-bottom">
      <button type="button" data-mobile-save-ticket>Save</button>
      <button type="button" data-mobile-charge>Charge<br /><strong>${money(summary.total)}</strong></button>
    </div>
  `;
  updateMobileChrome();
}

function mobileInventoryCategories() {
  return ["All", ...categoryNames()];
}

function mobileInventoryMenuOptions() {
  return [
    { label: "All items", mode: "items", category: "All" },
    { label: "Categories", mode: "categories", category: "" },
    { label: "Modifiers", mode: "modifiers", category: "" },
    { label: "Discounts", mode: "discounts", category: "" },
    ...categoryNames().map((category) => ({ label: category, mode: "items", category })),
  ];
}

function mobileInventoryProducts() {
  const term = state.productSearch.trim().toLowerCase();
  return state.products.filter((product) => {
    const inCategory = state.mobileInventoryCategory === "All" || product.category === state.mobileInventoryCategory;
    const matches = !term || `${product.name} ${product.sku} ${product.barcode} ${product.category}`.toLowerCase().includes(term);
    return inCategory && matches;
  });
}

function renderMobileInventoryRecords() {
  const term = state.productSearch.trim().toLowerCase();
  if (state.mobileInventoryMode === "categories") {
    const categories = state.categories.filter((category) => `${category.name} ${category.description} ${category.status}`.toLowerCase().includes(term));
    return categories.map((category) => {
      const itemCount = state.products.filter((product) => product.category === category.name).length;
      return `
        <button class="mobile-inventory-record" type="button" data-mobile-edit-category="${category.id}">
          <span class="mobile-record-icon">▦</span>
          <span class="mobile-record-copy"><strong>${escapeHtml(category.name)}</strong><small>${itemCount} item${itemCount === 1 ? "" : "s"} · ${escapeHtml(category.status)}</small></span>
          <span class="mobile-record-chevron">›</span>
        </button>
      `;
    }).join("") || `<div class="mobile-inventory-empty">No categories found.</div>`;
  }

  if (state.mobileInventoryMode === "modifiers") {
    const modifiers = state.modifiers.filter((modifier) => `${modifier.name} ${modifier.description} ${modifier.amount} ${modifier.status}`.toLowerCase().includes(term));
    return modifiers.map((modifier) => `
      <button class="mobile-inventory-record" type="button" data-mobile-edit-modifier="${modifier.id}">
        <span class="mobile-record-icon">☷</span>
        <span class="mobile-record-copy"><strong>${escapeHtml(modifier.name)}</strong><small>${escapeHtml(modifier.description || "No options set")} · ${escapeHtml(modifier.status)}</small></span>
        <span class="mobile-record-value">${money(modifier.amount)}</span>
      </button>
    `).join("") || `<div class="mobile-inventory-empty">No modifiers found.</div>`;
  }

  const discounts = state.discountPresets.filter((preset) => `${preset.name} ${preset.value} ${preset.description} ${preset.status}`.toLowerCase().includes(term));
  return discounts.map((preset) => `
    <button class="mobile-inventory-record" type="button" data-mobile-edit-discount="${preset.id}">
      <span class="mobile-record-icon">◇</span>
      <span class="mobile-record-copy"><strong>${escapeHtml(preset.name)}</strong><small>${preset.type === "percent" ? "Percent discount" : "Amount discount"} · ${escapeHtml(preset.status)}</small></span>
      <span class="mobile-record-value">${discountPresetValueLabel(preset)}</span>
    </button>
  `).join("") || `<div class="mobile-inventory-empty">No discounts found.</div>`;
}

function renderMobileInventory() {
  if (!isPosAppMode) return;
  updateMobileChrome();
  $("#mobileProductSearchRow").classList.toggle("hidden", !state.mobileProductSearchOpen);
  $("#mobileProductSearchInput").value = state.productSearch;
  $("#mobileProductSearchInput").placeholder = state.mobileInventoryMode === "items" ? "Search" : `Search ${mobileRecordLabel(state.mobileInventoryMode)}s`;
  $("#mobileAddItemBtn").setAttribute("aria-label", state.mobileInventoryMode === "items" ? "Add item" : `Add ${mobileRecordLabel(state.mobileInventoryMode)}`);
  $("#mobileProductCategoryMenu").innerHTML = mobileInventoryMenuOptions().map((option) => {
    const active = state.mobileInventoryMode === option.mode && (option.mode !== "items" || state.mobileInventoryCategory === option.category);
    return `
    <button type="button" class="${active ? "active" : ""}" data-mobile-product-mode="${escapeHtml(option.mode)}" data-mobile-product-category="${escapeHtml(option.category)}">
      ${escapeHtml(option.label)}
    </button>
  `;
  }).join("");

  if (state.mobileInventoryMode !== "items") {
    $("#mobileProductList").innerHTML = renderMobileInventoryRecords();
    return;
  }

  const products = mobileInventoryProducts();
  $("#mobileProductList").innerHTML = products.map((product) => {
    const low = product.stock <= product.reorderLevel;
    const danger = product.stock <= 0;
    const stockText = low ? `<small class="${danger ? "danger" : "low"}">${product.stock} in stock</small>` : "";
    return `
      <button class="mobile-inventory-item" type="button" data-mobile-edit-product="${product.id}">
        <span class="mobile-inventory-photo product-visual ${product.color}">
          ${product.photo ? `<img src="${product.photo}" alt="" />` : `<span class="product-initial">${productInitial(product.name)}</span>`}
          ${low ? `<i>!</i>` : ""}
        </span>
        <span class="mobile-inventory-copy"><strong>${escapeHtml(product.name)}</strong>${stockText}</span>
        <span class="mobile-inventory-price">${money(product.price)}</span>
      </button>
    `;
  }).join("") || `<div class="mobile-inventory-empty">No items found.</div>`;
}

function renderCart() {
  const summary = totals();
  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  $("#cartItems").innerHTML = state.cart.map((item) => `
    <div class="cart-item">
      <div class="cart-item-visual product-visual ${item.color}">${productInitial(item.name)}</div>
      <div>
        <h4>${escapeHtml(item.name)}</h4>
        <small>${money(item.price)} each</small>
      </div>
      <div class="cart-line-price">
        <strong>${money(item.price * item.quantity)}</strong>
        <div class="qty-control">
          <button data-cart-action="minus" data-item-id="${item.id}" aria-label="Remove one">−</button>
          <span>${item.quantity}</span>
          <button data-cart-action="plus" data-item-id="${item.id}" aria-label="Add one">＋</button>
          <button class="remove-line" data-cart-action="remove" data-item-id="${item.id}" aria-label="Remove item">×</button>
        </div>
      </div>
    </div>
  `).join("");
  $("#cartEmpty").classList.toggle("hidden", state.cart.length > 0);
  $("#cartItems").classList.toggle("hidden", state.cart.length === 0);
  $("#subtotal").textContent = money(summary.rawSubtotal);
  $("#tax").textContent = money(summary.tax);
  $("#taxLabel").textContent = `VAT (${state.settings.taxRate}%)`;
  $("#total").textContent = money(summary.total);
  $("#chargeTotal").textContent = money(summary.total);
  $("#checkoutBtn").disabled = itemCount === 0;
  $("#saveTicketBtn").disabled = itemCount === 0;
  $("#ticketCount").textContent = state.openTickets.length;
  $("#discountDisplay").textContent = summary.discountAmount ? `−${money(summary.discountAmount)}` : "";
  $("#customerName").textContent = state.customer?.name || "Add customer";
  $("#customerDetail").textContent = state.customer?.contact || "Optional";
  $("#saleNumber").textContent = `#${1001 + state.transactions.length}`;
  renderMobileTicket();
  updateMobileChrome();
  saveState();
}

function renderInventory() {
  const term = state.productSearch.trim().toLowerCase();
  const filtered = state.products.filter((product) => `${product.name} ${product.sku} ${product.barcode} ${product.category}`.toLowerCase().includes(term));
  renderMobileInventory();
  $("#productTableBody").innerHTML = filtered.map((product) => {
    const stockState = product.stock <= 0 ? "out" : product.stock <= product.reorderLevel ? "low" : "";
    return `
      <tr>
        <td><div class="table-product"><span class="table-swatch product-visual ${product.color}">${product.photo ? `<img src="${product.photo}" alt="" />` : productInitial(product.name)}</span><div><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.barcode || "No barcode")}</small></div></div></td>
        <td>${escapeHtml(product.sku)}</td>
        <td><span class="category-badge">${escapeHtml(product.category)}</span></td>
        <td>${money(product.cost)}</td>
        <td><strong>${money(product.price)}</strong></td>
        <td>${product.tax}%</td>
        <td><span class="stock-badge ${stockState}">${product.stock > 100 ? "Service" : `${product.stock} units`}</span><small class="cell-note">Reorder at ${product.reorderLevel}</small></td>
        <td><label class="switch table-switch" title="Show in Online Catalog"><input type="checkbox" data-toggle-catalog-product="${product.id}" ${checkedAttr(product.catalogVisible !== false)} /><span></span></label></td>
        <td><div class="row-actions"><button data-adjust-product="${product.id}">Adjust</button><button data-edit-product="${product.id}">Edit</button><button class="delete" data-delete-product="${product.id}">Delete</button></div></td>
      </tr>
    `;
  }).join("") || `<tr><td colspan="9"><div class="empty-list">No inventory items found.</div></td></tr>`;

  $("#productCount").textContent = state.products.length;
  $("#productLowStock").textContent = state.products.filter((product) => product.stock <= product.reorderLevel && product.stock < 100).length;
  $("#inventoryValue").textContent = money(state.products.filter((product) => product.stock < 100).reduce((sum, product) => sum + product.cost * product.stock, 0));
}

function renderStats() {
  const todayTransactions = state.transactions.filter((transaction) => transaction.dateKey === todayKey() && isActiveSale(transaction));
  const todayRevenue = todayTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const lowStock = state.products.filter((product) => product.stock <= product.reorderLevel && product.stock < 100).length;
  $("#todaySales").textContent = money(todayRevenue);
  $("#todayTransactions").textContent = todayTransactions.length;
  $("#lowStockCount").textContent = lowStock;
}

function transactionPayments(transaction) {
  const fallback = [{ type: transaction.paymentMethod || "Other", amount: transaction.total }];
  return (transaction.payments?.length ? transaction.payments : fallback).map((payment) => ({
    type: payment.type === "Transfer" ? "Bank Transfer" : payment.type || "Other",
    amount: Number(payment.amount) || 0,
  }));
}

function isActiveSale(transaction) {
  return Boolean(transaction) && !transaction.refunded && !transaction.cancelled;
}

function transactionDate(transaction) {
  if (transaction?.createdAt) return new Date(transaction.createdAt);
  if (transaction?.dateKey) return new Date(`${transaction.dateKey}T00:00:00`);
  return null;
}

function reportRetentionMonths() {
  return Math.max(1, Number(state.settings?.reportRetentionMonths) || 6);
}

function reportWindowStartDate() {
  const start = new Date();
  start.setMonth(start.getMonth() - reportRetentionMonths());
  start.setHours(0, 0, 0, 0);
  return start;
}

function isInReportWindow(transaction) {
  const date = transactionDate(transaction);
  return !date || date >= reportWindowStartDate();
}

function reportWindowLabel() {
  return `Last ${reportRetentionMonths()} months`;
}

function defaultNextReportEmailDate() {
  const date = new Date();
  date.setMonth(date.getMonth() + 6);
  return date.toISOString().slice(0, 10);
}

function reportTransactions({ includeRefunded = false, includeCancelled = false } = {}) {
  return state.transactions.filter((transaction) => {
    if (!isInReportWindow(transaction)) return false;
    if (!includeRefunded && transaction.refunded) return false;
    if (!includeCancelled && transaction.cancelled) return false;
    return true;
  });
}

function summarizePayments(transactions) {
  const totals = { Cash: 0, Card: 0, "Bank Transfer": 0, Other: 0 };
  transactions.filter(isActiveSale).forEach((transaction) => transactionPayments(transaction).forEach((payment) => {
    totals[payment.type] = (totals[payment.type] || 0) + payment.amount;
  }));
  return totals;
}

function emailSixMonthReport() {
  const to = state.settings.reportEmail || state.settings.email;
  if (!to) return showToast("Add a report email address in Settings first");
  const transactions = reportTransactions({ includeRefunded: true, includeCancelled: true });
  const activeTransactions = transactions.filter(isActiveSale);
  const payments = summarizePayments(transactions);
  const grossSales = activeTransactions.reduce((sum, transaction) => sum + (Number(transaction.total) || 0), 0);
  const refundTotal = transactions.filter((transaction) => transaction.refunded).reduce((sum, transaction) => sum + (Number(transaction.total) || 0), 0);
  const cancelTotal = transactions.filter((transaction) => transaction.cancelled).reduce((sum, transaction) => sum + (Number(transaction.total) || 0), 0);
  const itemGroups = new Map();
  activeTransactions.forEach((transaction) => transaction.items.forEach((item) => {
    addReportGroup(itemGroups, item.id || item.name, { name: item.name, qty: 0, sales: 0 }, (group) => {
      group.qty += Number(item.quantity) || 0;
      group.sales += (Number(item.price) || 0) * (Number(item.quantity) || 0);
    });
  }));
  const topItems = [...itemGroups.values()].sort((a, b) => b.sales - a.sales).slice(0, 8);
  const lines = [
    `${state.settings.companyName || state.settings.storeName} six-month sales report`,
    `Period: ${reportWindowStartDate().toISOString().slice(0, 10)} to ${new Date().toISOString().slice(0, 10)}`,
    "",
    `Receipts: ${activeTransactions.length}`,
    `Net sales: ${money(grossSales)}`,
    `Refunds: ${money(refundTotal)}`,
    `Cancelled receipts: ${money(cancelTotal)}`,
    "",
    "Payment totals:",
    `Card: ${money(payments.Card)}`,
    `Cash: ${money(payments.Cash)}`,
    `Bank Transfer: ${money(payments["Bank Transfer"])}`,
    `Other: ${money(payments.Other)}`,
    "",
    "Top items:",
    ...(topItems.length ? topItems.map((item) => `${item.name}: ${item.qty} sold · ${money(item.sales)}`) : ["No item sales recorded."]),
    "",
    "Generated from Curtain House Back Office.",
  ];
  window.location.href = `mailto:${to.replace(/\s/g, "")}?subject=${encodeURIComponent("Curtain House six-month sales report")}&body=${encodeURIComponent(lines.join("\n"))}`;
  showToast("Six-month report email prepared");
}

function transactionCost(transaction) {
  return transaction.items.reduce((sum, item) => {
    const product = state.products.find((entry) => entry.id === item.id);
    return sum + (Number(item.cost ?? product?.cost) || 0) * item.quantity;
  }, 0);
}

function lineMetrics(transaction, item) {
  const gross = (Number(item.price) || 0) * (Number(item.quantity) || 0);
  const discount = transaction.rawSubtotal ? gross / transaction.rawSubtotal * (Number(transaction.discountAmount) || 0) : 0;
  const tax = transaction.subtotal ? Math.max(0, gross - discount) / transaction.subtotal * (Number(transaction.tax) || 0) : 0;
  const product = state.products.find((entry) => entry.id === item.id);
  const cost = (Number(item.cost ?? product?.cost) || 0) * (Number(item.quantity) || 0);
  return { gross, discount, net: gross - discount, tax, cost, profit: gross - discount - cost };
}

function addReportGroup(groups, key, seed, updater) {
  if (!groups.has(key)) groups.set(key, { ...seed });
  updater(groups.get(key));
}

function renderReportTable(columns, rows, emptyMessage) {
  $("#reportTableHead").innerHTML = `<tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr>`;
  $("#reportTableBody").innerHTML = rows.length
    ? rows.map((row) => {
      const cells = Array.isArray(row) ? row : row.cells;
      const attrs = Array.isArray(row) ? "" : ` ${row.attrs || ""}`;
      return `<tr${attrs}>${cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`;
    }).join("")
    : `<tr><td colspan="${columns.length}"><div class="empty-list">${escapeHtml(emptyMessage)}</div></td></tr>`;
}

function renderReports() {
  const reportName = state.activeReportNav === "Sales summary" ? "Sales by item" : state.activeReportNav;
  const allReportTransactions = reportTransactions({ includeRefunded: true, includeCancelled: true });
  const validTransactions = allReportTransactions.filter(isActiveSale);
  const refundedTransactions = allReportTransactions.filter((transaction) => transaction.refunded);
  const cancelledTransactions = allReportTransactions.filter((transaction) => transaction.cancelled);
  const todayTransactions = validTransactions.filter((transaction) => transaction.dateKey === todayKey());
  const revenue = validTransactions.reduce((sum, transaction) => sum + (Number(transaction.total) || 0), 0);
  const todayRevenue = todayTransactions.reduce((sum, transaction) => sum + (Number(transaction.total) || 0), 0);
  const refundTotal = refundedTransactions.reduce((sum, transaction) => sum + (Number(transaction.total) || 0), 0);
  const average = validTransactions.length ? revenue / validTransactions.length : 0;
  const categoryUnits = {};
  const categoryRevenue = {};
  const setMetric = (index, label, value, note, icon) => {
    const ids = [
      ["#reportMetricOneLabel", "#reportTodayRevenue", "#reportTodayCount", "#reportMetricOneIcon"],
      ["#reportMetricTwoLabel", "#averageSale", "#reportMetricTwoNote", "#reportMetricTwoIcon"],
      ["#reportMetricThreeLabel", "#topCategory", "#reportMetricThreeNote", "#reportMetricThreeIcon"],
    ][index];
    $(ids[0]).textContent = label;
    $(ids[1]).textContent = value;
    $(ids[2]).textContent = note;
    $(ids[3]).textContent = icon;
  };
  const setReportHeader = ({ eyebrow = "Report", title, subtitle, totalLabel = "Total sales", totalValue = money(revenue), tableTitle = "Report details", tableEyebrow = "Details" }) => {
    $("#reportEyebrow").textContent = eyebrow;
    $("#reportDetailTitle").textContent = title;
    $("#reportDetailSubtitle").textContent = subtitle;
    $("#reportDetailTotalLabel").textContent = totalLabel;
    $("#allTimeRevenue").textContent = totalValue;
    $("#reportTableEyebrow").textContent = tableEyebrow;
    $("#reportTableTitle").textContent = tableTitle;
  };

  validTransactions.forEach((transaction) => transaction.items.forEach((item) => {
    categoryUnits[item.category] = (categoryUnits[item.category] || 0) + item.quantity;
    categoryRevenue[item.category] = (categoryRevenue[item.category] || 0) + item.price * item.quantity;
  }));

  const topCategory = Object.entries(categoryUnits).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  setMetric(0, "Today's revenue", money(todayRevenue), `${todayTransactions.length} transaction${todayTransactions.length === 1 ? "" : "s"}`, "↗");
  setMetric(1, "Average sale", money(average), reportWindowLabel(), "◈");
  setMetric(2, "Top category", topCategory, "By units sold", "☆");

  if (reportName === "Sales by item") {
    const groups = new Map();
    validTransactions.forEach((transaction) => transaction.items.forEach((item) => {
      const metrics = lineMetrics(transaction, item);
      addReportGroup(groups, item.id || item.sku || item.name, {
        item: item.name,
        sku: item.sku || "—",
        category: item.category || "Uncategorized",
        quantity: 0,
        gross: 0,
        net: 0,
        profit: 0,
        stock: state.products.find((entry) => entry.id === item.id)?.stock ?? "—",
      }, (group) => {
        group.quantity += Number(item.quantity) || 0;
        group.gross += metrics.gross;
        group.net += metrics.net;
        group.profit += metrics.profit;
      });
    }));
    const rows = [...groups.values()].sort((a, b) => b.net - a.net).map((group) => [group.item, group.sku, group.category, String(group.quantity), money(group.net), money(group.profit), String(group.stock)]);
    setReportHeader({ title: "Sales by item", subtitle: `Every item sold from Web-POS, ranked by net sales. ${reportWindowLabel()} shown.`, tableTitle: "Item sales detail" });
    setMetric(2, "Items sold", String(rows.length), "Unique items with sales", "▦");
    renderReportTable(["Item", "SKU", "Category", "Qty sold", "Net sales", "Gross profit", "Current stock"], rows, "No item sales yet.");
  }

  if (reportName === "Sales by category") {
    const groups = new Map();
    validTransactions.forEach((transaction) => transaction.items.forEach((item) => {
      const metrics = lineMetrics(transaction, item);
      addReportGroup(groups, item.category || "Uncategorized", { category: item.category || "Uncategorized", items: new Set(), quantity: 0, net: 0, gross: 0 }, (group) => {
        group.items.add(item.name);
        group.quantity += Number(item.quantity) || 0;
        group.net += metrics.net;
        group.gross += metrics.gross;
      });
    }));
    const rows = [...groups.values()].sort((a, b) => b.net - a.net).map((group) => [group.category, String(group.items.size), String(group.quantity), money(group.gross), money(group.net), `${revenue ? (group.net / revenue * 100).toFixed(1) : "0.0"}%`]);
    setReportHeader({ title: "Sales by category", subtitle: `Category performance based on sold item lines. ${reportWindowLabel()} shown.`, tableTitle: "Category sales detail" });
    setMetric(2, "Categories sold", String(rows.length), "Categories with sales", "▥");
    renderReportTable(["Category", "Items", "Qty sold", "Gross sales", "Net sales", "Share"], rows, "No category sales yet.");
  }

  if (reportName === "Sales by employee") {
    const groups = new Map(state.employees.map((employee) => [employee.name, { employee: employee.name, role: employee.role, receipts: 0, units: 0, net: 0, average: 0 }]));
    validTransactions.forEach((transaction) => {
      const employee = transaction.cashier || "Unknown";
      addReportGroup(groups, employee, { employee, role: state.employees.find((entry) => entry.name === employee)?.role || "POS user", receipts: 0, units: 0, net: 0, average: 0 }, (group) => {
        group.receipts += 1;
        group.units += transaction.items.reduce((sum, item) => sum + item.quantity, 0);
        group.net += Number(transaction.total) || 0;
      });
    });
    const rows = [...groups.values()].map((group) => ({ ...group, average: group.receipts ? group.net / group.receipts : 0 })).sort((a, b) => b.net - a.net).map((group) => [group.employee, group.role, String(group.receipts), String(group.units), money(group.net), money(group.average)]);
    setReportHeader({ title: "Sales by employee", subtitle: `Cashier performance from completed POS receipts. ${reportWindowLabel()} shown.`, tableTitle: "Employee sales detail" });
    setMetric(2, "Employees", String(rows.length), "All synced employees", "▣");
    renderReportTable(["Employee", "Role", "Receipts", "Units sold", "Net sales", "Average sale"], rows, "No employee sales yet.");
  }

  if (reportName === "Sales by payment type") {
    const paymentOrder = ["Card", "Cash", "Bank Transfer", "Other"];
    const groups = new Map(paymentOrder.map((type) => [type, { type, payments: 0, amount: 0 }]));
    validTransactions.forEach((transaction) => transactionPayments(transaction).forEach((payment) => {
      addReportGroup(groups, payment.type, { type: payment.type, payments: 0, amount: 0 }, (group) => {
        group.payments += 1;
        group.amount += payment.amount;
      });
    }));
    const orderedGroups = [
      ...paymentOrder.map((type) => groups.get(type)),
      ...[...groups.values()].filter((group) => !paymentOrder.includes(group.type)).sort((a, b) => b.amount - a.amount),
    ];
    const rows = orderedGroups.map((group) => [group.type, String(group.payments), money(group.amount), money(group.payments ? group.amount / group.payments : 0), `${revenue ? (group.amount / revenue * 100).toFixed(1) : "0.0"}%`]);
    const cardTotal = groups.get("Card")?.amount || 0;
    const cashTotal = groups.get("Cash")?.amount || 0;
    const otherTotal = orderedGroups.filter((group) => !["Card", "Cash"].includes(group.type)).reduce((sum, group) => sum + group.amount, 0);
    setReportHeader({ title: "Sales by payment type", subtitle: `Total card payments, total cash payments, bank transfer, other, and split payment totals. ${reportWindowLabel()} shown.`, tableTitle: "Payment type detail" });
    setMetric(0, "Card payments", money(cardTotal), `${groups.get("Card")?.payments || 0} payment${groups.get("Card")?.payments === 1 ? "" : "s"}`, "▤");
    setMetric(1, "Cash payments", money(cashTotal), `${groups.get("Cash")?.payments || 0} payment${groups.get("Cash")?.payments === 1 ? "" : "s"}`, "$");
    setMetric(2, "Other payments", money(otherTotal), "Bank transfer + Other", "◈");
    renderReportTable(["Payment type", "Payments", "Collected", "Average payment", "Share"], rows, "No payments recorded yet.");
  }

  if (reportName === "Receipts") {
    const rows = [...allReportTransactions].reverse().map((transaction) => ({
      attrs: `class="report-clickable-row ${transaction.refunded || transaction.cancelled ? "refunded" : ""}" data-receipt-id="${escapeHtml(transaction.id)}"`,
      cells: [`#${transaction.number}`, transaction.dateLabel, transaction.customer?.name || "Walk-in customer", transaction.cashier || "—", transaction.paymentMethod, transaction.cancelled ? "Cancelled" : transaction.refunded ? "Refunded" : "Completed", money(transaction.total)],
    }));
    setReportHeader({ title: "Receipts", subtitle: `Receipt list with customer, cashier, payment, refund/cancel status, and total. ${reportWindowLabel()} shown.`, tableTitle: "Receipt detail", totalLabel: "Net sales", totalValue: money(revenue) });
    setMetric(0, "Receipts", String(allReportTransactions.length), `${refundedTransactions.length} refunded · ${cancelledTransactions.length} cancelled`, "▤");
    setMetric(1, "Refunds", money(refundTotal), "Refunded receipt total", "↩");
    setMetric(2, "Average receipt", money(average), "Completed receipts", "◈");
    renderReportTable(["Receipt", "Date / time", "Customer", "Cashier", "Payment", "Status", "Total"], rows, "No receipts yet.");
  }

  if (reportName === "Sales by modifier") {
    const rows = state.modifiers.map((modifier) => [modifier.name, modifier.description || "No options set", modifier.status, money(modifier.amount), "0", money(0)]);
    setReportHeader({ title: "Sales by modifier", subtitle: "Configured modifiers are shown here; sales totals will fill in when modifier selection is added to tickets.", tableTitle: "Modifier sales detail", totalValue: money(0) });
    setMetric(0, "Active modifiers", String(state.modifiers.filter((modifier) => modifier.status !== "Inactive").length), "Ready on POS", "◇");
    setMetric(1, "Modifier sales", money(0), "No modifier sales stored yet", "◈");
    setMetric(2, "Configured", String(state.modifiers.length), "Synced modifiers", "▦");
    renderReportTable(["Modifier", "Options / details", "Status", "Price adjustment", "Times used", "Sales"], rows, "No modifiers configured yet.");
  }

  if (reportName === "Discounts") {
    const groups = new Map();
    validTransactions.filter((transaction) => Number(transaction.discountAmount) > 0).forEach((transaction) => {
      const label = transaction.discount ? `${transaction.discount}% discount` : transaction.fixedDiscount ? `${money(transaction.fixedDiscount)} discount` : "Discount";
      addReportGroup(groups, label, { name: label, type: transaction.discount ? "Percent" : "Amount", receipts: 0, discount: 0, sales: 0, status: "Used" }, (group) => {
        group.receipts += 1;
        group.discount += Number(transaction.discountAmount) || 0;
        group.sales += Number(transaction.total) || 0;
      });
    });
    const presetRows = state.discountPresets.map((preset) => [preset.name, preset.type === "percent" ? `${preset.value}% preset` : `${money(preset.value)} preset`, "0", money(0), money(0), preset.status || "Active"]);
    const rows = [...groups.values()].sort((a, b) => b.discount - a.discount).map((group) => [group.name, group.type, String(group.receipts), money(group.discount), money(group.sales), group.status]);
    const totalDiscount = validTransactions.reduce((sum, transaction) => sum + (Number(transaction.discountAmount) || 0), 0);
    setReportHeader({ title: "Discounts", subtitle: `Discounts applied on completed POS receipts, plus configured presets. ${reportWindowLabel()} shown.`, tableTitle: "Discount detail", totalLabel: "Total discounts", totalValue: money(totalDiscount) });
    setMetric(0, "Discounted receipts", String([...groups.values()].reduce((sum, group) => sum + group.receipts, 0)), "Completed sales only", "%");
    setMetric(1, "Discount total", money(totalDiscount), "Across completed receipts", "−");
    setMetric(2, "Presets", String(state.discountPresets.length), "Available on Web-POS", "◇");
    renderReportTable(["Discount", "Type", "Receipts", "Discount total", "Sales after discount", "Status"], [...rows, ...presetRows], "No discounts configured yet.");
  }

  if (reportName === "Taxes") {
    const groups = new Map();
    validTransactions.forEach((transaction) => {
      const rate = `${transaction.taxRate ?? state.settings.taxRate}%`;
      addReportGroup(groups, rate, { rate, receipts: 0, taxable: 0, tax: 0 }, (group) => {
        group.receipts += 1;
        group.taxable += Number(transaction.subtotal ?? transaction.total) || 0;
        group.tax += Number(transaction.tax) || 0;
      });
    });
    const rows = [...groups.values()].sort((a, b) => b.tax - a.tax).map((group) => [group.rate, String(group.receipts), money(group.taxable), money(group.tax), money(group.receipts ? group.tax / group.receipts : 0)]);
    const totalTax = validTransactions.reduce((sum, transaction) => sum + (Number(transaction.tax) || 0), 0);
    setReportHeader({ title: "Taxes", subtitle: `Taxable sales and VAT collected from completed POS receipts. ${reportWindowLabel()} shown.`, tableTitle: "Tax detail", totalLabel: "Tax collected", totalValue: money(totalTax) });
    setMetric(0, "Taxable sales", money(validTransactions.reduce((sum, transaction) => sum + (Number(transaction.subtotal ?? transaction.total) || 0), 0)), "Before tax", "▥");
    setMetric(1, "Tax collected", money(totalTax), "Completed receipts", "%");
    setMetric(2, "Tax rates", String(rows.length), "Used in receipts", "▦");
    renderReportTable(["Tax rate", "Receipts", "Taxable sales", "Tax collected", "Average tax"], rows, "No tax records yet.");
  }

  if (reportName === "Shifts") {
    const currentShiftRows = state.currentShift ? [{
      number: state.currentShift.number,
      id: "current",
      employee: state.currentShift.employee,
      opened: state.currentShift.openedLabel,
      closed: "Open",
      transactions: shiftTransactions().length,
      openingCash: state.currentShift.openingCash,
      countedCash: expectedCash(),
      difference: 0,
      status: "Open",
    }] : [];
    const closedRows = [...state.shiftHistory].reverse().map((shift) => ({
      id: shift.id,
      number: shift.number || "Closed shift",
      employee: shift.employee || "—",
      opened: shift.openedLabel || "—",
      closed: shift.closedLabel || "—",
      transactions: shift.transactions || 0,
      openingCash: shift.openingCash || 0,
      countedCash: shift.actualCash || 0,
      difference: shift.difference || 0,
      status: "Closed",
    }));
    const rows = [...currentShiftRows, ...closedRows].map((shift) => ({
      attrs: `class="report-clickable-row" data-shift-report-id="${escapeHtml(shift.id || "")}"`,
      cells: [shift.number, shift.employee, shift.opened, shift.closed, String(shift.transactions), money(shift.openingCash), money(shift.countedCash), shift.status === "Open" ? "—" : money(shift.difference), shift.status],
    }));
    setReportHeader({ title: "Shifts", subtitle: "Open and closed shift activity from Web-POS.", tableTitle: "Shift detail", totalLabel: "Closed shifts", totalValue: String(state.shiftHistory.length) });
    setMetric(0, "Open shift", state.currentShift ? state.currentShift.number : "None", state.currentShift ? state.currentShift.employee : "No active register", "◷");
    setMetric(1, "Shift sales", money(shiftTransactions().filter(isActiveSale).reduce((sum, transaction) => sum + transaction.total, 0)), "Current shift", "↗");
    setMetric(2, "Closed shifts", String(state.shiftHistory.length), "History records", "✓");
    renderReportTable(["Shift", "Employee", "Opened", "Closed", "Transactions", "Starting cash", "Counted cash", "Difference", "Status"], rows, "No shifts recorded yet.");
  }

  $("#transactionList").innerHTML = [...state.transactions].reverse().slice(0, 20).map((transaction) => `
    <button class="transaction-item ${transaction.refunded || transaction.cancelled ? "refunded" : ""}" data-receipt-id="${transaction.id}">
      <span class="transaction-mark">${transaction.cancelled ? "×" : transaction.refunded ? "↩" : "✓"}</span>
      <span><strong>Sale #${transaction.number} · ${escapeHtml(transaction.paymentMethod)}</strong><small>${escapeHtml(transaction.dateLabel)} · ${transaction.items.reduce((sum, item) => sum + item.quantity, 0)} items${transaction.customer ? ` · ${escapeHtml(transaction.customer.name)}` : ""}</small></span>
      <span class="transaction-amount"><strong>${transaction.refunded || transaction.cancelled ? "−" : ""}${money(transaction.total)}</strong><small>${transaction.cancelled ? "Cancelled" : transaction.refunded ? "Refunded" : "View receipt"}</small></span>
    </button>
  `).join("") || `<div class="empty-list">Completed sales will appear here.</div>`;

  const maxCategoryRevenue = Math.max(...Object.values(categoryRevenue), 1);
  $("#categoryReport").innerHTML = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1]).map(([category, amount]) => `
    <div class="category-line">
      <div class="category-line-head"><span>${escapeHtml(category)}</span><strong>${money(amount)}</strong></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(amount / maxCategoryRevenue) * 100}%"></div></div>
    </div>
  `).join("") || `<div class="empty-list">No category sales yet.</div>`;
}

function renderCustomers() {
  const term = state.customerSearch.trim().toLowerCase();
  const customers = state.customers.filter((customer) => `${customer.name} ${customer.contact} ${customer.notes}`.toLowerCase().includes(term));
  $("#customerTableBody").innerHTML = customers.map((customer) => `
    <tr>
      <td><div class="table-product"><span class="table-swatch product-visual sage">${productInitial(customer.name)}</span><div><strong>${escapeHtml(customer.name)}</strong><small>${escapeHtml(customer.notes || "No notes")}</small></div></div></td>
      <td>${escapeHtml(customer.contact || "—")}</td>
      <td>${customer.visits || 0}</td>
      <td><span class="category-badge">★ ${customer.points || 0}</span></td>
      <td><strong>${money(customer.totalSpent || 0)}</strong></td>
      <td>${escapeHtml(customer.lastVisit || "—")}</td>
    </tr>
  `).join("") || `<tr><td colspan="6"><div class="empty-list">No customers found.</div></td></tr>`;
  $("#customerCount").textContent = state.customers.length;
  $("#loyaltyPointsTotal").textContent = state.customers.reduce((sum, customer) => sum + (customer.points || 0), 0);
  $("#customerSpendTotal").textContent = money(state.customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0));
  $("#existingCustomerSelect").innerHTML = `<option value="">Create new customer</option>${state.customers.map((customer) => `<option value="${customer.id}">${escapeHtml(customer.name)} · ${escapeHtml(customer.contact || "No contact")}</option>`).join("")}`;
}

function receiptMarkup(transaction) {
  const items = transaction.items.map((item) => `
    <div class="receipt-row"><span>${item.quantity} × ${escapeHtml(item.name)}</span><span>${money(item.price * item.quantity)}</span></div>
  `).join("");
  return `
    <div class="receipt-brand">${state.settings.logo ? `<img src="${state.settings.logo}" alt="Curtain House logo" />` : ""}<h3>${escapeHtml(state.settings.companyName || state.settings.storeName)}</h3><p>${escapeHtml(state.settings.receiptHeader)}</p><p>${escapeHtml(state.settings.address)}</p><p>${escapeHtml(state.settings.phone)}</p></div>
    ${transaction.cancelled ? `<div class="refund-badge cancel-badge">CANCELLED · ${escapeHtml(transaction.cancelDate || "")}</div>` : transaction.refunded ? `<div class="refund-badge">REFUNDED · ${escapeHtml(transaction.refundDate || "")}</div>` : ""}
    <div class="receipt-meta"><span>Receipt</span><span>#${transaction.number}</span></div>
    <div class="receipt-meta"><span>Date</span><span>${escapeHtml(transaction.dateLabel)}</span></div>
    <div class="receipt-meta"><span>Cashier</span><span>${escapeHtml(transaction.cashier || "—")}</span></div>
    <div class="receipt-meta"><span>POS</span><span>${escapeHtml(transaction.pos || state.settings.posName)}</span></div>
    ${transaction.customer ? `<div class="receipt-meta"><span>Customer</span><span>${escapeHtml(transaction.customer.name)}</span></div>` : ""}
    <div class="receipt-rule"></div>
    ${items}
    <div class="receipt-rule"></div>
    <div class="receipt-row"><span>Subtotal</span><span>${money(transaction.rawSubtotal)}</span></div>
    ${transaction.discountAmount ? `<div class="receipt-row"><span>Discount${transaction.discount ? ` (${transaction.discount}%)` : ""}</span><span>−${money(transaction.discountAmount)}</span></div>` : ""}
    <div class="receipt-row"><span>VAT (${transaction.taxRate ?? state.settings.taxRate}%)</span><span>${money(transaction.tax)}</span></div>
    <div class="receipt-rule"></div>
    <div class="receipt-row receipt-total"><span>TOTAL</span><span>${money(transaction.total)}</span></div>
    <div class="receipt-rule"></div>
    ${(transaction.payments || [{ type: transaction.paymentMethod, amount: transaction.total }]).map((payment) => `<div class="receipt-row"><span>${escapeHtml(payment.type)}</span><span>${money(payment.amount)}</span></div>`).join("")}
    ${transaction.paymentMethod === "Cash" ? `<div class="receipt-row"><span>Cash tendered</span><span>${money(transaction.cashTendered)}</span></div><div class="receipt-row"><span>Change</span><span>${money(transaction.change)}</span></div>` : ""}
    <p class="receipt-thanks">${escapeHtml(state.settings.thankYouMessage)}<br>${escapeHtml(state.settings.receiptFooter)}<br>${escapeHtml(state.settings.returnPolicy)}</p>
  `;
}

function renderReceipts() {
  const term = state.receiptSearch.trim().toLowerCase();
  const receipts = [...state.transactions].reverse().filter((transaction) =>
    `#${transaction.number} ${transaction.paymentMethod} ${transaction.customer?.name || ""} ${transaction.dateLabel} ${transaction.dateKey} ${transaction.cancelled ? "cancelled" : ""} ${transaction.refunded ? "refunded" : ""}`.toLowerCase().includes(term)
  );
  if (isPosAppMode) {
    let lastDate = "";
    $("#receiptBrowserList").innerHTML = receipts.map((transaction) => {
      const date = transaction.dateKey
        ? new Intl.DateTimeFormat("en-TT", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${transaction.dateKey}T00:00:00`))
        : "Recent receipts";
      const dateHeader = date !== lastDate ? `<div class="mobile-receipt-date">${escapeHtml(date)}</div>` : "";
      lastDate = date;
      const icon = transaction.cancelled ? "×" : transaction.refunded ? "↩" : transaction.paymentMethod === "Cash" ? "▤" : "▭";
      const time = transaction.createdAt
        ? new Intl.DateTimeFormat("en-TT", { hour: "numeric", minute: "2-digit" }).format(new Date(transaction.createdAt))
        : transaction.dateLabel;
      return `
        ${dateHeader}
        <button class="receipt-browser-item ${transaction.refunded || transaction.cancelled ? "refunded" : ""} ${state.selectedReceiptId === transaction.id ? "active" : ""}" data-browse-receipt="${transaction.id}">
          <span class="transaction-mark">${icon}</span>
          <span><strong>${money(transaction.total)}</strong><small>${escapeHtml(time)}</small></span>
          <span class="receipt-browser-total"><strong>#${escapeHtml(String(transaction.number))}</strong><small>${transaction.cancelled ? "Cancelled" : transaction.refunded ? "Refunded" : ""}</small></span>
        </button>
      `;
    }).join("") || `<div class="empty-list">No receipts found.</div>`;
    renderReceiptDetail();
    return;
  }
  $("#receiptBrowserList").innerHTML = receipts.map((transaction) => `
    <button class="receipt-browser-item ${transaction.refunded || transaction.cancelled ? "refunded" : ""} ${state.selectedReceiptId === transaction.id ? "active" : ""}" data-browse-receipt="${transaction.id}">
      <span class="transaction-mark">${transaction.cancelled ? "×" : transaction.refunded ? "↩" : "✓"}</span>
      <span><strong>Receipt #${transaction.number}</strong><small>${escapeHtml(transaction.dateLabel)} · ${escapeHtml(transaction.customer?.name || "Walk-in customer")}</small></span>
      <span class="receipt-browser-total"><strong>${money(transaction.total)}</strong><small>${transaction.cancelled ? "Cancelled" : transaction.refunded ? "Refunded" : transaction.paymentMethod}</small></span>
    </button>
  `).join("") || `<div class="empty-list">No receipts found.</div>`;
  renderReceiptDetail();
}

function renderReceiptDetail() {
  const transaction = state.transactions.find((entry) => entry.id === state.selectedReceiptId);
  if (!transaction) {
    $("#receiptDetailCard").innerHTML = `<div class="empty-list receipt-placeholder">Select a receipt to view its details.</div>`;
    return;
  }
  $("#receiptDetailCard").innerHTML = `
    <div class="receipt">${receiptMarkup(transaction)}</div>
    <div class="receipt-detail-actions">
      <button class="secondary-btn" data-detail-print="${transaction.id}">Reprint</button>
      <button class="secondary-btn" data-email-receipt="${transaction.id}">Email</button>
      <button class="secondary-btn" data-whatsapp-receipt="${transaction.id}">WhatsApp</button>
      ${transaction.refunded || transaction.cancelled ? "" : `<button class="secondary-btn danger-btn" data-cancel-receipt="${transaction.id}">Cancel</button><button class="primary-btn" data-refund-receipt="${transaction.id}">${currentUser?.role === "Sales Associate" ? "Request refund" : "Refund"}</button>`}
    </div>
  `;
}

function renderTickets() {
  $("#ticketList").innerHTML = state.openTickets.map((ticket) => `
    <div class="ticket-item">
      <div><strong>${escapeHtml(ticket.name)}</strong><small>${ticket.cart.reduce((sum, item) => sum + item.quantity, 0)} items · ${money(ticket.total)} · ${escapeHtml(ticket.createdAt)}</small></div>
      <div class="ticket-actions"><button class="load-ticket" data-load-ticket="${ticket.id}">Open</button><button data-delete-ticket="${ticket.id}">Delete</button></div>
    </div>
  `).join("") || `<div class="empty-list">No open tickets.</div>`;
  $("#ticketCount").textContent = state.openTickets.length;
}

function shiftTransactions() {
  if (!state.currentShift) return [];
  return state.transactions.filter((transaction) => {
    if (transaction.shiftId) return transaction.shiftId === state.currentShift.id;
    return new Date(transaction.createdAt || 0) >= new Date(state.currentShift.openedAt);
  });
}

function expectedCash() {
  if (!state.currentShift) return 0;
  const cashSales = shiftTransactions().filter(isActiveSale).reduce((sum, transaction) => {
    const cash = (transaction.payments || [{ type: transaction.paymentMethod, amount: transaction.total }]).filter((payment) => payment.type === "Cash").reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
    return sum + cash;
  }, 0);
  const movements = state.currentShift.movements.reduce((sum, movement) => sum + (movement.type === "in" ? movement.amount : -movement.amount), 0);
  return state.currentShift.openingCash + cashSales + movements;
}

function renderShifts() {
  const transactions = shiftTransactions();
  const paymentTotals = { Cash: 0, Card: 0, "Bank Transfer": 0, Other: 0 };
  transactions.filter(isActiveSale).forEach((transaction) => {
    (transaction.payments || [{ type: transaction.paymentMethod, amount: transaction.total }]).forEach((payment) => {
      const type = payment.type === "Transfer" ? "Bank Transfer" : payment.type;
      paymentTotals[type] = (paymentTotals[type] || 0) + payment.amount;
    });
  });
  const payIn = state.currentShift?.movements.filter((movement) => movement.type === "in").reduce((sum, movement) => sum + movement.amount, 0) || 0;
  const payOut = state.currentShift?.movements.filter((movement) => movement.type === "out").reduce((sum, movement) => sum + movement.amount, 0) || 0;
  if (state.currentShift) {
    const shiftNumber = String(Number(String(state.currentShift.number || "1").match(/\d+/g)?.join("") || 1));
    $("#shiftHero").innerHTML = `
      <div class="mobile-shift-actions">
        <button class="secondary-btn" id="mobileCashManagementBtn">Cash Management</button>
        <button class="secondary-btn" id="closeShiftBtn">Close Shift</button>
      </div>
      <div class="mobile-shift-meta">
        <p>Shift number: ${escapeHtml(shiftNumber)}</p>
        <p><span>Shift opened: ${escapeHtml(state.currentShift.employee)}</span><span>${escapeHtml(state.currentShift.openedLabel)}</span></p>
      </div>
      <div><span class="eyebrow light">Active shift · ${escapeHtml(state.currentShift.number)}</span><h2>Register is open</h2><p>${escapeHtml(state.currentShift.drawer)} · Opened ${escapeHtml(state.currentShift.openedLabel)} by ${escapeHtml(state.currentShift.employee)}</p></div>
    `;
  } else {
    $("#shiftHero").innerHTML = `<div><span class="eyebrow light">Cash management</span><h2>No open shift</h2><p>Open a shift to track cash and register activity.</p></div><button class="primary-btn" id="openShiftBtn">Open Shift</button>`;
  }
  $("#expectedCash").textContent = money(expectedCash());
  $("#shiftCashSales").textContent = money(paymentTotals.Cash);
  $("#shiftTransactionCount").textContent = transactions.length;
  $("#shiftStartingCash").textContent = money(state.currentShift?.openingCash || 0);
  $("#shiftCardSales").textContent = money(paymentTotals.Card);
  $("#shiftOtherSales").textContent = money(paymentTotals["Bank Transfer"] + paymentTotals.Other);
  $("#shiftPayIn").textContent = money(payIn);
  $("#shiftPayOut").textContent = money(payOut);
  $("#managerShiftTotals").classList.toggle("hidden", currentUser?.role === "Sales Associate");
  $("#cashMovementBtn").disabled = !state.currentShift;
  $("#cashMovementList").innerHTML = state.currentShift?.movements?.map((movement) => `
    <div class="transaction-item"><span class="transaction-mark">${movement.type === "in" ? "+" : "−"}</span><span><strong>${movement.type === "in" ? "Pay In" : "Pay Out"} · ${escapeHtml(movement.reason)}</strong><small>${escapeHtml(movement.dateLabel)} · ${escapeHtml(movement.employee || "—")}</small></span><span class="transaction-amount movement-amount ${movement.type}"><strong>${movement.type === "in" ? "+" : "−"}${money(movement.amount)}</strong></span></div>
  `).reverse().join("") || `<div class="empty-list">No cash movements in this shift.</div>`;
  $("#shiftHistoryList").innerHTML = [...state.shiftHistory].reverse().map((shift) => `
    <button class="transaction-item" type="button" data-shift-detail="${escapeHtml(shift.id || "")}"><span class="transaction-mark">✓</span><span><strong>${escapeHtml(shift.number || shift.openedLabel)}</strong><small>${escapeHtml(shift.closedLabel)} · ${shift.transactions} transactions · ${escapeHtml(shift.employee || "—")}</small></span><span class="transaction-amount"><strong>${money(shift.actualCash)}</strong>${currentUser?.role === "Sales Associate" ? "" : `<small>${shift.difference >= 0 ? "+" : ""}${money(shift.difference)} difference</small>`}</span></button>
  `).join("") || `<div class="empty-list">Closed shifts will appear here.</div>`;
}

function shiftRecordById(id) {
  if (id === "current" && state.currentShift) return { ...state.currentShift, status: "Open" };
  return state.shiftHistory.find((shift) => shift.id === id) || null;
}

function shiftTransactionsFor(record) {
  if (!record) return [];
  if (state.currentShift && record.id === state.currentShift.id) return shiftTransactions();
  const direct = state.transactions.filter((transaction) => transaction.shiftId === record.id);
  if (direct.length || !record.openedAt || !record.closedAt) return direct;
  const opened = new Date(record.openedAt);
  const closed = new Date(record.closedAt);
  return state.transactions.filter((transaction) => {
    const date = transactionDate(transaction);
    return date && date >= opened && date <= closed;
  });
}

function paymentTotalsForTransactions(transactions) {
  const totals = { Cash: 0, Card: 0, "Bank Transfer": 0, Other: 0 };
  transactions.filter(isActiveSale).forEach((transaction) => transactionPayments(transaction).forEach((payment) => {
    totals[payment.type] = (totals[payment.type] || 0) + payment.amount;
  }));
  return totals;
}

function renderShiftDetail(record) {
  const transactions = shiftTransactionsFor(record);
  const activeTransactions = transactions.filter(isActiveSale);
  const payments = paymentTotalsForTransactions(transactions);
  const movements = record.movements || [];
  const payIn = movements.filter((movement) => movement.type === "in").reduce((sum, movement) => sum + movement.amount, 0);
  const payOut = movements.filter((movement) => movement.type === "out").reduce((sum, movement) => sum + movement.amount, 0);
  const expected = record.status === "Open" ? expectedCash() : Number(record.expectedCash ?? (record.openingCash + payments.Cash + payIn - payOut)) || 0;
  const counted = record.status === "Open" ? expected : Number(record.actualCash ?? expected) || 0;
  const showManagerTotals = currentUser?.role !== "Sales Associate";
  const salesTotal = activeTransactions.reduce((sum, transaction) => sum + (Number(transaction.total) || 0), 0);

  return `
    <div class="shift-detail-grid">
      <div><span>Shift number</span><strong>${escapeHtml(record.number || "Current shift")}</strong></div>
      <div><span>Employee</span><strong>${escapeHtml(record.employee || "—")}</strong></div>
      <div><span>Opened</span><strong>${escapeHtml(record.openedLabel || "—")}</strong></div>
      <div><span>Closed</span><strong>${escapeHtml(record.closedLabel || (record.status === "Open" ? "Open now" : "—"))}</strong></div>
      <div><span>Starting cash</span><strong>${money(record.openingCash || 0)}</strong></div>
      <div><span>Sales total</span><strong>${money(salesTotal)}</strong></div>
      <div><span>Cash payments</span><strong>${money(payments.Cash)}</strong></div>
      <div><span>Card payments</span><strong>${money(payments.Card)}</strong></div>
      <div><span>Bank transfer</span><strong>${money(payments["Bank Transfer"])}</strong></div>
      <div><span>Other payments</span><strong>${money(payments.Other)}</strong></div>
      <div><span>Pay in</span><strong>${money(payIn)}</strong></div>
      <div><span>Pay out</span><strong>${money(payOut)}</strong></div>
      ${showManagerTotals ? `<div><span>Expected cash</span><strong>${money(expected)}</strong></div><div><span>Counted cash</span><strong>${money(counted)}</strong></div><div><span>Difference</span><strong>${money(counted - expected)}</strong></div>` : ""}
    </div>
    <div class="shift-detail-section">
      <h3>Cash management</h3>
      ${movements.length ? movements.map((movement) => `<div class="shift-detail-row"><span>${escapeHtml(movement.dateLabel || "")}</span><strong>${movement.type === "in" ? "Pay In" : "Pay Out"} · ${escapeHtml(movement.reason || "")}</strong><b class="${movement.type === "out" ? "danger-text" : ""}">${movement.type === "out" ? "−" : "+"}${money(movement.amount || 0)}</b></div>`).join("") : `<p class="empty-inline">No cash movements recorded.</p>`}
    </div>
    <div class="shift-detail-section">
      <h3>Sales in this shift</h3>
      ${transactions.length ? transactions.map((transaction) => `<button class="shift-detail-row clickable" type="button" data-shift-receipt="${escapeHtml(transaction.id)}"><span>#${escapeHtml(String(transaction.number))}</span><strong>${escapeHtml(transaction.dateLabel)} · ${escapeHtml(transaction.paymentMethod)}</strong><b>${transaction.cancelled ? "Cancelled" : transaction.refunded ? "Refunded" : money(transaction.total)}</b></button>`).join("") : `<p class="empty-inline">No sales saved under this shift yet.</p>`}
    </div>
  `;
}

function openShiftDetail(id) {
  const record = shiftRecordById(id);
  if (!record) return showToast("Shift detail was not found");
  $("#shiftDetailTitle").textContent = record.number || "Shift detail";
  $("#shiftDetailSubtitle").textContent = record.status === "Open" ? "Open shift report" : "Daily shift report";
  $("#shiftDetailContent").innerHTML = renderShiftDetail(record);
  openModal($("#shiftDetailModal"));
}

function renderDashboard() {
  const activeTransactions = state.transactions.filter(isActiveSale);
  const refundedTransactions = state.transactions.filter((transaction) => transaction.refunded);
  const lowStock = state.products.filter((product) => product.stock <= product.reorderLevel && product.stock < 100);
  const itemSales = {};
  const transactionCost = (transaction) => transaction.items.reduce((sum, item) => {
    const product = state.products.find((entry) => entry.id === item.id);
    const cost = Number(item.cost ?? product?.cost ?? 0);
    return sum + cost * item.quantity;
  }, 0);
  const discountTotal = (transactions) => transactions.reduce((sum, transaction) => sum + (Number(transaction.discountAmount) || 0), 0);
  const totalSales = (transactions) => transactions.reduce((sum, transaction) => sum + (Number(transaction.total) || 0), 0);
  const grossProfit = (transactions) => transactions.reduce((sum, transaction) => sum + (Number(transaction.total) || 0) - transactionCost(transaction), 0);
  const transactionsInRange = (transactions, offsetStart, offsetEnd) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - offsetStart);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() - offsetEnd);
    return transactions.filter((transaction) => {
      const transactionDate = transaction.date ? new Date(transaction.date) : new Date(`${transaction.dateKey}T00:00:00`);
      return transactionDate >= start && transactionDate <= end;
    });
  };
  const periodTransactions = (offsetStart, offsetEnd) => transactionsInRange(activeTransactions, offsetStart, offsetEnd);
  const currentPeriod = periodTransactions(6, 0);
  const previousPeriod = periodTransactions(13, 7);
  const setDelta = (selector, current, previous) => {
    const element = $(selector);
    if (!element) return;
    const difference = current - previous;
    const percent = previous ? (difference / previous) * 100 : current ? 100 : 0;
    element.textContent = `${difference >= 0 ? "+" : "-"}${money(Math.abs(difference))} (${difference >= 0 ? "+" : ""}${percent.toFixed(2)}%)`;
    element.classList.toggle("positive", difference >= 0);
    element.classList.toggle("negative", difference < 0);
  };
  activeTransactions.forEach((transaction) => transaction.items.forEach((item) => {
    itemSales[item.name] = itemSales[item.name] || { units: 0, revenue: 0 };
    itemSales[item.name].units += item.quantity;
    itemSales[item.name].revenue += item.price * item.quantity;
  }));
  const topItems = Object.entries(itemSales).sort((a, b) => b[1].units - a[1].units).slice(0, 5);
  const currentSales = totalSales(currentPeriod);
  const previousSales = totalSales(previousPeriod);
  const currentRefunds = totalSales(transactionsInRange(refundedTransactions, 6, 0));
  const previousRefunds = totalSales(transactionsInRange(refundedTransactions, 13, 7));
  const currentDiscounts = discountTotal(currentPeriod);
  const previousDiscounts = discountTotal(previousPeriod);
  const currentGrossProfit = grossProfit(currentPeriod);
  const previousGrossProfit = grossProfit(previousPeriod);

  $("#dashboardDateFilter").textContent = new Intl.DateTimeFormat("en-TT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
  $("#dashboardRefunds").textContent = money(currentRefunds);
  $("#dashboardDiscounts").textContent = money(currentDiscounts);
  $("#dashboardSales").textContent = money(currentSales);
  $("#dashboardGrossProfit").textContent = money(currentGrossProfit);
  setDelta("#dashboardRefundsDelta", currentRefunds, previousRefunds);
  setDelta("#dashboardDiscountsDelta", currentDiscounts, previousDiscounts);
  setDelta("#dashboardSalesDelta", currentSales, previousSales);
  setDelta("#dashboardGrossProfitDelta", currentGrossProfit, previousGrossProfit);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toLocaleDateString("en-CA");
    return {
      key,
      label: new Intl.DateTimeFormat("en-TT", { day: "2-digit", month: "short" }).format(date),
      fullLabel: new Intl.DateTimeFormat("en-TT", { dateStyle: "medium" }).format(date),
      amount: activeTransactions.filter((transaction) => transaction.dateKey === key).reduce((sum, transaction) => sum + transaction.total, 0),
    };
  });
  const graphMax = Math.max(...days.map((day) => day.amount), 1);
  const chartWidth = 900;
  const chartHeight = 320;
  const chartPadding = { top: 28, right: 28, bottom: 54, left: 38 };
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const baseline = chartPadding.top + innerHeight;
  const points = days.map((day, index) => ({
    ...day,
    x: chartPadding.left + (days.length === 1 ? 0 : (index / (days.length - 1)) * innerWidth),
    y: baseline - (day.amount / graphMax) * innerHeight,
  }));
  const linePath = points.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baseline} L ${points[0].x.toFixed(1)} ${baseline} Z`;
  const gridRows = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const y = chartPadding.top + innerHeight * ratio;
    return `<line class="bo-chart-grid" x1="${chartPadding.left}" x2="${chartWidth - chartPadding.right}" y1="${y}" y2="${y}"></line>`;
  }).join("");
  $("#dashboardSalesGraph").innerHTML = `
    <svg class="bo-line-chart" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="Sales summary chart for the last 7 days">
      <defs>
        <linearGradient id="boChartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#72ad45" stop-opacity="0.28"></stop>
          <stop offset="100%" stop-color="#72ad45" stop-opacity="0.05"></stop>
        </linearGradient>
      </defs>
      ${gridRows}
      <path class="bo-chart-area" d="${areaPath}"></path>
      <path class="bo-chart-line" d="${linePath}"></path>
      ${points.map((point) => `<circle class="bo-chart-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4"><title>${escapeHtml(point.fullLabel)}: ${money(point.amount)}</title></circle>`).join("")}
      ${points.map((point) => `<text class="bo-chart-label" x="${point.x.toFixed(1)}" y="${chartHeight - 18}" text-anchor="middle">${escapeHtml(point.label)}</text>`).join("")}
    </svg>
  `;
  $("#topItemsList").innerHTML = topItems.map(([name, sales], index) => `
    <div class="leader-row"><span class="leader-rank">${index + 1}</span><span><strong>${escapeHtml(name)}</strong><small>${sales.units} units sold</small></span><span class="leader-value"><strong>${money(sales.revenue)}</strong></span></div>
  `).join("") || `<div class="empty-list">Complete sales to see top items.</div>`;
  const alerts = [
    ...lowStock.slice(0, 4).map((product) => ({ danger: product.stock === 0, title: product.name, detail: `${product.stock} units remaining`, action: "products" })),
    ...(state.currentShift ? [] : [{ danger: false, title: "No active register shift", detail: "Sales POS cash tracking is not active", action: "shifts" }]),
    ...(state.openTickets.length ? [{ danger: false, title: `${state.openTickets.length} open ticket${state.openTickets.length === 1 ? "" : "s"}`, detail: "Waiting to be completed", action: "sell" }] : []),
  ];
  $("#attentionList").innerHTML = alerts.map((alert) => `
    <div class="attention-item"><span class="attention-dot ${alert.danger ? "danger" : ""}"></span><span><strong>${escapeHtml(alert.title)}</strong><small>${escapeHtml(alert.detail)}</small></span><button data-attention-view="${alert.action}">View</button></div>
  `).join("") || `<div class="empty-list">Everything looks good.</div>`;
}

function renderEmployees() {
  $("#employeeCount").textContent = state.employees.length;
  $("#clockedInCount").textContent = state.employees.filter((employee) => employee.status === "Clocked in").length;
  $("#employeeSales").textContent = money(state.employees.reduce((sum, employee) => sum + (employee.sales || 0), 0));
  $("#employeeTableBody").innerHTML = state.employees.map((employee) => `
    <tr>
      <td><div class="table-product"><span class="avatar">${productInitial(employee.name)}</span><div><strong>${escapeHtml(employee.name)}</strong><small>${escapeHtml(employee.phone || employee.email || "No contact")} · PIN ${employee.pin ? "••••" : "Not set"}</small></div></div></td>
      <td>${escapeHtml(employee.role)}</td>
      <td><span class="category-badge">${escapeHtml(employee.access)}</span></td>
      <td><span class="stock-badge ${employee.status === "Clocked in" ? "" : "out"}">${escapeHtml(employee.status)}</span></td>
      <td><strong>${money(employee.sales || 0)}</strong></td>
      <td><div class="row-actions"><button data-edit-employee="${employee.id}">Edit / PIN</button><button data-toggle-employee="${employee.id}">${employee.status === "Clocked in" ? "Clock out" : "Clock in"}</button><button class="delete" data-delete-employee="${employee.id}">Remove</button></div></td>
    </tr>
  `).join("");
}

function renderSettings() {
  $("#settingStoreName").value = state.settings.storeName;
  $("#settingCompanyName").value = state.settings.companyName;
  $("#settingAddress").value = state.settings.address;
  $("#settingPhone").value = state.settings.phone;
  $("#settingEmail").value = state.settings.email;
  $("#settingTaxNumber").value = state.settings.taxNumber;
  $("#settingReceiptHeader").value = state.settings.receiptHeader;
  $("#settingReceiptFooter").value = state.settings.receiptFooter;
  $("#settingThankYou").value = state.settings.thankYouMessage;
  $("#settingReturnPolicy").value = state.settings.returnPolicy;
  $("#settingCurrency").value = state.settings.currency;
  $("#settingTax").value = state.settings.taxRate;
  $("#settingTaxInclusive").value = String(state.settings.taxInclusive);
  $("#settingLoyalty").value = state.settings.loyaltySpend;
  $("#settingLowStock").value = state.settings.lowStock;
  $("#settingAutoPrint").checked = state.settings.autoPrint;
  $("#settingPaperSize").value = state.settings.paperSize;
  $("#settingPosName").value = state.settings.posName;
  $("#settingReportEmail").value = state.settings.reportEmail || state.settings.email || "";
  $("#settingRetentionMonths").value = String(state.settings.reportRetentionMonths || 6);
  $("#settingNextReportEmail").value = state.settings.nextReportEmailDate || defaultNextReportEmailDate();
  $("#settingAutoEmailReports").checked = Boolean(state.settings.autoEmailSixMonthReports);
  $("#settingPrinterName").value = state.settings.printerName || defaultSettings.printerName;
  $("#settingPrinterConnection").value = state.settings.printerConnection || defaultSettings.printerConnection;
  $("#settingCashDrawer").checked = Boolean(state.settings.cashDrawerEnabled);
  $("#reportEmailStatus").textContent = state.settings.autoEmailSixMonthReports
    ? `Next reminder: ${state.settings.nextReportEmailDate || defaultNextReportEmailDate()}`
    : "Automatic sending needs an email provider; this button prepares the email now.";
  $("#settingLogoPreview").innerHTML = state.settings.logo ? `<img src="${state.settings.logo}" alt="Company logo" />` : `<span>No logo uploaded</span>`;
  $("#mobileSettingsEmail").textContent = state.settings.email || defaultSettings.email;
  renderPosSettings();
}

function posSettingsPageContent(pageKey) {
  const settings = state.settings;
  if (pageKey === "printers") {
    return {
      title: "Printers",
      body: `
        <div class="pos-setting-card">
          <label class="form-field full"><span>Printer name</span><input id="posPrinterName" value="${escapeHtml(settings.printerName || defaultSettings.printerName)}" /></label>
          <label class="form-field full"><span>Printer connection</span><select id="posPrinterConnection">
            <option ${selectedAttr(settings.printerConnection, "Browser print")}>Browser print</option>
            <option ${selectedAttr(settings.printerConnection, "Bluetooth receipt printer")}>Bluetooth receipt printer</option>
            <option ${selectedAttr(settings.printerConnection, "Network printer")}>Network printer</option>
            <option ${selectedAttr(settings.printerConnection, "USB printer")}>USB printer</option>
          </select></label>
          <label class="form-field"><span>Paper size</span><select id="posPaperSize">
            <option ${selectedAttr(settings.paperSize, "58mm")}>58mm</option>
            <option ${selectedAttr(settings.paperSize, "80mm")}>80mm</option>
          </select></label>
          <label class="form-field full check-field"><input id="posAutoPrint" type="checkbox" ${checkedAttr(settings.autoPrint)} /><span>Automatically print after every sale</span></label>
          <label class="form-field full check-field"><input id="posCashDrawer" type="checkbox" ${checkedAttr(settings.cashDrawerEnabled)} /><span>Open cash drawer when supported</span></label>
        </div>
        <button class="primary-btn full submit-btn" type="submit">Save printer settings</button>
      `,
    };
  }
  if (pageKey === "customerDisplays") {
    return {
      title: "Customer displays",
      body: `
        <div class="pos-setting-card">
          <label class="form-field full check-field"><input id="posCustomerDisplayEnabled" type="checkbox" ${checkedAttr(settings.customerDisplayEnabled)} /><span>Enable customer display workflow</span></label>
          <label class="form-field full"><span>Display mode</span><select id="posCustomerDisplayMode">
            <option ${selectedAttr(settings.customerDisplayMode, "Order preview")}>Order preview</option>
            <option ${selectedAttr(settings.customerDisplayMode, "Total only")}>Total only</option>
            <option ${selectedAttr(settings.customerDisplayMode, "Thank you screen")}>Thank you screen</option>
          </select></label>
          <label class="form-field full"><span>Customer message</span><input id="posCustomerDisplayMessage" value="${escapeHtml(settings.customerDisplayMessage || defaultSettings.customerDisplayMessage)}" /></label>
          <p class="pos-setting-note">Use this page to prepare the customer display settings. Hardware pairing can be connected when the display device is chosen.</p>
        </div>
        <button class="primary-btn full submit-btn" type="submit">Save display settings</button>
      `,
    };
  }
  if (pageKey === "taxes") {
    return {
      title: "Taxes",
      body: `
        <div class="pos-setting-card">
          <label class="form-field full"><span>Default tax rate (%)</span><input id="posTaxRate" type="number" min="0" max="100" step="0.1" value="${escapeHtml(settings.taxRate)}" /></label>
          <label class="form-field full"><span>Tax mode</span><select id="posTaxInclusive">
            <option value="false" ${selectedAttr(settings.taxInclusive, false)}>Exclusive</option>
            <option value="true" ${selectedAttr(settings.taxInclusive, true)}>Inclusive</option>
          </select></label>
          <label class="form-field full"><span>Tax number</span><input id="posTaxNumber" value="${escapeHtml(settings.taxNumber || "")}" /></label>
          <p class="pos-setting-note">These tax settings are used by Web-POS, receipts, Online Catalog, and Back Office reports.</p>
        </div>
        <button class="primary-btn full submit-btn" type="submit">Save tax settings</button>
      `,
    };
  }
  if (pageKey === "general") {
    return {
      title: "General",
      body: `
        <div class="pos-setting-card">
          <label class="form-field full"><span>Store name</span><input id="posStoreName" value="${escapeHtml(settings.storeName)}" /></label>
          <label class="form-field full"><span>POS device name</span><input id="posDeviceName" value="${escapeHtml(settings.posName || defaultSettings.posName)}" /></label>
          <label class="form-field full"><span>Store location</span><input id="posStoreLocation" value="${escapeHtml(settings.storeLocation || defaultSettings.storeLocation)}" /></label>
          <label class="form-field full"><span>Store email</span><input id="posStoreEmail" type="email" value="${escapeHtml(settings.email || "")}" /></label>
          <label class="form-field full"><span>Report email</span><input id="posReportEmail" type="email" value="${escapeHtml(settings.reportEmail || settings.email || "")}" /></label>
          <p class="pos-setting-note">General settings sync to the Back Office and all POS devices when internet is available.</p>
        </div>
        <button class="primary-btn full submit-btn" type="submit">Save general settings</button>
      `,
    };
  }
  return null;
}

function renderPosSettings() {
  if (!isPosRuntime) return;
  const menu = $("#posSettingsMenu");
  const detail = $("#posSettingsDetail");
  const pageKey = state.posSettingsPage || "menu";
  const page = posSettingsPageContent(pageKey);
  const showDetail = Boolean(page);
  menu.classList.toggle("hidden", showDetail);
  detail.classList.toggle("hidden", !showDetail);
  detail.classList.toggle("active", showDetail);
  if (!showDetail) {
    if (isPosAppMode && state.activeView === "settings") {
      $("#pageTitle").textContent = "Settings";
      $("#menuBtn").textContent = "☰";
      $("#menuBtn").setAttribute("aria-label", "Open menu");
    }
    return;
  }
  $("#posSettingsDetailTitle").textContent = page.title;
  $("#posSettingsDetailBody").innerHTML = page.body;
  if (isPosAppMode && state.activeView === "settings") {
    $("#pageTitle").textContent = page.title;
    $("#menuBtn").textContent = "←";
    $("#menuBtn").setAttribute("aria-label", "Back to settings");
  }
}

function savePosSettingsPage(event) {
  event.preventDefault();
  const pageKey = state.posSettingsPage || "menu";
  if (pageKey === "printers") {
    state.settings.printerName = $("#posPrinterName").value.trim() || defaultSettings.printerName;
    state.settings.printerConnection = $("#posPrinterConnection").value;
    state.settings.paperSize = $("#posPaperSize").value;
    state.settings.autoPrint = $("#posAutoPrint").checked;
    state.settings.cashDrawerEnabled = $("#posCashDrawer").checked;
  }
  if (pageKey === "customerDisplays") {
    state.settings.customerDisplayEnabled = $("#posCustomerDisplayEnabled").checked;
    state.settings.customerDisplayMode = $("#posCustomerDisplayMode").value;
    state.settings.customerDisplayMessage = $("#posCustomerDisplayMessage").value.trim() || defaultSettings.customerDisplayMessage;
  }
  if (pageKey === "taxes") {
    state.settings.taxRate = Math.max(0, Number($("#posTaxRate").value) || 0);
    state.settings.taxInclusive = $("#posTaxInclusive").value === "true";
    state.settings.taxNumber = $("#posTaxNumber").value.trim();
  }
  if (pageKey === "general") {
    state.settings.storeName = $("#posStoreName").value.trim() || defaultSettings.storeName;
    state.settings.posName = $("#posDeviceName").value.trim() || defaultSettings.posName;
    state.settings.storeLocation = $("#posStoreLocation").value.trim() || defaultSettings.storeLocation;
    state.settings.email = $("#posStoreEmail").value.trim();
    state.settings.reportEmail = $("#posReportEmail").value.trim();
  }
  touchRecord(state.settings);
  markStoreSyncDirty();
  renderSettings();
  showToast(`${posSettingsPageContent(pageKey)?.title || "Settings"} saved`);
}

function catalogPublicUrl() {
  return new URL("/catalog", window.location.origin).href;
}

function catalogThemeColor() {
  return state.settings.catalogMainColor || defaultSettings.catalogMainColor;
}

function catalogProductIsVisible(product) {
  if (product.catalogVisible === false) return false;
  if (state.settings.catalogOutOfStock === "hide" && product.stock <= 0) return false;
  return true;
}

function catalogFilteredProducts(term = "", category = "All") {
  const normalizedTerm = term.trim().toLowerCase();
  return state.products.filter((product) => {
    if (!catalogProductIsVisible(product)) return false;
    if (category !== "All" && product.category !== category) return false;
    if (!normalizedTerm) return true;
    return [product.name, product.category, product.sku, product.barcode].some((value) => String(value || "").toLowerCase().includes(normalizedTerm));
  });
}

function catalogPhoneDigits(value = "") {
  return String(value || "").replace(/\D/g, "");
}

function catalogWhatsAppDigits(value = "") {
  const digits = catalogPhoneDigits(value);
  if (digits.length === 7) return `1868${digits}`;
  if (digits.length === 10 && digits.startsWith("868")) return `1${digits}`;
  return digits;
}

function catalogWhatsAppNumber() {
  return catalogWhatsAppDigits(state.settings.catalogWhatsapp || state.settings.phone);
}

function catalogExternalLink(value = "") {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

function catalogSocialLinks() {
  return [
    ["Facebook", state.settings.catalogFacebook],
    ["Instagram", state.settings.catalogInstagram],
    ["TikTok", state.settings.catalogTikTok],
    ["Website", state.settings.catalogWebsite],
  ].map(([label, value]) => ({ label, url: catalogExternalLink(value) })).filter((link) => link.url);
}

function catalogWhatsAppUrl(message = "") {
  const digits = catalogWhatsAppNumber();
  const phone = digits.length >= 7 ? digits : "";
  const base = phone ? `https://wa.me/${phone}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message || `Hello ${state.settings.storeName}, I would like to place an order from your online catalog.`)}`;
}

function productCatalogPhoto(product = {}) {
  return product.photo || product.photoData || product.image || product.imageUrl || product.photoUrl || product.thumbnail || product.picture || "";
}

function renderCatalogProductImage(product, unavailable = false) {
  const photo = productCatalogPhoto(product);
  return `
    <div class="catalog-product-image ${product.color || "sage"} ${photo ? "has-photo" : ""}">
      ${photo ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(product.name || "Product photo")}" loading="lazy" />` : `<span>${productInitial(product.name || "Item")}</span>`}
      ${unavailable ? `<b>Unavailable</b>` : ""}
    </div>
  `;
}

function renderCatalogProductTile(product, compact = false) {
  const unavailable = product.stock <= 0 && state.settings.catalogOutOfStock === "unavailable";
  return `
    <article class="catalog-product-tile ${unavailable ? "unavailable" : ""} ${compact ? "compact" : ""}">
      ${renderCatalogProductImage(product, unavailable)}
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <small>${escapeHtml(product.category)}${product.sku ? ` · ${escapeHtml(product.sku)}` : ""}</small>
        <span>${money(product.price)}</span>
      </div>
      ${compact ? "" : `<button type="button" data-public-add-product="${product.id}" ${unavailable ? "disabled" : ""}>Order</button>`}
    </article>
  `;
}

function renderCatalogPhonePreview() {
  const products = catalogFilteredProducts("", "All").slice(0, 4);
  const displayMode = state.settings.catalogDisplayMode || defaultSettings.catalogDisplayMode;
  $("#catalogPhonePreview").style.setProperty("--catalog-theme", catalogThemeColor());
  $("#catalogPhonePreview").innerHTML = `
    <div class="catalog-phone-top"></div>
    <div class="catalog-phone-cover">
      ${state.settings.catalogBanner ? `<img src="${state.settings.catalogBanner}" alt="" />` : `<span>${escapeHtml(state.settings.storeName || "Curtain House")}</span>`}
    </div>
    <div class="catalog-phone-title">
      <strong>${escapeHtml(state.settings.storeName || "Curtain House")}</strong>
      <small>${escapeHtml(displayMode)} catalog · ${products.length || 0} sample items</small>
    </div>
    <div class="catalog-phone-products ${displayMode}">
      ${products.map((product) => renderCatalogProductTile(product, true)).join("") || `<p>No published products yet.</p>`}
    </div>
  `;
}

function renderOnlineCatalog() {
  if (!$("#onlineCatalogView")) return;
  const url = catalogPublicUrl();
  const settings = state.settings;
  const aboutStore = settings.catalogAboutStore || "";
  $("#catalogPublicLink").textContent = url.replace(/^https?:\/\//, "");
  $("#catalogPublishUrl").textContent = url;
  $("#catalogPublishedToggle").checked = Boolean(settings.catalogPublished);
  $("#catalogAcceptOrdersToggle").checked = Boolean(settings.catalogAcceptOrders);
  $("#catalogWhatsappToggle").checked = Boolean(settings.catalogWhatsappOrders);
  $("#catalogPostOrderMessage").value = settings.catalogPostOrderMessage || defaultSettings.catalogPostOrderMessage;
  $("#catalogMessageCount").textContent = $("#catalogPostOrderMessage").value.length;
  $$("#catalogColorChoices [data-catalog-color]").forEach((button) => button.classList.toggle("active", button.dataset.catalogColor === catalogThemeColor()));
  $$("[data-catalog-version]").forEach((button) => button.classList.toggle("active", button.dataset.catalogVersion === (settings.catalogVersion || "new")));
  $$("[name='catalogDisplayMode']").forEach((input) => { input.checked = input.value === (settings.catalogDisplayMode || "grid"); });
  $$("[name='catalogOutOfStock']").forEach((input) => { input.checked = input.value === (settings.catalogOutOfStock || defaultSettings.catalogOutOfStock); });
  $("#catalogBannerPreview").innerHTML = settings.catalogBanner ? `<img src="${settings.catalogBanner}" alt="Store banner" />` : "No banner uploaded";
  $("#catalogBusinessName").value = settings.storeName || "";
  $("#catalogBusinessPhone").value = settings.phone || "";
  $("#catalogBusinessWhatsapp").value = settings.catalogWhatsapp || settings.phone || "";
  $("#catalogBusinessEmail").value = settings.email || "";
  $("#catalogBusinessAddress").value = settings.address || "";
  $("#catalogAboutStore").value = aboutStore;
  $("#catalogAboutCount").textContent = aboutStore.length;
  $("#catalogFacebook").value = settings.catalogFacebook || "";
  $("#catalogInstagram").value = settings.catalogInstagram || "";
  $("#catalogTikTok").value = settings.catalogTikTok || "";
  $("#catalogWebsite").value = settings.catalogWebsite || "";
  $("#catalogLogoPreview").innerHTML = settings.logo ? `<img src="${settings.logo}" alt="Business logo" />` : "No logo";
  $("#onlineCatalogView").style.setProperty("--catalog-theme", catalogThemeColor());
  renderCatalogPhonePreview();
}

function saveCatalogBusinessInfo(event) {
  event.preventDefault();
  const businessName = $("#catalogBusinessName").value.trim() || defaultSettings.storeName;
  const phone = $("#catalogBusinessPhone").value.trim();
  const whatsapp = $("#catalogBusinessWhatsapp").value.trim() || phone;
  updateCatalogSetting({
    storeName: businessName,
    companyName: businessName,
    phone,
    catalogWhatsapp: whatsapp,
    email: $("#catalogBusinessEmail").value.trim(),
    address: $("#catalogBusinessAddress").value.trim(),
    catalogAboutStore: $("#catalogAboutStore").value.trim(),
    catalogFacebook: $("#catalogFacebook").value.trim(),
    catalogInstagram: $("#catalogInstagram").value.trim(),
    catalogTikTok: $("#catalogTikTok").value.trim(),
    catalogWebsite: $("#catalogWebsite").value.trim(),
  }, "Business info saved to catalog");
  syncStoreNow({ silent: true });
}

function updateCatalogSetting(changes, message = "Catalog settings saved") {
  state.settings = normalizeSettings({ ...state.settings, ...changes });
  touchRecord(state.settings);
  markStoreSyncDirty();
  renderOnlineCatalog();
  renderPublicCatalog();
  if (message) showToast(message);
}

function renderPublicCatalog() {
  const page = $("#publicCatalog");
  if (!page) return;
  page.style.setProperty("--catalog-theme", catalogThemeColor());
  const logoMark = page.querySelector(".public-catalog-brand .brand-mark");
  if (logoMark) {
    logoMark.classList.toggle("has-logo", Boolean(state.settings.logo));
    logoMark.innerHTML = state.settings.logo ? `<img src="${state.settings.logo}" alt="${escapeHtml(state.settings.storeName || "Curtain House")} logo" />` : "<span></span><span></span><span></span>";
  }
  $("#publicCatalogName").textContent = state.settings.storeName || "Curtain House";
  $("#publicCatalogAddress").textContent = state.settings.address || "Trinidad & Tobago";
  $("#publicCatalogTitle").textContent = state.settings.catalogPublished ? `Shop ${state.settings.storeName || "Curtain House"}` : "Catalog not published yet";
  const phoneDigits = catalogPhoneDigits(state.settings.phone);
  $("#publicCatalogPhone").href = `tel:${phoneDigits}`;
  $("#publicCatalogPhone").classList.toggle("hidden", phoneDigits.length < 7);
  $("#publicCatalogEmail").href = `mailto:${state.settings.email || ""}`;
  $("#publicCatalogEmail").classList.toggle("hidden", !state.settings.email);
  $("#publicCatalogWhatsApp").href = catalogWhatsAppUrl();
  $("#publicCatalogWhatsApp").classList.toggle("hidden", catalogWhatsAppNumber().length < 7);
  $("#publicCatalogAbout").textContent = state.settings.catalogAboutStore || "";
  $("#publicCatalogAbout").classList.toggle("hidden", !state.settings.catalogAboutStore);
  $("#publicCatalogInstructions").textContent = state.settings.catalogPostOrderMessage || defaultSettings.catalogPostOrderMessage;
  const socialLinks = catalogSocialLinks();
  $("#publicCatalogSocials").innerHTML = socialLinks.map((link) => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`).join("");
  $("#publicCatalogSocials").classList.toggle("hidden", socialLinks.length === 0);
  $("#publicCatalogBanner").innerHTML = state.settings.catalogBanner
    ? `<img src="${state.settings.catalogBanner}" alt="Store banner" />`
    : `<div><span>Online Catalog</span><strong>${escapeHtml(state.settings.storeName || "Curtain House")}</strong><small>${escapeHtml(state.settings.catalogAboutStore || state.settings.thankYouMessage || "Thank you for choosing us.")}</small></div>`;
  const categories = ["All", ...new Set(state.products.filter(catalogProductIsVisible).map((product) => product.category).filter(Boolean))];
  $("#publicCatalogCategories").innerHTML = categories.map((category) => `<button type="button" class="${state.publicCatalogCategory === category ? "active" : ""}" data-public-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("");
  const products = state.settings.catalogPublished ? catalogFilteredProducts(state.publicCatalogSearch, state.publicCatalogCategory) : [];
  $("#publicCatalogProducts").className = `public-product-grid ${(state.settings.catalogDisplayMode || "grid")}-mode`;
  $("#publicCatalogProducts").innerHTML = products.map((product) => renderCatalogProductTile(product)).join("") || `
    <div class="public-catalog-empty">
      <h2>${state.settings.catalogPublished ? "No products found" : "This catalog is not published yet"}</h2>
      <p>${state.settings.catalogPublished ? "Try another search or category." : "Please check back soon."}</p>
    </div>
  `;
  renderPublicOrderCart();
}

function publicOrderSubtotal() {
  return state.publicCatalogCart.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

function renderPublicOrderCart() {
  if (!$("#publicOrderPanel")) return;
  const itemCount = state.publicCatalogCart.reduce((sum, item) => sum + item.quantity, 0);
  $("#publicOrderCount").textContent = `${itemCount} item${itemCount === 1 ? "" : "s"}`;
  $("#publicOrderTotal").textContent = money(publicOrderSubtotal());
  $("#publicOrderItems").innerHTML = state.publicCatalogCart.length ? state.publicCatalogCart.map((item) => `
    <div class="public-order-item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <small>${item.quantity} × ${money(item.price)}</small>
      </div>
      <div class="public-order-qty">
        <button type="button" data-public-cart-action="minus" data-product-id="${item.id}">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-public-cart-action="plus" data-product-id="${item.id}">＋</button>
        <button type="button" data-public-cart-action="remove" data-product-id="${item.id}">×</button>
      </div>
    </div>
  `).join("") : `<p class="public-order-empty">Choose items from the catalog to start an order.</p>`;
  const submitButton = $("#publicOrderForm button[type='submit']");
  submitButton.disabled = !itemCount || !state.settings.catalogAcceptOrders;
  submitButton.textContent = state.settings.catalogAcceptOrders ? "Send order" : "Online orders paused";
}

function addPublicCatalogProduct(id) {
  if (!state.settings.catalogAcceptOrders) return showToast("Online orders are paused right now");
  const product = state.products.find((entry) => entry.id === id);
  if (!product || !catalogProductIsVisible(product)) return;
  if (product.stock <= 0 && state.settings.catalogOutOfStock === "unavailable") return showToast("This item is currently unavailable");
  const existing = state.publicCatalogCart.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else {
    state.publicCatalogCart.push({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: Number(product.price) || 0,
      cost: Number(product.cost) || 0,
      photo: productCatalogPhoto(product),
      quantity: 1,
    });
  }
  renderPublicOrderCart();
  showToast(`${product.name} added to order`);
}

function updatePublicCatalogCart(id, action) {
  const item = state.publicCatalogCart.find((entry) => entry.id === id);
  if (!item) return;
  if (action === "remove") state.publicCatalogCart = state.publicCatalogCart.filter((entry) => entry.id !== id);
  if (action === "plus") item.quantity += 1;
  if (action === "minus") item.quantity -= 1;
  state.publicCatalogCart = state.publicCatalogCart.filter((entry) => entry.quantity > 0);
  renderPublicOrderCart();
}

function nextOnlineOrderNumber() {
  const current = state.onlineOrders.map((order) => Number(String(order.number || "").match(/\d+/)?.[0]) || 0);
  return `c-${Math.max(362, ...current) + 1}`;
}

function orderMessage(order) {
  const lines = [
    `Online order #${order.number}`,
    `Customer: ${order.customer.name}`,
    order.customer.phone ? `Phone: ${order.customer.phone}` : "",
    order.customer.address ? `Address: ${order.customer.address}` : "",
    "",
    ...order.items.map((item) => `${item.quantity} x ${item.name} - ${money(item.quantity * item.price)}`),
    "",
    `Total: ${money(order.total)}`,
    order.notes ? `Notes: ${order.notes}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

function submitPublicCatalogOrder(event) {
  event.preventDefault();
  if (!state.publicCatalogCart.length) return showToast("Add an item before sending the order");
  if (!state.settings.catalogAcceptOrders) return showToast("Online orders are paused right now");
  const order = normalizeOnlineOrder({
    id: crypto.randomUUID(),
    number: nextOnlineOrderNumber(),
    createdAt: nowIso(),
    status: "Pending",
    source: "Catalog",
    type: $("#publicCustomerAddress").value.trim() ? "Delivery" : "Pickup",
    deliveryFee: 0,
    paymentMethod: "Cash",
    customer: {
      name: $("#publicCustomerName").value.trim(),
      phone: $("#publicCustomerPhone").value.trim(),
      address: $("#publicCustomerAddress").value.trim(),
    },
    items: structuredClone(state.publicCatalogCart),
    notes: $("#publicCustomerNotes").value.trim(),
  });
  touchRecord(order);
  state.onlineOrders.unshift(order);
  state.selectedOnlineOrderId = order.id;
  state.publicCatalogCart = [];
  $("#publicOrderForm").reset();
  markStoreSyncDirty();
  renderPublicCatalog();
  renderOnlineOrders();
  syncStoreNow({ silent: true });
  showToast("Order sent to Curtain House");
  if (state.settings.catalogWhatsappOrders) openExternalUrl(catalogWhatsAppUrl(orderMessage(order)));
}

function orderDateLabel(order) {
  const date = new Date(order.createdAt);
  if (Number.isNaN(date.getTime())) return order.createdAt || "";
  return new Intl.DateTimeFormat("en-TT", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function orderItemCount(order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

function orderStatusClass(status = "") {
  const normalized = status.toLowerCase();
  if (normalized === "completed") return "completed";
  if (normalized === "cancelled") return "cancelled";
  if (normalized === "confirmed") return "confirmed";
  return "pending";
}

function orderInitials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "OC";
}

function onlineOrderLink(order) {
  return `${catalogPublicUrl().replace(/\/$/, "")}?order=${encodeURIComponent(order.number || order.id)}`;
}

function filteredOnlineOrders() {
  const term = state.orderSearch.trim().toLowerCase();
  return [...state.onlineOrders].sort((a, b) => recordTimestamp(b) - recordTimestamp(a)).filter((order) => {
    if (state.orderStatusFilter !== "All status" && order.status !== state.orderStatusFilter) return false;
    if (!term) return true;
    const haystack = [order.number, order.customer?.name, order.customer?.phone, order.customer?.address, order.status, order.type, ...order.items.map((item) => `${item.name} ${item.sku}`)].join(" ").toLowerCase();
    return haystack.includes(term);
  });
}

function renderOnlineOrders() {
  if (!$("#ordersView")) return;
  const orders = filteredOnlineOrders();
  const openCount = state.onlineOrders.filter((order) => !["Completed", "Cancelled"].includes(order.status)).length;
  $("#onlineOrderCount").textContent = openCount;
  $("#orderSearch").value = state.orderSearch;
  $("#orderStatusFilter").value = state.orderStatusFilter;
  if (!orders.some((order) => order.id === state.selectedOnlineOrderId)) state.selectedOnlineOrderId = orders[0]?.id || null;
  $("#ordersTableBody").innerHTML = orders.map((order) => `
    <tr class="${order.id === state.selectedOnlineOrderId ? "active" : ""}" data-order-row="${order.id}">
      <td><span class="receipt-cell-icon">▤</span> #${escapeHtml(order.number)}</td>
      <td>${escapeHtml(orderDateLabel(order))}</td>
      <td>${escapeHtml(order.customer?.name || "Online customer")}</td>
      <td>🛒 ${escapeHtml(order.source || "Catalog")}</td>
      <td><span class="catalog-item-link">${order.items.length} item${order.items.length === 1 ? "" : "s"}</span></td>
      <td><strong>${money(order.total)}</strong></td>
      <td><span class="order-status ${orderStatusClass(order.status)}">${escapeHtml(order.status)}</span></td>
      <td>${order.type === "Delivery" ? "🚚" : "🏬"}</td>
      <td>${order.notes ? "☰" : "-"}</td>
    </tr>
  `).join("") || `<tr><td colspan="9"><div class="empty-list">No online orders found.</div></td></tr>`;
  renderOnlineOrderDetail();
}

function renderOnlineOrderDetail() {
  const order = state.onlineOrders.find((entry) => entry.id === state.selectedOnlineOrderId);
  if (!$("#onlineOrderDetail")) return;
  if (!order) {
    $("#onlineOrderDetail").innerHTML = `<div class="data-card empty-order-detail"><h3>Select an order</h3><p>Customer order details will show here.</p></div>`;
    return;
  }
  const itemTotal = order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const timeline = order.timeline?.slice().reverse() || [];
  const receiptNumber = order.receiptNumber ? `#${order.receiptNumber}` : `#${order.number}`;
  $("#onlineOrderDetail").innerHTML = `
    <section class="order-detail-top">
      <button class="icon-btn" type="button" data-order-back>‹</button>
      <div><h2>Order #${escapeHtml(order.number)}</h2><small>Total ${money(order.total)}</small></div>
      <div class="order-detail-actions">
        <button class="secondary-btn" type="button" data-copy-order-link="${order.id}">Copy link</button>
        <button class="primary-btn" type="button" data-finish-order="${order.id}" ${["Completed", "Cancelled"].includes(order.status) ? "disabled" : ""}>Finish sale</button>
      </div>
    </section>
    <section class="catalog-link-card order-progress-card">
      <div><strong>Status: <span class="order-status ${orderStatusClass(order.status)}">${escapeHtml(order.status)}</span></strong><small>${escapeHtml(onlineOrderLink(order))}</small></div>
      <select data-order-status="${order.id}">
        ${["Pending", "Confirmed", "Completed", "Cancelled"].map((status) => `<option ${selectedAttr(order.status, status)}>${status}</option>`).join("")}
      </select>
    </section>
    <div class="order-detail-grid">
      <section class="catalog-admin-card order-customer-card">
        <h3>Customer</h3>
        <div class="order-customer-row"><span class="order-avatar">${escapeHtml(orderInitials(order.customer?.name))}</span><strong>${escapeHtml(order.customer?.name || "Online customer")}</strong></div>
        ${order.customer?.phone ? `<p>☏ ${escapeHtml(order.customer.phone)}</p>` : ""}
        ${order.customer?.address ? `<p>⌖ ${escapeHtml(order.customer.address)}</p>` : ""}
      </section>
      <section class="catalog-admin-card order-summary-card">
        <h3>Order summary</h3>
        <div class="receipt-row"><span>Products subtotal</span><span>${money(itemTotal)}</span></div>
        <div class="receipt-row"><span>Delivery</span><span>${money(order.deliveryFee)}</span></div>
        <div class="receipt-rule"></div>
        <div class="receipt-row receipt-total"><span>Total</span><span>${money(order.total)}</span></div>
        <small>Profits: ${money(order.items.reduce((sum, item) => sum + item.quantity * (item.price - item.cost), 0))}</small>
      </section>
      <section class="catalog-admin-card order-notes-card">
        <h3>Notes</h3>
        <p>${escapeHtml(order.notes || "No notes yet.")}</p>
      </section>
      <section class="catalog-admin-card order-payment-card">
        <h3>Payment methods</h3>
        <span class="payment-chip">${escapeHtml(order.paymentMethod || "Cash")}: ${money(order.total)}</span>
      </section>
      <section class="catalog-admin-card order-items-card">
        <h3>${order.items.length} item${order.items.length === 1 ? "" : "s"}</h3>
        ${order.items.map((item) => `
          <div class="order-item-row">
            <span class="table-swatch product-visual sage">${item.photo ? `<img src="${escapeHtml(item.photo)}" alt="" />` : productInitial(item.name)}</span>
            <div><strong>${item.quantity}x ${escapeHtml(item.name)}</strong><small>${escapeHtml(item.sku || item.category || "")}</small></div>
            <b>${money(item.quantity * item.price)}</b>
          </div>
        `).join("")}
      </section>
      <section class="catalog-admin-card order-receipt-card">
        <h3>Receipt</h3>
        <div class="order-receipt-preview">
          ${state.settings.logo ? `<img src="${state.settings.logo}" alt="Logo" />` : `<strong>${escapeHtml(state.settings.storeName || "Curtain House")}</strong>`}
          <p>RECEIPT ${escapeHtml(receiptNumber)}</p>
          <button class="primary-btn" type="button" data-print-online-order="${order.id}">Print</button>
        </div>
      </section>
      <section class="catalog-admin-card order-timeline-card">
        <h3>Timeline</h3>
        ${timeline.map((entry) => `<div class="order-timeline-row"><span></span><strong>${escapeHtml(entry.status)}</strong><small>${escapeHtml(orderDateLabel({ createdAt: entry.at }))}</small></div>`).join("")}
      </section>
    </div>
  `;
}

function setOnlineOrderStatus(id, status) {
  const order = state.onlineOrders.find((entry) => entry.id === id);
  if (!order || order.status === status) return;
  order.status = status;
  order.timeline = [...(order.timeline || []), { status, at: nowIso() }];
  touchRecord(order);
  markStoreSyncDirty();
  renderOnlineOrders();
  showToast(`Order ${status.toLowerCase()}`);
}

function finishOnlineOrder(id) {
  const order = state.onlineOrders.find((entry) => entry.id === id);
  if (!order || order.status === "Completed") return;
  const saleItems = order.items.map((item) => ({ ...item, custom: false }));
  if (order.deliveryFee > 0) saleItems.push({ id: `delivery-${order.id}`, name: "Delivery", quantity: 1, price: order.deliveryFee, cost: 0, custom: true });
  const rawSubtotal = saleItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const transaction = touchRecord({
    id: crypto.randomUUID(),
    number: 1001 + state.transactions.length,
    dateKey: todayKey(),
    createdAt: nowIso(),
    dateLabel: new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
    items: saleItems,
    customer: { name: order.customer?.name || "Online customer", contact: order.customer?.phone || order.customer?.email || "", notes: order.customer?.address || "" },
    paymentMethod: order.paymentMethod || "Cash",
    payments: [{ type: order.paymentMethod || "Cash", amount: order.total }],
    cashier: currentUser?.name || "Online Catalog",
    pos: "Web POS",
    shiftId: state.currentShift?.id || "",
    shiftNumber: state.currentShift?.number || "",
    discount: 0,
    fixedDiscount: 0,
    rawSubtotal,
    discountAmount: 0,
    subtotal: rawSubtotal,
    tax: 0,
    taxRate: 0,
    total: order.total,
    onlineOrderId: order.id,
    cashTendered: null,
    change: null,
  });
  saleItems.forEach((item) => {
    if (item.custom) return;
    const product = state.products.find((entry) => entry.id === item.id);
    if (product && product.stock < 100) {
      product.stock -= item.quantity;
      touchRecord(product);
    }
  });
  state.transactions.push(transaction);
  order.status = "Completed";
  order.receiptNumber = transaction.number;
  order.timeline = [...(order.timeline || []), { status: "Completed", at: nowIso() }];
  touchRecord(order);
  markStoreSyncDirty();
  renderAll();
  showToast(`Order #${order.number} finished`);
}

function workflowDefinition(name = state.activeModule) {
  return workflowDefinitions[name] || {
    description: `Manage ${name.toLowerCase()} records and follow-up actions.`,
    statuses: ["Open", "In progress", "Completed"],
    fields: [["reference", "Reference", "text"], ["name", "Name / subject", "text"], ["date", "Date", "date"], ["amount", "Amount", "number"], ["description", "Details / notes", "text"], ["status", "Status", "select"]],
  };
}

function derivedWorkflowRecords(name) {
  if (name === "Inventory History") {
    return state.products.flatMap((product) => product.stockHistory.map((entry, index) => ({ id: `${product.id}-${index}`, name: product.name, reference: product.sku, description: entry.reason, amount: entry.quantity, date: entry.date, status: "Recorded", updatedAt: entry.user })));
  }
  if (name === "Inventory Valuation") {
    return state.products.filter((product) => product.stock < 100).map((product) => ({ id: product.id, name: product.name, reference: product.sku, description: `${product.stock} units × ${money(product.cost)} cost`, amount: product.stock * product.cost, status: "Current", updatedAt: product.category }));
  }
  if (name === "Open Tickets") {
    return state.openTickets.map((ticket) => ({ id: ticket.id, name: ticket.name, reference: `${ticket.cart.length} lines`, description: ticket.createdAt, amount: ticket.total, status: "Open", updatedAt: ticket.customer?.name || "Walk-in customer" }));
  }
  if (name === "Receipts") {
    return state.transactions.map((transaction) => ({ id: transaction.id, name: `Receipt #${transaction.number}`, reference: transaction.customer?.name || "Walk-in customer", description: transaction.paymentMethod, amount: transaction.total, date: transaction.dateLabel, status: transaction.cancelled ? "Cancelled" : transaction.refunded ? "Refunded" : "Completed", updatedAt: transaction.cashier }));
  }
  if (name === "Shifts") {
    return state.shiftHistory.map((shift) => ({ id: shift.id, name: shift.number || "Closed shift", reference: shift.employee, description: `${shift.transactions} transactions`, amount: shift.actualCash, date: shift.closedLabel, status: "Completed", updatedAt: shift.drawer }));
  }
  if (name.startsWith("Sales by ") || name === "Sales Summary") {
    return state.transactions.filter(isActiveSale).map((transaction) => ({ id: transaction.id, name: `Sale #${transaction.number}`, reference: transaction.customer?.name || transaction.paymentMethod, description: `${transaction.items.length} item lines`, amount: transaction.total, date: transaction.dateLabel, status: "Completed", updatedAt: transaction.cashier }));
  }
  return null;
}

function workflowRecords(name = state.activeModule) {
  const derived = derivedWorkflowRecords(name);
  if (derived) return derived;
  if (!state.workflowRecords[name]) state.workflowRecords[name] = [];
  return state.workflowRecords[name];
}

function isCompleteWorkflowStatus(status) {
  return ["Active", "Approved", "Applied", "Completed", "Current", "Delivered", "Enabled", "Paid", "Printed", "Ready", "Received", "Recorded"].includes(status);
}

function renderWorkflow() {
  const definition = workflowDefinition();
  const records = workflowRecords();
  const term = state.workflowSearch.trim().toLowerCase();
  const statusFilter = $("#workflowStatusFilter").value;
  const filtered = records.filter((record) => {
    const matches = !term || Object.values(record).join(" ").toLowerCase().includes(term);
    return matches && (!statusFilter || record.status === statusFilter);
  });
  $("#workflowTitle").textContent = state.activeModule;
  $("#workflowListTitle").textContent = state.activeModule;
  $("#workflowDescription").textContent = definition.description;
  $("#workflowTotal").textContent = records.length;
  $("#workflowComplete").textContent = records.filter((record) => isCompleteWorkflowStatus(record.status)).length;
  $("#workflowPending").textContent = records.filter((record) => !isCompleteWorkflowStatus(record.status)).length;
  $("#addWorkflowRecordBtn").classList.toggle("hidden", Boolean(definition.readOnly));
  $("#workflowStatusFilter").innerHTML = `<option value="">All statuses</option>${[...new Set(records.map((record) => record.status).filter(Boolean).concat(definition.statuses))].map((status) => `<option ${status === statusFilter ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}`;
  $("#workflowList").innerHTML = filtered.map((record) => {
    const statusClass = isCompleteWorkflowStatus(record.status) ? "complete" : ["Overdue", "Failed", "Cancelled", "Inactive", "Refunded"].includes(record.status) ? "warning" : "";
    const canAdvance = !definition.readOnly && definition.statuses.indexOf(record.status) < definition.statuses.length - 1;
    const linkedActions = state.activeModule === "Curtain Measurement" ? `<button data-linked-workflow="Customer Orders" data-workflow-id="${record.id}">Create order</button>` :
      state.activeModule === "Customer Orders" ? `<button data-linked-workflow="Deposit Tracking" data-workflow-id="${record.id}">Deposit</button><button data-linked-workflow="Balance Tracking" data-workflow-id="${record.id}">Balance</button><button data-linked-workflow="Delivery Tracking" data-workflow-id="${record.id}">Delivery</button><button data-linked-workflow="Installation Scheduling" data-workflow-id="${record.id}">Install</button>` : "";
    return `
      <article class="workflow-record">
        <div><strong>${escapeHtml(record.name || record.reference || "Untitled record")}</strong><small>${escapeHtml(record.reference || "No reference")} · Updated ${escapeHtml(record.updatedAt || "recently")}</small></div>
        <div><strong>${escapeHtml(record.description || record.contact || "No details")}</strong><small>${escapeHtml(record.date || "")}${record.amount !== undefined && record.amount !== "" ? ` · ${money(record.amount)}` : ""}</small></div>
        <span class="workflow-status ${statusClass}">${escapeHtml(record.status || "Open")}</span>
        <div class="workflow-actions">${linkedActions}${state.activeModule === "Barcode Printing" ? `<button data-print-workflow="${record.id}">Print labels</button>` : ""}${canAdvance ? `<button data-advance-workflow="${record.id}">Next status</button>` : ""}${definition.readOnly ? "" : `<button data-edit-workflow="${record.id}">Edit</button><button class="delete" data-delete-workflow="${record.id}">Delete</button>`}</div>
      </article>
    `;
  }).join("") || `<div class="empty-list">No ${escapeHtml(state.activeModule.toLowerCase())} records found.</div>`;
  saveState();
}

function openWorkflow(name) {
  state.activeModule = name;
  state.workflowSearch = "";
  $("#workflowSearch").value = "";
  $("#workflowStatusFilter").value = "";
  setView("workflow");
}

function openWorkflowForm(record = null) {
  const definition = workflowDefinition();
  state.editingWorkflowId = record?.id || null;
  $("#workflowModalTitle").textContent = `${record ? "Edit" : "Add"} ${state.activeModule} record`;
  $("#workflowFormFields").innerHTML = definition.fields.map(([key, label, type]) => {
    if (type === "select") return `<label class="form-field full"><span>${escapeHtml(label)}</span><select name="${key}">${definition.statuses.map((status) => `<option ${record?.[key] === status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select></label>`;
    return `<label class="form-field ${key === "description" || key === "contact" ? "full" : ""}"><span>${escapeHtml(label)}</span><input name="${key}" type="${type}" ${["name", "reference"].includes(key) ? "required" : ""} step="${type === "number" ? "0.01" : ""}" value="${escapeHtml(record?.[key] ?? "")}" /></label>`;
  }).join("");
  openModal($("#workflowModal"));
}

function createLinkedWorkflow(targetName, source) {
  const target = workflowDefinition(targetName);
  const record = {
    id: crypto.randomUUID(),
    reference: source.reference || "",
    name: source.name || "",
    contact: source.contact || "",
    amount: targetName === "Balance Tracking" ? source.amount || 0 : targetName === "Deposit Tracking" ? 0 : "",
    date: "",
    description: `Created from ${state.activeModule}: ${source.description || source.reference || source.name}`,
    status: target.statuses[0],
    updatedAt: new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
  };
  touchRecord(record);
  if (!state.workflowRecords[targetName]) state.workflowRecords[targetName] = [];
  state.workflowRecords[targetName].unshift(record);
  saveState();
  markStoreSyncDirty();
  openWorkflow(targetName);
  showToast(`${targetName} record created`);
}

function exportWorkflowCsv() {
  const records = workflowRecords();
  const columns = ["reference", "name", "contact", "date", "amount", "description", "status", "updatedAt"];
  const csv = [columns.join(","), ...records.map((record) => columns.map((column) => `"${String(record[column] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = `${state.activeModule.toLowerCase().replaceAll(" ", "-")}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderAll() {
  renderCategories();
  renderProducts();
  renderCart();
  renderInventory();
  renderStats();
  renderReports();
  renderCustomers();
  renderReceipts();
  renderTickets();
  renderShifts();
  renderDashboard();
  renderEmployees();
  renderSettings();
  renderOnlineCatalog();
  renderPublicCatalog();
  renderOnlineOrders();
  renderWorkflow();
}

function openCustomerForOrder() {
  state.customerMode = "order";
  $("#existingCustomerSelect").value = state.customer?.id || "";
  $("#customerInput").value = state.customer?.name || "";
  $("#customerContact").value = state.customer?.contact || "";
  $("#customerNotes").value = state.customer?.notes || "";
  openModal($("#customerModal"));
}

function openSaveTicketForm() {
  if (!state.cart.length) return showToast("Add an item before saving a ticket");
  const timeLabel = new Intl.DateTimeFormat("en-TT", { hour: "numeric", minute: "2-digit" }).format(new Date());
  $("#ticketName").value = state.customer?.name ? `${state.customer.name} order` : `Ticket - ${timeLabel}`;
  openModal($("#saveTicketModal"));
}

function clearCurrentTicket() {
  if (!state.cart.length && !state.discount && !state.fixedDiscount && !state.customer) return;
  state.cart = [];
  state.discount = 0;
  state.fixedDiscount = 0;
  state.customer = null;
  state.mobileTicketMode = false;
  state.mobileEditingItemId = null;
  renderAll();
  showToast("Ticket cleared");
}

function applyMobileDiscount(id) {
  const preset = activeDiscountPresets().find((entry) => entry.id === id);
  if (!preset) return;
  if (!state.cart.length) return showToast("Add an item before applying a discount");
  state.discount = preset.type === "percent" ? preset.value : 0;
  state.fixedDiscount = preset.type === "amount" ? preset.value : 0;
  state.mobileTicketMode = true;
  state.mobileEditingItemId = null;
  renderAll();
  showToast(`${preset.name} discount applied`);
}

function addToCart(product) {
  if (product.stock <= 0) showToast("Warning: this item is out of stock. Negative stock is allowed.");
  const existing = state.cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }
  if (isPosAppMode) {
    state.mobileTicketMode = true;
    state.mobileEditingItemId = null;
  }
  renderCart();
  if (product.stock > 0) showToast(`${product.name} added to the order`);
}

function updateCartItem(id, change) {
  const item = state.cart.find((entry) => entry.id === id);
  if (!item) return;
  if (change === "remove") {
    state.cart = state.cart.filter((entry) => entry.id !== id);
    if (!state.cart.length) {
      state.discount = 0;
      state.fixedDiscount = 0;
      state.mobileTicketMode = false;
      state.mobileEditingItemId = null;
    }
    renderCart();
    return;
  }
  item.quantity += change;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== id);
    state.mobileEditingItemId = null;
  }
  if (!state.cart.length) {
    state.discount = 0;
    state.fixedDiscount = 0;
    state.mobileTicketMode = false;
  }
  const product = state.products.find((entry) => entry.id === id);
  if (change > 0 && product && item.quantity > product.stock) showToast("Warning: sale quantity exceeds current stock");
  renderCart();
}

function setView(view) {
  const posOnlyViews = ["sell", "receipts", "shifts", "orders"];
  if (isBackOfficeWebsite && posOnlyViews.includes(view)) {
    setView("dashboard");
    showToast("Sales POS is available in Web-POS");
    return;
  }
  const managementViews = ["products", "dashboard", "reports", "customers", "employees", "workflow", "onlineCatalog", "orders"];
  if (managementViews.includes(view) && !hasManagementAccess()) {
    showToast("This menu is locked for Sales Associates");
    return;
  }
  if (isPosRuntime && view === "dashboard") {
    openExternalUrl("/?mode=backoffice");
    $("#sidebar").classList.remove("open");
    document.body.classList.remove("mobile-nav-open");
    return;
  }
  if (view === "settings" && currentUser?.role !== "Admin") {
    showToast("Settings are locked for this account");
    return;
  }
  if (view === "sell" && !state.currentShift) {
    if (state.activeView !== "shifts") setView("shifts");
    showToast("Open a shift before starting sales");
    if (!$("#shiftModal").open) setTimeout(() => openShiftForm("open"), 100);
    return;
  }
  state.workspace = isBackOfficeWorkspaceView(view) ? "backoffice" : "pos";
  state.activeView = view;
  if (view === "dashboard") state.activeReportNav = "Sales summary";
  if (view === "reports" && state.activeReportNav === "Sales summary") state.activeReportNav = "Sales by item";
  document.body.dataset.activeView = view;
  $$(".view").forEach((section) => section.classList.toggle("active", section.id === `${view}View`));
  $$(".nav-item").forEach((button) => {
    const reportsGroupActive = button.dataset.view === "dashboard" && (view === "dashboard" || view === "reports");
    button.classList.toggle("active", button.dataset.view === view || reportsGroupActive);
    button.classList.toggle("expanded", button.dataset.navGroup && button.dataset.navGroup === state.expandedNavGroup);
  });
  $$(".nav-submenu").forEach((menu) => menu.classList.toggle("expanded", menu.dataset.navGroupPanel === state.expandedNavGroup));
  $$(".nav-subitem").forEach((button) => {
    const label = button.textContent.trim();
    button.classList.toggle("active", (view === "dashboard" && label === "Sales summary") || (view === "reports" && label === state.activeReportNav));
  });
  $("#pageTitle").textContent = { sell: isPosAppMode ? "Ticket" : "Sales", receipts: "Receipts", products: "Items", customers: "Customers", reports: state.activeReportNav || "Reports", shifts: isPosAppMode ? "Shift" : "Shifts", dashboard: "Sales summary", employees: "Employees", settings: "Settings", workflow: state.activeModule, onlineCatalog: "Online Catalog", orders: "Orders" }[view];
  $("#globalSearch").placeholder = view === "sell" ? "Search category, item, SKU, or barcode" : "Search items, SKU, or barcode";
  $("#sidebar").classList.remove("open");
  document.body.classList.remove("mobile-nav-open");
  updateMobileChrome();
  if (view === "products") renderInventory();
  if (view === "receipts") renderReceipts();
  if (view === "customers") renderCustomers();
  if (view === "reports") renderReports();
  if (view === "shifts") renderShifts();
  if (view === "dashboard") renderDashboard();
  if (view === "employees") renderEmployees();
  if (view === "settings") renderSettings();
  if (view === "workflow") renderWorkflow();
  if (view === "onlineCatalog") renderOnlineCatalog();
  if (view === "orders") renderOnlineOrders();
}

function setWorkspace(workspace, targetView = null) {
  if (isBackOfficeWebsite && workspace === "pos") {
    setView("dashboard");
    showToast("Sales POS is available in Web-POS");
    return;
  }
  setView(targetView || (workspace === "pos" ? "sell" : "dashboard"));
}

function navigateToView(view) {
  setView(view);
}

function openReport(reportName) {
  state.activeReportNav = reportName;
  state.expandedNavGroup = "reports";
  setView(reportName === "Sales summary" ? "dashboard" : "reports");
}

function openModal(modal) {
  $("#modalBackdrop").classList.add("open");
  modal.showModal();
}

function closeModal(modal) {
  if (modal === $("#barcodeScannerModal")) stopBarcodeScanner();
  modal.close();
  if (!$$("dialog[open]").length) $("#modalBackdrop").classList.remove("open");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function setScannerStatus(message, type = "") {
  const status = $("#scannerStatus");
  status.textContent = message;
  status.className = `scanner-status ${type}`.trim();
}

function findProductByBarcode(value) {
  const code = String(value || "").trim().toLowerCase();
  return state.products.find((product) => product.barcode?.trim().toLowerCase() === code || product.sku?.trim().toLowerCase() === code);
}

function findProductBySearch(value) {
  const term = String(value || "").trim().toLowerCase();
  if (!term) return null;
  const exact = findProductByBarcode(term);
  if (exact) return exact;
  return mobileCatalogProducts(term)[0] || state.products.find((product) => (
    `${product.name} ${product.sku} ${product.barcode} ${product.category}`.toLowerCase().includes(term)
  )) || null;
}

function quickAddSearchItem(value) {
  const term = String(value || "").trim();
  if (!term) return false;
  if (!state.currentShift) {
    setView("shifts");
    showToast("Open a shift before adding sale items");
    return true;
  }
  const product = findProductBySearch(term);
  if (!product) {
    showToast(`No item found for ${term}`);
    return false;
  }
  addToCart(product);
  state.search = "";
  $("#globalSearch").value = "";
  $("#mobileSalesSearch").value = "";
  renderProducts();
  return true;
}

async function waitForScannerLibrary(timeout = 8000) {
  const startedAt = Date.now();
  while (!window.Html5Qrcode && Date.now() - startedAt < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return Boolean(window.Html5Qrcode);
}

async function stopBarcodeScanner() {
  scannerStarting = false;
  const scanner = barcodeScanner;
  barcodeScanner = null;
  if (!scanner) return;
  try {
    if (scanner.isScanning) await scanner.stop();
    await scanner.clear();
  } catch (error) {
    console.warn("Could not stop barcode scanner.", error);
  }
}

async function handleScannedBarcode(value) {
  const code = String(value || "").trim();
  if (!code) return false;
  const now = Date.now();
  if (code === lastScannedBarcode && now - lastScanTime < 1600) return false;
  lastScannedBarcode = code;
  lastScanTime = now;
  if (barcodeScanMode === "product-form") {
    $("#productBarcode").value = code;
    setScannerStatus(`Barcode ${code} added to this item.`, "success");
    await stopBarcodeScanner();
    closeModal($("#barcodeScannerModal"));
    showToast("Barcode added to item");
    barcodeScanMode = "sale";
    return true;
  }
  const product = findProductByBarcode(code);
  if (barcodeScanMode === "inventory-find") {
    if (product) {
      setScannerStatus(`${product.name} found. Opening item...`, "success");
      await stopBarcodeScanner();
      closeModal($("#barcodeScannerModal"));
      barcodeScanMode = "sale";
      openProductForm(product);
      return true;
    }
    state.productSearch = code;
    $("#productSearch").value = code;
    renderInventory();
    setScannerStatus(`No item uses barcode ${code}.`, "error");
    return false;
  }
  if (!product) {
    setScannerStatus(`No item uses barcode ${code}. Add it in Items or try again.`, "error");
    return false;
  }
  setScannerStatus(`${product.name} found. Adding to sale...`, "success");
  addToCart(product);
  await stopBarcodeScanner();
  closeModal($("#barcodeScannerModal"));
  setView("sell");
  showToast(`${product.name} scanned and added`);
  return true;
}

async function startBarcodeScanner(mode = "sale") {
  if (scannerStarting || barcodeScanner?.isScanning) return;
  barcodeScanMode = mode;
  if (mode === "sale" && !state.currentShift) {
    setView("shifts");
    showToast("Open a shift before scanning items");
    return;
  }
  if (mode === "sale") setView("sell");
  $("#manualBarcodeInput").value = "";
  setScannerStatus(mode === "sale" ? "Requesting camera access..." : "Scan the item barcode.");
  openModal($("#barcodeScannerModal"));
  if (!window.Html5Qrcode) setScannerStatus("Loading camera scanner...");
  if (!window.Html5Qrcode && !await waitForScannerLibrary()) {
    setScannerStatus("Camera scanning could not load. Enter the barcode manually below.", "error");
    return;
  }
  scannerStarting = true;
  const formats = window.Html5QrcodeSupportedFormats ? [
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.ITF,
  ] : undefined;
  const scanner = new Html5Qrcode("barcodeReader", { formatsToSupport: formats, verbose: false });
  barcodeScanner = scanner;
  try {
    await scanner.start(
      { facingMode: "environment" },
      { fps: 12, qrbox: { width: 280, height: 120 }, aspectRatio: 1.333 },
      (decodedText) => handleScannedBarcode(decodedText),
      () => {}
    );
    if (!$("#barcodeScannerModal").open || barcodeScanner !== scanner) {
      if (scanner.isScanning) await scanner.stop();
      await scanner.clear();
      return;
    }
    setScannerStatus("Point the camera at an item barcode.");
  } catch (error) {
    console.warn("Could not start barcode scanner.", error);
    if (barcodeScanner === scanner) barcodeScanner = null;
    setScannerStatus("Camera access was unavailable. Allow camera access or enter the barcode manually.", "error");
  } finally {
    scannerStarting = false;
  }
}

function compressImageDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      const scale = Math.min(1, PRODUCT_PHOTO_MAX_SIZE / Math.max(width, height));
      const targetWidth = Math.max(1, Math.round(width * scale));
      const targetHeight = Math.max(1, Math.round(height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("Image compression is unavailable."));
      context.drawImage(image, 0, 0, targetWidth, targetHeight);
      resolve(canvas.toDataURL("image/jpeg", PRODUCT_PHOTO_QUALITY));
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function readImageFile(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const dataUrl = String(reader.result || "");
    if (!file.type.startsWith("image/")) {
      callback(dataUrl);
      return;
    }
    try {
      callback(await compressImageDataUrl(dataUrl));
    } catch (error) {
      console.warn("Could not compress image.", error);
      callback(dataUrl);
    }
  };
  reader.readAsDataURL(file);
}

function requestRefund(id) {
  if (currentUser?.role !== "Sales Associate") return refundTransaction(id);
  state.pendingRefundId = id;
  $("#refundApprovalForm").reset();
  openModal($("#refundApprovalModal"));
}

function shareReceipt(id, channel) {
  const transaction = state.transactions.find((entry) => entry.id === id);
  if (!transaction) return;
  const subject = encodeURIComponent(`Curtain House receipt #${transaction.number}`);
  const body = encodeURIComponent(`Receipt #${transaction.number}\n${transaction.dateLabel}\nTotal: ${money(transaction.total)}\nThank you for shopping with Curtain House.`);
  window.open(channel === "email" ? `mailto:?subject=${subject}&body=${body}` : `https://wa.me/?text=${body}`, "_blank", "noopener");
}

function exportProductsCsv() {
  const columns = ["name", "category", "sku", "barcode", "cost", "price", "tax", "stock", "reorderLevel", "catalogVisible"];
  const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [columns.join(","), ...state.products.map((product) => columns.map((column) => escapeCsv(product[column])).join(","))].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "curtain-house-items.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function importProductsCsv(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const [headerLine, ...lines] = String(reader.result).trim().split(/\r?\n/);
    const headers = headerLine.split(",").map((header) => header.trim().replaceAll('"', ""));
    const imported = lines.filter(Boolean).map((line) => {
      const values = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g)?.map((value) => value.replace(/,$/, "").replace(/^"|"$/g, "").replaceAll('""', '"')) || [];
      const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
      return normalizeProduct({
        id: crypto.randomUUID(),
        name: row.name || "Imported item",
        category: row.category || "Curtains",
        sku: row.sku || `ITEM-${Date.now()}`,
        barcode: row.barcode || "",
        cost: Number(row.cost) || 0,
        price: Number(row.price) || 0,
        tax: Number(row.tax) || state.settings.taxRate,
        stock: Number(row.stock) || 0,
        reorderLevel: Number(row.reorderLevel) || state.settings.lowStock,
        catalogVisible: String(row.catalogVisible || "true").toLowerCase() !== "false",
        color: "sage",
      });
    });
    imported.forEach(touchRecord);
    state.products.unshift(...imported);
    markStoreSyncDirty();
    renderAll();
    showToast(`${imported.length} items imported`);
  };
  reader.readAsText(file);
}

function productCategoryOptions(selectedCategory = "Curtains") {
  const categories = [...new Set([...defaultCategories.map((category) => category.name), ...categoryNames()])];
  return categories.map((category) => `<option ${category === selectedCategory ? "selected" : ""}>${escapeHtml(category)}</option>`).join("");
}

function openProductForm(product = null) {
  $("#productModalTitle").textContent = product ? "Edit item" : "Add item";
  $("#productId").value = product?.id || "";
  $("#productName").value = product?.name || "";
  $("#productPrice").value = product?.price || "";
  $("#productCost").value = product?.cost || "";
  $("#productStock").value = product?.stock ?? "";
  $("#productSku").value = product?.sku || "";
  $("#productBarcode").value = product?.barcode || "";
  $("#productTax").value = product?.tax ?? state.settings.taxRate;
  $("#productReorderLevel").value = product?.reorderLevel ?? state.settings.lowStock;
  $("#productCategory").innerHTML = productCategoryOptions(product?.category || state.mobileInventoryCategory !== "All" && state.mobileInventoryCategory || "Curtains");
  $("#productColor").value = product?.color || "sage";
  $("#productCatalogVisible").checked = product?.catalogVisible !== false;
  $("#productPhotoData").value = product?.photo || "";
  $("#productPhotoPreview").innerHTML = product?.photo ? `<img src="${product.photo}" alt="Product photo" />` : `<span>No photo uploaded</span>`;
  $("#productStockHistory").innerHTML = product?.stockHistory?.slice().reverse().map((entry) => `<div class="history-line"><strong>${entry.quantity > 0 ? "+" : ""}${entry.quantity}</strong><span>${escapeHtml(entry.reason)} · ${escapeHtml(entry.user)} · ${escapeHtml(entry.date)}</span></div>`).join("") || `<div class="empty-list">No stock adjustments yet.</div>`;
  $("#deleteProductBtn").classList.toggle("hidden", !product);
  $("#productModal .modal-close").textContent = isPosAppMode ? "←" : "×";
  openModal($("#productModal"));
  if (!isPosAppMode) setTimeout(() => $("#productName").focus(), 20);
}

function mobileRecordLabel(type) {
  if (type === "categories") return "category";
  if (type === "modifiers") return "modifier";
  return "discount";
}

function mobileRecordCollection(type) {
  if (type === "categories") return state.categories;
  if (type === "modifiers") return state.modifiers;
  return state.discountPresets;
}

function openMobileRecordForm(type = state.mobileInventoryMode, record = null) {
  const label = mobileRecordLabel(type);
  $("#mobileRecordTitle").textContent = `${record ? "Edit" : "Add"} ${label}`;
  $("#mobileRecordType").value = type;
  $("#mobileRecordId").value = record?.id || "";
  $("#mobileRecordOldName").value = record?.name || "";
  $("#mobileRecordName").value = record?.name || "";
  $("#mobileRecordDescription").value = record?.description || "";
  $("#mobileRecordStatus").value = record?.status || "Active";
  $("#mobileRecordDiscountTypeField").classList.toggle("hidden", type !== "discounts");
  $("#mobileRecordAmountField").classList.toggle("hidden", type === "categories");
  $("#mobileRecordAmountLabel").textContent = type === "modifiers" ? "Price adjustment" : "Discount value";
  $("#mobileRecordDescriptionLabel").textContent = type === "modifiers" ? "Options / details" : type === "discounts" ? "Rule / notes" : "Description";
  $("#mobileRecordAmount").value = record ? Number(record.value ?? record.amount ?? 0) : "";
  $("#mobileRecordDiscountType").value = record?.type || "percent";
  $("#deleteMobileRecordBtn").classList.toggle("hidden", !record);
  $("#mobileRecordModal .modal-close").textContent = isPosAppMode ? "←" : "×";
  openModal($("#mobileRecordModal"));
  if (!isPosAppMode) setTimeout(() => $("#mobileRecordName").focus(), 20);
}

function saveMobileRecordForm() {
  const type = $("#mobileRecordType").value;
  const collection = mobileRecordCollection(type);
  const id = $("#mobileRecordId").value || crypto.randomUUID();
  const name = $("#mobileRecordName").value.trim();
  const label = mobileRecordLabel(type);
  if (!name) return showToast(`Enter a ${label} name`);
  const duplicate = collection.find((entry) => entry.id !== id && entry.name.trim().toLowerCase() === name.toLowerCase());
  if (duplicate) return showToast(`This ${label} already exists`);

  const existingIndex = collection.findIndex((entry) => entry.id === id);
  const baseRecord = {
    id,
    name,
    description: $("#mobileRecordDescription").value.trim(),
    status: $("#mobileRecordStatus").value,
  };

  let record = baseRecord;
  if (type === "modifiers") record = { ...baseRecord, amount: Number($("#mobileRecordAmount").value) || 0 };
  if (type === "discounts") record = { ...baseRecord, type: $("#mobileRecordDiscountType").value, value: Number($("#mobileRecordAmount").value) || 0 };

  touchRecord(record);
  if (existingIndex >= 0) collection[existingIndex] = record;
  else collection.unshift(record);

  if (type === "categories") {
    const oldName = $("#mobileRecordOldName").value;
    if (oldName && oldName !== name) {
      state.products.forEach((product) => {
        if (product.category === oldName) touchRecord(Object.assign(product, { category: name }));
      });
      if (state.activeCategory === oldName) state.activeCategory = name;
      if (state.mobileCatalogCategory === oldName) state.mobileCatalogCategory = name;
      if (state.mobileInventoryCategory === oldName) state.mobileInventoryCategory = name;
    }
  }

  closeModal($("#mobileRecordModal"));
  markStoreSyncDirty();
  renderAll();
  showToast(`${label.charAt(0).toUpperCase() + label.slice(1)} ${existingIndex >= 0 ? "updated" : "added"}`);
}

function deleteMobileRecord() {
  const type = $("#mobileRecordType").value;
  const id = $("#mobileRecordId").value;
  const collection = mobileRecordCollection(type);
  const record = collection.find((entry) => entry.id === id);
  if (!record || !window.confirm(`Delete "${record.name}"?`)) return;
  if (type === "categories" && state.products.some((product) => product.category === record.name)) {
    showToast("Move items out of this category before deleting it");
    return;
  }
  if (type === "categories") state.categories = state.categories.filter((entry) => entry.id !== id);
  if (type === "modifiers") state.modifiers = state.modifiers.filter((entry) => entry.id !== id);
  if (type === "discounts") state.discountPresets = state.discountPresets.filter((entry) => entry.id !== id);
  rememberDeleted(type === "discounts" ? "discountPresets" : type, id);
  closeModal($("#mobileRecordModal"));
  markStoreSyncDirty();
  renderAll();
  showToast(`${mobileRecordLabel(type).charAt(0).toUpperCase() + mobileRecordLabel(type).slice(1)} deleted`);
}

function createReceipt(transaction) {
  $("#receiptContent").innerHTML = receiptMarkup(transaction);
}

function completeSale() {
  if (saleCompleting) return;
  const summary = totals();
  const cashTendered = Number($("#cashTendered").value) || 0;
  if (state.paymentMethod === "Cash" && cashTendered < summary.total) return showToast("Cash tendered is less than the total");
  const payments = state.paymentMethod === "Split" ? state.splitPayments.filter((payment) => payment.amount > 0) : [{ type: state.paymentMethod, amount: summary.total }];
  if (state.paymentMethod === "Split" && Math.abs(payments.reduce((sum, payment) => sum + payment.amount, 0) - summary.total) > 0.009) return showToast("Split payments must equal the sale total");
  saleCompleting = true;
  $("#completeSaleBtn").disabled = true;

  const transaction = {
    id: crypto.randomUUID(),
    number: 1001 + state.transactions.length,
    dateKey: todayKey(),
    createdAt: new Date().toISOString(),
    dateLabel: new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
    items: structuredClone(state.cart),
    customer: state.customer ? { ...state.customer } : null,
    paymentMethod: state.paymentMethod === "Split" ? "Split" : state.paymentMethod,
    payments,
    cashier: currentUser?.name || "—",
    pos: state.settings.posName,
    shiftId: state.currentShift?.id || "",
    shiftNumber: state.currentShift?.number || "",
    discount: state.discount,
    fixedDiscount: state.fixedDiscount || 0,
    taxRate: state.settings.taxRate,
    ...summary,
    cashTendered: state.paymentMethod === "Cash" ? cashTendered : null,
    change: state.paymentMethod === "Cash" ? cashTendered - summary.total : null,
  };
  touchRecord(transaction);

  state.cart.forEach((item) => {
    if (item.custom) return;
    const product = state.products.find((entry) => entry.id === item.id);
    if (product && product.stock < 100) {
      product.stock -= item.quantity;
      touchRecord(product);
    }
  });
  state.transactions.push(transaction);
  const activeEmployee = state.employees.find((employee) => employee.status === "Clocked in");
  if (activeEmployee) {
    activeEmployee.sales = (activeEmployee.sales || 0) + summary.total;
    touchRecord(activeEmployee);
  }
  if (state.customer) {
    let customer = state.customer.id ? state.customers.find((entry) => entry.id === state.customer.id) : null;
    if (!customer) {
      customer = {
        id: crypto.randomUUID(),
        name: state.customer.name,
        contact: state.customer.contact || "",
        notes: state.customer.notes || "",
        visits: 0,
        points: 0,
        totalSpent: 0,
        lastVisit: "",
      };
      touchRecord(customer);
      state.customers.unshift(customer);
    }
    customer.visits += 1;
    customer.points += Math.floor(summary.total / state.settings.loyaltySpend);
    customer.totalSpent += summary.total;
    customer.lastVisit = new Intl.DateTimeFormat("en-TT", { dateStyle: "medium" }).format(new Date());
    touchRecord(customer);
  }
  state.cart = [];
  state.discount = 0;
  state.fixedDiscount = 0;
  state.customer = null;
  state.mobileTicketMode = false;
  state.mobileEditingItemId = null;
  state.splitPayments = [];
  $("#cashTendered").value = "";
  closeModal($("#checkoutModal"));
  markStoreSyncDirty();
  createReceipt(transaction);
  openModal($("#receiptModal"));
  renderAll();
  if (state.settings.autoPrint) setTimeout(() => window.print(), 250);
  saleCompleting = false;
  $("#completeSaleBtn").disabled = false;
}

function renderSplitPayments() {
  const summary = totals();
  const paid = state.splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
  $("#splitPaymentRows").innerHTML = state.splitPayments.map((payment, index) => `
    <div class="split-payment-row"><select data-split-type="${index}"><option ${payment.type === "Cash" ? "selected" : ""}>Cash</option><option ${payment.type === "Card" ? "selected" : ""}>Card</option><option ${payment.type === "Bank Transfer" ? "selected" : ""}>Bank Transfer</option><option ${payment.type === "Other" ? "selected" : ""}>Other</option></select><input data-split-amount="${index}" type="number" min="0" step="0.01" value="${payment.amount || ""}" placeholder="0.00" /><button data-remove-split="${index}">×</button></div>
  `).join("");
  $("#splitRemaining").textContent = `Remaining: ${money(summary.total - paid)}`;
}

function openCheckout() {
  if (!state.cart.length) return showToast("Add an item before charging");
  if (!state.currentShift) {
    setView("shifts");
    return showToast("Open a shift before starting sales");
  }
  const summary = totals();
  $("#paymentTotal").textContent = money(summary.total);
  $("#completeTotal").textContent = money(summary.total);
  $("#cashField").classList.toggle("hidden", state.paymentMethod !== "Cash");
  $("#splitPaymentPanel").classList.toggle("hidden", state.paymentMethod !== "Split");
  if (state.paymentMethod === "Split" && !state.splitPayments.length) {
    state.splitPayments = [{ type: "Cash", amount: 0 }, { type: "Card", amount: summary.total }];
  }
  renderSplitPayments();
  openModal($("#checkoutModal"));
}

function openTransactionReceipt(id) {
  const transaction = state.transactions.find((entry) => entry.id === id);
  if (!transaction) return;
  createReceipt(transaction);
  openModal($("#receiptModal"));
}

function reverseTransactionEffects(transaction) {
  if (!transaction || transaction.reversed) return;
  transaction.items.forEach((item) => {
    if (item.custom) return;
    const product = state.products.find((entry) => entry.id === item.id);
    if (product && product.stock < 100) {
      product.stock += item.quantity;
      touchRecord(product);
    }
  });
  if (transaction.customer?.id) {
    const customer = state.customers.find((entry) => entry.id === transaction.customer.id);
    if (customer) {
      customer.totalSpent = Math.max(0, customer.totalSpent - transaction.total);
      customer.points = Math.max(0, customer.points - Math.floor(transaction.total / state.settings.loyaltySpend));
      touchRecord(customer);
    }
  }
  const employee = state.employees.find((entry) => entry.name === transaction.cashier);
  if (employee) {
    employee.sales = Math.max(0, (employee.sales || 0) - (Number(transaction.total) || 0));
    touchRecord(employee);
  }
  transaction.reversed = true;
}

function refundTransaction(id) {
  const transaction = state.transactions.find((entry) => entry.id === id);
  if (!transaction || transaction.refunded || transaction.cancelled || !window.confirm(`Refund the full amount of receipt #${transaction.number}?`)) return;
  transaction.refunded = true;
  transaction.refundDate = new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  transaction.refundedBy = currentUser?.name || "—";
  reverseTransactionEffects(transaction);
  touchRecord(transaction);
  saveState();
  markStoreSyncDirty();
  renderAll();
  showToast(`Receipt #${transaction.number} refunded`);
}

function cancelTransaction(id) {
  const transaction = state.transactions.find((entry) => entry.id === id);
  if (!transaction || transaction.refunded || transaction.cancelled) return;
  if (!window.confirm(`Cancel receipt #${transaction.number}? This will remove it from active sales reports and return item stock.`)) return;
  transaction.cancelled = true;
  transaction.cancelDate = new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
  transaction.cancelledBy = currentUser?.name || "—";
  reverseTransactionEffects(transaction);
  touchRecord(transaction);
  saveState();
  markStoreSyncDirty();
  renderAll();
  showToast(`Receipt #${transaction.number} cancelled`);
}

function openShiftForm(mode) {
  $("#shiftForm").dataset.mode = mode;
  $("#shiftModalTitle").textContent = mode === "open" ? "Open shift" : "Close shift";
  $("#shiftAmountLabel").textContent = mode === "open" ? "Opening cash" : "Actual cash in drawer";
  $("#shiftSubmitBtn").textContent = mode === "open" ? "Open shift" : "Close shift";
  $("#shiftAmount").value = mode === "close" && currentUser?.role !== "Sales Associate" ? expectedCash().toFixed(2) : "";
  $("#shiftNote").value = "";
  const nextNumber = `SHIFT-${String(state.shiftHistory.length + 1).padStart(4, "0")}`;
  $("#shiftOpenDetails").innerHTML = mode === "open"
    ? `<div><strong>Shift number</strong><span>${nextNumber}</span></div><div><strong>Employee</strong><span>${escapeHtml(currentUser?.name || "—")}</span></div><div><strong>Date / time</strong><span>${escapeHtml(new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date()))}</span></div><div><strong>Cash drawer</strong><span>Main Cash Drawer</span></div>`
    : `<div><strong>Shift number</strong><span>${escapeHtml(state.currentShift?.number || "—")}</span></div><div><strong>Expected cash</strong><span>${money(expectedCash())}</span></div>`;
  openModal($("#shiftModal"));
}

function resetDemo() {
  if (!window.confirm("Reset products, sales, and the current order to the original demo data?")) return;
  state.products = structuredClone(defaultProducts).map(normalizeProduct);
  state.customers = structuredClone(defaultCustomers);
  state.transactions = [];
  state.openTickets = [];
  state.currentShift = null;
  state.shiftHistory = [];
  state.employees = normalizeEmployees(structuredClone(defaultEmployees));
  state.settings = normalizeSettings();
  state.workflowRecords = structuredClone(defaultWorkflowRecords);
  state.categories = structuredClone(defaultCategories);
  state.modifiers = structuredClone(defaultModifiers);
  state.discountPresets = structuredClone(defaultMobileDiscountPresets);
  state.cart = [];
  state.discount = 0;
  state.fixedDiscount = 0;
  state.customer = null;
  state.favoriteProductIds = [];
  state.mobileCatalogMode = "all";
  state.mobileCatalogCategory = "";
  state.mobileInventoryMode = "items";
  state.mobileInventoryCategory = "All";
  state.mobileTicketMode = false;
  state.mobileEditingItemId = null;
  saveState();
  renderAll();
  showToast("Demo data reset");
}

function bindEvents() {
  $$("[data-view]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.navGroup) state.expandedNavGroup = state.expandedNavGroup === button.dataset.navGroup ? "" : button.dataset.navGroup;
    setView(button.dataset.view);
  }));
  $$("[data-report-nav]").forEach((button) => button.addEventListener("click", () => {
    openReport(button.textContent.trim());
  }));
  $$(".workspace-btn").forEach((button) => button.addEventListener("click", () => setWorkspace(button.dataset.workspace)));
  $$("[data-go-register]").forEach((button) => button.addEventListener("click", () => setWorkspace("pos", "sell")));
  $$("[data-backoffice-view]").forEach((button) => button.addEventListener("click", () => setWorkspace("backoffice", button.dataset.backofficeView)));
  $$("[data-report-link]").forEach((button) => button.addEventListener("click", () => openReport(button.dataset.reportLink || button.textContent.trim())));
  $$("[data-module]").forEach((button) => button.addEventListener("click", () => openWorkflow(button.dataset.module || button.textContent.trim())));
  $("#menuBtn").addEventListener("click", () => {
    if (isPosAppMode && state.activeView === "settings" && state.posSettingsPage !== "menu") {
      state.posSettingsPage = "menu";
      renderPosSettings();
      return;
    }
    if (isPosAppMode && state.activeView === "products") {
      setView("sell");
      return;
    }
    if (isPosAppMode && state.activeView === "sell" && state.mobileTicketMode) {
      state.mobileTicketMode = false;
      state.mobileEditingItemId = null;
      renderProducts();
      renderCart();
      return;
    }
    $("#sidebar").classList.toggle("open");
    document.body.classList.toggle("mobile-nav-open", $("#sidebar").classList.contains("open"));
  });
  $("#pageTitle").addEventListener("click", () => {
    if (!isPosAppMode || state.activeView !== "products") return;
    $("#mobileProductCategoryMenu").classList.toggle("hidden");
  });
  $("#mobileNavBackdrop").addEventListener("click", () => {
    $("#sidebar").classList.remove("open");
    document.body.classList.remove("mobile-nav-open");
  });
  $("#installHelpBtn").addEventListener("click", () => {
    window.alert("Curtain House is now web-only.\n\nUse Back Office, Web-POS, and Online Catalog from the website.");
  });
  $("#supportBtn").addEventListener("click", () => {
    window.alert("Curtain House POS support:\n\nFor now this demo keeps support inside the app. A live support email or WhatsApp number can be connected next.");
  });
  $("#mobileSettingsLogoutBtn").addEventListener("click", logoutUser);
  $("#posSettingsMenu").addEventListener("click", (event) => {
    const button = event.target.closest("[data-pos-settings-page]");
    if (!button) return;
    state.posSettingsPage = button.dataset.posSettingsPage;
    renderPosSettings();
  });
  $("#posSettingsBackBtn").addEventListener("click", () => {
    state.posSettingsPage = "menu";
    renderPosSettings();
  });
  $("#posSettingsDetailBody").addEventListener("submit", savePosSettingsPage);
  $("#catalogBusinessForm").addEventListener("submit", saveCatalogBusinessInfo);
  $("#catalogBusinessWhatsapp").addEventListener("change", (event) => {
    updateCatalogSetting({ catalogWhatsapp: event.target.value.trim() || state.settings.phone || "" }, "WhatsApp number updated");
    syncStoreNow({ silent: true });
  });
  $("#catalogAboutStore").addEventListener("input", (event) => {
    $("#catalogAboutCount").textContent = event.target.value.length;
  });
  $("#catalogLogoInput").addEventListener("change", (event) => readImageFile(event.target.files[0], (data) => updateCatalogSetting({ logo: data }, "Catalog logo updated")));
  $("#catalogRemoveLogoBtn").addEventListener("click", () => updateCatalogSetting({ logo: "" }, "Catalog logo removed"));
  $("#copyCatalogLinkBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(catalogPublicUrl());
      showToast("Catalog link copied");
    } catch {
      window.prompt("Copy catalog link", catalogPublicUrl());
    }
  });
  $("#openCatalogPreviewBtn").addEventListener("click", () => openExternalUrl(catalogPublicUrl()));
  $("#previewCatalogInlineBtn").addEventListener("click", () => openExternalUrl(catalogPublicUrl()));
  $("#refreshCatalogPreviewBtn").addEventListener("click", renderOnlineCatalog);
  $("#catalogPublishedToggle").addEventListener("change", (event) => updateCatalogSetting({ catalogPublished: event.target.checked }, event.target.checked ? "Catalog published" : "Catalog hidden from customers"));
  $("#catalogAcceptOrdersToggle").addEventListener("change", (event) => updateCatalogSetting({ catalogAcceptOrders: event.target.checked }));
  $("#catalogWhatsappToggle").addEventListener("change", (event) => updateCatalogSetting({ catalogWhatsappOrders: event.target.checked }));
  $("#catalogPostOrderMessage").addEventListener("input", (event) => updateCatalogSetting({ catalogPostOrderMessage: event.target.value }, ""));
  $("#catalogColorChoices").addEventListener("click", (event) => {
    const button = event.target.closest("[data-catalog-color]");
    if (!button) return;
    updateCatalogSetting({ catalogMainColor: button.dataset.catalogColor }, "Catalog color updated");
  });
  $$("[data-catalog-version]").forEach((button) => button.addEventListener("click", () => updateCatalogSetting({ catalogVersion: button.dataset.catalogVersion }, "Catalog version updated")));
  $$("[name='catalogDisplayMode']").forEach((input) => input.addEventListener("change", () => updateCatalogSetting({ catalogDisplayMode: input.value }, "Catalog display updated")));
  $$("[name='catalogOutOfStock']").forEach((input) => input.addEventListener("change", () => updateCatalogSetting({ catalogOutOfStock: input.value }, "Out-of-stock setting updated")));
  $("#catalogBannerInput").addEventListener("change", (event) => readImageFile(event.target.files[0], (data) => updateCatalogSetting({ catalogBanner: data }, "Catalog banner updated")));
  $("#deleteCatalogBannerBtn").addEventListener("click", () => updateCatalogSetting({ catalogBanner: "" }, "Catalog banner removed"));
  $$(".catalog-settings-row").forEach((button) => button.addEventListener("click", () => showToast(`${button.querySelector("strong")?.textContent || "Catalog"} setup can be connected next`)));
  $("#publicCatalogSearch").addEventListener("input", (event) => {
    state.publicCatalogSearch = event.target.value;
    renderPublicCatalog();
  });
  $("#publicCatalogCategories").addEventListener("click", (event) => {
    const button = event.target.closest("[data-public-category]");
    if (!button) return;
    state.publicCatalogCategory = button.dataset.publicCategory;
    renderPublicCatalog();
  });
  $("#publicCatalogProducts").addEventListener("click", (event) => {
    const button = event.target.closest("[data-public-add-product]");
    if (button) addPublicCatalogProduct(button.dataset.publicAddProduct);
  });
  $("#publicOrderItems").addEventListener("click", (event) => {
    const button = event.target.closest("[data-public-cart-action]");
    if (button) updatePublicCatalogCart(button.dataset.productId, button.dataset.publicCartAction);
  });
  $("#publicOrderForm").addEventListener("submit", submitPublicCatalogOrder);
  $("#openCatalogFromOrdersBtn").addEventListener("click", () => openExternalUrl(catalogPublicUrl()));
  $("#orderSearch").addEventListener("input", (event) => {
    state.orderSearch = event.target.value;
    renderOnlineOrders();
  });
  $("#orderStatusFilter").addEventListener("change", (event) => {
    state.orderStatusFilter = event.target.value;
    renderOnlineOrders();
  });
  $("#ordersTableBody").addEventListener("click", (event) => {
    const row = event.target.closest("[data-order-row]");
    if (!row) return;
    state.selectedOnlineOrderId = row.dataset.orderRow;
    renderOnlineOrders();
  });
  $("#onlineOrderDetail").addEventListener("change", (event) => {
    const select = event.target.closest("[data-order-status]");
    if (select) setOnlineOrderStatus(select.dataset.orderStatus, select.value);
  });
  $("#onlineOrderDetail").addEventListener("click", async (event) => {
    const finishButton = event.target.closest("[data-finish-order]");
    const copyButton = event.target.closest("[data-copy-order-link]");
    const printButton = event.target.closest("[data-print-online-order]");
    if (finishButton) return finishOnlineOrder(finishButton.dataset.finishOrder);
    if (copyButton) {
      const order = state.onlineOrders.find((entry) => entry.id === copyButton.dataset.copyOrderLink);
      if (!order) return;
      try {
        await navigator.clipboard.writeText(onlineOrderLink(order));
        showToast("Order link copied");
      } catch {
        window.prompt("Copy order link", onlineOrderLink(order));
      }
    }
    if (printButton) window.print();
  });
  $("#scanBarcodeBtn").addEventListener("click", startBarcodeScanner);
  $("#mobileProductBarcodeBtn").addEventListener("click", () => startBarcodeScanner("inventory-find"));
  $("#mobileProductSearchBtn").addEventListener("click", () => {
    state.mobileProductSearchOpen = true;
    $("#mobileProductCategoryMenu").classList.add("hidden");
    renderInventory();
    setTimeout(() => $("#mobileProductSearchInput").focus(), 20);
  });
  $("#mobileProductSearchCloseBtn").addEventListener("click", () => {
    state.mobileProductSearchOpen = false;
    state.productSearch = "";
    $("#productSearch").value = "";
    $("#mobileProductSearchInput").value = "";
    renderInventory();
  });
  $("#mobileProductSearchInput").addEventListener("input", (event) => {
    state.productSearch = event.target.value;
    $("#productSearch").value = event.target.value;
    renderInventory();
  });
  $("#mobileProductCategoryMenu").addEventListener("click", (event) => {
    const button = event.target.closest("[data-mobile-product-category]");
    if (!button) return;
    state.mobileInventoryMode = button.dataset.mobileProductMode || "items";
    state.mobileInventoryCategory = button.dataset.mobileProductCategory || "All";
    $("#mobileProductCategoryMenu").classList.add("hidden");
    renderInventory();
  });
  $("#mobileAddItemBtn").addEventListener("click", () => {
    if (state.mobileInventoryMode === "items") openProductForm();
    else openMobileRecordForm(state.mobileInventoryMode);
  });
  $("#mobileProductList").addEventListener("click", (event) => {
    const category = event.target.closest("[data-mobile-edit-category]");
    const modifier = event.target.closest("[data-mobile-edit-modifier]");
    const discount = event.target.closest("[data-mobile-edit-discount]");
    if (category) return openMobileRecordForm("categories", state.categories.find((entry) => entry.id === category.dataset.mobileEditCategory));
    if (modifier) return openMobileRecordForm("modifiers", state.modifiers.find((entry) => entry.id === modifier.dataset.mobileEditModifier));
    if (discount) return openMobileRecordForm("discounts", state.discountPresets.find((entry) => entry.id === discount.dataset.mobileEditDiscount));
    const item = event.target.closest("[data-mobile-edit-product]");
    if (!item) return;
    const product = state.products.find((entry) => entry.id === item.dataset.mobileEditProduct);
    if (product) openProductForm(product);
  });
  $("#mobileBarcodeBtn").addEventListener("click", startBarcodeScanner);
  $("#mobileAddCustomerBtn").addEventListener("click", openCustomerForOrder);
  $("#mobileCatalogSelectBtn").addEventListener("click", () => {
    $("#mobileCatalogMenu").classList.toggle("hidden");
    $("#mobileMoreMenu").classList.add("hidden");
  });
  $("#mobileCatalogMenu").addEventListener("click", (event) => {
    const button = event.target.closest("[data-mobile-catalog-mode]");
    if (!button) return;
    setMobileCatalogMode(button.dataset.mobileCatalogMode, button.dataset.mobileCatalogCategory || "");
  });
  $("#mobileSearchToggleBtn").addEventListener("click", () => {
    state.mobileSearchOpen = true;
    $("#mobileCatalogMenu").classList.add("hidden");
    renderProducts();
    setTimeout(() => $("#mobileSalesSearch").focus(), 20);
  });
  $("#mobileSearchCloseBtn").addEventListener("click", () => {
    state.mobileSearchOpen = false;
    state.search = "";
    $("#mobileSalesSearch").value = "";
    $("#globalSearch").value = "";
    renderProducts();
  });
  $("#mobileSalesSearch").addEventListener("input", (event) => {
    state.search = event.target.value;
    $("#globalSearch").value = event.target.value;
    renderProducts();
  });
  $("#mobileSalesSearch").addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    quickAddSearchItem(event.target.value);
  });
  $("#mobileMoreBtn").addEventListener("click", () => {
    if (state.activeView !== "sell") return;
    $("#mobileMoreMenu").classList.toggle("hidden");
    $("#mobileCatalogMenu").classList.add("hidden");
  });
  $("#mobileMoreMenu").addEventListener("click", (event) => {
    const action = event.target.closest("[data-mobile-menu-action]")?.dataset.mobileMenuAction;
    if (!action) return;
    $("#mobileMoreMenu").classList.add("hidden");
    if (action === "clear") return clearCurrentTicket();
    if (action === "print") return showToast("Print bill is ready for printer setup");
    if (action === "edit") return openSaveTicketForm();
    if (action === "drawer") {
      if (!state.currentShift) return showToast("Open a shift first");
      $("#cashMovementForm").reset();
      return openModal($("#cashMovementModal"));
    }
    if (action === "sync") {
      saveState();
      pullEmployeeSync();
      return;
    }
    showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} ticket is ready for the next workflow`);
  });
  $("#manualBarcodeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    handleScannedBarcode($("#manualBarcodeInput").value);
  });
  $("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = $("#loginUsername").value.trim().toLowerCase();
    const password = $("#loginPassword").value;
    if (isPosRuntime) {
      if (username !== posDeviceAccount.username || password !== posDeviceAccount.password) {
        $("#loginError").textContent = "Incorrect username or password.";
        $("#loginError").classList.remove("hidden");
        return;
      }
      $("#loginError").classList.add("hidden");
      localStorage.setItem(DEVICE_ACTIVATION_KEY, "true");
      await pullEmployeeSync({ silent: true });
      showPinScreen();
      showToast("Web-POS activated. Enter employee PIN.");
      return;
    }
    const account = loginAccounts[username];
    if (!account || account.password !== password) {
      $("#loginError").textContent = "Incorrect username or password.";
      $("#loginError").classList.remove("hidden");
      return;
    }
    if (isBackOfficeWebsite && !["Admin", "Manager"].includes(account.role)) {
      $("#loginError").textContent = backOfficeLoginMessage();
      $("#loginError").classList.remove("hidden");
      return;
    }
    $("#loginError").classList.add("hidden");
    loginUser(account);
  });
  $("#pinKeypad").addEventListener("click", (event) => {
    const digit = event.target.closest("[data-pin-digit]");
    const action = event.target.closest("[data-pin-action]");
    if (digit && state.pinEntry.length < 4) state.pinEntry += digit.dataset.pinDigit;
    if (action?.dataset.pinAction === "clear") state.pinEntry = "";
    if (action?.dataset.pinAction === "back") state.pinEntry = state.pinEntry.slice(0, -1);
    $("#pinError").classList.add("hidden");
    renderPinDots();
    if (state.pinEntry.length === 4) setTimeout(submitPin, 100);
  });
  $("#usePasswordLoginBtn").addEventListener("click", showPasswordLogin);
  $("#logoutBtn").addEventListener("click", logoutUser);
  $("#resetBtn").addEventListener("click", resetDemo);
  $("#globalSearch").addEventListener("input", (event) => {
    if (state.workspace === "pos") {
      state.search = event.target.value;
      if (state.activeView !== "sell") setView("sell");
      renderProducts();
    } else {
      state.productSearch = event.target.value;
      if (state.activeView !== "products") setView("products");
      $("#productSearch").value = event.target.value;
      renderInventory();
    }
  });
  $("#globalSearch").addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || state.workspace !== "pos") return;
    event.preventDefault();
    quickAddSearchItem(event.target.value);
  });
  $("#productSearch").addEventListener("input", (event) => {
    state.productSearch = event.target.value;
    renderInventory();
  });
  $("#customerSearch").addEventListener("input", (event) => {
    state.customerSearch = event.target.value;
    renderCustomers();
  });
  $("#receiptSearch").addEventListener("input", (event) => {
    state.receiptSearch = event.target.value;
    renderReceipts();
  });
  $("#categoryTabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.activeCategory = button.dataset.category;
    state.mobileCatalogMode = state.activeCategory === "All" ? "all" : "category";
    state.mobileCatalogCategory = state.activeCategory === "All" ? "" : state.activeCategory;
    renderCategories();
    renderProducts();
  });
  $$("[data-catalog-view]").forEach((button) => button.addEventListener("click", () => {
    state.catalogView = button.dataset.catalogView;
    $$("[data-catalog-view]").forEach((viewButton) => viewButton.classList.toggle("active", viewButton === button));
    renderProducts();
  }));
  $("#productGrid").addEventListener("click", (event) => {
    const discountPreset = event.target.closest("[data-discount-preset]");
    if (discountPreset) {
      applyMobileDiscount(discountPreset.dataset.discountPreset);
      return;
    }
    if (event.target.closest("[data-mobile-edit-favorites]")) {
      state.favoriteProductIds = state.products.slice(0, 6).map((product) => product.id);
      markStoreSyncDirty();
      renderProducts();
      showToast("Favorites added for demo");
      return;
    }
    const card = event.target.closest("[data-product-id]");
    if (!card) return;
    const product = state.products.find((entry) => entry.id === card.dataset.productId);
    if (product) addToCart(product);
  });
  $("#mobileTicketView").addEventListener("click", (event) => {
    const editLine = event.target.closest("[data-mobile-edit-line]");
    const qtyAction = event.target.closest("[data-mobile-qty-action]");
    if (editLine) {
      state.mobileEditingItemId = editLine.dataset.mobileEditLine;
      renderCart();
      return;
    }
    if (qtyAction) {
      const action = qtyAction.dataset.mobileQtyAction;
      if (action === "cancel" || action === "save") {
        state.mobileEditingItemId = null;
        renderCart();
        return;
      }
      updateCartItem(qtyAction.dataset.itemId, action === "plus" ? 1 : -1);
      return;
    }
    if (event.target.closest("[data-mobile-save-ticket]")) {
      openSaveTicketForm();
      return;
    }
    if (event.target.closest("[data-mobile-charge]")) openCheckout();
  });
  $("#cartItems").addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    updateCartItem(button.dataset.itemId, button.dataset.cartAction === "plus" ? 1 : button.dataset.cartAction === "remove" ? "remove" : -1);
  });
  $("#clearCartBtn").addEventListener("click", () => {
    clearCurrentTicket();
  });
  $("#saveTicketBtn").addEventListener("click", () => {
    openSaveTicketForm();
  });
  $("#saveTicketForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.openTickets.push(touchRecord({
      id: crypto.randomUUID(),
      name: $("#ticketName").value.trim(),
      cart: structuredClone(state.cart),
      discount: state.discount,
      fixedDiscount: state.fixedDiscount,
      customer: state.customer ? { ...state.customer } : null,
      total: totals().total,
      createdAt: new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
    }));
    state.cart = [];
    state.discount = 0;
    state.fixedDiscount = 0;
    state.customer = null;
    state.mobileTicketMode = false;
    state.mobileEditingItemId = null;
    closeModal($("#saveTicketModal"));
    markStoreSyncDirty();
    renderAll();
    showToast("Open ticket saved");
  });
  $("#openTicketsBtn").addEventListener("click", () => {
    renderTickets();
    openModal($("#ticketsModal"));
  });
  $("#ticketList").addEventListener("click", (event) => {
    const loadButton = event.target.closest("[data-load-ticket]");
    const deleteButton = event.target.closest("[data-delete-ticket]");
    if (loadButton) {
      const ticket = state.openTickets.find((entry) => entry.id === loadButton.dataset.loadTicket);
      if (!ticket) return;
      if (state.cart.length && !window.confirm("Replace the current order with this open ticket?")) return;
      state.cart = structuredClone(ticket.cart);
      state.discount = ticket.discount || 0;
      state.fixedDiscount = ticket.fixedDiscount || 0;
      state.customer = ticket.customer ? { ...ticket.customer } : null;
      state.mobileTicketMode = isPosAppMode;
      state.mobileEditingItemId = null;
      state.openTickets = state.openTickets.filter((entry) => entry.id !== ticket.id);
      rememberDeleted("openTickets", ticket.id);
      closeModal($("#ticketsModal"));
      markStoreSyncDirty();
      renderAll();
      showToast("Open ticket loaded");
    }
    if (deleteButton) {
      rememberDeleted("openTickets", deleteButton.dataset.deleteTicket);
      state.openTickets = state.openTickets.filter((entry) => entry.id !== deleteButton.dataset.deleteTicket);
      renderTickets();
      saveState();
      markStoreSyncDirty();
    }
  });
  $("#checkoutBtn").addEventListener("click", openCheckout);
  $("#completeSaleBtn").addEventListener("click", completeSale);
  $("#cashTendered").addEventListener("input", (event) => {
    $("#changeDue").textContent = `Change due: ${money(Math.max(0, Number(event.target.value || 0) - totals().total))}`;
  });
  $$(".payment-method").forEach((button) => button.addEventListener("click", () => {
    state.paymentMethod = button.dataset.method;
    $$(".payment-method").forEach((method) => method.classList.toggle("active", method === button));
    $("#cashField").classList.toggle("hidden", state.paymentMethod !== "Cash");
    $("#splitPaymentPanel").classList.toggle("hidden", state.paymentMethod !== "Split");
    if (state.paymentMethod === "Split" && !state.splitPayments.length) state.splitPayments = [{ type: "Cash", amount: 0 }, { type: "Card", amount: totals().total }];
    renderSplitPayments();
    if (state.paymentMethod === "Cash") setTimeout(() => $("#cashTendered").focus(), 20);
  }));
  $("#addSplitPaymentBtn").addEventListener("click", () => {
    state.splitPayments.push({ type: "Other", amount: 0 });
    renderSplitPayments();
  });
  $("#splitPaymentRows").addEventListener("input", (event) => {
    const amount = event.target.closest("[data-split-amount]");
    const type = event.target.closest("[data-split-type]");
    if (amount) state.splitPayments[Number(amount.dataset.splitAmount)].amount = Number(amount.value) || 0;
    if (type) state.splitPayments[Number(type.dataset.splitType)].type = type.value;
    renderSplitPayments();
  });
  $("#splitPaymentRows").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-split]");
    if (!button) return;
    state.splitPayments.splice(Number(button.dataset.removeSplit), 1);
    renderSplitPayments();
  });
  $("#printReceiptBtn").addEventListener("click", () => window.print());

  $("#addProductBtn").addEventListener("click", () => openProductForm());
  $("#exportProductsBtn").addEventListener("click", exportProductsCsv);
  $("#importProductsBtn").addEventListener("click", () => $("#productCsvInput").click());
  $("#productCsvInput").addEventListener("change", (event) => {
    if (event.target.files[0]) importProductsCsv(event.target.files[0]);
    event.target.value = "";
  });
  $("#productPhotoInput").addEventListener("change", (event) => readImageFile(event.target.files[0], (data) => {
    $("#productPhotoData").value = data;
    $("#productPhotoPreview").innerHTML = `<img src="${data}" alt="Product photo" />`;
  }));
  $("#productCameraInput").addEventListener("change", (event) => readImageFile(event.target.files[0], (data) => {
    $("#productPhotoData").value = data;
    $("#productPhotoPreview").innerHTML = `<img src="${data}" alt="Product photo" />`;
  }));
  $("#chooseProductPhotoBtn").addEventListener("click", () => $("#productPhotoInput").click());
  $("#takeProductPhotoBtn").addEventListener("click", () => $("#productCameraInput").click());
  $("#productBarcodeScanBtn").addEventListener("click", () => startBarcodeScanner("product-form"));
  $("#removeProductPhotoBtn").addEventListener("click", () => {
    $("#productPhotoData").value = "";
    $("#productPhotoPreview").innerHTML = `<span>No photo uploaded</span>`;
  });
  $("#deleteProductBtn").addEventListener("click", () => {
    const product = state.products.find((entry) => entry.id === $("#productId").value);
    if (!product || !window.confirm(`Delete "${product.name}" from inventory?`)) return;
    state.products = state.products.filter((entry) => entry.id !== product.id);
    state.cart = state.cart.filter((entry) => entry.id !== product.id);
    state.favoriteProductIds = state.favoriteProductIds.filter((id) => id !== product.id);
    rememberDeleted("products", product.id);
    closeModal($("#productModal"));
    markStoreSyncDirty();
    renderAll();
    showToast("Item deleted");
  });
  $("#mobileRecordForm").addEventListener("submit", (event) => {
    event.preventDefault();
    saveMobileRecordForm();
  });
  $("#deleteMobileRecordBtn").addEventListener("click", deleteMobileRecord);
  $("#productTableBody").addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-product]");
    const adjustButton = event.target.closest("[data-adjust-product]");
    const deleteButton = event.target.closest("[data-delete-product]");
    if (editButton) openProductForm(state.products.find((product) => product.id === editButton.dataset.editProduct));
    if (adjustButton) {
      const product = state.products.find((entry) => entry.id === adjustButton.dataset.adjustProduct);
      if (!product || product.stock > 100) return;
      $("#stockAdjustmentForm").reset();
      $("#stockAdjustmentProductId").value = product.id;
      openModal($("#stockAdjustmentModal"));
    }
    if (deleteButton) {
      const product = state.products.find((entry) => entry.id === deleteButton.dataset.deleteProduct);
      if (!product || !window.confirm(`Delete "${product.name}" from inventory?`)) return;
      state.products = state.products.filter((entry) => entry.id !== product.id);
      state.cart = state.cart.filter((entry) => entry.id !== product.id);
      state.favoriteProductIds = state.favoriteProductIds.filter((id) => id !== product.id);
      rememberDeleted("products", product.id);
      markStoreSyncDirty();
      renderAll();
      showToast("Product deleted");
    }
  });
  $("#productTableBody").addEventListener("change", (event) => {
    const toggle = event.target.closest("[data-toggle-catalog-product]");
    if (!toggle) return;
    const product = state.products.find((entry) => entry.id === toggle.dataset.toggleCatalogProduct);
    if (!product) return;
    product.catalogVisible = toggle.checked;
    touchRecord(product);
    markStoreSyncDirty();
    renderOnlineCatalog();
    renderPublicCatalog();
    showToast(toggle.checked ? "Item added to online catalog" : "Item hidden from online catalog");
  });
  $("#productForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = $("#productId").value || crypto.randomUUID();
    const product = {
      id,
      name: $("#productName").value.trim(),
      cost: Number($("#productCost").value),
      price: Number($("#productPrice").value),
      stock: Number($("#productStock").value),
      sku: $("#productSku").value.trim().toUpperCase(),
      barcode: $("#productBarcode").value.trim(),
      tax: Number($("#productTax").value),
      reorderLevel: Number($("#productReorderLevel").value),
      category: $("#productCategory").value,
      color: $("#productColor").value,
      catalogVisible: $("#productCatalogVisible").checked,
      photo: $("#productPhotoData").value,
      stockHistory: state.products.find((entry) => entry.id === id)?.stockHistory || [],
    };
    touchRecord(product);
    const index = state.products.findIndex((entry) => entry.id === id);
    if (index >= 0) state.products[index] = product;
    else state.products.unshift(product);
    closeModal($("#productModal"));
    markStoreSyncDirty();
    renderAll();
    showToast(index >= 0 ? "Product updated" : "Product added");
  });
  $("#stockAdjustmentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const product = state.products.find((entry) => entry.id === $("#stockAdjustmentProductId").value);
    if (!product) return;
    const quantity = Number($("#stockAdjustmentQuantity").value) * ($("#stockAdjustmentType").value === "add" ? 1 : -1);
    product.stock += quantity;
    product.stockHistory.push({ date: new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date()), user: currentUser?.name || "—", quantity, reason: $("#stockAdjustmentReason").value.trim() });
    touchRecord(product);
    closeModal($("#stockAdjustmentModal"));
    markStoreSyncDirty();
    renderAll();
    showToast("Stock adjustment saved");
  });

  $("#discountBtn").addEventListener("click", () => {
    $("#discountPercent").value = state.discount || "";
    openModal($("#discountModal"));
  });
  $("#discountForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.discount = Math.min(100, Math.max(0, Number($("#discountPercent").value) || 0));
    state.fixedDiscount = 0;
    closeModal($("#discountModal"));
    renderCart();
    showToast(state.discount ? `${state.discount}% discount applied` : "Discount removed");
  });
  $("#customerBtn").addEventListener("click", () => {
    openCustomerForOrder();
  });
  $("#addCustomerBtn").addEventListener("click", () => {
    state.customerMode = "directory";
    $("#existingCustomerSelect").value = "";
    $("#customerInput").value = "";
    $("#customerContact").value = "";
    $("#customerNotes").value = "";
    openModal($("#customerModal"));
  });
  $("#existingCustomerSelect").addEventListener("change", (event) => {
    const customer = state.customers.find((entry) => entry.id === event.target.value);
    $("#customerInput").value = customer?.name || "";
    $("#customerContact").value = customer?.contact || "";
    $("#customerNotes").value = customer?.notes || "";
  });
  $("#customerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const existing = state.customers.find((customer) =>
      customer.id === $("#existingCustomerSelect").value ||
      (customer.contact && customer.contact === $("#customerContact").value.trim()) ||
      customer.name.toLowerCase() === $("#customerInput").value.trim().toLowerCase()
    );
    const customer = existing || {
      id: crypto.randomUUID(),
      name: $("#customerInput").value.trim(),
      contact: $("#customerContact").value.trim(),
      notes: $("#customerNotes").value.trim(),
      visits: 0,
      points: 0,
      totalSpent: 0,
      lastVisit: "—",
    };
    touchRecord(customer);
    if (!existing) state.customers.unshift(customer);
    if (state.customerMode === "order") state.customer = { ...customer };
    closeModal($("#customerModal"));
    markStoreSyncDirty();
    renderAll();
    showToast(state.customerMode === "order" ? "Customer added to order" : "Customer saved");
  });
  $("#customItemBtn").addEventListener("click", () => openModal($("#customItemModal")));
  $("#customItemForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const custom = {
      id: crypto.randomUUID(),
      name: $("#customItemName").value.trim(),
      price: Number($("#customItemPrice").value),
      stock: 999,
      sku: "CUSTOM",
      category: "Services",
      color: "sand",
      custom: true,
    };
    addToCart(custom);
    event.target.reset();
    closeModal($("#customItemModal"));
  });
  $("#transactionList").addEventListener("click", (event) => {
    const item = event.target.closest("[data-receipt-id]");
    if (item) openTransactionReceipt(item.dataset.receiptId);
  });
  $("#reportTableBody").addEventListener("click", (event) => {
    const item = event.target.closest("[data-receipt-id]");
    const shift = event.target.closest("[data-shift-report-id]");
    if (item) openTransactionReceipt(item.dataset.receiptId);
    if (shift) openShiftDetail(shift.dataset.shiftReportId);
  });
  $("#reportPrintBtn").addEventListener("click", () => window.print());
  $("#receiptBrowserList").addEventListener("click", (event) => {
    const item = event.target.closest("[data-browse-receipt]");
    if (!item) return;
    state.selectedReceiptId = item.dataset.browseReceipt;
    renderReceipts();
  });
  $("#receiptDetailCard").addEventListener("click", (event) => {
    const refundButton = event.target.closest("[data-refund-receipt]");
    const printButton = event.target.closest("[data-detail-print]");
    const emailButton = event.target.closest("[data-email-receipt]");
    const whatsappButton = event.target.closest("[data-whatsapp-receipt]");
    const cancelButton = event.target.closest("[data-cancel-receipt]");
    if (refundButton) requestRefund(refundButton.dataset.refundReceipt);
    if (printButton) openTransactionReceipt(printButton.dataset.detailPrint);
    if (emailButton) shareReceipt(emailButton.dataset.emailReceipt, "email");
    if (whatsappButton) shareReceipt(whatsappButton.dataset.whatsappReceipt, "whatsapp");
    if (cancelButton) cancelTransaction(cancelButton.dataset.cancelReceipt);
  });
  $("#refundApprovalForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const account = loginAccounts[$("#approvalUsername").value.trim().toLowerCase()];
    if (!account || !["Admin", "Manager"].includes(account.role) || account.password !== $("#approvalPassword").value) return showToast("Manager approval details are incorrect");
    closeModal($("#refundApprovalModal"));
    refundTransaction(state.pendingRefundId);
    state.pendingRefundId = null;
  });
  $("#cashMovementBtn").addEventListener("click", () => {
    if (!state.currentShift) return showToast("Open a shift first");
    $("#cashMovementForm").reset();
    openModal($("#cashMovementModal"));
  });
  $("#cashMovementForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.currentShift) return;
    state.currentShift.movements.push(touchRecord({
      id: crypto.randomUUID(),
      type: $("#cashMovementType").value,
      amount: Number($("#cashMovementAmount").value),
      reason: $("#cashMovementReason").value.trim(),
      employee: currentUser?.name || "—",
      dateLabel: new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
    }));
    touchRecord(state.currentShift);
    closeModal($("#cashMovementModal"));
    markStoreSyncDirty();
    renderAll();
    showToast("Cash movement recorded");
  });
  $("#shiftHistoryList").addEventListener("click", (event) => {
    const row = event.target.closest("[data-shift-detail]");
    if (row) openShiftDetail(row.dataset.shiftDetail);
  });
  $("#shiftDetailContent").addEventListener("click", (event) => {
    const receipt = event.target.closest("[data-shift-receipt]");
    if (receipt) openTransactionReceipt(receipt.dataset.shiftReceipt);
  });
  $("#printShiftDetailBtn").addEventListener("click", () => window.print());
  $("#shiftHero").addEventListener("click", (event) => {
    if (event.target.closest("#openShiftBtn")) openShiftForm("open");
    if (event.target.closest("#mobileCashManagementBtn")) {
      if (!state.currentShift) return showToast("Open a shift first");
      $("#cashMovementForm").reset();
      openModal($("#cashMovementModal"));
    }
    if (event.target.closest("#closeShiftBtn")) openShiftForm("close");
  });
  $("#shiftForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const mode = event.target.dataset.mode;
    const amount = Number($("#shiftAmount").value);
    if (mode === "open") {
      state.currentShift = touchRecord({
        id: crypto.randomUUID(),
        number: `SHIFT-${String(state.shiftHistory.length + 1).padStart(4, "0")}`,
        employee: currentUser?.name || "—",
        drawer: "Main Cash Drawer",
        openedAt: new Date().toISOString(),
        openedLabel: new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
        openingCash: amount,
        note: $("#shiftNote").value.trim(),
        movements: [],
      });
    } else if (state.currentShift) {
      const expected = expectedCash();
      state.shiftHistory.push(touchRecord({
        ...state.currentShift,
        closedAt: new Date().toISOString(),
        closedLabel: new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
        actualCash: amount,
        expectedCash: expected,
        difference: amount - expected,
        transactions: shiftTransactions().length,
        closingNote: $("#shiftNote").value.trim(),
      }));
      state.currentShift = null;
    }
    closeModal($("#shiftModal"));
    markStoreSyncDirty();
    renderAll();
    showToast(mode === "open" ? "Shift opened" : "Shift closed");
    if (mode === "open") setView("sell");
  });
  $("#attentionList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-attention-view]");
    if (button) navigateToView(button.dataset.attentionView);
  });
  $("#workflowBackBtn").addEventListener("click", () => setView("dashboard"));
  $("#addWorkflowRecordBtn").addEventListener("click", () => openWorkflowForm());
  $("#exportWorkflowBtn").addEventListener("click", exportWorkflowCsv);
  $("#workflowSearch").addEventListener("input", (event) => {
    state.workflowSearch = event.target.value;
    renderWorkflow();
  });
  $("#workflowStatusFilter").addEventListener("change", renderWorkflow);
  $("#workflowList").addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit-workflow]");
    const remove = event.target.closest("[data-delete-workflow]");
    const advance = event.target.closest("[data-advance-workflow]");
    const linked = event.target.closest("[data-linked-workflow]");
    const print = event.target.closest("[data-print-workflow]");
    const records = workflowRecords();
    const id = edit?.dataset.editWorkflow || remove?.dataset.deleteWorkflow || advance?.dataset.advanceWorkflow || linked?.dataset.workflowId || print?.dataset.printWorkflow;
    const record = records.find((entry) => entry.id === id);
    if (!record) return;
    if (edit) openWorkflowForm(record);
    if (remove && window.confirm(`Delete this ${state.activeModule} record?`)) {
      state.workflowRecords[state.activeModule] = records.filter((entry) => entry.id !== record.id);
      rememberDeleted("workflowRecords", record.id);
      markStoreSyncDirty();
      renderWorkflow();
      showToast("Workflow record deleted");
    }
    if (advance) {
      const statuses = workflowDefinition().statuses;
      record.status = statuses[Math.min(statuses.length - 1, statuses.indexOf(record.status) + 1)];
      record.updatedAt = new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
      touchRecord(record);
      markStoreSyncDirty();
      renderWorkflow();
      showToast(`Status changed to ${record.status}`);
    }
    if (linked) createLinkedWorkflow(linked.dataset.linkedWorkflow, record);
    if (print) {
      const labelWindow = window.open("", "_blank", "width=720,height=600");
      const quantity = Math.max(1, Math.min(100, Number(record.amount) || 1));
      labelWindow.document.write(`<title>${escapeHtml(record.reference || record.name)} labels</title><style>body{font-family:Arial;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:20px}.label{border:1px solid #222;padding:14px;text-align:center}.bars{font-family:monospace;letter-spacing:2px;font-size:20px}</style>${Array.from({ length: quantity }, () => `<div class="label"><strong>${escapeHtml(record.name)}</strong><div class="bars">|||| ||| || ||||</div><small>${escapeHtml(record.reference || "CURTAIN-HOUSE")}</small></div>`).join("")}`);
      labelWindow.document.close();
      labelWindow.print();
      record.status = "Printed";
      record.updatedAt = new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date());
      touchRecord(record);
      markStoreSyncDirty();
      renderWorkflow();
    }
  });
  $("#workflowForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target).entries());
    if (values.amount !== undefined && values.amount !== "") values.amount = Number(values.amount);
    const records = workflowRecords();
    const existing = records.find((record) => record.id === state.editingWorkflowId);
    const next = { ...existing, ...values, id: existing?.id || crypto.randomUUID(), updatedAt: new Intl.DateTimeFormat("en-TT", { dateStyle: "medium", timeStyle: "short" }).format(new Date()) };
    touchRecord(next);
    if (existing) Object.assign(existing, next);
    else state.workflowRecords[state.activeModule].unshift(next);
    closeModal($("#workflowModal"));
    markStoreSyncDirty();
    renderWorkflow();
    showToast(existing ? "Workflow record updated" : "Workflow record added");
  });
  $("#addEmployeeBtn").addEventListener("click", () => {
    $("#employeeForm").reset();
    state.editingEmployeeId = null;
    $("#employeeId").value = "";
    $("#employeeModalTitle").textContent = "Add employee";
    openModal($("#employeeModal"));
  });
  $("#syncEmployeesBtn")?.addEventListener("click", () => publishStoreSync({ force: true }));
  $("#employeeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const pin = $("#employeePin").value;
    const existing = state.employees.find((entry) => entry.id === state.editingEmployeeId);
    if (!/^\d{4}$/.test(pin)) {
      window.alert("POS PIN must contain exactly four numbers.");
      return;
    }
    if (state.employees.some((entry) => entry.id !== existing?.id && entry.pin === pin)) {
      window.alert("That POS PIN is already assigned to another employee.");
      return;
    }
    const details = {
      name: $("#employeeName").value.trim(),
      username: existing?.username || `employee${Date.now()}`,
      pin,
      email: $("#employeeEmail").value.trim(),
      phone: $("#employeePhone").value.trim(),
      role: $("#employeeRole").value,
      access: $("#employeeAccess").value,
    };
    if (existing) touchRecord(Object.assign(existing, details));
    else state.employees.push(touchRecord({ id: `e${Date.now()}`, ...details, status: "Clocked out", sales: 0 }));
    saveState();
    closeModal($("#employeeModal"));
    renderAll();
    showToast(existing ? "Employee PIN updated" : "Employee PIN created");
    markStoreSyncDirty();
  });
  $("#employeeTableBody").addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit-employee]");
    const toggle = event.target.closest("[data-toggle-employee]");
    const remove = event.target.closest("[data-delete-employee]");
    if (edit) {
      const employee = state.employees.find((entry) => entry.id === edit.dataset.editEmployee);
      if (!employee) return;
      state.editingEmployeeId = employee.id;
      $("#employeeId").value = employee.id;
      $("#employeeModalTitle").textContent = "Edit employee";
      $("#employeeName").value = employee.name;
      $("#employeePin").value = employee.pin || "";
      $("#employeeEmail").value = employee.email || "";
      $("#employeePhone").value = employee.phone || "";
      $("#employeeRole").value = employee.role;
      $("#employeeAccess").value = employee.access;
      openModal($("#employeeModal"));
    }
    if (toggle) {
      const employee = state.employees.find((entry) => entry.id === toggle.dataset.toggleEmployee);
      if (employee) touchRecord(Object.assign(employee, { status: employee.status === "Clocked in" ? "Clocked out" : "Clocked in" }));
      saveState();
      renderAll();
      markStoreSyncDirty();
    }
    if (remove) {
      const employee = state.employees.find((entry) => entry.id === remove.dataset.deleteEmployee);
      if (!employee || !window.confirm(`Remove ${employee.name} from employees?`)) return;
      state.employees = state.employees.filter((entry) => entry.id !== employee.id);
      rememberDeleted("employees", employee.id);
      saveState();
      renderAll();
      showToast("Employee removed");
      markStoreSyncDirty();
    }
  });
  $("#settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.settings = {
      ...state.settings,
      storeName: $("#settingStoreName").value.trim(),
      companyName: $("#settingCompanyName").value.trim(),
      address: $("#settingAddress").value.trim(),
      phone: $("#settingPhone").value.trim(),
      email: $("#settingEmail").value.trim(),
      taxNumber: $("#settingTaxNumber").value.trim(),
      receiptHeader: $("#settingReceiptHeader").value.trim(),
      receiptFooter: $("#settingReceiptFooter").value.trim(),
      thankYouMessage: $("#settingThankYou").value.trim(),
      returnPolicy: $("#settingReturnPolicy").value.trim(),
      currency: $("#settingCurrency").value,
      taxRate: Number($("#settingTax").value),
      taxInclusive: $("#settingTaxInclusive").value === "true",
      loyaltySpend: Math.max(1, Number($("#settingLoyalty").value)),
      lowStock: Math.max(0, Number($("#settingLowStock").value)),
      autoPrint: $("#settingAutoPrint").checked,
      paperSize: $("#settingPaperSize").value,
      posName: $("#settingPosName").value.trim(),
      reportEmail: $("#settingReportEmail").value.trim(),
      reportRetentionMonths: Math.max(1, Number($("#settingRetentionMonths").value) || 6),
      autoEmailSixMonthReports: $("#settingAutoEmailReports").checked,
      nextReportEmailDate: $("#settingNextReportEmail").value || defaultNextReportEmailDate(),
      printerName: $("#settingPrinterName").value.trim() || defaultSettings.printerName,
      printerConnection: $("#settingPrinterConnection").value,
      cashDrawerEnabled: $("#settingCashDrawer").checked,
    };
    touchRecord(state.settings);
    markStoreSyncDirty();
    renderAll();
    showToast("Store settings saved");
  });
  $("#emailSixMonthReportBtn").addEventListener("click", emailSixMonthReport);
  $("#settingLogoInput").addEventListener("change", (event) => readImageFile(event.target.files[0], (data) => {
    state.settings.logo = data;
    touchRecord(state.settings);
    $("#settingLogoPreview").innerHTML = `<img src="${data}" alt="Company logo" />`;
    saveState();
    markStoreSyncDirty();
  }));
  $("#removeLogoBtn").addEventListener("click", () => {
    state.settings.logo = "";
    touchRecord(state.settings);
    $("#settingLogoPreview").innerHTML = `<span>No logo uploaded</span>`;
    saveState();
    markStoreSyncDirty();
  });
  $$(".settings-tab").forEach((button) => button.addEventListener("click", () => {
    $$(".settings-tab").forEach((tabButton) => tabButton.classList.toggle("active", tabButton === button));
    showToast(`${button.textContent.trim()} settings are shown in the configuration form`);
  }));

  $$("[data-close]").forEach((button) => button.addEventListener("click", () => closeModal(button.closest("dialog"))));
  $("#modalBackdrop").addEventListener("click", () => $$("dialog[open]").forEach(closeModal));
  $$("dialog").forEach((dialog) => dialog.addEventListener("close", () => {
    if (dialog === $("#barcodeScannerModal")) stopBarcodeScanner();
    if (!$$("dialog[open]").length) $("#modalBackdrop").classList.remove("open");
  }));
  document.addEventListener("keydown", (event) => {
    if (!$("#pinScreen").classList.contains("hidden")) {
      if (/^\d$/.test(event.key) && state.pinEntry.length < 4) {
        state.pinEntry += event.key;
        $("#pinError").classList.add("hidden");
        renderPinDots();
        if (state.pinEntry.length === 4) setTimeout(submitPin, 100);
      }
      if (event.key === "Backspace") {
        state.pinEntry = state.pinEntry.slice(0, -1);
        $("#pinError").classList.add("hidden");
        renderPinDots();
      }
      if (event.key === "Escape") {
        state.pinEntry = "";
        $("#pinError").classList.add("hidden");
        renderPinDots();
      }
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      $("#globalSearch").focus();
    }
  });
}

setDate();
configureLoginScreen();
bindEvents();
renderAll();
const savedSession = sessionStorage.getItem("curtain-house-session");
const savedEmployee = state.employees.find((employee) => employee.id === savedSession || employee.username === savedSession);
if (isPublicCatalogMode) {
  $("#loginScreen").classList.add("hidden");
  $("#pinScreen").classList.add("hidden");
  $("#appShell").classList.add("auth-hidden");
  $("#publicCatalog").classList.remove("hidden");
  renderPublicCatalog();
  pullStoreSync({ silent: true }).then(renderPublicCatalog);
} else if (isPosRuntime && localStorage.getItem(DEVICE_ACTIVATION_KEY)) {
  showPinScreen();
  pullEmployeeSync({ silent: true });
} else if (isPosRuntime) {
  showPasswordLogin();
} else if (savedSession && (savedEmployee || loginAccounts[savedSession])) {
  loginUser(savedEmployee ? employeeAccount(savedEmployee) : loginAccounts[savedSession], false);
} else {
  setTimeout(() => $("#loginUsername").focus(), 50);
}
