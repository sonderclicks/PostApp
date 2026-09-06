import { Readable } from "node:stream";
import archiver from "archiver";
import { prisma } from "@/lib/prisma";

function extensionFromUrl(url: string, mediaType: "image" | "video") {
  const pathname = new URL(url).pathname;
  const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
  if (match) return match[1];
  return mediaType === "video" ? "mp4" : "jpg";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  if (!month) {
    return new Response("Missing month", { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return new Response("Not found", { status: 404 });
  }

  const posts = await prisma.post.findMany({
    where: { clientId, month },
    orderBy: { order: "asc" },
  });

  const archive = archiver("zip", { zlib: { level: 9 } });

  (async () => {
    let index = 1;
    for (const post of posts) {
      try {
        const res = await fetch(post.mediaUrl);
        if (!res.ok || !res.body) continue;
        const nodeStream = Readable.fromWeb(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          res.body as any
        );
        const ext = extensionFromUrl(post.mediaUrl, post.mediaType);
        archive.append(nodeStream, { name: `${String(index).padStart(2, "0")}.${ext}` });
        index += 1;
      } catch {
        // skip files that fail to fetch
      }
    }
    archive.finalize();
  })();

  const safeName = client.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  return new Response(Readable.toWeb(archive) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeName}-${month}.zip"`,
    },
  });
}
