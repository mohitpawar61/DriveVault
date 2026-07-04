import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-upload-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-dialog.component.html',
  styleUrl: './upload-dialog.component.css',
})
export class UploadDialogComponent {
  @Input({ required: true }) folderId!: number;
  @Output() closed = new EventEmitter<void>();
  @Output() uploaded = new EventEmitter<void>();

  selectedFile: File | null = null;
  displayName = '';
  uploading = signal(false);
  error = signal<string | null>(null);

  constructor(private fileService: FileService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.displayName = this.selectedFile.name;
    }
  }

  submit(): void {
    if (!this.selectedFile) {
      this.error.set('Choose a file first.');
      return;
    }
    this.uploading.set(true);
    this.error.set(null);
    this.fileService.upload(this.displayName || this.selectedFile.name, this.folderId, this.selectedFile).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.error) {
          this.error.set(res.error);
        } else {
          this.uploaded.emit();
        }
      },
      error: () => {
        this.uploading.set(false);
        this.error.set('Upload failed. Is the file service running on port 8081?');
      },
    });
  }
}
