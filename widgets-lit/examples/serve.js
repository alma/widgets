#!/usr/bin/env node

/**
 * Simple HTTP server for testing examples with the built widget
 * Run from project root: node examples/serve.js
 */

import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { exec } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = Number(process.env.PORT || 1803)
const ROOT = join(__dirname, '..') // Project root

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.map': 'application/json',
}

const DEFAULT_PAGE = process.env.DEFAULT_PAGE || '/examples/basic.html'
const DIST_FILE_PATH = join(ROOT, 'dist', 'alma-widgets.umd.js')

const server = createServer(async (req, res) => {
  try {
    // Dev-only health endpoint used by the auto-reload script.
    // Returns the current mtime of the built bundle.
    if (req.url && req.url.startsWith('/__health')) {
      try {
        const { stat } = await import('fs/promises')
        const distStat = await stat(DIST_FILE_PATH)

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        })
        res.end(JSON.stringify({ mtimeMs: distStat.mtimeMs }))
        return
      } catch {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        })
        res.end(JSON.stringify({ mtimeMs: 0 }))
        return
      }
    }

    let filePath = req.url === '/' ? DEFAULT_PAGE : req.url

    // Remove query string for file lookup
    const cleanPath = filePath.split('?')[0]

    const fullPath = join(ROOT, cleanPath)
    const ext = extname(cleanPath)
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

    let content = await readFile(fullPath)

    // Inject auto-reload script for HTML files in watch mode
    if (ext === '.html' && process.env.WATCH_MODE === 'true') {
      const reloadScript = `
        <script>
          // DEV MODE: Auto-reload on bundle rebuilds
          // ⚠️ NOT present in production builds - only for local development
          const MARK = '[alma-widgets-lit-dev]';
          let lastMtime = 0;

          async function poll() {
            try {
              const res = await fetch('/__health', { cache: 'no-store' });
              const json = await res.json();
              const mtime = Number(json && json.mtimeMs) || 0;

              if (lastMtime === 0) {
                lastMtime = mtime;
              } else if (mtime > lastMtime) {
                console.log('%c' + MARK + ' Bundle changed, reloading…', 'color: #fa5022; font-weight: bold');
                location.reload();
              }
            } catch {
              // Ignore errors
            } finally {
              setTimeout(poll, 1000);
            }
          }

          poll();
        </script>
      `
      content = content.toString().replace('</body>', reloadScript + '</body>')
    }

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache',
    })
    res.end(content)

    // Only log important requests (not polling, not assets)
    const isPolling = (req.url && req.url.startsWith('/__health')) || req.url.includes('?t=')
    const isAsset =
      ext === '.jpeg' || ext === '.jpg' || ext === '.png' || ext === '.svg' || ext === '.map'

    if (!isPolling && !isAsset) {
      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      console.log(`[${timestamp}] ✓ ${cleanPath}`)
    }
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 Not Found')

    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    console.log(`[${timestamp}] ✗ ${req.url} - 404`)
  }
})

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`\n[serve] Port ${PORT} is already in use.`)
    console.error(`[serve] Either stop the process using it, or run with a different port:`)
    console.error(`        PORT=3001 node examples/serve.js`)
    process.exit(1)
  }

  throw err
})

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`
  const isWatchMode = process.env.WATCH_MODE === 'true'

  console.log(`\n${'='.repeat(60)}`)
  console.log(`  🚀 Alma Widgets Dev Server`)
  console.log(`${'='.repeat(60)}`)
  console.log(`\n  ➜  Local:   ${url}/`)

  if (isWatchMode) {
    console.log(`  🔄 Mode:    DEVELOPMENT (auto-reload enabled)`)
    console.log(`  👁️  Watching for file changes...`)
  } else {
    console.log(`  📦 Mode:    PRODUCTION SIMULATION`)
    console.log(`  ℹ️  No auto-reload - simulates real CDN behavior`)
  }

  console.log(`\n  📄 Examples:`)
  console.log(`     ${url}/examples/basic.html`)
  console.log(`     ${url}/examples/multiple.html`)
  console.log(`     ${url}/examples/customized.html`)
  console.log(`     ${url}/examples/playground.html`)

  if (isWatchMode) {
    console.log(`\n  💡 Dev Mode Info:`)
    console.log(`     • Files rebuild automatically on save`)
    console.log(`     • Browser reloads when build completes`)
    console.log(`     • Auto-reload checks /__health every second (dev only)`)
  } else {
    console.log(`\n  💡 Production Mode Info:`)
    console.log(`     • No auto-reload`)
    console.log(`     • Single bundle load per page`)
    console.log(`     • Simulates real CDN behavior`)
  }

  console.log(`\n${'='.repeat(60)}\n`)

  // Auto-open browser only if not in CI and not already open
  if (!process.env.CI && isWatchMode) {
    const openCommand =
      process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'

    exec(`${openCommand} ${url}${DEFAULT_PAGE}`)
  }
})
