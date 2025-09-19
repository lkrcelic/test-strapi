// Strapi config
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

type StrapiResponse<T> = {
  data: Array<T>;
  meta: any;
};

type ArticleAttributes = {
  title?: string;
  description?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

// Normalized shape used by the UI (flattened attributes)
type Article = {
  id: number;
  title?: string;
  description?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

async function getArticles(): Promise<{ data: Article[]; meta: any }> {
  const res = await fetch(`${STRAPI_URL}/api/articles`, {
    headers: {
      "Content-Type": "application/json",
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch articles: ${res.status} ${res.statusText}`);
  }
    const json: StrapiResponse<Article> = await res.json();
  return {
    data: json.data,
    meta: json.meta,
  };
}

export default async function Home() {
  const articles = await getArticles();
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
      <h1 style={{ fontSize: 28, marginBottom: 16, color: "var(--accent)" }}>Articles</h1>
      {articles.data.length === 0 ? (
        <p style={{ color: "#111827" }}>No articles found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {articles.data.map((article) => (
            <li
              key={article.id}
              style={{
                border: "1px solid #9ca3af",
                borderRadius: 8,
                padding: 16,
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                color: "#111827",
              }}
            >
              <h2 style={{ fontSize: 20, margin: 0, color: "#111827" }}>{article.title || `Untitled #${article.id}`}</h2>
              {article.description && (
                <p style={{ margin: "8px 0 0", color: "#1f2937" }}>{article.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
