// Server component: list Form submissions from Strapi

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_TOKEN;

// Raw Strapi response types
type StrapiResponse<T> = {
  data: Array<FormSubmission>;
  meta: any;
};


// Normalized type used by the UI
export type FormSubmission = {
  id: number;
  Name?: string;
  Email?: string;
  createdAt?: string;
};

async function getForms(): Promise<{ data: FormSubmission[]; meta: any }> {
  const res = await fetch(`${STRAPI_URL}/api/forms`, {
    headers: {
      "Content-Type": "application/json",
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch forms: ${res.status} ${res.statusText}`);
  }
  const json: StrapiResponse<FormSubmission> = await res.json();
  return {
    data: json.data,
    meta: json.meta,
  };
}

export default async function FormsPage() {
  const forms = await getForms();
  return (
    <main
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: "0 20px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        color: "#111827",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 16, color: "var(--accent)" }}>Form Submissions</h1>
      {forms.data.length === 0 ? (
        <p style={{ color: "#111827" }}>No submissions yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {forms.data.map((f) => (
            <li
              key={f.id}
              style={{
                border: "1px solid #9ca3af",
                borderRadius: 8,
                padding: 16,
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                color: "#111827",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h2 style={{ fontSize: 18, margin: 0, color: "#111827" }}>#{f.id}</h2>
                {f.createdAt && (
                  <small style={{ color: "#1f2937" }}>{new Date(f.createdAt).toLocaleString()}</small>
                )}
              </div>
              <p style={{ margin: "8px 0 0", color: "#111827" }}>Name: <strong>{f.Name || "-"}</strong></p>
              <p style={{ margin: "4px 0 0", color: "#111827" }}>Email: <strong>{f.Email || "-"}</strong></p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
