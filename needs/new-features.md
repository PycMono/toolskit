## 问题一

"enable_ads": false，才展示广告占位符，如果"enable_ads": true,不展示广告占位符，展示真的广告位。占位符样式为灰色背景，白色边框，居中显示文字"广告位"，尺寸与真实广告位一致。如果没审核通过没有拿到真实的广告就不展示。


## 问题二

主题的切换在网站的最左下角，太不显眼了，一般情况下用户很难发现这个功能，建议将主题切换按钮放在网站的顶部导航栏中，靠近语言切换的位置，这样用户更容易找到和使用这个功能。同时，确保主题切换按钮的设计与整体风格一致，使用明显的图标或文字提示来增强可见性（可以参考改成圆形，下拉选择，切换后展示对应的图标）。

另外在现有的基础上增加dark和light模式

## 问题三

AI 路由规划有点乱，希望统一下，现在的路由如下，希望吧路由统一，另外AI相关不要的代码删除，保留使用的代码，谨慎调整。

```txt
// AI Lab routes (legacy /ailab/* - kept for backward compat)
	ailab := r.Group("/ailab")
	{
		ailab.GET("/detector", handlers.AIDetectorPage)
		// Redirect old humanize URL to new spec-compliant URL
		ailab.GET("/humanize", func(c *gin.Context) {
			lang := c.Query("lang")
			target := "/ai/humanizer"
			if lang != "" {
				target += "?lang=" + lang
			}
			c.Redirect(301, target)
		})
	}

	// AI Lab routes (new /ai/* - spec-compliant)
	ai := r.Group("/ai")
	{
		ai.GET("/detector", handlers.AIDetectorPage)
		ai.GET("/humanizer", handlers.AIHumanizerPage)
	}
```