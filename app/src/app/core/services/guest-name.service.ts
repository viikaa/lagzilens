import { Injectable, signal } from '@angular/core';
import { sanitizeName } from '../utils/string.util';

@Injectable({ providedIn: 'root' })
export class GuestNameService {
  private readonly storageKey = 'wedding_guest_name';
  private name = signal<string | null>(this.load());

  getName(): string | null {
    return this.name();
  }

  hasName(): boolean {
    return !!this.name();
  }

  setName(name: string): void {
    const trimmed = name.trim();
    localStorage.setItem(this.storageKey, trimmed);
    this.name.set(trimmed);
  }

  clearName(): void {
    localStorage.removeItem(this.storageKey);
    this.name.set(null);
  }

  getSanitizedName(): string {
    return sanitizeName(this.name() ?? 'guest');
  }

  private load(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.storageKey);
  }
}
