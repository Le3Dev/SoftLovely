import React, { useEffect, useState } from 'react';

// Defaults read from build-time env (NEXT_PUBLIC_*)
const envDefaults = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || '',
  stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
  maxFileSizeMb: process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '10',
  supportedLocales: process.env.NEXT_PUBLIC_SUPPORTED_LOCALES || 'pt',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
};

export default function SettingsPage() {
  const [appName, setAppName] = useState('');
  const [stripePublicKey, setStripePublicKey] = useState('');
  const [maxFileSizeMb, setMaxFileSizeMb] = useState('');
  const [supportedLocales, setSupportedLocales] = useState('');

  // selection indicates which URL option is chosen; customUrl holds the typed value
  const [selection, setSelection] = useState('default');
  const [customUrl, setCustomUrl] = useState('');

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const runtime = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('appConfig') || '{}') : {};
    setAppName(runtime.appName || envDefaults.appName);
    setStripePublicKey(runtime.stripePublicKey || envDefaults.stripePublicKey);
    setMaxFileSizeMb(runtime.maxFileSizeMb || envDefaults.maxFileSizeMb);
    setSupportedLocales(runtime.supportedLocales || envDefaults.supportedLocales);

    const runtimeUrl = runtime.apiBaseUrl || envDefaults.apiBaseUrl || '';

    if (runtime.apiBaseUrl) {
      if (runtimeUrl === envDefaults.apiBaseUrl) setSelection('default');
      else if (runtimeUrl === 'http://localhost:8080') setSelection('local');
      else if (runtimeUrl === 'https://staging.api.example.com') setSelection('staging');
      else if (runtimeUrl === 'https://api.example.com') setSelection('prod');
      else {
        setSelection('custom');
        setCustomUrl(runtimeUrl);
      }
    } else {
      // no runtime override: prefer showing default if env has value, else custom
      if (envDefaults.apiBaseUrl) setSelection('default');
      else setSelection('custom');
    }
  }, []);

  function getCurrentApiUrl() {
    if (selection === 'default') return envDefaults.apiBaseUrl || '';
    if (selection === 'local') return 'http://localhost:8080';
    if (selection === 'staging') return 'https://staging.api.example.com';
    if (selection === 'prod') return 'https://api.example.com';
    if (selection === 'custom') return customUrl || '';
    return '';
  }

  function handleSave(e) {
    e.preventDefault();
    const cfg = {
      appName,
      stripePublicKey,
      maxFileSizeMb,
      supportedLocales,
      apiBaseUrl: getCurrentApiUrl(),
    };
    localStorage.setItem('appConfig', JSON.stringify(cfg));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main style={{ padding: 20, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, ' + "'Helvetica Neue', Arial" }}>
      <h1>Configurações do Front</h1>
      <form onSubmit={handleSave} style={{ maxWidth: 780, display: 'grid', gap: 12 }}>
        <label>
          Nome da aplicação (default):
          <input value={appName} onChange={(e) => setAppName(e.target.value)} style={{ width: '100%', marginTop: 6 }} />
        </label>

        <label>
          Stripe public key (apenas public):
          <input value={stripePublicKey} onChange={(e) => setStripePublicKey(e.target.value)} style={{ width: '100%', marginTop: 6 }} />
        </label>

        <label>
          Tamanho máximo de upload (MB):
          <input type="number" value={maxFileSizeMb} onChange={(e) => setMaxFileSizeMb(e.target.value)} style={{ width: '200px', marginTop: 6 }} />
        </label>

        <label>
          Locales suportados (vírgula):
          <input value={supportedLocales} onChange={(e) => setSupportedLocales(e.target.value)} style={{ width: '100%', marginTop: 6 }} />
        </label>

        <label>
          URL da API (escolha por último):
          <select value={selection} onChange={(e) => setSelection(e.target.value)} style={{ width: '100%', marginTop: 6 }}>
            <option value="default">Default (env): {envDefaults.apiBaseUrl || '—'}</option>
            <option value="local">Local (http://localhost:8080)</option>
            <option value="staging">Staging (https://staging.api.example.com)</option>
            <option value="prod">Produção (https://api.example.com)</option>
            <option value="custom">Customizar...</option>
          </select>
        </label>

        {selection === 'custom' && (
          <label>
            URL custom:
            <input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', marginTop: 6 }} />
          </label>
        )}

        <div style={{ marginTop: 8 }}>
          <button type="submit">Salvar configurações</button>
          {saved && <span style={{ marginLeft: 10 }}>Salvo!</span>}
        </div>

        <p style={{ marginTop: 12, color: '#666' }}>
          Nota: variáveis <code>NEXT_PUBLIC_*</code> são lidas em build-time como defaults. O front permite sobrescrever a URL da API em runtime
          e salva em <code>localStorage</code> para testes imediatos.
        </p>

        <p style={{ color: '#666' }}>
          URL atual usada (runtime): <strong>{getCurrentApiUrl() || '—'}</strong>
        </p>
      </form>
    </main>
  );
}

