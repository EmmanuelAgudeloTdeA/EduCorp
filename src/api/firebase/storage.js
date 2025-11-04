import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/**
 * Subir un archivo a Firebase Storage con seguimiento de progreso
 * @param {File} file - Archivo a subir
 * @param {string} path - Ruta en Storage (ej: 'videos/curso1.mp4')
 * @param {Function} onProgress - Callback para reportar progreso (0-100)
 * @returns {Promise<string>} URL de descarga del archivo
 */
export const uploadFile = (file, path, onProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Error al subir archivo:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

/**
 * Subir video de curso
 * @param {File} file - Archivo de video
 * @param {string} courseId - ID del curso
 * @param {Function} onProgress - Callback para progreso
 * @returns {Promise<string>} URL del video
 */
export const uploadCourseVideo = async (file, courseId, onProgress) => {
  const timestamp = Date.now();
  const fileName = `${courseId}_${timestamp}_${file.name}`;
  const path = `courses/videos/${fileName}`;
  
  return await uploadFile(file, path, onProgress);
};

/**
 * Subir imagen/thumbnail de curso
 * @param {File} file - Archivo de imagen
 * @param {string} courseId - ID del curso
 * @returns {Promise<string>} URL de la imagen
 */
export const uploadCourseThumbnail = async (file, courseId) => {
  const timestamp = Date.now();
  const fileName = `${courseId}_${timestamp}_${file.name}`;
  const path = `courses/thumbnails/${fileName}`;
  
  return await uploadFile(file, path);
};

/**
 * Eliminar un archivo de Storage
 * @param {string} url - URL del archivo a eliminar
 * @returns {Promise<void>}
 */
export const deleteFile = async (url) => {
  try {
    // Extraer la ruta del archivo de la URL
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    throw error;
  }
};

/**
 * Obtener referencia a un archivo
 * @param {string} path - Ruta del archivo
 * @returns {StorageReference}
 */
export const getFileRef = (path) => {
  return ref(storage, path);
};

