import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/me — utilisateur courant + ses annonces
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, phone: true, region: true },
    });
    const listings = await prisma.listing.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { photos: { orderBy: { order: 'asc' }, take: 1 } },
    });
    return NextResponse.json({ user: dbUser, listings });
  } catch {
    return NextResponse.json({ user, listings: [] });
  }
}
