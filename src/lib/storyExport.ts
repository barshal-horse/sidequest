/**
 * Generates and downloads or shares a 9:16 Instagram / WhatsApp Story
 * graphic for any SideQuest Polaroid memory.
 */

export interface PolaroidExportData {
  title: string;
  photoUrl: string;
  locationName: string;
  cityName: string;
  squadMembers: { handle: string }[];
  caption?: string;
  vibeTag?: string;
}

export async function exportPolaroidStoryCard(data: PolaroidExportData): Promise<boolean> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      // 1. Dark Cyber Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
      bgGrad.addColorStop(0, '#09090C');
      bgGrad.addColorStop(0.5, '#121217');
      bgGrad.addColorStop(1, '#09090C');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Subtle Cyber Grid
      ctx.strokeStyle = 'rgba(204, 255, 0, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1080; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1920);
        ctx.stroke();
      }
      for (let y = 0; y < 1920; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1080, y);
        ctx.stroke();
      }

      // Outer Neon Frame
      ctx.strokeStyle = '#CCFF00';
      ctx.lineWidth = 6;
      ctx.strokeRect(40, 40, 1000, 1840);

      // Top Tag & Watermark
      ctx.fillStyle = '#CCFF00';
      ctx.font = 'bold 32px monospace';
      ctx.fillText('⚡ SIDEQUEST // VERIFIED MEMORY', 90, 120);

      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`📍 ${data.cityName.toUpperCase()}`, 990, 120);
      ctx.textAlign = 'left';

      // 2. Realistic Physical Polaroid Frame (Centered)
      const pX = 110;
      const pY = 220;
      const pW = 860;
      const pH = 1140;

      // Drop Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 20;

      // Polaroid Card Paper
      ctx.fillStyle = '#FDFDFD';
      ctx.beginPath();
      ctx.roundRect(pX, pY, pW, pH, 24);
      ctx.fill();

      // Reset Shadow for interior contents
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Top Washi Tape Graphic
      ctx.fillStyle = 'rgba(204, 255, 0, 0.75)';
      ctx.fillRect(pX + pW / 2 - 120, pY - 20, 240, 42);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(pX + pW / 2 - 120, pY - 20, 240, 42);

      // Photo Window (Square: 760 x 760)
      const photoMargin = 50;
      const photoX = pX + photoMargin;
      const photoY = pY + photoMargin;
      const photoSize = pW - photoMargin * 2; // 760

      // Draw photo with 1:1 cover crop
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoSize, photoSize, 12);
      ctx.clip();

      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, photoX, photoY, photoSize, photoSize);

      // Vintage Warm Film Glaze
      ctx.fillStyle = 'rgba(255, 230, 180, 0.08)';
      ctx.fillRect(photoX, photoY, photoSize, photoSize);

      // 90s Orange Timestamp on Photo
      const now = new Date();
      const yr = now.getFullYear().toString().slice(-2);
      const mo = String(now.getMonth() + 1).padStart(2, '0');
      const da = String(now.getDate()).padStart(2, '0');
      const hr = String(now.getHours()).padStart(2, '0');
      const mi = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `'${yr} ${mo} ${da}  ${hr}:${mi}`;

      ctx.font = 'bold 30px monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillText(timeStr, photoX + 22, photoY + photoSize - 22);
      ctx.fillStyle = '#FF7A00'; // Retro LCD Orange
      ctx.fillText(timeStr, photoX + 20, photoY + photoSize - 24);

      ctx.restore();

      // Polaroid Chin Scribble (Handwritten style)
      ctx.fillStyle = '#0A0A0C';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(data.title, photoX, photoY + photoSize + 70, photoSize);

      ctx.fillStyle = '#606070';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`📍 ${data.locationName}`, photoX, photoY + photoSize + 120, photoSize);

      if (data.caption) {
        ctx.fillStyle = '#303040';
        ctx.font = 'italic 26px sans-serif';
        const truncatedCaption = data.caption.length > 60 ? data.caption.slice(0, 57) + '...' : data.caption;
        ctx.fillText(`"${truncatedCaption}"`, photoX, photoY + photoSize + 170, photoSize);
      }

      // Vibe Badge on Polaroid
      if (data.vibeTag) {
        ctx.fillStyle = '#00F0FF';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(data.vibeTag, photoX + photoSize, photoY + photoSize + 220);
        ctx.textAlign = 'left';
      }

      // 3. Lower Social Proof Banner
      const bY = 1420;
      ctx.fillStyle = '#141418';
      ctx.beginPath();
      ctx.roundRect(110, bY, 860, 200, 20);
      ctx.fill();
      ctx.strokeStyle = '#24242B';
      ctx.lineWidth = 3;
      ctx.strokeRect(110, bY, 860, 200);

      ctx.fillStyle = '#CCFF00';
      ctx.font = 'bold 32px monospace';
      ctx.fillText('🛡️ ZERO-FLAKE IRL PROTOCOL', 150, bY + 60);

      ctx.fillStyle = '#F4F4F6';
      ctx.font = '26px monospace';
      const squadText = `VERIFIED SQUAD: @${data.squadMembers.map(m => m.handle).join('  @')}`;
      ctx.fillText(squadText, 150, bY + 110, 780);

      ctx.fillStyle = '#8E8E9F';
      ctx.font = '22px monospace';
      ctx.fillText('✓ GPS Hotspot Verified • 100% Turnout Karma', 150, bY + 155);

      // 4. Footer CTA
      ctx.fillStyle = '#CCFF00';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CLAIM A QUEST ON SIDEQUEST • ZERO FLAKES', 540, 1720);

      ctx.fillStyle = '#8E8E9F';
      ctx.font = '24px monospace';
      ctx.fillText('Spontaneous IRL Flares Across 7 Indian Metros', 540, 1765);
      ctx.textAlign = 'left';

      // 5. Convert to Blob & Share/Download
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        const fileName = `SideQuest-Polaroid-${Date.now()}.png`;
        const file = new File([blob], fileName, { type: 'image/png' });

        // Try Web Share API (mobile native Instagram/WhatsApp share)
        if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `SideQuest IRL Meetup: ${data.title}`,
              text: `Verified IRL meetup on SideQuest with the squad!`
            });
            resolve(true);
            return;
          } catch (e) {
            // User cancelled share or fallback to download
          }
        }

        // Fallback: Trigger direct PNG download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve(true);
      }, 'image/png');
    };

    img.onerror = () => {
      resolve(false);
    };

    img.src = data.photoUrl;
  });
}
