'use client'
import axios from 'axios'
import { setupInterceptorsTo } from './interceptor'

// const customBaseUrl = 'http://192.168.0.65:3001/v1/api'
// const customBaseUrl = 'https://api.chairbord.in/v1/api'

// const customBaseUrl = 'https://cbpl.chairbord.in/v1/api'
// const customBaseUrl = 'http://192.168.31.51:3001/v1/api'

// const customBaseUrl = 'http://3.108.28.239/';
const customBaseUrl = 'http://192.168.29.124:8080/';


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
