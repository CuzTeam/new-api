package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

type ChannelSelectionSetting struct {
	Enabled bool `json:"enabled"`
}

var channelSelectionSetting = ChannelSelectionSetting{
	Enabled: false,
}

func init() {
	config.GlobalConfig.Register("channel_selection_setting", &channelSelectionSetting)
}

func GetChannelSelectionSetting() *ChannelSelectionSetting {
	return &channelSelectionSetting
}

func IsChannelSelectionEnabled() bool {
	return channelSelectionSetting.Enabled
}
