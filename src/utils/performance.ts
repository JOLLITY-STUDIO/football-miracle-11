/**
 * Performance monitoring utilities
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private enabled: boolean = import.meta.env.DEV;

  start(name: string) {
    if (!this.enabled) return;
    this.timers.set(name, performance.now());
  }

  end(name: string) {
    if (!this.enabled) return;
    
    const startTime = this.timers.get(name);
    if (startTime === undefined) {
      console.warn(`Performance timer "${name}" was not started`);
      return;
    }

    const duration = performance.now() - startTime;
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now()
    });

    this.timers.delete(name);

    // Log slow operations
    if (duration > 16) { // Slower than 60fps
      console.warn(`[PERF] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  measure<T>(name: string, fn: () => T): T {
    if (!this.enabled) return fn();
    
    this.start(name);
    try {
      return fn();
    } finally {
      this.end(name);
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) return fn();
    
    this.start(name);
    try {
      return await fn();
    } finally {
      this.end(name);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getAverageTime(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;
    
    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  clear() {
    this.metrics = [];
    this.timers.clear();
  }

  report() {
    if (!this.enabled || this.metrics.length === 0) return;

    console.group('[Performance Report]');
    
    const grouped = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.duration);
      return acc;
    }, {} as Record<string, number[]>);

    Object.entries(grouped).forEach(([name, durations]) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      
      console.log(`${name}:`, {
        calls: durations.length,
        avg: `${avg.toFixed(2)}ms`,
        min: `${min.toFixed(2)}ms`,
        max: `${max.toFixed(2)}ms`
      });
    });

    console.groupEnd();
  }
}

export const perfMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  if (import.meta.env.DEV) {
    perfMonitor.start(`${componentName}:render`);
    
    return () => {
      perfMonitor.end(`${componentName}:render`);
    };
  }
  
  return () => {};
}
