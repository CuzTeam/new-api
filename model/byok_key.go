package model

import (
	"errors"
	"slices"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
)

const (
	ByokKeyStatusEnabled  = 1
	ByokKeyStatusDisabled = 2

	ByokModePrioritized = "prioritized"
	ByokModeFallback    = "fallback"

	maxByokKeysPerUser   = 20
	maxByokModelsPerKey  = 100
	maxByokKeyNameLength = 64
	maxByokKeyLength     = 4096
)

// byokSupportedChannelTypes lists channel types eligible for BYOK in v1:
// bearer-key providers whose official endpoint is reachable with a single key.
// Multi-field credential providers (Azure, AWS, Vertex) are excluded.
var byokSupportedChannelTypes = map[int]bool{
	constant.ChannelTypeOpenAI:      true,
	constant.ChannelTypeAnthropic:   true,
	constant.ChannelTypeGemini:      true,
	constant.ChannelTypeMoonshot:    true,
	constant.ChannelTypeDeepSeek:    true,
	constant.ChannelTypeXai:         true,
	constant.ChannelTypeSiliconFlow: true,
}

// ByokChannelTypeSupported reports whether a channel type can be bound as a
// user-supplied key.
func ByokChannelTypeSupported(channelType int) bool {
	return byokSupportedChannelTypes[channelType]
}

// ByokSupportedChannelTypes returns the sorted list of supported channel types.
func ByokSupportedChannelTypes() []int {
	types := make([]int, 0, len(byokSupportedChannelTypes))
	for channelType := range byokSupportedChannelTypes {
		types = append(types, channelType)
	}
	slices.Sort(types)
	return types
}

type UserByokKey struct {
	Id            int    `json:"id"`
	UserId        int    `json:"user_id" gorm:"index"`
	ChannelType   int    `json:"channel_type"`
	Name          string `json:"name" gorm:"type:varchar(64)"`
	KeyCiphertext string `json:"-" gorm:"type:text;not null"`
	KeyHint       string `json:"key_hint" gorm:"type:varchar(16)"`
	ModelList     string `json:"model_list" gorm:"type:text"`
	Mode          string `json:"mode" gorm:"type:varchar(16);default:'prioritized'"`
	Status        int    `json:"status" gorm:"default:1"`
	CreatedTime   int64  `json:"created_time" gorm:"bigint"`
	AccessedTime  int64  `json:"accessed_time" gorm:"bigint"`
}

func (k *UserByokKey) GetModelList() []string {
	if k.ModelList == "" {
		return nil
	}
	var models []string
	if err := common.UnmarshalJsonStr(k.ModelList, &models); err != nil {
		return nil
	}
	return models
}

func (k *UserByokKey) SetModelList(models []string) error {
	normalized := make([]string, 0, len(models))
	seen := make(map[string]struct{}, len(models))
	for _, name := range models {
		name = strings.TrimSpace(name)
		if name == "" {
			continue
		}
		if _, exists := seen[name]; exists {
			continue
		}
		seen[name] = struct{}{}
		normalized = append(normalized, name)
	}
	if len(normalized) > maxByokModelsPerKey {
		return errors.New("too many models for one BYOK key")
	}
	data, err := common.Marshal(normalized)
	if err != nil {
		return err
	}
	k.ModelList = string(data)
	return nil
}

// MatchesModel reports whether the key can serve modelName: either the model is
// listed explicitly on the key (covers models the platform has no channel for)
// or the key's provider type currently serves the model somewhere in the
// platform's ability table.
func (k *UserByokKey) MatchesModel(modelName string, servingChannelTypes []int) bool {
	if slices.Contains(k.GetModelList(), modelName) {
		return true
	}
	return slices.Contains(servingChannelTypes, k.ChannelType)
}

// DecryptKey returns the plaintext upstream key for in-request use only.
func (k *UserByokKey) DecryptKey() (string, error) {
	return common.DecryptSecret(k.KeyCiphertext)
}

func MaskByokKey(key string) string {
	key = strings.TrimSpace(key)
	if key == "" {
		return ""
	}
	if len(key) <= 8 {
		return strings.Repeat("*", len(key))
	}
	return "****" + key[len(key)-4:]
}

func ValidateUserByokKey(key *UserByokKey) error {
	if !ByokChannelTypeSupported(key.ChannelType) {
		return errors.New("unsupported channel type for BYOK")
	}
	if key.Mode != ByokModePrioritized && key.Mode != ByokModeFallback {
		return errors.New("invalid BYOK mode")
	}
	if len(key.Name) > maxByokKeyNameLength {
		return errors.New("BYOK key name is too long")
	}
	return nil
}

// ValidateByokPlaintextKey checks a newly submitted plaintext credential.
// Metadata-only updates skip this check.
func ValidateByokPlaintextKey(plaintextKey string) error {
	plaintextKey = strings.TrimSpace(plaintextKey)
	if plaintextKey == "" {
		return errors.New("BYOK key must not be empty")
	}
	if len(plaintextKey) > maxByokKeyLength {
		return errors.New("BYOK key is too long")
	}
	return nil
}

func CountUserByokKeys(userId int) (int64, error) {
	var count int64
	err := DB.Model(&UserByokKey{}).Where("user_id = ?", userId).Count(&count).Error
	return count, err
}

func GetAllUserByokKeys(userId int) ([]*UserByokKey, error) {
	var keys []*UserByokKey
	err := DB.Where("user_id = ?", userId).Order("id desc").Find(&keys).Error
	return keys, err
}

func GetUserByokKeyByIds(id int, userId int) (*UserByokKey, error) {
	if id == 0 {
		return nil, errors.New("byok key id is invalid")
	}
	var key UserByokKey
	err := DB.Where("id = ? and user_id = ?", id, userId).First(&key).Error
	return &key, err
}

func InsertUserByokKey(key *UserByokKey) error {
	count, err := CountUserByokKeys(key.UserId)
	if err != nil {
		return err
	}
	if count >= maxByokKeysPerUser {
		return errors.New("too many BYOK keys for this user")
	}
	return DB.Create(key).Error
}

// UpdateUserByokKey persists user-owned fields. A non-empty KeyCiphertext on
// the struct replaces the stored credential (key rotation).
func UpdateUserByokKey(userId int, key *UserByokKey) error {
	updates := map[string]interface{}{
		"channel_type": key.ChannelType,
		"name":         key.Name,
		"mode":         key.Mode,
		"model_list":   key.ModelList,
		"status":       key.Status,
	}
	if key.KeyCiphertext != "" {
		updates["key_ciphertext"] = key.KeyCiphertext
		updates["key_hint"] = key.KeyHint
	}
	return DB.Model(&UserByokKey{}).
		Where("id = ? and user_id = ?", key.Id, userId).
		Updates(updates).Error
}

func DeleteUserByokKeyById(id int, userId int) error {
	result := DB.Where("id = ? and user_id = ?", id, userId).Delete(&UserByokKey{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("byok key not found")
	}
	return nil
}

// GetActiveUserByokKeys returns the user's enabled keys for one mode, newest
// first. Errors are surfaced; callers treat them as "no keys".
func GetActiveUserByokKeys(userId int, mode string) ([]*UserByokKey, error) {
	var keys []*UserByokKey
	err := DB.Where("user_id = ? and status = ? and mode = ?", userId, ByokKeyStatusEnabled, mode).
		Order("id desc").Find(&keys).Error
	return keys, err
}

// SelectUserByokKey picks the newest enabled key of the given mode that can
// serve modelName. Returns nil when nothing matches.
func SelectUserByokKey(userId int, modelName string, mode string) (*UserByokKey, error) {
	keys, err := GetActiveUserByokKeys(userId, mode)
	if err != nil || len(keys) == 0 {
		return nil, err
	}
	servingTypes := GetEnabledChannelTypesForModel(modelName)
	for _, key := range keys {
		if key.MatchesModel(modelName, servingTypes) {
			return key, nil
		}
	}
	return nil, nil
}

// DisableUserByokKey marks a key disabled (auto-disable on upstream auth
// failure). The ciphertext fingerprint guards against a stale in-flight
// request disabling a credential that was rotated under the same id.
// Returns true when the key transitioned from enabled to disabled.
func DisableUserByokKey(keyId int, cipherFingerprint string) bool {
	if keyId <= 0 || cipherFingerprint == "" {
		return false
	}
	result := DB.Model(&UserByokKey{}).
		Where("id = ? and status = ? and key_ciphertext = ?", keyId, ByokKeyStatusEnabled, cipherFingerprint).
		Update("status", ByokKeyStatusDisabled)
	return result.Error == nil && result.RowsAffected > 0
}

func TouchUserByokKey(keyId int) {
	if keyId <= 0 {
		return
	}
	DB.Model(&UserByokKey{}).Where("id = ?", keyId).Update("accessed_time", common.GetTimestamp())
}
