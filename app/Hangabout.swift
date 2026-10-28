// Hangabout: a desktop pet for Claude Code. A transparent layer over your whole main screen that Clawd lives on.
// Clicks pass straight through it everywhere except Clawd himself and his open bubble.
// He shows what Claude Code is doing from state.json next to this app, which hangabout-hook keeps from Claude Code's hooks.
import Cocoa
import WebKit

let dir = Bundle.main.bundleURL.deletingLastPathComponent() // the install folder: Hangabout.app, hangabout-hook and their state live together
let stateURL = dir.appendingPathComponent("state.json")
let pidURL = dir.appendingPathComponent("hangabout.pid")
let presets = [("calm", "Calm"), ("normal", "Normal"), ("erratic", "Erratic")]

/// Catches the mouse while it's over Clawd (the window ignores it everywhere else) and hands it to the page.
final class Handle: NSView {
    var send: (String) -> Void = { _ in }
    var makeMenu: () -> NSMenu = { NSMenu() }
    override var isFlipped: Bool { true } // top-left origin, like the page
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
    private func at(_ e: NSEvent) -> String {
        let p = convert(e.locationInWindow, from: nil)
        return "\(Int(p.x)),\(Int(p.y))"
    }
    override func mouseDown(with e: NSEvent) {
        send("hangabout.pointer('down',\(at(e)))")
        if e.clickCount == 2 { send("hangabout.pointer('dbl',\(at(e)))") }
    }
    override func mouseDragged(with e: NSEvent) { send("hangabout.pointer('move',\(at(e)))") }
    override func mouseUp(with e: NSEvent) { send("hangabout.pointer('up',\(at(e)))") }
    override func rightMouseDown(with e: NSEvent) { NSMenu.popUpContextMenu(makeMenu(), with: e, for: self) }
}

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKScriptMessageHandler {
    var panel: NSPanel!
    var web: WKWebView!
    /// Where Clawd and his open bubble are, in page coordinates (top-left origin).
    var hitRects: [NSRect] = []
    var holding = false
    var lastCursor = NSPoint(x: -1, y: -1), cursorWasNear = false, lastTops = "", lastState: Date?
    /// Each busy session's transcript as of the last time hangabout-hook looked at it.
    var checked: [String: Date] = [:]
    /// Whether you've left your Mac alone for five minutes or more (no mouse or keys).
    var away = false
    let sizeLabel = NSTextField(labelWithString: "")
    let prefs = UserDefaults.standard
    /// The tricks the page has, for the menu: (name, label, fan pack).
    var tricks: [(String, String, Bool)] = []

    func applicationDidFinishLaunching(_ note: Notification) {
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        try? "\(getpid())".write(to: pidURL, atomically: true, encoding: .utf8) // tells hangabout-hook he's already running

        panel = NSPanel(contentRect: .zero, styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
        panel.level = .statusBar // above every app window, below menus
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
        panel.hidesOnDeactivate = false
        panel.backgroundColor = .clear
        panel.isOpaque = false
        panel.hasShadow = false
        panel.ignoresMouseEvents = true

        let config = WKWebViewConfiguration()
        config.userContentController.add(self, name: "hangabout")
        config.mediaTypesRequiringUserActionForPlayback = [] // the chirp plays without a click on the page
        web = WKWebView(frame: .zero, configuration: config)
        web.setValue(false, forKey: "drawsBackground")
        web.navigationDelegate = self
        let handle = Handle()
        handle.send = { [weak self] js in self?.web.evaluateJavaScript(js) }
        handle.makeMenu = { [weak self] in self?.menu() ?? NSMenu() }
        let root = NSView()
        for view in [web!, handle] as [NSView] {
            view.autoresizingMask = [.width, .height]
            root.addSubview(view)
        }
        panel.contentView = root
        fitScreen()
        if let page = Bundle.main.url(forResource: "pet", withExtension: "html", subdirectory: "web") {
            web.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent())
        }
        panel.orderFrontRegardless()

        NotificationCenter.default.addObserver(forName: NSApplication.didChangeScreenParametersNotification, object: nil, queue: .main) { [weak self] _ in self?.fitScreen() }
        NSEvent.addGlobalMonitorForEvents(matching: .leftMouseDown) { [weak self] _ in self?.clickedElsewhere() }
        Timer.scheduledTimer(withTimeInterval: 1.0 / 30, repeats: true) { [weak self] _ in self?.trackPointer() }
        Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in self?.sendWindows() }
        Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { [weak self] _ in self?.sendState() }
        Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in self?.checkTranscripts(); self?.checkAway() }
    }

    func applicationWillTerminate(_ note: Notification) { try? FileManager.default.removeItem(at: pidURL) }

    /// He lives on the main display (the one with the menu bar), over everything on it.
    // shortcut: one display only; spanning several needs a window per screen.
    func fitScreen() {
        guard let screen = NSScreen.screens.first else { return }
        panel.setFrame(screen.frame, display: true)
        for view in panel.contentView?.subviews ?? [] { view.frame = panel.contentView!.bounds }
        let top = screen.frame.maxY - screen.visibleFrame.maxY, bottom = screen.visibleFrame.minY - screen.frame.minY
        web.evaluateJavaScript("hangabout.screen(\(Int(top)),\(Int(bottom)))")
    }

    /// Takes the mouse only while it's over Clawd or his open bubble; everywhere else clicks go straight through.
    func trackPointer() {
        let mouse = NSEvent.mouseLocation, frame = panel.frame
        let point = NSPoint(x: mouse.x - frame.minX, y: frame.maxY - mouse.y)
        // His eyes only follow a cursor that's near him, so a far one isn't worth a message (one last one lets him look away).
        let near = hitRects.first.map { hypot(point.x - $0.midX, point.y - $0.midY) < 500 } ?? true
        if point != lastCursor, near || cursorWasNear {
            lastCursor = point
            web.evaluateJavaScript("hangabout.cursor(\(Int(point.x)),\(Int(point.y)))")
        }
        cursorWasNear = near
        let over = hitRects.contains { $0.contains(point) }
        let take = over || (holding && NSEvent.pressedMouseButtons != 0) // keeps him while you drag him around
        guard take != holding else { return }
        holding = take
        panel.ignoresMouseEvents = !take
        web.evaluateJavaScript("hangabout.hover(\(take))")
    }

    func clickedElsewhere() {
        let mouse = NSEvent.mouseLocation, frame = panel.frame
        web.evaluateJavaScript("hangabout.click(\(Int(mouse.x - frame.minX)),\(Int(frame.maxY - mouse.y)))")
    }

    /// The top edges of your windows that aren't hidden behind a window in front, for him to walk on, with each window's size (for webs to stick to).
    func sendWindows(force: Bool = false) {
        guard let list = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] else { return }
        let width = panel.frame.width, height = panel.frame.height, me = getpid()
        var inFront: [CGRect] = [], tops: [String] = []
        for window in list { // front to back
            guard (window[kCGWindowLayer as String] as? Int) == 0, (window[kCGWindowOwnerPID as String] as? pid_t) != me,
                  (window[kCGWindowAlpha as String] as? Double ?? 1) > 0.1,
                  let bounds = window[kCGWindowBounds as String] as? NSDictionary,
                  let r = CGRect(dictionaryRepresentation: bounds) else { continue }
            defer { inFront.append(r) }
            guard r.width >= 160, r.height >= 60, r.minY > 0, r.minY < height else { continue }
            var spans = [(max(0, r.minX), min(width, r.maxX))]
            for c in inFront where c.minY <= r.minY && c.maxY > r.minY {
                spans = spans.flatMap { s in [(s.0, min(s.1, c.minX)), (max(s.0, c.maxX), s.1)].filter { $0.1 > $0.0 } }
            }
            let id = window[kCGWindowNumber as String] as? Int ?? 0
            for s in spans where s.1 - s.0 >= 100 {
                tops.append("{\"id\":\(id),\"y\":\(Int(r.minY)),\"x0\":\(Int(s.0)),\"x1\":\(Int(s.1)),\"wx\":\(Int(r.minX)),\"w\":\(Int(r.width)),\"h\":\(Int(r.height))}")
            }
        }
        let json = "[\(tops.joined(separator: ","))]"
        guard force || json != lastTops else { return }
        lastTops = json
        web.evaluateJavaScript("hangabout.windows(\(json))")
    }

    func sendState(force: Bool = false) {
        let stamp = (try? FileManager.default.attributesOfItem(atPath: stateURL.path))?[.modificationDate] as? Date
        guard force || stamp != lastState, let data = try? Data(contentsOf: stateURL),
              let json = String(data: data, encoding: .utf8) else { return }
        lastState = stamp
        web.evaluateJavaScript("hangabout.claude(\(json))")
    }

    /// Back at your Mac after five minutes or more away: he says hello. The page only hears about the mouse near him, so the app watches.
    func checkAway() {
        let idle = CGEventSource.secondsSinceLastEventType(.combinedSessionState, eventType: CGEventType(rawValue: ~0)!) // ~0: any input
        if idle >= 300 && !away { away = true; web.evaluateJavaScript("hangabout.left()") }
        else if away && idle < 2 { away = false; web.evaluateJavaScript("hangabout.back()") }
    }

    /// Claude Code sends no hook when you interrupt it, only writes it into the transcript. So when a busy session's
    /// transcript changes after its last hook, hangabout-hook gets a look (it stops him if that change was an interrupt).
    func checkTranscripts() {
        guard let data = try? Data(contentsOf: stateURL),
              let sessions = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["sessions"] as? [String: [String: Any]] else { return }
        for (id, s) in sessions where ["thinking", "editing", "running", "waiting"].contains(s["mood"] as? String ?? "") {
            guard let path = s["transcript"] as? String,
                  let changed = (try? FileManager.default.attributesOfItem(atPath: path))?[.modificationDate] as? Date,
                  changed.timeIntervalSince1970 > s["ts"] as? Double ?? 0, changed != checked[id] else { continue }
            checked[id] = changed
            let hook = Process(), input = Pipe(), event = try! JSONSerialization.data(withJSONObject: ["hook_event_name": "TranscriptChanged", "session_id": id])
            hook.executableURL = dir.appendingPathComponent("hangabout-hook")
            hook.standardInput = input
            guard (try? hook.run()) != nil else { continue }
            input.fileHandleForWriting.write(event)
            try? input.fileHandleForWriting.close()
        }
    }

    var scale: Double { prefs.object(forKey: "scale") as? Double ?? 1 }
    var preset: String { prefs.string(forKey: "preset").flatMap { p in presets.contains { $0.0 == p } ? p : nil } ?? "normal" }

    func sendSettings() {
        web.evaluateJavaScript("hangabout.settings({sound: \(prefs.bool(forKey: "sound")), reduced: \(prefs.bool(forKey: "reduced")), scale: \(scale), preset: '\(preset)', fan: \(prefs.bool(forKey: "fan"))})")
    }

    /// A Size slider for the menu. Its stops are sixths: at those, each of his art pixels covers whole screen pixels, so he stays crisp.
    func sizeItem() -> NSMenuItem {
        let view = NSView(frame: NSRect(x: 0, y: 0, width: 230, height: 46))
        sizeLabel.frame = NSRect(x: 21, y: 26, width: 190, height: 16)
        sizeLabel.stringValue = "Size  \(Int((scale * 100).rounded()))%"
        let slider = NSSlider(value: scale, minValue: 0.5, maxValue: 2.5, target: self, action: #selector(resize(_:)))
        slider.frame = NSRect(x: 19, y: 4, width: 192, height: 20)
        slider.numberOfTickMarks = 13
        slider.allowsTickMarkValuesOnly = true
        slider.isContinuous = true
        view.addSubview(sizeLabel)
        view.addSubview(slider)
        let item = NSMenuItem()
        item.view = view
        return item
    }

    @objc func resize(_ slider: NSSlider) {
        prefs.set(slider.doubleValue, forKey: "scale")
        sizeLabel.stringValue = "Size  \(Int((slider.doubleValue * 100).rounded()))%"
        sendSettings()
    }

    func menu() -> NSMenu {
        let menu = NSMenu()
        let tricksMenu = NSMenu()
        let fan = prefs.bool(forKey: "fan")
        for (name, title, fanMade) in tricks where !fanMade || fan {
            if fanMade && !tricksMenu.items.contains(where: { $0.isSeparatorItem }) { tricksMenu.addItem(.separator()) } // fan pack below the core ones
            let item = tricksMenu.addItem(withTitle: title, action: #selector(trick(_:)), keyEquivalent: "")
            item.target = self
            item.representedObject = name
        }
        menu.addItem(withTitle: "Tricks", action: nil, keyEquivalent: "").submenu = tricksMenu
        let behavior = NSMenu()
        for (key, title) in presets {
            let item = behavior.addItem(withTitle: title, action: #selector(choosePreset(_:)), keyEquivalent: "")
            item.target = self
            item.representedObject = key
            item.state = key == preset ? .on : .off
        }
        menu.addItem(withTitle: "Behavior", action: nil, keyEquivalent: "").submenu = behavior
        menu.addItem(.separator())
        menu.addItem(sizeItem())
        menu.addItem(.separator())
        for (key, title) in [("sound", "Chirp when Claude needs you"), ("reduced", "Reduce motion"), ("fan", "Fan pack (fan-made tricks)")] {
            let item = menu.addItem(withTitle: title, action: #selector(toggle(_:)), keyEquivalent: "")
            item.target = self
            item.representedObject = key
            item.state = prefs.bool(forKey: key) ? .on : .off
        }
        menu.addItem(.separator())
        menu.addItem(withTitle: "Hangabout: unofficial, not affiliated with Anthropic", action: nil, keyEquivalent: "").isEnabled = false
        menu.addItem(withTitle: "Quit Hangabout", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "")
        return menu
    }

    @objc func trick(_ item: NSMenuItem) { web.evaluateJavaScript("hangabout.perform('\(item.representedObject as? String ?? "")')") }

    @objc func choosePreset(_ item: NSMenuItem) {
        prefs.set(item.representedObject as? String, forKey: "preset")
        sendSettings()
    }

    @objc func toggle(_ item: NSMenuItem) {
        guard let key = item.representedObject as? String else { return }
        prefs.set(!prefs.bool(forKey: key), forKey: key)
        sendSettings()
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        fitScreen()
        sendSettings()
        sendWindows(force: true)
        sendState(force: true)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) { webView.reload() }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        if let list = (message.body as? [String: Any])?["tricks"] as? [[String: Any]] {
            tricks = list.compactMap { t in (t["name"] as? String).map { ($0, t["label"] as? String ?? $0, t["fan"] as? Bool ?? false) } }
            return
        }
        guard let rects = message.body as? [[Double]] else { return }
        hitRects = rects.filter { $0.count == 4 }.map { NSRect(x: $0[0], y: $0[1], width: $0[2], height: $0[3]) }
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
