// Configuración del tema de Maiko Studios
export const theme = {
  colors: {
    // Colores principales
    background: '#121212',
    surface: '#1e1e1e',
    surfaceVariant: '#2a2a2a',
    
    // Colores de marca
    turquesa: '#00cccc',
    azul: '#1c94e0',
    
    // Colores de texto
    text: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#999999',
    
    // Estados
    success: '#00cc88',
    warning: '#ffaa00',
    error: '#ff4444',
    info: '#00cccc',
    
    // Sombras y bordes
    border: '#333333',
    shadow: 'rgba(0, 204, 204, 0.2)',
    shadowHover: 'rgba(0, 204, 204, 0.4)',
  },
  
  typography: {
    fontFamily: {
      primary: '"Montserrat", sans-serif',
      secondary: '"Roboto", sans-serif',
      tertiary: '"Raleway", sans-serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 204, 204, 0.05)',
    md: '0 4px 6px -1px rgba(0, 204, 204, 0.1), 0 2px 4px -1px rgba(0, 204, 204, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 204, 204, 0.1), 0 4px 6px -2px rgba(0, 204, 204, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 204, 204, 0.1), 0 10px 10px -5px rgba(0, 204, 204, 0.04)',
    glow: '0 0 20px rgba(0, 204, 204, 0.3)'
  },
  
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
}

// Utilidades CSS personalizadas
export const cssVariables = `
  :root {
    /* Colores */
    --color-background: ${theme.colors.background};
    --color-surface: ${theme.colors.surface};
    --color-surface-variant: ${theme.colors.surfaceVariant};
    --color-turquesa: ${theme.colors.turquesa};
    --color-azul: ${theme.colors.azul};
    --color-text: ${theme.colors.text};
    --color-text-secondary: ${theme.colors.textSecondary};
    --color-text-muted: ${theme.colors.textMuted};
    --color-success: ${theme.colors.success};
    --color-warning: ${theme.colors.warning};
    --color-error: ${theme.colors.error};
    --color-info: ${theme.colors.info};
    --color-border: ${theme.colors.border};
    --color-shadow: ${theme.colors.shadow};
    --color-shadow-hover: ${theme.colors.shadowHover};
    
    /* Tipografía */
    --font-primary: ${theme.typography.fontFamily.primary};
    --font-secondary: ${theme.typography.fontFamily.secondary};
    --font-tertiary: ${theme.typography.fontFamily.tertiary};
    
    /* Animaciones */
    --duration-fast: ${theme.animations.duration.fast};
    --duration-normal: ${theme.animations.duration.normal};
    --duration-slow: ${theme.animations.duration.slow};
    --easing-default: ${theme.animations.easing.default};
  }
`

// Clases CSS utilitarias
export const utilityClasses = `
  /* Animaciones */
  .animate-fade-in {
    animation: fadeIn var(--duration-normal) var(--easing-default);
  }
  
  .animate-slide-up {
    animation: slideUp var(--duration-normal) var(--easing-default);
  }
  
  .animate-scale-in {
    animation: scaleIn var(--duration-normal) var(--easing-default);
  }
  
  /* Transiciones */
  .transition-all {
    transition: all var(--duration-normal) var(--easing-default);
  }
  
  .transition-colors {
    transition: color var(--duration-normal) var(--easing-default),
                background-color var(--duration-normal) var(--easing-default),
                border-color var(--duration-normal) var(--easing-default);
  }
  
  .transition-transform {
    transition: transform var(--duration-normal) var(--easing-default);
  }
  
  /* Hover effects */
  .hover-scale:hover {
    transform: scale(1.05);
  }
  
  .hover-glow:hover {
    box-shadow: ${theme.shadows.glow};
  }
  
  /* Keyframes */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.9);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
`
