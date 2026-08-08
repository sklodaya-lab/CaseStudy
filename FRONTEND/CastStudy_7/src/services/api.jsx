//axios api's

const BASE_URL = 'https://localhost:7189/api/';

export async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) throw new Error('API Request Failed');
  return response.json();
}

export async function getPnLSummary({ asOfDate, securityId } = {}) {
  const params = new URLSearchParams();

  if (asOfDate) {
    // Formats Date object to YYYY-MM-DD format
    const formattedDate = asOfDate instanceof Date 
      ? asOfDate.toISOString().split('T')[0] 
      : asOfDate;
    params.append('asOfDate', formattedDate);
  }

  if (securityId) {
    params.append('securityId', securityId);
  }

  const queryString = params.toString();
  const endpoint = `PnL/summary${queryString ? `?${queryString}` : ''}`;

  return fetchApi(endpoint);
}