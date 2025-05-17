import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  loadConfig() {
    return this.http.get('/assets/config.json')
      .toPromise()
      .then((config: any) => {
        this.config = config;
        // Override environment.apiUrl with config.apiUrl if available
        if (config.apiUrl) {
          (environment as any).apiUrl = config.apiUrl;
        }
      })
      .catch(error => {
        console.error('Error loading config:', error);
      });
  }

  get apiUrl() {
    return this.config?.apiUrl || environment.apiUrl;
  }
} 