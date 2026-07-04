import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FileItem } from '../models/file-item.model';

@Injectable({ providedIn: 'root' })
export class FileService {
  private base = environment.filesApiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FileItem[]> {
    return this.http.get<FileItem[]>(this.base);
  }

  getByFolder(folderId: number): Observable<FileItem[]> {
    return this.http.get<FileItem[]>(`${this.base}/folder/${folderId}`);
  }

  // Matches POST /api/files/upload (multipart: name, folderId, file)
  upload(name: string, folderId: number, file: File): Observable<{ success: string; file?: FileItem; error?: string }> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('folderId', String(folderId));
    formData.append('file', file);
    return this.http.post<{ success: string; file?: FileItem; error?: string }>(`${this.base}/upload`, formData);
  }

  // Matches GET /api/files/download/{id} -> raw file bytes
  download(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/download/${id}`, { responseType: 'blob' });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
