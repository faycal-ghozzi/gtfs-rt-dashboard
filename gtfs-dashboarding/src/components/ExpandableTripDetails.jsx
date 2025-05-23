import React, { useRef, useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import DelayEvolutionChart from '../charts/DelayEvolutionChart';

const LoadingDots = () => (
  <div className="flex justify-center items-center h-full">
    <div className="flex space-x-2">
      <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
      <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
      <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
    </div>
  </div>
);

const ExpandableTripDetails = ({ data, onViewTrip, darkMode, isHistory = false }) => {
    const listRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true); 
  const [componentLoading, setComponentLoading] = useState(true); 

  const stops = data?.stops || [];
  const now = DateTime.now().setZone('Europe/Paris');

  const findNextIndex = () =>
    stops.findIndex(s => {
      const time = DateTime.fromFormat(s.arrival || s.departure || '', 'HH:mm', {
        zone: 'Europe/Paris',
      });
      return time.isValid && time > now;
    });

  useEffect(() => {
    const idx = findNextIndex();
    setActiveIndex(idx >= 0 ? idx : stops.length - 1);
  }, [stops]);

  useEffect(() => {
    if (listRef.current && activeIndex >= 0) {
      const target = listRef.current.children[activeIndex];
      if (target) {
        target.scrollIntoView({ inline: 'start', behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  useEffect(() => {
    if (isHistory) {
      setComponentLoading(false); // immediately show content
      return;
    }
  
    setLoading(true);
    const interval = setInterval(() => {
      const now = DateTime.now().setZone('Europe/Paris');
      const stop = stops[activeIndex];
      if (stop) {
        const time = DateTime.fromFormat(stop.arrival || stop.departure || '', 'HH:mm', {
          zone: 'Europe/Paris',
        });
        if (time.isValid) {
          const diff = time.diff(now, ['minutes', 'seconds']).toObject();
          const totalSeconds = time.diff(now, 'seconds').as('seconds');
          if (totalSeconds > 0) {
            setCountdown({
              minutes: Math.floor(diff.minutes),
              seconds: Math.floor(diff.seconds),
              name: stop.stop_name,
            });
            setLoading(false);
            setComponentLoading(false);
          } else {
            setCountdown(null);
            setLoading(false);
            if (activeIndex < stops.length - 1) {
              setActiveIndex(prev => prev + 1);
            }
          }
        }
      }
    }, 1000);
  
    return () => clearInterval(interval);
  }, [activeIndex, stops, isHistory]);

  const renderStopTime = (stop, index) => {
    const isFirst = index === 0;
    return isFirst ? stop.departure || '—' : stop.arrival || '—';
  };

  const isPastStop = (stop, index) => {
    const isLast = index === stops.length - 1;
    if (isLast) return false;
    const time = DateTime.fromFormat(stop.departure || stop.arrival || '', 'HH:mm', {
      zone: 'Europe/Paris',
    });
    return time.isValid && time < DateTime.now().setZone('Europe/Paris');
  };

  if (componentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
      {!isHistory && activeIndex >= 0 && activeIndex < stops.length && (
        <div className="flex items-center justify-between mb-4">
            <div>
            <h4 className="font-semibold text-lg mb-1">
                Next Stop: {countdown?.name || stops[activeIndex]?.stop_name}
            </h4>
            {loading ? (
                <LoadingDots />
            ) : countdown ? (
                <p className="text-gray-600 dark:text-gray-300">
                Arriving in {countdown.minutes} min {countdown.seconds} sec
                </p>
            ) : null}
            </div>
            <button
            onClick={() => onViewTrip(data)}
            className="ml-4 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
            Afficher Carte
            </button>
        </div>
        )}

      <div className="w-full overflow-x-auto">
        <div className="max-w-full">
          <ul
            ref={listRef}
            className="flex gap-6 min-w-fit px-4 py-3 scroll-smooth w-[1200px]"
          >
            {stops.map((stop, index) => {
              const past = isPastStop(stop, index);
              return (
                <li
                  key={index}
                  className={`flex flex-col items-center shrink-0 min-w-[120px] px-2 py-2 text-center whitespace-nowrap ${
                    past ? 'text-gray-400' : 'text-black dark:text-white'
                  }`}
                >
                  <span className="font-semibold text-base">{stop.stop_name}</span>
                  <span className="text-xs">{renderStopTime(stop, index)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <DelayEvolutionChart trip={data} darkMode={darkMode} />
      </div>
    </div>
  );
};

export default ExpandableTripDetails;
