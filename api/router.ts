import { supabaseAuthRouter } from "./supabase-auth-router";
import { servicesRouter } from "./services-router";
import { testimonialsRouter } from "./testimonials-router";
import { contactRouter } from "./contact-router";
import { ordersRouter } from "./orders-router";
import { messagesRouter } from "./messages-router";
import { settingsRouter } from "./settings-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: supabaseAuthRouter,
  services: servicesRouter,
  testimonials: testimonialsRouter,
  contact: contactRouter,
  orders: ordersRouter,
  messages: messagesRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
