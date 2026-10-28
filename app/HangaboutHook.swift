// Claude Code hook: reads the event on stdin and records what each Claude session is doing in state.json next to it.
// Never prints and always exits 0, so it can never block or change a Claude Code action.
import Foundation

let dir = (Bundle.main.executableURL ?? URL(fileURLWithPath: CommandLine.arguments[0])).resolvingSymlinksInPath().deletingLastPathComponent() // the install folder
let stateURL = dir.appendingPathComponent("state.json")
let appPath = dir.appendingPathComponent("Hangabout.app").path
let editTools: Set<String> = ["Edit", "Write", "MultiEdit", "NotebookEdit"]
let forgetAfter: TimeInterval = 24 * 60 * 60

let errorText: [String: String] = [
    "rate_limit": "hit a usage limit", "overloaded": "the service is overloaded",
    "authentication_failed": "needs you to sign in again", "billing_error": "has a billing problem",
    "server_error": "hit a server error", "max_output_tokens": "ran out of room to answer",
]

func clip(_ text: String, _ max: Int) -> String {
    let line = text.split(whereSeparator: \.isNewline).first.map(String.init)?
        .trimmingCharacters(in: .whitespaces) ?? ""
    return line.count > max ? String(line.prefix(max - 1)) + "…" : line
}

func lineCount(_ text: Any?) -> Int {
    guard let text = text as? String, !text.isEmpty else { return 0 }
    return text.split(separator: "\n", omittingEmptySubsequences: false).count
}

/// A tool call the way Claude Code prints it: Update(page.mts), Bash(npm test), Search(pattern).
func display(_ tool: String, _ input: [String: Any]) -> String {
    func arg(_ key: String) -> String { input[key] as? String ?? "" }
    let file = ((input["file_path"] ?? input["notebook_path"]) as? String ?? "") as NSString
    switch tool {
    case "Edit", "MultiEdit", "NotebookEdit": return "Update(\(file.lastPathComponent))"
    case "Write": return "Write(\(file.lastPathComponent))"
    case "Read": return "Read(\(file.lastPathComponent))"
    case "Bash": return "Bash(\(clip(arg("command"), 40)))"
    case "Grep", "Glob": return "Search(\(clip(arg("pattern"), 40)))"
    case "WebFetch": return "Fetch(\(URL(string: arg("url"))?.host ?? clip(arg("url"), 40)))"
    case "WebSearch": return "Web Search(\(clip(arg("query"), 40)))"
    case "Task", "Agent": return "Task(\(clip(arg("description"), 40)))"
    default: return tool.components(separatedBy: "__").last ?? tool // mcp__server__tool → tool
    }
}

/// When you last interrupted the session, if that's the last thing in its transcript. Claude Code sends no hook for it.
// shortcut: reads only the last 256 KB; a bigger burst written after the interrupt hides it, and the page's 15-minute fallback takes over.
func interruptedAt(_ path: String) -> Double? {
    guard let file = FileHandle(forReadingAtPath: path) else { return nil }
    defer { try? file.close() }
    let end = file.seekToEndOfFile()
    file.seek(toFileOffset: end > 262_144 ? end - 262_144 : 0)
    for line in file.readDataToEndOfFile().split(separator: UInt8(ascii: "\n")).reversed() {
        guard let entry = try? JSONSerialization.jsonObject(with: line) as? [String: Any],
              ["user", "assistant"].contains(entry["type"] as? String ?? ""), entry["isSidechain"] as? Bool != true else { continue }
        let content = (entry["message"] as? [String: Any])?["content"] as? [[String: Any]] ?? []
        guard content.contains(where: { ($0["text"] ?? $0["content"]).map { ($0 as? String ?? "").hasPrefix("[Request interrupted by user") } == true }) else { return nil }
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return iso.date(from: entry["timestamp"] as? String ?? "")?.timeIntervalSince1970
    }
    return nil
}

/// Starts the pet in the background unless he's already up.
// shortcut: trusts the pid file; a stale one whose pid got reused would skip a launch until the pet next starts.
func launchPet() {
    if let pid = Int32((try? String(contentsOf: dir.appendingPathComponent("hangabout.pid"), encoding: .utf8)) ?? ""), kill(pid, 0) == 0 { return }
    let open = Process()
    open.executableURL = URL(fileURLWithPath: "/usr/bin/open")
    open.arguments = ["-g", appPath]
    try? open.run()
    open.waitUntilExit()
}

guard
    let event = try? JSONSerialization.jsonObject(with: FileHandle.standardInput.readDataToEndOfFile()) as? [String: Any],
    let name = event["hook_event_name"] as? String
else { exit(0) }

if name == "SessionStart" { launchPet() }

// Parallel tool calls fire hooks at once: hold a lock across the read-modify-write.
let lock = open(dir.appendingPathComponent(".state.lock").path, O_CREAT | O_RDWR, 0o600)
if lock >= 0 { flock(lock, LOCK_EX) }
defer { if lock >= 0 { close(lock) } }

let root = (try? JSONSerialization.jsonObject(with: Data(contentsOf: stateURL))) as? [String: Any] ?? [:]
var sessions = root["sessions"] as? [String: [String: Any]] ?? [:]
let id = event["session_id"] as? String ?? "default"
var state = sessions[id] ?? [:]
let tool = event["tool_name"] as? String ?? ""
let input = event["tool_input"] as? [String: Any] ?? [:]
let now = Date().timeIntervalSince1970
let call = display(tool, input)
let quiet = tool.hasSuffix("update_plan") || tool == "TodoWrite" || tool.hasPrefix("mcp__ccd_") // bookkeeping, not work worth showing

func set(_ mood: String, _ detail: String = "") {
    state["mood"] = mood
    state["detail"] = detail
    state["since"] = now
    if mood != "waiting" { state["waitingFor"] = nil }
}

func setStep(_ steps: [String], _ at: Int) {
    if steps.indices.contains(at), steps[at] != state["task"] as? String { state["stepAt"] = now }
    state["steps"] = steps
    state["at"] = at
    if steps.indices.contains(at) { state["task"] = steps[at] }
}

/// One finished tool call for the history he shows when you click him.
func logCall(ok: Bool, _ out: String) {
    guard !quiet else { return }
    var log = state["log"] as? [[String: Any]] ?? []
    log.append(["ok": ok, "call": call, "out": out])
    state["log"] = Array(log.suffix(8))
}

func save() {
    sessions = sessions.filter { now - ($0.value["ts"] as? Double ?? 0) < forgetAfter }
    if let data = try? JSONSerialization.data(withJSONObject: ["sessions": sessions]) {
        try? data.write(to: stateURL, options: .atomic)
    }
}

switch name {
case "SessionStart":
    if state["mood"] == nil { set("idle") }
case "UserPromptSubmit":
    set("thinking")
    state["task"] = clip(event["prompt"] as? String ?? "", 80)
    state["steps"] = [String]()
    state["at"] = -1
    state["call"] = ""
    state["turn"] = ["start": now, "files": 0, "cmds": 0]
    state["edited"] = [String]()
case "PreToolUse":
    if tool.hasSuffix("update_plan") {
        var steps = state["steps"] as? [String] ?? []
        var at = state["at"] as? Int ?? -1
        if let items = input["items"] as? [[String: Any]] {
            steps = items.map { $0["content"] as? String ?? "" }
            at = items.firstIndex { ($0["status"] as? String) == "in_progress" } ?? -1
        } else if input["advance"] as? Bool == true {
            at = at + 1 < steps.count ? at + 1 : -1
        } else if let start = input["start"] as? Int {
            at = start - 1
        }
        setStep(steps, at)
    } else if tool == "TodoWrite", let todos = input["todos"] as? [[String: Any]] {
        setStep(todos.map { $0["content"] as? String ?? "" }, todos.firstIndex { ($0["status"] as? String) == "in_progress" } ?? -1)
    } else if quiet {
        break
    } else if tool == "AskUserQuestion" {
        set("waiting", "question")
        let first = (input["questions"] as? [[String: Any]])?.first
        state["question"] = clip(first?["question"] as? String ?? "", 80)
    } else if tool == "ExitPlanMode" {
        set("waiting", "plan")
    } else {
        var turn = state["turn"] as? [String: Any] ?? ["start": now, "files": 0, "cmds": 0]
        state["call"] = call
        state["add"] = nil
        state["del"] = nil
        if editTools.contains(tool) {
            set("editing")
            let edits = input["edits"] as? [[String: Any]] ?? [input]
            state["add"] = tool == "Write" ? lineCount(input["content"]) : edits.reduce(0) { $0 + lineCount($1["new_string"]) }
            state["del"] = tool == "Write" ? 0 : edits.reduce(0) { $0 + lineCount($1["old_string"]) }
            var edited = state["edited"] as? [String] ?? []
            if !edited.contains(call) { edited.append(call) }
            state["edited"] = edited
            turn["files"] = edited.count
        } else if tool == "Bash" {
            set("running")
            turn["cmds"] = (turn["cmds"] as? Int ?? 0) + 1
        } else {
            set("thinking") // reading, searching, fetching: still thinking it over
        }
        state["turn"] = turn
    }
case "PostToolUse", "PostToolUseFailure":
    let ok = name == "PostToolUse", interrupted = event["is_interrupt"] as? Bool == true
    let secs = Int((event["duration_ms"] as? Double ?? 0) / 1000)
    let took = tool == "Bash" ? String(format: "%d:%02d", secs / 60, secs % 60) : ""
    let diff = editTools.contains(tool) && ok ? "+\(state["add"] ?? 0) −\(state["del"] ?? 0)" : ""
    logCall(ok: ok, interrupted ? "interrupted" : ok ? [took, diff].filter { !$0.isEmpty }.joined(separator: " · ") : [took, "failed"].filter { !$0.isEmpty }.joined(separator: " · "))
    // With calls in parallel, another one finishing mustn't hide the permission question still waiting on you.
    if let waitingFor = state["waitingFor"] as? String, waitingFor != call { break }
    if interrupted { set("idle", "interrupted") } else if !quiet { set("thinking") }
    if !quiet { state["call"] = "" }
case "PermissionRequest":
    set("waiting", "permission")
    state["call"] = call
    state["waitingFor"] = call
case "Notification":
    let kind = event["notification_type"] as? String ?? ""
    if kind == "permission_prompt" {
        if state["mood"] as? String != "waiting" { set("waiting", "permission") }
    } else if kind == "idle_prompt", ["thinking", "editing", "running"].contains(state["mood"] as? String ?? "") {
        set("idle", "interrupted") // a minute waiting on you while we thought he was busy: the turn was stopped
    } else {
        exit(0)
    }
case "Stop":
    set("done")
    state["call"] = ""
case "StopFailure":
    set("blocked", "Claude " + (errorText[event["error"] as? String ?? ""] ?? "hit an error"))
case "SessionEnd":
    sessions[id] = nil
    save()
    exit(0)
case "TranscriptChanged": // not Claude Code's: the app's nudge when a busy session's transcript changes with no hook
    guard ["thinking", "editing", "running", "waiting"].contains(state["mood"] as? String ?? ""), let path = state["transcript"] as? String,
          let at = interruptedAt(path), at > state["ts"] as? Double ?? now else { exit(0) } // an interrupt from before the last hook is an old turn's
    set("idle", "interrupted")
    state["call"] = ""
default:
    exit(0)
}

if let cwd = event["cwd"] as? String { state["project"] = (cwd as NSString).lastPathComponent }
if let path = event["transcript_path"] as? String { state["transcript"] = path }
state["ts"] = now
sessions[id] = state
save()
exit(0)
