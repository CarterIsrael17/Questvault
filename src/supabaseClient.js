import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jikopeeidvhzkzqqvzco.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppa29wZWVpZHZoemt6cXF2emNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjMyODgsImV4cCI6MjA3OTAzOTI4OH0.117K6kQzB89kMBW94CMUbm5LiNue6Mnd7g7OSXFEr4U";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
