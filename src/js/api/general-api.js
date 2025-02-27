import axios from 'axios';

import { getToken, logout } from '../auth';

export const headerNames = {
  link: 'link',
  location: 'location',
  total: 'x-total-count'
};

export const apiUrl = {
  v1: '/api/management/v1',
  v2: '/api/management/v2'
};

export const MAX_PAGE_SIZE = 500;

const unauthorizedRedirect = error => {
  if (!axios.isCancel(error) && error.response?.status === 401) {
    logout();
  }
  return Promise.reject(error);
};

export const commonRequestConfig = { timeout: 10000, headers: { 'Content-Type': 'application/json' } };

export const authenticatedRequest = axios.create(commonRequestConfig);
authenticatedRequest.interceptors.response.use(res => res, unauthorizedRedirect);
authenticatedRequest.interceptors.request.use(
  config => ({ ...config, headers: { ...config.headers, Authorization: `Bearer ${getToken()}` } }),
  error => Promise.reject(error)
);

const Api = {
  get: authenticatedRequest.get,
  delete: (url, data) => authenticatedRequest.request({ method: 'delete', url, data }),
  patch: authenticatedRequest.patch,
  post: authenticatedRequest.post,
  postUnauthorized: (url, data, config = {}) => axios.post(url, data, { ...commonRequestConfig, ...config }),
  put: authenticatedRequest.put,
  upload: (url, formData, progress, cancelToken) => authenticatedRequest.post(url, formData, { onUploadProgress: progress, timeout: 0, cancelToken }),
  uploadPut: (url, formData, progress, cancelToken) => authenticatedRequest.put(url, formData, { onUploadProgress: progress, timeout: 0, cancelToken })
};

export default Api;
