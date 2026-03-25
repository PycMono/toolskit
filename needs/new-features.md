## 问题一
上报google ads报错了
-url:https://googleads.g.doubleclick.net/pagead/ads?client=ca-pub-9000734285117391&output=html&h=600&slotname=ai-detector-right&adk=2447877068&adf=2762050783&pi=t.ma~as.ai-detector-right&w=164&fwrn=4&fwrnh=100&lmt=1774426706&rafmt=1&format=164x600&url=http%3A%2F%2Flocalhost%3A8989%2Fai%2Fdetector%3Flang%3Dzh&fwr=0&fwrattr=true&rpe=1&resp_fmts=4&aiof=9&asro=0&aiapmd=0.1423&aiapmid=1&aiactd=0&aicctd=0&ailctd=0&aimartd=4&aieuf=1&aicrs=1&uach=WyJtYWNPUyIsIjI2LjMuMSIsImFybSIsIiIsIjE0Ni4wLjc2ODAuMTU0IixudWxsLDAsbnVsbCwiNjQiLFtbIkNocm9taXVtIiwiMTQ2LjAuNzY4MC4xNTQiXSxbIk5vdC1BLkJyYW5kIiwiMjQuMC4wLjAiXSxbIkdvb2dsZSBDaHJvbWUiLCIxNDYuMC43NjgwLjE1NCJdXSwwXQ..&abgtt=6&dt=1774426706491&bpp=1&bdt=1132&idt=32&shv=r20260324&mjsv=m202603190101&ptt=9&saldr=aa&abxe=1&cookie_enabled=1&eoidce=1&prev_fmts=0x0%2C1200x280%2C164x600&nras=1&correlator=8694088186071&frm=20&pv=1&u_tz=480&u_his=12&u_h=1107&u_w=1710&u_ah=1073&u_aw=1710&u_cd=30&u_sd=2&dmc=8&adx=1456&ady=715&biw=1695&bih=952&scr_x=0&scr_y=0&eid=95385580%2C95386333%2C95386758%2C42533294%2C95386359&oid=2&pvsid=2099612100990395&tmod=633498699&uas=0&nvt=1&fc=1920&brdim=0%2C34%2C0%2C34%2C1710%2C34%2C1710%2C1073%2C1710%2C952&vis=1&rsz=%7C%7CeE%7C&abl=CS&pfx=0&fu=128&bc=31&plas=430x535_r&bz=1&ifi=4&uci=a!4&fsb=1&dtd=33

ads?client=ca-pub-9000734285117391&output=html&h=600&slotname=ai-detector-left&adk=1463283658&adf=1…:1  Failed to load resource: the server responded with a status of 400 ()
⚠️同步注入content完成状态到popup失败: Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received

配置
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9000734285117391"
     crossorigin="anonymous"></script>

需要你测试下。

## 问题二
header里面增加的几个主题，点了之后没有效果，我希望的不是直接横铺，我希望的是一个圆圈按钮，点击之后切换主题颜色，而不是放在header里面，AI检测器里右下角已经有一个蓝色的圆圈按钮可以切换颜色，但是只是针对AI检测器生效，我希望这个按钮可以全局生效，切换之后整个页面的主题颜色都变了，而不是只针对AI检测器生效。我希望全局生效，针对这个网站的所有页面。


## 问题三

AI人性化，用户输入框和输出框到像验证人性化后的文本效果？中间多了一个广告占位，把这个去掉。