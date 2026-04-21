import axios from 'axios';
// import _ from 'lodash';
import reduxStore from './redux';
import { processLogout } from './store/actions';
// import config from './config';

const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

const logout = async () => {
  try {
    await instance.post("/api/logout");
    reduxStore.dispatch(processLogout());
  } catch (e) {
    console.log("Logout error:", e);
  }

  
};

instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/refresh-token"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => instance(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await instance.post("/api/refresh-token");
        processQueue(null);
        return instance(originalRequest);

      } catch (e) {
        processQueue(e);
        await logout();
        return Promise.reject(e);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

// const createError = (httpStatusCode, statusCode, errorMessage, problems, errorCode = '') => {
//     const error = new Error();
//     error.httpStatusCode = httpStatusCode;
//     error.statusCode = statusCode;
//     error.errorMessage = errorMessage;
//     error.problems = problems;
//     error.errorCode = errorCode + "";
//     return error;
// };

// export const isSuccessStatusCode = (s) => {
//     // May be string or number
//     const statusType = typeof s;
//     return (statusType === 'number' && s === 0) || (statusType === 'string' && s.toUpperCase() === 'OK');
// };

// instance.interceptors.response.use(
//     (response) => {
//         // Thrown error for request with OK status code
//         const { data } = response;
//         if (data.hasOwnProperty('s') && !isSuccessStatusCode(data['s']) && data.hasOwnProperty('errmsg')) {
//             return Promise.reject(createError(response.status, data['s'], data['errmsg'], null, data['errcode'] ? data['errcode'] : ""));
//         }

//         // Return direct data to callback
//         if (data.hasOwnProperty('s') && data.hasOwnProperty('d')) {
//             return data['d'];
//         }
//         // Handle special case
//         if (data.hasOwnProperty('s') && _.keys(data).length === 1) {
//             return null;
//         }
//         return response.data;
//     },
//     (error) => {
//         const { response } = error;
//         if (response == null) {
//             return Promise.reject(error);
//         }

//         const { data } = response;

//         if (data.hasOwnProperty('s') && data.hasOwnProperty('errmsg')) {
//             return Promise.reject(createError(response.status, data['s'], data['errmsg']));
//         }

//         if (data.hasOwnProperty('code') && data.hasOwnProperty('message')) {
//             return Promise.reject(createError(response.status, data['code'], data['message'], data['problems']));
//         }

//         return Promise.reject(createError(response.status));
//     }
// );

export default instance;
