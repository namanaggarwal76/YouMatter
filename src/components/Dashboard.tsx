import React, { useState, useEffect } from 'react';
import { HeartPulse, Droplets, Footprints, Bed } from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { supabase } from '../utils/supabaseClient';

export function Dashboard() {
  const { user } = useSupabase();
  const [vitals, setVitals] = useState<{ [key: string]: number | undefined }>({});
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('[Dashboard] User:', user);
  console.log('[Dashboard] Component rendered');

  useEffect(() => {
    const fetchVitals = async () => {
      if (!user) {
        console.log('[Dashboard] No user found, skipping vitals fetch');
        return;
      }
      
      console.log('[Dashboard] Fetching vitals for user ID:', user.id);
      setLoadingVitals(true);
      setError(null);
      
      try {
        // Fetch latest heartrate
        console.log('[Dashboard] Fetching heartrate...');
        const { data: heartrateData, error: heartrateError } = await supabase
          .from('user_heartrate')
          .select('heartbeat, recorded_at')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1);
        
        console.log('[Dashboard] Heartrate data:', heartrateData, 'error:', heartrateError);

        // Fetch latest sleep
        console.log('[Dashboard] Fetching sleep...');
        const { data: sleepData, error: sleepError } = await supabase
          .from('user_sleep')
          .select('hours, recorded_at')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1);
        
        console.log('[Dashboard] Sleep data:', sleepData, 'error:', sleepError);

        // Fetch latest steps
        console.log('[Dashboard] Fetching steps...');
        const { data: stepsData, error: stepsError } = await supabase
          .from('user_steps')
          .select('steps, recorded_at')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1);
        
        console.log('[Dashboard] Steps data:', stepsData, 'error:', stepsError);

        // Fetch latest water
        console.log('[Dashboard] Fetching water...');
        const { data: waterData, error: waterError } = await supabase
          .from('user_water')
          .select('liters, recorded_at')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1);
        
        console.log('[Dashboard] Water data:', waterData, 'error:', waterError);

        const newVitals = {
          heartrate:
            heartrateError || !heartrateData || heartrateData.length === 0
              ? undefined
              : Number(heartrateData[0].heartbeat),
          sleep:
            sleepError || !sleepData || sleepData.length === 0
              ? undefined
              : Number(sleepData[0].hours),
          steps:
            stepsError || !stepsData || stepsData.length === 0
              ? undefined
              : Number(stepsData[0].steps),
          water:
            waterError || !waterData || waterData.length === 0
              ? undefined
              : Number(waterData[0].liters),
        };
        
        console.log('[Dashboard] Final vitals:', newVitals);
        setVitals(newVitals);
      } catch (err) {
        console.error('[Dashboard] Error fetching vitals:', err);
        setError('Failed to load vitals data');
      } finally {
        setLoadingVitals(false);
      }
    };
    
    fetchVitals();
  }, [user]);

  if (!user) {
    console.log('[Dashboard] No user, returning null');
    return <div className="text-center p-8">No user found. Please log in.</div>;
  }
  console.log('[Dashboard] Rendering dashboard for user:', user.name);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 text-lg">Here's your daily vitals overview</p>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <div className="grid grid-cols-2 gap-8">
        {/* Heart Rate */}
        <div className="bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl p-8 text-white cursor-pointer transition-all duration-300 shadow-lg">
          <HeartPulse className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Heart Rate</p>
          <p className="text-4xl font-bold">
            {loadingVitals ? '...' : vitals.heartrate !== undefined ? vitals.heartrate : 'No data'}{' '}
            <span className="text-base font-normal">bpm</span>
          </p>
        </div>
        {/* Water */}
        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-8 text-white cursor-pointer transition-all duration-300 shadow-lg">
          <Droplets className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Water</p>
          <p className="text-4xl font-bold">
            {loadingVitals ? '...' : vitals.water !== undefined ? vitals.water : 'No data'}{' '}
            <span className="text-base font-normal">L</span>
          </p>
        </div>
        {/* Steps */}
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-8 text-white cursor-pointer transition-all duration-300 shadow-lg">
          <Footprints className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Steps</p>
          <p className="text-4xl font-bold">
            {loadingVitals ? '...' : vitals.steps !== undefined ? vitals.steps : 'No data'}
          </p>
        </div>
        {/* Sleep */}
        <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl p-8 text-white cursor-pointer transition-all duration-300 shadow-lg">
          <Bed className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Sleep</p>
          <p className="text-4xl font-bold">
            {loadingVitals ? '...' : vitals.sleep !== undefined ? vitals.sleep : 'No data'}{' '}
            <span className="text-base font-normal">hrs</span>
          </p>
        </div>
      </div>
    </div>
  );
}

