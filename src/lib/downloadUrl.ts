export function downloadUrl(blobUrl: string) {
  const url = new URL(blobUrl);
  url.searchParams.set("download", "1");
  return url.toString();
}
