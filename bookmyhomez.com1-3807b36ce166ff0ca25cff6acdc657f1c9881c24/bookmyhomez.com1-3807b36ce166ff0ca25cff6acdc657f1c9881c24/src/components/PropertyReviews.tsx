import React, { useEffect, useState } from 'react';
import { Star, Trash2, Check, MessageCircle } from 'lucide-react';
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Property } from '../types';
import { waLink } from '../propertyUtils';

// Customer reviews on the property page.
// - The "Suresh Kumar" review is a real customer review (Ammu, Oct 31 2026) and shows exactly as it
//   did before: on every listing that has no reviews of its own.
// - New reviews are saved to Firestore `reviews` with status "pending"; they appear only after a
//   BookMyHomez team account approves them (Approve / Delete buttons below, team only).
//   The Firestore rules enforce this: the public can only create pending reviews and only
//   read approved ones.

interface Review {
  id?: string;
  name?: string;
  userName?: string;
  comment: string;
  rating: number;
  createdAt?: any;
}

const SURESH: Review = { name: 'Suresh Kumar', comment: 'Property is very clean and located in a prime area.', rating: 5 };

const byTime = (a: Review, b: Review) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);

interface Props {
  property: Property;
  propertyId: string;
  title: string;
  isAdmin: boolean;
}

export const PropertyReviews: React.FC<Props> = ({ property, propertyId, title, isAdmin }) => {
  const embedded = Array.isArray((property as any).reviews) ? ((property as any).reviews as Review[]) : [];
  const base = embedded.length > 0 ? embedded : [SURESH];

  const [approved, setApproved] = useState<Review[]>([]);
  const [pending, setPending] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    const watch = (status: 'approved' | 'pending', set: (r: Review[]) => void) =>
      onSnapshot(
        query(collection(db, 'reviews'), where('propertyId', '==', propertyId), where('status', '==', status)),
        (snap) => set(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Review) })).sort(byTime)),
        () => set([])
      );
    const offA = watch('approved', setApproved);
    const offP = isAdmin ? watch('pending', setPending) : () => {};
    return () => { offA(); offP(); };
  }, [propertyId, isAdmin]);

  const reviews = [...base, ...approved];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim().slice(0, 60);
    const c = comment.trim().slice(0, 1000);
    if (!n || !c || sending) return;
    setSending(true);
    setNotice(null);
    try {
      await addDoc(collection(db, 'reviews'), {
        propertyId,
        propertyTitle: title.slice(0, 200),
        name: n,
        rating: Math.min(5, Math.max(1, Math.round(rating))),
        comment: c,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setName('');
      setComment('');
      setRating(5);
      setNotice({ ok: true, text: 'Thank you! Your review will show here after our team checks it.' });
    } catch (err) {
      console.error('Review not saved:', err);
      // still reaches the team: open WhatsApp with the review typed in
      const msg = `Review for ${title} (${rating}★) from ${n}:\n${c}`;
      window.open(waLink(msg), '_blank', 'noopener');
      setNotice({ ok: false, text: 'Could not save right now — we opened WhatsApp with your review so you can send it to us.' });
    } finally {
      setSending(false);
    }
  };

  const approve = (r: Review) => r.id && updateDoc(doc(db, 'reviews', r.id), { status: 'approved' }).catch((e) => alert('Not approved: ' + e.message));
  const remove = (r: Review) => r.id && confirm('Delete this review?') && deleteDoc(doc(db, 'reviews', r.id)).catch((e) => alert('Not deleted: ' + e.message));

  return (
    <section aria-labelledby="rev-h" data-reviews="">
      <h2 id="rev-h" className="bmh-pd-h">Customer Reviews &amp; Ratings</h2>

      <ul className="space-y-2 mb-4">
        {reviews.map((r, i) => (
          <li key={r.id || `b${i}`} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                {r.userName || r.name || 'Verified User'}
                <span className="flex items-center gap-0.5 text-[11px] text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" /> {r.rating} / 5
                </span>
              </div>
              <p className="mt-1 text-slate-300 break-words">{r.comment}</p>
            </div>
            {isAdmin && r.id && (
              <button type="button" onClick={() => remove(r)} title="Delete review (team only)" className="shrink-0 p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-500 hover:text-rose-400 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {isAdmin && pending.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="text-xs font-bold text-amber-200 mb-2">Waiting for approval ({pending.length}) — only the team sees this</p>
          <ul className="space-y-2">
            {pending.map((r) => (
              <li key={r.id} className="rounded-lg bg-slate-950/70 p-2.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  {r.name} <span className="text-amber-400">{r.rating} / 5</span>
                </div>
                <p className="mt-1 text-slate-300 break-words">{r.comment}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => approve(r)} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 font-bold text-white cursor-pointer"><Check className="w-3.5 h-3.5" /> Approve</button>
                  <button type="button" onClick={() => remove(r)} className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 font-bold text-rose-300 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={submit} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
        <span className="font-bold text-slate-300 block">Leave a Review</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
          />
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 font-bold"
          >
            <option value={5}>5 Stars - Excellent</option>
            <option value={4}>4 Stars - Good</option>
            <option value={3}>3 Stars - Average</option>
            <option value={2}>2 Stars - Poor</option>
            <option value={1}>1 Star - Terrible</option>
          </select>
        </div>
        <textarea
          placeholder="Write your review here..."
          value={comment}
          maxLength={1000}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={2}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
        />
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition cursor-pointer shadow-md"
        >
          {sending ? 'Sending…' : 'Submit Review'}
        </button>
        {notice && (
          <p role="status" className={`flex items-start gap-1.5 ${notice.ok ? 'text-emerald-300' : 'text-amber-300'}`}>
            {notice.ok ? <Check className="w-3.5 h-3.5 shrink-0 mt-px" /> : <MessageCircle className="w-3.5 h-3.5 shrink-0 mt-px" />}
            {notice.text}
          </p>
        )}
      </form>
    </section>
  );
};
