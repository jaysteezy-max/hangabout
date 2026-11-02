// Stands in for the Mac app's WebKit bridge and its Handle view, so web/pet.html runs here as it does there, unchanged.
const {contextBridge, ipcRenderer, webFrame} = require('electron')

// The page talks to the app through window.webkit.messageHandlers.hangabout, as it does in WKWebView.
contextBridge.exposeInMainWorld('webkit', {messageHandlers: {hangabout: {postMessage: body => ipcRenderer.send('hangabout', body)}}})
// Tells the page who to draw before it loads: tricks read his colors as they load, so a new skin means a reload.
contextBridge.exposeInMainWorld('hangaboutSkin', ipcRenderer.sendSync('skin'))

// Like the Mac's Handle view: the window only takes the mouse while it's over him or his bubble, and then every press, drag
// and release goes to the page's hangabout.pointer, never to its own buttons (which are for the browser mockup).
const pointer = (type, e) => webFrame.executeJavaScript(`hangabout.pointer('${type}',${Math.round(e.clientX)},${Math.round(e.clientY)})`)
const hold = e => { e.stopPropagation(); e.preventDefault() }
for (const type of ['pointerdown', 'pointermove', 'pointerup', 'click', 'dblclick']) addEventListener(type, e => e.stopPropagation(), true)
addEventListener('mousedown', e => {
  hold(e)
  if (e.button !== 0) return
  ipcRenderer.send('press', true)
  pointer('down', e)
  if (e.detail === 2) pointer('dbl', e)
}, true)
addEventListener('mousemove', e => { if (e.buttons & 1) { hold(e); pointer('move', e) } }, true)
addEventListener('mouseup', e => {
  hold(e)
  if (e.button !== 0) return
  ipcRenderer.send('press', false)
  pointer('up', e)
}, true)
addEventListener('contextmenu', e => { hold(e); ipcRenderer.send('menu') }, true)
