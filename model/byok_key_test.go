package model

import (
	"testing"

	"github.com/QuantumNous/new-api/constant"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUserByokKeyMatchesModel(t *testing.T) {
	tests := []struct {
		name         string
		modelList    []string
		channelType  int
		servingTypes []int
		requestModel string
		expectMatch  bool
	}{
		{
			name:         "explicit model list matches even without serving types",
			modelList:    []string{"gemini-3-pro"},
			channelType:  constant.ChannelTypeGemini,
			servingTypes: nil,
			requestModel: "gemini-3-pro",
			expectMatch:  true,
		},
		{
			name:         "explicit model list does not match other models",
			modelList:    []string{"gemini-3-pro"},
			channelType:  constant.ChannelTypeGemini,
			servingTypes: nil,
			requestModel: "gpt-4o",
			expectMatch:  false,
		},
		{
			name:         "provider type serving the model matches without model list",
			modelList:    nil,
			channelType:  constant.ChannelTypeOpenAI,
			servingTypes: []int{constant.ChannelTypeAnthropic, constant.ChannelTypeOpenAI},
			requestModel: "gpt-4o",
			expectMatch:  true,
		},
		{
			name:         "provider type not serving the model does not match",
			modelList:    nil,
			channelType:  constant.ChannelTypeOpenAI,
			servingTypes: []int{constant.ChannelTypeAnthropic},
			requestModel: "gpt-4o",
			expectMatch:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			key := &UserByokKey{ChannelType: tt.channelType}
			require.NoError(t, key.SetModelList(tt.modelList))
			assert.Equal(t, tt.expectMatch, key.MatchesModel(tt.requestModel, tt.servingTypes))
		})
	}
}

func TestUserByokKeySetModelListNormalizesAndDeduplicates(t *testing.T) {
	key := &UserByokKey{}
	require.NoError(t, key.SetModelList([]string{" gpt-4o ", "gpt-4o", "", "claude-3"}))
	assert.Equal(t, []string{"gpt-4o", "claude-3"}, key.GetModelList())

	oversized := make([]string, maxByokModelsPerKey+1)
	for i := range oversized {
		oversized[i] = "model-" + string(rune('a'+i%26)) + string(rune('0'+i/26))
	}
	require.Error(t, key.SetModelList(oversized))
}

func TestValidateUserByokKey(t *testing.T) {
	valid := &UserByokKey{ChannelType: constant.ChannelTypeOpenAI, Mode: ByokModePrioritized}
	require.NoError(t, ValidateUserByokKey(valid, "sk-abc"))

	unsupported := &UserByokKey{ChannelType: constant.ChannelTypeAzure, Mode: ByokModePrioritized}
	require.Error(t, ValidateUserByokKey(unsupported, "sk-abc"))

	badMode := &UserByokKey{ChannelType: constant.ChannelTypeOpenAI, Mode: "whatever"}
	require.Error(t, ValidateUserByokKey(badMode, "sk-abc"))

	require.Error(t, ValidateUserByokKey(valid, "   "))
}

func TestMaskByokKeyKeepsOnlySuffix(t *testing.T) {
	assert.Equal(t, "****cdef", MaskByokKey("sk-abcdefghijklmncdef"))
	assert.NotContains(t, MaskByokKey("sk-short"), "sk-short")
	assert.Empty(t, MaskByokKey("  "))
}
