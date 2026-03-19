package middleware

import (
	"PycMono/github/toolskit/config"

	"github.com/gin-gonic/gin"
)

// GAConfig injects Google Analytics 4 configuration into the Gin context from Config.
// All page handlers must read GAMeasurementID / EnableGA from context, never from Config directly.
func GAConfig(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("GAMeasurementID", cfg.GAMeasurementID)
		c.Set("EnableGA", cfg.EnableGA)
		c.Next()
	}
}

