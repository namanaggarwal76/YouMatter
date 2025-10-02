import { supabase } from './supabaseClient';

export interface ChartDataPoint {
  time: string;
  value: number;
  min?: number;
  max?: number;
}

export interface DailyDataParams {
  userId: string;
  vitalType: 'heartrate' | 'water' | 'steps' | 'sleep';
}

export interface WeeklyDataParams extends DailyDataParams {}

/**
 * Fetch daily data from 12am to 12am today for a specific vital type
 */
export async function fetchDailyVitalData({ userId, vitalType }: DailyDataParams): Promise<ChartDataPoint[]> {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);
  
  // Use ISO string format since the database uses timestamptz
  const startISOString = startOfDay.toISOString();
  const endISOString = endOfDay.toISOString();

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

  try {
    console.log(`[ChartData] Fetching daily ${vitalType} data for user ${userId}`);
    console.log(`[ChartData] Date range: ${startISOString} to ${endISOString}`);

    // First, let's fetch some recent data to see the timestamp format
    const { data: recentData } = await supabase
      .from(tableName)
      .select(`${valueColumn}, recorded_at`)
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(5);

    console.log(`[ChartData] Recent ${vitalType} data sample:`, recentData);

    const { data, error } = await supabase
      .from(tableName)
      .select(`${valueColumn}, recorded_at`)
      .eq('user_id', userId)
      .gte('recorded_at', startISOString)
      .lt('recorded_at', endISOString)
      .order('recorded_at', { ascending: true });

    console.log(`[ChartData] Filtered daily ${vitalType} data:`, data);

    if (error) {
      console.error(`Error fetching daily ${vitalType} data:`, error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log(`[ChartData] No daily ${vitalType} data found for today`);
      return [];
    }

    // Group data by hour and average if multiple entries per hour
    const hourlyData: { [hour: number]: number[] } = {};
    
    data.forEach((record: any) => {
      const recordDate = new Date(record.recorded_at * 1000);
      const hour = recordDate.getHours();
      const value = Number(record[valueColumn]);
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(value);
    });

    // Create chart data for all 24 hours
    const chartData: ChartDataPoint[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      
      if (hourlyData[hour] && hourlyData[hour].length > 0) {
        const average = hourlyData[hour].reduce((sum, val) => sum + val, 0) / hourlyData[hour].length;
        chartData.push({
          time,
          value: Math.round(average * 100) / 100
        });
      } else {
        // For hours with no data, we'll still add a point with value 0
        // This helps maintain the chart structure
        chartData.push({
          time,
          value: 0
        });
      }
    }

    return chartData;
  } catch (error) {
    console.error(`Error in fetchDailyVitalData for ${vitalType}:`, error);
    return [];
  }
}

/**
 * Fetch weekly data for the past 7 days
 * For heartrate: shows last entry, min, and max per day
 * For other vitals: shows last entry per day
 */
export async function fetchWeeklyVitalData({ userId, vitalType }: WeeklyDataParams): Promise<ChartDataPoint[]> {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  
  // Use ISO string format since the database uses timestamptz
  const startISOString = weekAgo.toISOString();
  const endISOString = today.toISOString();

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

  try {
    console.log(`[ChartData] Fetching weekly ${vitalType} data for user ${userId}`);
    console.log(`[ChartData] Week range: ${startISOString} to ${endISOString}`);

    const { data, error } = await supabase
      .from(tableName)
      .select(`${valueColumn}, recorded_at`)
      .eq('user_id', userId)
      .gte('recorded_at', startISOString)
      .lt('recorded_at', endISOString)
      .order('recorded_at', { ascending: true });

    console.log(`[ChartData] Filtered weekly ${vitalType} data:`, data);

    if (error) {
      console.error(`Error fetching weekly ${vitalType} data:`, error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log(`[ChartData] No weekly ${vitalType} data found`);
      return [];
    }

    // Get the last 7 days including today
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }

    // Group data by date
    const dailyData: { [dateKey: string]: any[] } = {};
    
    data.forEach((record: any) => {
      const recordDate = new Date(record.recorded_at);
      const dateKey = recordDate.toDateString();
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = [];
      }
      dailyData[dateKey].push(record);
    });

    // Create chart data for the past 7 days
    const chartData: ChartDataPoint[] = dates.map(date => {
      const dateKey = date.toDateString();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayRecords = dailyData[dateKey] || [];
      
      if (dayRecords.length > 0) {
        // Get the last record of the day
        const lastRecord = dayRecords[dayRecords.length - 1];
        const value = Number(lastRecord[valueColumn]);

        if (vitalType === 'heartrate') {
          // For heartrate: calculate last entry, min, and max
          const allValues = dayRecords.map((r: any) => Number(r[valueColumn]));
          const minValue = Math.min(...allValues);
          const maxValue = Math.max(...allValues);
          
          return {
            time: dayName,
            value: Math.round(value * 100) / 100,
            min: Math.round(minValue * 100) / 100,
            max: Math.round(maxValue * 100) / 100
          };
        } else {
          // For other vitals: use the last entry of the day
          return {
            time: dayName,
            value: Math.round(value * 100) / 100
          };
        }
      } else {
        // No data for this day
        const dataPoint: ChartDataPoint = {
          time: dayName,
          value: 0
        };
        
        if (vitalType === 'heartrate') {
          dataPoint.min = 0;
          dataPoint.max = 0;
        }
        
        return dataPoint;
      }
    });

    return chartData;
  } catch (error) {
    console.error(`Error in fetchWeeklyVitalData for ${vitalType}:`, error);
    return [];
  }
}