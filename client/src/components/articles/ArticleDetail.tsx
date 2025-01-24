import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { IconX } from '@tabler/icons-react';
import { useArticleDetail } from '@/hooks/useArticleDetail';
import { Editor } from '@tiptap/react';
import { TipTapEditor } from '../editor/TipTapEditor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';

interface ArticleDetailProps {
  articleId?: number;
  isNew?: boolean;
  onClose: () => void;
  onArticleUpdate?: () => void;
}

type ArticleStatus = 'draft' | 'published' | 'archived';

export function ArticleDetail({ articleId, isNew, onClose, onArticleUpdate }: ArticleDetailProps) {
  const { 
    article, 
    isLoading,
    saveArticle,
    publishArticle,
    deleteArticle,
  } = useArticleDetail(articleId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (article && !isNew) {
      setTitle(article.title);
      setContent(article.content);
      setStatus(article.status);
    }
  }, [article, isNew]);

  const handleSave = async () => {
    if (!editor) return;
    
    setIsSaving(true);
    try {
      await saveArticle({
        title,
        content: editor.getHTML(),
        status,
      });
      onArticleUpdate?.();
    } catch (error) {
      console.error('Failed to save article:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!editor) return;
    
    setIsPublishing(true);
    try {
      await publishArticle({
        title,
        content: editor.getHTML(),
      });
      setStatus('published');
      onArticleUpdate?.();
    } catch (error) {
      console.error('Failed to publish article:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!articleId) return;
    
    try {
      await deleteArticle(articleId);
      onArticleUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  if (isLoading && !isNew) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-pulse">Loading article...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <div className="flex items-center min-w-0 gap-4">
          <Input
            type="text"
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium w-[300px]"
          />
          <Select value={status} onValueChange={(value: ArticleStatus) => setStatus(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel">
          <IconX className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0 p-4">
        <TipTapEditor
          content={content}
          onEditor={setEditor}
          className="prose max-w-none h-full"
          key={articleId}
        />
      </div>

      {/* Footer Actions */}
      <div className="border-t px-4 py-3 flex justify-between items-center">
        <div>
          {!isNew && (
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || !title}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 