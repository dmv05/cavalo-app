import Link from 'next/link';

export default function ListingCard({ listing }) {
  const photo = listing.photos?.[0]?.url;
  return (
    <Link href={`/annonce/${listing.id}`} className="card">
      {photo ? (
        <img className="card-img" src={photo} alt={listing.title} />
      ) : (
        <div className="card-img">🐴</div>
      )}
      <div className="card-body">
        <div className="card-title">{listing.title}</div>
        <div className="card-price">{listing.price.toLocaleString('fr-FR')} €</div>
        <div className="card-meta">
          <span className="badge">{listing.breed}</span>
          <span className="badge">{listing.age} ans</span>
          <span className="badge">{listing.sex}</span>
          {listing.discipline && <span className="badge">{listing.discipline}</span>}
        </div>
        <div className="card-meta">📍 {listing.region}</div>
      </div>
    </Link>
  );
}
