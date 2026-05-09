package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/i18n"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/QuantumNous/new-api/types"

	"github.com/gin-gonic/gin"
)

func parseChannelModelName(modelName string) (channelIdentifier string, modelId string, ok bool) {
	if !strings.HasPrefix(modelName, "@") {
		return "", "", false
	}
	rest := modelName[1:]
	slashIndex := strings.Index(rest, "/")
	if slashIndex <= 0 {
		return "", "", false
	}
	if slashIndex == len(rest)-1 {
		return "", "", false
	}
	channelIdentifier = rest[:slashIndex]
	modelId = rest[slashIndex+1:]
	if channelIdentifier == "" || modelId == "" {
		return "", "", false
	}
	return channelIdentifier, modelId, true
}

func handleChannelSelection(c *gin.Context, channelIdentifier string, modelId string) (*model.Channel, string, bool) {
	channel, err := model.GetChannelByIdOrName(channelIdentifier)
	if err != nil || channel == nil {
		common.SysLog(fmt.Sprintf("channel selection failed: channel %s not found, user %d, model %s",
			channelIdentifier, c.GetInt("id"), modelId))
		abortWithOpenAiMessage(c, http.StatusNotFound,
			i18n.T(c, i18n.MsgDistributorChannelNotFound, map[string]any{"Channel": channelIdentifier}),
			types.ErrorCodeChannelNotFound)
		return nil, "", false
	}

	if channel.Status != common.ChannelStatusEnabled {
		common.SysLog(fmt.Sprintf("channel selection failed: channel %s (%d) is disabled, user %d, model %s",
			channel.Name, channel.Id, c.GetInt("id"), modelId))
		abortWithOpenAiMessage(c, http.StatusForbidden,
			i18n.T(c, i18n.MsgDistributorChannelDisabled),
			types.ErrorCodeChannelNotFound)
		return nil, "", false
	}

	usingGroup := common.GetContextKeyString(c, constant.ContextKeyUsingGroup)
	hasPermission := false
	var selectGroup string

	if usingGroup == "auto" {
		userGroup := common.GetContextKeyString(c, constant.ContextKeyUserGroup)
		autoGroups := service.GetUserAutoGroup(userGroup)
		for _, g := range autoGroups {
			if model.IsChannelEnabledForGroupModel(g, modelId, channel.Id) {
				hasPermission = true
				selectGroup = g
				common.SetContextKey(c, constant.ContextKeyAutoGroup, g)
				break
			}
		}
	} else {
		if model.IsChannelEnabledForGroupModel(usingGroup, modelId, channel.Id) {
			hasPermission = true
			selectGroup = usingGroup
		}
	}

	if !hasPermission {
		common.SysLog(fmt.Sprintf("channel selection failed: access denied for user %d to channel %s (%d) for model %s, group %s",
			c.GetInt("id"), channel.Name, channel.Id, modelId, usingGroup))
		abortWithOpenAiMessage(c, http.StatusForbidden,
			i18n.T(c, i18n.MsgDistributorChannelAccessDenied, map[string]any{"Channel": channelIdentifier, "Model": modelId}),
			types.ErrorCodeChannelAccessDenied)
		return nil, "", false
	}

	modelExists := false
	for _, m := range channel.GetModels() {
		if strings.TrimSpace(m) == modelId {
			modelExists = true
			break
		}
	}

	if !modelExists {
		common.SysLog(fmt.Sprintf("channel selection failed: model %s not in channel %s (%d), user %d",
			modelId, channel.Name, channel.Id, c.GetInt("id")))
		abortWithOpenAiMessage(c, http.StatusNotFound,
			i18n.T(c, i18n.MsgDistributorModelNotInChannel, map[string]any{"Model": modelId, "Channel": channelIdentifier}),
			types.ErrorCodeModelNotInChannel)
		return nil, "", false
	}

	common.SysLog(fmt.Sprintf("channel selection: user %d routed to channel %s (%d) for model %s via @channel/model format",
		c.GetInt("id"), channel.Name, channel.Id, modelId))

	return channel, selectGroup, true
}

func tryChannelSelection(c *gin.Context, modelName string) (*model.Channel, string, bool) {
	if !operation_setting.IsChannelSelectionEnabled() {
		return nil, "", false
	}

	channelIdentifier, modelId, ok := parseChannelModelName(modelName)
	if !ok {
		return nil, "", false
	}

	return handleChannelSelection(c, channelIdentifier, modelId)
}
