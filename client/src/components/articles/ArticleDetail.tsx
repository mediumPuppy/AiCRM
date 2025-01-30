import { Editor } from '@tiptap/react';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { useArticleDetail, Article } from '@/hooks/useArticleDetail';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '../ui/alert-dialog';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export function ArticleDetail({ articleId, isNew = false, onClose, onArticleUpdate }: { articleId?: number; isNew?: boolean; onClose: () => void; onArticleUpdate?: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<Article['status']>('draft');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    article,
    isLoading,
    saveArticle,
    publishArticle,
    deleteArticle,
    error: apiError
  } = useArticleDetail(articleId);

  // Reset state when creating a new article
  useEffect(() => {
    if (isNew) {
      setTitle('');
      setContent('');
      setStatus('draft');
      setError(null);
      if (editor) {
        editor.commands.setContent('');
      }
    }
  }, [isNew, editor]);

  // Update state when article changes
  useEffect(() => {
    if (article && !isNew) {
      setTitle(article.title);
      setContent(article.content);
      setStatus(article.status);
      editor?.commands.setContent(article.content);
      setError(null);
    }
  }, [article, isNew, editor]);

  // Handle API errors
  useEffect(() => {
    if (apiError) {
      setError(apiError.message);
    }
  }, [apiError]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const currentContent = editor?.getHTML();
    // Only validate content if we're actually changing it (editor is active)
    if (editor && !currentContent?.trim()) {
      setError('Content is required');
      return;
    }

    try {
      // Only include fields that are actually changing
      const updateData: {
        title: string;
        status: Article['status'];
        content?: string;
      } = {
        title: title.trim(),
        status
      };

      // Only include content if we're actually changing it
      if (editor && currentContent !== article?.content) {
        updateData.content = currentContent?.trim();
      }

      await saveArticle(updateData);
      setError(null);
      onArticleUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article');
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      await publishArticle({
        title: title.trim(),
        content: editor?.getHTML() || ''
      });
      setStatus('published');
      setError(null);
      onArticleUpdate?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish article');
    }
  };

  const handleDelete = async () => {
    if (!articleId) return;
    
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      await deleteArticle(articleId);
      setError(null);
      onArticleUpdate?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
    }
  };

  if (isLoading && !isNew) {
    return <div>Loading...</div>;
  }

  // Determine valid status transitions
  const validTransitions = {
    draft: ['published', 'archived'],
    published: ['archived'],
    archived: ['draft']
  };

  const allowedStatuses = validTransitions[status] || [];

  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100">
          <div className="flex gap-2 items-center">
            <IconAlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Article title"
        />
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <div className="min-h-[400px] border rounded-lg">
          <TipTapEditor
            content={content}
            onEditor={setEditor}
            className="prose max-w-none h-full"
            key={`${articleId}-${isNew}-${Date.now()}`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={value => setStatus(value as Article['status'])}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published" disabled={!allowedStatuses.includes('published')}>Published</SelectItem>
            <SelectItem value="archived" disabled={!allowedStatuses.includes('archived')}>Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave}>Save</Button>
        {!isNew && status === 'draft' && (
          <Button variant="secondary" onClick={handlePublish}>
            Publish
          </Button>
        )}
        {!isNew && (
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        )}
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