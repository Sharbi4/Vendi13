import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, ExternalLink, BookOpen, ChevronRight
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import Header from '../components/layout/Header';
import { HELP_ARTICLES } from '../components/help/HelpArticleData';

export default function HelpArticle() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  
  const article = HELP_ARTICLES[slug];

  useEffect(() => {
    if (article) {
      document.title = article.seoTitle;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', article.metaDescription);
      }
    }
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Article Not Found</h1>
            <Link to={createPageUrl('HelpCenter')}>
              <Button className="bg-[#FF5124] hover:bg-[#e5481f]">
                Back to Help Center
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const relatedArticles = article.relatedArticles
    ?.map(slug => HELP_ARTICLES[slug])
    .filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
            <Link to={createPageUrl('HelpCenter')} className="hover:text-[#FF5124]">
              Help Center
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">{article.title}</span>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <Badge className="mb-3 bg-blue-100 text-blue-800 border-0">
              {article.category.replace('-', ' ').toUpperCase()}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {article.title}
            </h1>
            <p className="text-lg text-slate-600">
              {article.description}
            </p>
          </div>

          {/* Article Content */}
          <Card className="mb-8">
            <CardContent className="p-8 prose prose-slate max-w-none">
              {article.sections.map((section, idx) => (
                <div key={idx} className="mb-8">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                    {section.heading}
                  </h2>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {section.content.split('\n').map((line, lineIdx) => {
                      // Handle bold text
                      if (line.includes('**')) {
                        const parts = line.split('**');
                        return (
                          <p key={lineIdx} className="mb-3">
                            {parts.map((part, partIdx) => 
                              partIdx % 2 === 1 ? <strong key={partIdx}>{part}</strong> : part
                            )}
                          </p>
                        );
                      }
                      // Handle bullet points
                      if (line.trim().startsWith('•')) {
                        return (
                          <li key={lineIdx} className="ml-4 mb-2">
                            {line.trim().substring(1).trim()}
                          </li>
                        );
                      }
                      return line.trim() ? <p key={lineIdx} className="mb-3">{line}</p> : null;
                    })}
                  </div>

                  {/* Citations */}
                  {section.citation && (
                    <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <p className="text-sm text-blue-900">
                        <strong>Source:</strong>{' '}
                        <a 
                          href={section.citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:underline inline-flex items-center gap-1"
                        >
                          {section.citation.source}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>
                  )}

                  {section.citations && (
                    <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <p className="text-sm text-blue-900 font-medium mb-2">Sources:</p>
                      <ul className="space-y-1">
                        {section.citations.map((citation, citIdx) => (
                          <li key={citIdx} className="text-sm">
                            <a 
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:underline inline-flex items-center gap-1"
                            >
                              {citation.source}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Related Articles
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedArticles.map(related => (
                  <Link
                    key={related.slug}
                    to={`${createPageUrl('HelpArticle')}?slug=${related.slug}`}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {related.description}
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
          )}

          {/* Back Button */}
          <div className="flex justify-center">
            <Link to={createPageUrl('HelpCenter')}>
              <Button variant="outline" className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Help Center
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}