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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-0">
      
      {/* Modal Box - సరిగ్గా మధ్యలో ఉండటానికి flex, max-h-[85vh] వాడాను */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[85vh] animate-fade-in-up">
        
        {/* Header Section with X Button */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Get Instant Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-all"
            title="Close"
          >
            {/* 'X' Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Area - కంటెంట్ ఎక్కువైతే లోపల మాత్రమే స్క్రోల్ అవుతుంది */}
        <div className="p-5 md:p-7 overflow-y-auto">
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
    </div>
  );
};

export default AICallModal;
