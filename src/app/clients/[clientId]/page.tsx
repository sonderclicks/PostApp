import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentMonth, formatMonth, shiftMonth } from "@/lib/month";
import UploadForm from "@/components/UploadForm";
import PostGrid from "@/components/PostGrid";

export const dynamic = "force-dynamic";

export default async function ClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { clientId } = await params;
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonth();

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) notFound();

  const posts = await prisma.post.findMany({
    where: { clientId, month },
    orderBy: { order: "asc" },
  });

  const prevMonth = shiftMonth(month, -1);
  const nextMonth = shiftMonth(month, 1);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 p-6 sm:p-10">
      <Link href="/" className="mb-4 inline-block text-sm text-black/60 hover:underline dark:text-white/60">
        ← All clients
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">{client.name}</h1>

      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/clients/${clientId}?month=${prevMonth}`}
          className="rounded-lg border border-black/15 px-3 py-1.5 text-sm dark:border-white/15"
        >
          ← Prev
        </Link>
        <span className="text-lg font-medium">{formatMonth(month)}</span>
        <Link
          href={`/clients/${clientId}?month=${nextMonth}`}
          className="rounded-lg border border-black/15 px-3 py-1.5 text-sm dark:border-white/15"
        >
          Next →
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <UploadForm clientId={clientId} month={month} />
        </div>
        {posts.length > 0 && (
          <a
            href={`/api/clients/${clientId}/download?month=${month}`}
            className="whitespace-nowrap rounded-lg border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/15"
          >
            Download all ({posts.length})
          </a>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-black/60 dark:text-white/60">No posts for this month yet.</p>
      ) : (
        <PostGrid
          clientId={clientId}
          posts={posts.map((post) => ({
            id: post.id,
            clientId: post.clientId,
            mediaUrl: post.mediaUrl,
            mediaType: post.mediaType,
            caption: post.caption,
            status: post.status,
            feedbackNote: post.feedbackNote,
          }))}
        />
      )}
    </div>
  );
}
