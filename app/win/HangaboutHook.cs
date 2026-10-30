// Claude Code hook on Windows: reads the event on stdin and records what each Claude session is doing in state.json next to it.
// A port of app/HangaboutHook.swift (scripts/test_hook.py runs the same checks on both), in C# 5 for the compiler every Windows has.
// Never prints and always exits 0, so it can never block or change a Claude Code action.
using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

static class HangaboutHook {
    static readonly string dir = AppDomain.CurrentDomain.BaseDirectory; // the install folder
    static readonly string statePath = Path.Combine(dir, "state.json");
    static readonly string petPath = Path.Combine(dir, "Hangabout", "Hangabout.exe");
    static readonly HashSet<string> editTools = new HashSet<string> { "Edit", "Write", "MultiEdit", "NotebookEdit" };
    static readonly HashSet<string> shellTools = new HashSet<string> { "Bash", "PowerShell" }; // Windows without Git Bash has PowerShell instead of Bash
    const double forgetAfter = 24 * 60 * 60;
    static readonly DateTime epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
    static readonly JavaScriptSerializer json = new JavaScriptSerializer { MaxJsonLength = int.MaxValue };

    static readonly Dictionary<string, string> errorText = new Dictionary<string, string> {
        { "rate_limit", "hit a usage limit" }, { "overloaded", "the service is overloaded" },
        { "authentication_failed", "needs you to sign in again" }, { "billing_error", "has a billing problem" },
        { "server_error", "hit a server error" }, { "max_output_tokens", "ran out of room to answer" },
    };

    static Dictionary<string, object> state;
    static double now;
    static string call;
    static bool quiet;
    static FileStream heldLock; // kept in a field so it stays held until the process exits

    // JSON as JavaScriptSerializer hands it back: objects are dictionaries, arrays are lists, numbers are int or decimal.
    static object G(Dictionary<string, object> d, string key) { object v; return d != null && d.TryGetValue(key, out v) ? v : null; }
    static Dictionary<string, object> Obj(object o) { return o as Dictionary<string, object>; }
    static string Str(object o) { return o as string; }
    static bool True(object o) { return o is bool && (bool)o; }
    static IEnumerable<object> Arr(object o) { var list = o as IList; return list == null ? Enumerable.Empty<object>() : list.Cast<object>(); }
    static List<string> Strings(object o) { return Arr(o).Select(s => Str(s) ?? "").ToList(); }
    static double? Num(object o) { return o is int || o is long || o is decimal || o is double ? Convert.ToDouble(o) : (double?)null; }
    static int? Int(object o) {
        var d = Num(o);
        return d.HasValue && d.Value == Math.Floor(d.Value) && Math.Abs(d.Value) < int.MaxValue ? (int)d.Value : (int?)null;
    }

    static string Clip(string text, int max) {
        var line = (text ?? "").Split(new[] { '\n', '\r', '\v', '\f', (char)0x85, (char)0x2028, (char)0x2029 }, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        var info = new StringInfo(line == null ? "" : line.Trim());
        return info.LengthInTextElements > max ? info.SubstringByTextElements(0, max - 1) + "…" : info.String;
    }

    static int LineCount(object text) {
        var s = text as string;
        return string.IsNullOrEmpty(s) ? 0 : s.Count(c => c == '\n') + 1;
    }

    /// The last part of a path, Windows or POSIX style, without Path.GetFileName's throw on odd characters.
    static string FileName(string path) { return (path ?? "").Split('/', '\\').LastOrDefault(p => p.Length > 0) ?? ""; }

    /// A tool call the way Claude Code prints it: Update(page.mts), Bash(npm test), Search(pattern).
    static string Display(string tool, Dictionary<string, object> input) {
        Func<string, string> arg = key => Str(G(input, key)) ?? "";
        var file = FileName(Str(G(input, "file_path") ?? G(input, "notebook_path")));
        switch (tool) {
            case "Edit": case "MultiEdit": case "NotebookEdit": return "Update(" + file + ")";
            case "Write": return "Write(" + file + ")";
            case "Read": return "Read(" + file + ")";
            case "Bash": case "PowerShell": return tool + "(" + Clip(arg("command"), 40) + ")";
            case "Grep": case "Glob": return "Search(" + Clip(arg("pattern"), 40) + ")";
            case "WebFetch": {
                Uri url;
                return "Fetch(" + (Uri.TryCreate(arg("url"), UriKind.Absolute, out url) && url.Host != "" ? url.Host : Clip(arg("url"), 40)) + ")";
            }
            case "WebSearch": return "Web Search(" + Clip(arg("query"), 40) + ")";
            case "Task": case "Agent": return "Task(" + Clip(arg("description"), 40) + ")";
            default: return tool.Split(new[] { "__" }, StringSplitOptions.None).Last(); // mcp__server__tool → tool
        }
    }

    /// When you last interrupted the session, if that's the last thing in its transcript. Claude Code sends no hook for it.
    // shortcut: reads only the last 256 KB; a bigger burst written after the interrupt hides it, and the page's 15-minute fallback takes over.
    static double? InterruptedAt(string path) {
        byte[] tail;
        try {
            using (var file = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete)) {
                var start = Math.Max(0, file.Length - 262144);
                file.Seek(start, SeekOrigin.Begin);
                tail = new byte[file.Length - start];
                for (int read = 0, n; read < tail.Length && (n = file.Read(tail, read, tail.Length - read)) > 0; read += n) { }
            }
        } catch (Exception) { return null; }
        var lines = Encoding.UTF8.GetString(tail).Split('\n');
        for (var i = lines.Length - 1; i >= 0; i--) {
            Dictionary<string, object> entry;
            try { entry = Obj(json.DeserializeObject(lines[i])); } catch (Exception) { continue; }
            var type = Str(G(entry, "type"));
            if (entry == null || (type != "user" && type != "assistant") || True(G(entry, "isSidechain"))) continue;
            var said = Arr(G(Obj(G(entry, "message")), "content")).Select(Obj)
                .Any(item => (Str(G(item, "text") ?? G(item, "content")) ?? "").StartsWith("[Request interrupted by user", StringComparison.Ordinal));
            if (!said) return null;
            DateTime at;
            return DateTime.TryParse(Str(G(entry, "timestamp")), CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal, out at)
                ? (at - epoch).TotalSeconds : (double?)null;
        }
        return null;
    }

    /// Starts the pet unless he's already up. Started through the shell, so he doesn't inherit Claude Code's pipes and keep this hook open.
    static void LaunchPet() {
        try {
            var pid = int.Parse(File.ReadAllText(Path.Combine(dir, "hangabout.pid")).Trim());
            if (string.Equals(Process.GetProcessById(pid).ProcessName, "Hangabout", StringComparison.OrdinalIgnoreCase)) return;
        } catch (Exception) { } // no pid file, or that process is gone (or is something else now)
        try { if (File.Exists(petPath)) Process.Start(new ProcessStartInfo(petPath) { UseShellExecute = true }); } catch (Exception) { }
    }

    /// Parallel tool calls fire hooks at once: an exclusive open of the lock file is held across the read-modify-write.
    // shortcut: gives up waiting after 2 s and goes ahead unlocked, as the Mac hook does when it can't open its lock.
    static FileStream Lock() {
        for (var i = 0; i < 200; i++) {
            try { return new FileStream(Path.Combine(dir, ".state.lock"), FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None); }
            catch (IOException) { Thread.Sleep(10); }
        }
        return null;
    }

    static void Set(string mood, string detail = "") {
        state["mood"] = mood;
        state["detail"] = detail;
        state["since"] = now;
        if (mood != "waiting") state.Remove("waitingFor");
    }

    static void SetStep(List<string> steps, int at) {
        var valid = at >= 0 && at < steps.Count;
        if (valid && steps[at] != Str(G(state, "task"))) state["stepAt"] = now;
        state["steps"] = steps;
        state["at"] = at;
        if (valid) state["task"] = steps[at];
    }

    /// One finished tool call for the history he shows when you click him.
    static void LogCall(bool ok, string output) {
        if (quiet) return;
        var log = Arr(G(state, "log")).ToList();
        log.Add(new Dictionary<string, object> { { "ok", ok }, { "call", call }, { "out", output } });
        state["log"] = log.Skip(Math.Max(0, log.Count - 8)).ToList();
    }

    static Dictionary<string, object> NewTurn() { return new Dictionary<string, object> { { "start", now }, { "files", 0 }, { "cmds", 0 } }; }

    static bool Busy() { return new[] { "thinking", "editing", "running", "waiting" }.Contains(Str(G(state, "mood"))); }

    static void Save(Dictionary<string, object> sessions) {
        var kept = sessions.Where(s => now - (Num(G(Obj(s.Value), "ts")) ?? 0) < forgetAfter).ToDictionary(s => s.Key, s => s.Value);
        var tmp = statePath + "." + Process.GetCurrentProcess().Id + ".tmp";
        File.WriteAllText(tmp, json.Serialize(new Dictionary<string, object> { { "sessions", kept } }), new UTF8Encoding(false));
        try {
            if (File.Exists(statePath)) File.Replace(tmp, statePath, null); else File.Move(tmp, statePath);
        } catch (Exception) {
            File.Copy(tmp, statePath, true); // something had it open without letting go: not atomic, but not lost
        } finally {
            File.Delete(tmp);
        }
    }

    static void Main() {
        try { Run(); } catch (Exception) { } // whatever goes wrong, Claude Code just sees a quiet exit 0
    }

    static void Run() {
        string text;
        using (var stdin = Console.OpenStandardInput())
        using (var buffer = new MemoryStream()) {
            stdin.CopyTo(buffer);
            text = Encoding.UTF8.GetString(buffer.ToArray());
        }
        var ev = Obj(json.DeserializeObject(text));
        var name = Str(G(ev, "hook_event_name"));
        if (name == null) return;

        if (name == "SessionStart") LaunchPet();
        heldLock = Lock();

        Dictionary<string, object> root = null;
        try { root = Obj(json.DeserializeObject(File.ReadAllText(statePath))); } catch (Exception) { }
        var sessions = Obj(G(root, "sessions")) ?? new Dictionary<string, object>();
        var id = Str(G(ev, "session_id")) ?? "default";
        state = Obj(G(sessions, id)) ?? new Dictionary<string, object>();
        var tool = Str(G(ev, "tool_name")) ?? "";
        var input = Obj(G(ev, "tool_input")) ?? new Dictionary<string, object>();
        now = (DateTime.UtcNow - epoch).TotalSeconds;
        call = Display(tool, input);
        quiet = tool.EndsWith("update_plan") || tool == "TodoWrite" || tool.StartsWith("mcp__ccd_"); // bookkeeping, not work worth showing

        switch (name) {
            case "SessionStart":
                if (G(state, "mood") == null) Set("idle");
                break;
            case "UserPromptSubmit":
                Set("thinking");
                state["task"] = Clip(Str(G(ev, "prompt")), 80);
                state["steps"] = new List<string>();
                state["at"] = -1;
                state["call"] = "";
                state["turn"] = NewTurn();
                state["edited"] = new List<string>();
                break;
            case "PreToolUse": {
                if (tool.EndsWith("update_plan")) {
                    var steps = Strings(G(state, "steps"));
                    var at = Int(G(state, "at")) ?? -1;
                    if (G(input, "items") is IList) {
                        var items = Arr(G(input, "items")).Select(Obj).ToList();
                        steps = items.Select(i => Str(G(i, "content")) ?? "").ToList();
                        at = items.FindIndex(i => Str(G(i, "status")) == "in_progress");
                    } else if (True(G(input, "advance"))) {
                        at = at + 1 < steps.Count ? at + 1 : -1;
                    } else if (Int(G(input, "start")).HasValue) {
                        at = Int(G(input, "start")).Value - 1;
                    }
                    SetStep(steps, at);
                } else if (tool == "TodoWrite" && G(input, "todos") is IList) {
                    var todos = Arr(G(input, "todos")).Select(Obj).ToList();
                    SetStep(todos.Select(t => Str(G(t, "content")) ?? "").ToList(), todos.FindIndex(t => Str(G(t, "status")) == "in_progress"));
                } else if (quiet) {
                    break;
                } else if (tool == "AskUserQuestion") {
                    Set("waiting", "question");
                    state["question"] = Clip(Str(G(Arr(G(input, "questions")).Select(Obj).FirstOrDefault(), "question")), 80);
                } else if (tool == "ExitPlanMode") {
                    Set("waiting", "plan");
                } else {
                    var turn = Obj(G(state, "turn")) ?? NewTurn();
                    state["call"] = call;
                    state.Remove("add");
                    state.Remove("del");
                    if (editTools.Contains(tool)) {
                        Set("editing");
                        var edits = G(input, "edits") is IList ? Arr(G(input, "edits")).Select(Obj).ToList() : new List<Dictionary<string, object>> { input };
                        state["add"] = tool == "Write" ? LineCount(G(input, "content")) : edits.Sum(e => LineCount(G(e, "new_string")));
                        state["del"] = tool == "Write" ? 0 : edits.Sum(e => LineCount(G(e, "old_string")));
                        var edited = Strings(G(state, "edited"));
                        if (!edited.Contains(call)) edited.Add(call);
                        state["edited"] = edited;
                        turn["files"] = edited.Count;
                    } else if (shellTools.Contains(tool)) {
                        Set("running");
                        turn["cmds"] = (Int(G(turn, "cmds")) ?? 0) + 1;
                    } else {
                        Set("thinking"); // reading, searching, fetching: still thinking it over
                    }
                    state["turn"] = turn;
                }
                break;
            }
            case "PostToolUse": case "PostToolUseFailure": {
                bool ok = name == "PostToolUse", interrupted = True(G(ev, "is_interrupt"));
                var secs = (int)((Num(G(ev, "duration_ms")) ?? 0) / 1000);
                var took = shellTools.Contains(tool) ? string.Format("{0}:{1:00}", secs / 60, secs % 60) : "";
                var diff = editTools.Contains(tool) && ok ? "+" + (G(state, "add") ?? 0) + " −" + (G(state, "del") ?? 0) : "";
                LogCall(ok, interrupted ? "interrupted" : string.Join(" · ", (ok ? new[] { took, diff } : new[] { took, "failed" }).Where(s => s != "")));
                var turn = Obj(G(state, "turn"));
                if (!ok && !interrupted && !quiet && turn != null) turn["fails"] = (Int(G(turn, "fails")) ?? 0) + 1; // a turn with failures gets no celebration
                // With calls in parallel, another one finishing mustn't hide the permission question still waiting on you.
                var waitingFor = Str(G(state, "waitingFor"));
                if (waitingFor != null && waitingFor != call) break;
                if (interrupted) Set("idle", "interrupted"); else if (!quiet) Set("thinking");
                if (!quiet) state["call"] = "";
                break;
            }
            case "PermissionRequest":
                Set("waiting", "permission");
                state["call"] = call;
                state["waitingFor"] = call;
                break;
            case "Notification": {
                var kind = Str(G(ev, "notification_type"));
                var mood = Str(G(state, "mood"));
                if (kind == "permission_prompt") {
                    if (mood != "waiting") Set("waiting", "permission");
                } else if (kind == "idle_prompt" && (mood == "thinking" || mood == "editing" || mood == "running")) {
                    Set("idle", "interrupted"); // a minute waiting on you while we thought he was busy: the turn was stopped
                } else {
                    return;
                }
                break;
            }
            case "Stop":
                Set("done");
                state["call"] = "";
                break;
            case "StopFailure": {
                string why;
                Set("blocked", "Claude " + (errorText.TryGetValue(Str(G(ev, "error")) ?? "", out why) ? why : "hit an error"));
                break;
            }
            case "SessionEnd":
                sessions.Remove(id);
                Save(sessions);
                return;
            case "TranscriptChanged": { // not Claude Code's: the app's nudge when a busy session's transcript changes with no hook
                var path = Str(G(state, "transcript"));
                var at = Busy() && path != null ? InterruptedAt(path) : null;
                if (!at.HasValue || at.Value <= (Num(G(state, "ts")) ?? now)) return; // an interrupt from before the last hook is an old turn's
                Set("idle", "interrupted");
                state["call"] = "";
                break;
            }
            default:
                return;
        }

        var cwd = Str(G(ev, "cwd"));
        if (cwd != null) state["project"] = FileName(cwd);
        var transcript = Str(G(ev, "transcript_path"));
        if (transcript != null) state["transcript"] = transcript;
        state["ts"] = now;
        sessions[id] = state;
        Save(sessions);
    }
}
