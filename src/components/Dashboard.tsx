import React, { useState } from 'react';
import { HeartPulse, Droplets, Footprints, Bed, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Dummy data for demonstration
const vitalsHistory = {
  heartrate: [
    { time: '00:00', value: 68 },
    { time: '04:00', value: 70 },
    { time: '08:00', value: 72 },
    { time: '12:00', value: 80 },
    { time: '16:00', value: 76 },
    { time: '20:00', value: 74 },
    { time: '23:59', value: 71 },
  ],
  heartrateWeek: [
    { day: 'Mon', min: 68, max: 80 },
    { day: 'Tue', min: 70, max: 82 },
    { day: 'Wed', min: 69, max: 78 },
    { day: 'Thu', min: 71, max: 79 },
    { day: 'Fri', min: 72, max: 81 },
    { day: 'Sat', min: 70, max: 77 },
    { day: 'Sun', min: 68, max: 76 },
  ],
  water: [
    { time: '00:00', value: 0 },
    { time: '04:00', value: 0.2 },
    { time: '08:00', value: 0.5 },
    { time: '12:00', value: 1.0 },
    { time: '16:00', value: 1.5 },
    { time: '20:00', value: 2.0 },
    { time: '23:59', value: 2.3 },
  ],
  waterWeek: [
    { day: 'Mon', value: 2.1 },
    { day: 'Tue', value: 2.3 },
    { day: 'Wed', value: 2.5 },
    { day: 'Thu', value: 2.0 },
    { day: 'Fri', value: 2.7 },
    { day: 'Sat', value: 2.9 },
    { day: 'Sun', value: 2.2 },
  ],
  steps: [
    { time: '00:00', value: 0 },
    { time: '04:00', value: 1500 },
    { time: '08:00', value: 3000 },
    { time: '12:00', value: 5000 },
    { time: '16:00', value: 7000 },
    { time: '20:00', value: 8500 },
    { time: '23:59', value: 9000 },
  ],
  stepsWeek: [
    { day: 'Mon', value: 8000 },
    { day: 'Tue', value: 8500 },
    { day: 'Wed', value: 9000 },
    { day: 'Thu', value: 7500 },
    { day: 'Fri', value: 9500 },
    { day: 'Sat', value: 10000 },
    { day: 'Sun', value: 7000 },
  ],
  sleep: [
    { time: '00:00', value: 0 },
    { time: '04:00', value: 2 },
    { time: '08:00', value: 6 },
    { time: '12:00', value: 7 },
    { time: '16:00', value: 7.2 },
    { time: '20:00', value: 7.2 },
    { time: '23:59', value: 7.2 },
  ],
  sleepWeek: [
    { day: 'Mon', value: 7.2 },
    { day: 'Tue', value: 6.8 },
    { day: 'Wed', value: 8.0 },
    { day: 'Thu', value: 7.5 },
    { day: 'Fri', value: 6.9 },
    { day: 'Sat', value: 8.2 },
    { day: 'Sun', value: 7.0 },
  ],
};

type VitalType = 'heartrate' | 'water' | 'steps' | 'sleep';

const LineGraph: React.FC<{
  data: { time?: string; day?: string; value?: number; min?: number; max?: number }[];
  xKey: 'time' | 'day';
  yLabel: string;
  unit?: string;
  isHeartrateWeek?: boolean;
}> = ({ data, xKey, yLabel, unit, isHeartrateWeek }) => {
  const width = 500;
  const height = 200;
  const padding = 50;

  let values: number[] = [];
  if (isHeartrateWeek) {
    values = data.flatMap((d) => [d.min!, d.max!]);
  } else {
    values = data.map((d) => d.value!);
  }
  const minY = Math.min(...values);
  const maxY = Math.max(...values);

  // For heartrate week, draw two lines (min and max)
  let pointsMin: string[] = [];
  let pointsMax: string[] = [];
  if (isHeartrateWeek) {
    pointsMin = data.map((d, i) => {
      const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
      const y =
        height -
        padding -
        ((height - 2 * padding) * (d.min! - minY)) / (maxY - minY || 1);
      return `${x},${y}`;
    });
    pointsMax = data.map((d, i) => {
      const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
      const y =
        height -
        padding -
        ((height - 2 * padding) * (d.max! - minY)) / (maxY - minY || 1);
      return `${x},${y}`;
    });
  }

  const points = !isHeartrateWeek
    ? data.map((d, i) => {
        const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
        const y =
          height -
          padding -
          ((height - 2 * padding) * (d.value! - minY)) / (maxY - minY || 1);
        return `${x},${y}`;
      })
    : [];

  return (
    <svg width={width} height={height} className="mb-4">
      {/* Axes */}
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#ddd"
      />
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#ddd"
      />
      {/* Graph */}
      {!isHeartrateWeek && (
        <>
          <polyline
            fill="none"
            stroke="#fff"
            strokeWidth={3}
            points={points.join(' ')}
          />
          {data.map((d, i) => {
            const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
            const y =
              height -
              padding -
              ((height - 2 * padding) * (d.value! - minY)) / (maxY - minY || 1);
            return <circle key={i} cx={x} cy={y} r={5} fill="#fff" />;
          })}
        </>
      )}
      {isHeartrateWeek && (
        <>
          <polyline
            fill="none"
            stroke="#f87171"
            strokeWidth={3}
            points={pointsMax.join(' ')}
          />
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth={3}
            points={pointsMin.join(' ')}
          />
          {data.map((d, i) => {
            const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
            const yMax =
              height -
              padding -
              ((height - 2 * padding) * (d.max! - minY)) / (maxY - minY || 1);
            const yMin =
              height -
              padding -
              ((height - 2 * padding) * (d.min! - minY)) / (maxY - minY || 1);
            return (
              <g key={i}>
                <circle cx={x} cy={yMax} r={5} fill="#f87171" />
                <circle cx={x} cy={yMin} r={5} fill="#38bdf8" />
              </g>
            );
          })}
        </>
      )}
      {/* X labels */}
      {data.map((d, i) => {
        const x = padding + ((width - 2 * padding) * i) / (data.length - 1);
        const y = height - padding + 25;
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize={16}
            fill="#fff"
            textAnchor="middle"
          >
            {d[xKey]}
          </text>
        );
      })}
      {/* Y labels */}
      <text
        x={10}
        y={padding}
        fontSize={16}
        fill="#fff"
        textAnchor="start"
      >
        {maxY}
        {unit}
      </text>
      <text
        x={10}
        y={height - padding}
        fontSize={16}
        fill="#fff"
        textAnchor="start"
      >
        {minY}
        {unit}
      </text>
    </svg>
  );
};

const VitalPopup: React.FC<{
  vital: VitalType;
  onClose: () => void;
  vitals: Record<VitalType, number>;
}> = ({ vital, onClose, vitals }) => {
  const [view, setView] = useState<'day' | 'week'>('day');

  // Helper for min/max
  const getMinMax = (arr: { value: number }[]) => {
    const values = arr.map((d) => d.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-white shadow-2xl relative w-[700px] max-w-full min-h-[600px] flex flex-col">
        <button
          className="absolute top-6 right-6 text-white hover:text-gray-300"
          onClick={onClose}
        >
          <X className="w-8 h-8" />
        </button>
        <div className="flex items-center gap-4 mb-6">
          {vital === 'heartrate' && <HeartPulse className="w-14 h-14 opacity-90" />}
          {vital === 'water' && <Droplets className="w-14 h-14 opacity-90" />}
          {vital === 'steps' && <Footprints className="w-14 h-14 opacity-90" />}
          {vital === 'sleep' && <Bed className="w-14 h-14 opacity-90" />}
          <div>
            <p className="text-2xl opacity-90 mb-1 capitalize">{vital}</p>
            <p className="text-5xl font-bold">
              {vitals[vital]}{' '}
              <span className="text-xl font-normal">
                {vital === 'heartrate' ? 'bpm' : vital === 'water' ? 'L' : vital === 'sleep' ? 'hrs' : ''}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-4 mb-4 justify-center">
            <button
              className={`px-4 py-2 rounded-lg text-lg transition ${
                view === 'day'
                  ? 'bg-white bg-opacity-20 font-bold'
                  : 'bg-white bg-opacity-10'
              }`}
              onClick={() => setView('day')}
            >
              Daily
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-lg transition ${
                view === 'week'
                  ? 'bg-white bg-opacity-20 font-bold'
                  : 'bg-white bg-opacity-10'
              }`}
              onClick={() => setView('week')}
            >
              Weekly
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center">
            {/* Graphs */}
            {vital === 'heartrate' && (
              <>
                {view === 'day' ? (
                  <LineGraph
                    data={vitalsHistory.heartrate}
                    xKey="time"
                    yLabel="Heartrate"
                    unit=" bpm"
                  />
                ) : (
                  <LineGraph
                    data={vitalsHistory.heartrateWeek}
                    xKey="day"
                    yLabel="Heartrate"
                    unit=" bpm"
                    isHeartrateWeek
                  />
                )}
                <div className="flex justify-between w-full text-lg mt-4 px-4">
                  {view === 'day' ? (
                    <>
                      <span>
                        Highest today:{' '}
                        <span className="font-bold text-white">
                          {getMinMax(vitalsHistory.heartrate).max} bpm
                        </span>
                      </span>
                      <span>
                        Lowest today:{' '}
                        <span className="font-bold text-white">
                          {getMinMax(vitalsHistory.heartrate).min} bpm
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        Highest this week:{' '}
                        <span className="font-bold text-white">
                          {Math.max(...vitalsHistory.heartrateWeek.map(d => d.max))} bpm
                        </span>
                      </span>
                      <span>
                        Lowest this week:{' '}
                        <span className="font-bold text-white">
                          {Math.min(...vitalsHistory.heartrateWeek.map(d => d.min))} bpm
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
            {vital === 'water' && (
              <>
                <LineGraph
                  data={view === 'day' ? vitalsHistory.water : vitalsHistory.waterWeek}
                  xKey={view === 'day' ? 'time' : 'day'}
                  yLabel="Water"
                  unit=" L"
                />
                <div className="flex justify-between w-full text-lg mt-4 px-4">
                  {view === 'day' ? (
                    <>
                      <span>
                        Highest today:{' '}
                        <span className="font-bold text-white">
                          {getMinMax(vitalsHistory.water).max} L
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        Highest this week:{' '}
                        <span className="font-bold text-white">
                          {Math.max(...vitalsHistory.waterWeek.map(d => d.value))} L
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
            {vital === 'steps' && (
              <>
                <LineGraph
                  data={view === 'day' ? vitalsHistory.steps : vitalsHistory.stepsWeek}
                  xKey={view === 'day' ? 'time' : 'day'}
                  yLabel="Steps"
                />
                <div className="flex justify-between w-full text-lg mt-4 px-4">
                  {view === 'day' ? (
                    <>
                      <span>
                        Highest today:{' '}
                        <span className="font-bold text-white">
                          {getMinMax(vitalsHistory.steps).max}
                        </span>
                      </span>
                      <span>
                        Lowest today:{' '}
                        <span className="font-bold text-white">
                          {getMinMax(vitalsHistory.steps).min}
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        Highest this week:{' '}
                        <span className="font-bold text-white">
                          {Math.max(...vitalsHistory.stepsWeek.map(d => d.value))}
                        </span>
                      </span>
                      <span>
                        Lowest this week:{' '}
                        <span className="font-bold text-white">
                          {Math.min(...vitalsHistory.stepsWeek.map(d => d.value))}
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
            {vital === 'sleep' && (
              <>
                <LineGraph
                  data={view === 'day' ? vitalsHistory.sleep : vitalsHistory.sleepWeek}
                  xKey={view === 'day' ? 'time' : 'day'}
                  yLabel="Sleep"
                  unit=" hrs"
                />
                <div className="flex justify-between w-full text-lg mt-4 px-4">
                  {view === 'day' ? (
                    <>
                      <span>
                        Highest today:{' '}
                        <span className="font-bold text-white">
                          {getMinMax(vitalsHistory.sleep).max} hrs
                        </span>
                      </span>
                      <span>
                        Lowest today:{' '}
                        <span className="font-bold text-white">
                          {getMinMax(vitalsHistory.sleep).min} hrs
                        </span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        Highest this week:{' '}
                        <span className="font-bold text-white">
                          {Math.max(...vitalsHistory.sleepWeek.map(d => d.value))} hrs
                        </span>
                      </span>
                      <span>
                        Lowest this week:{' '}
                        <span className="font-bold text-white">
                          {Math.min(...vitalsHistory.sleepWeek.map(d => d.value))} hrs
                        </span>
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<VitalType | null>(null);

  if (!user) return null;

  const vitals = {
    heartrate: user.heartrate ?? 72,
    water: user.water ?? 2.1,
    steps: user.steps ?? 8500,
    sleep: user.sleep ?? 7.2,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 text-lg">Here's your daily vitals overview</p>
      </div>
      <div className="grid grid-cols-2 gap-8">
        {/* Heartrate */}
        <div
          className="bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl p-8 text-white cursor-pointer transition-all duration-300 shadow-lg"
          onClick={() => setExpanded('heartrate')}
        >
          <HeartPulse className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Heartrate</p>
          <p className="text-4xl font-bold">
            {vitals.heartrate}{' '}
            <span className="text-base font-normal">bpm</span>
          </p>
        </div>
        {/* Water */}
        <div
          className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-8 text-white cursor-pointer transition-all duration-300 shadow-lg"
          onClick={() => setExpanded('water')}
        >
          <Droplets className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Water</p>
          <p className="text-4xl font-bold">
            {vitals.water}{' '}
            <span className="text-base font-normal">L</span>
          </p>
        </div>
        {/* Steps */}
        <div
          className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-8 text-white cursor-pointer transition-all duration-300 shadow-lg"
          onClick={() => setExpanded('steps')}
        >
          <Footprints className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Steps</p>
          <p className="text-4xl font-bold">{vitals.steps}</p>
        </div>
        {/* Sleep */}
        <div
          className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl p-8 text-white cursor-pointer transition-all duration-300 shadow-lg"
          onClick={() => setExpanded('sleep')}
        >
          <Bed className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Sleep</p>
          <p className="text-4xl font-bold">
            {vitals.sleep}{' '}
            <span className="text-base font-normal">hrs</span>
          </p>
        </div>
      </div>
      {expanded && (
        <VitalPopup
          vital={expanded}
          onClose={() => setExpanded(null)}
          vitals={vitals}
        />
      )}
    </div>
  );
};
