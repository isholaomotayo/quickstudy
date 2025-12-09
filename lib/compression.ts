// ====================
// 1. RULE-BASED COMPRESSOR (No AI)
// ====================
class RuleBasedCompressor {
  compress(text: string): string {
    let compressed = text;

    // Remove redundant phrases and filler words
    compressed = this.removeFillerWords(compressed);
    compressed = this.removeRedundancy(compressed);
    compressed = this.simplifySentences(compressed);

    return compressed.trim();
  }

  private removeFillerWords(text: string): string {
    const fillers = [
      "basically",
      "actually",
      "literally",
      "obviously",
      "clearly",
      "in fact",
      "to be honest",
      "if you will",
      "so to speak",
      "needless to say",
      "it goes without saying",
    ];

    let result = text;
    fillers.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b,?\\s*`, "gi");
      result = result.replace(regex, "");
    });

    return result;
  }

  private removeRedundancy(text: string): string {
    // Remove repeated consecutive words
    return text.replace(/\b(\w+)\s+\1\b/gi, "$1");
  }

  private simplifySentences(text: string): string {
    return text
      .replace(/,\s*which\s+/gi, ". This ")
      .replace(/;\s*/g, ". ")
      .replace(/\s{2,}/g, " ");
  }
}

// ====================
// 2. STATISTICAL COMPRESSOR (TF-IDF)
// ====================
class StatisticalCompressor {
  compress(text: string, targetRatio: number = 0.6): string {
    const sentences = this.splitIntoSentences(text);
    if (sentences.length <= 2) return text;

    const wordFreq = this.calculateWordFrequencies(text);
    const scoredSentences = this.scoreSentences(sentences, wordFreq);

    const keepCount = Math.max(1, Math.ceil(sentences.length * targetRatio));

    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, keepCount)
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map((item) => item.sentence)
      .join(" ");
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
  }

  private calculateWordFrequencies(text: string): Record<string, number> {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3); // Skip short words

    const freq: Record<string, number> = {};
    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });

    return freq;
  }

  private scoreSentences(
    sentences: string[],
    wordFreq: Record<string, number>
  ): Array<{
    sentence: string;
    score: number;
    originalIndex: number;
  }> {
    return sentences.map((sentence, index) => {
      const words = sentence
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 3);

      if (words.length === 0) {
        return { sentence, score: 0, originalIndex: index };
      }

      // Calculate average word frequency score
      const totalScore = words.reduce((sum, word) => {
        return sum + (wordFreq[word] || 0);
      }, 0);

      const avgScore = totalScore / words.length;

      // Boost score for longer sentences (but not too long)
      const lengthBoost = Math.min(words.length / 20, 1.5);

      // Boost score for sentences with numbers or specific terms
      const specificityBoost = /\d+|%|\$/.test(sentence) ? 1.2 : 1;

      return {
        sentence,
        score: avgScore * lengthBoost * specificityBoost,
        originalIndex: index,
      };
    });
  }
}

// ====================
// 3. HYBRID COMPRESSOR
// ====================
export class HybridCompressor {
  private ruleBasedCompressor: RuleBasedCompressor;
  private statisticalCompressor: StatisticalCompressor;

  constructor() {
    this.ruleBasedCompressor = new RuleBasedCompressor();
    this.statisticalCompressor = new StatisticalCompressor();
  }

  async compress(
    text: string,
    targetRatio: number = 0.5,
    options: { enableLogging?: boolean } = {}
  ): Promise<{
    compressed: string;
    originalLength: number;
    compressedLength: number;
    compressionRatio: number;
    processingTime: number;
    method: string;
  }> {
    const startTime = Date.now();
    let compressed = text;

    if (options.enableLogging) {
      console.log(`📝 Original length: ${text.length} characters`);
    }

    // Step 1: Rule-based compression (fast)
    compressed = this.ruleBasedCompressor.compress(compressed);
    if (options.enableLogging) {
      console.log(`🔧 After rule-based: ${compressed.length} characters`);
    }

    // Step 2: Statistical compression if still too long
    const currentRatio = compressed.length / text.length;
    if (currentRatio > targetRatio) {
      const neededRatio = targetRatio / currentRatio;
      compressed = this.statisticalCompressor.compress(compressed, neededRatio);
      if (options.enableLogging) {
        console.log(`📊 After statistical: ${compressed.length} characters`);
      }
    }

    const processingTime = Date.now() - startTime;
    const finalRatio = compressed.length / text.length;

    return {
      compressed,
      originalLength: text.length,
      compressedLength: compressed.length,
      compressionRatio: finalRatio,
      processingTime,
      method: "hybrid",
    };
  }
}

// ====================
// 4. COMPRESSION UTILITIES
// ====================
export class CompressionUtils {
  static shouldCompress(text: string, maxLength: number = 2000): boolean {
    return text.length > maxLength;
  }

  static getOptimalCompressionRatio(
    textLength: number,
    targetLength: number
  ): number {
    const ratio = targetLength / textLength;
    // Ensure ratio is between 0.1 and 0.8
    return Math.max(0.1, Math.min(0.8, ratio));
  }

  static formatCompressionStats(result: {
    originalLength: number;
    compressedLength: number;
    compressionRatio: number;
    processingTime: number;
  }): string {
    return `Compressed ${result.originalLength} → ${
      result.compressedLength
    } chars (${(result.compressionRatio * 100).toFixed(1)}%) in ${
      result.processingTime
    }ms`;
  }
}

// Export individual compressors for testing
export { RuleBasedCompressor, StatisticalCompressor };
