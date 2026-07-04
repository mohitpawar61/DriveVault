import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Folder } from '../models/folder.model';

@Injectable({ providedIn: 'root' })
export class FolderService {
  private base = environment.foldersApiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Folder[]> {
    return this.http.get<Folder[]>(this.base);
  }

  getById(id: number): Observable<Folder> {
    return this.http.get<Folder>(`${this.base}/${id}`);
  }

  // Children of a folder. parentId = null means root-level folders;
  // backend's /parent/{parentId} route expects a real id, so root is
  // handled client-side via getAll() + filter (see DriveComponent).
  getByParent(parentId: number): Observable<Folder[]> {
    return this.http.get<Folder[]>(`${this.base}/parent/${parentId}`);
  }

  // Matches POST /api/folders/create -> { Success, folder }
  create(name: string, parentId: number | null): Observable<{ Success: boolean; folder?: Folder; error?: string }> {
    return this.http.post<{ Success: boolean; folder?: Folder; error?: string }>(`${this.base}/create`, {
      name,
      parentId,
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
