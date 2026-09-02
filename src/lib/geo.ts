import * as THREE from 'three';
import { FALLBACK_CITIES_WITH_COORDS } from './cities';

const GLOBE_RADIUS = 5;

/**
 * Convert latitude/longitude to a 3D position on the globe surface.
 * Matches the Three.js SphereGeometry mapping (phi from positive Y pole, theta around Y).
 */
export function latLngTo3D(lat: number, lng: number, radius = GLOBE_RADIUS): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180); // polar angle from +Y
  const theta = (lng + 180) * (Math.PI / 180); // azimuthal angle, offset to match texture orientation

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

/**
 * Look up the lat/lng for a city in a given state from the fallback list.
 * Returns null if not found.
 */
export function getFallbackCoords(
  stateCode: string,
  cityName: string,
): { lat: number; lng: number } | null {
  const cities = FALLBACK_CITIES_WITH_COORDS[stateCode];
  if (!cities) return null;
  const match = cities.find((c) => c.name === cityName);
  if (!match) return null;
  return { lat: match.lat, lng: match.lng };
}
