import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { FolderService } from '../../services/folder.service';
import { FileService } from '../../services/file.service';
import { SearchService, SearchResult } from '../../services/search.service';
import { AuthService } from '../../services/auth.service';
import { Folder } from '../../models/folder.model';
import { FileItem } from '../../models/file-item.model';

import { UploadDialogComponent } from '../upload-dialog/upload-dialog.component';
import { NewFolderDialogComponent } from '../new-folder-dialog/new-folder-dialog.component';
import { ShareDialogComponent } from '../share-dialog/share-dialog.component';

@Component({
  selector: 'app-drive',
  standalone: true,
  imports: [CommonModule, FormsModule, UploadDialogComponent, NewFolderDialogComponent, ShareDialogComponent],
  templateUrl: './drive.component.html',
  styleUrl: './drive.component.css',
})
export class DriveComponent implements OnInit {
  // Navigation state. null = root (no parent).
  currentFolderId = signal<number | null>(null);
  trail = signal<Folder[]>([]); // breadcrumb stack

  allFolders = signal<Folder[]>([]); // used to derive root + breadcrumb lookups
  childFolders = signal<Folder[]>([]);
  files = signal<FileItem[]>([]);

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  // search
  query = '';
  searchResults = signal<SearchResult | null>(null);
  searching = signal(false);

  // dialogs
  showUpload = signal(false);
  showNewFolder = signal(false);
  shareTarget = signal<{ type: 'file' | 'folder'; id: number; name: string } | null>(null);

  isRoot = computed(() => this.currentFolderId() === null);

  constructor(
    private folderService: FolderService,
    private fileService: FileService,
    private searchService: SearchService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFolder(null);
  }

  loadFolder(folderId: number | null): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.searchResults.set(null);
    this.currentFolderId.set(folderId);

    // Always refresh the full folder list so breadcrumbs + root view stay accurate.
    this.folderService.getAll().subscribe({
      next: (all) => {
        this.allFolders.set(all);

        if (folderId === null) {
          this.childFolders.set(all.filter((f) => f.parentId === null));
          this.files.set([]); // root has no direct file listing endpoint in the backend
          this.trail.set([]);
          this.loading.set(false);
        } else {
          this.trail.set(this.buildTrail(all, folderId));
          this.folderService.getByParent(folderId).subscribe({
            next: (children) => this.childFolders.set(children),
            error: () => this.childFolders.set([]),
          });
          this.fileService.getByFolder(folderId).subscribe({
            next: (files) => {
              this.files.set(files);
              this.loading.set(false);
            },
            error: (err) => {
              this.errorMsg.set('Could not load files for this folder.');
              this.loading.set(false);
            },
          });
        }
      },
      error: () => {
        this.errorMsg.set('Could not reach the folder service. Is it running on port 8082?');
        this.loading.set(false);
      },
    });
  }

  private buildTrail(all: Folder[], folderId: number): Folder[] {
    const byId = new Map(all.map((f) => [f.id, f]));
    const trail: Folder[] = [];
    let current = byId.get(folderId);
    while (current) {
      trail.unshift(current);
      current = current.parentId !== null ? byId.get(current.parentId) : undefined;
    }
    return trail;
  }

  openFolder(folder: Folder): void {
    this.loadFolder(folder.id);
  }

  goToRoot(): void {
    this.loadFolder(null);
  }

  goToBreadcrumb(folder: Folder): void {
    this.loadFolder(folder.id);
  }

  onFolderCreated(): void {
    this.showNewFolder.set(false);
    this.loadFolder(this.currentFolderId());
  }

  onFileUploaded(): void {
    this.showUpload.set(false);
    this.loadFolder(this.currentFolderId());
  }

  deleteFolder(folder: Folder, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Delete folder "${folder.name}"? This cannot be undone.`)) return;
    this.folderService.delete(folder.id).subscribe(() => this.loadFolder(this.currentFolderId()));
  }

  deleteFile(file: FileItem, event: Event): void {
    event.stopPropagation();
    if (!confirm(`Delete file "${file.name}"? This cannot be undone.`)) return;
    this.fileService.delete(file.id).subscribe(() => this.loadFolder(this.currentFolderId()));
  }

  downloadFile(file: FileItem, event: Event): void {
    event.stopPropagation();
    this.fileService.download(file.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  openShare(type: 'file' | 'folder', id: number, name: string, event: Event): void {
    event.stopPropagation();
    this.shareTarget.set({ type, id, name });
  }

  runSearch(): void {
    const q = this.query.trim();
    if (!q) {
      this.searchResults.set(null);
      return;
    }
    this.searching.set(true);
    this.searchService.search(q).subscribe({
      next: (res) => {
        this.searchResults.set(res);
        this.searching.set(false);
      },
      error: () => {
        this.errorMsg.set('Search service is unreachable. Is it running on port 8083?');
        this.searching.set(false);
      },
    });
  }

  clearSearch(): void {
    this.query = '';
    this.searchResults.set(null);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  formatSize(bytes: number): string {
    if (bytes == null) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  serial(id: number): string {
    // cosmetic "ledger serial" — last 6 digits of the id, zero-padded
    const s = String(id).slice(-6).padStart(6, '0');
    return s;
  }
}
