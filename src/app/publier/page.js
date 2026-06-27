'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

const BREEDS = ['Selle Français', 'Pur-sang', 'Frison', 'Lusitanien', 'Quarter Horse', 'Arabe', 'Connemara', 'Shetland', 'Trotteur', 'Autre'];
const DISCIPLINES = ['CSO', 'Dressage', 'Loisir', 'Endurance', 'Western', 'Attelage', 'Complet'];
const SEXES = ['Hongre', 'Jument', 'Étalon'];

export default function PublierPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);

  function onFiles(e) {
    const list = Array.from(e.target.files).slice(0, 8);
    setFiles(list);
    setPreviews(list.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Upload des photos
      let photoUrls = [];
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append('photos', f));
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        const upJson = await up.json();
        if (!up.ok) {
          setError(upJson.error || 'Erreur upload.');
          setLoading(false);
          return;
        }
        photoUrls = upJson.urls;
      }

      // 2. Création de l'annonce
      const form = new FormData(e.target);
      const data = Object.fromEntries(form);
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, photos: photoUrls }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError('Connectez-vous pour publier une annonce.');
          setTimeout(() => router.push('/compte'), 1200);
        } else {
          setError(json.error || 'Erreur.');
        }
        setLoading(false);
        return;
      }
      router.push(`/annonce/${json.listing.id}`);
    } catch {
      setError('Erreur réseau.');
      setLoading(false);
    }
  }

  return (
    <div className="page-pad">
      <Header />
      <div className="form" style={{ maxWidth: 560 }}>
        <h2>Publier une annonce</h2>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Titre de l'annonce *</label>
            <input name="title" required placeholder="Ex : Jument Selle Français, 8 ans, CSO" />
          </div>

          <div className="field">
            <label>Photos (jusqu'à 8)</label>
            <input type="file" accept="image/*" multiple onChange={onFiles} />
            {previews.length > 0 && (
              <div className="detail-thumbs" style={{ marginTop: '0.5rem' }}>
                {previews.map((src, i) => <img key={i} src={src} alt="" />)}
              </div>
            )}
          </div>

          <div className="field">
            <label>Prix (€) *</label>
            <input name="price" type="number" required min="0" />
          </div>

          <div className="field">
            <label>Race *</label>
            <select name="breed" required defaultValue="">
              <option value="" disabled>Choisir...</option>
              {BREEDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Âge (années) *</label>
            <input name="age" type="number" required min="0" max="40" />
          </div>

          <div className="field">
            <label>Sexe *</label>
            <select name="sex" required defaultValue="">
              <option value="" disabled>Choisir...</option>
              {SEXES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Taille au garrot (cm)</label>
            <input name="height" type="number" min="50" max="220" />
          </div>

          <div className="field">
            <label>Discipline</label>
            <select name="discipline" defaultValue="">
              <option value="">— Aucune —</option>
              {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Robe</label>
            <input name="color" placeholder="Ex : Bai, Alezan, Gris..." />
          </div>

          <div className="field">
            <label>Région / Département *</label>
            <input name="region" required placeholder="Ex : Hautes-Alpes (05)" />
          </div>

          <div className="field">
            <label>Description *</label>
            <textarea name="description" required placeholder="Caractère, niveau, santé, raison de la vente..." />
          </div>

          <button className="btn btn-gold btn-block" disabled={loading}>
            {loading ? 'Publication...' : 'Publier mon annonce'}
          </button>
        </form>
      </div>
      <BottomNav active="publish" />
    </div>
  );
}
