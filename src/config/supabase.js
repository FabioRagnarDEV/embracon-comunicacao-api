const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

module.exports = { supabaseAdmin, supabaseUrl, supabaseKey };
