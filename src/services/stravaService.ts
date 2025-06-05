
// Placeholder para mantener compatibilidad con archivos read-only
// El nuevo sistema no requiere estos servicios

export const isAuthenticated = () => false;
export const getAthleteInfo = () => null;
export const initiateStravaAuth = () => {
  console.log('Sistema actualizado: ya no se requiere autenticación');
};
export const logout = () => {
  console.log('Sistema actualizado: ya no se requiere logout');
};
export const exchangeCodeForToken = () => {
  throw new Error('Sistema actualizado: ya no se requiere intercambio de tokens');
};
