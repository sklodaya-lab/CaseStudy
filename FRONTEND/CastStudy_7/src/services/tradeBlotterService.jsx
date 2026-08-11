import axios from 'axios';
import { downloadStreamFile } from '../utils/downloadFile';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7189/api';

const buildQueryParams = (filters = {}) => {
  const params = new URLSearchParams();

  if (filters?.fromDate) params.append('fromDate', filters.fromDate);
  if (filters?.toDate) params.append('toDate', filters.toDate);

  const appendArrayFilter = (paramName, items) => {
    if (Array.isArray(items) && items.length > 0) {
      items.forEach((item) => {
        if (item !== null && item !== undefined && item.toString().trim() !== '') {
          params.append(paramName, item.toString().trim());
        }
      });
    }
  };

  appendArrayFilter('AssetClasses', filters?.assetClasses);
  appendArrayFilter('SecurityIds', filters?.securityIds);
  appendArrayFilter('TraderIds', filters?.traderIds);

  return params;
};

export const getTradeBlotter = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);

    params.append('pageNumber', filters?.pageNumber || 1);
    params.append('pageSize', filters?.pageSize || 10);
    params.append('isDescending', filters?.isDescending ?? true);

    const response = await axios.get(`${API_BASE_URL}/TradeBlotter`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching Trade Blotter:', error);
    throw error;
  }
};

export const getTradeBlotterAnalytics = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const response = await axios.get(`${API_BASE_URL}/TradeBlotter/analytics`, { params });
    return response.data;
  } 
  catch (error) {
    console.error('Error fetching Trade Blotter Analytics:', error);
    throw error;
  }
};

export const getSecurities = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Security`);
    console.log(response)
    return response.data;
  } 
  catch (error) {
    console.error('Error fetching Securities lookup:', error);
    throw error;
  }
};

export const getTraders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/Trader`);
    return response.data;
  } 
  catch (error) {
    console.error('Error fetching Traders lookup:', error);
    throw error;
  }
};

export const exportTradeBlotterToCsv = async (filters = {}) => {
  try {
    const params = buildQueryParams(filters);
    const fileName = `TradeBlotter_${new Date().toISOString().slice(0, 10)}.csv`;

    const exportUrl = `${API_BASE_URL}/TradeBlotter/export`;
    await downloadStreamFile(exportUrl, params, fileName);
  } catch (error) {
    console.error('Error exporting Trade Blotter CSV:', error);
    throw error;
  }
};