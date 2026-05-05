package router

import (
	"embed"
	"net/http"
	"net/url"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

// ThemeAssets holds the embedded frontend assets for both themes.
type ThemeAssets struct {
	DefaultBuildFS   embed.FS
	DefaultIndexPage []byte
	ClassicBuildFS   embed.FS
	ClassicIndexPage []byte
}

func SetWebRouter(router *gin.Engine, assets ThemeAssets) {
	defaultFS := common.EmbedFolder(assets.DefaultBuildFS, "web/default/dist")
	classicFS := common.EmbedFolder(assets.ClassicBuildFS, "web/classic/dist")

	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(middleware.Cache())
	router.NoRoute(func(c *gin.Context) {
		c.Set(middleware.RouteTagKey, "web")
		if strings.HasPrefix(c.Request.RequestURI, "/v1") || strings.HasPrefix(c.Request.RequestURI, "/api") {
			controller.RelayNotFound(c)
			return
		}

		theme := resolveFrontendTheme(c)
		if redirectPath := mapFrontendPath(theme, c.Request.URL.Path); redirectPath != "" && redirectPath != c.Request.URL.Path {
			if c.Request.URL.RawQuery != "" {
				redirectPath = redirectPath + "?" + c.Request.URL.RawQuery
			}
			c.Redirect(http.StatusFound, redirectPath)
			return
		}
		themeFS := selectFrontendFS(theme, defaultFS, classicFS)
		requestPath := strings.TrimPrefix(c.Request.URL.Path, "/")
		if requestPath != "" && themeFS.Exists("/", requestPath) {
			http.FileServer(themeFS).ServeHTTP(c.Writer, c.Request)
			return
		}

		c.Header("Cache-Control", "no-cache")
		if theme == "classic" {
			c.Data(http.StatusOK, "text/html; charset=utf-8", assets.ClassicIndexPage)
		} else {
			c.Data(http.StatusOK, "text/html; charset=utf-8", assets.DefaultIndexPage)
		}
	})
}

func resolveFrontendTheme(c *gin.Context) string {
	themeCookie, err := c.Cookie(common.FrontendThemeCookieName)
	if err == nil {
		theme := common.NormalizeFrontendTheme(themeCookie)
		if theme != "" {
			return theme
		}
	}

	session := sessions.Default(c)
	sessionTheme := common.NormalizeFrontendTheme(common.Interface2String(session.Get(common.FrontendThemeSessionKey)))
	if sessionTheme != "" {
		common.SetFrontendThemeCookie(c, sessionTheme)
		return sessionTheme
	}

	if sessionID := session.Get("id"); sessionID != nil {
		if userID, ok := sessionID.(int); ok && userID > 0 {
			setting, err := model.GetUserSetting(userID, false)
			if err == nil {
				theme := common.NormalizeFrontendTheme(setting.FrontendTheme)
				if theme != "" {
					session.Set(common.FrontendThemeSessionKey, theme)
					_ = session.Save()
					common.SetFrontendThemeCookie(c, theme)
					return theme
				}
			}

			fallbackTheme := common.NormalizeFrontendTheme(common.GetTheme())
			if fallbackTheme != "" {
				session.Set(common.FrontendThemeSessionKey, fallbackTheme)
				_ = session.Save()
				return fallbackTheme
			}
		}
	}
	return common.GetTheme()
}

func mapFrontendPath(theme string, path string) string {
	normalizedPath := path
	if normalizedPath == "" {
		normalizedPath = "/"
	}
	unescapedPath, err := url.PathUnescape(normalizedPath)
	if err == nil && unescapedPath != "" {
		normalizedPath = unescapedPath
	}
	normalizedPath = strings.TrimSuffix(normalizedPath, "/")
	if normalizedPath == "" {
		normalizedPath = "/"
	}

	if theme == "classic" {
		switch normalizedPath {
		case "/dashboard":
			return "/console"
		case "/profile":
			return "/console/personal"
		}
	}

	if theme == "default" {
		switch normalizedPath {
		case "/console":
			return "/dashboard"
		case "/console/personal":
			return "/profile"
		}
	}

	return ""
}

func selectFrontendFS(theme string, defaultFS, classicFS static.ServeFileSystem) static.ServeFileSystem {
	if theme == "classic" {
		return classicFS
	}
	return defaultFS
}
