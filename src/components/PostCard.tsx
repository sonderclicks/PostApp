"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePostStatus, updatePostCaption, deletePost } from "@/app/actions";
import { downloadUrl } from "@/lib/downloadUrl";

type Post = {
  id: string;
  clientId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string | null;
  status: "pending" | "approved" | "needs_changes";
  feedbackNote: string | null;
};

const STATUS_LABEL: Record<Post["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  needs_changes: "Needs Changes",
};

const STATUS_CLASS: Record<Post["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  needs_changes: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default function PostCard({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(post.feedbackNote ?? "");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [caption, setCaption] = useState(post.caption ?? "");
  const [editingCaption, setEditingCaption] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function runUpdate(status: Post["status"], feedbackNote?: string) {
    startTransition(async () => {
      await updatePostStatus({ postId: post.id, clientId: post.clientId, status, feedbackNote });
      router.refresh();
      if (status !== "needs_changes") setShowNoteInput(false);
    });
  }

  function runCaptionSave() {
    startTransition(async () => {
      await updatePostCaption({ postId: post.id, clientId: post.clientId, caption });
      router.refresh();
      setEditingCaption(false);
    });
  }

  function runDelete() {
    startTransition(async () => {
      await deletePost({ postId: post.id, clientId: post.clientId, mediaUrl: post.mediaUrl });
      router.refresh();
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-black/5 text-left dark:border-white/10 dark:bg-white/5"
      >
        {post.mediaType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.mediaUrl} alt={post.caption ?? "Post"} className="h-full w-full object-cover" />
        ) : (
          <video src={post.mediaUrl} className="h-full w-full object-cover" muted />
        )}
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS[post.status]}`}
        >
          {STATUS_LABEL[post.status]}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-white p-5 sm:rounded-xl sm:p-6 dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
              {post.mediaType === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.mediaUrl} alt={post.caption ?? "Post"} className="w-full object-contain" />
              ) : (
                <video src={post.mediaUrl} className="w-full" controls />
              )}
            </div>

            <div className="mb-3">
              {editingCaption ? (
                <div>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption…"
                    rows={2}
                    autoFocus
                    className="w-full rounded-lg border border-black/15 px-3 py-2 text-base outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      disabled={pending}
                      onClick={runCaptionSave}
                      className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
                    >
                      Save caption
                    </button>
                    <button
                      disabled={pending}
                      onClick={() => {
                        setCaption(post.caption ?? "");
                        setEditingCaption(false);
                      }}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-black/60 dark:text-white/60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  {post.caption ? (
                    <p className="text-sm">{post.caption}</p>
                  ) : (
                    <p className="text-sm text-black/40 dark:text-white/40">No caption</p>
                  )}
                  <button
                    onClick={() => setEditingCaption(true)}
                    className="shrink-0 text-sm text-black/50 hover:underline dark:text-white/50"
                  >
                    {post.caption ? "Edit" : "Add caption"}
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS[post.status]}`}>
                {STATUS_LABEL[post.status]}
              </span>
            </div>

            {post.status === "needs_changes" && post.feedbackNote && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
                {post.feedbackNote}
              </p>
            )}

            {showNoteInput && (
              <div className="mb-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What needs to change?"
                  rows={3}
                  autoFocus
                  className="w-full rounded-lg border border-black/15 px-3 py-2 text-base outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40"
                />
                <button
                  disabled={pending}
                  onClick={() => runUpdate("needs_changes", note)}
                  className="mt-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  Save feedback
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={pending}
                onClick={() => runUpdate("approved")}
                className="rounded-lg bg-green-600 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={pending}
                onClick={() => setShowNoteInput(true)}
                className="rounded-lg bg-red-600 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                Needs Changes
              </button>
              <button
                disabled={pending}
                onClick={() => runUpdate("pending")}
                className="rounded-lg border border-black/15 px-3 py-2.5 text-sm font-medium disabled:opacity-50 dark:border-white/15"
              >
                Reset to Pending
              </button>
              <a
                href={downloadUrl(post.mediaUrl)}
                className="rounded-lg border border-black/15 px-3 py-2.5 text-center text-sm font-medium dark:border-white/15"
              >
                Download
              </a>
            </div>
            <button
              disabled={pending}
              onClick={runDelete}
              className="mt-2 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-black/50 hover:text-red-600 disabled:opacity-50 dark:text-white/50"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </>
  );
}
