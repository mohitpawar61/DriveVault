import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SearchResult {
  files: Record<string, any>[];
  folders: Record<string, any>[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private base = environment.searchApiUrl;

  constructor(private http: HttpClient) {}

  // Matches GET /api/search?query=...
  search(query: string): Observable<SearchResult> {
    return this.http.get<SearchResult>(this.base, { params: { query } });
  }
}
