import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { supabaseClient } from "./lib/supabase";

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  university: string | null;
  course: string | null;
  role: string;
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  try {
    // Get the auth token from the Authorization header
    const authHeader = opts.req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token) {
      // Verify the token with Supabase
      const { data: { user: authUser }, error } = await supabaseClient.auth.getUser(token);

      if (authUser && !error) {
        // Get the user's profile
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        ctx.user = {
          id: authUser.id,
          email: authUser.email ?? "",
          full_name: profile?.full_name ?? authUser.user_metadata?.full_name ?? null,
          phone: profile?.phone ?? authUser.user_metadata?.phone ?? null,
          university: profile?.university ?? null,
          course: profile?.course ?? null,
          role: profile?.role ?? "user",
        };
      }
    }
  } catch {
    // Authentication is optional
  }

  return ctx;
}
