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
import { HelpCircle, ExternalLink, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

interface ContextualHelpProps {
  title: string;
  description?: string;
  topic?: string;
  videoId?: string;
  relatedArticles?: { title: string; slug: string }[];
}

export function ContextualHelp({
  title,
  description,
  videoId,
  relatedArticles = [],
}: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Get help with {title}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {title}
          </SheetTitle>
          <SheetDescription>
            {description || 'Learn how to use this feature effectively.'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4 mt-6">
          <div className="space-y-6">
            {/* Video Section */}
            {videoId && (
              <div className="rounded-lg overflow-hidden border bg-muted/50">
                <div className="aspect-video flex items-center justify-center bg-black/5">
                  <PlayCircle className="h-12 w-12 text-muted-foreground/50" />
                  {/* Placeholder for actual video player */}
                </div>
                <div className="p-3 text-xs text-muted-foreground text-center">
                  Video tutorial: {title}
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Use this feature to streamline your workflow.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Data is automatically saved as you type.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>You can export reports at any time.</span>
                </li>
              </ul>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Related Articles
                </h3>
                <div className="grid gap-2">
                  {relatedArticles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/help/${article.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                    >
                      <span className="text-sm font-medium group-hover:text-primary">
                        {article.title}
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Support CTA */}
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-1">Need more help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Our support team is available to assist you with any questions.
              </p>
              <Link href="/help">
                <Button size="sm" variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-100">
                  Visit Help Centre
                </Button>
              </Link>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
