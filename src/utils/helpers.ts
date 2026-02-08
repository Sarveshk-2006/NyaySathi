// Helper Functions for Legal Data Processing

export const getVerdictImage = (text: string, index: number) => {
  const t = text.toLowerCase();
  const images = {
    supremeCourt: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800&h=600",
    constitution: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800&h=600",
    criminal: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&q=80&w=800&h=600",
    corporate: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800&h=600",
    family: "https://images.unsplash.com/photo-1633613286991-611fe299c4be?auto=format&fit=crop&q=80&w=800&h=600",
    digital: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800&h=600",
    default: [
      "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&q=80&w=800&h=600",
      "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?auto=format&fit=crop&q=80&w=800&h=600",
    ]
  };

  if (t.includes("constitution") || t.includes("right")) return images.constitution;
  if (t.includes("criminal") || t.includes("murder") || t.includes("theft")) return images.criminal;
  if (t.includes("company") || t.includes("corporate") || t.includes("tax")) return images.corporate;
  if (t.includes("divorce") || t.includes("family") || t.includes("marriage")) return images.family;
  if (t.includes("digital") || t.includes("data") || t.includes("privacy")) return images.digital;
  if (t.includes("supreme court") || t.includes("high court")) return images.supremeCourt;
  
  return images.default[index % images.default.length];
};

export const parseVerdicts = (text: string): any[] => {
  try {
    if (!text || text.trim() === '') return [];
    if (/\|\s*Case Name\s*\|/i.test(text)) {
      const lines = text.split('\n').map((l) => l.trim()).filter((l) => l !== '');
      let headerIndex = lines.findIndex((l, i) => /\|\s*Case Name\s*\|/i.test(l) && i + 1 < lines.length && /^\|?\s*[-:]+/.test(lines[i + 1] || ''));
      if (headerIndex === -1) headerIndex = lines.findIndex((l) => l.startsWith('|'));
      const results: any[] = [];
      if (headerIndex !== -1) {
        for (let i = headerIndex + 2; i < lines.length; i++) {
          const ln = lines[i];
          if (!ln.startsWith('|')) continue;
          const cols = ln.split('|').slice(1, -1).map((c) => c.trim());
          const caseName = cols[0] || 'N/A';
          const date = cols[1] || 'N/A';
          const court = cols[2] || 'N/A';
          const significance = cols.slice(3).join(' | ') || '';
          results.push({ caseName, court, date, summary: significance });
        }
        return results.map((r, idx) => ({ id: idx, caseName: r.caseName, court: r.court, date: r.date, summary: r.summary }));
      }
    }
    const possibleBlocks = text.split(/\n{2,}/).map((b) => b.trim()).filter((b) => b !== '');
    if (possibleBlocks.length > 1) {
      return possibleBlocks.map((block, index) => ({
        id: index,
        caseName: block.split('\n')[0].slice(0, 120),
        court: 'Supreme Court',
        date: new Date().toLocaleDateString(),
        summary: block,
      }));
    }
    return [{ id: 0, caseName: 'Latest Legal Update', court: 'Supreme Court', date: new Date().toLocaleDateString(), summary: text.trim() }];
  } catch (e) {
    return [{ id: 0, caseName: 'Update', court: 'N/A', date: 'N/A', summary: text }];
  }
};
