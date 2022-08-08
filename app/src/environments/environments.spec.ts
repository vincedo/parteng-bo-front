import { environment as alpha } from './environment.alpha';
import { environment as prod } from './environment.prod';

describe('Environments', () => {
  beforeEach(() => {});

  it('should be defined', () => {
    expect(alpha).toBeDefined();
    expect(alpha.production).toBe(true);

    expect(prod).toBeDefined();
    expect(prod.production).toBe(true);
  });
});
