// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mvebfpyxwpxyjzcwkhcl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12ZWJmcHl4d3B4eWp6Y3draGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMjg1MzgsImV4cCI6MjA1NzcwNDUzOH0.6au7ohslVt4_QWSEprutC7XaEun5tcdprHiyrS60l5U";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);