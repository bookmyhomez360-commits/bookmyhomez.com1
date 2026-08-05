import React, { useState } from 'react';

export default function Blog() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // కొత్త బ్లాగ్ రాయడానికి ఫారమ్ ఓపెన్/క్లోజ్ చేయడానికి స్టేట్
  const [showForm, setShowForm] = useState(false);

  // కొత్త బ్లాగ్ కోసం ఇన్‌పుట్ ఫీల్డ్స్ స్టేట్
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newContent, setNewContent] = useState('');

  const [blogPosts, setBlogPosts] = useState([
    {
      id: 1,
      title: "Real Estate Trends in Bangalore: What Home Buyers Need to Know",
      date: "August 4, 2026",
      readTime: "5 min read",
      description: "Explore the latest market trends, upcoming infrastructure projects, and best localities for investment in Bangalore.",
      fullContent: "Bangalore's real estate market continues to show resilient growth, driven by IT hubs, infrastructure expansions like the Namma Metro, and rising demand for gated communities. Key areas such as Whitefield, Electronic City, and North Bangalore are witnessing massive appreciation. When buying a home here, always verify the property title deeds, Khata certificate, RERA registration, and approvals from local authorities like BDA or BMRDA to ensure a safe and secure investment."
    }
  ]);

  const toggleReadMore = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // కొత్త బ్లాగ్ యాడ్ చేసే ఫంక్షన్
  const handleAddBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newContent) return;

    const newPost = {
      id: blogPosts.length + 1,
      title: newTitle,
      date: "August 6, 2026",
      readTime: "4 min read",
      description: newDesc,
      fullContent: newContent
    };

    setBlogPosts([newPost, ...blogPosts]);
    setNewTitle('');
    setNewDesc('');
    setNewContent('');
    setShowForm(false); // ఫారమ్ క్లోజ్ అవడానికి
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              BookMyHomez Blog & Insights
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              Get the latest updates on real estate trends, property buying tips, and home services.
            </p>
          </div>
          {/* కొత్త బ్లాగ్ రాయడానికి బటన్ */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition cursor-pointer"
          >
            {showForm ? 'Cancel' : '+ Write New Blog'}
          </button>
        </div>

        {/* వెబ్‌సైట్ లోపల బ్లాగ్ రాసే ఫారమ్ */}
        {showForm && (
          <form onSubmit={handleAddBlog} className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4 border border-indigo-100">
            <h2 className="text-xl font-bold text-gray-800">Create a New Blog Post</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Blog Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter blog title..."
                required
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Short Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short summary of the blog..."
                required
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Content</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your complete article here..."
                rows={4}
                required
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition cursor-pointer"
            >
              Publish Blog
            </button>
          </form>
        )}

        {/* బ్లాగ్ పోస్ట్స్ లిస్ట్ */}
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
