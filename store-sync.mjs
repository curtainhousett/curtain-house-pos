import { connectLambda, getStore } from "@netlify/blobs";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Sync-Token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

const collections = ["products", "transactions", "customers", "openTickets", "shiftHistory", "employees", "categories", "modifiers", "discountPresets", "onlineOrders"];
const deletedCollections = [...collections, "workflowRecords"];

const defaultEmployees = [
  { id: "e1", name: "Administrator", username: "admin", email: "", phone: "", pin: "5000", role: "Administrator", access: "Full access", status: "Clocked out", sales: 0 },
  { id: "e2", name: "Store Manager", username: "manager", email: "", phone: "", pin: "2000", role: "Store Manager", access: "Full access", status: "Clocked out", sales: 0 },
  { id: "e3", name: "Sales Associate", username: "sales", email: "", phone: "", pin: "1000", role: "Sales Associate", access: "Sales POS only", status: "Clocked out", sales: 0 },
];

const json = (statusCode, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

const defaultDeletedRecords = () => Object.fromEntries(deletedCollections.map((collection) => [collection, []]));

function recordTimestamp(record = {}) {
  return Date.parse(record.syncUpdatedAt || record.updatedAt || record.createdAt || record.openedAt || record.closedAt || record.deletedAt || "") || 0;
}

function mergeSettings(existingSettings = null, incomingSettings = null) {
  if (!incomingSettings) return existingSettings || null;
  if (!existingSettings) return incomingSettings;
  return recordTimestamp(incomingSettings) >= recordTimestamp(existingSettings)
    ? { ...existingSettings, ...incomingSettings }
    : existingSettings;
}

function normalizeDeletedRecords(records = {}) {
  const normalized = defaultDeletedRecords();
  deletedCollections.forEach((collection) => {
    normalized[collection] = Array.isArray(records[collection])
      ? records[collection].filter((entry) => entry?.id).map((entry) => ({ id: entry.id, deletedAt: entry.deletedAt || new Date().toISOString() }))
      : [];
  });
  return normalized;
}

function mergeDeletedRecords(existingRecords = {}, incomingRecords = {}) {
  const existing = normalizeDeletedRecords(existingRecords);
  const incoming = normalizeDeletedRecords(incomingRecords);
  deletedCollections.forEach((collection) => {
    const byId = new Map(existing[collection].map((entry) => [entry.id, entry]));
    incoming[collection].forEach((entry) => {
      const current = byId.get(entry.id);
      if (!current || Date.parse(entry.deletedAt || "") >= Date.parse(current.deletedAt || "")) byId.set(entry.id, entry);
    });
    existing[collection] = [...byId.values()];
  });
  return existing;
}

function mergeRecordArrays(existingRecords = [], incomingRecords = []) {
  const merged = new Map();
  [...(Array.isArray(existingRecords) ? existingRecords : []), ...(Array.isArray(incomingRecords) ? incomingRecords : [])].forEach((record) => {
    if (!record?.id) return;
    const current = merged.get(record.id);
    if (!current || recordTimestamp(record) >= recordTimestamp(current)) merged.set(record.id, record);
  });
  return [...merged.values()];
}

function applyDeletes(collection, records, deletedRecords) {
  const deleted = new Map((deletedRecords[collection] || []).map((entry) => [entry.id, Date.parse(entry.deletedAt || "") || 0]));
  return records.filter((record) => {
    const deletedAt = deleted.get(record.id);
    return !deletedAt || recordTimestamp(record) > deletedAt;
  });
}

function mergeWorkflowRecords(existingRecords = {}, incomingRecords = {}) {
  const moduleNames = new Set([...Object.keys(existingRecords || {}), ...Object.keys(incomingRecords || {})]);
  return Object.fromEntries([...moduleNames].map((name) => [name, mergeRecordArrays(existingRecords?.[name] || [], incomingRecords?.[name] || [])]));
}

function applyWorkflowDeletes(records = {}, deletedRecords = {}) {
  const deleted = new Map((deletedRecords.workflowRecords || []).map((entry) => [entry.id, Date.parse(entry.deletedAt || "") || 0]));
  return Object.fromEntries(Object.entries(records).map(([name, entries]) => [
    name,
    entries.filter((record) => {
      const deletedAt = deleted.get(record.id);
      return !deletedAt || recordTimestamp(record) > deletedAt;
    }),
  ]));
}

function mergeStoreData(existingData = {}, incomingData = {}, source = "backoffice") {
  const deletedRecords = mergeDeletedRecords(existingData.deletedRecords, incomingData.deletedRecords);
  const merged = { deletedRecords };

  collections.forEach((collection) => {
    merged[collection] = applyDeletes(collection, mergeRecordArrays(existingData[collection], incomingData[collection]), deletedRecords);
  });

  if (!merged.employees?.length) merged.employees = defaultEmployees;
  merged.settings = mergeSettings(existingData.settings, incomingData.settings);
  merged.currentShift = source === "iphone-pos" ? (incomingData.currentShift || null) : (existingData.currentShift ?? incomingData.currentShift ?? null);
  merged.workflowRecords = applyWorkflowDeletes(mergeWorkflowRecords(existingData.workflowRecords, incomingData.workflowRecords), deletedRecords);
  merged.favoriteProductIds = [...new Set([...(existingData.favoriteProductIds || []), ...(incomingData.favoriteProductIds || [])])];

  return merged;
}

function hasValidSyncToken(event) {
  const expectedToken = process.env.CURTAIN_HOUSE_SYNC_TOKEN;
  if (!expectedToken) return true;
  return event.headers["x-sync-token"] === expectedToken || event.headers["X-Sync-Token"] === expectedToken;
}

async function readStorePayload(store) {
  const saved = await store.get("store-data", { type: "json" }).catch(() => null);
  if (saved?.data) return saved;
  return {
    version: 2,
    updatedAt: "",
    source: "default",
    data: {
      employees: defaultEmployees,
      deletedRecords: defaultDeletedRecords(),
    },
  };
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (!hasValidSyncToken(event)) return json(401, { error: "Unauthorized sync request." });
  connectLambda(event);

  const store = getStore("curtain-house-pos");

  if (event.httpMethod === "GET") return json(200, await readStorePayload(store));
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  try {
    const body = JSON.parse(event.body || "{}");
    const existing = await readStorePayload(store);
    const payload = {
      version: 2,
      updatedAt: new Date().toISOString(),
      source: body.source || "backoffice",
      deviceId: body.deviceId || "",
      publishedBy: body.publishedBy || "",
      data: mergeStoreData(existing.data || {}, body.data || {}, body.source || "backoffice"),
    };
    await store.set("store-data", JSON.stringify(payload));
    await store.set("employees", JSON.stringify({
      version: 1,
      updatedAt: payload.updatedAt,
      source: payload.source,
      employees: payload.data.employees || defaultEmployees,
    }));
    return json(200, payload);
  } catch (error) {
    console.error("Store sync failed.", error);
    return json(400, { error: "Could not save store sync data." });
  }
};
