/**
 * Configuración centralizada de la aplicación
 * Aquí se definen colores, títulos y otros parámetros globales
 */

export const AppConfig = {
  // Información de la empresa
  company: {
    name: 'El Retorno',
    description: 'Catálogo de Productos',
    email: 'admin@elretorno.com',
  },

  // Colores de la aplicación
  colors: {
    // Color primario
    primary: 'rgb(43, 110, 74)',
    primaryDark: '#7C3AED',
    primaryLight: 'rgba(139, 92, 246, 0.1)',
    primaryLightBorder: 'rgba(139, 92, 246, 0.2)',

    // Colores de estado
    error: '#d32f2f',
    errorLight: '#ffebee',
    success: '#25d366',
    successDark: '#20ba5a',

    // Colores de fondo
    background: '#f8edde',
    backgroundLight: '#f8f4ee',

    // Colores de texto
    textPrimary: '#333',
    textSecondary: '#555',
    textLight: '#999',
    white: '#ffffff',
  },

  // Títulos y textos
  titles: {
    pageTitle: 'Catálogo de Productos El Retorno',
    mainTitle: 'Catálogo de Productos',
    subtitle: 'El Retorno',
    logoAlt: 'El Retorno',
  },

  // Contacto
  contact: {
    whatsapp: '+59899991013',
  },

  // Estilos CSS variables
  cssVariables: {
    '--color-primary': 'rgb(43, 110, 74)',
    '--color-primary-dark': '#7C3AED',
    '--color-primary-light': 'rgba(139, 92, 246, 0.1)',
    '--color-primary-light-border': 'rgba(139, 92, 246, 0.2)',
    '--color-error': '#d32f2f',
    '--color-error-light': '#ffebee',
    '--color-success': '#25d366',
    '--color-success-dark': '#20ba5a',
    '--color-background': '#f8edde',
    '--color-background-light': '#f8f4ee',
    '--color-text-primary': '#333',
    '--color-text-secondary': '#555',
    '--color-text-light': '#999',
    '--color-white': '#ffffff',
  },
};

/**
 * Función para obtener un color de la configuración
 * @param path - Ruta del color (ej: 'colors.primary')
 * @returns El valor del color
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: any = AppConfig;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color no encontrado: ${path}`);
      return '#000000';
    }
  }

  return value;
}

/**
 * Función para obtener un título de la configuración
 * @param path - Ruta del título (ej: 'titles.mainTitle')
 * @returns El valor del título
 */
export function getTitle(path: string): string {
  const keys = path.split('.');
  let value: any = AppConfig;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Título no encontrado: ${path}`);
      return '';
    }
  }

  return value;
}
