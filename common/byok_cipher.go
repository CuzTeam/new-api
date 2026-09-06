package common

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"sync"
)

var ErrSecretCipherUnavailable = errors.New("secret cipher is not initialized")
var ErrSecretCipherInvalid = errors.New("secret cipher payload is invalid")

// secretCipherState holds the AES-GCM AEAD used to encrypt user-supplied
// upstream credentials (BYOK keys) at rest. The key material is generated on
// first boot and persisted by the model layer; only the derived AEAD lives here.
var secretCipherState struct {
	sync.RWMutex
	aead cipher.AEAD
}

// LoadSecretCipherKey installs a 128/192/256-bit AES key for secret encryption.
func LoadSecretCipherKey(key []byte) error {
	block, err := aes.NewCipher(key)
	if err != nil {
		return err
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return err
	}
	secretCipherState.Lock()
	secretCipherState.aead = aead
	secretCipherState.Unlock()
	return nil
}

func secretCipherAEAD() cipher.AEAD {
	secretCipherState.RLock()
	defer secretCipherState.RUnlock()
	return secretCipherState.aead
}

// EncryptSecret seals plaintext with AES-GCM and returns a base64 payload of
// nonce||ciphertext. Callers store only this ciphertext.
func EncryptSecret(plaintext string) (string, error) {
	aead := secretCipherAEAD()
	if aead == nil {
		return "", ErrSecretCipherUnavailable
	}
	nonce := make([]byte, aead.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	sealed := aead.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(sealed), nil
}

// DecryptSecret opens a payload produced by EncryptSecret.
func DecryptSecret(ciphertext string) (string, error) {
	aead := secretCipherAEAD()
	if aead == nil {
		return "", ErrSecretCipherUnavailable
	}
	raw, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil || len(raw) < aead.NonceSize() {
		return "", ErrSecretCipherInvalid
	}
	nonce, sealed := raw[:aead.NonceSize()], raw[aead.NonceSize():]
	plaintext, err := aead.Open(nil, nonce, sealed, nil)
	if err != nil {
		return "", ErrSecretCipherInvalid
	}
	return string(plaintext), nil
}
