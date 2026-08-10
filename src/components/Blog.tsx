import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Blog() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  // ఫారమ్ స్టేట్స్ (1 కన్నా ఎక్కువ ఇమేజ్ కోసం 5 ఫైల్స్ వరకు)
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newContent, setNewContent] = useState('');
  
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  // గరిష్టంగా 5 ఇమేజెస్‌ని హ్యాండ్లింగ్ చేయడం
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 5) {
        alert("You can upload a maximum of 5 images only!");
        return;
      }
      setNewImages(filesArray);
    }
  };

  // కొత్త బ్లాగ్ మరియు ఇమేజెస్‌ని ఫైర్‌బేస్‌లో సేవ్ చేయడం
  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newContent) {
      alert("Please fill all required fields!");
      return;
    }

    setUploading(true);
    let imageUrls: string[] = [];

    try {
      // 1. సెలెక్ట్ చేసిన అన్ని ఇమేజెస్‌ని ఫైర్‌బేస్ స్టోరేజ్‌కి అప్‌లోడ్ చేయడం
      for (const image of newImages) {
        const storageRef = ref(storage, `blog_images/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(storageRef, image);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
      }

      // 2. Firestore లోకి డేటాతో పాటు ఇమేజ్ URLs (అర్రే) ని సేవ్ చేయడం
      await addDoc(collection(db, 'blogs'), {
        title: newTitle,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        readTime: "4 min read",
        description: newDesc,
        imageUrls: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800"],
        fullContent: newContent,
        createdAt: Date.now()
      });

      // 3. ఫారమ్ రీసెట్ చేయడం
      setNewTitle('');
      setNewDesc('');
      setNewImages([]);
      setNewContent('');
      setShowForm(false);
      fetchBlogs();
      alert("Blog published successfully!");
    } catch (error) {
      console.error("Error adding blog: ", error);
      alert("Failed to upload images or publish blog. Please check your connection.");
    } finally {
      setUploading(false);
    }
  };

  // అడ్మిన్ పాస్‌వర్డ్ తో డిలీట్ చేసే ఆప్షన్
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

        {/* బ్లాగ్ క్రియేట్ చేసే ఫారమ్ */}
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

            {/* 1 నుండి 5 ఇమేజెస్‌ని అప్‌లోడ్ చేసే ఫీల్డ్ */}
            <div>
              <label className="block text-sm font-medium text-slate-300">Upload Images (Max 5 Optional)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="mt-1 w-full p-2 bg-[#131B2E] border border-slate-700 rounded-lg text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
              <p className="text-xs text-slate-400 mt-1">You can select up to 5 images at once.</p>
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
              disabled={uploading}
              className="bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-500 transition cursor-pointer shadow-lg shadow-green-600/30 disabled:opacity-50"
            >
              {uploading ? 'Uploading & Publishing...' : 'Publish Blog'}
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
                  
                  {/* బ్లాగ్ ఇమేజెస్‌ని డిస్‌ప్లే చేయడం (ఒకటి కంటే ఎక్కువ ఉంటే గ్రిడ్ లాగా లేదా సింగిల్ అయితే పెద్దదిగా) */}
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className={`grid gap-2 p-2 bg-[#131B2E] ${post.imageUrls.length > 1 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
                      {post.imageUrls.map((url: string, index: number) => (
                        <img 
                          key={index}
                          src={url} 
                          alt={`${post.title} - ${index + 1}`} 
                          className={`w-full object-cover rounded-lg ${post.imageUrls.length === 1 ? 'h-64' : 'h-40'}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* పాత డేటాలో 'imageUrl' (సింగిల్) ఉంటే దాన్ని కూడా సపోర్ట్ చేయడానికి */}
                  {(!post.imageUrls || post.imageUrls.length === 0) && post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-64 object-cover"
                    />
                  )}

                  <div className="p-6">
                    {/* అడ్మిన్ పాస్‌వర్డ్ అడిగే డిలీట్ బటన్ */}
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
