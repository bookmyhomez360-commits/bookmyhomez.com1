import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export default function Blog() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newContent, setNewContent] = useState('');
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const q = query(collection(db, 'blogs'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const posts: any[] = [];
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      setBlogPosts(posts);
    } catch (error) {
      console.error("Error fetching blogs: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const toggleReadMore = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // ఎవరైనా కొత్త బ్లాగ్ రాయవచ్చు (అందరికీ పబ్లిష్ అవుతుంది)
  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newContent) return;

    try {
      await addDoc(collection(db, 'blogs'), {
        title: newTitle,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: "4 min read",
        description: newDesc,
        fullContent: newContent,
        createdAt: Date.now()
      });

      setNewTitle('');
      setNewDesc('');
      setNewContent('');
      setShowForm(false);
      fetchBlogs();
    } catch (error) {
      console.error("Error adding blog: ", error);
    }
  };

  // కేవలం అడ్మిన్ పాస్‌వర్డ్ ఎంటర్ చేస్తేనే డిలీట్ అయ్యే ఫంక్షన్
  const handleDeleteBlog = async (id: string) => {
    const adminPassword = prompt("Enter Admin Password to Delete:");
    
    // ఇక్కడ మీ ఇష్టమైన పాస్‌వర్డ్ పెట్టుకోవచ్చు (ఉదాహరణకు: admin123)
    if (adminPassword === "admin123") {
      try {
        await deleteDoc(doc(db, 'blogs', id));
        fetchBlogs();
        alert("Blog deleted successfully!");
      } catch (error) {
        console.error("Error deleting blog: ", error);
      }
    } else if (adminPassword !== null) {
      alert("Incorrect Password! You cannot delete this blog.");
    }
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
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition cursor-pointer"
          >
            {showForm ? 'Cancel' : '+ Write New Blog'}
          </button>
        </div>

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

        {loading ? (
          <p className="text-center text-gray-500">Loading blogs...</p>
        ) : (
          <div className="space-y-8">
            {blogPosts.length === 0 ? (
              <p className="text-center text-gray-500">No blogs found. Create your first blog!</p>
            ) : (
              blogPosts.map((post) => (
                <div key={post.id} className="bg-white shadow rounded-lg p-6 transition hover:shadow-md relative">
                  
                  {/* డిలీట్ బటన్ - నొక్కితే పాస్‌వర్డ్ అడుగుతుంది */}
                  <button
                    onClick={() => handleDeleteBlog(post.id)}
                    className="absolute top-6 right-6 text-red-500 hover:text-red-700 text-sm font-semibold cursor-pointer border border-red-200 px-3 py-1 rounded-md"
                  >
                    Delete Blog
                  </button>

                  <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 pr-24">
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
