import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ListingCard from '@/components/ListingCard';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getListings() {
  try {
    return await prisma.listing.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 24,
      include: { photos: { orderBy: { order: 'asc' }, take: 1 } },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const listings = await getListings();

  return (
    <div className="page-pad">
      <Header />

      <section className="hero">
        <h1>Trouvez le cheval de vos rêves</h1>
        <p>Achat & vente entre particuliers et pros · 100% gratuit</p>
        <form className="search-bar" action="/recherche">
          <input name="q" placeholder="Race, discipline, région..." />
          <button className="btn btn-gold" type="submit">Rechercher</button>
        </form>
      </section>

      <div className="container">
        <h2 style={{ margin: '1rem 0', color: 'var(--brown)' }}>
          Dernières annonces
        </h2>

        {listings.length === 0 ? (
          <div className="empty">
            <div className="big">🐴</div>
            <p>Aucune annonce pour le moment.</p>
            <Link href="/publier" className="link-gold">Publiez la première !</Link>
          </div>
        ) : (
          <div className="grid">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}
