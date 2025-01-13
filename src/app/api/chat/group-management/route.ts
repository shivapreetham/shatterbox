// app/api/chat/group-management/route.ts
import prisma from '@/lib/prismadb';
import { NextResponse } from 'next/server';

async function addUserToGroups(email: string, userId: string) {
  const [year, level, course] = email.match(/^(20\d{2})(ug|pg)([a-z]+)/i)!;
  
  const groups = await Promise.all([
    ensureGroupExists({ year, level, course, isAnonymous: false }),
    ensureGroupExists({ year, level, course, isAnonymous: true })
  ]);

  await Promise.all(groups.map(group => 
    prisma.conversation.update({
      where: { id: group.id },
      data: { users: { connect: { id: userId } } }
    })
  ));
  return groups;
}

async function ensureGroupExists({ year, level, course, isAnonymous }: any) {
  const groupName = `${isAnonymous ? '##' : '#'}${year}${level}${course}`;
  
  return prisma.conversation.upsert({
    where: { name: groupName },
    update: {},
    create: {
      name: groupName,
      isGroup: true,
      isAnonymous
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email;

    // Get user by email
    const user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 });
    }

    await addUserToGroups(email, user.id);

    return NextResponse.json({
      success: true,
      message: 'User added to groups successfully'
    });

  } catch (error: any) {
    console.error('Error in group management:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to add user to groups' 
    }, { status: 500 });
  }
}