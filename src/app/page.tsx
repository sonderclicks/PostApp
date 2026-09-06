import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createClient } from "./actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6 sm:p-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
      </div>

      {clients.length === 0 ? (
        <p className="mb-8 text-sm text-black/60 dark:text-white/60">
          No clients yet. Add your first one below.
        </p>
      ) : (
        <ul className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/clients/${client.id}`}
                className="block rounded-xl border border-black/10 bg-white p-5 shadow-sm transition hover:border-black/30 dark:border-white/10 dark:bg-black/20 dark:hover:border-white/30"
              >
                <span className="font-medium">{client.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form
        action={createClient}
        className="flex max-w-sm gap-2 rounded-xl border border-black/10 p-4 dark:border-white/10"
      >
        <input
          type="text"
          name="name"
          placeholder="New client name"
          required
          className="flex-1 rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40"
        />
        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 font-medium text-white dark:bg-white dark:text-black"
        >
          Add client
        </button>
      </form>
    </div>
  );
}
