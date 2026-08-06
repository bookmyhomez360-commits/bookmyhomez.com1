import React, { useState } from 'react';

interface AICallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AICallModal: React.FC<AICallModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/trigger-ominidim-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setStatus('idle');
          setFormData({ name: '', phone: '', email: '' });
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Error triggering AI call:", error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      {/* ఇక్కడ max-h-[90vh] మరియు overflow-y-auto యాడ్ చేశాను */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl font-bold"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2 pr-6">Get Instant Details</h2>
        <p className="text-gray-500 mb-6 text-sm">Enter your details and connect with our Property Expert.</p>

        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center font-medium">
            Submitted successfully! We are connecting your call... 📞
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
              <input 
                type="tel" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3.5 mt-2 rounded-xl text-white font-bold text-lg transition-all shadow-lg ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'
              }`}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            
            {status === 'error' && (
              <p className="text-red-500 text-sm text-center mt-3 font-medium">Something went wrong. Please try again.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default AICallModal;
