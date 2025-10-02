import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { fetchDailyVitalData, fetchWeeklyVitalData, ChartDataPoint } from '../utils/chartData';
import { debugVitalData } from '../utils/debugData';
import { supabase } from '../utils/supabaseClient';

interface VitalChartProps {
  isOpen: boolean;
  onClose: () => void;
  vitalType: 'heartrate' | 'water' | 'steps' | 'sleep';
  userId: string;
}

export function VitalChart({ isOpen, onClose, vitalType, userId }: VitalChartProps) {
  const [viewType, setViewType] = useState<'daily' | 'weekly'>('daily');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const vitalConfig = {
    heartrate: {
      title: 'Heart Rate',
      unit: 'bpm',
      color: '#ef4444',
      icon: '❤️'
    },
    water: {
      title: 'Water Intake',
      unit: 'L',
      color: '#06b6d4',
      icon: '💧'
    },
    steps: {
      title: 'Steps',
      unit: 'steps',
      color: '#10b981',
      icon: '👣'
    },
    sleep: {
      title: 'Sleep',
      unit: 'hrs',
      color: '#8b5cf6',
      icon: '😴'
    }
  };

  const config = vitalConfig[vitalType];

  useEffect(() => {
    if (isOpen) {
      fetchChartData();
    }
  }, [isOpen, viewType, vitalType, userId]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      // Add debug logging to understand data format
      await debugVitalData(userId, vitalType);
      
      if (viewType === 'daily') {
        await fetchDailyData();
      } else {
        await fetchWeeklyData();
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyData = async () => {
    try {
      const data = await fetchDailyVitalData({ userId, vitalType });
      setChartData(data);
      
      // If no data found with timestamp filtering, try a simpler approach
      if (data.length === 0) {
        console.log('No data found with timestamp filtering, trying simpler approach...');
        await fetchDailyDataSimple();
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
      setChartData([]);
    }
  };

  const fetchDailyDataSimple = async () => {
    try {
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
          return;
      }

      // Get all recent data (last 50 records) and filter client-side
      const { data, error } = await supabase
        .from(tableName)
        .select(`${valueColumn}, recorded_at`)
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error || !data) {
        console.error('Error in simple fetch:', error);
        return;
      }

      console.log(`Simple fetch got ${data.length} records`);

      // Filter for today's data
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const todayData = data.filter((record: any) => {
        let recordDate: Date;
        
        // Handle different timestamp formats
        if (typeof record.recorded_at === 'number') {
          // Try both seconds and milliseconds
          recordDate = record.recorded_at > 1000000000000 
            ? new Date(record.recorded_at) 
            : new Date(record.recorded_at * 1000);
        } else {
          recordDate = new Date(record.recorded_at);
        }

        return recordDate >= startOfDay && recordDate < endOfDay;
      });

      console.log(`Found ${todayData.length} records for today`);

      if (todayData.length > 0) {
        // Create simple chart data - just show the values we have
        const chartData: ChartDataPoint[] = todayData.map((record: any) => {
          let recordDate: Date;
          
          if (typeof record.recorded_at === 'number') {
            recordDate = record.recorded_at > 1000000000000 
              ? new Date(record.recorded_at) 
              : new Date(record.recorded_at * 1000);
          } else {
            recordDate = new Date(record.recorded_at);
          }

          return {
            time: recordDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            }),
            value: Number(record[valueColumn])
          };
        }).reverse(); // Reverse to show chronological order

        setChartData(chartData);
      } else {
        // If no today data, just show the most recent entries as a fallback
        console.log('No today data found, showing recent entries as fallback');
        const recentChartData: ChartDataPoint[] = data.slice(0, 10).map((record: any, index: number) => {
          return {
            time: `Entry ${index + 1}`,
            value: Number(record[valueColumn])
          };
        }).reverse();

        setChartData(recentChartData);
      }
    } catch (error) {
      console.error('Error in simple daily fetch:', error);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const data = await fetchWeeklyVitalData({ userId, vitalType });
      setChartData(data);
      
      // If no data found with the original approach, try the simple approach
      if (data.length === 0) {
        console.log('No weekly data found with original approach, trying simple approach...');
        await fetchWeeklyDataSimple();
      }
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setChartData([]);
    }
  };

  const fetchWeeklyDataSimple = async () => {
    try {
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
          return;
      }

      // Get the last 7 days including today
      const today = new Date();
      const dates = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date);
      }

      console.log('Fetching weekly data for dates:', dates.map(d => d.toDateString()));

      // Get all data from the past week
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from(tableName)
        .select(`${valueColumn}, recorded_at`)
        .eq('user_id', userId)
        .gte('recorded_at', weekAgo.toISOString())
        .order('recorded_at', { ascending: true });

      if (error || !data) {
        console.error('Error fetching weekly data:', error);
        return;
      }

      console.log(`Got ${data.length} records for weekly data`);

      // Group data by date and find last entry for each day
      const dailyData: { [dateKey: string]: any[] } = {};
      
      data.forEach((record: any) => {
        const recordDate = new Date(record.recorded_at);
        const dateKey = recordDate.toDateString(); // e.g., "Wed Oct 02 2025"
        
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = [];
        }
        dailyData[dateKey].push(record);
      });

      // Create chart data for each of the 7 days
      const chartData: ChartDataPoint[] = dates.map(date => {
        const dateKey = date.toDateString();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayRecords = dailyData[dateKey] || [];

        if (dayRecords.length > 0) {
          // Get the last record of the day
          const lastRecord = dayRecords[dayRecords.length - 1];
          const value = Number(lastRecord[valueColumn]);

          if (vitalType === 'heartrate') {
            // For heartrate, also calculate min and max for the day
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
            return {
              time: dayName,
              value: Math.round(value * 100) / 100
            };
          }
        } else {
          // No data for this day
          const result: ChartDataPoint = {
            time: dayName,
            value: 0
          };
          
          if (vitalType === 'heartrate') {
            result.min = 0;
            result.max = 0;
          }
          
          return result;
        }
      });

      console.log('Weekly chart data:', chartData);
      setChartData(chartData);

    } catch (error) {
      console.error('Error in simple weekly fetch:', error);
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading chart data...</div>
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No data available</div>
        </div>
      );
    }

    const ChartComponent = viewType === 'daily' ? LineChart : (vitalType === 'heartrate' ? LineChart : BarChart);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [`${value} ${config.unit}`, name]}
            labelStyle={{ color: '#374151' }}
          />
          
          {viewType === 'daily' || vitalType !== 'heartrate' ? (
            vitalType === 'steps' && viewType === 'weekly' ? (
              <Bar dataKey="value" fill={config.color} />
            ) : (
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={config.color}
                strokeWidth={2}
                dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
              />
            )
          ) : (
            <>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={config.color}
                strokeWidth={2}
                name="Average"
                dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="min" 
                stroke="#fca5a5"
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Min"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="max" 
                stroke="#dc2626"
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Max"
                dot={false}
              />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <h2 className="text-2xl font-bold text-gray-800">{config.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewType('daily')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewType === 'daily'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Daily (Today)
          </button>
          <button
            onClick={() => setViewType('weekly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewType === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Weekly (Past 7 Days)
          </button>
        </div>

        {/* Chart Description */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {viewType === 'daily' 
              ? `Showing ${config.title.toLowerCase()} data from 12:00 AM to 12:00 AM today`
              : vitalType === 'heartrate'
                ? `Showing daily averages, minimums, and maximums for the past week`
                : `Showing last recorded value for each day of the past week`
            }
          </p>
        </div>

        {/* Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {renderChart()}
        </div>
      </div>
    </div>
  );
}