/**
 * Instância única do cliente Supabase, compartilhada pelos módulos da página.
 * Depende do UMD global `supabase` carregado via CDN em index.html.
 */
window.buovaiClient = supabase.createClient(
  window.BUOVAI_CONFIG.supabaseUrl,
  window.BUOVAI_CONFIG.supabaseKey
);
