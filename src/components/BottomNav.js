import Link from 'next/link';

export default function BottomNav({ active }) {
  const items = [
    { href: '/', icon: '🏠', label: 'Accueil', key: 'home' },
    { href: '/recherche', icon: '🔍', label: 'Recherche', key: 'search' },
    { href: '/publier', icon: '➕', label: 'Publier', key: 'publish' },
    { href: '/favoris', icon: '❤️', label: 'Favoris', key: 'fav' },
    { href: '/compte', icon: '👤', label: 'Compte', key: 'account' },
  ];
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <Link key={it.key} href={it.href} className={active === it.key ? 'active' : ''}>
          <span className="icon">{it.icon}</span>
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
