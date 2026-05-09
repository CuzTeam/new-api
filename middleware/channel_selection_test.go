package middleware

import (
	"testing"
)

func TestParseChannelModelName(t *testing.T) {
	tests := []struct {
		name              string
		input             string
		wantChannel       string
		wantModel         string
		wantOk            bool
	}{
		{
			name:        "valid format",
			input:       "@my-channel/gpt-4o",
			wantChannel: "my-channel",
			wantModel:   "gpt-4o",
			wantOk:      true,
		},
		{
			name:        "numeric channel identifier",
			input:       "@123/gpt-4o",
			wantChannel: "123",
			wantModel:   "gpt-4o",
			wantOk:      true,
		},
		{
			name:        "channel name with hyphens and dots",
			input:       "@my-channel.v2/gpt-4o-mini",
			wantChannel: "my-channel.v2",
			wantModel:   "gpt-4o-mini",
			wantOk:      true,
		},
		{
			name:    "no @ prefix",
			input:   "my-channel/gpt-4o",
			wantOk:  false,
		},
		{
			name:    "no slash separator",
			input:   "@my-channel",
			wantOk:  false,
		},
		{
			name:    "empty channel identifier",
			input:   "@/gpt-4o",
			wantOk:  false,
		},
		{
			name:    "empty model id",
			input:   "@my-channel/",
			wantOk:  false,
		},
		{
			name:    "just @ sign",
			input:   "@",
			wantOk:  false,
		},
		{
			name:    "empty string",
			input:   "",
			wantOk:  false,
		},
		{
			name:        "model with colons",
			input:       "@channel/gpt-4o:2024-08-06",
			wantChannel: "channel",
			wantModel:   "gpt-4o:2024-08-06",
			wantOk:      true,
		},
		{
			name:        "model with multiple slashes",
			input:       "@channel/org/model",
			wantChannel: "channel",
			wantModel:   "org/model",
			wantOk:      true,
		},
		{
			name:        "simple channel and model",
			input:       "@a/b",
			wantChannel: "a",
			wantModel:   "b",
			wantOk:      true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotChannel, gotModel, gotOk := parseChannelModelName(tt.input)
			if gotOk != tt.wantOk {
				t.Errorf("parseChannelModelName(%q) ok = %v, want %v", tt.input, gotOk, tt.wantOk)
				return
			}
			if gotOk {
				if gotChannel != tt.wantChannel {
					t.Errorf("parseChannelModelName(%q) channel = %q, want %q", tt.input, gotChannel, tt.wantChannel)
				}
				if gotModel != tt.wantModel {
					t.Errorf("parseChannelModelName(%q) model = %q, want %q", tt.input, gotModel, tt.wantModel)
				}
			}
		})
	}
}
