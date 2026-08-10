import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export default function Blog() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newContent, setNewContent] = useState('');
  
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const fetchBlogs = async () => {
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
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

  // స్టోరేజ్ తో సంబంధం లేకుండా డైరెక్ట్ గా ఫైర్‌స్టోర్‌లో సేవ్ చేయడం
  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newContent) {
      alert("Please fill all required fields!");
      return;
    }

    setPublishing(true);

    try {
      await addDoc(collection(db, 'blogs'), {
        title: newTitle,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: "4 min read",
        description: newDesc,
        imageUrl: newImageUrl.trim() || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
        fullContent: newContent,
        createdAt: Date.now()
      });

      setNewTitle('');
      setNewDesc('');
      setNewImageUrl('');
      setNewContent('');
      setShowForm(false);
      fetchBlogs();
      alert("Blog published successfully!");
    } catch (error: any) {
      console.error("Error adding blog: ", error);
      alert(`Failed to publish blog: ${error.message || "Unknown error"}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    const adminPassword = prompt("Enter Admin Password to Delete:");
    
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
    <div className="min-h-screen bg-[#090D16] py-12 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              BookMyHomez Blog & Insights
            </h1>
            <p className="mt-2 text-lg text-slate-400">
              Get the latest updates on real estate trends, property buying tips, and home services.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-500 transition cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            {showForm ? 'Cancel' : '+ Write New Blog'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddBlog} className="bg-[#0B0F19] p-6 rounded-2xl shadow-2xl mb-8 space-y-4 border border-slate-800">
            <h2 className="text-xl font-bold text-white">Create a New Blog Post</h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-300">Blog Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter blog title..."
                required
                className="mt-1 w-full p-3 bg-[#131B2E] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Short Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Short summary of the blog..."
                required
                className="mt-1 w-full p-3 bg-[#131B2E] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Image URL (Optional)</label>
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste image link here (or leave blank for default)"
                className="mt-1 w-full p-3 bg-[#131B2E] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Full Content</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your complete article here..."
                rows={5}
                required
                className="mt-1 w-full p-3 bg-[#131B2E] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-500 transition cursor-pointer shadow-lg shadow-green-600/30 disabled:opacity-50"
            >
              {publishing ? 'Publishing...' : 'Publish Blog'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-center text-slate-400">Loading blogs...</p>
        ) : (
          <div className="space-y-8">
            {blogPosts.length === 0 ? (
              <p className="text-center text-slate-400">No blogs found. Create your first blog!</p>
            ) : (
              blogPosts.map((post) => (
                <div key={post.id} className="bg-[#0B0F19] border border-slate-800 shadow-xl rounded-2xl overflow-hidden transition hover:border-slate-700 relative">
                  
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-64 object-cover"
                    />
                  )}

                  <div className="p-6">
                    <button
                      onClick={() => handleDeleteBlog(post.id)}
                      className="absolute top-6 right-6 bg-[#090D16]/90 text-red-400 hover:text-red-300 text-sm font-semibold cursor-pointer border border-red-500/20 px-3 py-1 rounded-md shadow-sm backdrop-blur-md"
                    >
                      Delete Blog
                    </button>

                    <div className="flex items-center text-sm text-slate-400 space-x-4 mb-2">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3 pr-24">
                      {post.title}
                    </h2>

                    <p className="text-slate-300 mb-4">
                      {post.description}
                    </p>

                    {expandedId === post.id && (
                      <div className="mt-4 pt-4 border-t border-slate-800 text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
                        <p>{post.fullContent}</p>
                      </div>
                    )}

                    <button 
                      onClick={() => toggleReadMore(post.id)}
                      className="mt-4 text-indigo-400 font-semibold hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      {expandedId === post.id ? 'Show Less ↑' : 'Read More →'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
