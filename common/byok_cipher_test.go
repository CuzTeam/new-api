package common

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSecretCipherRoundTrip(t *testing.T) {
	key := []byte("0123456789abcdef0123456789abcdef")
	require.NoError(t, LoadSecretCipherKey(key))
	t.Cleanup(func() {
		secretCipherState.Lock()
		secretCipherState.aead = nil
		secretCipherState.Unlock()
	})

	plaintext := "sk-ant-api03-AAAA-secret-key-value"
	ciphertext, err := EncryptSecret(plaintext)
	require.NoError(t, err)
	assert.NotContains(t, ciphertext, plaintext)

	decrypted, err := DecryptSecret(ciphertext)
	require.NoError(t, err)
	assert.Equal(t, plaintext, decrypted)

	// Random nonce: encrypting twice must not produce the same payload.
	second, err := EncryptSecret(plaintext)
	require.NoError(t, err)
	assert.NotEqual(t, ciphertext, second)
}

func TestSecretCipherRejectsTamperedPayload(t *testing.T) {
	key := []byte("0123456789abcdef0123456789abcdef")
	require.NoError(t, LoadSecretCipherKey(key))
	t.Cleanup(func() {
		secretCipherState.Lock()
		secretCipherState.aead = nil
		secretCipherState.Unlock()
	})

	ciphertext, err := EncryptSecret("sk-test")
	require.NoError(t, err)

	tampered := ciphertext[:len(ciphertext)-4] + "AAAA"
	_, err = DecryptSecret(tampered)
	require.ErrorIs(t, err, ErrSecretCipherInvalid)

	_, err = DecryptSecret(strings.Replace(ciphertext, "=", "", 1))
	require.ErrorIs(t, err, ErrSecretCipherInvalid)

	// Wrong key material must fail to open the payload.
	require.NoError(t, LoadSecretCipherKey([]byte("ffffffffffffffffffffffffffffffff")))
	_, err = DecryptSecret(ciphertext)
	require.ErrorIs(t, err, ErrSecretCipherInvalid)
}

func TestSecretCipherUnavailableBeforeInit(t *testing.T) {
	secretCipherState.Lock()
	saved := secretCipherState.aead
	secretCipherState.aead = nil
	secretCipherState.Unlock()
	t.Cleanup(func() {
		secretCipherState.Lock()
		secretCipherState.aead = saved
		secretCipherState.Unlock()
	})

	_, err := EncryptSecret("sk-test")
	require.ErrorIs(t, err, ErrSecretCipherUnavailable)

	_, err = DecryptSecret("AAAA")
	require.ErrorIs(t, err, ErrSecretCipherUnavailable)
}
