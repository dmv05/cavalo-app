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
  // Exactement 3 photos (slots fixes) + 1 vidéo
  const [photos, setPhotos] = useState([null, null, null]);
  const [photoPreviews, setPhotoPreviews] = useState([null, null, null]);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  function onPhoto(index, e) {
    const file = e.target.files?.[0] || null;
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    setPhotoPreviews((prev) => {
      const next = [...prev];
      next[index] = file ? URL.createObjectURL(file) : null;
      return next;
    });
  }

  function onVideo(e) {
    const file = e.target.files?.[0] || null;
    setVideo(file);
    setVideoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validation médias : 3 photos + 1 vidéo obligatoires
    if (photos.some((p) => !p)) {
      setError('Les 3 photos sont obligatoires.');
      return;
    }
    if (!video) {
      setError('La vidéo est obligatoire.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload des 3 photos + la vidéo
      const fd = new FormData();
      photos.forEach((f) => fd.append('photos', f));
      fd.append('video', video);
      const up = await fetch('/api/upload', { method: 'POST', body: fd });
      const upJson = await up.json();
      if (!up.ok) {
        setError(upJson.error || 'Erreur upload.');
        setLoading(false);
        return;
      }

      // 2. Création de l'annonce
      const form = new FormData(e.target);
      const data = Object.fromEntries(form);
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, photos: upJson.urls, videoUrl: upJson.videoUrl }),
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
            <label>Photos * (exactement 3)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[0, 1, 2].map((i) => (
                <label key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px dashed var(--cream-dark)', borderRadius: 10, height: 90,
                  cursor: 'pointer', overflow: 'hidden', position: 'relative', background: 'var(--cream)',
                }}>
                  {photoPreviews[i] ? (
                    <img src={photoPreviews[i]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>📷 Photo {i + 1}</span>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => onPhoto(i, e)} style={{ display: 'none' }} />
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Vidéo * (1 obligatoire — MP4, WebM ou MOV, 50 Mo max)</label>
            <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={onVideo} />
            {videoPreview && (
              <video src={videoPreview} controls style={{ width: '100%', marginTop: '0.5rem', borderRadius: 10, maxHeight: 220 }} />
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
