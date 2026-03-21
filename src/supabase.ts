import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iwrwhaonnmtkjkyrukhd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3cndoYW9ubm10a2preXJ1a2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODkzMjcsImV4cCI6MjA4OTY2NTMyN30.lLLt7gpk60_J7I_0sNC3CmuocReBmh3VxC9H98DOhyM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
