import { Injectable } from '@nestjs/common';
import axios, {  AxiosInstance } from 'axios';

@Injectable()
export class SeedService {
 private readonly axios: AxiosInstance = axios;
  async executeSeed() {
    const { data } = await this.axios.get('https://randomuser.me/api/?results=20');

    return data;
  }
}