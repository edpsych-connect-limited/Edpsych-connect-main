'use client'

/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

;

import { motion } from 'framer-motion';
import { ShoppingBag, Star, Book, Video, Download, ArrowRight } from 'lucide-react';

export default function MarketplacePreview() {
  const resources = [
    {
      type: "Course",
      title: "SEND Fundamentals",
      author: "Dr. Scott Ighavongbe-Patrick",
      rating: 4.9,
      students: 1240,
      image: "bg-blue-100",
      icon: Video
    },
    {
      type: "Course",
      title: "Assessment Essentials",
      author: "Dr. Scott Ighavongbe-Patrick",
      rating: 5.0,
      students: 850,
      image: "bg-purple-100",
      icon: Book
    },
    {
      type: "Course",
      title: "Evidence-Based Interventions",
      author: "Dr. Scott Ighavongbe-Patrick",
      rating: 4.9,
      students: 2100,
      image: "bg-emerald-100",
      icon: Download
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold mb-6"
            >
              <ShoppingBag className="w-4 h-4" />
              The SEND Marketplace
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-slate-900 mb-4"
            >
              World-Class Training & Resources <br />
              <span className="text-indigo-600">At Your Fingertips</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600"
            >
              Access a growing library of CPD-accredited courses, printable intervention packs, 
              and specialist tools created by leading Educational Psychologists.
            </motion.p>
          </div>

          <motion.a
            href="/marketplace"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group"
          >
            Explore the Marketplace
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {resources.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
            >
              <div className={`h-48 ${item.image} relative flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                <item.icon className="w-16 h-16 text-slate-900/10 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {item.type}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-900">{item.rating}</span>
                  <span className="text-slate-400 text-sm">({item.students} users)</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-slate-500 text-sm mb-6">
                  by {item.author}
                </p>
                
                <a 
                  href="/marketplace"
                  className="block w-full py-3 rounded-xl border-2 border-slate-100 font-semibold text-slate-600 group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all text-center"
                >
                  View Details
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}