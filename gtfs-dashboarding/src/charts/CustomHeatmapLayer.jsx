import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet.heat';

const CustomHeatmapLayer = ({ points, maxIntensity, darkMode }) => {
  const map = useMap();

  useEffect(() => {
    const heatLayer = window.L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      max: maxIntensity,
      gradient: darkMode
        ? {
            0.2: '#00bfff',
            0.4: '#32cd32',
            0.6: '#ffa500',
            0.8: '#ff4500'
          }
        : {
            0.2: 'blue',
            0.4: 'lime',
            0.6: 'orange',
            0.8: 'red'
          }
    });

    heatLayer.addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, maxIntensity, darkMode]);

  return null;
};

export default CustomHeatmapLayer
