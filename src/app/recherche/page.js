import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import ListingCard from '@/components/ListingCard';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const BREEDS = ['Selle Français', 'Pur-sang', 'Frison', 'Lusitanien', 'Quarter Horse', 'Arabe', 'Connemara', 'Shetland', 'Trotteur', 'Autre'];
const DISCIPLINES = ['CSO', 'Dressage', 'Loisir', 'Endurance', 'Western', 'Attelage', 'Complet'];
const SEXES = ['Hongre', 'Jument', 'Étalon'];

async function search(params) {
  const where = { status: 'active' };
  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { description: { contains: params.q, mode: 'insensitive' } },
      { breed: { contains: params.q, mode: 'insensitive' } },
      { region: { contains: params.q, mode: 'insensitive' } },
    ];
  }
  if (params.breed) where.breed = params.breed;
  if (params.discipline) where.discipline = params.discipline;
  if (params.sex) where.sex = params.sex;
  if (params.maxPrice) where.price = { lte: parseInt(params.maxPrice) };

  try {
    return await prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { photos: { orderBy: { order: 'asc' }, take: 1 } },
    });
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const listings = await search(params);

  return (
    <div className="page-pad">
      <Header />

      <form className="filters" method="get">
        <input
          className="filter-select"
          name="q"
          placeholder="🔍 Mot-clé"
          defaultValue={params.q || ''}
          style={{ minWidth: 140 }}
        />
        <select className="filter-select" name="breed" defaultValue={params.breed || ''}>
          <option value="">Race</option>
          {BREEDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="filter-select" name="discipline" defaultValue={params.discipline || ''}>
          <option value="">Discipline</option>
          {DISCIPLINES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="filter-select" name="sex" defaultValue={params.sex || ''}>
          <option value="">Sexe</option>
          {SEXES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" name="maxPrice" defaultValue={params.maxPrice || ''}>
          <option value="">Prix max</option>
          <option value="2000">≤ 2 000 €</option>
          <option value="5000">≤ 5 000 €</option>
          <option value="10000">≤ 10 000 €</option>
          <option value="25000">≤ 25 000 €</option>
          <option value="100000">≤ 100 000 €</option>
        </select>
        <button className="btn btn-brown" type="submit">Filtrer</button>
      </form>

      <div className="container">
        <p className="muted" style={{ marginBottom: '1rem' }}>
          {listings.length} résultat{listings.length > 1 ? 's' : ''}
        </p>
        {listings.length === 0 ? (
          <div className="empty">
            <div className="big">🔍</div>
            <p>Aucune annonce ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="grid">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>

      <BottomNav active="search" />
    </div>
  );
}
