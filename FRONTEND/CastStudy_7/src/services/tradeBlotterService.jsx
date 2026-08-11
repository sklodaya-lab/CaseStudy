import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getTradeBlotter = async (filters) => {
  try {
    // Process multi-select arrays into comma-separated strings
    const securityIdsParam =
      Array.isArray(filters.securityIds) && filters.securityIds.length > 0
        ? filters.securityIds.join(',')
        : null;

    // Convert Trader IDs array to comma-separated string (filtering valid numbers)
    const traderIdsParam =
      Array.isArray(filters.traderIds) && filters.traderIds.length > 0
        ? filters.traderIds.filter((id) => id !== null && id !== undefined && id !== '').join(',')
        : null;

    const response = await axios.get(`${API_BASE_URL}/TradeBlotter`, {
      params: {
        pageNumber: filters.pageNumber || 1,
        pageSize: filters.pageSize || 50,
        // Renamed parameter keys to prevent ASP.NET Core auto-binding clash
        securityIdList: securityIdsParam,
        traderIdList: traderIdsParam,
        fromDate: filters.fromDate || null,
        toDate: filters.toDate || null,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error in getTradeBlotter:', error);
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