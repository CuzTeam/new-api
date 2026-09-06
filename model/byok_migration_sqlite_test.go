package model

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/QuantumNous/new-api/common"

	"github.com/stretchr/testify/require"
)

// TestByokMigrationSQLiteIdempotent runs the full AutoMigrate twice against a
// fresh SQLite database and asserts the byok tables are usable afterwards.
func TestByokMigrationSQLiteIdempotent(t *testing.T) {
	oldMaster := common.IsMasterNode
	common.IsMasterNode = true
	t.Cleanup(func() { common.IsMasterNode = oldMaster })

	// Other tests in this package share the package-level DB handle, so this
	// test never closes the pool. Use a self-managed temp dir and ignore the
	// removal error (Windows keeps the SQLite file locked until exit).
	dir, err := os.MkdirTemp("", "byok-mig-*")
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = os.RemoveAll(dir)
	})
	common.SQLitePath = filepath.Join(dir, "byok-test.db") + "?_pragma=busy_timeout(30000)"

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
	require.True(t, DisableUserByokKey(keys[0].Id))
	require.False(t, DisableUserByokKey(keys[0].Id)) // already disabled
}
