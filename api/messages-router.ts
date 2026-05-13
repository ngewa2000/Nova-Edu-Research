import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { supabaseClient } from "./lib/supabase";

export const messagesRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const { data, error } = await supabaseClient
      .from("messages")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return data ?? [];
  }),

  send: authedQuery
    .input(
      z.object({
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await supabaseClient
        .from("messages")
        .insert({
          user_id: ctx.user.id,
          sender: "user",
          content: input.content,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }

      return data;
    }),

  markAsRead: authedQuery
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await supabaseClient
        .from("messages")
        .update({ is_read: true })
        .eq("id", input.messageId)
        .eq("user_id", ctx.user.id);

      if (error) {
        throw new Error(`Failed to mark message as read: ${error.message}`);
      }

      return { success: true };
    }),
});
