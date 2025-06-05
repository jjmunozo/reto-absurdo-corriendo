
// Placeholder para mantener compatibilidad con archivos read-only

export const isAuthenticated = () => false;
export const getAthleteInfo = () => null;
export const getAccessToken = () => {
  throw new Error('Sistema actualizado: usa useStravaRuns hook en su lugar');
};
export const initiateStravaAuth = () => {
  console.log('Sistema actualizado: ya no se requiere autenticación');
};
export const logout = () => {
  console.log('Sistema actualizado: ya no se requiere logout');
};
export const exchangeCodeForToken = () => {
  throw new Error('Sistema actualizado: ya no se requiere intercambio de tokens');
};
