import { useState } from 'react';
import { IoChevronDown, IoSearch } from 'react-icons/io5';

const faqData = [
  {
    question: 'How do I request a ride?',
    answer:
      'Open the app, enter your destination, and tap the "Request Ride" button.'
  },
  {
    question: 'How do I cancel a ride?',
    answer:
      'Go to your active ride screen and tap "Cancel". Cancellation fees may apply.'
  },
  {
    question: 'How are fares calculated?',
    answer:
      'Fares are based on time, distance, and demand. A detailed breakdown is shown after your ride.'
  },
  {
    question: 'Can I schedule a ride in advance?',
    answer: 'No, but we will be implementing soon.'
  }
];

const HelpPage = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [query, setQuery] = useState('');

  const toggleFAQ = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const filteredFAQs = faqData.filter((faq) =>
    faq.question.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
        Help & Support
      </h1>

      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-8 bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm">
        <IoSearch className="text-xl text-gray-400" />
        <input
          type="text"
          placeholder="Search for help..."
          className="w-full outline-none bg-transparent"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* FAQs Section */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <p className="text-gray-500 text-center">
            No results found for "{query}"
          </p>
        ) : (
          filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-4 py-3 flex justify-between items-center"
              >
                <span className="text-lg font-medium text-gray-800">
                  {faq.question}
                </span>
                <IoChevronDown
                  className={`text-xl transform transition-transform ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedIndex === index && (
                <div className="px-4 pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HelpPage;
