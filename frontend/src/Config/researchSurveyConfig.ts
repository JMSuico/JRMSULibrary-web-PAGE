/**
 * Research Survey Configuration for JRMSU Katipunan Campus Library
 * 
 * Non-Hardcoded Survey Configuration & Quota Control.
 * When the survey sample size quota is reached, simply set `enabled: false`
 * or define `VITE_RESEARCH_SURVEY_ENABLED=false` in the environment.
 * 
 * Associated Analytics:
 * Responses & Analytics Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1YlTUZCR2r0ApE23YABLk344uw2Jz5EwvGQ_SfK3C3mA/edit?usp=sharing
 */

export interface ResearchSurveyConfig {
  /** Master toggle to show or hide the survey sticky note across all pages */
  enabled: boolean;
  /** Primary Google Form URL for research participation */
  formUrl: string;
  /** Live Analytics & Response tracking sheet for researchers and librarians */
  analyticsSpreadsheetUrl: string;
  /** Vertical text label rendered on the sticky tab */
  badgeLabel: string;
  /** Material Symbol icon name (e.g. 'assignment', 'quiz', 'poll') */
  iconName: string;
  /** Hover callout card title */
  tooltipTitle: string;
  /** Hover callout card description */
  tooltipSubtitle: string;
  /** Target sample quota number for documentation / tracking */
  targetSampleQuota?: number;
  /** Optional auto-expiry date ('YYYY-MM-DD'); if current date >= expiryDate, auto-deactivates */
  expiryDate?: string | null;
}

export const RESEARCH_SURVEY_CONFIG: ResearchSurveyConfig = {
  // Master toggle: easily set to false when sample size quota is reached
  enabled: false, // Temporarily disabled while updating Google Form questions
  
  formUrl: 
    (typeof import.meta.env.VITE_RESEARCH_SURVEY_URL === 'string' && import.meta.env.VITE_RESEARCH_SURVEY_URL) || 
    'https://docs.google.com/forms/d/e/1FAIpQLSf5vvuLjVZ_3SszEYuMJRFBBLPH6BZ4wNbGcut_Vt4H7bQcWw/viewform?usp=dialog',
    
  analyticsSpreadsheetUrl:
    'https://docs.google.com/spreadsheets/d/1YlTUZCR2r0ApE23YABLk344uw2Jz5EwvGQ_SfK3C3mA/edit?usp=sharing',
    
  badgeLabel: 'RESEARCH SURVEY',
  iconName: 'assignment',
  tooltipTitle: 'JRMSU Library Research Survey',
  tooltipSubtitle: 'Participate in our academic library research study (takes ~2 mins)',
  targetSampleQuota: 385,
  expiryDate: null,
};

/**
 * Evaluates whether the research survey sticky card should be active and visible.
 */
export const isResearchSurveyActive = (): boolean => {
  if (!RESEARCH_SURVEY_CONFIG.enabled || !RESEARCH_SURVEY_CONFIG.formUrl) {
    return false;
  }
  if (RESEARCH_SURVEY_CONFIG.expiryDate) {
    const expiry = new Date(RESEARCH_SURVEY_CONFIG.expiryDate).getTime();
    if (Date.now() >= expiry) {
      return false;
    }
  }
  return true;
};
