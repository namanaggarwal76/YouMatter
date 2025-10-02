import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nercrhuqpbowarepsoev.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lcmNyaHVxcGJvd2FyZXBzb2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTEwNTAsImV4cCI6MjA3NDk2NzA1MH0.dRMhOtC0zDzsRIKd-LnY3EEutBfzcwjUaghD8BnbDL4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
