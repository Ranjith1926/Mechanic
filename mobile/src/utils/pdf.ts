import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { API_BASE_URL } from "../api/apiClient";
import { getAccessToken } from "./tokenStorage";

async function downloadInvoicePdf(invoiceId: number, invoiceNumber: string): Promise<File> {
  const token = await getAccessToken();
  const destination = new File(Paths.cache, `${invoiceNumber}.pdf`);

  return File.downloadFileAsync(`${API_BASE_URL}/api/invoices/${invoiceId}/pdf`, destination, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    idempotent: true,
  });
}

export async function shareInvoicePdf(invoiceId: number, invoiceNumber: string) {
  const file = await downloadInvoicePdf(invoiceId, invoiceNumber);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: "application/pdf", dialogTitle: invoiceNumber });
  }

  return file.uri;
}

export async function printInvoicePdf(invoiceId: number, invoiceNumber: string) {
  const file = await downloadInvoicePdf(invoiceId, invoiceNumber);
  await Print.printAsync({ uri: file.uri });
}
