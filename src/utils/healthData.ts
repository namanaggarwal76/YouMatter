import { supabase } from './supabaseClient';

export interface HealthData {
  daily_steps: number;
  heart_rate_bpm: number;
  water_intake_oz: number;
  daily_journal_entry: string;
}

/**
 * Fetch the latest health data for a user from the database
 * @param userId - User ID to fetch data for
 * @returns Health data object with latest values
 */
export async function fetchLatestHealthData(userId: string): Promise<HealthData> {
  console.log(`[HealthData] Fetching latest health data for user: ${userId}`);
  
  try {
    // Fetch latest steps
    const { data: stepsData, error: stepsError } = await supabase
      .from('user_steps')
      .select('steps, recorded_at')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1);

    // Fetch latest heart rate
    const { data: heartrateData, error: heartrateError } = await supabase
      .from('user_heartrate')
      .select('heartbeat, recorded_at')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1);

    // Fetch latest water intake
    const { data: waterData, error: waterError } = await supabase
      .from('user_water')
      .select('liters, recorded_at')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1);

    console.log('[HealthData] Raw data fetched:', {
      steps: stepsData,
      heartrate: heartrateData,
      water: waterData,
      errors: { stepsError, heartrateError, waterError }
    });

    // Extract the latest values or use defaults
    const steps = (!stepsError && stepsData && stepsData.length > 0) 
      ? Number(stepsData[0].steps) 
      : 5000; // Default value

    const heartRate = (!heartrateError && heartrateData && heartrateData.length > 0) 
      ? Number(heartrateData[0].heartbeat) 
      : 72; // Default value

    // Convert liters to ounces (1 liter = 33.814 ounces)
    const waterLiters = (!waterError && waterData && waterData.length > 0) 
      ? Number(waterData[0].liters) 
      : 1.5; // Default 1.5 liters
    const waterOunces = Math.round(waterLiters * 33.814);

    const healthData: HealthData = {
      daily_steps: steps,
      heart_rate_bpm: heartRate,
      water_intake_oz: waterOunces,
      daily_journal_entry: "I'm feeling good today and ready to tackle my wellness goals!" // Default mood - will be replaced with user input
    };

    console.log('[HealthData] Processed health data:', healthData);
    return healthData;

  } catch (error) {
    console.error('[HealthData] Error fetching health data:', error);
    
    // Return default values if there's an error
    return {
      daily_steps: 5000,
      heart_rate_bpm: 72,
      water_intake_oz: 51, // ~1.5 liters
      daily_journal_entry: "I'm feeling good today and ready to tackle my wellness goals!"
    };
  }
}

/**
 * Check if user has been prompted for mood today
 * @param userId - User ID to check
 * @returns boolean indicating if user was already prompted today
 */
export function hasBeenPromptedToday(userId: string): boolean {
  const today = new Date().toDateString();
  const lastPrompted = localStorage.getItem(`mood_prompt_${userId}`);
  
  return lastPrompted === today;
}

/**
 * Mark user as prompted for mood today
 * @param userId - User ID to mark
 */
export function markAsPromptedToday(userId: string): void {
  const today = new Date().toDateString();
  localStorage.setItem(`mood_prompt_${userId}`, today);
}

/**
 * Store user's mood response for today
 * @param userId - User ID
 * @param mood - User's mood response
 */
export function storeMoodResponse(userId: string, mood: string): void {
  const today = new Date().toDateString();
  localStorage.setItem(`mood_response_${userId}_${today}`, mood);
}

/**
 * Get user's mood response for today
 * @param userId - User ID
 * @returns User's mood response or null if not found
 */
export function getTodaysMoodResponse(userId: string): string | null {
  const today = new Date().toDateString();
  return localStorage.getItem(`mood_response_${userId}_${today}`);
}