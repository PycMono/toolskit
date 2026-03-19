# Block C-04 · 文件转换工具集 — Video & Audio（8 个工具）

> **涉及路由**：`/convert/video` `/convert/audio` `/convert/mp3` `/convert/mp4-to-mp3` `/convert/video-to-mp3` `/convert/mp4` `/convert/mov-to-mp4` `/convert/mp3-to-ogg`  
> **预估工时**：4h  
> **依赖**：C-02（公共 UI）、C-03（后端引擎）  
> **后端依赖**：FFmpeg（全部）

---

## 1. 竞品对标（freeconvert.com Video Converter）

| 功能区 | 竞品 | 本次实现 | 差异化 |
|--------|------|---------|------|
| 格式选择 | 上传后顶部下拉 | ✅ **上传前 Pills 预选** | 更直观 |
| 视频质量 | 无 | ✅ 高/标准/快速三档 | 差异化 |
| 音频比特率 | 无 | ✅ 64k~320k 选择 | 差异化 |
| 输出格式数量 | 视频 9 种 | ✅ 8 种（主流）| — |
| 批量 | ✅ | ✅ 3 并发 | — |
| 最大尺寸 | 1GB（免费）| ✅ 1GB | — |

---

## 2. 视频工具附加选项面板

> 通用页面模板（C-02）已提供上传区和文件队列。  
> 本 Block 补充「格式特定选项」注入到 `#formatBar` 下方。

```javascript
// /static/js/convert-video-opts.js
// 视频/音频工具的附加选项面板（注入到格式 Pills 下方）

'use strict';

const VIDEO_SLUGS = new Set(['video','mp4','mov-to-mp4','mp4-to-mp3','video-to-mp3','mp3-to-ogg']);
const AUDIO_SLUGS = new Set(['audio','mp3','mp4-to-mp3','video-to-mp3','mp3-to-ogg']);

function initVideoAudioOpts() {
  const slug = window.CV_CONFIG?.slug || '';
  const workspace = document.querySelector('.cv-workspace .cv-container');
  if (!workspace) return;

  // 在格式栏后、上传区前插入选项
  const formatBar = document.getElementById('formatBar');
  const optsDiv   = document.createElement('div');
  optsDiv.className = 'cv-extra-opts';
  optsDiv.id = 'extraOpts';

  let html = '';

  // 视频质量（仅视频输出工具）
  if (['video','mp4','mov-to-mp4'].includes(slug)) {
    html += `
    <div class="cv-opt-group">
      <label class="cv-opt-label">视频质量</label>
      <div class="cv-opt-pills">
        <label class="cv-opt-pill"><input type="radio" name="quality" value="high"> 高质量</label>
        <label class="cv-opt-pill cv-opt-pill--active"><input type="radio" name="quality" value="medium" checked> 标准（推荐）</label>
        <label class="cv-opt-pill"><input type="radio" name="quality" value="low"> 快速压缩</label>
      </div>
    </div>`;
  }

  // 音频比特率
  if (AUDIO_SLUGS.has(slug) || ['video','mp4'].includes(slug)) {
    html += `
    <div class="cv-opt-group">
      <label class="cv-opt-label">音频比特率</label>
      <div class="cv-opt-pills">
        <label class="cv-opt-pill"><input type="radio" name="bitrate" value="64k"> 64 kbps</label>
        <label class="cv-opt-pill"><input type="radio" name="bitrate" value="128k"> 128 kbps</label>
        <label class="cv-opt-pill cv-opt-pill--active"><input type="radio" name="bitrate" value="192k" checked> 192 kbps（推荐）</label>
        <label class="cv-opt-pill"><input type="radio" name="bitrate" value="320k"> 320 kbps</label>
      </div>
    </div>`;
  }

  if (!html) return;
  optsDiv.innerHTML = html;

  if (formatBar) {
    formatBar.insertAdjacentElement('afterend', optsDiv);
  } else {
    workspace.querySelector('.cv-upload-zone').insertAdjacentElement('beforebegin', optsDiv);
  }

  // 把选项注入到上传参数中
  document.querySelectorAll('.cv-opt-pill input').forEach(input => {
    input.addEventListener('change', () => {
      input.closest('.cv-opt-pills').querySelectorAll('.cv-opt-pill').forEach(p =>
        p.classList.toggle('cv-opt-pill--active', p.querySelector('input')?.checked)
      );
    });
  });
}

// 上传时附加额外参数
const _origAddFiles = window.addFiles;
window.getExtraOptions = function() {
  const opts = {};
  document.querySelectorAll('.cv-extra-opts input[type=radio]:checked').forEach(el => {
    opts[el.name] = el.value;
  });
  return opts;
};

document.addEventListener('DOMContentLoaded', initVideoAudioOpts);
```

---

## 3. 后端 FFmpeg 参数详表

### 3.1 Video Converter（`/convert/video`）

```
输入：任意视频
输出格式选择：MP4 / MKV / AVI / MOV / WEBM / FLV / WMV / 3GP

FFmpeg 参数（以 MP4 为例）：
  ffmpeg -y -i input.{ext} \
    -c:v libx264 -crf {18|23|28} -preset fast \
    -c:a aac -b:a {bitrate} \
    -movflags +faststart \
    output.mp4
```

### 3.2 Audio Converter（`/convert/audio`）

```
输入：任意音频或视频
输出格式：MP3 / AAC / OGG / WAV / FLAC / WMA / M4A / AIFF

FFmpeg 参数（以 MP3 为例）：
  ffmpeg -y -i input.{ext} \
    -vn \                         # 去掉视频轨
    -c:a libmp3lame -b:a {64k|128k|192k|320k} \
    output.mp3
```

### 3.3 MP4 to MP3 / Video to MP3

```
FFmpeg 参数：
  ffmpeg -y -i input.mp4 \
    -vn -c:a libmp3lame -b:a 192k \
    output.mp3

特殊处理：
  - 若原始音轨为 AAC，可直接 stream copy（-c:a copy），速度极快
  - 判断逻辑：用 ffprobe 检测音轨编码
```

### 3.4 MOV to MP4

```
FFmpeg 参数：
  ffmpeg -y -i input.mov \
    -c:v libx264 -crf 23 -preset fast \
    -c:a aac -b:a 128k \
    -movflags +faststart \
    output.mp4

说明：
  - MOV 常见于 Apple 设备，音频可能为 PCM/ALAC，需重编
  - +faststart 使 MP4 可在网络上流式播放
```

### 3.5 MP3 Converter（`/convert/mp3`）

```
输入：任意音频（MP3/OGG/WAV/FLAC/M4A 等）
输出：MP3（固定）

FFmpeg 参数：
  ffmpeg -y -i input.{ext} \
    -c:a libmp3lame -b:a {64|128|192|320}k -q:a 0 \
    output.mp3
```

### 3.6 MP3 to OGG

```
FFmpeg 参数：
  ffmpeg -y -i input.mp3 \
    -c:a libvorbis -b:a 192k \
    output.ogg
```

---

## 4. 各工具页面差异化配置

```go
// 工具专属 FAQ（补充到 convert_faq.go）
func specificFAQs(slug, lang string) []ConvertFAQ {
    faqs := map[string]map[string][]ConvertFAQ{
        "mp4-to-mp3": {
            "zh": {
                {Q: "转换会损失音频质量吗？",
                 A: "使用 192kbps 比特率转换 MP3，人耳难以察觉与原始音质的差异。如需无损，请选择 WAV 或 FLAC 格式。"},
                {Q: "可以一次转换多个 MP4 文件吗？",
                 A: "可以，支持同时上传最多 20 个文件批量转换。"},
            },
            "en": {
                {Q: "Will the audio quality be lost?",
                 A: "Converting at 192kbps produces audio quality indistinguishable from the original for most listeners. Choose WAV or FLAC for lossless output."},
            },
        },
        "video": {
            "zh": {
                {Q: "转换视频需要多长时间？",
                 A: "时间取决于视频大小和所选质量。通常 100MB 的 MP4 在 30 秒内完成。"},
                {Q: "转换后视频画质会降低吗？",
                 A: "选择「高质量」模式（CRF 18）时画质损失极小，与原始视频几乎无法区分。"},
            },
        },
        // ... 其余工具类似
    }
    if m, ok := faqs[slug]; ok {
        if f, ok := m[lang]; ok {
            return f
        }
    }
    return nil
}
```

---

## 5. 工具页面布局说明（`templates/convert/tool.html` 使用的模板变量）

每个工具通过 `window.CV_CONFIG` 注入到前端：

```javascript
// 视频工具示例
window.CV_CONFIG = {
  slug:        "video",
  category:    "video",
  maxSizeMB:   1024,
  accept:      ["video/*"],
  frontendOnly: false,
  lang:        "zh",
};
```

每个视频/音频工具页会额外加载：
```html
<script src="/static/js/convert-video-opts.js"></script>
```

---

## 6. CSS 补充（追加到 `convert.css`）

```css
/* ══ 附加选项（视频质量/比特率）══════════════ */
.cv-extra-opts {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  padding: 14px 18px;
  background: var(--cv-surface);
  border: 1px solid var(--cv-border);
  border-radius: var(--cv-radius-sm);
  box-shadow: var(--cv-shadow-sm);
}

.cv-opt-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cv-opt-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--cv-text-muted);
  white-space: nowrap;
}

.cv-opt-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.cv-opt-pill input { display: none; }

.cv-opt-pill {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 1.5px solid var(--cv-border);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--cv-text-muted);
  transition: all 0.15s;
}

.cv-opt-pill:hover { border-color: var(--cv-sky); color: var(--cv-sky); }

.cv-opt-pill--active {
  border-color: var(--cv-sky);
  background: var(--cv-sky-light);
  color: var(--cv-sky-dark);
}
```

---

## 7. 验收标准

- [ ] `/convert/video`：格式 Pills 显示 MP4/MKV/AVI/MOV/WEBM/FLV/WMV/3GP；质量和比特率选项正常显示
- [ ] `/convert/mp4-to-mp3`：格式栏隐藏（只有 MP3 一种），上传 MP4 → 点击转换 → 下载 MP3 可播放
- [ ] `/convert/mov-to-mp4`：上传 MOV 文件 → 转换 → 下载 MP4，在 Windows/Android 可播放
- [ ] `/convert/audio`：支持拖入 MP3/WAV/FLAC，转换为 OGG/AAC/WAV 正常
- [ ] 质量选项「高质量」：视频输出 CRF=18，文件相对更大；「快速压缩」：CRF=28，文件最小
- [ ] 比特率 320kbps：转换后音频文件用专业软件验证比特率正确
- [ ] 超过 1GB 文件：前端上传前阻止，给出提示
- [ ] 并发 3 个视频同时转换：队列正常，不崩溃
