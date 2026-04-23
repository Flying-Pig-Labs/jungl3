# jungl3-demo — Act 1 only (the "vending jungle + recovery" moment), 1080p
#
# Short MP4 for the marketplace tile. ~35s. Skips the prompt via --team.
#
# Render with:
#   vhs jungl3-act1.tape

Output demo-cli/recordings/jungl3-act1.mp4
Output demo-cli/recordings/jungl3-act1.gif

Set Shell bash
Set FontSize 22
Set Width 1920
Set Height 1080
Set TypingSpeed 80ms
Set PlaybackSpeed 1.0
Set Theme "Dracula"

Sleep 300ms
Type "node demo-cli/dist/bin/jungl3-demo.js --act 1 --team aurora"
Enter
# Act 1 at 2.2× is ~28s including the logo reveal; 35s gives headroom.
Sleep 35s
