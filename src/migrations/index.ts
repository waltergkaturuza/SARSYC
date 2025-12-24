import * as migration_20251223_130213 from './20251223_130213';
import * as migration_20251224_120000 from './20251224_120000';

export const migrations = [
  {
    up: migration_20251223_130213.up,
    down: migration_20251223_130213.down,
    name: '20251223_130213'
  },
  {
    up: migration_20251224_120000.up,
    down: migration_20251224_120000.down,
    name: '20251224_120000'
  },
];
