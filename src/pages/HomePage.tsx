import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dice6, Shield, TrendingUp, Users, Star, ChevronRight } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-yellow-500">DiceVault</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience the thrill of provably fair dice gaming with secure USDT transactions. 
            Roll your way to victory with our transparent and trustworthy platform.
          </p>
          
          {user ? (
            <Link
              to="/games"
              className="inline-flex items-center px-8 py-4 bg-yellow-500 text-gray-900 font-bold text-lg rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Start Playing
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-yellow-500 text-gray-900 font-bold text-lg rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-yellow-500 text-yellow-500 font-bold text-lg rounded-lg hover:bg-yellow-500 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose DiceVault?</h2>
            <p className="text-gray-300 text-lg">Fair, secure, and exciting gaming experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-4">Provably Fair</h3>
              <p className="text-gray-400">
                Every game result is cryptographically verifiable, ensuring complete transparency and fairness.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <TrendingUp className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-4">High Payouts</h3>
              <p className="text-gray-400">
                Competitive multipliers up to 2.2x with exciting bonus combinations and winning streaks.
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-8 text-center">
              <Dice6 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-4">Secure Crypto</h3>
              <p className="text-gray-400">
                USDT wallet integration with secure transactions and instant deposits/withdrawals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Games Preview */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Featured Games</h2>
            <p className="text-gray-300 text-lg">More games coming soon!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                <Dice6 className="h-20 w-20 text-gray-900" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">3-Dice Roll</h3>
                <p className="text-gray-400 mb-4">
                  Roll three dice and multiply your stake with scoring combinations. Cash out anytime!
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-green-500 font-bold">Up to 2.2x</span>
                  <Link
                    to="/games"
                    className="px-4 py-2 bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Play Now
                  </Link>
                </div>
              </div>
            </div>

            {/* Placeholder for future games */}
            <div className="bg-gray-800 rounded-xl overflow-hidden opacity-50">
              <div className="h-48 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                <Star className="h-20 w-20 text-gray-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-500 mb-2">Coming Soon</h3>
                <p className="text-gray-500 mb-4">
                  New exciting games are in development. Stay tuned!
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bold">TBA</span>
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-600 text-gray-400 font-medium rounded-lg cursor-not-allowed"
                  >
                    Soon
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden opacity-50">
              <div className="h-48 bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                <Star className="h-20 w-20 text-gray-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-500 mb-2">Coming Soon</h3>
                <p className="text-gray-500 mb-4">
                  More games will be added to expand your gaming options.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bold">TBA</span>
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-600 text-gray-400 font-medium rounded-lg cursor-not-allowed"
                  >
                    Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-yellow-500 mb-2">1000+</div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-500 mb-2">$50K+</div>
              <div className="text-gray-400">Total Payouts</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-500 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-500 mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-yellow-600 to-yellow-500">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Playing?
            </h2>
            <p className="text-xl text-gray-800 mb-8">
              Join thousands of players and start your winning journey today!
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-yellow-500 font-bold text-lg rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create Account
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;