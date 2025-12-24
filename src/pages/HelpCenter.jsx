import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, BookOpen, Wrench, Building, Thermometer, 
  Flame, Zap, FileCheck, Droplet, Truck, ChevronRight
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import { HELP_ARTICLES } from '../components/help/HelpArticleData';

const CATEGORIES = [
  {
    id: 'start',
    title: 'Start Here',
    description: 'How Vendibook rentals and sales work, what to check before you book, and what happens after checkout.',
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    id: 'maintenance',
    title: 'Care, Maintenance, and Checklists',
    description: 'Preventive maintenance schedules, inspection guides, and operational best practices.',
    icon: Wrench,
    color: 'bg-green-500'
  },
  {
    id: 'ghost-kitchen',
    title: 'Ghost Kitchens and Commercial Kitchens',
    description: 'How to start, set up equipment, and run compliant operations.',
    icon: Building,
    color: 'bg-purple-500'
  },
  {
    id: 'food-safety',
    title: 'Food Safety and Temperature Standards',
    description: 'Holding temps, cooking temps, cooling, and contamination prevention.',
    icon: Thermometer,
    color: 'bg-red-500'
  },
  {
    id: 'fire-safety',
    title: 'Fire Safety, Ventilation, and Grease',
    description: 'Hood systems, grease management, and fire prevention basics.',
    icon: Flame,
    color: 'bg-orange-500'
  },
  {
    id: 'utilities',
    title: 'Power, Propane, and Utilities',
    description: 'Generator safety, propane safety, and operational essentials for mobile kitchens.',
    icon: Zap,
    color: 'bg-amber-500'
  },
  {
    id: 'compliance',
    title: 'Compliance and Permits',
    description: 'Mobile vending, commissaries, and how requirements vary by location.',
    icon: FileCheck,
    color: 'bg-indigo-500'
  }
];

const FEATURED_ARTICLES = [
  'starting-ghost-kitchen',
  'preventive-maintenance',
  'food-safety-temperatures'
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = Object.values(HELP_ARTICLES).filter(article => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query)
    );
  });

  const featuredArticles = FEATURED_ARTICLES.map(slug => HELP_ARTICLES[slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Vendibook Help Center
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Practical, operator-grade guidance for renting, buying, and maintaining mobile kitchens, 
              trailers, and commercial kitchen equipment—plus step-by-step resources for launching a ghost kitchen.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search articles, checklists, maintenance guides, and compliance basics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <Card className="mt-4 max-h-96 overflow-y-auto">
                <CardContent className="p-4">
                  {filteredArticles.length > 0 ? (
                    <div className="space-y-2">
                      {filteredArticles.map(article => (
                        <Link
                          key={article.slug}
                          to={`${createPageUrl('HelpArticle')}?slug=${article.slug}`}
                          className="block p-3 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <h3 className="font-medium text-slate-900 mb-1">{article.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2">{article.description}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-4">No articles found</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Featured Articles */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredArticles.map(article => (
                <Link
                  key={article.slug}
                  to={`${createPageUrl('HelpArticle')}?slug=${article.slug}`}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Badge className="mb-3 bg-[#FF5124] text-white border-0">Featured</Badge>
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                        {article.description}
                      </p>
                      <div className="flex items-center text-[#FF5124] text-sm font-medium">
                        Read article <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Categories Grid */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                const categoryArticles = Object.values(HELP_ARTICLES).filter(
                  article => article.category === category.id
                );

                return (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <p className="text-sm text-slate-600">{category.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categoryArticles.slice(0, 3).map(article => (
                          <Link
                            key={article.slug}
                            to={`${createPageUrl('HelpArticle')}?slug=${article.slug}`}
                            className="block text-sm text-slate-700 hover:text-[#FF5124] transition-colors"
                          >
                            → {article.title}
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Footer CTA */}
          <Card className="mt-12 bg-slate-900 text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Need help?</h3>
              <p className="text-slate-300 mb-4">
                Contact Support, or open a dispute from your dashboard (if applicable).
              </p>
              <Link to={createPageUrl('Dashboard')}>
                <button className="bg-[#FF5124] hover:bg-[#e5481f] text-white px-6 py-2 rounded-full font-medium">
                  Go to Dashboard
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}