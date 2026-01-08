'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquareQuote, Plus, X } from 'lucide-react';
import { WriteRecommendationForm } from './WriteRecommendationForm';

interface Recommendation {
  id: string;
  relationship: string;
  comment: string;
  author: {
    id: number;
    name: string;
    role: string;
  };
  created_at: Date;
}

interface RecommendationsSectionProps {
  professionalId: number;
  recommendations: Recommendation[];
}

export function RecommendationsSection({ professionalId, recommendations }: RecommendationsSectionProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquareQuote className="w-5 h-5 text-primary" />
          Recommendations
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(true)} className="h-8 px-2">
            <Plus className="w-4 h-4 mr-1" />
            Add
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recommendations.length === 0 ? (
             <div className="text-center py-6 text-muted-foreground bg-secondary/20 rounded-lg">
                <p className="text-sm mb-2">No recommendations yet.</p>
                <Button variant="link" size="sm" onClick={() => setShowForm(true)}>Be the first to write one!</Button>
             </div>
          ) : (
             recommendations.map(rec => (
              <div key={rec.id} className="relative pl-4 border-l-2 border-primary/20">
                <blockquote className="text-sm text-muted-foreground italic mb-2">
                  "{rec.comment}"
                </blockquote>
                <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-foreground">{rec.author.name}</span>
                    <span className="text-muted-foreground">• {rec.author.role}</span>
                    <span className="text-muted-foreground/60">• {rec.relationship}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-900">Write a Recommendation</h3>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <WriteRecommendationForm 
                receiverId={professionalId}
                onSuccess={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
