import React, { useState } from 'react';

interface AICallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AICallModal: React.FC<AICallModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/trigger-ominidim-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Call initiated successfully! You will receive a call shortly.');
        setTimeout(() => {
          onClose();
          setMessage('');
        }, 3000);
      } else {
        setMessage('Failed to initiate call. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // సెంటర్‌లో రావడం కోసం: flex items-center justify-center 
    // వెనుక ఉన్న స్క్రీన్ బ్లర్ అవ్వడం కోసం: bg-black/60 backdrop-blur-sm
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      
      {/* పాపప్ బాక్స్ - వెబ్‌సైట్ కి మ్యాచ్ అయ్యేలా డార్క్ కలర్ */}
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header - టైటిల్ మరియు X బటన్ */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white">Request a Callback</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body - ఫారమ్ */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                // ఇక్కడ bg-slate-800 మరియు text-white వాడాము కాబట్టి టైప్ చేసే లెటర్స్ స్పష్టంగా కనిపిస్తాయి
                className="w-full px-4 py-3 bg-[#1E293B] border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 bg-[#1E293B] border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-[#1E293B] border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-colors"
              />
            </div>

            {/* Success/Error Message */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes('successfully') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Submit'
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AICallModal;
