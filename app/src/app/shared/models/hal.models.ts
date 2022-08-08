export interface HALEmbedded {
  [key: string]: unknown;
}

// TODO: https://github.com/evert/hal-types/blob/master/src/index.ts
export type HALResource<T> = T & {
  // [key: string]: unknown;
  // created?: number;
  // updated?: number;
  // status?: number;
  _links: {
    self: {
      href: string;
    };
  };
  _embedded?: HALEmbedded;
};

export type HALResponse<T> = {
  _total_items: number;
  _links: {
    self: {
      href: string;
    };
  };
  _embedded: {
    [key: string]: HALResource<T>[];
  };
};
