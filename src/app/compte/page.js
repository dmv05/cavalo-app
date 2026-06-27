'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function ComptePage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // login | register
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.target);
    const data = Object.fromEntries(form);
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Erreur.');
        setLoading(false);
        return;
      }
      router.push('/compte/profil');
      router.refresh();
    } catch {
      setError('Erreur de connexion.');
      setLoading(false);
    }
  }

  return (
    <div className="page-pad">
      <Header />
      <div className="form">
        <h2>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h2>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="field">
                <label>Nom complet</label>
                <input name="name" required />
              </div>
              <div className="field">
                <label>Téléphone (optionnel)</label>
                <input name="phone" type="tel" />
              </div>
              <div className="field">
                <label>Région (optionnel)</label>
                <input name="region" placeholder="Ex : Hautes-Alpes" />
              </div>
            </>
          )}
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" required />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input name="password" type="password" required minLength={6} />
          </div>
          <button className="btn btn-gold btn-block" disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>

        <p className="center muted" style={{ marginTop: '1rem' }}>
          {mode === 'login' ? (
            <>Pas encore de compte ?{' '}
              <span className="link-gold" style={{ cursor: 'pointer' }} onClick={() => { setMode('register'); setError(''); }}>
                Inscrivez-vous
              </span>
            </>
          ) : (
            <>Déjà inscrit ?{' '}
              <span className="link-gold" style={{ cursor: 'pointer' }} onClick={() => { setMode('login'); setError(''); }}>
                Connectez-vous
              </span>
            </>
          )}
        </p>
      </div>
      <BottomNav active="account" />
    </div>
  );
}
