import axios from 'axios'

// Runtime API helpers: read runtime override from localStorage or fall back to NEXT_PUBLIC_API_BASE_URL
export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    try {
      const runtime = JSON.parse(localStorage.getItem('appConfig') || '{}');
      if (runtime && runtime.apiBaseUrl) return runtime.apiBaseUrl;
    } catch (e) {
      // ignore parse errors
    }
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
}

export function setRuntimeApiBaseUrl(url) {
  if (typeof window !== 'undefined') {
    try {
      const runtime = JSON.parse(localStorage.getItem('appConfig') || '{}');
      runtime.apiBaseUrl = url;
      localStorage.setItem('appConfig', JSON.stringify(runtime));
    } catch (e) {
      // ignore errors
    }
  }
}

export async function apiFetch(path, options = {}) {
  const base = getApiBaseUrl();
  const sanitizedPath = path.startsWith('/') ? path : '/' + path;
  const baseUrl = base.endsWith('/') ? base.slice(0, -1) : base;
  const url = (baseUrl || '') + sanitizedPath;
  return fetch(url, options);
}

// ===== Authentication API =====
export async function register(email, password, partnerName1, partnerName2, slug) {
  try {
    const response = await axios.post(`${getApiBaseUrl()}/api/auth/register`, {
      email,
      password,
      partnerName1,
      partnerName2,
      slug
    })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userId', response.data.userId)
    }
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

export async function login(email, password) {
  try {
    const response = await axios.post(`${getApiBaseUrl()}/api/auth/login`, {
      email,
      password
    })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('userId', response.data.userId)
    }
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('coupleId')
}

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export function getAuthHeader() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ===== Couples API =====
export async function getCoupleBySlug(slug) {
  try {
    const response = await axios.get(`${getApiBaseUrl()}/api/couples/slug/${slug}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

export async function getCoupleById(id) {
  try {
    const response = await axios.get(`${getApiBaseUrl()}/api/couples/${id}`, {
      headers: getAuthHeader()
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

export async function createCouple(slug, anniversaryDate, themeColor) {
  try {
    const response = await axios.post(
      `${getApiBaseUrl()}/api/couples`,
      { slug, anniversaryDate, themeColor },
      { headers: getAuthHeader() }
    )
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

// ===== Events API =====
export async function getEventsByCoupleId(coupleId) {
  try {
    const response = await axios.get(`${getApiBaseUrl()}/api/events/couple/${coupleId}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

export async function createEvent(coupleId, eventDate, title, description, category, imageUrl) {
  try {
    const response = await axios.post(
      `${getApiBaseUrl()}/api/events`,
      { coupleId, eventDate, title, description, category, imageUrl },
      { headers: getAuthHeader() }
    )
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

export async function deleteEvent(eventId) {
  try {
    await axios.delete(`${getApiBaseUrl()}/api/events/${eventId}`, {
      headers: getAuthHeader()
    })
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

// ===== Partners API =====
export async function getPartnersByCoupleId(coupleId) {
  try {
    const response = await axios.get(`${getApiBaseUrl()}/api/partners/couple/${coupleId}`)
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

export async function createPartner(coupleId, name) {
  try {
    const response = await axios.post(
      `${getApiBaseUrl()}/api/partners`,
      { coupleId, name },
      { headers: getAuthHeader() }
    )
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

// ===== Payment API =====
export async function createCheckoutSession(coupleId, isPremium) {
  try {
    const response = await axios.post(`${getApiBaseUrl()}/api/payments/checkout`, {
      coupleId,
      isPremium
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

// ===== AI API =====
export async function generateStory(eventTitle, eventDescription) {
  try {
    const response = await axios.post(`${getApiBaseUrl()}/api/ai/generate-story`, {
      eventTitle,
      eventDescription
    })
    return response.data
  } catch (error) {
    throw error.response?.data?.message || error.message
  }
}

