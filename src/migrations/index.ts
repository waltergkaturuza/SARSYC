import * as migration_20251223_130213 from './20251223_130213';
import * as migration_20251224_120000 from './20251224_120000';
import * as migration_20251226_155456_add_international_registration_fields from './20251226_155456_add_international_registration_fields';
import * as migration_20251226_160419_add_passport_scan_nextofkin_enhancements from './20251226_160419_add_passport_scan_nextofkin_enhancements';
import * as migration_20251227_113630_create_sponsorship_tiers from './20251227_113630_create_sponsorship_tiers';
import * as migration_20250101_000000_drop_document_locking_tables from './20250101_000000_drop_document_locking_tables';

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
    name: '20251226_155456_add_international_registration_fields',
  },
  {
    up: migration_20251226_160419_add_passport_scan_nextofkin_enhancements.up,
    down: migration_20251226_160419_add_passport_scan_nextofkin_enhancements.down,
    name: '20251226_160419_add_passport_scan_nextofkin_enhancements'
  },
  {
    up: migration_20251227_113630_create_sponsorship_tiers.up,
    down: migration_20251227_113630_create_sponsorship_tiers.down,
    name: '20251227_113630_create_sponsorship_tiers'
  },
  {
    up: migration_20250101_000000_drop_document_locking_tables.up,
    down: migration_20250101_000000_drop_document_locking_tables.down,
    name: '20250101_000000_drop_document_locking_tables'
  },
];
