# jungl3-demo — full four-act walkthrough, 1440p MP4, slowed playback
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
# 0.75 = render plays back at 75% speed. ~90s demo becomes ~120s of
# video. Doesn't change the demo's internal pacing — just the output.
Set PlaybackSpeed 0.75
Set Theme "Dracula"

# Let the shell settle so the first frame isn't mid-prompt.
Sleep 500ms

Type "node demo-cli/dist/bin/jungl3-demo.js"
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

# Acts 1→4 auto-advance. At speedMultiplier=2.2 the recorded window is
# ~90s; Sleep is measured in recorded time, not playback time, so 95s
# of capture is still correct. vhs applies PlaybackSpeed when encoding.
Sleep 95s
