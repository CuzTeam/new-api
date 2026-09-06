package service

import (
	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/byok_setting"

	"github.com/gin-gonic/gin"
)

// SelectUserByokKeyForRequest resolves the user's active BYOK key of the given
// mode for modelName. Returns nil whenever BYOK is globally disabled, the user
// has no matching key, or lookup fails (fail-open to normal channel routing).
func SelectUserByokKeyForRequest(c *gin.Context, modelName string, mode string) *model.UserByokKey {
	if c == nil || !byok_setting.Enabled {
		return nil
	}
	userId := common.GetContextKeyInt(c, constant.ContextKeyUserId)
	if userId <= 0 {
		return nil
	}
	key, err := model.SelectUserByokKey(userId, modelName, mode)
	if err != nil {
		logger.LogWarn(c, "byok key lookup failed: "+err.Error())
		return nil
	}
	return key
}
