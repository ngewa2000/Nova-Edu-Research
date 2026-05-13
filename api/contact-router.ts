import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { supabaseClient } from "./lib/supabase";

export const contactRouter = createRouter({
  submit: publicQuery
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email"),
        phone: z.string().optional(),
        service: z.string().min(1, "Please select a service"),
        message: z.string().min(10, "Message must be at least 10 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabaseClient
        .from("contact_submissions")
        .insert({
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          service: input.service,
          message: input.message,
          status: "new",
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to submit contact form: ${error.message}`);
      }

      return { success: true, id: data.id };
    }),

  list: adminQuery.query(async () => {
    const { data, error } = await supabaseClient
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch submissions: ${error.message}`);
    }

    return data ?? [];
  }),
});
