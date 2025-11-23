/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {
          colors: {
            primary: '#2A627C', // Azul sereno y profesional
            secondary: '#3A8C8C', // Verde azulado complementario
            accent: '#F2A74B', // Naranja vibrante para botones y llamados a la acción
            neutral: '#F2F2F2', // Gris claro para fondos
            'text-color': '#333333', // Gris oscuro para la legibilidad
    
            // Colores que referencian variables CSS de src/index.css para utilidades de Tailwind
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            card: "hsl(var(--card))",
            "card-foreground": "hsl(var(--card-foreground))",
            popover: "hsl(var(--popover))",
            "popover-foreground": "hsl(var(--popover-foreground))",
            muted: "hsl(var(--muted))",
            "muted-foreground": "hsl(var(--muted-foreground))",
            destructive: "hsl(var(--destructive))",
            "destructive-foreground": "hsl(var(--destructive-foreground))",
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            // Las variables --primary y --secondary de index.css se omiten aquí para evitar conflictos
            // con los colores primary y secondary definidos con valores hex, que son los que el usuario
            // ha solicitado explícitamente para el tema principal.
          },
          keyframes: {
            'fade-in': {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
            },
            'slide-up': {
              '0%': { opacity: '0', transform: 'translateY(20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            'fade-in-down': {
              '0%': { opacity: '0', transform: 'translateY(-20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            'fade-in-up': {
              '0%': { opacity: '0', transform: 'translateY(20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            'scale-in': {
              '0%': { opacity: '0', transform: 'scale(0.95)' },
              '100%': { opacity: '1', transform: 'scale(1)' },
            },
          },
          animation: {
            'fade-in': 'fade-in 0.5s ease-out forwards',
            'slide-up': 'slide-up 0.6s ease-out forwards',
            'fade-in-down': 'fade-in-down 0.7s ease-out forwards',
            'fade-in-up': 'fade-in-up 0.7s ease-out forwards',
            'scale-in': 'scale-in 0.5s ease-out forwards',
          },
          animationDelay: {
            100: '100ms',
            200: '200ms',
            300: '300ms',
            400: '400ms',
            500: '500ms',
            600: '600ms',
            700: '700ms',
            800: '800ms',
            900: '900ms',
            1000: '1000ms',
            1100: '1100ms',
            1200: '1200ms',
            1300: '1300ms',
            1400: '1400ms',
            1500: '1500ms',
          },
        },
      },  plugins: [],
};
