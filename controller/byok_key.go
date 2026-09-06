package controller

import (
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/byok_setting"

	"github.com/gin-gonic/gin"
)

type byokKeyRequest struct {
	ChannelType int      `json:"channel_type"`
	Name        string   `json:"name"`
	Key         string   `json:"key"`
	ModelList   []string `json:"model_list"`
	Mode        string   `json:"mode"`
	Status      *int     `json:"status"`
}

type byokKeyResponse struct {
	*model.UserByokKey
	ModelNames []string `json:"model_names"`
}

func buildByokKeyResponse(key *model.UserByokKey) *byokKeyResponse {
	return &byokKeyResponse{UserByokKey: key, ModelNames: key.GetModelList()}
}

// GetByokStatus exposes the admin-controlled BYOK switches to the user console
// so the page can explain why binding or activation is unavailable.
func GetByokStatus(c *gin.Context) {
	common.ApiSuccess(c, gin.H{
		"enabled":         byok_setting.IsEnabled(),
		"service_fee_usd": byok_setting.GetServiceFeeUSD(),
		"supported_types": model.ByokSupportedChannelTypes(),
	})
}

func GetAllUserByokKeys(c *gin.Context) {
	userId := c.GetInt("id")
	keys, err := model.GetAllUserByokKeys(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	responses := make([]*byokKeyResponse, 0, len(keys))
	for _, key := range keys {
		responses = append(responses, buildByokKeyResponse(key))
	}
	common.ApiSuccess(c, responses)
}

func CreateUserByokKey(c *gin.Context) {
	userId := c.GetInt("id")
	var req byokKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiErrorMsg(c, "invalid request body")
		return
	}
	req.Key = strings.TrimSpace(req.Key)
	if req.Mode == "" {
		req.Mode = model.ByokModePrioritized
	}
	key := &model.UserByokKey{
		UserId:      userId,
		ChannelType: req.ChannelType,
		Name:        strings.TrimSpace(req.Name),
		Mode:        req.Mode,
		Status:      model.ByokKeyStatusEnabled,
		CreatedTime: time.Now().Unix(),
	}
	if err := model.ValidateUserByokKey(key); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.ValidateByokPlaintextKey(req.Key); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := key.SetModelList(req.ModelList); err != nil {
		common.ApiError(c, err)
		return
	}
	ciphertext, err := common.EncryptSecret(req.Key)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	key.KeyCiphertext = ciphertext
	key.KeyHint = model.MaskByokKey(req.Key)
	if err := model.InsertUserByokKey(key); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, buildByokKeyResponse(key))
}

func UpdateUserByokKey(c *gin.Context) {
	userId := c.GetInt("id")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiErrorMsg(c, "invalid byok key id")
		return
	}
	existing, err := model.GetUserByokKeyByIds(id, userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	var req byokKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiErrorMsg(c, "invalid request body")
		return
	}
	req.Key = strings.TrimSpace(req.Key)
	if req.ChannelType != 0 && req.ChannelType != existing.ChannelType && req.Key == "" {
		common.ApiErrorMsg(c, "changing the provider type requires resubmitting the key")
		return
	}
	if req.ChannelType != 0 {
		existing.ChannelType = req.ChannelType
	}
	existing.Name = strings.TrimSpace(req.Name)
	if req.Mode != "" {
		existing.Mode = req.Mode
	}
	status := existing.Status
	if req.Status != nil && (*req.Status == model.ByokKeyStatusEnabled || *req.Status == model.ByokKeyStatusDisabled) {
		status = *req.Status
	}
	existing.Status = status
	if err := model.ValidateUserByokKey(existing); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := existing.SetModelList(req.ModelList); err != nil {
		common.ApiError(c, err)
		return
	}
	if req.Key != "" {
		if err := model.ValidateByokPlaintextKey(req.Key); err != nil {
			common.ApiError(c, err)
			return
		}
		ciphertext, encErr := common.EncryptSecret(req.Key)
		if encErr != nil {
			common.ApiError(c, encErr)
			return
		}
		existing.KeyCiphertext = ciphertext
		existing.KeyHint = model.MaskByokKey(req.Key)
	}
	if err := model.UpdateUserByokKey(userId, existing); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, buildByokKeyResponse(existing))
}

func DeleteUserByokKey(c *gin.Context) {
	userId := c.GetInt("id")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiErrorMsg(c, "invalid byok key id")
		return
	}
	if err := model.DeleteUserByokKeyById(id, userId); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, nil)
}
