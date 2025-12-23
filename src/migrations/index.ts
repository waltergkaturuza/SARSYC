import * as migration_20251223_130213 from './20251223_130213';

export const migrations = [
  {
    up: migration_20251223_130213.up,
    down: migration_20251223_130213.down,
    name: '20251223_130213'
  },
];
