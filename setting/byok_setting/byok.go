package byok_setting

import "sync"

// Option keys registered in the platform option map. Admin-facing.
const (
	ByokEnabledKey    = "ByokEnabled"
	ByokServiceFeeKey = "ByokServiceFeeUSD"
)

// MaxServiceFeeUSD bounds the per-request BYOK service fee so the quota
// conversion (fee * QuotaPerUnit) can never saturate the int32 quota boundary.
const MaxServiceFeeUSD = 100.0

// state guards the two admin-controlled settings: option updates happen on
// request paths' read side concurrently, so access is synchronized.
var state struct {
	sync.RWMutex
	enabled       bool
	serviceFeeUSD float64
}

// SetEnabled toggles the global BYOK master switch. When false, both
// prioritized and fallback BYOK attempts are skipped entirely and requests
// behave exactly as if no BYOK keys were bound. Defaults to false.
func SetEnabled(enabled bool) {
	state.Lock()
	state.enabled = enabled
	state.Unlock()
}

// IsEnabled reports whether BYOK activation is allowed.
func IsEnabled() bool {
	state.RLock()
	defer state.RUnlock()
	return state.enabled
}

// SetServiceFeeUSD stores the flat per-request fee charged when a request is
// served by a user-supplied key, clamped to [0, MaxServiceFeeUSD]. 0 means
// BYOK usage is free. Defaults to 0.
func SetServiceFeeUSD(fee float64) {
	if fee < 0 || fee != fee {
		fee = 0
	}
	if fee > MaxServiceFeeUSD {
		fee = MaxServiceFeeUSD
	}
	state.Lock()
	state.serviceFeeUSD = fee
	state.Unlock()
}

// GetServiceFeeUSD returns the sanitized service fee (never negative).
func GetServiceFeeUSD() float64 {
	state.RLock()
	defer state.RUnlock()
	if state.serviceFeeUSD <= 0 {
		return 0
	}
	return state.serviceFeeUSD
}
