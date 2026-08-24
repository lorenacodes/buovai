/**
 * Instância única do cliente Supabase, compartilhada pelas páginas do painel.
 * Depende do UMD global `supabase` carregado via CDN.
 */
window.buovaiClient = supabase.createClient(
  window.BUOVAI_CONFIG.supabaseUrl,
  window.BUOVAI_CONFIG.supabaseKey
);
