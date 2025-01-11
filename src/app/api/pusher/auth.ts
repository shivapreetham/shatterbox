// app/api/pusher/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/prismadb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse the request body as JSON since we changed content-type to application/json
    const body = await request.json();
    const { socket_id, channel_name } = body;

    if (!socket_id || !channel_name) {
      return new NextResponse('Missing data', { status: 400 });
    }

    // Only handle presence channels
    if (channel_name.startsWith('presence-')) {
      // Update user's online status and last seen in database
      const user = await prisma.user.update({
        where: {
          email: session.user.email
        },
        data: {
          activeStatus: true,
          lastSeen: new Date(),
        }
      });

      if (!user) {
        return new NextResponse('User not found', { status: 404 });
      }

      const presenceData = {
        user_id: user.id,
        user_info: {
          email: user.email,
          username: user.username,
          id: user.id,
          isVerified: user.isVerified,
          image: user.image,
          activeStatus: user.activeStatus,
          lastSeen: user.lastSeen
        }
      };

      // Set up disconnect webhook to track when users go offline
      const channelData = {
        user_id: user.id,
        user_info: presenceData.user_info,
        // Add server-side event handlers for user disconnection
        webhooks: {
          user_removed: async () => {
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  activeStatus: false,
                  lastSeen: new Date()
                }
              });
            } catch (error) {
              console.error('Error updating user offline status:', error);
            }
          }
        }
      };

      // Authorize the channel with the enhanced presence data
      const authResponse = await pusherServer.authorizeChannel(
        socket_id,
        channel_name,
        presenceData
      );

      return NextResponse.json(authResponse);
    }

    return new NextResponse('Invalid channel type', { status: 400 });
  } catch (error) {
    console.error('Pusher Auth Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Add a cleanup route to handle manual disconnections
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Update user status to offline
    await prisma.user.update({
      where: {
        email: session.user.email
      },
      data: {
        activeStatus: false,
        lastSeen: new Date()
      }
    });

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('Cleanup Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}