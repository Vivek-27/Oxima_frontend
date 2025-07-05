import React from 'react';

const About = () => {
  return (
    <div className="px-6 md:px-20 py-12 bg-white text-gray-800 space-y-24">
      {/* Section 1: Hero */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
          Designed for Seamless Ride Booking
        </h1>
        <p className="text-lg md:text-xl text-gray-600">
          This platform delivers a focused and lightweight ride-booking
          experience without the clutter — built with care by a solo developer.
        </p>
        <img
          src="/src/assets/logo.png"
          alt="Ride Booking"
          className="mt-10 w-[800px] h-[350px] object-cover rounded-xl shadow-xl mx-auto"
        />
      </section>

      {/* Section 2: Core Philosophy */}
      <section className="flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-black">
            Simplicity at its Core
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            This app was crafted to do one thing well — help you book rides
            without delays, distractions, or bloated interfaces. Built with
            modern tools, designed for real-world usability.
          </p>
          <ul className="list-disc list-inside mt-4 text-gray-500 space-y-1">
            <li>Built with React and Spring Boot</li>
            <li>Minimal, responsive user interface</li>
            <li>Privacy-respecting: no ads, no tracking</li>
          </ul>
        </div>
        <img
          src="https://images.unsplash.com/photo-1633409361618-c73427e4e206?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Minimal UI"
          className="w-full md:w-1/2 rounded-xl shadow-lg"
        />
      </section>

      {/* Section 3: Built by One */}
      <section className="flex flex-col md:flex-row-reverse items-center gap-12">
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-black">
            Independently Developed
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Created by a single developer — not a company. That means it's built
            with full control over the features, design decisions, and
            performance. No artificial support chats or upsells.
          </p>
          <p className="text-gray-500 italic">
            If it works well, enjoy it. If not, refresh or give it a minute. 😊
          </p>
        </div>
        <img
          src="https://plus.unsplash.com/premium_photo-1744197738758-69ffa82ffae9?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Solo developer workspace"
          className="w-full md:w-1/2 rounded-xl shadow-lg"
        />
      </section>
    </div>
  );
};

export default About;
