package model

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/QuantumNous/new-api/common"

	"github.com/stretchr/testify/require"
)

// TestByokMigrationSQLiteIdempotent runs the full InitDB/migrateDB twice
// against a fresh SQLite database and asserts the byok tables are usable
// afterwards. It restores the package-level TestMain database on cleanup so
// the rest of the package's tests keep using their shared :memory: store.
func TestByokMigrationSQLiteIdempotent(t *testing.T) {
	oldMaster := common.IsMasterNode
	oldDB, oldLogDB := DB, LOG_DB
	oldSQLitePath := common.SQLitePath
	oldMainType := common.MainDatabaseType()
	oldLogType := common.LogDatabaseType()
	common.IsMasterNode = true

	dirForCleanup, err := os.MkdirTemp("", "byok-mig-*")
	require.NoError(t, err)
	common.SQLitePath = filepath.Join(dirForCleanup, "byok-test.db") + "?_pragma=busy_timeout(30000)"

	// Pin the backend: InitDB chooses MySQL/PostgreSQL whenever SQL_DSN is
	// set, which would silently skip the SQLite migration under test.
	oldDSN := os.Getenv("SQL_DSN")
	oldLogDSN := os.Getenv("LOG_SQL_DSN")
	require.NoError(t, os.Setenv("SQL_DSN", ""))
	require.NoError(t, os.Setenv("LOG_SQL_DSN", ""))

	closeActivePool := func() {
		if DB != nil {
			if sqlDB, err := DB.DB(); err == nil {
				_ = sqlDB.Close()
			}
		}
	}
	t.Cleanup(func() {
		// Close the pools this test created, then restore the TestMain
		// environment. On Linux the temp SQLite file is already unlinked, so
		// leaving the pools open would make a fresh pooled connection open an
		// empty database for subsequent tests.
		closeActivePool()
		DB, LOG_DB = oldDB, oldLogDB
		common.SQLitePath = oldSQLitePath
		common.SetDatabaseTypes(oldMainType, oldLogType)
		common.IsMasterNode = oldMaster
		initCol()
		_ = os.Setenv("SQL_DSN", oldDSN)
		_ = os.Setenv("LOG_SQL_DSN", oldLogDSN)
		_ = os.RemoveAll(dirForCleanup)
	})

	require.NoError(t, InitDB())
	require.NoError(t, InitByokCipher())

	key := &UserByokKey{
		UserId:      42,
		ChannelType: 1,
		Name:        "my-openai",
		Mode:        ByokModePrioritized,
		Status:      ByokKeyStatusEnabled,
	}
	require.NoError(t, key.SetModelList([]string{"gpt-4o"}))
	ciphertext, err := common.EncryptSecret("sk-test-plaintext-1234")
	require.NoError(t, err)
	key.KeyCiphertext = ciphertext
	key.KeyHint = MaskByokKey("sk-test-plaintext-1234")
	require.NoError(t, InsertUserByokKey(key))

	// Second startup: migration must be idempotent and data must survive.
	closeActivePool()
	require.NoError(t, InitDB())
	require.NoError(t, InitByokCipher())

	keys, err := GetAllUserByokKeys(42)
	require.NoError(t, err)
	require.Len(t, keys, 1)
	require.Equal(t, "my-openai", keys[0].Name)
	require.Equal(t, ByokModePrioritized, keys[0].Mode)

	// The cipher key persisted across restarts: decryption still works.
	plaintext, err := keys[0].DecryptKey()
	require.NoError(t, err)
	require.Equal(t, "sk-test-plaintext-1234", plaintext)

	// Auto-disable path works on the migrated table.
	require.True(t, DisableUserByokKey(keys[0].Id, keys[0].KeyCiphertext))
	require.False(t, DisableUserByokKey(keys[0].Id, keys[0].KeyCiphertext)) // already disabled
	require.False(t, DisableUserByokKey(keys[0].Id, "stale-ciphertext"))    // rotated credential
}
