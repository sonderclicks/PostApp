"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-black/20"
      >
        <h1 className="mb-1 text-xl font-semibold">Team Login</h1>
        <p className="mb-6 text-sm text-black/60 dark:text-white/60">
          Enter the shared team password to continue.
        </p>
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          className="mb-3 w-full rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-black/40 dark:border-white/15 dark:focus:border-white/40"
        />
        {state?.error && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-black px-3 py-2 font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {pending ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
