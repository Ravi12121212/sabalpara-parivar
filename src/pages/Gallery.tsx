import React, { useEffect, useMemo, useRef, useState } from 'react';
import { gallery, GalleryItemDto } from '../api/gallery';
import { useAuth } from '../hooks/AuthContext';

const BASE_URL = "https://api.sablapraparivar.in";
// const BASE_URL = "http://localhost:3000";

export function fileUrl(path?: string) {
  if (!path) return "";
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
}

const GalleryPage: React.FC = () => {
  const { isAdmin } = useAuth() as any;
  const [items, setItems] = useState<GalleryItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const lastWheel = useRef<number>(0);

  const load = async (q?: string) => {
    try {
      setLoading(true);
      const list = await gallery.list(q);
      setItems(list);
      // derive unique non-empty titles from loaded items
      const uniq = Array.from(new Set((list || []).map(i => (i.title || '').toString().trim()).filter(Boolean)));
      setTitles(uniq);
      // default selected title to first available if not already selected
      if (!selectedTitle && uniq.length) setSelectedTitle(uniq[0]);
      setError(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const downloadCurrentImage = async () => {
    const current = items[viewerIndex];
    if (!current?.imageUrl) return;

    const imageUrl = fileUrl(current.imageUrl);
    const fileName =
      (current.title?.replace(/\s+/g, '_') || 'gallery-image') +
      '-' +
      (viewerIndex + 1) +
      '.jpg';

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // important for canvas export
      img.src = imageUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // draw image
      ctx.drawImage(img, 0, 0);

      // export as JPG
      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        },
        'image/jpeg',
        0.95 // quality (0–1)
      );
    } catch (err) {
      setError('Failed to download image');
    }
  };



  useEffect(() => { load(); }, []);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      load(search.trim() || undefined);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  // close dropdown on outside click
  const searchRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!searchRef.current) return;
      if (!searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = Array.from(e.target.files || []);
    if (!fl.length) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const valid = fl.filter(f => allowed.includes(f.type) && f.size <= 5 * 1024 * 1024);
    if (!valid.length) { setError('Only JPG/PNG/WEBP up to 5MB'); return; }
    setError(null);
    setFiles(valid);
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length) { setError('Choose images'); return; }
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    try {
      const urls = await gallery.uploadMany(files);
      const createdMany = await gallery.bulkCreate(urls.map(u => ({ imageUrl: u, title: title.trim() || undefined })));
      setItems([...(createdMany || []), ...items]);
      setFiles([]);
      setTitle('');
      (document.getElementById('gallery-file') as HTMLInputElement | null)?.value && ((document.getElementById('gallery-file') as HTMLInputElement).value = '');
      setError(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to add';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    const ok = confirm('Delete this image?');
    if (!ok) return;
    try {
      await gallery.remove(id);
      setItems(items.filter(i => (i.id || i._id) !== id));
      setError(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to delete';
      setError(msg);
    }
  };

  const deleteCurrent = async () => {
    const cur = items[viewerIndex];
    if (!cur) return;
    const id = (cur.id || cur._id) as string;
    const ok = confirm('Delete this image?');
    if (!ok) return;
    try {
      await gallery.remove(id);
      const nextItems = items.filter(i => (i.id || i._id) !== id);
      setItems(nextItems);
      if (nextItems.length === 0) {
        setViewerOpen(false);
        return;
      }
      setViewerIndex((prev) => Math.min(prev, nextItems.length - 1));
      setError(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to delete';
      setError(msg);
    }
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };
  const closeViewer = () => setViewerOpen(false);
  const nextImage = () => setViewerIndex((i) => (i + 1) % items.length);
  const prevImage = () => setViewerIndex((i) => (i - 1 + items.length) % items.length);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewerOpen, items.length]);

  return (
    <div className="gallery-page" style={{ maxWidth: 980, margin: '0 auto', padding: '1rem' }}>
      <h2 style={{ margin: '0 0 1rem', fontSize: 24, fontWeight: 800 }}>Gallery</h2>
      {error && <div style={{ background: '#fdecea', border: '1px solid #f5c2c0', padding: '0.5rem 0.75rem', color: '#b23b34', borderRadius: 8, marginBottom: '0.75rem' }}>{error}</div>}

      {/* Search */}
      <div style={{ marginBottom: '0.75rem' }} ref={searchRef}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search by title…"
          style={{ width: '100%', height: 40, border: '1px solid #c7c7c7', borderRadius: 8, padding: '0 12px' }}
        />
        {showDropdown && titles.length > 0 && (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', zIndex: 30, left: 0, right: 0, background: 'white', border: '1px solid #eee', borderRadius: 8, marginTop: 8, boxShadow: '0 6px 18px rgba(2,6,23,0.08)', maxHeight: 220, overflow: 'auto' }}>
              {titles.map((t) => (
                <div key={t} onClick={() => {
                  setSelectedTitle(t);
                  setSearch(t);
                  setShowDropdown(false);
                  load(t);
                }} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f6f6f6' }}>{t}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <section style={{ background: '#fffef5', border: '1px solid #ffe08a', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, marginBottom: '0.75rem', fontSize: 18, fontWeight: 600 }}>Add Images</h3>
          <form onSubmit={onAdd} className="add-form-grid" style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1.1fr 0.9fr auto', alignItems: 'end' }}>
            <div>
              <label htmlFor="gallery-title" style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>Title <span style={{ color: '#b23b34' }}>(required)</span></label>
              <input id="gallery-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Event 2025" style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #c7c7c7', background: '#fff' }} />
            </div>
            <div>
              <label htmlFor="gallery-file" style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>Images</label>
              <div className="file-picker">
                <input id="gallery-file" type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={onPick} style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', border: 0 }} />
                <label htmlFor="gallery-file" className="file-picker-button">Select images</label>
                <div className={`file-picker-filename ${files.length ? '' : 'muted'}`}>{files.length ? `${files.length} file(s)` : 'No file chosen'}</div>
              </div>
            </div>
            <button type="submit" disabled={saving} className="add-form-submit" style={{ height: 40, padding: '0 16px', borderRadius: 8, border: '1px solid #1976d2', background: saving ? '#90caf9' : '#2196f3', color: 'white', fontWeight: 700 }}>
              {saving ? 'Saving…' : `Add ${files.length ? `(${files.length})` : ''}`}
            </button>
          </form>
        </section>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="gallery-grid">
          {items.map((item, idx) => {
            const id = (item.id || item._id)!;
            return (
              <div key={id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ position: 'relative', paddingTop: '70%', overflow: 'hidden', cursor: 'zoom-in' }} onClick={() => openViewer(idx)}>
                  <img src={fileUrl(item.imageUrl)} alt={item.title || 'Gallery'} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {/* Action bar removed as per requirement (delete only inside lightbox) */}
              </div>
            );
          })}
        </div>
      )}
      {/* Fullscreen Viewer */}
      {viewerOpen && items.length > 0 && (
        <div
          className="lightbox"
          onWheel={(e) => {
            const now = Date.now();
            if (now - lastWheel.current < 400) return;
            lastWheel.current = now;
            if (e.deltaY > 0) nextImage(); else prevImage();
          }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const start = touchStartX.current;
            touchStartX.current = null;
            if (start == null) return;
            const dx = e.changedTouches[0].clientX - start;
            if (Math.abs(dx) > 40) { if (dx < 0) nextImage(); else prevImage(); }
          }}
        >
          <div className="lightbox-backdrop" onClick={closeViewer} />
          <div className="lightbox-content">
            <button className="lightbox-close" aria-label="Close" onClick={closeViewer}>×</button>
            <button className="lightbox-prev" aria-label="Previous" onClick={prevImage}>‹</button>
            <img src={fileUrl(items[viewerIndex].imageUrl)} alt="View" />
            <button className="lightbox-next" aria-label="Next" onClick={nextImage}>›</button>
            <button
              className="lightbox-download"
              title="Download"
              onClick={downloadCurrentImage}
            >
              ⬇️
            </button>
            {isAdmin && (
              <button className="lightbox-delete" aria-label="Delete" title="Delete" onClick={deleteCurrent}>🗑️</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;

