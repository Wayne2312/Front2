import React, { useState } from 'react';
import LoginForm from './LoginForm';

function Home() {
  const [showLoginForm, setShowLoginForm] = useState(false);

  const navigateToLogin = () => {
    setShowLoginForm(true);
  };
  if (showLoginForm) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-50 bg-white shadow-md">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">🍽️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Mealy</h1>
      </div>
      <div className="flex space-x-3">
        <button 
          onClick={navigateToLogin}
          className="px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-full font-medium hover:bg-orange-500 hover:text-white transition-colors"
        >
          Login
        </button>
        <button 
          onClick={navigateToLogin}
          className="px-4 py-2 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
        >
          Sign Up
        </button>
      </div>
    </div>
  </header>
  <section className="py-12 md:py-20 bg-gray-50">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
      <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-4">
          Delicious Food, Delivered to You
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Connect restaurants with hungry customers. Admins manage menus, customers order with ease.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        </div>
      </div>
    </div>
  </section>
  <section id="features" className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
        Why Choose Mealy?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: '📋', title: 'Easy Menu Management', desc: 'Admins can easily create, update, and manage food menus in real-time.' },
          { icon: '🍔', title: 'Wide Food Selection', desc: 'Browse menus from multiple restaurants and cuisines in one place.' },
          { icon: '⏱️', title: 'Fast Delivery', desc: 'Get your favorite meals delivered quickly to your doorstep.' }
        ].map((feature, index) => (
          <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
        Designed for Both Roles
      </h2>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 border-t-4 border-orange-500">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">For Restaurant Admins</h3>
            <ul className="mb-8 space-y-3">
              {[
                'Easy menu creation and management',
                'Real-time order notifications',
                'Sales analytics dashboard',
                'Customer feedback management'
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={navigateToLogin}
              className="w-full py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
            >
              Register Restaurant
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 border-t-4 border-teal-500">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">For Customers</h3>
            <ul className="mb-8 space-y-3">
              {[
                'Browse menus from multiple restaurants',
                'Simple ordering process',
                'Real-time order tracking',
                'Save favorite meals'
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={navigateToLogin}
              className="w-full py-3 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition-colors"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
  <footer id="contact" className="bg-gray-800 text-white pt-16 pb-8">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between mb-12">
        <div className="mb-8 md:mb-0">
          <h3 className="text-2xl font-bold text-orange-400 mb-4">Mealy</h3>
          <p className="text-gray-300 max-w-xs">
            Connecting great food with hungry customers
          </p>
        </div>
        <div className="mb-8 md:mb-0">
          <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
          <p className="text-gray-300 mb-2">Email: info@mealy.com</p>
          <p className="text-gray-300">Phone: 0712345678</p>
        </div>
      </div>
      <div className="pt-8 border-t border-gray-700 text-center text-gray-400">
        <p>&copy; 2023 Mealy. All rights reserved.</p>
      </div>
    </div>
  </footer>
    </div>)
};

export default Home;