import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ShareTarget {
  type: 'file' | 'folder';
  id: number;
  name: string;
}

/**
 * ⚠️ PLACEHOLDER COMPONENT
 * No sharing microservice exists in the DriveVault backend yet.
 * This generates a cosmetic local link so the UI flow is complete;
 * swap `generateLink()` for a real call once a sharing-service exists,
 * e.g. POST /api/shares -> { targetType, targetId, permission } -> { link }
 */
@Component({
  selector: 'app-share-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './share-dialog.component.html',
  styleUrl: './share-dialog.component.css',
})
export class ShareDialogComponent implements OnInit {
  @Input({ required: true }) target!: ShareTarget;
  @Output() closed = new EventEmitter<void>();

  permission = signal<'view' | 'edit'>('view');
  link = signal('');
  copied = signal(false);

  ngOnInit(): void {
    this.generateLink();
  }

  generateLink(): void {
    const token = Math.random().toString(36).slice(2, 10);
    this.link.set(`https://drivevault.local/share/${this.target.type}/${this.target.id}-${token}`);
    this.copied.set(false);
  }

  copy(): void {
    navigator.clipboard?.writeText(this.link());
    this.copied.set(true);
  }
}
