/**
 * AI summarization adapter interface and implementations
 */

import { logger } from '../logger';
import { metrics, MetricNames } from '../metrics';

export interface AISummaryRequest {
  context: string;
  proposalTitle: string;
  proposalBody: string;
  voteStats: {
    totalVotes: number;
    averageWeight: number;
    resonanceTags: Record<string, number>;
  };
}

export interface AISummaryResponse {
  summary: string;
  keyThemes: string[];
  sentiment: 'positive' | 'neutral' | 'mixed';
  confidence: number;
}

export interface AIAdapter {
  summarize(request: AISummaryRequest): Promise<AISummaryResponse>;
}

/**
 * OpenAI-based AI adapter
 */
export class OpenAIAdapter implements AIAdapter {
  constructor(private apiKey: string) {}

  async summarize(request: AISummaryRequest): Promise<AISummaryResponse> {
    const startTime = Date.now();

    try {
      // In production, call OpenAI API
      logger.info('Generating AI summary with OpenAI', {
        proposalTitle: request.proposalTitle,
        voteCount: request.voteStats.totalVotes,
      });

      // TODO: Implement actual OpenAI call
      // const response = await openai.chat.completions.create({
      //   model: "gpt-4",
      //   messages: [{
      //     role: "system",
      //     content: "You are a community facilitator summarizing collective intentions..."
      //   }, {
      //     role: "user",
      //     content: this.buildPrompt(request)
      //   }]
      // });

      // Mock response for now
      const summary = this.generateMockSummary(request);

      metrics.histogram(MetricNames.AI_SUMMARY_GENERATED, Date.now() - startTime, {
        provider: 'openai',
        status: 'success',
      });

      return summary;
    } catch (error) {
      logger.error('AI summary generation failed', error as Error);
      metrics.counter('ai.summary.error', 1, { provider: 'openai' });
      throw error;
    }
  }

  private buildPrompt(request: AISummaryRequest): string {
    return `
Context: ${request.context}

Proposal Title: ${request.proposalTitle}

Proposal Body:
${request.proposalBody}

Voting Results:
- Total Votes: ${request.voteStats.totalVotes}
- Average Resonance: ${request.voteStats.averageWeight}/5
- Top Resonance Tags: ${Object.entries(request.voteStats.resonanceTags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => `${tag} (${count})`)
      .join(', ')}

Please provide:
1. A 2-3 sentence summary of this collective intention
2. 3-5 key themes that emerged
3. Overall sentiment (positive/neutral/mixed)
4. Your confidence level (0-1) in this summary
    `.trim();
  }

  private generateMockSummary(request: AISummaryRequest): AISummaryResponse {
    // Simple mock implementation
    const topTags = Object.entries(request.voteStats.resonanceTags)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    return {
      summary: `The community has resonated strongly with "${request.proposalTitle}", receiving ${request.voteStats.totalVotes} votes with an average resonance of ${request.voteStats.averageWeight.toFixed(1)}/5. This proposal represents a collective desire to move forward with intention and purpose.`,
      keyThemes: topTags.length > 0 ? topTags : ['community', 'intention', 'growth'],
      sentiment: request.voteStats.averageWeight >= 4 ? 'positive' : request.voteStats.averageWeight >= 3 ? 'neutral' : 'mixed',
      confidence: request.voteStats.totalVotes >= 5 ? 0.8 : 0.6,
    };
  }
}

/**
 * Anthropic Claude-based AI adapter
 */
export class AnthropicAdapter implements AIAdapter {
  constructor(private apiKey: string) {}

  async summarize(request: AISummaryRequest): Promise<AISummaryResponse> {
    logger.info('Generating AI summary with Anthropic', {
      proposalTitle: request.proposalTitle,
    });

    // TODO: Implement actual Anthropic API call
    // Similar to OpenAI implementation

    // Mock for now
    return new OpenAIAdapter(this.apiKey).summarize(request);
  }
}

/**
 * No-op AI adapter (for testing or when AI is disabled)
 */
export class NoOpAIAdapter implements AIAdapter {
  async summarize(request: AISummaryRequest): Promise<AISummaryResponse> {
    return {
      summary: `This proposal received ${request.voteStats.totalVotes} votes.`,
      keyThemes: [],
      sentiment: 'neutral',
      confidence: 0,
    };
  }
}

// Global AI adapter
let aiAdapter: AIAdapter = new NoOpAIAdapter();

export function setAIAdapter(adapter: AIAdapter): void {
  aiAdapter = adapter;
  logger.info('AI adapter configured', { type: adapter.constructor.name });
}

export function getAIAdapter(): AIAdapter {
  return aiAdapter;
}

/**
 * Initialize AI adapter based on environment
 */
export function initializeAIAdapter(): void {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    setAIAdapter(new OpenAIAdapter(openaiKey));
  } else if (anthropicKey) {
    setAIAdapter(new AnthropicAdapter(anthropicKey));
  } else {
    logger.warn('No AI API key configured, using NoOp adapter');
    setAIAdapter(new NoOpAIAdapter());
  }
}
