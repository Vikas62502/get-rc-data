import {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosResponse
  } from 'axios'
  import { getCache } from './storage'
  
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
  
  const onResponseError = (error: AxiosError): Promise<AxiosError> => {
    console.error(`[response error] [${JSON.stringify(error)}]`)
    return Promise.resolve(error)
  }
  
  export function setupInterceptorsTo(
    axiosInstance: AxiosInstance
  ): AxiosInstance {
    axiosInstance.interceptors.request.use(onRequest, onRequestError)
    // axiosInstance.interceptors.response.use(onResponse, onResponseError);
    return axiosInstance
  }
  