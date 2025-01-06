'use client'
import axios from 'axios'
import { setupInterceptorsTo } from './interceptor'

const customBaseUrl = 'http://3.108.28.239:8080';
// const customBaseUrl = 'http://192.168.31.128:8080';


export const client = axios.create({
  baseURL: `${customBaseUrl}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptorsTo(client)

// export const authClient = axios.create({
//   baseURL: `${customBaseUrl}:3001/v1/api`,
//   timeout: 20000,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// })
