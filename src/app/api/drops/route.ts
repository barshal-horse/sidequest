import { NextResponse } from 'next/server';
import { Drop, ChatMessage } from '@/types';
import { INITIAL_DROPS, INITIAL_DROP_CHATS } from '@/lib/constants';

// Shared in-memory state across all local network & client connections
// This ensures Device A, Device B, Device C on localhost / LAN (e.g. 192.168.x.x:3000)
// stay synchronized instantaneously in real-time.
let serverDrops: Drop[] = [...INITIAL_DROPS];
let serverDropChats: Record<string, ChatMessage[]> = { ...INITIAL_DROP_CHATS };
let serverDeletedDropIds = new Set<string>();

export async function GET() {
  return NextResponse.json({
    drops: serverDrops,
    dropChats: serverDropChats,
    deletedDropIds: Array.from(serverDeletedDropIds),
    timestamp: Date.now()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { drop } = body as { drop: Drop };
      if (!drop || !drop.id) {
        return NextResponse.json({ error: 'Invalid drop payload' }, { status: 400 });
      }

      // Check if drop already exists, prepend if new, update if existing
      const existingIdx = serverDrops.findIndex(d => d.id === drop.id);
      if (existingIdx >= 0) {
        serverDrops[existingIdx] = drop;
      } else {
        serverDrops = [drop, ...serverDrops];
      }

      // Initialize chat with host notice if not present
      if (!serverDropChats[drop.id]) {
        serverDropChats[drop.id] = [
          {
            id: `msg-${Date.now()}-init`,
            dropId: drop.id,
            userId: drop.host.id,
            handle: drop.host.handle,
            fullName: drop.host.fullName,
            avatarUrl: drop.host.avatarUrl,
            text: `Flare ignited at ${drop.venueName}! Heading there now, squad assemble 🚀`,
            timestamp: 'Just now',
            isSystem: false,
            isHost: true
          }
        ];
      }

      return NextResponse.json({
        success: true,
        action: 'create',
        drops: serverDrops,
        dropChats: serverDropChats
      });
    }

    if (action === 'join') {
      const { dropId, user } = body;
      const target = serverDrops.find(d => d.id === dropId);
      if (!target) {
        return NextResponse.json({ error: 'Drop not found' }, { status: 404 });
      }

      if (target.currentSlots < target.maxSlots && !target.members.some(m => m.userId === user.id)) {
        const newMember = {
          userId: user.id,
          handle: user.handle,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          isHost: false,
          checkedIn: false,
          joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const updatedMembers = [...target.members, newMember];
        target.members = updatedMembers;
        target.currentSlots = updatedMembers.length;
        if (updatedMembers.length >= target.maxSlots) {
          target.status = 'CONFIRMED';
        }

        const joinNotice: ChatMessage = {
          id: `msg-sys-${Date.now()}`,
          dropId,
          userId: user.id,
          handle: user.handle,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          text: `${user.fullName.split(' ')[0]} joined the party squad! 👋`,
          timestamp: 'Just now',
          isSystem: true
        };

        serverDropChats[dropId] = [...(serverDropChats[dropId] || []), joinNotice];
      }

      return NextResponse.json({
        success: true,
        action: 'join',
        drops: serverDrops,
        dropChats: serverDropChats
      });
    }

    if (action === 'leave') {
      const { dropId, userId, userFullName } = body;
      const target = serverDrops.find(d => d.id === dropId);
      if (target) {
        target.members = target.members.filter(m => m.userId !== userId);
        target.currentSlots = Math.max(0, target.members.length);
        target.status = 'OPEN';

        const leaveNotice: ChatMessage = {
          id: `msg-sys-${Date.now()}`,
          dropId,
          userId,
          handle: 'explorer',
          fullName: userFullName || 'Explorer',
          avatarUrl: '',
          text: `${(userFullName || 'Explorer').split(' ')[0]} stepped out of squad. 1 slot opened up!`,
          timestamp: 'Just now',
          isSystem: true
        };

        serverDropChats[dropId] = [...(serverDropChats[dropId] || []), leaveNotice];
      }

      return NextResponse.json({
        success: true,
        action: 'leave',
        drops: serverDrops,
        dropChats: serverDropChats
      });
    }

    if (action === 'checkin') {
      const { dropId, userId, userFullName } = body;
      const target = serverDrops.find(d => d.id === dropId);
      if (target) {
        target.members = target.members.map(m => m.userId === userId ? { ...m, checkedIn: true } : m);

        const checkInNotice: ChatMessage = {
          id: `msg-sys-${Date.now()}`,
          dropId,
          userId,
          handle: 'explorer',
          fullName: userFullName || 'Explorer',
          avatarUrl: '',
          text: `📍 ${(userFullName || 'Explorer').split(' ')[0]} verified live GPS check-in at ${target.venueName}! (+10 Karma)`,
          timestamp: 'Just now',
          isSystem: true
        };

        serverDropChats[dropId] = [...(serverDropChats[dropId] || []), checkInNotice];
      }

      return NextResponse.json({
        success: true,
        action: 'checkin',
        drops: serverDrops,
        dropChats: serverDropChats
      });
    }

    if (action === 'update') {
      const { dropId, updates, userId, userHandle } = body;
      const target = serverDrops.find(d => d.id === dropId);
      if (!target) {
        return NextResponse.json({ error: 'Drop not found' }, { status: 404 });
      }

      // Security check: only host can update
      if (userId && target.host.id !== userId && target.host.handle !== userHandle) {
        return NextResponse.json({ error: 'Unauthorized: only the squad host can edit this flare' }, { status: 403 });
      }

      // Apply allowable updates
      if (updates.title) target.title = updates.title.trim();
      if (updates.venueName) target.venueName = updates.venueName.trim();
      if (updates.hotspotName) target.hotspotName = updates.hotspotName.trim();
      if (updates.category) target.category = updates.category;
      if (typeof updates.maxSlots === 'number') {
        target.maxSlots = Math.max(target.members.length, Math.min(12, updates.maxSlots));
      }
      if (updates.expiresAt) target.expiresAt = updates.expiresAt;
      if (typeof updates.isGirlsOnly === 'boolean') target.isGirlsOnly = updates.isGirlsOnly;
      if (typeof updates.lat === 'number' && typeof updates.lng === 'number') {
        target.lat = updates.lat;
        target.lng = updates.lng;
      }
      target.lastModified = new Date().toISOString();

      const updateNotice: ChatMessage = {
        id: `msg-sys-${Date.now()}`,
        dropId,
        userId: userId || target.host.id,
        handle: userHandle || target.host.handle,
        fullName: target.host.fullName,
        avatarUrl: target.host.avatarUrl,
        text: `✏️ Flare updated: "${target.title}" at ${target.venueName}`,
        timestamp: 'Just now',
        isSystem: true
      };

      serverDropChats[dropId] = [...(serverDropChats[dropId] || []), updateNotice];

      return NextResponse.json({
        success: true,
        action: 'update',
        drop: target,
        drops: serverDrops,
        dropChats: serverDropChats
      });
    }

    if (action === 'delete') {
      const { dropId, userId, userHandle } = body;
      const target = serverDrops.find(d => d.id === dropId);
      if (!target) {
        return NextResponse.json({ error: 'Drop not found' }, { status: 404 });
      }

      // Security check: only host can delete
      if (userId && target.host.id !== userId && target.host.handle !== userHandle) {
        return NextResponse.json({ error: 'Unauthorized: only the squad host can delete this flare' }, { status: 403 });
      }

      // Remove from serverDrops and record tombstone
      serverDrops = serverDrops.filter(d => d.id !== dropId);
      serverDeletedDropIds.add(dropId);
      delete serverDropChats[dropId];

      return NextResponse.json({
        success: true,
        action: 'delete',
        deletedDropId: dropId,
        drops: serverDrops,
        dropChats: serverDropChats,
        deletedDropIds: Array.from(serverDeletedDropIds)
      });
    }

    if (action === 'report') {
      const { dropId } = body;
      const target = serverDrops.find(d => d.id === dropId);
      if (target) {
        target.isReported = true;
      }

      return NextResponse.json({
        success: true,
        action: 'report',
        dropId
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
