'use client'
import axios from 'axios'
import { setupInterceptorsTo } from './interceptor'

const customBaseUrl = 'http://43.204.133.228:8080';
// const customBaseUrl = 'http://192.168.38.165:8080';


export const client = axios.create({
  baseURL: `${customBaseUrl}`,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});

setupInterceptorsTo(client)