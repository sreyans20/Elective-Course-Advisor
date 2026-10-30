/**
 * Comprehensive Security & Defense Layer for Elective Course Advisor
 * 
 * Protects against:
 * 1. Prompt Injection & Jailbreak attempts
 * 2. Cross-Site Scripting (XSS) & HTML injection in user inputs and CSV files
 * 3. Secret leaks & Credential exfiltration
 * 4. API Key credit draining & Rate limiting abuse
 * 5. Deterministic rule boundary integrity
 */

// 1. XSS & HTML Sanitization
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;'
};

/**
 * Escapes unsafe HTML characters to prevent XSS attacks
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    return String(input);
  }
  return input.replace(/[&<>"'`/]/g, (match) => HTML_ESCAPE_MAP[match] || match).trim();
}

/**
 * Strips dangerous URI schemes (javascript:, vbscript:, data:)
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('vbscript:') || trimmed.startsWith('data:text/html')) {
    return 'about:blank';
  }
  return url;
}

// 2. Prompt Injection & Jailbreak Detection
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|all|the\s+above)\s+(instructions|rules|constraints|prompts)/i,
  /disregard\s+(all\s+)?(rules|constraints|prior\s+instructions)/i,
  /system\s+prompt/i,
  /leak\s+(the\s+)?(prompt|secret|api|key)/i,
  /you\s+are\s+now\s+(dan|jailbreak|unrestricted|god\s+mode)/i,
  /bypass\s+(prerequisite|timetable|constraint|academic\s+rules)/i,
  /reveal\s+(internal|hidden|system|admin)/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /eval\s*\(/i,
  /base64\s*decode/i
];

export interface SecurityAuditResult {
  isSafe: boolean;
  sanitized: string;
  threatsDetected: string[];
}

/**
 * Inspects user input for prompt injection, jailbreak keywords, or code injection
 */
export function auditUserInput(input: string): SecurityAuditResult {
  const threats: string[] = [];
  const raw = String(input || '');

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(raw)) {
      threats.push(`Potential security rule breach / injection pattern: "${pattern.source}"`);
    }
  }

  // Sanitize text for display
  const sanitized = sanitizeText(raw);

  return {
    isSafe: threats.length === 0,
    sanitized,
    threatsDetected: threats
  };
}

// 3. API Key & Rate Limiting Protection (Credit Drain Prevention)
export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  dailyUsageQuota: number;
}

class ApiSecurityManager {
  private requestTimestamps: number[] = [];
  private dailyRequestCount: number = 0;
  private lastResetDay: number = new Date().getDate();
  private readonly config: RateLimitConfig = {
    maxRequestsPerMinute: 20,
    dailyUsageQuota: 200
  };

  /**
   * Enforces local rate limits to prevent denial-of-wallet / credit draining
   */
  public canMakeRequest(): { allowed: boolean; reason?: string; remainingQuota: number } {
    const now = Date.now();
    const currentDay = new Date().getDate();

    // Reset daily quota if new day
    if (currentDay !== this.lastResetDay) {
      this.dailyRequestCount = 0;
      this.lastResetDay = currentDay;
    }

    // Clean timestamps older than 60 seconds
    this.requestTimestamps = this.requestTimestamps.filter(t => now - t < 60000);

    if (this.requestTimestamps.length >= this.config.maxRequestsPerMinute) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: Maximum ${this.config.maxRequestsPerMinute} requests/minute allowed to protect your quota.`,
        remainingQuota: Math.max(0, this.config.dailyUsageQuota - this.dailyRequestCount)
      };
    }

    if (this.dailyRequestCount >= this.config.dailyUsageQuota) {
      return {
        allowed: false,
        reason: `Daily usage cap reached (${this.config.dailyUsageQuota} requests). Prevents unexpected credit drain.`,
        remainingQuota: 0
      };
    }

    return {
      allowed: true,
      remainingQuota: this.config.dailyUsageQuota - this.dailyRequestCount
    };
  }

  public recordRequest(): void {
    this.requestTimestamps.push(Date.now());
    this.dailyRequestCount++;
  }

  /**
   * Masks sensitive credentials so they are never displayed in logs or UI
   */
  public maskSecret(secret: string): string {
    if (!secret || secret.length < 8) return '••••••••';
    return `${secret.slice(0, 4)}••••••••${secret.slice(-4)}`;
  }
}

export const apiSecurity = new ApiSecurityManager();
