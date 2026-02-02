/**
 * Privacy Score Calculator
 * 
 * Calculates an A-F grade based on:
 * - Tracker count and ratio
 * - Third-party request ratio
 * - Number of unique domains contacted
 * - Cookie risk factors
 */

export type PrivacyGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface PrivacyScoreResult {
  grade: PrivacyGrade;
  score: number; // 0-100
  breakdown: {
    trackerPenalty: number;
    thirdPartyPenalty: number;
    domainPenalty: number;
  };
  summary: string;
  details: string[];
}

interface ScoreInput {
  totalRequests: number;
  firstPartyCount: number;
  thirdPartyCount: number;
  trackerCount: number;
  trackerDomains: string[];
  uniqueDomains: string[];
}

/**
 * Calculate privacy score from request statistics
 */
export function calculatePrivacyScore(stats: ScoreInput): PrivacyScoreResult {
  const { totalRequests, thirdPartyCount, trackerCount, trackerDomains, uniqueDomains } = stats;
  
  // Start with perfect score
  let score = 100;
  const details: string[] = [];
  
  // === Tracker Penalty (most severe, up to 50 points) ===
  let trackerPenalty = 0;
  if (trackerCount > 0) {
    // Each tracker costs 8 points, max 40 points
    trackerPenalty = Math.min(trackerCount * 8, 40);
    
    // Additional penalty if trackers are more than 10% of requests
    const trackerRatio = totalRequests > 0 ? trackerCount / totalRequests : 0;
    if (trackerRatio > 0.1) {
      trackerPenalty += 10;
    }
    
    details.push(`${trackerCount} tracker${trackerCount > 1 ? 's' : ''} detected (${trackerDomains.slice(0, 3).join(', ')}${trackerDomains.length > 3 ? '...' : ''})`);
  }
  score -= trackerPenalty;
  
  // === Third-Party Penalty (up to 30 points) ===
  let thirdPartyPenalty = 0;
  if (totalRequests > 0) {
    const thirdPartyRatio = thirdPartyCount / totalRequests;
    
    if (thirdPartyRatio > 0.7) {
      thirdPartyPenalty = 30;
      details.push(`High third-party ratio: ${Math.round(thirdPartyRatio * 100)}% of requests go to external servers`);
    } else if (thirdPartyRatio > 0.5) {
      thirdPartyPenalty = 20;
      details.push(`Moderate third-party usage: ${Math.round(thirdPartyRatio * 100)}% of requests are external`);
    } else if (thirdPartyRatio > 0.3) {
      thirdPartyPenalty = 10;
      details.push(`Some third-party requests: ${Math.round(thirdPartyRatio * 100)}% external`);
    }
  }
  score -= thirdPartyPenalty;
  
  // === Domain Count Penalty (up to 20 points) ===
  let domainPenalty = 0;
  const domainCount = uniqueDomains.length;
  
  if (domainCount > 30) {
    domainPenalty = 20;
    details.push(`Contacts ${domainCount} different servers - very high`);
  } else if (domainCount > 20) {
    domainPenalty = 15;
    details.push(`Contacts ${domainCount} different servers - high`);
  } else if (domainCount > 10) {
    domainPenalty = 8;
    details.push(`Contacts ${domainCount} different servers`);
  } else if (domainCount > 5) {
    domainPenalty = 3;
  }
  score -= domainPenalty;
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Calculate grade
  const grade = scoreToGrade(score);
  
  // Generate summary
  const summary = generateSummary(grade);
  
  // Add positive detail if score is high
  if (score >= 80 && details.length === 0) {
    details.push('This site has good privacy practices');
  }
  
  return {
    grade,
    score,
    breakdown: {
      trackerPenalty,
      thirdPartyPenalty,
      domainPenalty,
    },
    summary,
    details,
  };
}

function scoreToGrade(score: number): PrivacyGrade {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function generateSummary(grade: PrivacyGrade): string {
  switch (grade) {
    case 'A':
      return 'Excellent privacy! Minimal tracking and external requests.';
    case 'B':
      return 'Good privacy. Some third-party services but limited tracking.';
    case 'C':
      return 'Moderate privacy concerns. Consider using a content blocker.';
    case 'D':
      return 'Poor privacy. Significant tracking and data sharing detected.';
    case 'F':
      return 'Very poor privacy. Heavy tracking and surveillance detected.';
    default:
      return 'Unable to determine privacy score.';
  }
}

/**
 * Get the color class for a grade
 */
export function getGradeColor(grade: PrivacyGrade): string {
  switch (grade) {
    case 'A': return 'text-green-600 bg-green-100';
    case 'B': return 'text-green-500 bg-green-50';
    case 'C': return 'text-yellow-600 bg-yellow-100';
    case 'D': return 'text-orange-600 bg-orange-100';
    case 'F': return 'text-red-600 bg-red-100';
  }
}

/**
 * Get an emoji for the grade
 */
export function getGradeEmoji(grade: PrivacyGrade): string {
  switch (grade) {
    case 'A': return '🛡️';
    case 'B': return '✅';
    case 'C': return '⚠️';
    case 'D': return '🚨';
    case 'F': return '❌';
  }
}
