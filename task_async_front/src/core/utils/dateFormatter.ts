// Convierte Date a string ISO SIN conversión UTC - usa exactamente lo seleccionado
export const toLocalISOString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  // Formato: YYYY-MM-DDTHH:mm:ss.sss
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export const fromLocalISOString = (isoString: string | null): Date | null => {
  if (!isoString) return null;
  
  const localString = isoString.endsWith('Z') ? isoString.slice(0, -1) : isoString;
  return new Date(localString);
};

// Solo para mostrar - sin afectar la hora guardada
export const formatForDisplay = (date: Date): string => {
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};