import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { supabaseClient } from "./lib/supabase";

export const testimonialsRouter = createRouter({
  list: publicQuery.query(async () => {
    const { data, error } = await supabaseClient
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch testimonials: ${error.message}`);
    }

    return data ?? [];
  }),

  create: adminQuery
    .input(
      z.object({
        author_name: z.string().min(1),
        course: z.string().min(1),
        university: z.string().min(1),
        rating: z.number().min(1).max(5),
        quote: z.string().min(1),
        display_date: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabaseClient
        .from("testimonials")
        .insert(input)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create testimonial: ${error.message}`);
      }

      return data;
    }),
});
