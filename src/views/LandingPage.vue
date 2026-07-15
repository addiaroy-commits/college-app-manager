<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

type PreviewMode = "Overview" | "Research" | "Essays" | "Costs";

const router = useRouter();
const previewMode = ref<PreviewMode>("Overview");
const organizationMode = ref<"chaos" | "control">("chaos");
const previewModes: PreviewMode[] = ["Overview", "Research", "Essays", "Costs"];

const previewCopy: Record<PreviewMode, { eyebrow: string; title: string; detail: string }> = {
    Overview: {
        eyebrow: "Command center",
        title: "Know exactly what needs you next.",
        detail: "Deadlines, tasks, recommendations, essays, and application progress update together.",
    },
    Research: {
        eyebrow: "College intelligence",
        title: "Turn a college list into an actual strategy.",
        detail: "Compare schools, score personal fit, rank priorities, and keep research tied to every choice.",
    },
    Essays: {
        eyebrow: "Essay workspace",
        title: "See every prompt, draft, and reusable idea.",
        detail: "Track word limits, map overlapping prompts, and get coaching without losing your voice.",
    },
    Costs: {
        eyebrow: "Decision planning",
        title: "Compare what each acceptance will really cost.",
        detail: "Put tuition, aid, scholarships, family contribution, and loans in one honest view.",
    },
};

const activePreviewCopy = computed(() => previewCopy[previewMode.value]);

const capabilities = [
    { index: "01", title: "College strategy", copy: "Build a balanced list, compare schools, score fit, rank priorities, and save the research behind every decision.", tone: "blue" },
    { index: "02", title: "Application command", copy: "Track requirements, portal details, tasks, recommendations, interviews, visits, and every deadline on one calendar.", tone: "coral" },
    { index: "03", title: "Essay system", copy: "Manage every draft and word limit, connect overlapping prompts, and open focused coaching from the essay itself.", tone: "yellow" },
    { index: "04", title: "Money decisions", copy: "Compare net costs, financial aid, family contribution, scholarships, loans, fees, and the remaining gap.", tone: "green" },
    { index: "05", title: "Document vault", copy: "Keep important files connected to your account, available locally, and included in your personal backup.", tone: "ink" },
    { index: "06", title: "Progress sharing", copy: "Give a parent or counselor a useful progress view without exposing essay text, passwords, or private portal details.", tone: "blue" },
];

const workflowSteps = [
    { number: "01", title: "Build the list", copy: "Add colleges, define reach and target balance, research fit, and record what actually matters to you." },
    { number: "02", title: "Create the plan", copy: "CogApp turns each college into requirements, essays, tasks, recommenders, visits, and dated work." },
    { number: "03", title: "Do the work", copy: "Write, upload, check off, revise, and see the next highest-impact action instead of hunting for it." },
    { number: "04", title: "Make the decision", copy: "Compare outcomes and real costs with the research, aid, and priorities you gathered along the way." },
];

function start() {
    void router.push("/signup");
}
</script>

<template>
    <div class="landing-page">
        <header class="site-nav">
            <router-link class="brand" to="/welcome" aria-label="CogApp home">
                <span class="brand-mark">C</span>
                <span>CogApp</span>
            </router-link>
            <nav aria-label="Website navigation">
                <a href="#platform">Platform</a>
                <a href="#workflow">How it works</a>
                <a href="#ai">AI Studio</a>
                <a href="#privacy">Privacy</a>
            </nav>
            <div class="nav-actions">
                <router-link to="/login">Sign in</router-link>
                <button @click="start">Get started</button>
            </div>
        </header>

        <main>
            <section class="hero">
                <div class="hero-copy">
                    <div class="hero-identity">
                        <span class="eyebrow light"><i></i> Public beta</span>
                        <h1>CogApp</h1>
                        <span class="hero-index">COLLEGE APPLICATION SYSTEM / 01</span>
                    </div>
                    <div class="hero-message">
                        <p class="hero-statement">The whole college application process. <strong>Finally under control.</strong></p>
                        <p class="hero-support">One private workspace for college research, applications, essays, deadlines, recommendations, documents, scholarships, and the money decision at the end.</p>
                        <div class="hero-actions">
                            <button class="primary-cta" @click="start">Build my application plan <span>-&gt;</span></button>
                            <router-link to="/login">I already have an account</router-link>
                        </div>
                        <div class="hero-assurances">
                            <span>Free public beta</span>
                            <span>No credit card</span>
                            <span>Your own private workspace</span>
                        </div>
                    </div>
                </div>

                <div class="signal-rail" aria-label="Example live application signals">
                    <div><span>Next deadline</span><strong>Northwestern supplement</strong><b>3 days</b></div>
                    <div><span>Application health</span><strong>Five schools on track</strong><b class="good">78%</b></div>
                    <div><span>Essay progress</span><strong>Personal statement</strong><b>487 / 650</b></div>
                    <div><span>Workspace</span><strong>Changes protected</strong><b class="good">Saved</b></div>
                </div>

                <div class="hero-preview" aria-label="Interactive preview of the CogApp product">
                    <div class="preview-topbar">
                        <div class="window-controls"><i></i><i></i><i></i></div>
                        <span class="preview-url">app.cogapp / {{ previewMode.toLowerCase() }}</span>
                        <span class="preview-saved">Saved</span>
                    </div>
                    <div class="preview-shell">
                        <aside class="preview-nav">
                            <div class="preview-brand"><span>C</span> CogApp</div>
                            <small>Workspace</small>
                            <button
                                v-for="mode in previewModes"
                                :key="mode"
                                :class="{ active: previewMode === mode }"
                                @click="previewMode = mode"
                            >
                                <b>{{ mode.slice(0, 1) }}</b>{{ mode }}
                            </button>
                            <small>Manage</small>
                            <span class="preview-link">Applications</span>
                            <span class="preview-link">Calendar</span>
                            <span class="preview-link">Documents</span>
                            <span class="preview-link">Scholarships</span>
                            <div class="preview-profile"><i>DR</i><span><strong>Dee's workspace</strong><small>Class of 2027</small></span></div>
                        </aside>

                        <section class="preview-canvas">
                            <header class="canvas-heading">
                                <div><small>{{ activePreviewCopy.eyebrow }}</small><h2>{{ activePreviewCopy.title }}</h2><p>{{ activePreviewCopy.detail }}</p></div>
                                <button>+ Add new</button>
                            </header>

                            <div v-if="previewMode === 'Overview'" class="overview-view">
                                <div class="stat-row">
                                    <article><span>Applications</span><strong>8</strong><small>5 on track</small><i class="blue"></i></article>
                                    <article><span>Completion</span><strong>68%</strong><small>Up 12% this week</small><i class="green"></i></article>
                                    <article><span>Essays</span><strong>11</strong><small>6 ready</small><i class="yellow"></i></article>
                                    <article><span>Next deadline</span><strong>3d</strong><small>Northwestern</small><i class="coral"></i></article>
                                </div>
                                <div class="overview-grid">
                                    <section class="app-panel deadline-panel">
                                        <div class="panel-title"><strong>What needs you next</strong><span>Open calendar</span></div>
                                        <div class="task-row priority"><b>Today</b><div><strong>Finish Northwestern supplement</strong><span>Essay - 126 words remaining</span></div><small>High</small></div>
                                        <div class="task-row"><b>Jul 18</b><div><strong>Review application checklist</strong><span>Alpha University - 8 of 10 complete</span></div><small>Task</small></div>
                                        <div class="task-row"><b>Jul 21</b><div><strong>Follow up with Jordan Teacher</strong><span>Recommendation - awaiting upload</span></div><small>Rec</small></div>
                                        <div class="task-row"><b>Jul 28</b><div><strong>Beta Test Award</strong><span>Scholarship - $2,500</span></div><small>Award</small></div>
                                    </section>
                                    <section class="app-panel health-panel">
                                        <div class="panel-title"><strong>Application health</strong><span>View report</span></div>
                                        <div class="health-score"><div><strong>78</strong><span>/100</span></div><p>Strong week</p></div>
                                        <div class="health-line"><span>Ready</span><i><b style="width: 72%"></b></i><strong>3</strong></div>
                                        <div class="health-line"><span>In progress</span><i><b style="width: 52%"></b></i><strong>4</strong></div>
                                        <div class="health-line"><span>Needs attention</span><i><b class="warn" style="width: 24%"></b></i><strong>1</strong></div>
                                    </section>
                                </div>
                            </div>

                            <div v-else-if="previewMode === 'Research'" class="research-view">
                                <div class="research-toolbar"><span class="active">Fit and rank</span><span>Compare</span><span>Research notes</span><span>Visits</span></div>
                                <div class="research-grid">
                                    <section class="school-list">
                                        <div class="school-row selected"><i>NU</i><div><strong>Northwestern University</strong><span>Reach - Evanston, IL</span></div><b>8.7</b></div>
                                        <div class="school-row"><i>BU</i><div><strong>Boston University</strong><span>Target - Boston, MA</span></div><b>8.2</b></div>
                                        <div class="school-row"><i>UM</i><div><strong>University of Michigan</strong><span>Target - Ann Arbor, MI</span></div><b>7.9</b></div>
                                        <div class="school-row"><i>GW</i><div><strong>George Washington</strong><span>Safety - Washington, DC</span></div><b>7.4</b></div>
                                    </section>
                                    <section class="fit-panel">
                                        <div class="fit-heading"><div><small>Current fit</small><strong>Northwestern University</strong></div><b>8.7<span>/10</span></b></div>
                                        <div class="fit-bar"><span>Academics</span><i><b style="width: 92%"></b></i><strong>4.6</strong></div>
                                        <div class="fit-bar"><span>Programs</span><i><b style="width: 88%"></b></i><strong>4.4</strong></div>
                                        <div class="fit-bar"><span>Campus life</span><i><b style="width: 76%"></b></i><strong>3.8</strong></div>
                                        <div class="fit-bar"><span>Affordability</span><i><b class="yellow" style="width: 58%"></b></i><strong>2.9</strong></div>
                                        <p><strong>Why it fits:</strong> Excellent journalism program, collaborative campus culture, strong internship access.</p>
                                    </section>
                                </div>
                            </div>

                            <div v-else-if="previewMode === 'Essays'" class="essays-view">
                                <div class="essay-layout">
                                    <section class="essay-index">
                                        <div class="essay-filter"><strong>11 essays</strong><span>6 ready</span></div>
                                        <div class="essay-item selected"><i></i><div><strong>Personal statement</strong><span>Common App - 487 / 650</span></div><b>Drafting</b></div>
                                        <div class="essay-item"><i class="green"></i><div><strong>Community contribution</strong><span>Northwestern - 250 words</span></div><b class="done">Ready</b></div>
                                        <div class="essay-item"><i class="yellow"></i><div><strong>Why this major?</strong><span>Boston University - 300 words</span></div><b>Review</b></div>
                                        <div class="essay-item"><i class="gray"></i><div><strong>Meaningful activity</strong><span>Michigan - 150 words</span></div><b>Not started</b></div>
                                    </section>
                                    <section class="editor-panel">
                                        <div class="editor-top"><div><small>PERSONAL STATEMENT</small><strong>The robot that would not move</strong></div><button>Open AI Coach</button></div>
                                        <p>At two in the morning, the only sound in our classroom was the click of a relay that refused to cooperate. I had rebuilt the circuit four times.</p>
                                        <p>The fifth attempt was less dramatic. I stopped trying to prove that my design was right and asked Maya to show me why she thought it was wrong.</p>
                                        <div class="editor-feedback"><b>Coach focus</b><span>Your opening is specific and grounded. The second paragraph needs a clearer connection to what changed in how you lead.</span></div>
                                        <div class="word-count"><span>Autosaved</span><strong>487 / 650 words</strong></div>
                                    </section>
                                </div>
                            </div>

                            <div v-else class="costs-view">
                                <div class="money-summary"><article><span>Lowest net cost</span><strong>$29,500</strong><small>Gamma State</small></article><article><span>Tracked aid</span><strong>$67,500</strong><small>Across 4 offers</small></article><article><span>Scholarships won</span><strong>$7,500</strong><small>3 awards</small></article></div>
                                <section class="cost-comparison">
                                    <div class="cost-row cost-head"><span>College</span><span>Sticker price</span><span>Grants + aid</span><span>Net cost</span><span>Gap</span></div>
                                    <div class="cost-row"><strong><i class="school-badge blue">A</i>Alpha University</strong><span>$58,000</span><span class="positive">-$18,000</span><b>$40,000</b><em>$5,000</em></div>
                                    <div class="cost-row"><strong><i class="school-badge coral">B</i>Beta College</strong><span>$50,000</span><span class="positive">-$12,000</span><b>$38,000</b><em>$3,000</em></div>
                                    <div class="cost-row best"><strong><i class="school-badge green">G</i>Gamma State</strong><span>$37,500</span><span class="positive">-$8,000</span><b>$29,500</b><em>$0</em></div>
                                    <div class="cost-row"><strong><i class="school-badge yellow">N</i>Northwestern</strong><span>$64,000</span><span class="positive">-$21,500</span><b>$42,500</b><em>$7,500</em></div>
                                </section>
                                <div class="cost-note"><strong>Decision signal</strong><span>Gamma State currently covers your full planned budget with no remaining gap.</span></div>
                            </div>
                        </section>
                    </div>
                </div>
            </section>

            <section class="product-strip" aria-label="CogApp product areas">
                <span>Research</span><i></i><span>Applications</span><i></i><span>Essays</span><i></i><span>Documents</span><i></i><span>Scholarships</span><i></i><span>Costs</span>
            </section>

            <section class="organization-lab">
                <div class="lab-copy">
                    <span class="eyebrow">The organization test</span>
                    <h2>Your application should not live in six places and your head.</h2>
                    <p>Switch the view to see what CogApp actually replaces. Same deadlines, drafts, documents, and decisions. Radically less hunting.</p>
                    <div class="lab-toggle" role="group" aria-label="Compare the usual application process with CogApp">
                        <button :class="{ active: organizationMode === 'chaos' }" @click="organizationMode = 'chaos'">The usual mess</button>
                        <button :class="{ active: organizationMode === 'control' }" @click="organizationMode = 'control'">Inside CogApp</button>
                    </div>
                    <div class="lab-result">
                        <span>{{ organizationMode === 'chaos' ? 'Six disconnected places' : 'One connected workspace' }}</span>
                        <strong>{{ organizationMode === 'chaos' ? 'Where did I put that?' : 'Here is what needs you next.' }}</strong>
                    </div>
                </div>

                <div class="lab-stage" :class="organizationMode">
                    <div v-if="organizationMode === 'chaos'" class="chaos-stage">
                        <article class="mess-window spreadsheet"><div><i></i><i></i><i></i><span>COLLEGE_LIST_final_v7.xlsx</span></div><strong>College tracker</strong><p>Northwestern&nbsp;&nbsp;&nbsp; EA&nbsp;&nbsp;&nbsp; Nov 1<br />Boston U&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RD&nbsp;&nbsp;&nbsp; Jan 4<br />Michigan&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; EA&nbsp;&nbsp;&nbsp; Nov 1</p></article>
                        <article class="mess-window notes"><small>NOTES</small><strong>Things I still need to do</strong><p>- finish NU essay<br />- ask Jordan again?<br />- find transcript PDF<br />- scholarship thing</p></article>
                        <article class="mess-window calendar"><small>REMINDER</small><b>Northwestern deadline</b><strong>3 DAYS</strong><p>Essay still unfinished</p></article>
                        <article class="mess-window document"><span>PDF</span><strong>transcript_REAL_final.pdf</strong><small>Downloads / School / New folder 4</small></article>
                        <article class="mess-window tabs"><small>17 TABS OPEN</small><p>financial aid calculator</p><p>northwestern supplemental essays</p><p>college visit notes</p></article>
                        <div class="missed-signal"><span>!</span><p><strong>Something is missing</strong><small>You just cannot tell what yet.</small></p></div>
                    </div>

                    <div v-else class="control-stage">
                        <div class="control-header"><div><span>C</span><p><strong>Application command center</strong><small>Everything connected to the right college</small></p></div><b>All saved</b></div>
                        <div class="control-school"><i>NU</i><div><strong>Northwestern University</strong><span>Early Action - November 1</span></div><b>72% complete</b></div>
                        <div class="connection-line"><i></i><i></i><i></i><i></i></div>
                        <div class="control-grid">
                            <article><span>01</span><small>ESSAY</small><strong>Supplement</strong><p>126 words remaining</p><b class="warning">Due in 3 days</b></article>
                            <article><span>02</span><small>RECOMMENDATION</small><strong>Jordan Teacher</strong><p>Request confirmed</p><b class="good">On track</b></article>
                            <article><span>03</span><small>DOCUMENT</small><strong>Transcript</strong><p>PDF - 1.2 MB</p><b class="good">Attached</b></article>
                            <article><span>04</span><small>COST</small><strong>Net estimate</strong><p>$42,500 / year</p><b>Compare offer</b></article>
                        </div>
                        <div class="next-action"><span>DO THIS NEXT</span><strong>Finish the Northwestern supplement</strong><button>Open essay -&gt;</button></div>
                    </div>
                </div>
            </section>

            <section id="platform" class="platform-section">
                <div class="section-heading">
                    <span class="eyebrow">The entire system</span>
                    <h2>College applications have too many moving parts. CogApp gives them one home.</h2>
                    <p>No more rebuilding the same information across a spreadsheet, notes app, calendar, document folder, and twelve increasingly suspicious browser tabs.</p>
                </div>
                <div class="capability-grid">
                    <article v-for="item in capabilities" :key="item.index" :class="`tone-${item.tone}`">
                        <div><span>{{ item.index }}</span><i></i></div>
                        <h3>{{ item.title }}</h3>
                        <p>{{ item.copy }}</p>
                        <small>Explore in CogApp <b>-&gt;</b></small>
                    </article>
                </div>
            </section>

            <section id="workflow" class="workflow-section">
                <div class="workflow-intro">
                    <span class="eyebrow light">One connected record</span>
                    <h2>Enter it once. Use it everywhere.</h2>
                    <p>A college is not just a row in a list. In CogApp, it connects to its requirements, essays, research, tasks, visits, recommendations, documents, costs, and final decision.</p>
                </div>
                <div class="workflow-list">
                    <article v-for="step in workflowSteps" :key="step.number">
                        <span>{{ step.number }}</span><div><h3>{{ step.title }}</h3><p>{{ step.copy }}</p></div>
                    </article>
                </div>
            </section>

            <section id="ai" class="ai-section">
                <div class="ai-copy">
                    <span class="eyebrow light">AI Studio</span>
                    <h2>Useful AI. Not an essay vending machine.</h2>
                    <p>CogApp uses the work already in your workspace to give focused help. It can find reusable essay material, coach a draft, and show which application needs attention without pretending it can guarantee admission.</p>
                    <div class="ai-features">
                        <div><strong>Essay Reuse Mapper</strong><span>Find overlapping prompts and adapt existing material intentionally.</span></div>
                        <div><strong>Essay Coach</strong><span>Get specific feedback on prompt fit, voice, detail, clarity, and structure.</span></div>
                        <div><strong>Application Advisor</strong><span>Turn your current progress into a prioritized plan for what to do next.</span></div>
                    </div>
                </div>
                <div class="coach-demo">
                    <div class="coach-top"><div><i>AI</i><span><strong>Essay Coach</strong><small>Personal statement analysis</small></span></div><b>Analysis ready</b></div>
                    <div class="coach-score"><div><strong>82</strong><span>/100</span></div><p><b>Strong foundation</b><span>Your draft has a memorable scene and a clear voice. The reflection needs to carry more of the ending.</span></p></div>
                    <div class="coach-metrics"><div><span>Specificity</span><i><b style="width: 88%"></b></i><strong>88</strong></div><div><span>Voice</span><i><b style="width: 91%"></b></i><strong>91</strong></div><div><span>Structure</span><i><b style="width: 72%"></b></i><strong>72</strong></div><div><span>Prompt fit</span><i><b style="width: 80%"></b></i><strong>80</strong></div></div>
                    <div class="coach-action"><span>01</span><p><strong>Make the change visible</strong><small>Replace the general reflection in paragraph four with one later moment where you led differently.</small></p></div>
                    <div class="coach-action"><span>02</span><p><strong>Protect the strongest line</strong><small>Keep the relay detail. It gives the opening a physical sound and makes the scene yours.</small></p></div>
                </div>
            </section>

            <section id="privacy" class="trust-section">
                <div class="trust-heading">
                    <span class="eyebrow">Built around your work</span>
                    <h2>Your applications are personal. Your workspace should act like it.</h2>
                </div>
                <div class="trust-grid">
                    <article><span>01</span><h3>Separate accounts</h3><p>Each login opens its own colleges, essays, files, preferences, reminders, and saved application data.</p></article>
                    <article><span>02</span><h3>Local-first protection</h3><p>Supported work saves locally first so a temporary network problem does not get to ruin your evening.</p></article>
                    <article><span>03</span><h3>Personal backups</h3><p>Export a complete backup of application records and uploaded documents, then restore it when needed.</p></article>
                    <article><span>04</span><h3>Controlled review</h3><p>Share useful progress with a parent or counselor without displaying private essay text or portal credentials.</p></article>
                </div>
            </section>

            <section class="final-cta">
                <span class="eyebrow light">Public beta is open</span>
                <h2>Your application deserves better than six disconnected tabs.</h2>
                <p>Build one workspace for the entire process and know what needs you next.</p>
                <div><button @click="start">Get started free <span>-&gt;</span></button><router-link to="/login">Sign in</router-link></div>
                <small>No credit card. Personal backup included.</small>
            </section>
        </main>

        <footer>
            <div class="brand"><span class="brand-mark">C</span><span>CogApp</span></div>
            <p>College applications, finally under control.</p>
            <div><a href="#platform">Platform</a><a href="#privacy">Privacy</a><router-link to="/login">Sign in</router-link></div>
        </footer>
    </div>
</template>

<style scoped>
.landing-page {
    --ink: #111318;
    --ink-soft: #1b1e25;
    --paper: #f5f3ee;
    --white: #ffffff;
    --line: #dcdedc;
    --muted: #6c717b;
    --blue: #2f5bea;
    --blue-soft: #e8edff;
    --coral: #ef5b4c;
    --coral-soft: #ffebe7;
    --green: #168968;
    --green-soft: #e5f5ee;
    --yellow: #e4ae2c;
    --yellow-soft: #fff5d8;
    min-height: 100vh;
    overflow: hidden;
    background: var(--white);
    color: var(--ink);
}
.site-nav { position: absolute; z-index: 30; top: 0; left: 50%; width: min(1440px,100%); height: 76px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 28px; padding: 0 42px; border-bottom: 1px solid rgba(255,255,255,.12); color: white; transform: translateX(-50%); }
.brand { display: inline-flex; align-items: center; gap: 10px; color: inherit; font-size: 17px; font-weight: 850; text-decoration: none; }
.brand-mark { width: 31px; height: 31px; display: grid; place-items: center; border-radius: 7px; background: var(--coral); color: white; font-size: 13px; }
.site-nav nav { display: flex; align-items: center; gap: 28px; }
.site-nav nav a, .nav-actions a { color: rgba(255,255,255,.68); font-size: 11px; font-weight: 700; text-decoration: none; }
.site-nav nav a:hover, .nav-actions a:hover { color: white; }
.nav-actions { display: flex; justify-content: flex-end; align-items: center; gap: 18px; }
.nav-actions button { min-height: 36px; padding: 0 15px; border: 0; border-radius: 6px; background: white; color: var(--ink); font-size: 11px; font-weight: 850; cursor: pointer; }
.nav-actions button:hover { background: var(--yellow-soft); transform: translateY(-1px); }

.hero { min-height: 1100px; padding: 138px max(28px,calc((100vw - 1240px)/2)) 96px; background: var(--ink); color: white; }
.hero-copy { max-width: 1180px; display: grid; grid-template-columns: .58fr 1.42fr; gap: 68px; margin: 0 auto 42px; text-align: left; }
.hero-identity { min-height: 260px; display: flex; align-items: flex-start; flex-direction: column; padding-right: 24px; border-right: 1px solid rgba(255,255,255,.15); }
.hero-identity .eyebrow { margin-bottom: 30px; }
.hero-index { margin-top: auto; color: rgba(255,255,255,.28); font-size: 8px; font-weight: 800; }
.hero-message { max-width: 780px; }
.eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 16px; color: var(--blue); font-size: 10px; font-weight: 850; text-transform: uppercase; }
.eyebrow.light { color: #8fabff; }
.eyebrow i { width: 7px; height: 7px; border-radius: 50%; background: #41c98b; box-shadow: 0 0 0 4px rgba(65,201,139,.13); }
.hero h1 { margin: 0; color: white; font-size: 54px; font-weight: 850; line-height: 1; }
.hero-statement { max-width: 780px; margin: 0; color: white; font-size: 56px; font-weight: 500; line-height: 1.02; }
.hero-statement strong { color: #8fabff; font-weight: 800; }
.hero-support { max-width: 680px; margin: 25px 0 0; color: rgba(255,255,255,.63); font-size: 15px; line-height: 1.65; }
.hero-actions { display: flex; align-items: center; justify-content: flex-start; gap: 22px; margin-top: 28px; }
.primary-cta, .final-cta button { min-height: 48px; padding: 0 20px; border: 0; border-radius: 6px; background: var(--coral); color: white; font-size: 12px; font-weight: 850; cursor: pointer; box-shadow: 0 10px 28px rgba(239,91,76,.22); }
.primary-cta span, .final-cta button span { margin-left: 10px; }
.primary-cta:hover, .final-cta button:hover { background: #ff6d5d; transform: translateY(-2px); }
.hero-actions a { color: rgba(255,255,255,.72); font-size: 11px; font-weight: 750; text-decoration: none; }
.hero-actions a:hover { color: white; }
.hero-assurances { display: flex; justify-content: flex-start; gap: 24px; margin-top: 22px; color: rgba(255,255,255,.42); font-size: 9px; font-weight: 700; }
.hero-assurances span::before { content: ""; width: 4px; height: 4px; display: inline-block; margin: 0 7px 1px 0; border-radius: 50%; background: #41c98b; }
.signal-rail { max-width: 1180px; display: grid; grid-template-columns: repeat(4,1fr); margin: 0 auto; border: 1px solid rgba(255,255,255,.16); border-bottom: 0; background: #1b1e25; }
.signal-rail > div { display: grid; grid-template-columns: 1fr auto; gap: 5px 12px; min-width: 0; padding: 13px 15px; border-right: 1px solid rgba(255,255,255,.12); }
.signal-rail > div:last-child { border-right: 0; }
.signal-rail span { grid-column: 1 / -1; color: rgba(255,255,255,.33); font-size: 6px; font-weight: 850; text-transform: uppercase; }
.signal-rail strong { overflow: hidden; color: rgba(255,255,255,.79); font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.signal-rail b { color: #ff8d82; font-size: 7px; text-align: right; }.signal-rail b.good { color: #55d49a; }

.hero-preview { max-width: 1180px; margin: 0 auto; overflow: hidden; border: 1px solid rgba(255,255,255,.18); border-radius: 8px; background: #f7f8fb; color: #182033; box-shadow: 0 38px 90px rgba(0,0,0,.48); animation: preview-enter .7s ease both; }
.preview-topbar { height: 41px; display: grid; grid-template-columns: 90px 1fr 90px; align-items: center; padding: 0 13px; border-bottom: 1px solid #dfe3ea; background: #f0f2f5; color: #818795; }
.window-controls { display: flex; gap: 6px; }.window-controls i { width: 8px; height: 8px; border-radius: 50%; background: #ccd0d7; }.window-controls i:first-child { background: #ef786e; }.window-controls i:nth-child(2) { background: #e8bb4f; }.window-controls i:last-child { background: #61be82; }
.preview-url { justify-self: center; width: min(310px,80%); padding: 5px 12px; border: 1px solid #dfe2e7; border-radius: 4px; background: white; font-size: 8px; text-align: center; }
.preview-saved { justify-self: end; color: var(--green); font-size: 8px; font-weight: 850; text-transform: uppercase; }
.preview-shell { height: 580px; display: grid; grid-template-columns: 170px minmax(0,1fr); }
.preview-nav { display: flex; flex-direction: column; padding: 18px 11px 12px; border-right: 1px solid #dfe3ea; background: #f0f2f5; }
.preview-brand { display: flex; align-items: center; gap: 7px; margin: 0 7px 22px; color: #202533; font-size: 12px; font-weight: 850; }.preview-brand span { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 5px; background: var(--coral); color: white; font-size: 8px; }
.preview-nav > small { margin: 10px 9px 5px; color: #9aa0ac; font-size: 6px; font-weight: 850; text-transform: uppercase; }
.preview-nav button { display: flex; align-items: center; gap: 8px; min-height: 34px; margin-bottom: 3px; padding: 0 9px; border: 0; border-radius: 5px; background: transparent; color: #6f7685; font-size: 8px; font-weight: 750; cursor: pointer; text-align: left; }
.preview-nav button b { width: 18px; height: 18px; display: grid; place-items: center; border-radius: 4px; background: white; color: #79808e; font-size: 7px; }
.preview-nav button.active { background: #dfe6ff; color: #2449c1; }.preview-nav button.active b { background: var(--blue); color: white; }
.preview-link { padding: 7px 9px; color: #7d8492; font-size: 8px; }
.preview-profile { display: flex; align-items: center; gap: 7px; margin-top: auto; padding: 9px 7px 0; border-top: 1px solid #d9dde4; }.preview-profile > i { width: 25px; height: 25px; display: grid; place-items: center; border-radius: 50%; background: var(--yellow-soft); color: #8d6710; font-size: 7px; font-style: normal; font-weight: 850; }.preview-profile span { display: flex; min-width: 0; flex-direction: column; }.preview-profile strong { overflow: hidden; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }.preview-profile small { margin-top: 2px; color: #9298a5; font-size: 6px; }
.preview-canvas { min-width: 0; padding: 24px 27px; background: #f8f9fb; }
.canvas-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 20px; }.canvas-heading > div { max-width: 650px; }.canvas-heading small { color: var(--blue); font-size: 7px; font-weight: 850; text-transform: uppercase; }.canvas-heading h2 { margin: 4px 0; color: #172033; font-size: 20px; line-height: 1.15; }.canvas-heading p { color: #7f8796; font-size: 8px; line-height: 1.45; }.canvas-heading > button { flex: 0 0 auto; min-height: 30px; padding: 0 11px; border: 0; border-radius: 5px; background: var(--blue); color: white; font-size: 7px; font-weight: 850; }
.stat-row { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 10px; }.stat-row article, .app-panel, .money-summary article, .cost-comparison, .school-list, .fit-panel, .essay-index, .editor-panel { border: 1px solid #e0e4ea; border-radius: 6px; background: white; }.stat-row article { position: relative; overflow: hidden; padding: 13px; }.stat-row span { color: #848b99; font-size: 7px; font-weight: 750; }.stat-row strong { display: block; margin: 6px 0 3px; font-size: 19px; }.stat-row small { color: #979eaa; font-size: 6px; }.stat-row i { position: absolute; right: 0; bottom: 0; width: 39px; height: 3px; background: var(--blue); }.stat-row i.green { background: var(--green); }.stat-row i.yellow { background: var(--yellow); }.stat-row i.coral { background: var(--coral); }
.overview-grid { display: grid; grid-template-columns: minmax(0,1.7fr) minmax(200px,.7fr); gap: 10px; margin-top: 10px; }.app-panel { padding: 14px; }.panel-title { display: flex; justify-content: space-between; margin-bottom: 7px; }.panel-title strong { font-size: 9px; }.panel-title span { color: var(--blue); font-size: 7px; font-weight: 800; }
.task-row { display: grid; grid-template-columns: 36px minmax(0,1fr) auto; align-items: center; gap: 9px; padding: 12px 0; border-top: 1px solid #edf0f4; }.task-row > b { color: #858c9a; font-size: 6px; }.task-row > div { display: flex; min-width: 0; flex-direction: column; gap: 3px; }.task-row strong { overflow: hidden; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }.task-row span { color: #939aa7; font-size: 6px; }.task-row > small { padding: 4px 6px; border-radius: 4px; background: #f0f2f5; color: #7c8390; font-size: 6px; font-weight: 800; }.task-row.priority > small { background: var(--coral-soft); color: #c8473b; }.task-row.priority > b { color: var(--coral); }
.health-score { display: flex; align-items: center; justify-content: center; flex-direction: column; width: 112px; height: 112px; margin: 18px auto 15px; border: 10px solid #e1e7fb; border-top-color: var(--blue); border-right-color: var(--blue); border-radius: 50%; }.health-score div { display: flex; align-items: baseline; }.health-score strong { font-size: 25px; }.health-score span { color: #969da9; font-size: 8px; }.health-score p { margin-top: 2px; color: var(--green); font-size: 6px; font-weight: 800; }.health-line { display: grid; grid-template-columns: 62px minmax(0,1fr) 12px; align-items: center; gap: 7px; margin: 8px 0; font-size: 6px; }.health-line > span { color: #7f8795; }.health-line > i { height: 4px; overflow: hidden; border-radius: 3px; background: #edf0f4; }.health-line > i b { display: block; height: 100%; border-radius: inherit; background: var(--blue); }.health-line > i b.warn { background: var(--coral); }.health-line > strong { text-align: right; }
.research-toolbar { display: flex; gap: 5px; margin-bottom: 10px; }.research-toolbar span { padding: 7px 10px; border: 1px solid #e0e4ea; border-radius: 5px; background: white; color: #7c8391; font-size: 7px; font-weight: 750; }.research-toolbar span.active { border-color: #b8c7ff; background: var(--blue-soft); color: #2449c1; }.research-grid { display: grid; grid-template-columns: minmax(280px,.85fr) minmax(350px,1.15fr); gap: 10px; }.school-list { padding: 5px 12px; }.school-row { display: grid; grid-template-columns: 30px minmax(0,1fr) auto; align-items: center; gap: 9px; padding: 13px 3px; border-bottom: 1px solid #edf0f4; }.school-row:last-child { border-bottom: 0; }.school-row > i { width: 29px; height: 29px; display: grid; place-items: center; border-radius: 5px; background: #eef1f5; color: #667081; font-size: 7px; font-style: normal; font-weight: 850; }.school-row > div { display: flex; min-width: 0; flex-direction: column; gap: 3px; }.school-row strong { overflow: hidden; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }.school-row span { color: #9299a6; font-size: 6px; }.school-row > b { color: #39445b; font-size: 11px; }.school-row.selected { margin: 0 -5px; padding-right: 8px; padding-left: 8px; border-radius: 5px; background: var(--blue-soft); }.school-row.selected > i { background: var(--blue); color: white; }.school-row.selected > b { color: var(--blue); }
.fit-panel { padding: 16px; }.fit-heading { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid #edf0f4; }.fit-heading > div { display: flex; flex-direction: column; gap: 4px; }.fit-heading small { color: #9299a6; font-size: 6px; text-transform: uppercase; }.fit-heading strong { font-size: 10px; }.fit-heading > b { color: var(--blue); font-size: 21px; }.fit-heading > b span { color: #9aa1ad; font-size: 7px; }.fit-bar { display: grid; grid-template-columns: 70px minmax(0,1fr) 20px; align-items: center; gap: 8px; margin: 14px 0; }.fit-bar > span { color: #737b89; font-size: 7px; }.fit-bar > i { height: 6px; overflow: hidden; border-radius: 4px; background: #edf0f4; }.fit-bar > i b { display: block; height: 100%; border-radius: inherit; background: var(--blue); }.fit-bar > i b.yellow { background: var(--yellow); }.fit-bar > strong { font-size: 7px; text-align: right; }.fit-panel > p { margin-top: 15px; padding: 10px; border-left: 3px solid var(--green); background: var(--green-soft); color: #517165; font-size: 7px; line-height: 1.5; }.fit-panel > p strong { color: #176f57; }
.essay-layout { display: grid; grid-template-columns: minmax(280px,.85fr) minmax(390px,1.15fr); gap: 10px; }.essay-index { padding: 12px; }.essay-filter { display: flex; justify-content: space-between; margin-bottom: 6px; }.essay-filter strong { font-size: 9px; }.essay-filter span { color: var(--green); font-size: 7px; font-weight: 800; }.essay-item { display: grid; grid-template-columns: 7px minmax(0,1fr) auto; align-items: center; gap: 9px; padding: 13px 6px; border-top: 1px solid #edf0f4; }.essay-item > i { width: 7px; height: 7px; border-radius: 50%; background: var(--blue); }.essay-item > i.green { background: var(--green); }.essay-item > i.yellow { background: var(--yellow); }.essay-item > i.gray { background: #a5abb5; }.essay-item > div { display: flex; min-width: 0; flex-direction: column; gap: 3px; }.essay-item strong { overflow: hidden; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }.essay-item span { color: #9299a6; font-size: 6px; }.essay-item > b { padding: 4px 6px; border-radius: 4px; background: var(--yellow-soft); color: #8d6814; font-size: 5px; }.essay-item > b.done { background: var(--green-soft); color: var(--green); }.essay-item.selected { margin: 0 -3px; padding-right: 9px; padding-left: 9px; background: var(--blue-soft); border-radius: 5px; }
.editor-panel { padding: 17px; }.editor-top { display: flex; justify-content: space-between; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid #edf0f4; }.editor-top > div { display: flex; flex-direction: column; gap: 4px; }.editor-top small { color: var(--blue); font-size: 6px; font-weight: 850; }.editor-top strong { font-size: 11px; }.editor-top button { padding: 0 9px; border: 0; border-radius: 5px; background: var(--ink); color: white; font-size: 6px; font-weight: 800; }.editor-panel > p { margin-top: 15px; color: #4f5869; font-family: Georgia,serif; font-size: 9px; line-height: 1.7; }.editor-feedback { display: flex; gap: 8px; margin-top: 16px; padding: 10px; border-left: 3px solid var(--coral); background: var(--coral-soft); }.editor-feedback b { flex: 0 0 auto; color: #c8473b; font-size: 6px; }.editor-feedback span { color: #805b58; font-size: 6px; line-height: 1.45; }.word-count { display: flex; justify-content: space-between; margin-top: 13px; color: #9299a6; font-size: 6px; }.word-count span { color: var(--green); }.word-count strong { color: #747c89; }
.money-summary { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 10px; }.money-summary article { display: flex; flex-direction: column; padding: 13px; }.money-summary span { color: #858c99; font-size: 7px; }.money-summary strong { margin: 6px 0 3px; font-size: 18px; }.money-summary small { color: #969da9; font-size: 6px; }.cost-comparison { padding: 0 14px; }.cost-row { display: grid; grid-template-columns: 1.55fr repeat(4,1fr); align-items: center; gap: 8px; padding: 13px 3px; border-top: 1px solid #edf0f4; font-size: 7px; }.cost-row:first-child { border-top: 0; }.cost-head { color: #969da9; font-size: 6px; font-weight: 850; text-transform: uppercase; }.cost-row > strong { display: flex; align-items: center; gap: 7px; }.school-badge { width: 24px; height: 24px; display: grid; flex: 0 0 auto; place-items: center; border-radius: 5px; color: white; font-size: 6px; font-style: normal; }.school-badge.blue { background: var(--blue); }.school-badge.coral { background: var(--coral); }.school-badge.green { background: var(--green); }.school-badge.yellow { background: var(--yellow); }.cost-row .positive { color: var(--green); }.cost-row em { color: var(--coral); font-style: normal; font-weight: 750; }.cost-row.best { margin: 0 -7px; padding-right: 10px; padding-left: 10px; border-radius: 5px; background: var(--green-soft); }.cost-row.best em { color: var(--green); }.cost-note { display: flex; gap: 8px; margin-top: 10px; padding: 10px 12px; border: 1px solid #bfe5d6; border-radius: 5px; background: var(--green-soft); color: #527166; font-size: 7px; }.cost-note strong { color: var(--green); }

.product-strip { display: flex; min-height: 74px; align-items: center; justify-content: center; gap: 22px; padding: 18px 26px; border-bottom: 1px solid var(--line); background: var(--paper); color: #777c85; font-size: 9px; font-weight: 850; text-transform: uppercase; }.product-strip i { width: 4px; height: 4px; border-radius: 50%; background: var(--coral); }
.organization-lab { display: grid; grid-template-columns: .67fr 1.33fr; gap: 80px; padding: 120px max(28px,calc((100vw - 1200px)/2)); background: #f1f5ff; }
.lab-copy { align-self: center; }.lab-copy h2 { margin: 0; color: var(--ink); font-size: 42px; line-height: 1.08; }.lab-copy > p { max-width: 450px; margin-top: 20px; color: #677187; font-size: 12px; line-height: 1.7; }
.lab-toggle { display: inline-flex; margin-top: 28px; padding: 4px; border: 1px solid #c8d0e0; border-radius: 7px; background: white; }.lab-toggle button { min-height: 38px; padding: 0 13px; border: 0; border-radius: 5px; background: transparent; color: #6f7788; font-size: 9px; font-weight: 800; cursor: pointer; }.lab-toggle button.active { background: var(--ink); color: white; box-shadow: 0 5px 14px rgba(17,19,24,.18); }
.lab-result { display: flex; flex-direction: column; gap: 5px; margin-top: 27px; padding-top: 18px; border-top: 1px solid #c8d0e0; }.lab-result span { color: var(--blue); font-size: 8px; font-weight: 850; text-transform: uppercase; }.lab-result strong { font-size: 12px; }
.lab-stage { position: relative; min-height: 540px; overflow: hidden; border: 1px solid #c8d0e0; border-radius: 8px; background: #dfe5f0; box-shadow: 18px 18px 0 #c6d1ed; transition: background .25s ease; }.lab-stage.control { background: #f8f9fb; }
.chaos-stage { position: absolute; inset: 0; background: #dfe5f0; }
.mess-window { position: absolute; display: flex; flex-direction: column; border: 1px solid #bfc7d4; border-radius: 6px; background: white; box-shadow: 0 14px 28px rgba(38,47,66,.18); }.mess-window strong { color: #283144; }.mess-window p { color: #697386; }
.mess-window.spreadsheet { top: 44px; left: 42px; width: 370px; height: 210px; padding: 0 16px 15px; transform: rotate(-4deg); }.spreadsheet > div { display: flex; align-items: center; gap: 5px; height: 34px; margin: 0 -16px 15px; padding: 0 10px; border-bottom: 1px solid #dfe3e9; background: #f3f5f7; }.spreadsheet > div i { width: 7px; height: 7px; border-radius: 50%; background: #d0d4da; }.spreadsheet > div span { margin-left: 8px; color: #8c929d; font-size: 7px; }.spreadsheet strong { font-size: 11px; }.spreadsheet p { margin-top: 13px; padding: 9px; border: 1px solid #dce3df; background: #f3faf5; font-family: monospace; font-size: 8px; line-height: 2; }
.mess-window.notes { top: 88px; right: 38px; width: 230px; min-height: 230px; padding: 18px; background: #fff7cd; transform: rotate(5deg); }.mess-window.notes small { color: #a18124; font-size: 7px; font-weight: 850; }.mess-window.notes strong { margin-top: 13px; font-family: Georgia,serif; font-size: 13px; }.mess-window.notes p { margin-top: 13px; color: #746736; font-family: Georgia,serif; font-size: 9px; line-height: 1.9; }
.mess-window.calendar { bottom: 35px; left: 70px; width: 205px; min-height: 150px; padding: 16px; background: #fff; transform: rotate(3deg); }.mess-window.calendar small { color: var(--coral); font-size: 7px; font-weight: 850; }.mess-window.calendar b { margin-top: 8px; font-size: 9px; }.mess-window.calendar strong { margin-top: 10px; color: var(--coral); font-size: 24px; }.mess-window.calendar p { margin-top: 4px; font-size: 7px; }
.mess-window.document { right: 75px; bottom: 46px; width: 260px; padding: 15px; transform: rotate(-3deg); }.mess-window.document > span { width: 35px; height: 42px; display: grid; place-items: center; margin-bottom: 10px; border-radius: 4px; background: var(--coral-soft); color: #c8473b; font-size: 8px; font-weight: 850; }.mess-window.document strong { overflow: hidden; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.mess-window.document small { margin-top: 5px; color: #9a9fa9; font-size: 6px; }
.mess-window.tabs { top: 230px; left: 305px; width: 250px; padding: 14px; transform: rotate(2deg); }.mess-window.tabs small { color: var(--blue); font-size: 7px; font-weight: 850; }.mess-window.tabs p { margin-top: 7px; padding: 7px; border-radius: 4px; background: #f0f3f7; font-size: 7px; }
.missed-signal { position: absolute; z-index: 4; top: 19px; right: 18px; display: flex; align-items: center; gap: 9px; padding: 9px 11px; border: 1px solid #f3aea7; border-radius: 6px; background: #fff1ef; box-shadow: 0 8px 22px rgba(120,42,34,.16); }.missed-signal > span { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%; background: var(--coral); color: white; font-size: 11px; font-weight: 850; }.missed-signal p { display: flex; flex-direction: column; gap: 2px; }.missed-signal strong { color: #a6372d; font-size: 8px; }.missed-signal small { color: #95635e; font-size: 6px; }
.control-stage { height: 100%; padding: 25px; }.control-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 1px solid #e0e4ea; }.control-header > div { display: flex; align-items: center; gap: 10px; }.control-header > div > span { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 7px; background: var(--coral); color: white; font-size: 10px; font-weight: 850; }.control-header p { display: flex; flex-direction: column; gap: 3px; }.control-header strong { font-size: 11px; }.control-header small { color: #8b929e; font-size: 7px; }.control-header > b { padding: 5px 7px; border-radius: 4px; background: var(--green-soft); color: var(--green); font-size: 7px; }
.control-school { display: grid; grid-template-columns: 42px 1fr auto; align-items: center; gap: 11px; margin: 22px 0 0; padding: 13px 15px; border: 1px solid #ccd6f4; border-radius: 6px; background: var(--blue-soft); }.control-school > i { width: 39px; height: 39px; display: grid; place-items: center; border-radius: 6px; background: var(--blue); color: white; font-size: 9px; font-style: normal; font-weight: 850; }.control-school > div { display: flex; flex-direction: column; gap: 3px; }.control-school strong { font-size: 10px; }.control-school span { color: #69748d; font-size: 7px; }.control-school > b { color: var(--blue); font-size: 8px; }
.connection-line { height: 27px; display: flex; justify-content: space-around; padding: 0 60px; }.connection-line i { width: 1px; height: 100%; background: #b9c6ed; }
.control-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }.control-grid article { position: relative; min-width: 0; min-height: 145px; padding: 12px; border: 1px solid #dfe3ea; border-radius: 6px; background: white; }.control-grid article > span { position: absolute; top: 10px; right: 10px; color: #b1b6bf; font-size: 6px; font-weight: 850; }.control-grid small { color: var(--blue); font-size: 6px; font-weight: 850; }.control-grid strong { display: block; overflow: hidden; margin-top: 16px; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.control-grid p { margin-top: 6px; color: #8b929f; font-size: 7px; }.control-grid b { display: inline-block; margin-top: 18px; padding: 4px 5px; border-radius: 4px; background: #f0f2f5; color: #747c89; font-size: 6px; }.control-grid b.good { background: var(--green-soft); color: var(--green); }.control-grid b.warning { background: var(--coral-soft); color: #c8473b; }
.next-action { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; margin-top: 18px; padding: 14px 16px; border-radius: 6px; background: var(--ink); color: white; }.next-action span { color: #8fabff; font-size: 6px; font-weight: 850; }.next-action strong { font-size: 9px; }.next-action button { min-height: 31px; padding: 0 10px; border: 0; border-radius: 5px; background: var(--coral); color: white; font-size: 7px; font-weight: 850; }
.platform-section { padding: 120px max(28px,calc((100vw - 1200px)/2)); background: white; }.section-heading { display: grid; grid-template-columns: .7fr 1.3fr; gap: 70px; align-items: start; margin-bottom: 65px; }.section-heading .eyebrow { grid-column: 1; }.section-heading h2 { grid-column: 2; grid-row: 1 / span 2; margin: 0; color: var(--ink); font-size: 42px; line-height: 1.08; }.section-heading > p { grid-column: 2; max-width: 650px; margin-top: -32px; color: var(--muted); font-size: 13px; line-height: 1.7; transform: translateY(76px); }
.capability-grid { display: grid; grid-template-columns: repeat(12,1fr); gap: 10px; background: white; }.capability-grid article { min-height: 285px; padding: 25px; border: 1px solid var(--line); border-radius: 7px; background: white; }.capability-grid article:nth-child(1) { grid-column: span 7; background: var(--blue); color: white; }.capability-grid article:nth-child(2) { grid-column: span 5; }.capability-grid article:nth-child(3), .capability-grid article:nth-child(4), .capability-grid article:nth-child(5) { grid-column: span 4; }.capability-grid article:nth-child(6) { grid-column: span 12; min-height: 230px; background: var(--paper); }.capability-grid article > div { display: flex; justify-content: space-between; align-items: center; }.capability-grid article > div span { color: #9a9fa7; font-size: 9px; font-weight: 800; }.capability-grid article > div i { width: 11px; height: 11px; border-radius: 3px; background: var(--blue); }.capability-grid article:nth-child(1) > div span, .capability-grid article:nth-child(1) p, .capability-grid article:nth-child(1) small { color: rgba(255,255,255,.68); }.capability-grid article:nth-child(1) > div i { background: white; }.capability-grid .tone-coral > div i { background: var(--coral); }.capability-grid .tone-yellow > div i { background: var(--yellow); }.capability-grid .tone-green > div i { background: var(--green); }.capability-grid .tone-ink > div i { background: var(--ink); }.capability-grid h3 { margin: 78px 0 10px; font-size: 19px; }.capability-grid article:nth-child(1) h3 { font-size: 28px; }.capability-grid p { min-height: 68px; max-width: 650px; color: var(--muted); font-size: 11px; line-height: 1.6; }.capability-grid small { display: block; margin-top: 20px; color: #8b9099; font-size: 8px; font-weight: 750; }.capability-grid small b { margin-left: 5px; color: var(--blue); }.capability-grid article:nth-child(1) small b { color: white; }
.workflow-section { display: grid; grid-template-columns: .85fr 1.15fr; gap: 90px; padding: 120px max(28px,calc((100vw - 1200px)/2)); background: var(--ink); color: white; }.workflow-intro { position: sticky; top: 40px; align-self: start; }.workflow-intro h2 { max-width: 500px; margin: 0; color: white; font-size: 44px; line-height: 1.06; }.workflow-intro p { max-width: 500px; margin-top: 22px; color: rgba(255,255,255,.55); font-size: 13px; line-height: 1.7; }.workflow-list { border-top: 1px solid rgba(255,255,255,.15); }.workflow-list article { display: grid; grid-template-columns: 54px 1fr; gap: 18px; padding: 32px 0; border-bottom: 1px solid rgba(255,255,255,.15); }.workflow-list article > span { color: #8fabff; font-size: 9px; font-weight: 850; }.workflow-list h3 { margin: 0 0 9px; color: white; font-size: 20px; }.workflow-list p { max-width: 540px; color: rgba(255,255,255,.52); font-size: 11px; line-height: 1.65; }
.ai-section { display: grid; grid-template-columns: .82fr 1.18fr; gap: 80px; padding: 120px max(28px,calc((100vw - 1200px)/2)); background: #e9edff; }.ai-copy h2 { max-width: 480px; margin: 0; color: var(--ink); font-size: 42px; line-height: 1.08; }.ai-copy > p { max-width: 510px; margin: 20px 0 35px; color: #606a82; font-size: 13px; line-height: 1.7; }.ai-features { border-top: 1px solid #bdc7e5; }.ai-features div { display: grid; grid-template-columns: 150px 1fr; gap: 18px; padding: 17px 0; border-bottom: 1px solid #bdc7e5; }.ai-features strong { font-size: 10px; }.ai-features span { color: #667087; font-size: 9px; line-height: 1.5; }
.coach-demo { align-self: center; padding: 23px; border: 1px solid #c7cee2; border-radius: 8px; background: white; box-shadow: 18px 18px 0 #2f5bea; }.coach-top { display: flex; align-items: center; justify-content: space-between; padding-bottom: 17px; border-bottom: 1px solid #e4e7ed; }.coach-top > div { display: flex; align-items: center; gap: 10px; }.coach-top i { width: 33px; height: 33px; display: grid; place-items: center; border-radius: 6px; background: var(--ink); color: white; font-size: 9px; font-style: normal; font-weight: 850; }.coach-top span { display: flex; flex-direction: column; gap: 2px; }.coach-top strong { font-size: 10px; }.coach-top small { color: #9198a5; font-size: 7px; }.coach-top > b { padding: 5px 7px; border-radius: 4px; background: var(--green-soft); color: var(--green); font-size: 6px; }.coach-score { display: grid; grid-template-columns: 105px 1fr; gap: 18px; align-items: center; padding: 22px 0; border-bottom: 1px solid #e4e7ed; }.coach-score > div { height: 92px; display: flex; align-items: baseline; justify-content: center; padding-top: 26px; border: 9px solid #dfe5fb; border-top-color: var(--blue); border-right-color: var(--blue); border-radius: 50%; }.coach-score > div strong { font-size: 24px; }.coach-score > div span { color: #9299a7; font-size: 8px; }.coach-score p { display: flex; flex-direction: column; gap: 7px; }.coach-score p b { color: var(--blue); font-size: 10px; }.coach-score p span { color: #6f7786; font-size: 8px; line-height: 1.55; }.coach-metrics { display: grid; grid-template-columns: repeat(2,1fr); gap: 13px 22px; padding: 20px 0; border-bottom: 1px solid #e4e7ed; }.coach-metrics > div { display: grid; grid-template-columns: 52px 1fr 20px; align-items: center; gap: 7px; }.coach-metrics span { color: #737b89; font-size: 7px; }.coach-metrics i { height: 5px; overflow: hidden; border-radius: 3px; background: #edf0f4; }.coach-metrics i b { display: block; height: 100%; border-radius: inherit; background: var(--blue); }.coach-metrics strong { font-size: 7px; text-align: right; }.coach-action { display: grid; grid-template-columns: 26px 1fr; gap: 8px; padding-top: 16px; }.coach-action > span { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 4px; background: var(--coral-soft); color: #c7473b; font-size: 6px; font-weight: 850; }.coach-action p { display: flex; flex-direction: column; gap: 4px; }.coach-action strong { font-size: 8px; }.coach-action small { color: #7e8592; font-size: 7px; line-height: 1.45; }
.trust-section { padding: 120px max(28px,calc((100vw - 1200px)/2)); background: var(--paper); }.trust-heading { display: grid; grid-template-columns: .6fr 1.4fr; gap: 60px; margin-bottom: 60px; }.trust-heading h2 { max-width: 760px; margin: 0; color: var(--ink); font-size: 42px; line-height: 1.08; }.trust-grid { display: grid; grid-template-columns: repeat(4,1fr); border-top: 1px solid #cfd1cf; border-bottom: 1px solid #cfd1cf; }.trust-grid article { min-height: 225px; padding: 24px; border-right: 1px solid #cfd1cf; }.trust-grid article:last-child { border-right: 0; }.trust-grid span { color: var(--green); font-size: 9px; font-weight: 850; }.trust-grid h3 { margin: 58px 0 10px; font-size: 16px; }.trust-grid p { color: var(--muted); font-size: 10px; line-height: 1.6; }
.final-cta { min-height: 540px; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 90px 24px; background: var(--ink); color: white; text-align: center; }.final-cta h2 { max-width: 820px; margin: 0; color: white; font-size: 52px; line-height: 1.04; }.final-cta > p { max-width: 600px; margin: 18px 0 28px; color: rgba(255,255,255,.57); font-size: 14px; }.final-cta > div { display: flex; align-items: center; gap: 20px; }.final-cta a { color: rgba(255,255,255,.7); font-size: 11px; font-weight: 750; text-decoration: none; }.final-cta > small { margin-top: 16px; color: rgba(255,255,255,.34); font-size: 8px; }
footer { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px; padding: 28px max(28px,calc((100vw - 1200px)/2)); border-top: 1px solid #2d3038; background: var(--ink); color: white; }footer p { color: rgba(255,255,255,.4); font-size: 9px; }footer > div:last-child { display: flex; justify-content: flex-end; gap: 20px; }footer a { color: rgba(255,255,255,.58); font-size: 9px; text-decoration: none; }

@keyframes preview-enter { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .hero-preview { animation: none; } }
@media (max-width: 1050px) {
    .site-nav { grid-template-columns: 1fr 1fr; padding: 0 24px; }.site-nav nav { display: none; }
    .hero { min-height: 1000px; padding-right: 24px; padding-left: 24px; }.hero-copy { grid-template-columns: .5fr 1.5fr; gap: 42px; }.hero-statement { font-size: 47px; }.preview-shell { grid-template-columns: 135px minmax(0,1fr); }.preview-shell { height: 540px; }.preview-nav { padding-right: 8px; padding-left: 8px; }.preview-canvas { padding: 20px; }.canvas-heading p { max-width: 500px; }
    .organization-lab { grid-template-columns: 1fr; gap: 50px; }.lab-copy { max-width: 650px; }.lab-stage { min-height: 520px; }
    .section-heading, .trust-heading { grid-template-columns: 1fr; gap: 18px; }.section-heading .eyebrow, .section-heading h2, .section-heading > p { grid-column: 1; grid-row: auto; }.section-heading > p { margin-top: 0; transform: none; }.capability-grid { grid-template-columns: repeat(2,1fr); }.capability-grid article, .capability-grid article:nth-child(2), .capability-grid article:nth-child(3), .capability-grid article:nth-child(4), .capability-grid article:nth-child(5) { grid-column: span 1; }.capability-grid article:nth-child(1), .capability-grid article:nth-child(6) { grid-column: 1 / -1; }
    .workflow-section, .ai-section { gap: 48px; }.trust-grid { grid-template-columns: repeat(2,1fr); }.trust-grid article:nth-child(2) { border-right: 0; }.trust-grid article:nth-child(-n+2) { border-bottom: 1px solid #cfd1cf; }
    .research-grid, .essay-layout { grid-template-columns: 1fr; }.school-list, .essay-index { display: none; }
}
@media (max-width: 720px) {
    .site-nav { height: 66px; padding: 0 16px; }.brand { font-size: 15px; }.brand-mark { width: 28px; height: 28px; }.nav-actions { gap: 11px; }.nav-actions button { min-height: 34px; padding: 0 11px; }.nav-actions a { font-size: 9px; }
    .hero { min-height: auto; padding: 104px 14px 65px; }.hero-copy { grid-template-columns: 1fr; gap: 28px; margin-bottom: 34px; }.hero-identity { min-height: 0; padding: 0 0 22px; border-right: 0; border-bottom: 1px solid rgba(255,255,255,.15); }.hero-identity .eyebrow { margin-bottom: 18px; }.hero-index { margin-top: 13px; }.hero h1 { font-size: 38px; }.hero-statement { font-size: 38px; line-height: 1.04; }.hero-support { margin-top: 20px; font-size: 13px; }.hero-actions { align-items: flex-start; flex-direction: column; gap: 15px; }.hero-assurances { flex-wrap: wrap; gap: 8px 15px; }.signal-rail { display: flex; overflow-x: auto; border-bottom: 0; }.signal-rail > div { min-width: 190px; }
    .hero-preview { width: 760px; max-width: none; transform: scale(.47); transform-origin: top left; }.hero-preview { margin-bottom: -310px; }.preview-shell { grid-template-columns: 145px 1fr; }.preview-nav { display: flex; }.preview-canvas { padding: 20px; }
    .product-strip { justify-content: flex-start; gap: 14px; overflow-x: auto; white-space: nowrap; }.product-strip span { flex: 0 0 auto; }
    .organization-lab, .platform-section, .workflow-section, .ai-section, .trust-section { padding: 78px 20px; }.lab-copy h2, .section-heading h2, .workflow-intro h2, .ai-copy h2, .trust-heading h2 { font-size: 34px; }.lab-stage { width: 760px; max-width: none; min-height: 540px; transform: scale(.44); transform-origin: top left; }.organization-lab { overflow: hidden; }.lab-stage { margin-bottom: -298px; }.section-heading { margin-bottom: 42px; }.capability-grid { grid-template-columns: 1fr; }.capability-grid article, .capability-grid article:nth-child(1), .capability-grid article:nth-child(2), .capability-grid article:nth-child(3), .capability-grid article:nth-child(4), .capability-grid article:nth-child(5), .capability-grid article:nth-child(6) { grid-column: 1; }.capability-grid article { min-height: 245px; }.capability-grid h3 { margin-top: 56px; }
    .workflow-section, .ai-section { grid-template-columns: 1fr; }.workflow-intro { position: static; }.workflow-list { margin-top: 10px; }.workflow-list article { grid-template-columns: 40px 1fr; }.ai-section { gap: 52px; }.ai-features div { grid-template-columns: 1fr; gap: 5px; }.coach-demo { margin-right: 10px; padding: 17px; box-shadow: 10px 10px 0 var(--blue); }.coach-score { grid-template-columns: 82px 1fr; }.coach-score > div { width: 78px; height: 78px; padding-top: 20px; border-width: 7px; }.coach-metrics { grid-template-columns: 1fr; }
    .trust-heading { margin-bottom: 40px; }.trust-grid { grid-template-columns: 1fr; }.trust-grid article { min-height: 190px; border-right: 0; border-bottom: 1px solid #cfd1cf; }.trust-grid article:nth-child(3) { border-bottom: 1px solid #cfd1cf; }.trust-grid article:last-child { border-bottom: 0; }.trust-grid h3 { margin-top: 38px; }
    .final-cta { min-height: 480px; padding: 70px 20px; }.final-cta h2 { font-size: 39px; }.final-cta > div { flex-direction: column; gap: 16px; }
    footer { grid-template-columns: 1fr auto; padding: 24px 18px; }footer p { display: none; }footer > div:last-child a:not(:last-child) { display: none; }
}
</style>
