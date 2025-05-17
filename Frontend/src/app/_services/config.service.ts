import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {
    console.log('ConfigService initialized');
    console.log('Current environment:', environment);
  }

  loadConfig() {
    console.log('Loading config from /assets/config.json');
    return this.http.get('/assets/config.json')
      .toPromise()
      .then((config: any) => {
        console.log('Config loaded successfully:', config);
        this.config = config;
        // Override environment.apiUrl with config.apiUrl if available
        if (config.apiUrl) {
          console.log('Overriding environment.apiUrl with:', config.apiUrl);
          (environment as any).apiUrl = config.apiUrl;
        }
        return config;
      })
      .catch(error => {
        console.error('Error loading config:', error);
        console.log('Using default environment.apiUrl:', environment.apiUrl);
        return environment;
      });
  }

  get apiUrl() {
    const url = this.config?.apiUrl || environment.apiUrl;
    console.log('Current API URL:', url);
    return url;
  }
} 