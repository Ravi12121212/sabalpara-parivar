import React, { useEffect, useState } from 'react';
import RequireAdmin from '../components/RequireAdmin';
import { useAuth } from '../hooks/AuthContext';
import { notifications, NotificationDto } from '../api/notifications';

const BASE_URL = "https://api.sablapraparivar.in";
// const BASE_URL = "http://localhost:3000";

export function fileUrl(path?: string) {
    if (!path) return "";
    return `${BASE_URL}/${path.replace(/^\//, "")}`;
}


const Notifications: React.FC = () => {
    const { isAdmin } = useAuth();
    const [items, setItems] = useState<NotificationDto[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        try {
            const data = await notifications.list();
            setItems(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!file) return setPreview(null);
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!text && !file) return alert('લખાણ અથવા છબી આપો');
        setSubmitting(true);
        try {
            let imageUrl: string | undefined;
            if (file) {
                imageUrl = await notifications.upload(file);
            }
            const created = await notifications.create({ text: text || undefined, imageUrl });
            setText('');
            setFile(null);
            setPreview(null);
            setItems((s) => [created, ...s]);
        } catch (err: any) {
            console.error(err);
            alert(err?.message || 'સૂચના બનાવવામાં નિષ્ફળ થયાં');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="container notifications-page">
            <h1 className="notifications-title">સૂચનાઓ</h1>
            {isAdmin && (
                <RequireAdmin>
                    <section style={{ marginBottom: 24, background: '#fffef5', border: '1px solid #ffe08a', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderRadius: 14, padding: '1.25rem' }}>
                        <h3 style={{ margin: 0, marginBottom: '0.75rem', fontSize: 18, fontWeight: 600 }}>સૂચના બનાવો</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>લખાણ (વૈકલ્પિક)</label>
                                <textarea placeholder="લખાણ (વૈકલ્પિક)" value={text} onChange={(e) => setText(e.target.value)} rows={3} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #c7c7c7' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 4 }}>છબી (વૈકલ્પિક)</label>
                                <div className="file-picker">
                                    <input id="notification-file" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', border: 0 }} />
                                    <label htmlFor="notification-file" className="file-picker-button">ફાઇલ અપલોડ કરો (છબી)</label>
                                    <div className={`file-picker-filename ${preview ? '' : 'muted'}`}>{file ? file.name : 'કોઈ ફાઇલ પસંદ કરેલી નથી'}</div>
                                </div>
                            </div>
                            {preview && <img src={preview} alt="preview" style={{ maxHeight: 200, borderRadius: 8 }} />}
                            <div>
                                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ height: 40, padding: '0 16px', borderRadius: 8 }}>
                                    {submitting ? 'બનાવી રહ્યું છે...' : 'બનાવો'}
                                </button>
                            </div>
                        </form>
                    </section>
                </RequireAdmin>
            )}

            <section>
                {loading ? (
                    <p>Loading…</p>
                ) : items.length === 0 ? (
                    <p>હજુ સુધી કોઈ સૂચનાઓ નથી.</p>
                ) : (
                    <div className="notif-list">
                        {items.map((it, idx) => {
                            const id = (it._id || it.id) as string;
                            const raw = it.createdAt || '';
                            const d = raw ? new Date(raw) : null;

                            const dateLabel = d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';
                            const prev = items[idx - 1];
                            const prevDate = prev && prev.createdAt ? new Date(prev.createdAt) : null;
                            const prevLabel = prevDate && !Number.isNaN(prevDate.getTime()) ? prevDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';
                            const showSeparator = idx === 0 || dateLabel !== prevLabel;

                            const formatRelative = (date: Date | null) => {
                                if (!date || Number.isNaN(date.getTime())) return '-';
                                const diff = Math.floor((Date.now() - date.getTime()) / 1000);
                                if (diff < 10) return 'a few seconds ago';
                                if (diff < 60) return `${diff} seconds ago`;
                                if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
                                if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
                                // older: show short date
                                return date.toLocaleDateString();
                            };

                            const formatTime = (date: Date | null) => {
                                if (!date || Number.isNaN(date.getTime())) return '';
                                const hh = String(date.getHours()).padStart(2, '0');
                                const mm = String(date.getMinutes()).padStart(2, '0');
                                const ss = String(date.getSeconds()).padStart(2, '0');
                                return `${hh}:${mm}:${ss}`;
                            };

                            return (
                                <div key={id} className="notif-item">
                                    {showSeparator && dateLabel && (
                                        <div className="notif-date-sep"><div className="notif-date-pill">{dateLabel}</div></div>
                                    )}
                                    <div className="notif-row">
                                        <div style={{ flex: 1 }}>
                                            <div className="notif-bubble">
                                                {it.text ? <p>{it.text}</p> : null}
                                                {it.imageUrl && (
                                                    <div className="notif-image"><img src={fileUrl(it.imageUrl)} alt="notification" /></div>
                                                )}
                                           

                                            <div className="notif-meta-row">
                                                <div className="notif-relative">{formatRelative(d)}</div>
                                                <div className="notif-actions">
                                                    {isAdmin && <button className="notif-delete" onClick={async () => {
                                                        if (!confirm('આ સૂચના કાઢી નાખીએ?')) return;
                                                        try { await notifications.remove(id); setItems(items.filter(x => (x._id || x.id) !== id)); } catch (e: any) { alert(e?.message || 'કાઢી નાખવામાં નિષ્ફળ થયાં'); }
                                                    }}>કાઢી નાખો</button>}
                                                </div>
                                            </div>
                                             </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Notifications;
