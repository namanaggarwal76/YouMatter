import React, { useState, useEffect } from 'react';
import { HeartPulse, Droplets, Footprints, Bed, Plus, Check } from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { supabase } from '../utils/supabaseClient';
import { VitalChart } from './VitalChart';

export function Dashboard() {
  const { user } = useSupabase();
  const [vitals, setVitals] = useState<{ [key: string]: number | undefined }>({});
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVital, setSelectedVital] = useState<'heartrate' | 'water' | 'steps' | 'sleep' | null>(null);
  const [addingWater, setAddingWater] = useState(false);
  const [showWaterButtons, setShowWaterButtons] = useState(false);

  useEffect(() => {
    const fetchVitals = async () => {
      if (!user) {
        return;
      }
      
      setLoadingVitals(true);
      setError(null);
      
      try {
        // Fetch latest heartrate
        const { data: heartrateData, error: heartrateError } = await supabase
          .from('user_heartrate')
          .select('heartbeat, recorded_at')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1);
        
        // Fetch latest sleep
        const { data: sleepData, error: sleepError } = await supabase
          .from('user_sleep')
          .select('hours, recorded_at')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1);
        
        // Fetch latest steps
        const { data: stepsData, error: stepsError } = await supabase
          .from('user_steps')
          .select('steps, recorded_at')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1);
        
        // Fetch latest water
        const { data: waterData, error: waterError } = await supabase
          .from('user_water')
          .select('liters, recorded_at')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(1);
        
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

  // Function to add water intake
  const addWaterIntake = async (liters: number) => {
    if (!user) return;
    
    setAddingWater(true);
    try {
      console.log(`[Dashboard] Adding ${liters}L of water for user:`, user.id);
      
      // Get current water intake for today
      const currentWater = vitals.water || 0;
      const newWaterAmount = currentWater + liters;
      
      console.log(`[Dashboard] Current water: ${currentWater}L, Adding: ${liters}L, New total: ${newWaterAmount}L`);
      
      // Insert new water intake record with the accumulated amount
      const { error: insertError } = await supabase
        .from('user_water')
        .insert({
          user_id: user.id,
          liters: newWaterAmount,
          recorded_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('[Dashboard] Error inserting water data:', insertError);
        setError('Failed to add water intake');
        return;
      }

      console.log('[Dashboard] Water intake added successfully');
      
      // Update the vitals state immediately with the new total
      setVitals(prev => ({
        ...prev,
        water: newWaterAmount
      }));

      setShowWaterButtons(false);
      setError(null);
    } catch (err) {
      console.error('[Dashboard] Error adding water intake:', err);
      setError('Failed to add water intake');
    } finally {
      setAddingWater(false);
    }
  };

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
        <div 
          onClick={() => setSelectedVital('heartrate')}
          className="bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl p-8 text-white cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <HeartPulse className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Heart Rate</p>
          <p className="text-4xl font-bold">
            {loadingVitals ? '...' : vitals.heartrate !== undefined ? vitals.heartrate : 'No data'}{' '}
            <span className="text-base font-normal">bpm</span>
          </p>
          <p className="text-xs opacity-75 mt-2">Click to view charts</p>
        </div>
        {/* Water */}
        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-8 text-white transition-all duration-300 shadow-lg hover:shadow-xl">
          <div onClick={() => setSelectedVital('water')} className="cursor-pointer">
            <Droplets className="w-10 h-10 mb-3 opacity-90" />
            <p className="text-lg opacity-90 mb-1">Water</p>
            <p className="text-4xl font-bold">
              {loadingVitals ? '...' : vitals.water !== undefined ? vitals.water : 'No data'}{' '}
              <span className="text-base font-normal">L</span>
            </p>
            <p className="text-xs opacity-75 mt-2">Click to view charts</p>
          </div>
          
          {/* Water Intake Buttons */}
          <div className="mt-4 pt-4 border-t border-blue-300/30">
            {!showWaterButtons ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowWaterButtons(true);
                }}
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Water Intake
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium mb-2">How much water did you drink?</p>
                <div className="grid grid-cols-2 gap-2">
                  {[0.5, 1, 1.5, 2].map((amount) => (
                    <button
                      key={amount}
                      onClick={(e) => {
                        e.stopPropagation();
                        addWaterIntake(amount);
                      }}
                      disabled={addingWater}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +{amount}L
                    </button>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowWaterButtons(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg py-2 px-4 text-xs opacity-75 hover:opacity-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Steps */}
        <div 
          onClick={() => setSelectedVital('steps')}
          className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-8 text-white cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Footprints className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Steps</p>
          <p className="text-4xl font-bold">
            {loadingVitals ? '...' : vitals.steps !== undefined ? vitals.steps : 'No data'}
          </p>
          <p className="text-xs opacity-75 mt-2">Click to view charts</p>
        </div>
        {/* Sleep */}
        <div 
          onClick={() => setSelectedVital('sleep')}
          className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl p-8 text-white cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Bed className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Sleep</p>
          <p className="text-4xl font-bold">
            {loadingVitals ? '...' : vitals.sleep !== undefined ? vitals.sleep : 'No data'}{' '}
            <span className="text-base font-normal">hrs</span>
          </p>
          <p className="text-xs opacity-75 mt-2">Click to view charts</p>
        </div>
      </div>

      {/* VitalChart Modal */}
      {selectedVital && (
        <VitalChart
          isOpen={selectedVital !== null}
          onClose={() => setSelectedVital(null)}
          vitalType={selectedVital}
          userId={user.id}
        />
      )}
    </div>
  );
}

