import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getListing(id) {
  try {
    return await prisma.listing.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { order: 'asc' } },
        seller: { select: { name: true, phone: true, region: true } },
      },
    });
  } catch {
    return null;
  }
}

export default async function ListingPage({ params }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const main = listing.photos?.[0]?.url;

  const specs = [
    { label: 'Race', value: listing.breed },
    { label: 'Âge', value: `${listing.age} ans` },
    { label: 'Sexe', value: listing.sex },
    { label: 'Taille', value: listing.height ? `${listing.height} cm` : '—' },
    { label: 'Discipline', value: listing.discipline || '—' },
    { label: 'Robe', value: listing.color || '—' },
  ];

  return (
    <div className="page-pad">
      <Header />
      <div className="container">
        <Link href="/recherche" className="muted">← Retour aux annonces</Link>

        {main ? (
          <img className="detail-img" src={main} alt={listing.title} style={{ marginTop: '0.8rem' }} />
        ) : (
          <div className="detail-img" style={{ marginTop: '0.8rem' }}>🐴</div>
        )}

        {listing.photos.length > 1 && (
          <div className="detail-thumbs">
            {listing.photos.map((p) => (
              <img key={p.id} src={p.url} alt="" />
            ))}
          </div>
        )}

        {listing.videoUrl && (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ color: 'var(--brown)', marginBottom: '0.5rem' }}>🎥 Vidéo</h3>
            <video
              src={listing.videoUrl}
              controls
              playsInline
              style={{ width: '100%', borderRadius: 'var(--radius)', maxHeight: 360, background: '#000' }}
            />
          </div>
        )}

        <h1 style={{ marginTop: '1rem', color: 'var(--brown)' }}>{listing.title}</h1>
        <div className="card-price" style={{ fontSize: '1.6rem', margin: '0.4rem 0' }}>
          {listing.price.toLocaleString('fr-FR')} €
        </div>
        <div className="muted">📍 {listing.region}, {listing.country}</div>

        <div className="spec-grid">
          {specs.map((s) => (
            <div key={s.label} className="spec">
              <div className="spec-label">{s.label}</div>
              <div className="spec-value">{s.value}</div>
            </div>
          ))}
        </div>

        <h3 style={{ color: 'var(--brown)', marginBottom: '0.5rem' }}>Description</h3>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{listing.description}</p>

        <div className="form" style={{ marginTop: '1.5rem' }}>
          <h2>Contacter le vendeur</h2>
          <p><strong>{listing.seller.name}</strong></p>
          {listing.seller.phone && <p className="muted">📞 {listing.seller.phone}</p>}
          <a href={`/annonce/${listing.id}/contact`} className="btn btn-gold btn-block" style={{ marginTop: '0.8rem' }}>
            Envoyer un message
          </a>
        </div>
      </div>
      <BottomNav active="search" />
    </div>
  );
}
