module.exports = {
  content: ['./src/app/**/*.{html,ts}'],
  important: '.mat-typography',
  theme: {
    extend: {
      colors: {
        'blue-ptg': {
          /* Color/Primary/Blue */
          primary: '#00245c',
          /* custom */
          'primary-300': 'rgba(0, 36, 92, 0.3)',
          /* Color/Primary/Blue - 50% */
          'primary-500': '#8092AE',
          /* Color/Primary/Blue - 80% */
          'primary-800': '#5999F1',
          /* Color/Secondary/Blue */
          secondary: '#0059e8',
          /* Color/Secondary/Blue - 50% */
          'secondary-500': '#80acf4',
          /* Color/Secondary/Blue - 20% */
          'secondary-200': '#DEEBFF',
          /* Color/Secondary/Blue-6% */
          'secondary-060': '#F0F5FE',
        },
        /* Color/Grey/Grey-2 */
        'gray-ptg-2': '#F5F7F9',
        /* Gray no name... */
        'gray-ptg': '#DADADA',
        /* Color/Background/Black */
        'black-ptg': '#202020',
        /* Color/Red-Alert */
        'red-ptg-alert': '#E84843',
      },
    },
  },
  plugins: [],
};
