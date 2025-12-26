import * as migration_20251223_130213 from './20251223_130213';
import * as migration_20251224_120000 from './20251224_120000';
import * as migration_20251226_155456_add_international_registration_fields from './20251226_155456_add_international_registration_fields';

export const migrations = [
  {
    up: migration_20251223_130213.up,
    down: migration_20251223_130213.down,
    name: '20251223_130213',
  },
  {
    up: migration_20251224_120000.up,
    down: migration_20251224_120000.down,
    name: '20251224_120000',
  },
  {
    up: migration_20251226_155456_add_international_registration_fields.up,
    down: migration_20251226_155456_add_international_registration_fields.down,
    name: '20251226_155456_add_international_registration_fields'
  },
];
