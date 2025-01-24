import { Suspense, useState } from 'react'
import { ArticlesTable } from '../articles/ArticlesTable'
import { ArticlesFilters } from '../articles/ArticlesFilters'
import { useArticles } from '@/hooks/useArticles'
import { ArticleDetail } from '../articles/ArticleDetail'
import { TablePageHeader } from '../ui/table-page-header'

export default function Articles() {
  const {
    articles,
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
    refreshArticles,
  } = useArticles()
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [isCreatingArticle, setIsCreatingArticle] = useState(false)

  return (
    <div className="flex h-full">
      {/* Main Content - Articles List */}
      <div className={`flex-1 min-w-0 overflow-auto p-4 lg:p-6 ${
        selectedArticleId || isCreatingArticle ? 'hidden xl:block' : 'block'
      }`}>
        <TablePageHeader
          title="Articles"
          buttonLabel="New Article"
          onAction={() => setIsCreatingArticle(true)}
        />
        
        <ArticlesFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <div className="mt-4">
          <Suspense fallback={<div>Loading articles...</div>}>
            <ArticlesTable 
              articles={articles || { articles: [], total: 0 }}
              isLoading={isLoading}
              pagination={pagination}
              onPaginationChange={setPagination}
              onArticleSelect={(id) => {
                setIsCreatingArticle(false);
                if (id === selectedArticleId) {
                  setSelectedArticleId(null);
                } else {
                  setSelectedArticleId(id);
                }
              }}
              selectedArticleId={selectedArticleId}
            />
          </Suspense>
        </div>
      </div>

      {/* Right Side Panel - Article Details */}
      <div className={`
        hidden xl:block w-[750px] border-l border-gray-200
        ${selectedArticleId || isCreatingArticle ? '' : 'bg-gray-50'}
      `}>
        {selectedArticleId ? (
          <ArticleDetail 
            articleId={selectedArticleId} 
            onClose={() => setSelectedArticleId(null)}
            onArticleUpdate={refreshArticles}
          />
        ) : isCreatingArticle ? (
          <ArticleDetail 
            isNew={true}
            onClose={() => setIsCreatingArticle(false)}
            onArticleUpdate={() => {
              refreshArticles();
              setIsCreatingArticle(false);
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No Article Selected</h3>
              <p>Click on an article to edit it here</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal for smaller screens */}
      {(selectedArticleId || isCreatingArticle) && (
        <div className={`
          fixed inset-0 z-50 xl:hidden
          bg-white
        `}>
          <ArticleDetail 
            articleId={isCreatingArticle ? undefined : selectedArticleId || undefined}
            isNew={isCreatingArticle}
            onClose={() => {
              setSelectedArticleId(null);
              setIsCreatingArticle(false);
            }}
            onArticleUpdate={() => {
              refreshArticles();
              if (isCreatingArticle) {
                setIsCreatingArticle(false);
              }
            }}
          />
        </div>
      )}
    </div>
  )
} 