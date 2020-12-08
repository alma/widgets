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
      spacing: {
        7: '1.75rem',
      },
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
        'above-xs': '0 0 0 1px rgba(0, 0, 0, 0.05)',
        'above-sm': '0 -1px 2px 0 rgba(0,0,0,.05)',
        'above-md': '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)',
        'above-lg': '0 -10px 15px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.05)',
        'above-xl': '0 -20px 25px -5px rgba(0, 0, 0, 0.1), 0 -10px 10px -5px rgba(0, 0, 0, 0.04)',
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
