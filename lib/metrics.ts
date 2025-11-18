/**
 * Metrics collection and observability
 * Provides a simple abstraction that can be swapped with Prometheus, DataDog, etc.
 */

interface MetricLabels {
  [key: string]: string | number;
}

interface CounterMetric {
  name: string;
  value: number;
  labels: MetricLabels;
  timestamp: Date;
}

interface HistogramMetric {
  name: string;
  value: number;
  labels: MetricLabels;
  timestamp: Date;
}

interface GaugeMetric {
  name: string;
  value: number;
  labels: MetricLabels;
  timestamp: Date;
}

type MetricType = 'counter' | 'histogram' | 'gauge';

interface Metric {
  type: MetricType;
  name: string;
  value: number;
  labels: MetricLabels;
  timestamp: Date;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics in memory

  /**
   * Record a counter metric (monotonically increasing)
   */
  counter(name: string, value: number = 1, labels: MetricLabels = {}): void {
    this.record('counter', name, value, labels);
  }

  /**
   * Record a histogram metric (for distributions)
   */
  histogram(name: string, value: number, labels: MetricLabels = {}): void {
    this.record('histogram', name, value, labels);
  }

  /**
   * Record a gauge metric (point-in-time value)
   */
  gauge(name: string, value: number, labels: MetricLabels = {}): void {
    this.record('gauge', name, value, labels);
  }

  /**
   * Measure the duration of an async operation
   */
  async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    labels: MetricLabels = {}
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await operation();
      this.histogram(name, Date.now() - start, {
        ...labels,
        status: 'success',
      });
      return result;
    } catch (error) {
      this.histogram(name, Date.now() - start, {
        ...labels,
        status: 'error',
      });
      throw error;
    }
  }

  /**
   * Measure the duration of a sync operation
   */
  measure<T>(
    name: string,
    operation: () => T,
    labels: MetricLabels = {}
  ): T {
    const start = Date.now();
    try {
      const result = operation();
      this.histogram(name, Date.now() - start, {
        ...labels,
        status: 'success',
      });
      return result;
    } catch (error) {
      this.histogram(name, Date.now() - start, {
        ...labels,
        status: 'error',
      });
      throw error;
    }
  }

  private record(
    type: MetricType,
    name: string,
    value: number,
    labels: MetricLabels
  ): void {
    const metric: Metric = {
      type,
      name,
      value,
      labels,
      timestamp: new Date(),
    };

    this.metrics.push(metric);

    // Keep only the last N metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // In development, log metrics
    if (process.env.NODE_ENV === 'development' && process.env.LOG_METRICS === 'true') {
      console.log(`[METRIC] ${type}:${name} = ${value}`, labels);
    }

    // In production, you would send to your metrics backend here
    // Example: sendToPrometheus(metric) or sendToDataDog(metric)
  }

  /**
   * Get all recorded metrics (useful for debugging or custom exporters)
   */
  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics summary by name
   */
  getSummary(name: string): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
  } | null {
    const filtered = this.metrics.filter((m) => m.name === name);
    if (filtered.length === 0) return null;

    const values = filtered.map((m) => m.value);
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clear(): void {
    this.metrics = [];
  }
}

// Global metrics instance
export const metrics = new MetricsCollector();

/**
 * Common metrics constants
 */
export const MetricNames = {
  // HTTP metrics
  HTTP_REQUEST_DURATION: 'http.request.duration',
  HTTP_REQUEST_COUNT: 'http.request.count',

  // Database metrics
  DB_QUERY_DURATION: 'db.query.duration',
  DB_CONNECTION_COUNT: 'db.connection.count',

  // Business metrics
  CYCLE_CREATED: 'cycle.created',
  PROPOSAL_CREATED: 'proposal.created',
  VOTE_CAST: 'vote.cast',
  OUTCOME_SELECTED: 'outcome.selected',
  COMMENT_CREATED: 'comment.created',
  MEMBER_REGISTERED: 'member.registered',

  // External service metrics
  NOTIFICATION_SENT: 'notification.sent',
  AI_SUMMARY_GENERATED: 'ai.summary.generated',
  WEBHOOK_DELIVERED: 'webhook.delivered',
};
