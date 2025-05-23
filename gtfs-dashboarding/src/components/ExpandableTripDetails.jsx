import React, { useRef, useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import DelayEvolutionChart from '../charts/DelayEvolutionChart';

const ExpandableTripDetails = ({ data, onViewTrip, darkMode }) => {
  const listRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
          } else {
            setCountdown(null);
            if (activeIndex < stops.length - 1) {
              setActiveIndex(prev => prev + 1);
            }
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeIndex, stops]);

  const renderStopTime = (stop, index) => {
    const isFirst = index === 0;
    const isLast = index === stops.length - 1;
    if (isFirst) return stop.departure || '—';
    return stop.arrival || '—';
  };

  const isPastStop = (stop, index) => {
    const isLast = index === stops.length - 1;
    if (isLast) return false;
    const time = DateTime.fromFormat(stop.departure || stop.arrival || '', 'HH:mm', {
      zone: 'Europe/Paris',
    });
    return time.isValid && time < DateTime.now().setZone('Europe/Paris');
  };

  return (
    <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
      {activeIndex >= 0 && activeIndex < stops.length && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-lg mb-1">
              Next Stop: {countdown?.name || stops[activeIndex]?.stop_name}
            </h4>
            {countdown && (
              <p className="text-gray-600 dark:text-gray-300">
                Arriving in {countdown.minutes} min {countdown.seconds} sec
              </p>
            )}
          </div>
          <button
            onClick={() => onViewTrip(data)}
            className="ml-4 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Show on Map
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
        <DelayEvolutionChart trip={data} darkMode={darkMode}/>
      </div>
    </div>
  );
};

export default ExpandableTripDetails;
