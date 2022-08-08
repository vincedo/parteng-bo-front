import { environmentCommon } from './environment-common';

export const environment = {
  ...environmentCommon,
  name: 'alpha',
  production: true,
  api: {
    baseURL: '/api/rest/v1',
  },
};
