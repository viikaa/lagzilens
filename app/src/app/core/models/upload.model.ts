export interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  errorMessage?: string;
}

export interface GasPayload {
  action: 'uploadImage';
  token: string;
  fileName: string;
  mimeType: string;
  base64String: string;
}

export interface GasResponse {
  success: boolean;
  fileId?: string;
  message?: string;
}
