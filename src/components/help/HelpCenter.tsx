import { logger } from "@/lib/logger";
'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import React, { useState } from 'react';
import { Search, Book, FileText, MessageCircle, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'getting-started', title: 'Getting Started', icon: Book, count: 5 },
  { id: 'assessments', title: 'Assessments', icon: FileText, count: 12 },
  { id: 'interventions', title: 'Interventions', icon: MessageCircle, count: 8 },
];

const ARTICLES = [
  { id: 1, title: 'How to run a Stealth Assessment', category: 'assessments', views: 1204 },
  { id: 2, title: 'Interpreting the Cognitive Profile', category: 'assessments', views: 982 },
  { id: 3, title: 'Setting up the Self-Driving SENCO', category: 'interventions', views: 856 },
  { id: 4, title: 'Importing students from SIMS/Arbor', category: 'getting-started', views: 2103 },
  { id: 5, title: 'Understanding the Universal Translator', category: 'interventions', views: 654 },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = ARTICLES.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Search Section */}
      <div className="bg-indigo-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">How can we help you?</h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for articles, guides, and tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Categories Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{cat.title}</h3>
                <p className="text-sm text-slate-500">{cat.count} articles</p>
              </button>
            );
          })}
        </div>

        {/* Popular Articles */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">
              {searchQuery ? 'Search Results' : 'Popular Articles'}
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredArticles.map(article => (
              <button key={article.id} className="w-full p-4 hover:bg-slate-50 flex items-center justify-between group transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  <span className="text-slate-700 font-medium group-hover:text-indigo-700">{article.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">{article.views} views</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400" />
                </div>
              </button>
            ))}
            {filteredArticles.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No articles found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">Can't find what you're looking for?</p>
          <button className="px-6 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Contact Support
          </button>
        </div>

      </div>
    </div>
  );
}
