const BASE_URL = "http://localhost:8080/api/auth";

async function parseResponse(res, fallbackMessage) {
  const text = await res.text();
  let data = {};
  try {
    if (text) data = JSON.parse(text);
  } catch {
    // non-JSON body
  }
  if (!res.ok) throw new Error(data.message || fallbackMessage);
  return data;
}

export async function loginApi(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(res, "Login failed");
}

export async function registerApi(name, email, password, role) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  return parseResponse(res, "Registration failed");
}

export async function updateProfileApi(name, email, currentPassword, newPassword) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/update-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name, email, currentPassword, newPassword }),
  });
  return parseResponse(res, "Profile update failed");
}

