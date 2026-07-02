import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-no-access',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <div class="rounded-2xl bg-white p-8 shadow-sm">
        <h1 class="text-2xl font-bold text-stone-800">Hozzáférés megtagadva</h1>
        <p class="mt-2 text-stone-600">
          Kérlek, olvasd be a QR-kódot az étlapról a képfeltöltéshez.
        </p>
      </div>
    </div>
  `,
})
export class NoAccessComponent {}
