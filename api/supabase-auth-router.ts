import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { supabaseClient, supabaseAdmin } from "./lib/supabase";

export const supabaseAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        fullName: z.string().min(2),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
            phone: input.phone ?? "",
          },
        },
      });

      if (authError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: authError.message,
        });
      }

      if (!authData.user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user",
        });
      }

      // Update profile with additional info
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({
          full_name: input.fullName,
          phone: input.phone ?? null,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName: input.fullName,
        },
      };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (authError) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      if (!authData.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Login failed. Please check your credentials.",
        });
      }

      // Get user profile
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      return {
        success: true,
        token: authData.session.access_token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName: profile?.full_name ?? authData.user.user_metadata?.full_name ?? "User",
          role: profile?.role ?? "user",
        },
      };
    }),

  me: authedQuery.query(async ({ ctx }) => {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", ctx.user.id)
      .single();

    return {
      id: ctx.user.id,
      email: ctx.user.email,
      fullName: profile?.full_name ?? ctx.user.full_name ?? "User",
      phone: profile?.phone ?? ctx.user.phone ?? null,
      university: profile?.university ?? null,
      course: profile?.course ?? null,
      role: profile?.role ?? ctx.user.role ?? "user",
    };
  }),

  logout: authedQuery.mutation(async () => {
    await supabaseClient.auth.signOut();
    return { success: true };
  }),
});
