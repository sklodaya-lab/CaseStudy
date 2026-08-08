import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getTradeBlotter = async (filters) => {
  try {
    const params = new URLSearchParams();

    // Pagination
    params.append('pageNumber', filters.pageNumber || 1);
    params.append('pageSize', filters.pageSize || 10);

    // Dates
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    // Append array items individually so ASP.NET Core binds List<string> natively
    if (Array.isArray(filters.securityIds) && filters.securityIds.length > 0) {
      filters.securityIds.forEach((id) => {
        if (id && id.toString().trim() !== '') {
          params.append('SecurityIds', id.toString().trim());
        }
      });
    }
    if (Array.isArray(filters.traderIds) && filters.traderIds.length > 0) {
      filters.traderIds.forEach((id) => {
        if (id !== null && id !== undefined && id !== '') {
          params.append('TraderIds', id);
        }
      });
    }

    const response = await axios.get(`${API_BASE_URL}/TradeBlotter`, { params });
    return response.data;
  } catch (error) {
    console.error('Error in getTradeBlotter:', error);
    throw error;
  }
};

export const getTradeBlotterAnalytics = async (filters) => {
  try {
    const params = new URLSearchParams();

    // Dates
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);

    // Append array items individually
    if (Array.isArray(filters.securityIds) && filters.securityIds.length > 0) {
      filters.securityIds.forEach((id) => {
        if (id) params.append('securityIds', id);
      });
    }

    if (Array.isArray(filters.traderIds) && filters.traderIds.length > 0) {
      filters.traderIds.forEach((id) => {
        if (id !== null && id !== undefined && id !== '') {
          params.append('traderIds', id);
        }
      });
    }

    const response = await axios.get(`${API_BASE_URL}/TradeBlotter/analytics`, { params });
    return response.data;
  } catch (error) {
    console.error('Error in getTradeBlotterAnalytics:', error);
    throw error;
  }
};

export const getSecurities = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Security`);
    return response.data;
  } catch (error) {
    console.error('Error in getSecurities:', error);
    throw error;
  }
};

export const getTraders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Trader`);
    return response.data;
  } catch (error) {
    console.error('Error in getTraders:', error);
    throw error;
  }
};