'use client';

import React from 'react';
import { useSideQuestStore } from '@/lib/store';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/AlertDialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { playRadarBlip } from '@/lib/audio';

export default function DeleteDropDialog() {
  const { deletingDropId, setDeletingDropId, drops, deleteDrop, setActiveDropId } = useSideQuestStore();

  const targetDrop = drops.find(d => d.id === deletingDropId);

  if (!deletingDropId || !targetDrop) return null;

  const handleDelete = () => {
    playRadarBlip();
    deleteDrop(deletingDropId);
    setActiveDropId(null);
  };

  return (
    <AlertDialog open={Boolean(deletingDropId)} onOpenChange={(open) => !open && setDeletingDropId(null)}>
      <AlertDialogContent className="border-[#FF0055]/30">
        <AlertDialogHeader>
          <div className="mx-auto sm:mx-0 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF0055]/15 border border-[#FF0055]/30 text-[#FF0055] mb-2">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <AlertDialogTitle className="text-base text-white">
            Extinguish Flare?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-[#8E8E9F] space-y-2">
            <span className="block">
              You are about to delete <strong className="text-white">"{targetDrop.title}"</strong> at <span className="text-[#CCFF00]">{targetDrop.venueName}</span>.
            </span>
            <span className="block text-[11px] text-[#FF0055]/90 bg-[#FF0055]/10 p-2.5 rounded-lg border border-[#FF0055]/20">
              ⚠️ This will immediately cancel the meetup, disband the squad lobby ({targetDrop.currentSlots}/{targetDrop.maxSlots} joined), and remove the signal from radar across all devices.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeletingDropId(null)}>
            Keep Active
          </AlertDialogCancel>
          <AlertDialogAction variant="danger" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Extinguish Flare
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
