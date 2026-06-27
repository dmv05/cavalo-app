import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <Link href="/" className="logo">
        🐴 Cav<span className="gold">alo</span>
      </Link>
      <div className="header-actions">
        <Link href="/publier" className="btn btn-gold">+ Publier</Link>
        <Link href="/compte" className="btn btn-outline">Compte</Link>
      </div>
    </header>
  );
}
