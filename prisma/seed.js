// Données de démo pour tester l'app
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('demo1234', 10);

  const seller = await prisma.user.upsert({
    where: { email: 'demo@cavalo.app' },
    update: {},
    create: {
      email: 'demo@cavalo.app',
      password,
      name: 'Écurie de Démo',
      phone: '06 12 34 56 78',
      region: 'Hautes-Alpes',
    },
  });

  const demos = [
    { title: 'Jument Selle Français, 8 ans, niveau CSO', price: 12000, breed: 'Selle Français', age: 8, sex: 'Jument', height: 168, discipline: 'CSO', color: 'Bai', region: 'Hautes-Alpes (05)', description: 'Jument sympa, sage au travail comme en extérieur. Tourne sur des épreuves Club 1. Saute proprement. Vendue pour cause manque de temps.' },
    { title: 'Hongre Lusitanien, 6 ans, dressage', price: 9500, breed: 'Lusitanien', age: 6, sex: 'Hongre', height: 162, discipline: 'Dressage', color: 'Gris', region: 'Bouches-du-Rhône (13)', description: 'Magnifique hongre lusitanien, allures confortables, mental en or. Débuté en dressage, beaucoup de potentiel.' },
    { title: 'Poney Connemara, 10 ans, loisir famille', price: 4500, breed: 'Connemara', age: 10, sex: 'Hongre', height: 148, discipline: 'Loisir', color: 'Alezan', region: 'Isère (38)', description: 'Poney parfait pour la famille, monté par des enfants. Aucun vice, facile à attraper, charge en van.' },
    { title: 'Étalon Pur-sang Arabe, 5 ans, endurance', price: 15000, breed: 'Arabe', age: 5, sex: 'Étalon', height: 155, discipline: 'Endurance', color: 'Gris', region: 'Var (83)', description: 'Étalon arabe de lignée endurance. Très bon mental, excellente récupération. Déjà qualifié sur 90 km.' },
  ];

  for (const d of demos) {
    await prisma.listing.create({
      data: { ...d, country: 'France', sellerId: seller.id },
    });
  }

  console.log('✅ Seed terminé : 1 vendeur + ' + demos.length + ' annonces');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
