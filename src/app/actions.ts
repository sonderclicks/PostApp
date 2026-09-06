"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function createClient(formData: FormData) {
  const name = formData.get("name");
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Client name is required.");
  }

  await prisma.client.create({ data: { name: name.trim() } });
  revalidatePath("/");
}

export async function createPost(input: {
  clientId: string;
  month: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
}) {
  const last = await prisma.post.findFirst({
    where: { clientId: input.clientId, month: input.month },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.post.create({
    data: {
      clientId: input.clientId,
      month: input.month,
      mediaUrl: input.mediaUrl,
      mediaType: input.mediaType,
      caption: input.caption?.trim() || null,
      order: (last?.order ?? -1) + 1,
    },
  });
  revalidatePath(`/clients/${input.clientId}`);
}

export async function reorderPosts(input: { clientId: string; orderedIds: string[] }) {
  await prisma.$transaction(
    input.orderedIds.map((id, index) =>
      prisma.post.update({ where: { id }, data: { order: index } })
    )
  );
  revalidatePath(`/clients/${input.clientId}`);
}

export async function updatePostStatus(input: {
  postId: string;
  clientId: string;
  status: "pending" | "approved" | "needs_changes";
  feedbackNote?: string;
}) {
  await prisma.post.update({
    where: { id: input.postId },
    data: {
      status: input.status,
      feedbackNote: input.status === "needs_changes" ? input.feedbackNote?.trim() || null : null,
    },
  });
  revalidatePath(`/clients/${input.clientId}`);
}

export async function updatePostCaption(input: { postId: string; clientId: string; caption: string }) {
  await prisma.post.update({
    where: { id: input.postId },
    data: { caption: input.caption.trim() || null },
  });
  revalidatePath(`/clients/${input.clientId}`);
}

export async function deletePost(input: { postId: string; clientId: string; mediaUrl: string }) {
  await prisma.post.delete({ where: { id: input.postId } });
  await del(input.mediaUrl).catch(() => {});
  revalidatePath(`/clients/${input.clientId}`);
}
