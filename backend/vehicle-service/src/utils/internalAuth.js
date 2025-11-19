import jwt from 'jsonwebtoken';
import { logger } from '@ev-coownership/shared';

// Return an Authorization bearer token for internal service-to-service calls.
// If the configured token looks like a JWT, return it as-is. Otherwise sign
// a short-lived JWT using the shared JWT_SECRET so other services
// (which verify with JWT_SECRET) can accept the request.
export function getInternalAuthToken() {
  const configured = process.env.VEHICLE_SERVICE_INTERNAL_TOKEN || process.env.INTERNAL_SERVICE_TOKEN;
  if (configured && configured.split && configured.split('.').length === 3) {
    return configured;
  }

  try {
    const token = jwt.sign(
      { service: process.env.SERVICE_NAME || 'vehicle-service' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );
    return token;
  } catch (err) {
    logger.error('Failed to sign internal JWT', { error: err.message });
    // Fallback to configured token even if it's not a JWT
    return configured;
  }
}

// A small helper that wraps fetch and injects the internal Authorization header.
export async function internalFetch(url, options = {}) {
  const authToken = getInternalAuthToken();
  const headers = Object.assign({}, options.headers || {}, {
    Authorization: authToken ? `Bearer ${authToken}` : undefined
  });

  const finalOptions = Object.assign({}, options, { headers });

  // Use global fetch (Node 18+) - caller handles response.ok and parsing
  return fetch(url, finalOptions);
}
