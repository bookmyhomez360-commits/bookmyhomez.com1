import React, { useState } from 'react';

export default function Blog() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const blogPosts = [
    {
      id: 1,
      title: "Real Estate Trends in Bangalore: What Home Buyers Need to Know",
      date: "August 4, 2026",
      readTime: "5 min read",
      description: "Explore the latest market trends, upcoming infrastructure projects, and best localities for investment in Bangalore.",
      fullContent: "Bangalore's real estate market continues to show resilient growth, driven by IT hubs, infrastructure expansions like the Namma Metro, and rising demand for gated communities. Key areas such as Whitefield, Electronic City, and North Bangalore are witnessing massive appreciation. When buying a home here, always verify the property title deeds, Khata certificate, RERA registration, and approvals from local authorities like BDA or BMRDA to ensure a safe and secure investment."
    }
  ];

  const toggleReadMore = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            BookMyHomez Blog & Insights
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Get the latest updates on real estate trends, property buying tips, and home services.
          </p>
        </div>

        <div className="space-y-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white shadow rounded-lg p-6 transition hover:shadow-md">
              <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {post.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {post.description}
              </p>

              {/* Read More Click చేస్తే ఓపెన్ అయ్యే పూర్తి కంటెంట్ */}
              {expandedId === post.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-gray-700 leading-relaxed space-y-3">
                  <p>{post.fullContent}</p>
                </div>
              )}

              <button 
                onClick={() => toggleReadMore(post.id)}
                className="mt-4 text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {expandedId === post.id ? 'Show Less ↑' : 'Read More →'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
