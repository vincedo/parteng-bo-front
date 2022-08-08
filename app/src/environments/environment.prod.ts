import { environmentCommon } from './environment-common';

export const environment = {
  ...environmentCommon,
  name: 'production',
  production: true,
  api: {
    baseURL: './api/rest/v1',
  },
};
