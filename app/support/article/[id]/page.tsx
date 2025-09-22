'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'

import { mockHelpArticles } from '@/lib/mock/support'

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const articleId = params.id as string

  // Find the article by ID
  const article = mockHelpArticles.find(article => article.id === articleId)

  // Handle back navigation
  const handleBack = () => {
    router.back()
  }

  // If article not found, show not found message
  if (!article) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <Icon name="file-text" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-6">
            The article you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
          <Button onClick={handleBack} variant="outline">
            <Icon name="arrow-left" className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <Icon name="arrow-left" className="h-4 w-4 mr-2" />
            Back to Support
          </Button>
        </div>

        {/* Article Metadata */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{article.category}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Icon name="clock" className="h-4 w-4" />
                  {article.readTime} min read
                </span>
              </div>
            </div>
            <CardTitle className="text-3xl mb-4">{article.title}</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {article.excerpt}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Article Content */}
        <Card>
          <CardContent className="p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>') }}
            />
          </CardContent>
        </Card>

        {/* Related Articles */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.relatedArticles.slice(0, 4).map((relatedId) => {
                const relatedArticle = mockHelpArticles.find(a => a.id === relatedId)
                if (!relatedArticle) return null

                return (
                  <Card key={relatedId} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{relatedArticle.category}</Badge>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Icon name="clock" className="h-3 w-3" />
                          {relatedArticle.readTime} min
                        </span>
                      </div>
                      <CardTitle className="text-base leading-tight">{relatedArticle.title}</CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {relatedArticle.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                        onClick={() => router.push(`/support/article/${relatedArticle.id}`)}
                      >
                        Read Article
                        <Icon name="arrow-right" className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
