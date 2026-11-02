// Hangabout's eyes on Windows: prints JSON lines for the app (app/win/main.js) to read. Each line is either the windows on
// screen, front to back, for him to walk on, or a press or release of the main mouse button, so he notices a click
// elsewhere. Run by the app with its process id; it stops when the app does.
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

static class WindowList {
    delegate bool EnumProc(IntPtr hwnd, IntPtr data);
    struct Rect { public int Left, Top, Right, Bottom; }
    struct Point { public int X, Y; }
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc proc, IntPtr data);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] static extern bool IsIconic(IntPtr hwnd);
    [DllImport("user32.dll")] static extern int GetWindowLong(IntPtr hwnd, int index);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassName(IntPtr hwnd, StringBuilder name, int max);
    [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd, out Rect rect);
    [DllImport("user32.dll")] static extern short GetAsyncKeyState(int key);
    [DllImport("user32.dll")] static extern int GetSystemMetrics(int index);
    [DllImport("user32.dll")] static extern bool GetCursorPos(out Point point);
    [DllImport("user32.dll")] static extern bool SetProcessDpiAwarenessContext(IntPtr context);
    [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr hwnd, int attribute, out Rect value, int size);
    [DllImport("dwmapi.dll")] static extern int DwmGetWindowAttribute(IntPtr hwnd, int attribute, out int value, int size);

    const int ExStyle = -20, ClickThrough = 0x20, ToolWindow = 0x80, FrameBounds = 9, Cloaked = 14, SwapButton = 23, LeftButton = 1, RightButton = 2;
    static readonly HashSet<string> shell = new HashSet<string> { "Progman", "WorkerW", "Shell_TrayWnd", "Shell_SecondaryTrayWnd" }; // the desktop and taskbar

    /// The windows you can see, front to back, as [id, x, y, width, height] in screen pixels.
    static string Windows(uint app) {
        var found = new List<string>();
        var name = new StringBuilder(64);
        EnumWindows((hwnd, _) => {
            uint pid;
            GetWindowThreadProcessId(hwnd, out pid);
            int cloaked, style = GetWindowLong(hwnd, ExStyle);
            name.Length = 0;
            GetClassName(hwnd, name, name.Capacity);
            // Tool windows (menus, tips) and click-through overlays aren't ones to stand on; cloaked ones are on another desktop or hidden by the system.
            if (!IsWindowVisible(hwnd) || IsIconic(hwnd) || pid == app || (style & (ToolWindow | ClickThrough)) != 0
                || (DwmGetWindowAttribute(hwnd, Cloaked, out cloaked, 4) == 0 && cloaked != 0) || shell.Contains(name.ToString())) return true;
            Rect r;
            if (DwmGetWindowAttribute(hwnd, FrameBounds, out r, 16) != 0) GetWindowRect(hwnd, out r); // the frame you see, without the invisible resize border
            found.Add(string.Format("[{0},{1},{2},{3},{4}]", hwnd.ToInt64(), r.Left, r.Top, r.Right - r.Left, r.Bottom - r.Top));
            return true;
        }, IntPtr.Zero);
        return "{\"windows\":[" + string.Join(",", found) + "]}";
    }

    static bool Alive(uint pid) {
        try { return !Process.GetProcessById((int)pid).HasExited; } catch (Exception) { return false; }
    }

    static void Main(string[] args) {
        var app = args.Length > 0 ? uint.Parse(args[0]) : 0;
        try { SetProcessDpiAwarenessContext(new IntPtr(-4)); } catch (EntryPointNotFoundException) { } // per-monitor v2, so these are real pixels
        string last = null;
        var wasDown = false;
        try {
            for (var tick = 0; ; tick++) {
                if (tick % 3 == 0) { // windows every 100 ms, like the Mac app
                    var now = Windows(app);
                    if (now != last) Console.WriteLine(last = now);
                }
                if (tick % 30 == 0 && app != 0 && !Alive(app)) return;
                // shortcut: polled at 30 Hz, so a click shorter than ~33 ms can slip by; a low-level mouse hook would catch every one.
                var down = (GetAsyncKeyState(GetSystemMetrics(SwapButton) != 0 ? RightButton : LeftButton) & 0x8000) != 0; // the main button, even if you've swapped them
                if (down != wasDown) {
                    Point p;
                    GetCursorPos(out p);
                    Console.WriteLine(down ? "{\"down\":[" + p.X + "," + p.Y + "]}" : "{\"up\":true}");
                    wasDown = down;
                }
                Thread.Sleep(33);
            }
        } catch (Exception) { } // the app closed its end: time to go
    }
}
