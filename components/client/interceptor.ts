import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse
} from 'axios'
import { getCache, setCache } from './storage'
import { client } from './axios'

const onRequest = async (
  config: InternalAxiosRequestConfig<any>
): Promise<InternalAxiosRequestConfig<any>> => {
  config.headers.set()
  const token = await getCache('token')
  config.headers.setAuthorization(`Bearer ${token}`)
  return config
}

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  console.error(`[request error] [${JSON.stringify(error)}]`)
  return Promise.reject(error)
}

const onResponse = (response: AxiosResponse): AxiosResponse => {
  console.info(`[response] [${JSON.stringify(response)}]`)
  return response
}

let retryCount = 0; // Declare a variable to track the number of retry attempts

const onResponseError = async (error: AxiosError): Promise<any> => {
  console.error(`[response error] [${JSON.stringify(error)}]`);

  // Check if error is due to token expiration and retry count is less than 3
  if (error.response?.status === 403 && retryCount < 3) {
    const originalRequest: any = error.config;
    console.log('originalRequest', originalRequest);

    const refreshToken = await getCache('refreshtoken');

    try {
      // Refresh the token
      const refreshResponse = await client.post('/api/login/refresh-token', {
        refreshToken: refreshToken,
      });

      const newAccessToken = refreshResponse.data.token; // Extract the new token

      if (newAccessToken) {
        // Save the new token
        await setCache('token', newAccessToken);
        await setCache('userData', refreshResponse?.data?.user);
        await setCache('refreshtoken', refreshResponse.data?.refreshToken);

        // Update the Authorization header and retry the request
        originalRequest.headers['authorization'] = `Bearer ${newAccessToken}`;

        retryCount += 1; // Increment the retry count

        return axios(originalRequest); // Retry the original request with the new token
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      return Promise.reject(refreshError);
    }
  }

  // Reject the error if max retries exceeded or the error is not 401
  return Promise.reject(error);
};



export function setupInterceptorsTo(
  axiosInstance: AxiosInstance
): AxiosInstance {
  axiosInstance.interceptors.request.use(onRequest, onRequestError)
  axiosInstance.interceptors.response.use(onResponse, onResponseError);
  return axiosInstance
}
