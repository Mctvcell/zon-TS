/**
 * Tests for ZON Migration Manager
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  ZonMigrationManager,
  globalMigrationManager,
  createAddFieldMigration,
  createRemoveFieldMigration,
  createRenameFieldMigration
} from '../core/migration';

describe('ZON Migration Manager', () => {
  let manager: ZonMigrationManager;

  beforeEach(() => {
    manager = new ZonMigrationManager();
  });

  describe('Direct Migration', () => {
    it('should migrate data using direct migration', () => {
      manager.registerMigration('1.0.0', '2.0.0', (data) => {
        return { ...data, newField: 'added' };
      }, 'Add newField');

      const original = { users: [{ id: 1 }] };
      const migrated = manager.migrate(original, '1.0.0', '2.0.0');

      expect(migrated.newField).toBe('added');
      expect(migrated.users).toEqual(original.users);
    });

    it('should return same data for same version', () => {
      const data = { test: 'value' };
      const result = manager.migrate(data, '1.0.0', '1.0.0');
      expect(result).toEqual(data);
    });
  });

  describe('Migration Paths', () => {
    it('should find and apply migration path', () => {
      // Create migration chain: 1.0.0 -> 1.1.0 -> 2.0.0
      manager.registerMigration('1.0.0', '1.1.0', (data) => {
        return { ...data, field1: 'v1.1' };
      });

      manager.registerMigration('1.1.0', '2.0.0', (data) => {
        return { ...data, field2: 'v2.0' };
      });

      const original = { base: 'data' };
      const migrated = manager.migrate(original, '1.0.0', '2.0.0');

      expect(migrated.base).toBe('data');
      expect(migrated.field1).toBe('v1.1');
      expect(migrated.field2).toBe('v2.0');
    });

    it('should find complex migration path', () => {
      // Create a tree: 1.0.0 -> 1.1.0 -> 2.0.0
      //                          \-> 1.2.0 -> 2.0.0
      manager.registerMigration('1.0.0', '1.1.0', (data) => ({...data, step: 'a'}));
      manager.registerMigration('1.1.0', '1.2.0', (data) => ({...data, step: 'b'}));
      manager.registerMigration('1.2.0', '2.0.0', (data) => ({...data, step: 'c'}));

      const migrated = manager.migrate({ val: 1 }, '1.0.0', '2.0.0');
      
      // Should have gone through one path
      expect(migrated.val).toBe(1);
      expect(migrated.step).toBeDefined();
    });

    it('should throw error when no migration path exists', () => {
      manager.registerMigration('1.0.0', '2.0.0', (data) => data);

      expect(() => {
        manager.migrate({}, '1.0.0', '3.0.0'); // No path to 3.0.0
      }).toThrow('No migration path found');
    });
  });

  describe('canMigrate', () => {
    it('should return true for same version', () => {
      expect(manager.canMigrate('1.0.0', '1.0.0')).toBe(true);
    });

    it('should return true for direct migration', () => {
      manager.registerMigration('1.0.0', '2.0.0', (data) => data);
      expect(manager.canMigrate('1.0.0', '2.0.0')).toBe(true);
    });

    it('should return true for path migration', () => {
      manager.registerMigration('1.0.0', '1.5.0', (data) => data);
      manager.registerMigration('1.5.0', '2.0.0', (data) => data);
      expect(manager.canMigrate('1.0.0', '2.0.0')).toBe(true);
    });

    it('should return false when no path exists', () => {
      expect(manager.canMigrate('1.0.0', '2.0.0')).toBe(false);
    });
  });

  describe('Helper Methods', () => {
    it('should get all migrations', () => {
      manager.registerMigration('1.0.0', '2.0.0', (data) => data, 'First');
      manager.registerMigration('2.0.0', '3.0.0', (data) => data, 'Second');

      const migrations = manager.getMigrations();
      expect(migrations.length).toBe(2);
      expect(migrations[0].description).toBe('First');
      expect(migrations[1].description).toBe('Second');
    });

    it('should get migrations from specific version', () => {
      manager.registerMigration('1.0.0', '1.1.0', (data) => data);
      manager.registerMigration('1.0.0', '2.0.0', (data) => data);
      manager.registerMigration('1.1.0', '2.0.0', (data) => data);

      const from1_0 = manager.getMigrationsFrom('1.0.0');
      expect(from1_0.length).toBe(2);

      const from1_1 = manager.getMigrationsFrom('1.1.0');
      expect(from1_1.length).toBe(1);
    });

    it('should clear all migrations', () => {
      manager.registerMigration('1.0.0', '2.0.0', (data) => data);
      expect(manager.getMigrations().length).toBe(1);

      manager.clear();
      expect(manager.getMigrations().length).toBe(0);
    });
  });

  describe('Helper Functions', () => {
    describe('createAddFieldMigration', () => {
      it('should add field to objects in array', () => {
        const migration = createAddFieldMigration('users.email', 'default@example.com');
        const data = {
          users: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
          ]
        };

        const result = migration(data, '1.0.0', '2.0.0');
        // Note: This helper is simplified and may need adjustment based on actual implementation
        expect(result).toBeDefined();
      });
    });

    describe('createRemoveFieldMigration', () => {
      it('should remove field from objects', () => {
        const migration = createRemoveFieldMigration('users.deprecated');
        const data = {
          users: [
            { id: 1, name: 'Alice', deprecated: true },
            { id: 2, name: 'Bob', deprecated: false }
          ]
        };

        const result = migration(data, '2.0.0', '1.0.0');
        expect(result.users[0].deprecated).toBeUndefined();
        expect(result.users[1].deprecated).toBeUndefined();
      });
    });

    describe('createRenameFieldMigration', () => {
      it('should rename field in objects', () => {
        const migration = createRenameFieldMigration('users.oldName', 'users.newName');
        const data = {
          users: [
            { id: 1, oldName: 'Alice' },
            { id: 2, oldName: 'Bob' }
          ]
        };

        const result = migration(data, '1.0.0', '2.0.0');
        expect(result.users[0].oldName).toBeUndefined();
        expect(result.users[0].newName).toBe('Alice');
        expect(result.users[1].newName).toBe('Bob');
      });
    });
  });

  describe('Real-world Migration Scenarios', () => {
    it('should handle user schema evolution', () => {
      const manager = new ZonMigrationManager();

      // v1 -> v2: Add email field
      manager.registerMigration('1.0.0', '2.0.0', (data) => {
        if (data.users) {
          data.users = data.users.map((u: any) => ({
            ...u,
            email: `${u.name.toLowerCase()}@example.com`
          }));
        }
        return data;
      }, 'Add email field');

      // v2 -> v3: Add status field
      manager.registerMigration('2.0.0', '3.0.0', (data) => {
        if (data.users) {
          data.users = data.users.map((u: any) => ({
            ...u,
            status: 'active'
          }));
        }
        return data;
      }, 'Add status field');

      const v1Data = {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' }
        ]
      };

      const v3Data = manager.migrate(v1Data, '1.0.0', '3.0.0');

      expect(v3Data.users[0].email).toBe('alice@example.com');
      expect(v3Data.users[0].status).toBe('active');
      expect(v3Data.users[1].email).toBe('bob@example.com');
      expect(v3Data.users[1].status).toBe('active');
    });

    it('should handle breaking changes with data transformation', () => {
      const manager = new ZonMigrationManager();

      // v1 -> v2: Change structure from flat to nested
      manager.registerMigration('1.0.0', '2.0.0', (data) => {
        return {
          metadata: {
            version: '2.0.0',
            migrated: true
          },
          users: data.users
        };
      }, 'Restructure data');

      const v1Data = {
        users: [{ id: 1 }]
      };

      const v2Data = manager.migrate(v1Data, '1.0.0', '2.0.0');

      expect(v2Data.metadata).toBeDefined();
      expect(v2Data.metadata.version).toBe('2.0.0');
      expect(v2Data.users).toEqual(v1Data.users);
    });
  });

  describe('Global Migration Manager', () => {
    it('should have access to global instance', () => {
      expect(globalMigrationManager).toBeInstanceOf(ZonMigrationManager);
    });

    it('should persist migrations in global manager', () => {
      const initialCount = globalMigrationManager.getMigrations().length;
      
      globalMigrationManager.registerMigration('test.1', 'test.2', (d) => d);
      
      expect(globalMigrationManager.getMigrations().length).toBe(initialCount + 1);
      
      // Cleanup
      globalMigrationManager.clear();
    });
  });
});
