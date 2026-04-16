import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "./firebase";
import { PickedFile } from "../types";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

const extensionFromName = (name: string) => {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return extension && extension !== name ? extension : "bin";
};

async function uriToBlob(uri: string) {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error("Dosya okunamadı. Lütfen tekrar dene.");
  }
  return response.blob();
}

function assertFileSize(blob: Blob, maxBytes: number) {
  if (blob.size > maxBytes) {
    throw new Error(`Dosya çok büyük. En fazla ${Math.floor(maxBytes / 1024 / 1024)} MB yükleyebilirsin.`);
  }
}

function contentTypeFor(file: PickedFile, blob: Blob) {
  return file.mimeType || blob.type || "application/octet-stream";
}

export async function uploadAvatar(uid: string, file: PickedFile) {
  if (!storage) {
    throw new Error("Firebase Storage ayarlı değil.");
  }

  const extension = extensionFromName(file.name);
  const path = `users/${uid}/avatars/profile-${Date.now()}.${extension}`;
  const storageRef = ref(storage, path);
  const blob = await uriToBlob(file.uri);
  const contentType = contentTypeFor(file, blob);

  assertFileSize(blob, MAX_AVATAR_BYTES);

  if (!contentType.startsWith("image/")) {
    throw new Error("Profil görseli bir görsel dosyası olmalı.");
  }

  await uploadBytes(storageRef, blob, {
    contentType
  });

  return {
    fileUrl: await getDownloadURL(storageRef),
    storagePath: path
  };
}

export async function uploadTaskAttachment(uid: string, taskId: string, file: PickedFile) {
  if (!storage) {
    throw new Error("Firebase Storage ayarlı değil.");
  }

  const extension = extensionFromName(file.name);
  const path = `users/${uid}/tasks/${taskId}/attachment-${Date.now()}.${extension}`;
  const storageRef = ref(storage, path);
  const blob = await uriToBlob(file.uri);
  const contentType = contentTypeFor(file, blob);

  assertFileSize(blob, MAX_ATTACHMENT_BYTES);

  await uploadBytes(storageRef, blob, {
    contentType
  });

  return {
    fileUrl: await getDownloadURL(storageRef),
    storagePath: path
  };
}

export async function deleteStoredFile(storagePath: string) {
  if (!storage || !storagePath) {
    return;
  }

  await deleteObject(ref(storage, storagePath));
}
