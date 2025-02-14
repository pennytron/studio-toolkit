# Studio Toolkit – After Effects CEP Panel
### No more File>Scripts, no more hunting through your Downloads folder, or that mess of docked tabs!

- A simple, lightweight CEP panel that makes running After Effects scripts fast and hassle-free.  
- Provides a simple UI to run ExtendScript (.jsx) files quickly. 
- Saves time by eliminating the need for multiple script panels; run the script, close the panel, have easy access again later.  
- Open-source & fully customizable if you want to tweak the look & feel.

[Click here for a more detailed guide](https://app.gitbook.com/o/R0w5mp98D3kImZbn6Nzp/s/Uyw8hFApMviGRVg5f0F2/)

### A Note from a Creative, Not a Coder

I’m just a creative who needed a better way to run scripts in After Effects — so I made this.  
This isn’t a perfectly optimized, code-guru-certified, airtight script. It’s a tool I built for myself that I figured might help others too.  

You might find some gaps in my knowledge, some _“creative”_ coding techniques, and maybe even a few messy comments. But that’s the beauty of open-source — we build, we learn, we improve together.

If you find something that could be better, go ahead and tweak it! If you have feedback, let me know. I want this to stay useful, accessible, and something that makes our lives easier.

# Quick Start

Place the panel folder studio-toolkit in the following directory:

  **Windows:** `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions`  
  **Mac:** `/Library/Application Support/Adobe/CEP/extensions`

Restart After Effects.

## Accessing the Panel

Open After Effects.

Navigate to Window > Extensions > Studio Toolkit to open the panel.  
Dock the panel somewhere in your layout.  

## descriptions.json
You can customise how script names appear in the panel by adding a `descriptions.json` file to the **root** of the folder you’ve selected in Studio Toolkit as your script source.    
In other words, this will 'prettify' the filenames of your scripts within the panel. Copy & paste the below example into any text editor, and save it as a .json, to get started.

**For example:**  

```json
{
  "example-script-1.jsx": "Example Script 1",
  "project_ScriptName.jsx": "Auto Fade In",
  "autoLabelSelector.jsx": "Label Selector"
}
```

## Excluding folders
Prefix them with a period ` . ` or wrap them in square brackets ` [ ] `.  
How you use this feature is up to you!  

# FAQ
**Can I use this panel in other Adobe apps?**  
This panel is designed for After Effects but could most likely be adapted for other Adobe software.  

**How do I reset the panel to its default settings?**  
CEP panels store cached settings in a folder. Deleting this resets the panel to default settings.  
_Note: this doesn’t reset anything if you have changed the code files! It just lets you open the panel as if you have just installed it._

**Windows:**  
`C:\Users\[yourusername]\AppData\Local\Temp\cep_cache`  
**Mac:**  
`Users/[yourusername]/Library/Application Support/Adobe/CEP/cep_cache`

_These folders could be hidden; you will need to Show Hidden Files (or your systems equivalent of that action) to be able to see them._  

**Can I add custom buttons or features?**  
Yes! Add HTML elements to index.html and connect them to ExtendScript via script.js and main.jsx.

# Free & Open, For the Community

Hey there! 👋

Studio Toolkit was made with one goal in mind: To help creatives and teams work **smarter**, not _harder_, when using After Effects. This project is 100% free and open-source because I believe in sharing knowledge, helping each other grow, and making tools that benefit everyone.

🔓 What This Means for You:  

✅ You can modify it for yourself or your team.  
✅ You can learn from it, tweak it, and make it work best for your workflow.  
✅ You can share those modifications stress-free within your team.  
❌ You can’t take it, change the name, and sell it as your own product. That’s not in the spirit of open-source.  

_This panel was created with a lot of help from AI; specifically ChatGPT. Use your AI model of choice to expand & learn!_  

💡 The Open-Source Promise

This project is licensed under GPLv3, which means:

If you modify and share this outside your team, those changes must also stay open-source under GPLv3.  
The community thrives when we all contribute back.  
No one should lock away this knowledge behind a paywall.  

I was inspired by the philosophy behind DUIK—that tools made for creatives should stay accessible, open, and community-driven.

So, if Studio Toolkit helps you, inspires you, or makes your workflow smoother, pay it forward. Share your knowledge. Help others. Keep the open-source spirit alive. ✨  

Enjoy, and happy scripting!  
💜 pennytron

P.S: drink some water today, if you haven't already.
