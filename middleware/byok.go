package middleware

import (
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	relaykitdto "github.com/QuantumNous/new-api/relaykit/dto"
	"github.com/QuantumNous/new-api/service"

	"github.com/bytedance/gopkg/util/gopool"
	"github.com/gin-gonic/gin"
)

// isTaskLikeRelayPath reports whether the request belongs to a task platform
// (Midjourney, video, task plugins). BYOK v1 only covers text relay formats,
// so task-like requests never activate user-supplied keys.
func isTaskLikeRelayPath(c *gin.Context) bool {
	if c.GetString("resolved_task_model") != "" || c.GetString("expected_task_plugin_key") != "" {
		return true
	}
	path := c.Request.URL.Path
	return strings.Contains(path, "/mj/") ||
		strings.Contains(path, "/v1/videos") ||
		strings.Contains(path, "/v1/video/generations")
}

// ActivateByokKeyForRequest selects and activates the user's BYOK key of the
// given mode for modelName. Returns true when the context now carries the
// user-supplied credential and the caller must skip its own channel routing.
func ActivateByokKeyForRequest(c *gin.Context, mode string, modelName string) bool {
	if c == nil || isTaskLikeRelayPath(c) {
		return false
	}
	key := service.SelectUserByokKeyForRequest(c, modelName, mode)
	if key == nil {
		return false
	}
	if err := SetupContextForByokKey(c, key); err != nil {
		logger.LogWarn(c, "failed to activate byok key: "+err.Error())
		return false
	}
	gopool.Go(func() { model.TouchUserByokKey(key.Id) })
	return true
}

// SetupContextForByokKey activates a user-supplied key for the next upstream
// attempt. It overwrites every channel-scoped context key so neither a
// previously selected channel's configuration nor its credential can leak into
// the BYOK attempt. The upstream endpoint is the provider's official one.
func SetupContextForByokKey(c *gin.Context, key *model.UserByokKey) error {
	plaintext, err := key.DecryptKey()
	if err != nil {
		return err
	}
	common.SetContextKey(c, constant.ContextKeyChannelId, 0)
	common.SetContextKey(c, constant.ContextKeyChannelName, "BYOK")
	common.SetContextKey(c, constant.ContextKeyChannelType, key.ChannelType)
	common.SetContextKey(c, constant.ContextKeyChannelCreateTime, key.CreatedTime)
	common.SetContextKey(c, constant.ContextKeyChannelKey, plaintext)
	common.SetContextKey(c, constant.ContextKeyChannelBaseUrl, constant.GetChannelBaseURL(key.ChannelType))
	common.SetContextKey(c, constant.ContextKeyChannelAutoBan, false)
	common.SetContextKey(c, constant.ContextKeyChannelIsMultiKey, false)
	common.SetContextKey(c, constant.ContextKeyChannelOrganization, "")
	common.SetContextKey(c, constant.ContextKeyChannelModelMapping, "")
	common.SetContextKey(c, constant.ContextKeyChannelStatusCodeMapping, "")
	common.SetContextKey(c, constant.ContextKeyChannelParamOverride, map[string]interface{}{})
	common.SetContextKey(c, constant.ContextKeyChannelHeaderOverride, map[string]interface{}{})
	common.SetContextKey(c, constant.ContextKeyChannelSetting, relaykitdto.ChannelSettings{})
	common.SetContextKey(c, constant.ContextKeyChannelOtherSetting, relaykitdto.ChannelOtherSettings{})
	common.SetContextKey(c, constant.ContextKeyByokKeyId, key.Id)
	common.SetContextKey(c, constant.ContextKeyByokMode, key.Mode)
	return nil
}

// ByokAttemptActive reports whether the current upstream attempt runs on a
// user-supplied key.
func ByokAttemptActive(c *gin.Context) bool {
	return common.GetContextKeyInt(c, constant.ContextKeyByokKeyId) > 0
}

// ClearByokContext removes the BYOK markers so subsequent attempts and billing
// are attributed to the selected platform channel again.
func ClearByokContext(c *gin.Context) {
	common.SetContextKey(c, constant.ContextKeyByokKeyId, 0)
	common.SetContextKey(c, constant.ContextKeyByokMode, "")
}
