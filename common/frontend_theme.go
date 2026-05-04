package common

import (
	"strings"

	"github.com/gin-gonic/gin"
)

const FrontendThemeCookieName = "frontend_theme"
const FrontendThemeCookieMaxAge = 60 * 60 * 24 * 365

func NormalizeFrontendTheme(theme string) string {
	theme = strings.ToLower(strings.TrimSpace(theme))
	if theme == "default" || theme == "classic" {
		return theme
	}
	return ""
}

func SetFrontendThemeCookie(c *gin.Context, theme string) {
	theme = NormalizeFrontendTheme(theme)
	if theme == "" {
		return
	}
	c.SetCookie(FrontendThemeCookieName, theme, FrontendThemeCookieMaxAge, "/", "", false, false)
}
