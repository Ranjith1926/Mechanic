export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function openBlobForPrint(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  win?.addEventListener("load", () => win.print());
}

export async function shareOrDownloadBlob(blob: Blob, filename: string, title: string) {
  const file = new File([blob], filename, { type: "application/pdf" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return;
    } catch {
      // User cancelled or share failed; fall back to download.
    }
  }

  downloadBlob(blob, filename);
}
