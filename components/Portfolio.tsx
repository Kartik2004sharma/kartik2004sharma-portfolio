"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";

const sections = [
  ["spawn", "Spawn", "◆"],
  ["about", "The Cabin", "⌂"],
  ["experience", "The Castle", "♜"],
  ["projects", "The Village", "▦"],
  ["skills", "The Mine", "◇"],
  ["contact", "The Portal", "◉"],
] as const;

function Loader({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (reduce) return onDone();
    const blocks = Array.from({ length: 12 }, (_, index) => window.setTimeout(() => setProgress(index + 1), 150 + index * 90));
    const done = window.setTimeout(onDone, 1500);
    return () => { blocks.forEach(clearTimeout); clearTimeout(done); };
  }, [onDone, reduce]);
  if (reduce) return null;
  return (
    <motion.div data-testid="loader" className="loader" exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
      <div className="grass-cube" aria-hidden="true"><span /></div>
      <p>GENERATING WORLD…</p>
      <div className="loader-track" aria-label={`Loading ${progress} of 12`}>
        {Array.from({ length: 12 }, (_, index) => <span data-testid="progress-block" className={index < progress ? "filled" : ""} key={index} />)}
      </div>
    </motion.div>
  );
}

function PixelIcon({ type }: { type: string }) {
  const paths: Record<string, string> = {
    spawn: "M5 12h14v8H5zM8 7h8v5H8z",
    about: "M3 11 12 3l9 8v10h-6v-6H9v6H3z",
    experience: "M4 5h4v4h8V5h4v16H4z",
    projects: "M4 8h16v13H4zM7 4h10v4H7z",
    skills: "M5 4h14v5h-5v12h-4V9H5z",
    contact: "M3 5h18v15H3zm2 2 7 6 7-6",
    theme: "M18 3a9 9 0 1 0 3 16A10 10 0 0 1 18 3z",
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" shapeRendering="crispEdges"><path d={paths[type]} /></svg>;
}

function InventoryNav({ active, theme, setTheme }: { active: string; theme: "day" | "night"; setTheme: (theme: "day" | "night") => void }) {
  return (
    <nav className="inventory" aria-label="World navigation">
      {sections.map(([id, label], index) => (
        <a key={id} data-slot={id} href={`#${id}`} className={`inventory-slot ${active === id ? "active" : ""}`} aria-label={`${index + 1}. ${label}`}>
          <span className="slot-number">{index + 1}</span><PixelIcon type={id} /><span className="slot-tooltip">{label}</span>
        </a>
      ))}
      <button data-slot="theme" className="inventory-slot" onClick={() => setTheme(theme === "day" ? "night" : "day")} aria-label={`7. Switch to ${theme === "day" ? "night" : "day"} mode`}>
        <span className="slot-number">7</span><PixelIcon type="theme" /><span className="slot-tooltip">{theme === "day" ? "Night" : "Day"}</span>
      </button>
    </nav>
  );
}

function ParticleCanvas({ theme }: { theme: "day" | "night" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let particles: { x: number; y: number; speed: number; phase: number; size: number }[] = [];
    let frame = 0;
    let hidden = document.hidden;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
      canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = innerWidth < 768 ? 12 : 24;
      particles = Array.from({ length: count }, (_, index) => ({ x: (index * 83) % innerWidth, y: (index * 137) % innerHeight, speed: 0.12 + (index % 4) * 0.04, phase: index, size: index % 3 ? 2 : 3 }));
    };
    const draw = () => {
      if (!hidden) {
        context.clearRect(0, 0, innerWidth, innerHeight);
        const colors = theme === "night" ? ["#f5cf52", "#b58cff", "#fff"] : ["#fff7cf", "#c9f2ff"];
        particles.forEach((particle, index) => {
          particle.y -= particle.speed;
          if (particle.y < -4) particle.y = innerHeight + 4;
          context.fillStyle = colors[index % colors.length];
          context.globalAlpha = 0.48;
          context.fillRect(particle.x + Math.sin(particle.y / 60 + particle.phase) * 5, particle.y, particle.size, particle.size);
        });
      }
      frame = requestAnimationFrame(draw);
    };
    const visibility = () => { hidden = document.hidden; };
    resize(); draw(); addEventListener("resize", resize); document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); removeEventListener("resize", resize); document.removeEventListener("visibilitychange", visibility); };
  }, [theme]);
  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}

function TerrainDivider({ kind }: { kind: string }) {
  return <svg className={`terrain-divider ${kind}`} viewBox="0 0 1200 36" preserveAspectRatio="none" aria-hidden="true"><path d="M0 8h70v8h55V5h86v13h72V9h104v12h70V6h91v11h110V4h88v14h71V8h104v13h80V6h99v10H1200V36H0z" /></svg>;
}

function WorldSection({ id, className, children }: { id: string; className: string; children: React.ReactNode }) {
  return <section id={id} className={`world-section ${className}`} data-testid={`section-${id}`}>{children}</section>;
}

function PixelButton({ href, children, onClick, secondary = false }: { href?: string; children: React.ReactNode; onClick?: () => void; secondary?: boolean }) {
  const className = `pixel-button ${secondary ? "secondary" : ""}`;
  return href ? <a className={className} href={href}>{children}</a> : <button className={className} onClick={onClick}>{children}</button>;
}

function ResumeModal({ open, close }: { open: boolean; close: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    document.body.classList.add("modal-open"); closeRef.current?.focus();
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab") return;
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    addEventListener("keydown", handle);
    return () => { document.body.classList.remove("modal-open"); removeEventListener("keydown", handle); };
  }, [close, open]);
  return (
    <AnimatePresence>{open && (
      <motion.div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div ref={modalRef} className="resume-modal" role="dialog" aria-modal="true" aria-labelledby="resume-title" initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }}>
          <header><h2 id="resume-title">Kartik Sharma · Résumé</h2><button ref={closeRef} onClick={close} aria-label="Close résumé">×</button></header>
          {profile.resumeUrl ? <><div className="resume-actions"><a href={profile.resumeUrl} download>Download PDF</a><a href={profile.resumeUrl} target="_blank" rel="noreferrer">Open PDF in new tab</a></div><div className="resume-document"><Image src="/resume-preview.png" alt="Kartik Sharma cybersecurity résumé. Open or download the PDF for selectable text." width={1273} height={1800} /></div></> : <div className="resume-placeholder"><span>📜</span><p>Résumé scroll arriving soon.</p><small>The PDF will appear here before launch.</small></div>}
        </motion.div>
      </motion.div>
    )}</AnimatePresence>
  );
}

function PixelCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const element = cursorRef.current;
    if (!element) return;
    document.documentElement.classList.add("pixel-cursor-ready");
    const move = (event: MouseEvent) => { element.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`; element.classList.toggle("action", Boolean((event.target as HTMLElement).closest("a,button,input,textarea"))); };
    const down = () => element.classList.add("click");
    const up = () => element.classList.remove("click");
    addEventListener("mousemove", move); addEventListener("mousedown", down); addEventListener("mouseup", up);
    return () => { document.documentElement.classList.remove("pixel-cursor-ready"); removeEventListener("mousemove", move); removeEventListener("mousedown", down); removeEventListener("mouseup", up); };
  }, []);
  return <div className="pixel-cursor" ref={cursorRef} aria-hidden="true"><svg viewBox="0 0 32 38" shapeRendering="crispEdges"><path d="M3 2v27l7-7 5 12 6-3-6-11h11z" /></svg><i /></div>;
}

const chatAnswers = [
  { keywords: ["experience", "work", "pazcare", "job"], answer: "Kartik is an Employee Benefits Manager at Pazcare and previously joined TEEP in Taiwan as a research scholar." },
  { keywords: ["skill", "technology", "tech"], answer: "His toolkit spans employee benefits, customer operations, TypeScript, React, Next.js, Node.js, MongoDB, and product thinking." },
  { keywords: ["project", "build", ...profile.projects.map((project) => project.name.toLowerCase())], answer: `Featured builds include ${profile.projects.map((project) => project.name).join(", ")}. Travel to The Village for live apps and available public source links.` },
  { keywords: ["education", "college", "degree"], answer: "Kartik earned a B.E. in Computer Science from Chitkara University." },
  { keywords: ["certification", "certificate"], answer: "No certifications are listed yet. Kartik prefers to publish only verified credentials." },
  { keywords: ["contact", "email", "linkedin"], answer: `Email ${profile.email}, or use the portal form below. LinkedIn and GitHub links are also in The Portal.` },
];

function GuideAvatar() {
  return <svg className="guide-avatar" viewBox="0 0 32 40" shapeRendering="crispEdges" aria-hidden="true">
    <path fill="#492619" d="M12 26h8v2h5v8h-4v4h-5v-5h-1v5h-5v-4H7v-8h5z" />
    <path fill="#ffe4a2" d="M12 27h8v2h3v5h-3v4h-3v-5h-3v5h-3v-4H9v-5h3z" />
    <path fill="#ee761d" d="M14 28h4v4h-4z" /><path fill="#633020" d="M15 28h2v4h-2z" />
    <path fill="#8c321b" d="M7 13H5v3H3v8h2v3h4v2h14v-2h4v-3h2v-8h-2v-3H7z" />
    <path fill="#ff8d24" d="M6 15h20v11H6z" />
    <path fill="#ffe4a2" d="M9 15h14v1h3v8h-2v2H8v-2H6v-8h3z" />
    <path fill="#39251f" d="M10 19h3v4h-3zm10 0h3v4h-3zm-5 5h4v1h-4z" />
    <path fill="#fff9df" d="M10 19h1v1h-1zm10 0h1v1h-1z" />
    <path fill="#f5966b" d="M8 23h3v2H8zm14 0h3v2h-3z" />
    <path fill="#df4f13" d="M6 14v-4h3V7h3V4h3V0h2v4h3v4h3V6h2v5h2v4z" />
    <path fill="#ff9926" d="M9 14v-4h3V8h3V4h2v5h3v3h3v-2h2v4z" />
    <path fill="#ffe45c" d="M12 14v-3h3V8h2v4h3v2z" />
  </svg>;
}

function VillagerChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ from: "villager", text: "Greetings, traveler! Ask me about Kartik’s work, projects, or skills." }]);
  const [typing, setTyping] = useState(false);
  const ask = (question: string) => {
    if (!question.trim() || typing) return;
    setMessages((current) => [...current, { from: "user", text: question.trim() }]); setInput(""); setTyping(true);
    const normalized = question.toLowerCase();
    const answer = chatAnswers.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)))?.answer ?? "I know about Kartik’s experience, skills, projects, education, certifications, and contact details.";
    window.setTimeout(() => { setMessages((current) => [...current, { from: "villager", text: answer }]); setTyping(false); }, 550);
  };
  return <>
    <button className="villager-button" onClick={() => setOpen((value) => !value)} aria-label={`${open ? "Close" : "Open"} villager chat`} aria-expanded={open}><GuideAvatar /></button>
    <AnimatePresence>{open && <motion.aside className="chat-panel" aria-label="Ask the portfolio villager" initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: 0.18 }}>
      <header><div className="villager-face"><GuideAvatar /></div><div><strong>Guide Villager</strong><small><i /> Online · local knowledge</small></div><button onClick={() => setOpen(false)} aria-label="Close chat">×</button></header>
      <div className="chat-history" aria-live="polite">{messages.map((message, index) => <p key={index} className={message.from}>{message.text}</p>)}{typing && <p className="villager">Thinking…</p>}</div>
      <div className="quick-questions"><button onClick={() => ask("What is Kartik's experience?")}>Experience</button><button onClick={() => ask("Show me his projects")}>Projects</button><button onClick={() => ask("What are his skills?")}>Skills</button></div>
      <form onSubmit={(event) => { event.preventDefault(); ask(input); }}><label className="sr-only" htmlFor="chat-question">Ask a question</label><input id="chat-question" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about Kartik…" maxLength={180} /><button aria-label="Send question">➤</button></form>
    </motion.aside>}</AnimatePresence>
  </>;
}

function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setState("sending"); setMessage("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setState("success"); setMessage("Message delivered through the portal."); form.reset();
    } catch (error) {
      setState("error"); setMessage(error instanceof Error ? error.message : "The portal did not open. Please email Kartik directly.");
    }
    window.setTimeout(() => { setState("idle"); setMessage(""); }, 3000);
  };
  return <form className="contact-form" onSubmit={submit}>
    <div className="portal-glow" aria-hidden="true" />
    <label>Name<input name="name" required minLength={2} maxLength={80} autoComplete="name" /></label>
    <label>Email<input name="email" type="email" required maxLength={160} autoComplete="email" /></label>
    <label>Message<textarea name="message" required minLength={10} maxLength={2000} rows={5} /></label>
    <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
    <button type="submit" disabled={state === "sending"}>{state === "sending" ? "Opening portal…" : "Send Message"}</button>
    <AnimatePresence>{message && <motion.p className={`form-message ${state}`} role="status" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>{message}</motion.p>}</AnimatePresence>
  </form>;
}

export function Portfolio() {
  const [loaded, setLoaded] = useState(false);
  const [theme, setThemeState] = useState<"day" | "night">("day");
  const [active, setActive] = useState("spawn");
  const [resumeOpen, setResumeOpen] = useState(false);
  const reduce = useReducedMotion();
  const finishLoading = useCallback(() => setLoaded(true), []);
  const setTheme = (value: "day" | "night") => { setThemeState(value); localStorage.setItem("kartik-theme", value); };

  useEffect(() => {
    const saved = localStorage.getItem("kartik-theme");
    const preferred = saved === "day" || saved === "night" ? saved : matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
    const frame = requestAnimationFrame(() => setThemeState(preferred));
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    if (!new URLSearchParams(location.search).has("visual")) sections.forEach(([id]) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    const keys = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).matches("input, textarea, select, [contenteditable=true]")) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < 6) document.getElementById(sections[index][0])?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      if (event.key === "7") setTheme(theme === "day" ? "night" : "day");
    };
    addEventListener("keydown", keys);
    return () => { observer.disconnect(); removeEventListener("keydown", keys); };
  }, [reduce, theme]);

  const reveal = { initial: reduce ? false : { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-100px" }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } };

  return <div className={`world ${theme}`} data-theme={theme} data-loaded={loaded}>
    <a className="skip-link" href="#main">Skip to content</a>
    <AnimatePresence>{!loaded && <Loader onDone={finishLoading} />}</AnimatePresence>
    <ParticleCanvas theme={theme} /><PixelCursor />
    <aside className="identity-panel" aria-label="Profile identity"><strong>{profile.name}</strong><span>{profile.title}</span><small>LVL {new Date().getFullYear()}</small></aside>
    <InventoryNav active={active} theme={theme} setTheme={setTheme} />
    <main id="main">
      <WorldSection id="spawn" className="spawn">
        <div className="sky-art" aria-hidden="true"><div className="sun-moon" /><div className="stars" />{[0,1,2,3].map((cloud) => <div className={`cloud cloud-${cloud + 1}`} key={cloud}><i /><i /><i /></div>)}<div className="tree tree-one"><i /><b /></div><div className="tree tree-two"><i /><b /></div><div className="water" /></div>
        <motion.div className="hero-content" initial={reduce ? false : "hidden"} animate={loaded ? "show" : "hidden"} variants={{ hidden: {}, show: { transition: { delayChildren: 0.2, staggerChildren: 0.12 } } }}>
          {[
            <span className="hero-badge" key="badge">⌁ {profile.title} · {profile.location}</span>,
            <h1 key="name">{profile.name}</h1>,
            <p key="statement">{profile.statement}</p>,
            <div className="hero-actions" key="actions"><PixelButton href="#projects">Explore My Work</PixelButton><PixelButton href="#contact" secondary>Get in Touch</PixelButton><PixelButton onClick={() => setResumeOpen(true)} secondary>📜 Résumé</PixelButton></div>,
            <small className="fast-travel" key="hint">PRESS 1–6 TO FAST-TRAVEL · SCROLL TO EXPLORE <span className="pixel-scroll-arrow" aria-hidden="true" /></small>,
          ].map((child, index) => <motion.div key={index} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } } }}>{child}</motion.div>)}
        </motion.div>
        <div className="ground" aria-hidden="true" /><TerrainDivider kind="grass" />
      </WorldSection>

      <WorldSection id="about" className="about-zone">
        <motion.div className="section-inner" {...reveal}><p className="eyebrow">02 · SAFEHOUSE FOUND</p><h2>The Cabin <span>About Me</span></h2><div className="cabin-roof" aria-hidden="true" /><div className="wood-panel">{profile.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="stats-grid">{profile.stats.map((stat) => <article key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></article>)}</div></motion.div><TerrainDivider kind="stone" />
      </WorldSection>

      <WorldSection id="experience" className="experience-zone">
        <div className="section-inner"><p className="eyebrow">03 · QUEST LOG</p><h2>The Castle <span>Experience</span></h2><div className="experience-list">{profile.experience.map((item, index) => <motion.article className="castle-card" key={item.company} initial={reduce ? false : { opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}><div className="battlements" aria-hidden="true" /><header><div><h3>{item.role}</h3><p>{item.company} · {item.location}</p></div><time>{item.dates}</time></header><ul>{item.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul><div className="tags">{item.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></motion.article>)}</div><article className="education-card"><span>ACADEMY</span><div><h3>{profile.education.degree}</h3><p>{profile.education.school}</p></div></article></div><TerrainDivider kind="village" />
      </WorldSection>

      <WorldSection id="projects" className="projects-zone">
        <motion.div className="section-inner" {...reveal}><p className="eyebrow">04 · BUILDS DISCOVERED</p><h2>The Village <span>Projects</span></h2><div className="project-grid">{profile.projects.map((project) => <article className={`project-card ${project.color}`} key={project.name}><div className="building-roof" aria-hidden="true" /><div className="windows" aria-hidden="true"><i /><i /><i /></div><small>{project.category}</small><h3>{project.name}</h3><p>{project.description}</p><div className="tags">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div><div className="project-links"><a href={project.live} target="_blank" rel="noreferrer">View Project ↗</a>{project.source && <a href={project.source} target="_blank" rel="noreferrer">Source ↗</a>}</div></article>)}</div></motion.div><TerrainDivider kind="mine" />
      </WorldSection>

      <WorldSection id="skills" className="skills-zone">
        <div className="ore-field" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div><div className="section-inner"><p className="eyebrow">05 · DEPTH: -58 · TORCHES LIT</p><h2>The Mine <span>Skills</span></h2><div className="skills-grid">{profile.skills.map((category, index) => <motion.article className={`skill-panel ${category.color}`} key={category.name} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}><small>{category.color} VEIN</small><h3>{category.name}</h3><div className="ore-chips">{category.items.map((skill) => <span key={skill}><i />{skill}</span>)}</div></motion.article>)}</div></div><TerrainDivider kind="portal" />
      </WorldSection>

      <WorldSection id="contact" className="contact-zone">
        <motion.div className="section-inner contact-inner" {...reveal}><p className="eyebrow">06 · FINAL WAYPOINT</p><h2>The Portal <span>Contact</span></h2><p className="contact-copy">Have a people, benefits, or product problem worth solving? Step through. I’d love to hear about it.</p><div className="contact-grid"><ContactForm /><aside className="contact-links"><p>Prefer a direct route?</p><a href={`mailto:${profile.email}`}><span>✉</span><div><small>Email</small>{profile.email}</div></a><a href={profile.linkedin} target="_blank" rel="noreferrer"><span>in</span><div><small>LinkedIn</small>Kartik Sharma</div></a><a href={profile.github} target="_blank" rel="noreferrer"><span>⌘</span><div><small>GitHub</small>@Kartik2004sharma</div></a></aside></div></motion.div>
      </WorldSection>
    </main>
    <footer><div className="torch" aria-hidden="true"><i /><b /></div><strong>REST HERE, TRAVELER</strong><p>{profile.title} building thoughtful experiences, block by block.</p><nav aria-label="Footer navigation">{sections.slice(1).map(([id, label]) => <a key={id} href={`#${id}`}>{label.replace("The ", "")}</a>)}</nav><small>© {new Date().getFullYear()} Kartik Sharma · Crafted block by block</small></footer>
    <VillagerChat /><ResumeModal open={resumeOpen} close={() => setResumeOpen(false)} />
  </div>;
}
