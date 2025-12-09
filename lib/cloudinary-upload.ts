interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  width?: number;
  height?: number;
  bytes: number;
}

interface CloudinaryUploadOptions {
  cloudName?: string;
  uploadPreset?: string;
  tags?: string[];
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  folder?: string;
}

export class CloudinaryUploader {
  private cloudName: string;
  private uploadPreset: string;
  private defaultTags: string[];

  constructor(options: CloudinaryUploadOptions = {}) {
    this.cloudName = options.cloudName || 'emergingplatforms';
    this.uploadPreset = options.uploadPreset || 'ilearn';
    this.defaultTags = options.tags || ['course-content'];
  }

  async uploadFile(
    file: File, 
    options: Partial<CloudinaryUploadOptions> = {}
  ): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    
    // Required fields
    formData.append('file', file);
    formData.append('upload_preset', options.uploadPreset || this.uploadPreset);
    
    // Optional fields
    const tags = [...this.defaultTags, ...(options.tags || [])];
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }
    
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.resourceType) {
      formData.append('resource_type', options.resourceType);
    }

    const cloudName = options.cloudName || this.cloudName;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const result: CloudinaryUploadResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(
    files: File[], 
    options: Partial<CloudinaryUploadOptions> = {}
  ): Promise<CloudinaryUploadResponse[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, options));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Multiple file upload error:', error);
      throw error;
    }
  }

  /**
   * Generate a base64 data URL from uploaded file for immediate preview
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get optimized URL with transformations
   */
  static getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    cloudName?: string;
  } = {}): string {
    const { 
      width, 
      height, 
      quality = 'auto', 
      format = 'auto',
      cloudName = 'emergingplatforms'
    } = options;
    
    let transformation = `q_${quality},f_${format}`;
    
    if (width && height) {
      transformation += `,w_${width},h_${height},c_fill`;
    } else if (width) {
      transformation += `,w_${width}`;
    } else if (height) {
      transformation += `,h_${height}`;
    }
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
  }
}

// Create default instance for course content
export const courseContentUploader = new CloudinaryUploader({
  cloudName: 'emergingplatforms',
  uploadPreset: 'ilearn',
  tags: ['course-content']
});

// Helper function for TinyMCE integration
export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    // First, try direct upload to Cloudinary
    const result = await courseContentUploader.uploadFile(file, {
      folder: 'course-content',
      resourceType: 'auto'
    });
    return result.secure_url;
  } catch (directUploadError) {
    console.warn('Direct Cloudinary upload failed, trying server-side upload:', directUploadError);
    
    try {
      // Fallback to server-side upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'course-content');
      formData.append('tags', 'course-content,editor-upload');
      
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      return result.url;
    } catch (serverUploadError) {
      console.error('Server-side upload also failed:', serverUploadError);
      throw new Error('Failed to upload file. Please try again.');
    }
  }
};