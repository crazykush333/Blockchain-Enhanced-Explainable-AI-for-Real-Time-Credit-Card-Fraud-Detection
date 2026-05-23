import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://esxtsnlvgyybhlcmqlpn.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRiMTcyMzkyLTYxZDktNDBmNC05NjI2LWQyNTU3MDBlNjU5MyJ9.eyJwcm9qZWN0SWQiOiJlc3h0c25sdmd5eWJobGNtcWxwbiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY4NTUzNTUyLCJleHAiOjIwODM5MTM1NTIsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.zuczhGblgM-J2GuyqRa31FfMXtK4-8NBtyDHA1-s5pk';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };