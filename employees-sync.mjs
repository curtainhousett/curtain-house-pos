import { connectLambda, getStore } from "@netlify/blobs";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Sync-Token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

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

function normalizeEmployee(employee, index = 0) {
  return {
    id: employee?.id || `employee-${index + 1}`,
    name: employee?.name || `Employee ${index + 1}`,
    username: employee?.username || `employee${index + 1}`,
    email: employee?.email || "",
    phone: employee?.phone || "",
    pin: String(employee?.pin || "").replace(/\D/g, "").slice(0, 4),
    role: employee?.role || "Sales Associate",
    access: employee?.access || "Sales POS only",
    status: employee?.status || "Clocked out",
    sales: Number(employee?.sales) || 0,
  };
}

function normalizeEmployees(employees = []) {
  const normalized = (Array.isArray(employees) ? employees : []).map(normalizeEmployee).filter((employee) => employee.name && employee.pin);
  defaultEmployees.forEach((defaultEmployee) => {
    if (!normalized.some((employee) => employee.username === defaultEmployee.username)) {
      normalized.push({ ...defaultEmployee });
    }
  });
  return normalized;
}

function hasValidSyncToken(event) {
  const expectedToken = process.env.CURTAIN_HOUSE_SYNC_TOKEN;
  if (!expectedToken) return true;
  return event.headers["x-sync-token"] === expectedToken || event.headers["X-Sync-Token"] === expectedToken;
}

async function readEmployeePayload(store) {
  const saved = await store.get("employees", { type: "json" }).catch(() => null);
  if (saved?.employees) {
    return {
      version: 1,
      updatedAt: saved.updatedAt || "",
      source: saved.source || "backoffice",
      employees: normalizeEmployees(saved.employees),
    };
  }
  return {
    version: 1,
    updatedAt: "",
    source: "default",
    employees: normalizeEmployees(defaultEmployees),
  };
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (!hasValidSyncToken(event)) return json(401, { error: "Unauthorized sync request." });
  connectLambda(event);

  const store = getStore("curtain-house-pos");

  if (event.httpMethod === "GET") {
    return json(200, await readEmployeePayload(store));
  }

  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  try {
    const body = JSON.parse(event.body || "{}");
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      source: body.source || "backoffice",
      publishedBy: body.publishedBy || "",
      employees: normalizeEmployees(body.employees),
    };
    await store.set("employees", JSON.stringify(payload));
    return json(200, payload);
  } catch (error) {
    console.error("Employee sync failed.", error);
    return json(400, { error: "Could not save employee sync data." });
  }
};
