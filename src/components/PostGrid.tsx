"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PostCard from "./PostCard";
import { reorderPosts } from "@/app/actions";

type Post = {
  id: string;
  clientId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string | null;
  status: "pending" | "approved" | "needs_changes";
  feedbackNote: string | null;
};

export default function PostGrid({ clientId, posts }: { clientId: string; posts: Post[] }) {
  const [items, setItems] = useState(posts);
  const [dragId, setDragId] = useState<string | null>(null);
  const [syncedKey, setSyncedKey] = useState(JSON.stringify(posts));
  const router = useRouter();

  const postsKey = JSON.stringify(posts);
  if (postsKey !== syncedKey) {
    setSyncedKey(postsKey);
    setItems(posts);
  }

  function persistOrder(next: Post[]) {
    setItems(next);
    reorderPosts({ clientId, orderedIds: next.map((p) => p.id) }).then(() => router.refresh());
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;

    const fromIndex = items.findIndex((p) => p.id === dragId);
    const toIndex = items.findIndex((p) => p.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setDragId(null);
    persistOrder(next);
  }

  function moveBy(id: string, delta: number) {
    const index = items.findIndex((p) => p.id === id);
    const newIndex = index + delta;
    if (index === -1 || newIndex < 0 || newIndex >= items.length) return;

    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(newIndex, 0, moved);
    persistOrder(next);
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((post, index) => (
        <div
          key={post.id}
          draggable
          onDragStart={() => setDragId(post.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(post.id)}
          className={`relative ${dragId === post.id ? "cursor-grabbing opacity-50" : "cursor-grab"}`}
        >
          <PostCard post={post} />
          <div className="absolute bottom-1.5 right-1.5 flex gap-1 rounded-lg bg-black/50 p-0.5 backdrop-blur-sm">
            <button
              type="button"
              aria-label="Move earlier"
              disabled={index === 0}
              onClick={() => moveBy(post.id, -1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-white disabled:opacity-30"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Move later"
              disabled={index === items.length - 1}
              onClick={() => moveBy(post.id, 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-white disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
