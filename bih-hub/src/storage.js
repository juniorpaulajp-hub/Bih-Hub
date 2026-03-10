// ─── STORAGE usando JSONBin.io (gratuito, compartilhado) ────────────────────
// JSONBin permite criar um "bin" (JSON público) que qualquer um pode ler/escrever.
// Limite gratuito: 10.000 requests/mês — mais que suficiente para uso diário.

const BIN_ID = import.meta.env.VITE_BIN_ID || null;
const API_KEY = import.meta.env.VITE_JSONBIN_KEY || null;
const BASE_URL = "https://api.jsonbin.io/v3/b";

let cache = null; // cache local para evitar requests desnecessários

export async function loadAll(fallback) {
  if (!BIN_ID || !API_KEY) {
    // Modo offline: usa localStorage
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
  // Sempre salva local como backup
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
  } catch {
    // falha silenciosa — dado já foi salvo no localStorage
  }
}
