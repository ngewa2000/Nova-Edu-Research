import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { supabaseClient } from "./lib/supabase";

export const ordersRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const { data, error } = await supabaseClient
      .from("orders")
      .select(`
        *,
        services:service_id (title)
      `)
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data ?? [];
  }),

  create: authedQuery
    .input(
      z.object({
        service_id: z.number(),
        amount: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await supabaseClient
        .from("orders")
        .insert({
          user_id: ctx.user.id,
          service_id: input.service_id,
          amount: input.amount ?? null,
          description: input.description ?? null,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create order: ${error.message}`);
      }

      return data;
    }),

  listAll: adminQuery.query(async () => {
    const { data, error } = await supabaseClient
      .from("orders")
      .select(`
        *,
        services:service_id (title),
        profiles:user_id (full_name, email)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return data ?? [];
  }),
});
