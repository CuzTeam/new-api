package model

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"

	"github.com/QuantumNous/new-api/common"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// byokCipherKeySlot stores the AES key that protects UserByokKey ciphertexts
// inside the existing LoginEncryptionKey table. PrivateKeyPEM holds base64 key
// bytes for this slot (opaque key material, not a PEM document).
const byokCipherKeySlot = "byok_cipher"

const byokCipherKeySize = 32

// InitByokCipher loads or creates the symmetric key used to encrypt BYOK
// credentials at rest. It runs unconditionally at startup so previously bound
// keys stay decryptable regardless of the current BYOK feature toggle.
func InitByokCipher() error {
	var stored LoginEncryptionKey
	queryErr := DB.Where("slot = ?", byokCipherKeySlot).First(&stored).Error
	if queryErr == nil {
		return loadByokCipherKey(stored.PrivateKeyPEM)
	}
	if !errors.Is(queryErr, gorm.ErrRecordNotFound) {
		return queryErr
	}

	rawKey := make([]byte, byokCipherKeySize)
	if _, err := io.ReadFull(rand.Reader, rawKey); err != nil {
		return err
	}
	candidate := LoginEncryptionKey{
		Slot:          byokCipherKeySlot,
		PrivateKeyPEM: base64.StdEncoding.EncodeToString(rawKey),
	}
	if err := DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "slot"}},
		DoNothing: true,
	}).Create(&candidate).Error; err != nil {
		return err
	}

	if err := DB.Where("slot = ?", byokCipherKeySlot).First(&stored).Error; err != nil {
		return err
	}
	return loadByokCipherKey(stored.PrivateKeyPEM)
}

func loadByokCipherKey(keyBase64 string) error {
	rawKey, err := base64.StdEncoding.DecodeString(keyBase64)
	if err != nil || len(rawKey) != byokCipherKeySize {
		return errors.New("byok cipher key is invalid")
	}
	return common.LoadSecretCipherKey(rawKey)
}
