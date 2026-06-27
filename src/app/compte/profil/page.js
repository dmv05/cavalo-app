'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ListingCard from '@/components/ListingCard';

export default function ProfilPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => {
        if (r.status === 401) {
          router.push('/compte');
          return null;
        }
        return r.json();
      })
      .then((j) => {
        if (j) setData(j);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/compte');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="page-pad">
        <Header />
        <div className="empty"><div className="big">⏳</div><p>Chargement...</p></div>
        <BottomNav active="account" />
      </div>
    );
  }

  const user = data?.user;
  const listings = data?.listings || [];

  return (
    <div className="page-pad">
      <Header />
      <div className="container">
        <div className="form" style={{ marginTop: '1.5rem' }}>
          <h2>Mon compte</h2>
          <p><strong>{user?.name}</strong></p>
          <p className="muted">{user?.email}</p>
          {user?.phone && <p className="muted">📞 {user.phone}</p>}
          {user?.region && <p className="muted">📍 {user.region}</p>}
          <button onClick={logout} className="btn btn-outline btn-block" style={{ marginTop: '1rem', color: 'var(--brown)', borderColor: 'var(--cream-dark)' }}>
            Se déconnecter
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0 0.8rem' }}>
          <h2 style={{ color: 'var(--brown)' }}>Mes annonces</h2>
          <Link href="/publier" className="btn btn-gold">+ Publier</Link>
        </div>

        {listings.length === 0 ? (
          <div className="empty">
            <div className="big">🐴</div>
            <p>Vous n'avez pas encore d'annonce.</p>
            <Link href="/publier" className="link-gold">Publier ma première annonce</Link>
          </div>
        ) : (
          <div className="grid">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
      <BottomNav active="account" />
    </div>
  );
}
