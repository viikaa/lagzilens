import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-no-access',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <div class="rounded-2xl border border-border bg-elevated p-8 shadow-sm">
        <h1 class="font-display text-3xl font-semibold text-accent">Hozzáférés megtagadva</h1>
        <p class="mt-2 text-fg-muted">
          Kérlek, olvasd be a QR-kódot az étlapról a képfeltöltéshez.
        </p>
      </div>
    </div>
  `,
})
export class NoAccessComponent {}
