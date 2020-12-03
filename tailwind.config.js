const defaultConfig = require('tailwindcss/defaultConfig')

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  // When building for production, prune all CSS classes that couldn't be found in files below
  purge: ['./src/**/*.ts', './src/**/*.tsx', './src/**/*.html'],
  theme: {
    extend: {
      opacity: {
        15: '0.15',
      },
      borderWidth: {
        default: '1px',
        0: '0',
        2: '2px',
        3: '3px',
        4: '4px',
        5: '5px',
        8: '8px',
      },
      colors: {
        blue: {
          default: '#00425E',
        },
        red: {
          default: '#FF414D',
          700: '#D42E39',
        },
        orange: {
          default: '#FDAF6F',
          900: '#9C4221',
        },
        beige: {
          default: '#FFF7F0',
        },
      },
      boxShadow: {
        'outline-red': '0 0 0 3px rgba(255,65,77,.5)',
      },
      fontSize: {
        '5xl': '2.75rem',
      },
      inset: {
        3: '0.75rem',
        4: '1rem',
      },
    },
  },
  variants: {
    backgroundColor: [...defaultConfig.variants.backgroundColor, 'group-hover'],
  },
  plugins: [],
  corePlugins: {
    // Deactivate preflight's inclusion, it will be added "manually" so that it's scoped to Alma
    preflight: false,
  },
  // Prefix all classes with `atw-`, so that including our CSS doesn't conflict with a potential
  // Tailwind installation on the host side
  prefix: 'atw-',
  // Since our widgets will be included in pages were we can't control what CSS is present, force
  // all rules to use `!important` so that we minimize the risk of conflicts with host's CSS
  important: true,
}
