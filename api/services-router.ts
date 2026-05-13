import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { supabaseClient } from "./lib/supabase";

export const servicesRouter = createRouter({
  list: publicQuery.query(async () => {
    const { data, error } = await supabaseClient
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch services: ${error.message}`);
    }

    return data ?? [];
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabaseClient
        .from("services")
        .select("*")
        .eq("slug", input.slug)
        .single();

      if (error) {
        throw new Error(`Failed to fetch service: ${error.message}`);
      }

      return data;
    }),

  create: adminQuery
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().min(1),
        price: z.string().min(1),
        icon_name: z.string().min(1),
        features: z.array(z.string()).default([]),
        sort_order: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabaseClient
        .from("services")
        .insert(input)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create service: ${error.message}`);
      }

      return data;
    }),
});
