import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message: string; buttonText?: { ok: string; cancel: string }; buttonColor?: { ok: string } }
  ) { }

  // Método llamado al hacer clic en Cancelar
  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Método llamado al hacer clic en Aceptar
  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
