# Block C-07 · 文件转换工具集 — GIF 工具（9 个工具）

> **涉及路由**：`/convert/video-to-gif` `/convert/mp4-to-gif` `/convert/webm-to-gif` `/convert/apng-to-gif` `/convert/gif-to-mp4` `/convert/gif-to-apng` `/convert/image-to-gif` `/convert/mov-to-gif` `/convert/avi-to-gif`  
> **预估工时**：3h  
> **依赖**：C-02（公共 UI）、C-03（后端引擎）  
> **后端依赖**：FFmpeg + gifsicle

---

## 1. 竞品对标

| 功能 | 竞品 | 本次实现 | 差异化 |
|------|------|---------|------|
| 视频时间裁剪 | ✅ | ✅ 开始时间 + 时长 | — |
| GIF 帧率控制 | ❌ | ✅ 5/10/15/20 FPS | 差异化 |
| GIF 宽度控制 | ❌ | ✅ 240/320/480/640px | 差异化 |
| gifsicle 优化 | ❌ | ✅ 自动 -O3 优化 | 体积更小 |
| Image→GIF 帧延迟 | ❌ | ✅ 每帧可设停留时间 | 差异化 |
| 文件大小 | 200MB | ✅ 200MB | — |

---

## 2. GIF 专属选项面板（`/static/js/convert-gif-opts.js`）

```javascript
// /static/js/convert-gif-opts.js
'use strict';

const VIDEO_TO_GIF_SLUGS = new Set([
  'video-to-gif','mp4-to-gif','webm-to-gif','mov-to-gif','avi-to-gif'
]);

function initGIFOpts() {
  const slug = window.CV_CONFIG?.slug || '';

  // 视频 → GIF：帧率 + 宽度 + 时间裁剪
  if (VIDEO_TO_GIF_SLUGS.has(slug)) {
    injectGIFOpts(`
      <div class="cv-opt-group">
        <label class="cv-opt-label">帧率（FPS）</label>
        <div class="cv-opt-pills">
          <label class="cv-opt-pill"><input type="radio" name="fps" value="5"> 5 FPS</label>
          <label class="cv-opt-pill cv-opt-pill--active"><input type="radio" name="fps" value="10" checked> 10 FPS（推荐）</label>
          <label class="cv-opt-pill"><input type="radio" name="fps" value="15"> 15 FPS</label>
          <label class="cv-opt-pill"><input type="radio" name="fps" value="20"> 20 FPS</label>
        </div>
      </div>
      <div class="cv-opt-group">
        <label class="cv-opt-label">输出宽度</label>
        <div class="cv-opt-pills">
          <label class="cv-opt-pill"><input type="radio" name="width" value="240"> 240px</label>
          <label class="cv-opt-pill"><input type="radio" name="width" value="320"> 320px</label>
          <label class="cv-opt-pill cv-opt-pill--active"><input type="radio" name="width" value="480" checked> 480px（推荐）</label>
          <label class="cv-opt-pill"><input type="radio" name="width" value="640"> 640px</label>
        </div>
      </div>
      <div class="cv-opt-group cv-opt-group--inline">
        <label class="cv-opt-label">开始时间（秒）</label>
        <input type="number" id="gifStart" name="start" class="cv-input-small"
               min="0" step="0.1" placeholder="0（留空从头开始）">
        <label class="cv-opt-label" style="margin-left:16px">截取时长（秒）</label>
        <input type="number" id="gifDuration" name="duration" class="cv-input-small"
               min="0.5" max="30" step="0.5" placeholder="留空转完整视频">
        <span class="cv-opt-hint">GIF 建议不超过 15 秒</span>
      </div>
    `);
  }

  // image-to-gif：帧延迟
  if (slug === 'image-to-gif') {
    injectGIFOpts(`
      <div class="cv-opt-group">
        <label class="cv-opt-label">每帧停留（秒）</label>
        <div class="cv-opt-pills">
          <label class="cv-opt-pill"><input type="radio" name="delay" value="0.5"> 0.5s</label>
          <label class="cv-opt-pill cv-opt-pill--active"><input type="radio" name="delay" value="1" checked> 1s（推荐）</label>
          <label class="cv-opt-pill"><input type="radio" name="delay" value="2"> 2s</label>
          <label class="cv-opt-pill"><input type="radio" name="delay" value="3"> 3s</label>
        </div>
      </div>
      <div class="cv-opt-group">
        <label class="cv-opt-label">输出宽度</label>
        <div class="cv-opt-pills">
          <label class="cv-opt-pill"><input type="radio" name="width" value="320"> 320px</label>
          <label class="cv-opt-pill cv-opt-pill--active"><input type="radio" name="width" value="480" checked> 480px</label>
          <label class="cv-opt-pill"><input type="radio" name="width" value="640"> 640px</label>
          <label class="cv-opt-pill"><input type="radio" name="width" value="800"> 800px</label>
        </div>
      </div>
      <p class="cv-opt-note">📌 上传多张图片，拖拽调整顺序，将合成为 GIF 幻灯片</p>
    `);
    enableFileDragSortForGIF();
  }
}

function injectGIFOpts(html) {
  const bar = document.getElementById('formatBar');
  const div = document.createElement('div');
  div.className = 'cv-extra-opts';
  div.innerHTML = html;
  const ref = bar || document.querySelector('.cv-upload-zone');
  if (ref) ref.insertAdjacentElement(bar ? 'afterend' : 'beforebegin', div);

  div.querySelectorAll('.cv-opt-pill input').forEach(input => {
    input.addEventListener('change', () => {
      input.closest('.cv-opt-pills').querySelectorAll('.cv-opt-pill').forEach(p =>
        p.classList.toggle('cv-opt-pill--active', !!p.querySelector('input:checked'))
      );
    });
  });
}

// image-to-gif 的文件拖拽排序（复用 C-06 的 makeSortable）
function enableFileDragSortForGIF() {
  const observer = new MutationObserver(() => {
    const list = document.getElementById('fileList');
    if (list) { makeSortable(list); observer.disconnect(); }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

window.getExtraOptions = function() {
  const opts = {};
  // Pills 单选
  document.querySelectorAll('.cv-extra-opts input[type=radio]:checked').forEach(el => {
    opts[el.name] = el.value;
  });
  // 数字输入框
  ['gifStart','gifDuration'].forEach(id => {
    const el = document.getElementById(id);
    if (el?.value) opts[el.name || id.replace('gif','').toLowerCase()] = el.value;
  });
  // image-to-gif 文件顺序
  if (window.CV_CONFIG?.slug === 'image-to-gif') {
    const ids = [...document.querySelectorAll('.cv-file-item')].map(e => e.id.replace('item-',''));
    opts['order'] = ids.join(',');
  }
  return opts;
};

document.addEventListener('DOMContentLoaded', initGIFOpts);
```

---

## 3. 后端 GIF 转换参数详表

### 3.1 视频 → GIF（核心命令）

```bash
# 高质量 GIF 的两遍滤镜方案（生成调色板，色彩更准确）
ffmpeg -y \
  -ss {start}    \          # 开始时间（可选）
  -t  {duration} \          # 截取时长（可选）
  -i  input.{ext} \
  -vf "fps={fps},scale={width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer" \
  -loop 0 \                 # 无限循环
  output.gif

# 完成后用 gifsicle 压缩优化
gifsicle -O3 --batch output.gif
```

Go 代码（`internal/service/converter/ffmpeg.go` 补充）：
```go
func FFmpegToGIF(job *Job) error {
    fps      := job.Options["fps"];      if fps == "" { fps = "10" }
    width    := job.Options["width"];    if width == "" { width = "480" }
    start    := job.Options["start"]
    duration := job.Options["duration"]

    args := []string{"-y"}
    if start != "" { args = append(args, "-ss", start) }
    if duration != "" { args = append(args, "-t", duration) }
    args = append(args, "-i", job.InputPath)

    filter := fmt.Sprintf(
        "fps=%s,scale=%s:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer",
        fps, width,
    )
    args = append(args, "-vf", filter, "-loop", "0", job.OutputPath)

    if err := runFFmpeg(job, args); err != nil {
        return err
    }
    // gifsicle 优化（忽略失败，gifsicle 未安装时不影响主流程）
    exec.Command("gifsicle", "-O3", "--batch", job.OutputPath).Run()
    return nil
}
```

### 3.2 GIF → MP4

```bash
ffmpeg -y -i input.gif \
  -movflags +faststart \
  -pix_fmt yuv420p \      # 兼容所有播放器
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \  # 确保尺寸为偶数
  output.mp4
```

### 3.3 GIF → APNG

```bash
ffmpeg -y -i input.gif \
  -plays 0 \              # 无限循环
  output.apng
```

### 3.4 APNG → GIF

```bash
ffmpeg -y -i input.apng \
  -vf "fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  -loop 0 \
  output.gif

gifsicle -O3 --batch output.gif
```

### 3.5 Image to GIF（多图幻灯片）

```bash
# 方案：将多图合成 GIF
# delay 单位：百分之一秒（100 = 1秒）
ffmpeg -y \
  -framerate "1/{delay_sec}" \
  -pattern_type glob -i '/tmp/{jobId}_frame_*.jpg' \
  -vf "scale={width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  -loop 0 \
  output.gif

gifsicle -O3 --batch output.gif
```

多图上传的后端路由需单独处理：
```go
// POST /convert/api/merge-gif
// 接收多个 uploadId（已上传的图片），按顺序合成 GIF
func ConvertMergeGIF(c *gin.Context) {
    // 类似 ConvertMergePDF 的实现（见 C-06）
    // 1. 按顺序收集已上传文件路径
    // 2. 创建新 Job，调用 FFmpegSlideshow
    // 3. 返回 jobId
}
```

---

## 4. image-to-gif 的多文件上传流程

```javascript
// /static/js/convert-image-gif.js
// image-to-gif 专用：多文件上传后合并触发

async function convertAll() {
  if (CVState.isConverting) return;
  const pending = CVState.files.filter(f => f.status === 'pending');
  if (!pending.length) { showToast('请先上传图片', 'info'); return; }
  if (pending.length < 2) { showToast('至少需要 2 张图片', 'info'); return; }

  CVState.isConverting = true;
  setBtnState(true);

  try {
    // 按界面顺序上传所有图片
    const uploadIds = [];
    for (const item of getOrderedItems()) {
      updateFileItem(item.id, { status: 'uploading', progress: 0 });
      const uploadId = await uploadFile(item);
      uploadIds.push(uploadId);
      updateFileItem(item.id, { progress: 80 });
    }

    // 获取 GIF 参数
    const opts = window.getExtraOptions?.() || {};

    // 合并为 GIF
    const resp = await fetch('/convert/api/merge-gif', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadIds, options: opts }),
    });
    if (!resp.ok) throw new Error('合成 GIF 失败');

    const { jobId } = await resp.json();

    // 轮询完成
    const result = await pollJob(pending[0].id, jobId, 'gif');

    // 所有文件都指向同一个 GIF 下载
    for (const item of pending) {
      updateFileItem(item.id, {
        status: 'done', progress: 100,
        resultUrl: result.downloadUrl,
        resultName: result.filename,
      });
    }
    checkAllDone();

  } catch(e) {
    for (const item of pending) {
      updateFileItem(item.id, { status: 'error', error: e.message });
    }
  } finally {
    CVState.isConverting = false;
    setBtnState(false);
  }
}

function getOrderedItems() {
  // 按 DOM 顺序返回（拖拽排序后）
  const ids = [...document.querySelectorAll('.cv-file-item')].map(e => e.id.replace('item-',''));
  return ids.map(id => CVState.files.find(f => f.id === id)).filter(Boolean);
}

function setBtnState(running) {
  const btn  = document.getElementById('convertAllBtn');
  const text = document.getElementById('convertBtnText');
  if (btn) btn.disabled = running;
  if (text) text.textContent = running ? '合成中...' : '🎞️ 合成 GIF';
}
```

---

## 5. CSS 补充

```css
/* ══ GIF 选项特有样式 ════════════════════════ */
.cv-opt-group--inline {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-input-small {
  width: 100px;
  height: 30px;
  padding: 0 10px;
  border: 1.5px solid var(--cv-border);
  border-radius: var(--cv-radius-sm);
  font-size: 0.875rem;
  color: var(--cv-text);
  outline: none;
  transition: border-color 0.2s;
}

.cv-input-small:focus {
  border-color: var(--cv-sky);
  box-shadow: 0 0 0 3px rgba(14,165,233,0.1);
}

.cv-opt-hint {
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 600;
}

.cv-opt-note {
  font-size: 0.8125rem;
  color: var(--cv-text-muted);
  padding: 8px 12px;
  background: #fef9c3;
  border-radius: 6px;
  border-left: 3px solid #f59e0b;
}
```

---

## 6. 验收标准

### Video → GIF
- [ ] `/convert/video-to-gif`：上传 10s MP4，设置 FPS=10、宽度=480px，下载 GIF 可在浏览器播放
- [ ] 开始时间=3、时长=5：GIF 仅包含原视频第 3~8 秒片段
- [ ] FPS=20：GIF 比 FPS=5 更流畅，文件更大
- [ ] 宽度=240：GIF 实际尺寸约为 240px 宽（高度等比缩放）
- [ ] gifsicle 优化：GIF 文件比无优化版小 10%~30%

### GIF → 视频
- [ ] `gif-to-mp4`：上传 GIF，下载 MP4，可在所有播放器播放（偶数宽高）
- [ ] `gif-to-apng`：下载 APNG，可在 Chrome/Firefox 中动态显示

### Image → GIF
- [ ] 上传 5 张 JPG，拖拽排序，合成 GIF 页面顺序正确
- [ ] 帧延迟=2s：每张图停留约 2 秒

### 文件大小
- [ ] 200MB 视频上传时有进度条，不超时（30 分钟内完成）
- [ ] 超过 200MB：前端阻止上传，给出提示
