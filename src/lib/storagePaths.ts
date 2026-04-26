import { ref } from "firebase/storage";
import type { FirebaseStorage } from "firebase/storage";

/** Build a Storage ref from a download URL (Firebase GCS JSON API shape). */
export function refFromDownloadUrl(storage: FirebaseStorage, downloadUrl: string) {
  const encoded = downloadUrl.match(/\/o\/([^?]+)/)?.[1];
  if (!encoded) throw new Error("Not a Firebase Storage download URL");
  const path = decodeURIComponent(encoded);
  return ref(storage, path);
}
