import Link from "next/link";

const RED = "#D92B2B";
const MINDBODY_URL = "https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377";

const POSTS: Record<string, { category: string; date: string; author: string; readTime: string; title: string; body: string[] }> = {
  "why-boxing-is-the-best-full-body-workout": {
    category: "Training", date: "March 28, 2026", author: "Jason Battiste", readTime: "5 min read",
    title: "Why Boxing Is the Best Full-Body Workout You're Not Doing",
    body: [
      "Most gym routines are built around isolation. Chest day. Leg day. Shoulder day. You leave having worked a few muscle groups and maybe gotten your heart rate up for a bit. Boxing doesn't work like that.",
      "When you're on the bags, every muscle in your body is working together. Your legs generate power, your core transfers it, your arms deliver it. Your cardiorespiratory system is working hard the entire time. Your brain is engaged — footwork, timing, combinations, breathing.",
      "That's why boxing produces fitness results that most other training modalities can't match. You're not just building muscle. You're building a body that works as a system.",
      "The research backs this up. A 60-minute boxing session burns between 500 and 800 calories depending on intensity — more than most traditional gym workouts. But calories are just one metric. The real gains come from the neurological adaptation. Boxing requires your brain and body to coordinate in ways that build real athletic capacity.",
      "At FIIT Co., our group classes are designed to give you the full benefit of that system. We're not teaching you to tap a bag to music. We're teaching you actual boxing technique — stance, guard, footwork, combinations — and building your fitness on top of a real foundation.",
      "If you've been doing the same gym routine for years and wondering why you've plateaued, the answer might be that you need to add something that challenges your body in a completely different way. Come try a class. First one is on us.",
    ],
  },
  "beginners-guide-to-the-boxing-academy": {
    category: "Academy", date: "March 14, 2026", author: "Nick Radionov", readTime: "7 min read",
    title: "A Beginner's Guide to the FIIT Co. Boxing Academy",
    body: [
      "The most common question I get from people who want to join the Boxing Academy is: 'Do I need any experience?' The answer is no. Level 1 is built specifically for people who have never boxed before.",
      "Level 1 is called Foundation for a reason. We spend the first four to six weeks on stance, footwork, and the basic four punches — jab, cross, hook, uppercut. We go slow. We correct technique constantly. The goal isn't to hit hard. The goal is to build habits that will make you a good boxer for years.",
      "What most beginners don't expect is how technical boxing is. People come in thinking it's about being tough or strong. It isn't. Boxing is more like chess than weightlifting. You're solving problems with movement, timing, and decision-making, not brute force.",
      "Once you've built your foundation — usually after two to three months — you move into Level 2: Development. This is where we start introducing light technical sparring, ring work, and more complex combinations. You're still learning, but now you're starting to apply what you know.",
      "Level 3 is Competition Prep. This tier is for members who want to enter amateur boxing competitions or who are already registered competitors. Training becomes more intense, more specific, and more demanding.",
      "You don't have to have any ambition to compete to join the Academy. Most of our Level 1 and Level 2 members are just there because they want to learn to box properly. And there's nothing wrong with that. We'll take you as far as you want to go.",
    ],
  },
  "recovery-the-forgotten-part-of-training": {
    category: "Recovery", date: "February 27, 2026", author: "Tyrone Warner", readTime: "6 min read",
    title: "Recovery: The Forgotten Part of Your Training Plan",
    body: [
      "Everyone talks about the work. The rounds. The sets. The cardio. Nobody talks about what happens between sessions — and that's where most of the adaptation actually occurs.",
      "Your body doesn't get stronger during training. It gets stronger during recovery. Training creates the stimulus. Sleep, nutrition, and recovery practices create the adaptation. If you're training hard and sleeping five hours a night, eating poorly, and skipping your mobility work, you're leaving most of your results on the table.",
      "At FIIT Co., we built the Yin Yoga programme specifically to complement the intensity of boxing training. Yin is a slow, passive practice where you hold poses for two to five minutes. The goal isn't to stretch muscles — it's to put sustained pressure on connective tissue, fascia, and joints. For people who train hard, this is essential.",
      "The ice bath facility is another tool we take seriously. Cold water immersion after a hard session reduces inflammation, flushes metabolic waste from muscles, and — if you do it consistently — trains your nervous system to recover faster. It's uncomfortable. That's kind of the point.",
      "Here's a simple weekly recovery structure that works for most of our members who train three to four times per week: Get eight hours of sleep. Take one full rest day. Do one Yin Yoga session. Use the ice bath twice after your hardest sessions.",
      "It's not glamorous. But it's the work that makes the other work count.",
    ],
  },
  "meet-nick-radionov": {
    category: "Team", date: "February 10, 2026", author: "FIIT Co. Team", readTime: "8 min read",
    title: "Meet Nick Radionov: From the Ukrainian Olympic Team to Gerrard St East",
    body: [
      "Nick Radionov grew up in Ukraine, where he started boxing at the age of nine. By his late teens, he was competing nationally. By his mid-twenties, he was a two-time World Kickboxing Champion and a member of the Ukrainian National Olympic Team.",
      "He moved to Toronto twelve years ago and has been coaching here ever since. When Jason reached out to build the Boxing Academy at FIIT Co., Nick was the obvious choice.",
      "'The thing about coaching is you have to be able to communicate technique at every level,' Nick says. 'Someone who has never thrown a punch and someone preparing for a competition need fundamentally different things from you. You have to be able to read where they are and meet them there.'",
      "Nick is a Boxing Ontario certified Level 3 coach — the highest certification available in Ontario. His classes are technical, demanding, and precise. He doesn't let bad habits slide, even in beginners. Especially in beginners.",
      "'Bad habits are easy to build and hard to break,' he says. 'I'd rather slow someone down in Level 1 and build them correctly than let them rush through and then spend two years undoing sloppy technique.'",
      "Outside the gym, Nick competes in masters boxing events and trains daily. He's one of those coaches who leads entirely by example. If you're going to train under him, be ready to work.",
    ],
  },
  "small-group-training-why-it-works": {
    category: "Training", date: "January 22, 2026", author: "Sarah Green", readTime: "4 min read",
    title: "Why Small Group Training Beats Both Solo and Group Classes",
    body: [
      "Personal training gets results. But for most people, it's not sustainable five days a week. Group classes are accessible and energetic, but you can get lost in the crowd — especially if you're still learning technique.",
      "Small group training solves both problems. With a maximum of six participants, you get real coaching attention without paying for a fully private session.",
      "In a group of six, I know everyone's name by the second session. I know who has a shoulder injury. I know who is trying to lose weight versus who is training for athletic performance. I know who needs to slow down and who needs to be pushed harder. That individual awareness changes everything.",
      "We've had members come in through group classes who were frustrated with their progress, switch to small group training, and see completely different results within two months. Not because they were working harder, but because the coaching was more precise.",
      "If you've been doing group classes for a while and feel like you've hit a ceiling, small group might be exactly what you need. Same energy, same community, but with a coach who actually knows what you need to do next.",
    ],
  },
  "introducing-fiit-teens": {
    category: "Youth", date: "January 8, 2026", author: "Nick Radionov", readTime: "5 min read",
    title: "Introducing FIIT Teens: Boxing for the Next Generation",
    body: [
      "We launched the Teens programme in January for kids aged 12 to 17, and the response has exceeded everything we expected. Within the first month, we had 40 registered youth members.",
      "Parents always ask the same first question: is it safe? Yes. Youth boxing at FIIT Co. is structured, supervised, and progressive. We don't put teenagers in contact sparring situations before they're technically and psychologically ready. The programme is about building skills, discipline, and confidence — not about getting hit.",
      "What we've found, and what the research consistently shows, is that boxing is an exceptional sport for developing adolescents. It demands discipline and respect. It builds physical fitness across all attributes — strength, endurance, coordination, and agility. And it gives young people a structured outlet for energy and stress.",
      "The other thing parents notice quickly is the character development. Kids who were shy become more confident. Kids who struggled with focus become more patient. The culture in a boxing gym — respect for the coach, respect for your training partner, respect for the work — transfers into school and home.",
      "Sessions run twice a week, Tuesday and Thursday evenings. No experience required. The programme is designed to take complete beginners from zero to technically competent boxers over the course of one year. Come and watch a session if you want to see it before committing — we're always happy to have parents observe.",
    ],
  },
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];

  if (!post) {
    return (
      <div style={{ background: "#000", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
        <div>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", color: RED, marginBottom: "1rem" }}>404</p>
          <h1 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "3rem", textTransform: "uppercase", marginBottom: "1.5rem" }}>Article Not Found</h1>
          <Link href="/site/blog" style={{ fontFamily: "var(--font-chakra)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.14em", color: RED, textDecoration: "none", borderBottom: `1px solid ${RED}`, paddingBottom: "2px" }}>← Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#000", color: "#fff" }}>

      {/* ── HEADER ────────────────────────────────────────────── */}
      <section style={{ padding: "10rem 4rem 4rem", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "2rem" }}>
          <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", background: RED, color: "#fff", padding: "0.3rem 0.7rem" }}>{post.category}</span>
          <span style={{ fontFamily: "var(--font-chakra)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)" }}>{post.readTime}</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", textTransform: "uppercase", lineHeight: 1, marginBottom: "2rem" }}>{post.title}</h1>
        <div style={{ display: "flex", gap: "2rem", fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", paddingBottom: "2.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span>{post.date}</span>
          <span>By {post.author}</span>
        </div>
      </section>

      {/* ── BODY ──────────────────────────────────────────────── */}
      <article style={{ padding: "0 4rem 7rem", maxWidth: 800, margin: "0 auto" }}>
        {post.body.map((paragraph, i) => (
          <p key={i} style={{ fontSize: "1.05rem", lineHeight: 1.9, color: "rgba(255,255,255,0.75)", marginBottom: "1.75rem" }}>{paragraph}</p>
        ))}

        <div style={{ marginTop: "4rem", padding: "3rem", background: "#0a0a0a", borderLeft: `4px solid ${RED}` }}>
          <p style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: RED, marginBottom: "1rem" }}>Ready to Train?</p>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.65)", marginBottom: "1.5rem" }}>First class is on us. No commitment, no pressure.</p>
          <a href={MINDBODY_URL} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-block", background: RED, color: "#fff", padding: "0.85rem 2rem",
            fontFamily: "var(--font-oswald)", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", fontSize: "0.85rem", textDecoration: "none",
          }}>Book A Free Class ↗</a>
        </div>
      </article>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ padding: "4rem", borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <p style={{ fontFamily: "var(--font-oswald)", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-1px" }}>FIIT<span style={{ color: RED }}>.CO</span></p>
        <Link href="/site/blog" style={{ fontFamily: "var(--font-chakra)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.14em", color: RED, textDecoration: "none" }}>← Back to Blog</Link>
      </footer>
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}
