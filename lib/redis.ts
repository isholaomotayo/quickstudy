import Redis from 'ioredis';

/**
 * Redis Client Singleton with Connection Pooling
 * Manages connection to Redis for caching with failsafe mechanisms
 *
 * Features:
 * - Singleton pattern (one connection for the entire app)
 * - Connection pooling through ioredis
 * - Automatic reconnection on failure
 * - Graceful degradation if Redis is unavailable
 * - Health check monitoring
 */
class RedisClient {
  private static instance: Redis | null = null;
  private static isConnected: boolean = false;
  private static connectionAttempts: number = 0;
  private static maxConnectionAttempts: number = 5;
  private static isShuttingDown: boolean = false;

  static getInstance(): Redis | null {
    if (!this.instance && !this.isShuttingDown) {
      try {
        // Always use REDIS_URL environment variable
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
          console.warn('[Redis] REDIS_URL not configured, caching disabled (app will work without cache)');
          return null;
        }

        // Prevent infinite connection attempts
        if (this.connectionAttempts >= this.maxConnectionAttempts) {
          console.error('[Redis] Max connection attempts reached, caching disabled (app will work without cache)');
          return null;
        }

        this.connectionAttempts++;

        this.instance = new Redis(redisUrl, {
          // Connection pooling settings
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          enableOfflineQueue: true, // Queue commands when disconnected

          // Retry strategy with exponential backoff
          retryStrategy: (times) => {
            if (times > 10) {
              console.error('[Redis] Max retry attempts reached, giving up');
              return null; // Stop retrying
            }
            const delay = Math.min(times * 100, 3000);
            console.log(`[Redis] Retrying connection in ${delay}ms (attempt ${times}/10)`);
            return delay;
          },

          // Reconnect on specific errors
          reconnectOnError: (err) => {
            const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET'];
            const shouldReconnect = targetErrors.some(targetErr =>
              err.message.includes(targetErr)
            );
            if (shouldReconnect) {
              console.log(`[Redis] Reconnecting due to error: ${err.message}`);
            }
            return shouldReconnect;
          },

          // Timeout settings
          connectTimeout: 10000, // 10 seconds
          commandTimeout: 5000,  // 5 seconds per command

          // Keep connection alive
          keepAlive: 30000, // 30 seconds

          // Connection pool settings (ioredis handles this internally)
          lazyConnect: false, // Connect immediately
        });

        // Event handlers for monitoring
        this.instance.on('connect', () => {
          console.log('[Redis] ✅ Connected successfully');
          this.isConnected = true;
          this.connectionAttempts = 0; // Reset on successful connection
        });

        this.instance.on('ready', () => {
          console.log('[Redis] ✅ Ready to accept commands');
          this.isConnected = true;
        });

        this.instance.on('error', (error) => {
          // Log but don't crash - app will work without cache
          console.error('[Redis] ⚠️  Connection error (app will continue without cache):', error.message);
          this.isConnected = false;
        });

        this.instance.on('close', () => {
          console.log('[Redis] 🔌 Connection closed');
          this.isConnected = false;
        });

        this.instance.on('reconnecting', (delay) => {
          console.log(`[Redis] 🔄 Reconnecting in ${delay}ms...`);
        });

        this.instance.on('end', () => {
          console.log('[Redis] Connection ended');
          this.isConnected = false;
        });

        // Graceful shutdown handler
        process.on('SIGINT', () => this.gracefulShutdown());
        process.on('SIGTERM', () => this.gracefulShutdown());

      } catch (error) {
        // Failsafe: Log error but don't crash the app
        console.error('[Redis] ⚠️  Failed to initialize (app will work without cache):', error);
        this.isConnected = false;
        return null;
      }
    }

    return this.instance;
  }

  /**
   * Check if Redis is connected and ready
   */
  static isReady(): boolean {
    return this.isConnected && this.instance !== null && this.instance.status === 'ready';
  }

  /**
   * Get connection status for monitoring
   */
  static getStatus(): {
    connected: boolean;
    status: string;
    attempts: number;
  } {
    return {
      connected: this.isConnected,
      status: this.instance?.status || 'disconnected',
      attempts: this.connectionAttempts,
    };
  }

  /**
   * Health check - ping Redis to verify connection
   */
  static async healthCheck(): Promise<boolean> {
    if (!this.instance) {
      return false;
    }

    try {
      const result = await this.instance.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('[Redis] Health check failed:', error);
      return false;
    }
  }

  /**
   * Graceful shutdown
   */
  private static async gracefulShutdown(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    console.log('[Redis] Gracefully shutting down...');

    if (this.instance) {
      try {
        await this.instance.quit();
        console.log('[Redis] Connection closed gracefully');
      } catch (error) {
        console.error('[Redis] Error during shutdown:', error);
        // Force disconnect if quit fails
        this.instance.disconnect();
      }
      this.instance = null;
      this.isConnected = false;
    }
  }

  /**
   * Manual disconnect (for testing)
   */
  static async disconnect(): Promise<void> {
    if (this.instance) {
      try {
        await this.instance.quit();
      } catch (error) {
        console.error('[Redis] Error during disconnect:', error);
      }
      this.instance = null;
      this.isConnected = false;
    }
  }
}

export const redis = RedisClient.getInstance();
export const isRedisReady = () => RedisClient.isReady();
