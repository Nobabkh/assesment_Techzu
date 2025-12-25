/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#007bff',
                secondary: '#6c757d',
                success: '#28a745',
                danger: '#dc3545',
                warning: '#ffc107',
                info: '#17a2b8',
                light: '#f8f9fa',
                dark: '#343a40',
            },
            fontSize: {
                'xs': ['clamp(0.75rem, 2vw, 0.875rem)', { lineHeight: '1.5' }],
                'sm': ['clamp(0.875rem, 2.5vw, 1rem)', { lineHeight: '1.5' }],
                'base': ['clamp(1rem, 3vw, 1.125rem)', { lineHeight: '1.6' }],
                'lg': ['clamp(1.125rem, 3.5vw, 1.25rem)', { lineHeight: '1.6' }],
                'xl': ['clamp(1.25rem, 4vw, 1.5rem)', { lineHeight: '1.4' }],
                '2xl': ['clamp(1.5rem, 5vw, 2rem)', { lineHeight: '1.3' }],
                '3xl': ['clamp(2rem, 6vw, 2.5rem)', { lineHeight: '1.2' }],
            },
            spacing: {
                'xs': 'clamp(0.25rem, 1vw, 0.5rem)',
                'sm': 'clamp(0.5rem, 1.5vw, 1rem)',
                'md': 'clamp(1rem, 2vw, 1.5rem)',
                'lg': 'clamp(1.5rem, 3vw, 2rem)',
                'xl': 'clamp(2rem, 4vw, 3rem)',
                '2xl': 'clamp(3rem, 5vw, 4rem)',
                // Fixed spacing for specific use cases
                'xs-fixed': '0.25rem',
                'sm-fixed': '0.5rem',
                'md-fixed': '1rem',
                'lg-fixed': '1.5rem',
                'xl-fixed': '2rem',
                '2xl-fixed': '3rem',
            },
            borderRadius: {
                'sm': '0.25rem',
                'md': '0.375rem',
                'lg': '0.5rem',
            },
            boxShadow: {
                'default': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                'lg': '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
            },
            transitionProperty: {
                'default': 'all',
                'colors': 'color, background-color, border-color',
                'opacity': 'opacity',
                'shadow': 'box-shadow',
                'transform': 'transform',
            },
            transitionDuration: {
                'fast': '150ms',
                'default': '300ms',
                'slow': '500ms',
            },
            transitionTimingFunction: {
                'default': 'ease',
                'ease-in-out': 'ease-in-out',
            },
            screens: {
                'xs': '0px',
                'sm': '576px',
                'md': '768px',
                'lg': '992px',
                'xl': '1200px',
                '2xl': '1400px',
            },
            maxWidth: {
                'container-sm': '540px',
                'container-md': '720px',
                'container-lg': '960px',
                'container-xl': '1140px',
                'container-2xl': '1320px',
            },
            zIndex: {
                'dropdown': '1000',
                'sticky': '1020',
                'fixed': '1030',
                'modal-backdrop': '1040',
                'modal': '1050',
                'popover': '1060',
                'tooltip': '1070',
            },
            animation: {
                'spin': 'spin 1s linear infinite',
                'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slideIn': 'slideIn 0.3s ease-out',
                'fadeIn': 'fadeIn 0.5s ease-out',
                'fadeInScale': 'fadeInScale 0.2s ease-out',
                'realtimePulse': 'realtimePulse 2s infinite',
                'highlightNew': 'highlightNewComment 3s ease-out',
            },
            keyframes: {
                spin: {
                    to: {
                        transform: 'rotate(360deg)',
                    },
                },
                pulse: {
                    '0%, 100%': {
                        opacity: '1',
                    },
                    '50%': {
                        opacity: '.5',
                    },
                },
                slideIn: {
                    '0%': {
                        transform: 'translateX(100%)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'translateX(0)',
                        opacity: '1',
                    },
                },
                fadeIn: {
                    '0%': {
                        opacity: '0',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
                fadeInScale: {
                    '0%': {
                        opacity: '0',
                        transform: 'scale(0.95)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'scale(1)',
                    },
                },
                realtimePulse: {
                    '0%, 100%': {
                        boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.5)',
                    },
                    '50%': {
                        boxShadow: '0 0 0 4px rgba(59, 130, 246, 0)',
                    },
                },
                highlightNewComment: {
                    '0%': {
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    },
                    '100%': {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
    },
    plugins: [],
}