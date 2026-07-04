import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FolderService } from '../../services/folder.service';

@Component({
  selector: 'app-new-folder-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-folder-dialog.component.html',
  styleUrl: './new-folder-dialog.component.css',
})
export class NewFolderDialogComponent {
  @Input() parentId: number | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  name = '';
  creating = signal(false);
  error = signal<string | null>(null);

  constructor(private folderService: FolderService) {}

  submit(): void {
    if (!this.name.trim()) {
      this.error.set('Give the folder a name.');
      return;
    }
    this.creating.set(true);
    this.error.set(null);
    this.folderService.create(this.name.trim(), this.parentId).subscribe({
      next: (res) => {
        this.creating.set(false);
        if (res.Success) {
          this.created.emit();
        } else {
          this.error.set(res.error ?? 'Could not create folder.');
        }
      },
      error: () => {
        this.creating.set(false);
        this.error.set('Create failed. Is the folder service running on port 8082?');
      },
    });
  }
}
