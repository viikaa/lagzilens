import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UploadFile } from '../../core/models/upload.model';
import { GuestNameService } from '../../core/services/guest-name.service';
import { UploadService } from '../../core/services/upload.service';
import { generateId } from '../../core/utils/id.util';
import {
  DetectedImageType,
  detectImageType,
} from '../../core/utils/image-type.util';

interface UploadQueueItem {
  id: string;
  upload: UploadFile;
  detectedType: DetectedImageType;
  generatedFileName: string;
  previewUrl: string;
  isHeic: boolean;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload.html',
})
export class UploadComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private uploadService = inject(UploadService);
  private guestNameService = inject(GuestNameService);
  private fb = inject(FormBuilder);

  readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  items = signal<UploadQueueItem[]>([]);
  isUploading = signal(false);
  isNameModalOpen = signal(false);
  guestName = computed(() => this.guestNameService.getName());

  nameForm = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ],
    ],
  });

  uploadingCount = computed(
    () => this.items().filter((item) => item.upload.status === 'uploading').length
  );

  completedCount = computed(
    () => this.items().filter((item) => item.upload.status === 'done').length
  );

  errorCount = computed(
    () => this.items().filter((item) => item.upload.status === 'error').length
  );

  allDone = computed(
    () =>
      this.items().length > 0 &&
      this.completedCount() === this.items().length
  );

  ngOnInit(): void {
    if (!this.guestNameService.hasName()) {
      this.openNameModal();
    }
  }

  openNameModal(): void {
    const current = this.guestNameService.getName() ?? '';
    this.nameForm.patchValue({ name: current });
    this.isNameModalOpen.set(true);
  }

  closeNameModal(): void {
    this.isNameModalOpen.set(false);
  }

  submitName(): void {
    if (this.nameForm.invalid) return;

    const rawName = this.nameForm.value.name ?? '';
    this.guestNameService.setName(rawName);
    this.closeNameModal();
  }

  takePhoto(cameraInput: HTMLInputElement): void {
    cameraInput.click();
  }

  chooseFromGallery(galleryInput: HTMLInputElement): void {
    galleryInput.click();
  }

  async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newItems: UploadQueueItem[] = await Promise.all(
      Array.from(input.files).map(async (file) => {
        const detectedType = await detectImageType(file);
        const validation = this.validateFile(detectedType.mimeType, file.size);
        const isHeic =
          detectedType.mimeType === 'image/heic' ||
          detectedType.extension === 'heic';
        const previewUrl = isHeic ? '' : URL.createObjectURL(file);

        return {
          id: generateId(),
          detectedType,
          generatedFileName: this.generateFileName(detectedType.extension),
          previewUrl,
          isHeic,
          upload: {
            file,
            status: validation.valid ? 'pending' : 'error',
            progress: 0,
            errorMessage: validation.error,
          },
        };
      })
    );

    this.items.update((current) => [...current, ...newItems]);
    input.value = '';
  }

  private validateFile(
    mimeType: string,
    size: number
  ): { valid: boolean; error?: string } {
    if (!environment.allowedMimeTypes.includes(mimeType.toLowerCase())) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and HEIC images are allowed.',
      };
    }
    if (size > environment.maxFileSizeBytes) {
      return { valid: false, error: 'File exceeds 20 MB limit.' };
    }
    return { valid: true };
  }

  private generateFileName(extension: string): string {
    const sanitizedName = this.guestNameService.getSanitizedName();
    const uniqueId = `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    return `${sanitizedName}_${uniqueId}.${extension}`;
  }

  removeItem(id: string): void {
    const item = this.items().find((i) => i.id === id);
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    this.items.update((list) => list.filter((i) => i.id !== id));
  }

  async startUpload(): Promise<void> {
    if (this.isUploading()) return;

    const pendingOrError = this.items().filter(
      (item) =>
        item.upload.status === 'pending' || item.upload.status === 'error'
    );
    if (pendingOrError.length === 0) return;

    this.items.update((list) =>
      list.map((item) =>
        item.upload.status === 'error'
          ? {
              ...item,
              upload: {
                ...item.upload,
                status: 'pending',
                progress: 0,
                errorMessage: undefined,
              },
            }
          : item
      )
    );

    this.isUploading.set(true);
    try {
      await Promise.all(pendingOrError.map((item) => this.uploadSingle(item)));
    } finally {
      this.isUploading.set(false);
    }
  }

  private async uploadSingle(item: UploadQueueItem): Promise<void> {
    this.updateUpload(item.id, {
      status: 'uploading',
      errorMessage: undefined,
    });

    try {
      const upload = item.upload;
      const base64 = await this.fileToBase64(upload.file);

      const payload = {
        action: 'uploadImage' as const,
        token: this.token,
        fileName: item.generatedFileName,
        mimeType: item.detectedType.mimeType,
        base64String: base64.split(',')[1],
      };

      await lastValueFrom(this.uploadService.uploadImage(payload));

      this.updateUpload(item.id, { status: 'done', progress: 100 });
    } catch (err: any) {
      console.error('Upload error:', err);
      this.updateUpload(item.id, {
        status: 'error',
        progress: 0,
        errorMessage: 'Sikertelen feltöltés. Kérlek, próbáld újra.',
      });
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private updateUpload(id: string, patch: Partial<UploadFile>): void {
    this.items.update((list) =>
      list.map((item) =>
        item.id === id
          ? { ...item, upload: { ...item.upload, ...patch } }
          : item
      )
    );
  }

  reset(): void {
    this.items().forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    this.items.set([]);
  }

  ngOnDestroy(): void {
    this.items().forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
  }
}
