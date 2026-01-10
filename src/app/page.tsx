'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Scissors, Clock, Star, MapPin, Calendar, Users, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Apna Barber</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-blue-400 hover:bg-white/10">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/80">India&#39;s #1 Barber Booking Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Book Your Perfect
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Haircut Today
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Find, book, and review the best barber shops near you.
            No waiting, no hassle—just great haircuts at your fingertips.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/search">
              <Button size="xl" className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <MapPin className="w-5 h-5" />
                Find Barbers Near Me
              </Button>
            </Link>
            <Link href="/barber/register">
              <Button size="xl" variant="outline" className="w-full sm:w-auto gap-2 border-white/30 text-white hover:bg-white/10">
                <Scissors className="w-5 h-5" />
                List Your Shop
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { number: '10K+', label: 'Happy Customers' },
              { number: '500+', label: 'Partner Shops' },
              { number: '50+', label: 'Cities' },
              { number: '4.8', label: 'Avg Rating' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <p className="text-3xl font-bold text-white mb-1">{stat.number}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Apna Barber?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We make booking your next haircut as easy as a few taps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Booking</h3>
              <p className="text-gray-400">
                Book appointments in seconds. Get instant confirmation and skip the waiting queue.
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Verified Reviews</h3>
              <p className="text-gray-400">
                Read honest reviews from real customers. Only verified bookings can leave reviews.
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 p-8 hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Near You</h3>
              <p className="text-gray-400">
                Find top-rated barber shops in your city. Filter by location, services, and ratings.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">Book your next haircut in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search', desc: 'Enter your city and find top barber shops nearby', icon: MapPin },
              { step: '02', title: 'Book', desc: 'Choose your service, pick a time slot, and confirm', icon: Calendar },
              { step: '03', title: 'Enjoy', desc: 'Visit the shop and get the perfect haircut', icon: Scissors },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-8xl font-bold text-white/5 absolute -top-8 -left-4">{item.step}</div>
                <div className="relative z-10 pt-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for Barbers */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
            <Users className="w-4 h-4 text-white" />
            <span className="text-sm text-white">For Barber Shop Owners</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Grow Your Business with Apna Barber</h2>
          <p className="text-white/80 mb-8 text-lg">
            Join 500+ barber shops already using our platform to manage appointments,
            track revenue, and attract new customers.
          </p>
          <Link href="/barber/register">
            <Button size="xl" className="bg-white text-blue-600 hover:bg-gray-100">
              Register Your Shop — It&#39;s Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Apna Barber</span>
            </div>
            <div className="flex gap-6 text-gray-400 text-sm">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Apna Barber. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
