import axios from 'axios';

export const downloadStreamFile = async (apiUrl, params, defaultFileName = 'export.csv') => {
  const response = await axios.get(apiUrl, {
    params,
    responseType: 'blob', // Expect binary file stream from C# FileStreamResult
  });

  const blob = new Blob([response.data], { type: 'text/csv' });
  const downloadUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', defaultFileName);

  document.body.appendChild(link);
  link.click();

  // Cleanup DOM and memory
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};