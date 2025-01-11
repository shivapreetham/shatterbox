// app/api/users/status/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prismadb';
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const body = await req.json();
    const { isOnline } = body;

    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        activeStatus: isOnline,
        lastSeen: new Date()
      }
    });

    return Response.json({ success: true });
  } catch (error) {
    return new Response('Internal Error', { status: 500 });
  }
}