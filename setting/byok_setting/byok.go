package byok_setting

// Option keys registered in the platform option map. Admin-facing.
const (
	ByokEnabledKey    = "ByokEnabled"
	ByokServiceFeeKey = "ByokServiceFeeUSD"
)

// MaxServiceFeeUSD bounds the per-request BYOK service fee so the quota
// conversion (fee * QuotaPerUnit) can never saturate the int32 quota boundary.
const MaxServiceFeeUSD = 100.0

// Enabled is the global BYOK master switch. When false, both prioritized and
// fallback BYOK attempts are skipped entirely and requests behave exactly as
// if no BYOK keys were bound. Defaults to false.
var Enabled = false

// ServiceFeeUSD is the flat per-request fee charged when a request is served
// by a user-supplied key. 0 means BYOK usage is free. Defaults to 0.
var ServiceFeeUSD = 0.0

// GetServiceFeeUSD returns the sanitized service fee (never negative).
func GetServiceFeeUSD() float64 {
	if ServiceFeeUSD <= 0 {
		return 0
	}
	if ServiceFeeUSD > MaxServiceFeeUSD {
		return MaxServiceFeeUSD
	}
	return ServiceFeeUSD
}
