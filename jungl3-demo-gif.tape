# jungl3-demo — full four-act walkthrough, 720p GIF
#
# Small shareable GIF for README embeds, Slack, tweets, etc.
# Same script as jungl3-demo.tape; smaller canvas so the GIF stays
# under ~10–15 MB. For a crisp MP4 suitable for landing pages,
# render jungl3-demo.tape instead.
#
# Render with:
#   vhs jungl3-demo-gif.tape
#
# Prereq: the TS binary must already be built.
#   (cd demo-cli && npx tsc -p tsconfig.json && chmod +x dist/bin/jungl3-demo.js)

Output demo-cli/recordings/jungl3-demo.gif

Set Shell bash
Set FontSize 14
Set Width 1200
Set Height 720
Set TypingSpeed 80ms
Set PlaybackSpeed 1.0
Set Theme "Dracula"

Sleep 500ms

Type "node demo-cli/dist/bin/jungl3-demo.js"
Enter
Sleep 2s

Type "aurora"
Sleep 800ms
Enter

Sleep 95s
