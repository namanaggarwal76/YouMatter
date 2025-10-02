import { supabase } from './supabaseClient';

export async function debugVitalData(userId: string, vitalType: 'heartrate' | 'water' | 'steps' | 'sleep') {
  let tableName: string;
  let valueColumn: string;

  switch (vitalType) {
    case 'heartrate':
      tableName = 'user_heartrate';
      valueColumn = 'heartbeat';
      break;
    case 'water':
      tableName = 'user_water';
      valueColumn = 'liters';
      break;
    case 'steps':
      tableName = 'user_steps';
      valueColumn = 'steps';
      break;
    case 'sleep':
      tableName = 'user_sleep';
      valueColumn = 'hours';
      break;
    default:
      throw new Error(`Unknown vital type: ${vitalType}`);
  }

  console.log(`\n=== DEBUG ${vitalType.toUpperCase()} DATA ===`);
  
  try {
    // Fetch all data for this user and vital type
    const { data, error } = await supabase
      .from(tableName)
      .select(`${valueColumn}, recorded_at`)
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error(`Error fetching ${vitalType} data:`, error);
      return;
    }

    console.log(`Found ${data?.length || 0} records:`);
    data?.forEach((record: any, index: number) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  Value: ${record[valueColumn]}`);
      console.log(`  Recorded at: ${record.recorded_at}`);
      console.log(`  Type of recorded_at: ${typeof record.recorded_at}`);
      
      // Try to parse as different formats
      if (typeof record.recorded_at === 'number') {
        console.log(`  As Unix timestamp: ${new Date(record.recorded_at * 1000).toISOString()}`);
        console.log(`  As milliseconds: ${new Date(record.recorded_at).toISOString()}`);
      } else if (typeof record.recorded_at === 'string') {
        console.log(`  As ISO string: ${new Date(record.recorded_at).toISOString()}`);
      }
      console.log('---');
    });

    // Check what today's date range would be
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    console.log(`Today's date range:`);
    console.log(`  Start: ${startOfDay.toISOString()} (Unix: ${Math.floor(startOfDay.getTime() / 1000)})`);
    console.log(`  End: ${endOfDay.toISOString()} (Unix: ${Math.floor(endOfDay.getTime() / 1000)})`);
    
  } catch (err) {
    console.error(`Error in debug function:`, err);
  }
}