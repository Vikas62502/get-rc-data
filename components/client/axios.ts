'use client'
import axios from 'axios'
import { setupInterceptorsTo } from './interceptor'

const customBaseUrl = 'http://3.108.28.239:8080';
// const customBaseUrl = 'http://192.168.31.128:8080';


export const client = axios.create({
  baseURL: `${customBaseUrl}`,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});

setupInterceptorsTo(client)