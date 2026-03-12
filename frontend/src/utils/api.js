const BASE = "http://localhost:8000";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export const api = {
  ingest:       (repo_url)                        => post("/api/ingest",        { repo_url }),
  ask:          (question, collection_name)        => post("/api/ask",           { question, collection_name }),
  search:       (query, collection_name)           => post("/api/search",        { query, collection_name }),
  summary:      (collection_name)                  => post("/api/summary",       { collection_name }),
  architecture: (collection_name)                  => post("/api/architecture",  { collection_name }),
  dependencies: (collection_name)                  => get(`/api/dependencies/${collection_name}`),
};
