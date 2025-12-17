// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpslhunwcwohletjtmxu.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwc2xodW53Y3dvaGxldGp0bXh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk3NjE0NywiZXhwIjoyMDgxNTUyMTQ3fQ.x8Q8zzjfKagIC90i21quMLgHTsbQEnmVUzsAyK0mMv4';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
