import { Tool } from "@langchain/core/tools";
import { ArticleRepository } from "../../repositories/implementations/ArticleRepository";
import { supabase } from "../../lib/supabase";
import { Article } from "../../types/article.types";

export class ArticleSearchTool extends Tool {
  name = "search_support_articles";
  description = "Search through support articles to find relevant information. Input should be a search query string. Returns the most relevant article content and title.";
  
  private articleRepo: ArticleRepository;

  constructor() {
    super();
    this.articleRepo = new ArticleRepository(supabase);
  }

  /** Format a single article for the response */
  private formatArticle(article: Article): string {
    const contentPreview = article.content.trim();
    return `
Article: "${article.title}"
Content Quality: ${contentPreview.length < 50 ? 'LIMITED' : 'FULL'}
Full Content: ${contentPreview}
`.trim();
  }

  async _call(query: string): Promise<string> {
    try {
      // Search for relevant articles
      const articles = await this.articleRepo.search(query);
      
      if (articles.length === 0) {
        return "No relevant support articles found.";
      }

      // Format the most relevant article
      const mostRelevant = articles[0];
      let response = this.formatArticle(mostRelevant);

      // Add references to other relevant articles if they exist
      if (articles.length > 1) {
        const otherArticles = articles.slice(1, 3).map(a => `"${a.title}"`).join(", ");
        response += `\n\nRelated Articles: ${otherArticles}`;
      }

      return response;
    } catch (error) {
      console.error('Article search failed:', error);
      return "Failed to search support articles. Please try a different approach.";
    }
  }
} 
