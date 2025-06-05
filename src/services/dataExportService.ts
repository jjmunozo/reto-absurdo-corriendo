
// Placeholder para mantener compatibilidad con archivos read-only

export const exportRunningData = () => {
  throw new Error('Sistema actualizado: los datos se cargan automáticamente');
};

export const formatLastUpdateTime = () => {
  return new Date().toLocaleString();
};

export const setupAutoUpdater = () => {
  console.log('Sistema actualizado: el auto-updater está en el backend');
};

export const stopAutoUpdater = () => {
  console.log('Sistema actualizado: el auto-updater está en el backend');
};

export const isAdminMode = () => false;
export const setAdminMode = () => {};
