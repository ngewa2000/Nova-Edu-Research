import { createRouter, publicQuery } from "./middleware";
import { supabaseClient } from "./lib/supabase";

export const settingsRouter = createRouter({
  list: publicQuery.query(async () => {
    const { data, error } = await supabaseClient
      .from("site_settings")
      .select("*");

    if (error) {
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    // Convert to key-value object
    const settings: Record<string, string> = {};
    for (const row of data ?? []) {
      settings[row.key] = row.value;
    }

    return settings;
  }),
});
