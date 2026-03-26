package i18n

import (
	"io/fs"
	"log"
	"path/filepath"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
)

// Watcher 监听 locales 目录变化，自动触发热重载。
// 仅建议在开发环境使用（GIN_MODE != release）。
type Watcher struct {
	manager    *Manager
	dir        string
	fsWatcher  *fsnotify.Watcher
	debounceMs int
	stopCh     chan struct{}
	closeOnce  sync.Once
}

// NewWatcher 创建文件监听器，绑定到指定 Manager。
// 调用 Start() 后开始监听，调用 Close() 停止。
func NewWatcher(manager *Manager, localesDir string) (*Watcher, error) {
	fw, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}
	return &Watcher{
		manager:    manager,
		dir:        localesDir,
		fsWatcher:  fw,
		debounceMs: 300,
		stopCh:     make(chan struct{}),
	}, nil
}

// Start 启动文件监听（非阻塞，在 goroutine 中运行）。
func (w *Watcher) Start() error {
	// Recursively watch all subdirectories
	if err := filepath.WalkDir(w.dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil || !d.IsDir() {
			return err
		}
		return w.fsWatcher.Add(path)
	}); err != nil {
		return err
	}

	go w.watch()
	log.Printf("[i18n] watching %s for changes (debounce=%dms)...", w.dir, w.debounceMs)
	return nil
}

func (w *Watcher) watch() {
	// 使用防抖定时器：300ms 内多次变更只触发一次重载
	var timer *time.Timer

	for {
		select {
		case <-w.stopCh:
			if timer != nil {
				timer.Stop()
			}
			return

		case event, ok := <-w.fsWatcher.Events:
			if !ok {
				return
			}
			if filepath.Ext(event.Name) == ".json" {
				if timer != nil {
					timer.Stop()
				}
				timer = time.AfterFunc(time.Duration(w.debounceMs)*time.Millisecond, func() {
					log.Println("[i18n] detected changes, reloading...")
					if err := w.manager.Reload(); err != nil {
						log.Printf("[i18n] reload error: %v", err)
					} else {
						log.Printf("[i18n] reloaded successfully, langs: %v", w.manager.SupportedLangs())
					}
				})
			}

		case err, ok := <-w.fsWatcher.Errors:
			if !ok {
				return
			}
			log.Printf("[i18n] watcher error: %v", err)
		}
	}
}

// Close 停止监听并释放资源。可安全多次调用。
func (w *Watcher) Close() error {
	var fsErr error
	w.closeOnce.Do(func() {
		close(w.stopCh)
		fsErr = w.fsWatcher.Close()
	})
	return fsErr
}

