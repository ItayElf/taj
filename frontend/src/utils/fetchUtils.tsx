export function get(url: string, params: {}) {
  url += "?" + new URLSearchParams(params).toString();
  return fetch(url, { method: "GET" });
}

export function post(url: string, params: {}) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
}
