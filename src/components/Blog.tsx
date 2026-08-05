import React from 'react';

export default function Blog() {
  const blogPosts = [
    {
      title: "బెంగళూరులో ఇల్లు కొనాలనుకుంటున్నారా? తెలుసుకోవాల్సిన ముఖ్యమైన విషయాలు",
      date: "August 6, 2026",
      readTime: "4 min read",
      description: "బెంగళూరులోని టాప్ రెసిడెన్షియల్ ఏరియాలు, ప్రాపర్టీ ధరలు మరియు లీగల్ డాక్యుమెంట్స్ చెక్ చేసే విధానం గురించి పూర్తి వివరాలు.",
    },
    {
      title: "Real Estate Trends in Bangalore: What Home Buyers Need to Know",
      date: "August 4, 2026",
      readTime: "5 min read",
      description: "Explore the latest market trends, upcoming infrastructure projects, and best localities for investment in Bangalore.",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-ext500 text-gray-900 sm:text-4xl">
            BookMyHomez Blog & Insights
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Get the latest updates on real estate trends, property buying tips, and home services.
          </p>
        </div>

        <div className="space-y-8">
          {blogPosts.map((post, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-6 transition hover:shadow-md">
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
              <button className="text-indigo-600 font-semibold hover:text-indigo-800">
                Read More &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
