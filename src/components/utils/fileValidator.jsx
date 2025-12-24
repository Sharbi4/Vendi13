/**
 * File Upload Validation Utility
 * Validates file type, size, and content
 */

// Allowed file types with their MIME types
export const ALLOWED_FILE_TYPES = {
  images: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/svg+xml': ['.svg']
  },
  documents: {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt']
  },
  videos: {
    'video/mp4': ['.mp4'],
    'video/quicktime': ['.mov'],
    'video/x-msvideo': ['.avi']
  }
};

// Maximum file sizes (in bytes)
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024,      // 10 MB
  document: 5 * 1024 * 1024,     // 5 MB
  video: 100 * 1024 * 1024,      // 100 MB
  default: 10 * 1024 * 1024      // 10 MB
};

/**
 * Validate file type
 */
export function validateFileType(file, allowedTypes = 'images') {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  let allowedMimeTypes = {};
  
  // Get allowed MIME types based on category
  if (typeof allowedTypes === 'string') {
    allowedMimeTypes = ALLOWED_FILE_TYPES[allowedTypes] || ALLOWED_FILE_TYPES.images;
  } else if (Array.isArray(allowedTypes)) {
    // Custom array of MIME types
    allowedTypes.forEach(type => {
      allowedMimeTypes[type] = [];
    });
  }
  
  // Check MIME type
  if (!allowedMimeTypes[file.type]) {
    const allowed = Object.values(allowedMimeTypes).flat().join(', ');
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowed || 'images only'}`
    };
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  const allowedExtensions = Object.values(allowedMimeTypes).flat();
  
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension: ${extension}`
    };
  }
  
  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file, maxSize = null) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  // Determine max size based on file type
  let maxBytes = maxSize;
  if (!maxBytes) {
    if (file.type.startsWith('image/')) {
      maxBytes = MAX_FILE_SIZES.image;
    } else if (file.type.startsWith('video/')) {
      maxBytes = MAX_FILE_SIZES.video;
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      maxBytes = MAX_FILE_SIZES.document;
    } else {
      maxBytes = MAX_FILE_SIZES.default;
    }
  }
  
  if (file.size > maxBytes) {
    const maxMB = (maxBytes / (1024 * 1024)).toFixed(1);
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large (${fileMB}MB). Maximum size: ${maxMB}MB`
    };
  }
  
  return { valid: true };
}

/**
 * Validate image dimensions (for images only)
 */
export async function validateImageDimensions(file, options = {}) {
  const {
    minWidth = null,
    minHeight = null,
    maxWidth = null,
    maxHeight = null
  } = options;
  
  if (!file.type.startsWith('image/')) {
    return { valid: true }; // Not an image, skip
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const { width, height } = img;
      
      if (minWidth && width < minWidth) {
        resolve({
          valid: false,
          error: `Image width too small (${width}px). Minimum: ${minWidth}px`
        });
        return;
      }
      
      if (minHeight && height < minHeight) {
        resolve({
          valid: false,
          error: `Image height too small (${height}px). Minimum: ${minHeight}px`
        });
        return;
      }
      
      if (maxWidth && width > maxWidth) {
        resolve({
          valid: false,
          error: `Image width too large (${width}px). Maximum: ${maxWidth}px`
        });
        return;
      }
      
      if (maxHeight && height > maxHeight) {
        resolve({
          valid: false,
          error: `Image height too large (${height}px). Maximum: ${maxHeight}px`
        });
        return;
      }
      
      resolve({ valid: true, dimensions: { width, height } });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, error: 'Failed to load image' });
    };
    
    img.src = url;
  });
}

/**
 * Comprehensive file validation
 */
export async function validateFile(file, options = {}) {
  const {
    allowedTypes = 'images',
    maxSize = null,
    checkDimensions = false,
    dimensionOptions = {}
  } = options;
  
  // Check file type
  const typeCheck = validateFileType(file, allowedTypes);
  if (!typeCheck.valid) {
    return typeCheck;
  }
  
  // Check file size
  const sizeCheck = validateFileSize(file, maxSize);
  if (!sizeCheck.valid) {
    return sizeCheck;
  }
  
  // Check image dimensions if requested
  if (checkDimensions && file.type.startsWith('image/')) {
    const dimensionsCheck = await validateImageDimensions(file, dimensionOptions);
    if (!dimensionsCheck.valid) {
      return dimensionsCheck;
    }
  }
  
  return { valid: true };
}

/**
 * Validate multiple files
 */
export async function validateFiles(files, options = {}) {
  const { maxFiles = 10 } = options;
  
  if (!files || files.length === 0) {
    return { valid: false, error: 'No files provided' };
  }
  
  if (files.length > maxFiles) {
    return {
      valid: false,
      error: `Too many files. Maximum: ${maxFiles}`
    };
  }
  
  const results = [];
  for (const file of files) {
    const result = await validateFile(file, options);
    results.push({ file, ...result });
  }
  
  const invalid = results.filter(r => !r.valid);
  if (invalid.length > 0) {
    return {
      valid: false,
      error: invalid[0].error,
      results
    };
  }
  
  return { valid: true, results };
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'file';
  
  // Remove path separators
  let sanitized = filename.replace(/[\/\\]/g, '');
  
  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');
  
  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    sanitized = sanitized.substring(0, 255 - ext.length - 1) + '.' + ext;
  }
  
  return sanitized || 'file';
}