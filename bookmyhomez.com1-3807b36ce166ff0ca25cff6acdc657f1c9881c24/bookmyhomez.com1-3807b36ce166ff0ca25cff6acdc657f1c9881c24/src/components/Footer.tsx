import React, { useState } from 'react';
import { Logo } from './Logo';
import { CategoryType } from '../types';
import {
  MessageCircle,
  Instagram,
  Mail,
  Youtube,
  Facebook,
  Star,
} from 'lucide-react';

interface FooterProps {
  navigateToCategory: (cat: CategoryType) => void;
  filterByLocation: (city: string) => void;
}

interface Review {
  name: string;
  comment: string;
  rating: number;
}

export const Footer: React.FC<FooterProps> = ({
  navigateToCategory,
  filterByLocation,
}) => {
  const [reviews, setReviews] = useState<Review[]>([
    { name: "Rahul Varma", comment: "Zero brokerage friction and smooth experience!", rating: 5 },
  ]);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewComment) return;

    setReviews([...reviews, { name: reviewerName, comment: reviewComment, rating: reviewRating }]);
    setReviewerName('');
    setReviewComment('');
    setReviewRating(5);
  };

  return (
    <footer className="bg-[#05070E] border-t border-slate-800/80 text-slate-400 py-12 mt-20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 px-2.5 py-1 flex items-center justify-center bg-white rounded-xl shadow-md border border-slate-700/30 overflow-hidden">
                <Logo className="h-14 w-auto max-w-full" />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              BookMyHomez is India’s premier verified real estate portal connecting home
              seekers, owners, and agents with total clarity and zero brokerage friction.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => navigateToCategory('Buy')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Homes for Sale
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('Rent')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Rental Flats & PGs
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('Short Stay')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Short Stays & Resorts
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToCategory('Plots')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Land & Residential Plots
                </button>
              </li>
            </ul>
          </div>

          {/* Prime Cities */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Prime Cities
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => filterByLocation('Bengaluru')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Bengaluru Real Estate
                </button>
              </li>
              <li>
                <button
                  onClick={() => filterByLocation('Mumbai')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Mumbai Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => filterByLocation('Pune')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Pune Properties
                </button>
              </li>
              <li>
                <button
                  onClick={() => filterByLocation('Jaipur')}
                  className="hover:text-indigo-400 transition cursor-pointer"
                >
                  Jaipur Villas & Plots
                </button>
              </li>
            </ul>
          </div>

          {/* Social Links & Contact + Review Box */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Connect With Us
            </h4>
            <div className="flex items-center gap-3 mb-4">
              <a
                href="https://wa.me/919916475749"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 text-emerald-400 flex items-center justify-center transition"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-emerald-400" />
              </a>

              <a
                href="https://www.instagram.com/book.myhomez?igsh=MXJ1NXAyMGdybzdzaA=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500 text-pink-400 flex items-center justify-center transition"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="mailto:bookmyhomez360@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500 text-rose-400 flex items-center justify-center transition"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>

              <a
                href="https://youtube.com/@bookmyhomez?si=uf7lYpboUeimRswW"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500 text-red-500 flex items-center justify-center transition"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61579564084213&mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-blue-400 flex items-center justify-center transition"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">Phone: +91 9916475749</p>

            {/* Footer Review & Feedback Box */}
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-2">
              <span className="text-white font-bold block">Client Feedback & Reviews</span>
              
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px]">
                    <div className="flex justify-between font-bold text-white items-center">
                      <span>{rev.name}</span>
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {rev.rating}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{rev.comment}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-2 pt-1">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
                />
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Terrible</option>
                </select>
                <textarea
                  placeholder="Write your review..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 text-xs resize-none"
                />
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded-lg transition cursor-pointer text-xs shadow-md shadow-indigo-600/30"
                >
                  Submit Review
                </button>
              </form>
            </div>

          </div>

        </div>

        <div className="pt-8 text-center text-[11px] text-slate-600">
          © 2026 BookMyHomez. All rights reserved. Your Happy Home Partner.
        </div>
      </div>
    </footer>
  );
};
