const BIN_ID = import.meta.env.VITE_BIN_ID || null;
const API_KEY = (import.meta.env.VITE_JSONBIN_KEY || '').replace(/^"|"$/g, '');
const BASE_URL = "https://api.jsonbin.io/v3/b";

let cache = null;

export async function loadAll(fallback) {
  if (!BIN_ID || !API_KEY) {
    const local = localStorage.getItem("bih-hub-data");
    return local ? JSON.parse(local) : fallback;
  }
  try {
    const res = await fetch(`${BASE_URL}/${BIN_ID}/latest`, {
      headers: { "X-Master-Key": API_KEY }
    });
    const json = await res.json();
    cache = json.record;
    return cache;
  } catch {
    const local = localStorage.getItem("bih-hub-data");
    return local ? JSON.parse(local) : fallback;
  }
}

export async function saveAll(data) {
  localStorage.setItem("bih-hub-data", JSON.stringify(data));
  cache = data;
  if (!BIN_ID || !API_KEY) return;
  try {
    await fetch(`${BASE_URL}/${BIN_ID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY,
      },
      body: JSON.stringify(data),
    });
  } catch {}
}
```

Depois no Vercel, coloque o valor da `VITE_JSONBIN_KEY` **entre aspas duplas** assim:
```
"$2a$10$NLRkfzqsKX7gVXWjDvvBT.cK0Pk4DKX2gl/wi9O2yQqJ/nyWhzqQ."
