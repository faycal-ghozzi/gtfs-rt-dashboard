import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet.heat';

const CustomHeatmapLayer = ({ points, maxIntensity }) => {
  const map = useMap();

  useEffect(() => {
    const heatLayer = window.L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      max: maxIntensity, // Normalize across global max
      gradient: {
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
  }, [map, points, maxIntensity]);

  return null;
};

export default CustomHeatmapLayer;
