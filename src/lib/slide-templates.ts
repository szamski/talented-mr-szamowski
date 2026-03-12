export const SLIDE_STYLES = `
* { margin: 0; padding: 0; box-sizing: border-box; }

.slide {
  width: 1080px; height: 1350px;
  background: #050a08;
  display: flex; flex-direction: column;
  padding: 80px;
  position: relative; overflow: hidden;
  font-family: 'Sora', sans-serif;
  color: #eeeef4;
}

/* Dot matrix background */
.slide::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(rgba(13,223,114,0.07) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse 70% 50% at 50% 50%, black, transparent);
  -webkit-mask-image: radial-gradient(ellipse 70% 50% at 50% 50%, black, transparent);
  z-index: 0;
  pointer-events: none;
}

.z { position: relative; z-index: 2; }
.orb { position: absolute; border-radius: 50%; filter: blur(100px); z-index: 1; pointer-events: none; }
.label { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 13px !important; font-weight: 600; color: #0ddf72; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 24px; }

h1 { font-size: 60px; font-weight: 800; line-height: 1.05; color: #ffffff; }
h2 { font-size: 52px !important; font-weight: 700; line-height: 1.1; color: #ffffff; }

.accent {
  background: linear-gradient(135deg, #0ddf72 0%, #5ef5a0 50%, #dafce0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.body-text { font-size: 20px !important; color: rgba(200,200,220,0.5); line-height: 1.7; }

.pill {
  display: inline-block; padding: 10px 22px !important;
  background: rgba(29,57,43,0.6);
  color: #dafce0;
  border-radius: 100px; font-size: 15px !important; font-weight: 500;
  font-family: 'JetBrains Mono', monospace; margin: 4px;
  border: none;
}

/* Glass card — more padding globally */
.mc {
  background: rgba(13,223,114,0.04);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(13,223,114,0.08);
  border-radius: 16px; padding: 34px 38px !important;
  box-shadow: 0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03);
}

/* Screenshot container */
.ss {
  border-radius: 16px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.ss img { width: 100%; display: block; }

/* Decorative corners */
.corner { position: absolute; z-index: 3; }
.c-tl { top:24px;left:24px;width:20px;height:20px;border-top:1.5px solid rgba(13,223,114,0.12);border-left:1.5px solid rgba(13,223,114,0.12); }
.c-br { bottom:24px;right:24px;width:20px;height:20px;border-bottom:1.5px solid rgba(13,223,114,0.12);border-right:1.5px solid rgba(13,223,114,0.12); }

/* Slide number & branding */
.sn { position: absolute; bottom: 30px; left: 80px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(13,223,114,0.25); z-index: 3; }
.ub { position: absolute; bottom: 30px; right: 80px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(13,223,114,0.25); z-index: 3; }

/* Logo badge */
.logo-badge { display: flex; align-items: center; height: 56px; }
.badge-left { display: flex; align-items: center; justify-content: center; height: 56px; padding: 0 24px; border: 2px solid #0ddf72; border-radius: 28px 0 0 28px; border-right: none; font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 26px; color: #0ddf72; }
.badge-right { display: flex; align-items: center; justify-content: center; height: 56px; padding: 0 22px 0 18px; background: #0ddf72; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 26px; color: #050a08; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%); padding-right: 36px; }

/* Divider */
.divider { width: 60px; height: 2px; background: linear-gradient(90deg, transparent, rgba(13,223,114,0.4), transparent); }

/* Glow dot (timeline) */
.glow-dot { width: 14px !important; height: 14px !important; border-radius: 50%; background: #0ddf72; box-shadow: 0 0 18px rgba(13,223,114,0.6); flex-shrink: 0; margin-top: 6px; }

/* ── Challenge points: override inline font sizes ── */
.glow-dot + div > div:first-child {
  font-size: 22px !important;
  font-weight: 600 !important;
  color: #ffffff !important;
}
.glow-dot + div > div:nth-child(2) {
  font-size: 17px !important;
  line-height: 1.65 !important;
  margin-top: 10px !important;
  color: rgba(200,200,220,0.45) !important;
}

/* Vertical distribution for challenge points container */
.z[style*="flex-direction:column"][style*="gap:28px"] {
  gap: 40px !important;
}

/* ── Stats: override inline sizes ── */
.stat-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 72px !important; font-weight: 800;
  color: #0ddf72; line-height: 1;
  min-width: 160px;
}
.stat-label {
  font-size: 16px !important; color: rgba(200,200,220,0.4);
  margin-top: 8px; line-height: 1.5;
}

/* Stat title (inside .mc next to .stat-number) */
.mc > div:not(.stat-number) > div:first-child:not(.stat-label) {
  font-size: 20px !important;
  font-weight: 600 !important;
}

/* Results cards spacing */
.z[style*="flex-direction:column"][style*="gap:20px"] {
  gap: 28px !important;
}

/* ── Tech stack cards: override inline font-sizes ── */
.mc > div[style*="JetBrains"] {
  font-size: 24px !important;
}
.mc > div[style*="rgba(200,200,220"] {
  font-size: 17px !important;
  line-height: 1.6 !important;
}

/* Tech stack grid gap */
.z[style*="grid-template-columns"] {
  gap: 20px !important;
  margin-top: 44px !important;
}

/* ── Cover slide: collapse empty screenshot area ── */
.z[style*="flex:1"][style*="display:flex"][style*="gap:16px"]:empty {
  display: none !important;
}

/* Flex containers with flex:1 that hold content: fill vertical space */
.z[style*="flex:1"] {
  justify-content: center;
}

.chk { color:#0ddf72;font-size:22px;min-width:24px; }
`;

export const SLIDE_TEMPLATES = {
  cover: `<div class="slide">
  <div class="orb" style="width:600px;height:600px;background:radial-gradient(circle,rgba(13,223,114,0.15),transparent 70%);top:-15%;left:30%;"></div>
  <div class="orb" style="width:400px;height:400px;background:radial-gradient(circle,rgba(29,57,43,0.5),transparent 70%);bottom:10%;right:-5%;"></div>
  <div class="corner c-tl"></div><div class="corner c-br"></div>
  <div class="z"><div class="label">Case Study</div>
    <h1 style="margin-bottom:14px;">Project Title<br><span class="accent">Subtitle Here</span></h1>
    <p class="body-text" style="margin-top:16px;">A brief description of the project<br>and what it achieves.</p>
  </div>
  <div class="z" style="flex:1;margin-top:32px;display:flex;gap:16px;"></div>
  <div class="z" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:24px;">
    <span class="pill">Tag 1</span><span class="pill">Tag 2</span><span class="pill">Tag 3</span>
  </div>
  <div class="sn">01 / 01</div><div class="ub">szamowski.dev</div>
</div>`,

  challenge: `<div class="slide">
  <div class="orb" style="width:500px;height:500px;background:radial-gradient(circle,rgba(13,223,114,0.08),transparent 70%);top:50%;left:-5%;"></div>
  <div class="orb" style="width:350px;height:350px;background:radial-gradient(circle,rgba(29,57,43,0.3),transparent 70%);bottom:-5%;right:10%;"></div>
  <div class="corner c-tl"></div><div class="corner c-br"></div>
  <div class="z" style="margin-bottom:16px;"><div class="label">The Challenge</div>
    <h2>Problem statement<br><span class="accent">with gradient accent</span></h2>
    <p class="body-text" style="margin-top:20px;">Description of the challenge faced and why it matters.</p>
  </div>
  <div class="divider" style="position:relative;z-index:2;margin:8px 0 16px;"></div>
  <div class="z" style="flex:1;display:flex;flex-direction:column;gap:28px;">
    <div style="display:flex;gap:20px;align-items:flex-start;">
      <div class="glow-dot"></div>
      <div style="flex:1;"><div style="color:#ffffff;font-size:22px;font-weight:600;">Point one</div><div style="color:rgba(200,200,220,0.35);font-size:17px;margin-top:10px;line-height:1.6;">Description of the first challenge and its impact</div></div>
    </div>
    <div style="display:flex;gap:20px;align-items:flex-start;">
      <div class="glow-dot"></div>
      <div style="flex:1;"><div style="color:#ffffff;font-size:22px;font-weight:600;">Point two</div><div style="color:rgba(200,200,220,0.35);font-size:17px;margin-top:10px;line-height:1.6;">Description of the second challenge and its impact</div></div>
    </div>
    <div style="display:flex;gap:20px;align-items:flex-start;">
      <div class="glow-dot"></div>
      <div style="flex:1;"><div style="color:#ffffff;font-size:22px;font-weight:600;">Point three</div><div style="color:rgba(200,200,220,0.35);font-size:17px;margin-top:10px;line-height:1.6;">Description of the third challenge and its impact</div></div>
    </div>
  </div>
  <div class="sn">01 / 01</div><div class="ub">szamowski.dev</div>
</div>`,

  techStack: `<div class="slide">
  <div class="orb" style="width:500px;height:500px;background:radial-gradient(circle,rgba(13,223,114,0.1),transparent 70%);bottom:-200px;left:-100px;"></div>
  <div class="orb" style="width:400px;height:400px;background:radial-gradient(circle,rgba(29,57,43,0.4),transparent 70%);top:-100px;right:-50px;"></div>
  <div class="corner c-tl"></div><div class="corner c-br"></div>
  <div class="z"><div class="label">Tech Stack</div>
    <h2>Built with<br><span class="accent">modern tools</span></h2>
  </div>
  <div class="z" style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:44px;">
    <div class="mc" style="display:flex;flex-direction:column;justify-content:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#0ddf72;font-weight:700;">Technology</div>
      <div style="color:rgba(200,200,220,0.4);font-size:17px;margin-top:14px;line-height:1.6;">Description of how it's used in the project</div>
    </div>
    <div class="mc" style="display:flex;flex-direction:column;justify-content:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#0ddf72;font-weight:700;">Technology</div>
      <div style="color:rgba(200,200,220,0.4);font-size:17px;margin-top:14px;line-height:1.6;">Description of how it's used in the project</div>
    </div>
    <div class="mc" style="display:flex;flex-direction:column;justify-content:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#0ddf72;font-weight:700;">Technology</div>
      <div style="color:rgba(200,200,220,0.4);font-size:17px;margin-top:14px;line-height:1.6;">Description of how it's used in the project</div>
    </div>
    <div class="mc" style="display:flex;flex-direction:column;justify-content:center;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:24px;color:#0ddf72;font-weight:700;">Technology</div>
      <div style="color:rgba(200,200,220,0.4);font-size:17px;margin-top:14px;line-height:1.6;">Description of how it's used in the project</div>
    </div>
  </div>
  <div class="sn">01 / 01</div><div class="ub">szamowski.dev</div>
</div>`,

  results: `<div class="slide">
  <div class="orb" style="width:600px;height:600px;background:radial-gradient(circle,rgba(13,223,114,0.12),transparent 70%);top:30%;left:50%;transform:translateX(-50%);"></div>
  <div class="orb" style="width:400px;height:400px;background:radial-gradient(circle,rgba(29,57,43,0.3),transparent 70%);bottom:-5%;left:-5%;"></div>
  <div class="corner c-tl"></div><div class="corner c-br"></div>
  <div class="z"><div class="label">Results</div>
    <h2>Impact &amp;<br><span class="accent">outcomes</span></h2>
  </div>
  <div class="z" style="flex:1;display:flex;flex-direction:column;gap:20px;margin-top:40px;justify-content:start;">
    <div class="mc" style="display:flex;align-items:center;gap:36px;">
      <div class="stat-number">95+</div>
      <div><div style="color:#ffffff;font-size:20px;font-weight:600;">Performance Score</div><div class="stat-label">Lighthouse audit result after optimization</div></div>
    </div>
    <div class="mc" style="display:flex;align-items:center;gap:36px;">
      <div class="stat-number">2x</div>
      <div><div style="color:#ffffff;font-size:20px;font-weight:600;">Conversion Rate</div><div class="stat-label">Increase compared to previous solution</div></div>
    </div>
    <div class="mc" style="display:flex;align-items:center;gap:36px;">
      <div class="stat-number">0</div>
      <div><div style="color:#ffffff;font-size:20px;font-weight:600;">Manual Steps</div><div class="stat-label">Full automation of the workflow</div></div>
    </div>
  </div>
  <div class="sn">01 / 01</div><div class="ub">szamowski.dev</div>
</div>`,

  cta: `<div class="slide" style="align-items:center;justify-content:center;">
  <div class="orb" style="width:700px;height:700px;background:radial-gradient(circle,rgba(13,223,114,0.1),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);"></div>
  <div class="orb" style="width:400px;height:400px;background:radial-gradient(circle,rgba(29,57,43,0.4),transparent 70%);bottom:-10%;left:-5%;"></div>
  <div class="corner c-tl"></div><div class="corner c-br"></div>
  <div class="z" style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:36px;">
    <div class="label" style="font-size:13px;">Want to see more?</div>
    <div class="logo-badge"><div class="badge-left">szamowski</div><div class="badge-right">.dev</div></div>
    <h2 style="font-size:52px;margin-bottom:0;">Strategy consulting<br><span class="accent">meets fullstack<br>development.</span></h2>
    <div class="divider"></div>
    <p class="body-text" style="max-width:650px;font-size:20px;">Full case studies, tech deep-dives,<br>and project breakdowns on my website.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
      <span class="pill">Web Development</span><span class="pill">Automation</span><span class="pill">Marketing</span>
    </div>
    <div style="font-family:'JetBrains Mono',monospace;font-size:22px;color:#0ddf72;letter-spacing:0.1em;">szamowski.dev/case-studies</div>
  </div>
  <div class="sn">01 / 01</div><div class="ub">szamowski.dev</div>
</div>`,

  blank: `<div class="slide">
  <div class="orb" style="width:500px;height:500px;background:radial-gradient(circle,rgba(13,223,114,0.08),transparent 70%);top:-10%;left:30%;"></div>
  <div class="corner c-tl"></div><div class="corner c-br"></div>
  <div class="z">
    <h2>Your content here</h2>
  </div>
  <div class="sn">01 / 01</div><div class="ub">szamowski.dev</div>
</div>`,
};
