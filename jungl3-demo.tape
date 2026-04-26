# jungl3-demo — full six-act walkthrough + operator console, 1440p MP4
#
# Render with:
#   vhs jungl3-demo.tape
#
# Produces a 2560×1440 MP4 at 0.75× playback speed — crisp on retina
# displays and paced so a pitch audience can actually read the log
# lines as they land. For a small README-friendly GIF, render
# jungl3-demo-gif.tape instead (720p, GIF only).
#
# Prereq: the TS binary must already be built.
#   (cd demo-cli && npx tsc -p tsconfig.json && chmod +x dist/bin/jungl3-demo.js)

Output demo-cli/recordings/jungl3-demo.mp4

# 2560×1440 at FontSize 28 preserves the cols×rows layout from the
# 1200×720 / FontSize 14 pairing, but with ~4× more pixels per cell.
Set Shell bash
Set FontSize 28
Set Width 2560
Set Height 1440
Set TypingSpeed 80ms
# PlaybackSpeed scales each captured frame's display duration: 0.5 →
# each frame held twice as long → final video runs at ~2× duration.
# VHS aggressively compresses stretches where the terminal output
# doesn't change, so the recording lands shorter than the script's
# Sleep budget; PlaybackSpeed 0.5 brings it back up to a comfortable
# pace for a pitch-room audience.
Set PlaybackSpeed 0.5
Set Framerate 25
Set Theme "Dracula"

# Let the shell settle so the first frame isn't mid-prompt.
Sleep 500ms

# Redirect stderr — the React dev-mode build emits a known
# state-update-during-render warning from the act runner's transition
# between phases. It's noisy on screen and out of scope to refactor for
# the cinematic recording.
Type "node demo-cli/dist/bin/jungl3-demo.js 2>/dev/null"
Enter
Sleep 2s

# Prompt phase: type the jungle name like a user would.
# If vhs's PTY doesn't register as a TTY on your machine, the prompt is
# skipped and these two lines land harmlessly in the shell afterward —
# swap to `--team aurora` on the invocation line above and delete the
# two lines below if so.
Type "aurora"
Sleep 800ms
Enter

# Acts 0→5 auto-advance with the MultiJungle interstitial woven in
# between Act 0 (Marketplace Install) and Act 1 (Enter Jungle). Total
# recorded time at the default speedMultiplier (~1.0 in TTY) is roughly
# 130s of demo content. We dwell another 5s so the Act 5 payoff lands
# fully before the operator console phase begins.
Sleep 130s

# Operator console phase: the demo has dropped into the interactive
# jungl3› REPL. Drive it with a few representative commands. VHS's Type
# directives go straight through Ink's useInput hook — no scripted-mode
# flag needed. Each command logs its prompt + a small block of output;
# Sleep budgets in between let the typewriter settle.

Type "help"
Sleep 600ms
Enter
Sleep 2.4s

Type "jungle list"
Sleep 600ms
Enter
Sleep 3s

Type "jungle status aurora"
Sleep 600ms
Enter
Sleep 3.2s

Type "gallery list"
Sleep 600ms
Enter
Sleep 3s

Type "clear"
Sleep 400ms
Enter
Sleep 1.2s

Type "jungle logs aurora --tail"
Sleep 600ms
Enter
Sleep 3.2s

# Hold the final frame for a couple of seconds so the recording ends on
# the operator console rather than mid-typewriter.
Sleep 2.5s
