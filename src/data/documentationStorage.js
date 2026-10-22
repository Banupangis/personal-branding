import { getSupabaseClient } from '../lib/supabaseClient';

const BUCKET_NAME = 'experience-documentation';
const ACHIEVEMENT_BUCKET_NAME = 'achievement-documentation';
const STORAGE_REFERENCE_PREFIX = `storage://${BUCKET_NAME}/`;
const ACHIEVEMENT_REFERENCE_PREFIX = `storage://${ACHIEVEMENT_BUCKET_NAME}/`;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;
const EXTENSIONS_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

export function isStoredDocumentationImage(reference) {
  return reference.startsWith(STORAGE_REFERENCE_PREFIX)
    || reference.startsWith(ACHIEVEMENT_REFERENCE_PREFIX);
}

export function getDocumentationImageUrl(reference) {
  if (!isStoredDocumentationImage(reference)) return reference;

  const bucketName = reference.startsWith(ACHIEVEMENT_REFERENCE_PREFIX)
    ? ACHIEVEMENT_BUCKET_NAME
    : BUCKET_NAME;
  const prefix = bucketName === ACHIEVEMENT_BUCKET_NAME
    ? ACHIEVEMENT_REFERENCE_PREFIX
    : STORAGE_REFERENCE_PREFIX;
  const objectPath = reference.slice(prefix.length);
  const { data } = getSupabaseClient().storage
    .from(bucketName)
    .getPublicUrl(objectPath);

  return data.publicUrl;
}

export async function uploadDocumentationImage(file) {
  return uploadImageToBucket(file, BUCKET_NAME, STORAGE_REFERENCE_PREFIX, 'dokumentasi');
}

export async function uploadAchievementImage(file) {
  return uploadImageToBucket(file, ACHIEVEMENT_BUCKET_NAME, ACHIEVEMENT_REFERENCE_PREFIX, 'pencapaian');
}

async function uploadImageToBucket(file, bucketName, referencePrefix, imageType) {
  if (!EXTENSIONS_BY_TYPE[file.type]) {
    throw new Error('Pilih gambar JPG, PNG, WebP, atau GIF.');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Ukuran gambar maksimal 5 MB.');
  }

  const compressedFile = await compressImage(file);
  const extension = EXTENSIONS_BY_TYPE[compressedFile.type];

  const objectPath = `${crypto.randomUUID()}.${extension}`;
  const { error } = await getSupabaseClient().storage
    .from(bucketName)
    .upload(objectPath, compressedFile, {
      contentType: compressedFile.type,
      cacheControl: '31536000',
      upsert: false
    });

  if (error) {
    throw new Error(`Gagal mengunggah gambar ${imageType}: ${error.message}`);
  }

  return {
    reference: `${referencePrefix}${objectPath}`,
    originalSize: file.size,
    uploadedSize: compressedFile.size,
    wasCompressed: compressedFile.size < file.size
  };
}

async function compressImage(file) {
  if (file.type === 'image/gif') return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, outputType, JPEG_QUALITY);
  });
  if (!blob || blob.size >= file.size) return file;

  const extension = outputType === 'image/png' ? 'png' : 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${baseName}.${extension}`, {
    type: outputType,
    lastModified: Date.now()
  });
}

export async function removeDocumentationImages(references) {
  const referencesByBucket = new Map([
    [BUCKET_NAME, []],
    [ACHIEVEMENT_BUCKET_NAME, []]
  ]);
  references.forEach((reference) => {
    if (reference.startsWith(STORAGE_REFERENCE_PREFIX)) {
      referencesByBucket.get(BUCKET_NAME).push(reference.slice(STORAGE_REFERENCE_PREFIX.length));
    } else if (reference.startsWith(ACHIEVEMENT_REFERENCE_PREFIX)) {
      referencesByBucket.get(ACHIEVEMENT_BUCKET_NAME).push(reference.slice(ACHIEVEMENT_REFERENCE_PREFIX.length));
    }
  });

  for (const [bucketName, objectPaths] of referencesByBucket) {
    if (!objectPaths.length) continue;
    const { error } = await getSupabaseClient().storage.from(bucketName).remove(objectPaths);
    if (error) {
      throw new Error(`Gagal menghapus gambar: ${error.message}`);
    }
  }
}
