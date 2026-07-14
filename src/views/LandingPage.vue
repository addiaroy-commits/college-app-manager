<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

type PreviewMode = "Dashboard" | "Essays" | "Costs";

const router = useRouter();
const previewMode = ref<PreviewMode>("Dashboard");
const previewModes: PreviewMode[] = ["Dashboard", "Essays", "Costs"];

const featureGroups = [
    {
        number: "01",
        title: "Plan every application",
        copy: "College lists, fit rankings, research notes, requirements, tasks, recommendations, and one deadline calendar.",
        detail: "Research + applications",
    },
    {
        number: "02",
        title: "Keep every draft connected",
        copy: "Write and track essays, compare prompts for reusable material, and get focused coaching without replacing your voice.",
        detail: "Essays + AI Studio",
    },
    {
        number: "03",
        title: "Know the real cost",
        copy: "Compare tuition, aid, family contribution, loans, scholarships, and the remaining gap before decision day.",
        detail: "Costs + scholarships",
    },
    {
        number: "04",
        title: "Protect the important stuff",
        copy: "Documents and account data save locally first, sync privately, and can be exported in a complete personal backup.",
        detail: "Vault + backups",
    },
];

function start() {
    void router.push("/signup");
}
</script>

<template>
    <div class="landing-page">
        <header class="site-nav">
            <router-link class="brand" to="/welcome">
                <span class="brand-mark">C</span>
                <span>CogApp</span>
            </router-link>
            <nav aria-label="Website navigation">
                <a href="#features">Features</a>
                <a href="#workflow">How it works</a>
                <a href="#privacy">Privacy</a>
            </nav>
            <div class="nav-actions">
                <router-link class="sign-in" to="/login">Sign in</router-link>
                <button @click="start">Get started</button>
            </div>
        </header>

        <main>
            <section class="hero">
                <div class="hero-copy">
                    <span class="beta-label"><i></i> Public beta is live</span>
                    <h1>CogApp</h1>
                    <p class="hero-line">Your college application operating system.</p>
                    <p class="hero-support">Research schools, manage every requirement, improve essays, compare costs, and protect your documents in one private workspace.</p>
                    <div class="hero-actions">
                        <button class="main-cta" @click="start">Get started free</button>
                        <router-link to="/login">I already have an account</router-link>
                    </div>
                    <div class="hero-facts">
                        <span>No credit card</span>
                        <span>Personal backups</span>
                        <span>Private account data</span>
                    </div>
                </div>

                <div class="product-scene" aria-label="Interactive CogApp product preview">
                    <div class="preview-browser">
                        <div class="browser-bar">
                            <div class="browser-dots"><i></i><i></i><i></i></div>
                            <div class="browser-address">cogapp / {{ previewMode.toLowerCase() }}</div>
                            <span>Beta</span>
                        </div>
                        <div class="preview-app">
                            <aside class="preview-sidebar">
                                <strong>CogApp</strong>
                                <button
                                    v-for="mode in previewModes"
                                    :key="mode"
                                    :class="{ active: previewMode === mode }"
                                    @click="previewMode = mode"
                                >
                                    <span>{{ mode === 'Dashboard' ? 'D' : mode === 'Essays' ? 'E' : '$' }}</span>{{ mode }}
                                </button>
                                <div class="preview-divider"></div>
                                <small>Applications</small>
                                <div class="ghost-link">College List</div>
                                <div class="ghost-link">Research</div>
                                <div class="ghost-link">Documents</div>
                            </aside>

                            <div v-if="previewMode === 'Dashboard'" class="preview-main">
                                <div class="preview-heading"><div><small>Tuesday, July 14</small><h2>Application overview</h2></div><span class="status-online">All saved</span></div>
                                <div class="metric-grid">
                                    <div><span>Colleges</span><strong>8</strong><small>3 reach · 3 target · 2 safety</small></div>
                                    <div><span>Applications</span><strong>64%</strong><small>2 ready to submit</small></div>
                                    <div><span>Essays</span><strong>11</strong><small>6 complete · 3 drafting</small></div>
                                    <div><span>Scholarships</span><strong>$18k</strong><small>Tracked award value</small></div>
                                </div>
                                <div class="preview-content-grid">
                                    <section class="preview-section">
                                        <div class="section-top"><strong>Next up</strong><span>View calendar</span></div>
                                        <div class="deadline-row urgent"><i>3d</i><div><strong>Northwestern supplement</strong><span>High priority · Essay</span></div><b>In progress</b></div>
                                        <div class="deadline-row"><i>7d</i><div><strong>Jordan Teacher recommendation</strong><span>Alpha University</span></div><b>Confirmed</b></div>
                                        <div class="deadline-row"><i>14d</i><div><strong>Beta Test Award</strong><span>Scholarship · $2,500</span></div><b>To do</b></div>
                                    </section>
                                    <section class="preview-section progress-section">
                                        <div class="section-top"><strong>Application health</strong><span>78%</span></div>
                                        <div class="ring"><span>78<small>%</small></span></div>
                                        <p>Five applications are on track. Focus on two essays this week.</p>
                                    </section>
                                </div>
                            </div>

                            <div v-else-if="previewMode === 'Essays'" class="preview-main">
                                <div class="preview-heading"><div><small>Essay workspace</small><h2>Every draft in one place</h2></div><button class="preview-action">Open AI Studio</button></div>
                                <div class="essay-summary">
                                    <div><strong>11</strong><span>Total essays</span></div><div><strong>6</strong><span>Complete</span></div><div><strong>3</strong><span>Drafting</span></div>
                                </div>
                                <section class="preview-section essay-list">
                                    <div class="essay-row"><div><span class="college-dot lilac"></span><p><strong>Common App Personal Statement</strong><small>487 / 650 words</small></p></div><b class="drafting">Drafting</b></div>
                                    <div class="essay-row"><div><span class="college-dot green"></span><p><strong>Community Contribution</strong><small>Beta College · 250 words</small></p></div><b class="done">Done</b></div>
                                    <div class="essay-row"><div><span class="college-dot blue"></span><p><strong>Why Alpha University?</strong><small>214 / 300 words</small></p></div><b class="drafting">Drafting</b></div>
                                    <div class="essay-row"><div><span class="college-dot gray"></span><p><strong>Academic Interest</strong><small>Gamma State · 300 word limit</small></p></div><b>Not started</b></div>
                                </section>
                            </div>

                            <div v-else class="preview-main">
                                <div class="preview-heading"><div><small>Decision planning</small><h2>Compare the cost that matters</h2></div><span class="status-online">Estimates saved</span></div>
                                <div class="cost-summary"><div><span>Tracked aid</span><strong>$67,500</strong></div><div><span>Scholarships won</span><strong>$7,500</strong></div><div><span>Average net cost</span><strong>$38,200</strong></div></div>
                                <section class="preview-section cost-table">
                                    <div class="cost-head"><span>College</span><span>Sticker price</span><span>Aid</span><span>Net cost</span></div>
                                    <div><strong>Alpha University</strong><span>$58,000</span><span class="aid">-$18,000</span><b>$40,000</b></div>
                                    <div><strong>Beta College</strong><span>$50,000</span><span class="aid">-$12,000</span><b>$38,000</b></div>
                                    <div><strong>Gamma State</strong><span>$37,500</span><span class="aid">-$8,000</span><b>$29,500</b></div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="hero-bottom-line">
                    <span>COLLEGE RESEARCH</span><i></i><span>APPLICATIONS</span><i></i><span>ESSAYS</span><i></i><span>FINANCIAL PLANNING</span>
                </div>
            </section>

            <section id="features" class="features-band">
                <div class="section-intro">
                    <span class="section-label">One connected workspace</span>
                    <h2>Everything connected.<br />Nothing scattered.</h2>
                    <p>CogApp replaces the spreadsheet, the notes app, the calendar, the document folder, and several increasingly desperate browser tabs.</p>
                </div>
                <div class="feature-list">
                    <article v-for="feature in featureGroups" :key="feature.number">
                        <span class="feature-number">{{ feature.number }}</span>
                        <div><small>{{ feature.detail }}</small><h3>{{ feature.title }}</h3><p>{{ feature.copy }}</p></div>
                    </article>
                </div>
            </section>

            <section id="workflow" class="workflow-band">
                <div class="section-intro compact">
                    <span class="section-label">A calmer process</span>
                    <h2>From college list to decision day.</h2>
                </div>
                <div class="workflow-grid">
                    <article><span>1</span><h3>Build your plan</h3><p>Add colleges, deadlines, application types, requirements, and the tasks needed to finish each one.</p></article>
                    <article><span>2</span><h3>Connect your work</h3><p>Keep essays, documents, recommendations, research, scholarships, and costs tied to the right application.</p></article>
                    <article><span>3</span><h3>Know what is next</h3><p>Use reminders, calendar events, completion scores, and the Application Advisor to focus your time.</p></article>
                </div>
            </section>

            <section id="privacy" class="privacy-band">
                <div class="privacy-copy">
                    <span class="section-label">Your work stays yours</span>
                    <h2>Built for trust, not data anxiety.</h2>
                    <p>Your account keeps its own private workspace. CogApp saves locally first, synchronizes your supported records, and gives you a full personal backup whenever you want one.</p>
                    <router-link to="/signup">Create your private workspace <span>→</span></router-link>
                </div>
                <div class="privacy-points">
                    <div><strong>Account separation</strong><span>Each login has its own data and settings.</span></div>
                    <div><strong>Local-first saving</strong><span>Work remains available through temporary network problems.</span></div>
                    <div><strong>Full backup</strong><span>Export your application records and uploaded files.</span></div>
                    <div><strong>Reviewer privacy</strong><span>Share progress without exposing essay text or portal details.</span></div>
                </div>
            </section>

            <section class="final-cta">
                <span class="section-label">Your application deserves one home</span>
                <h2>Less searching. More finishing.</h2>
                <p>Start organizing your college application process in CogApp.</p>
                <button @click="start">Get started free</button>
                <small>No credit card required · Public beta</small>
            </section>
        </main>

        <footer>
            <div class="brand"><span class="brand-mark">C</span><span>CogApp</span></div>
            <p>College applications, kept together.</p>
            <div><router-link to="/login">Sign in</router-link><router-link to="/signup">Create account</router-link></div>
        </footer>
    </div>
</template>

<style scoped>
.landing-page {
    --landing-ink: #17151c;
    --landing-paper: #f7f8fa;
    --landing-white: #ffffff;
    --landing-purple: #8b5cf6;
    --landing-purple-soft: #eee8ff;
    --landing-green: #1f8a70;
    --landing-green-soft: #eaf7f2;
    min-height: 100vh;
    overflow: hidden;
    background: var(--landing-white);
    color: var(--landing-ink);
}
.site-nav { position: absolute; z-index: 20; top: 0; left: 0; right: 0; height: 74px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 24px; max-width: 1440px; margin: 0 auto; padding: 0 42px; color: white; }
.brand { display: inline-flex; align-items: center; gap: 9px; color: inherit; font-size: 17px; font-weight: 800; text-decoration: none; }
.brand-mark { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 7px; background: var(--landing-purple); color: white; font-size: 14px; }
.site-nav nav { display: flex; align-items: center; gap: 28px; }
.site-nav nav a, .sign-in { color: rgba(255,255,255,.72); font-size: 12px; font-weight: 650; text-decoration: none; }
.site-nav nav a:hover, .sign-in:hover { color: white; }
.nav-actions { display: flex; justify-content: flex-end; align-items: center; gap: 17px; }
.nav-actions button { padding: 9px 14px; border: 1px solid rgba(255,255,255,.32); border-radius: 6px; background: white; color: var(--landing-ink); font-size: 11px; font-weight: 800; cursor: pointer; }
.hero { position: relative; min-height: 760px; display: flex; align-items: center; overflow: hidden; padding: 110px max(42px, calc((100vw - 1360px) / 2)) 76px; background: var(--landing-ink); color: white; }
.hero::before { content: ""; position: absolute; inset: 74px 0 auto; height: 1px; background: rgba(255,255,255,.09); }
.hero-copy { position: relative; z-index: 6; width: min(520px, 42vw); padding-bottom: 38px; }
.beta-label { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 22px; color: rgba(255,255,255,.68); font-size: 10px; font-weight: 750; text-transform: uppercase; }
.beta-label i { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 0 4px rgba(74,222,128,.13); }
.hero h1 { margin: 0; color: white; font-size: 72px; line-height: .98; letter-spacing: 0; }
.hero-line { max-width: 470px; margin-top: 15px; color: white; font-size: 29px; font-weight: 650; line-height: 1.12; }
.hero-support { max-width: 480px; margin-top: 18px; color: rgba(255,255,255,.64); font-size: 14px; line-height: 1.65; }
.hero-actions { display: flex; align-items: center; gap: 19px; margin-top: 27px; }
.main-cta, .final-cta button { padding: 13px 18px; border: 0; border-radius: 6px; background: var(--landing-purple); color: white; font-size: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 24px rgba(139,92,246,.28); }
.hero-actions a { color: rgba(255,255,255,.78); font-size: 11px; font-weight: 700; text-decoration: none; }
.hero-actions a:hover { color: white; }
.hero-facts { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 22px; }
.hero-facts span { color: rgba(255,255,255,.48); font-size: 9px; font-weight: 650; }
.hero-facts span::before { content: "✓"; margin-right: 5px; color: #4ade80; }
.product-scene { position: absolute; z-index: 4; top: 118px; right: max(24px, calc((100vw - 1430px) / 2)); width: min(810px, 59vw); perspective: 1200px; }
.preview-browser { overflow: hidden; border: 1px solid rgba(255,255,255,.19); border-radius: 8px; background: #f8fafc; box-shadow: 0 28px 70px rgba(0,0,0,.48); transform: rotateY(-3deg) rotateX(1deg); transform-origin: right center; }
.browser-bar { height: 35px; display: grid; grid-template-columns: 74px 1fr 44px; align-items: center; gap: 8px; padding: 0 11px; border-bottom: 1px solid #e5e7eb; background: #f3f4f6; color: #687080; }
.browser-dots { display: flex; gap: 5px; }
.browser-dots i { width: 7px; height: 7px; border-radius: 50%; background: #d1d5db; }
.browser-dots i:first-child { background: #f19a91; }.browser-dots i:nth-child(2) { background: #f3c666; }.browser-dots i:last-child { background: #76c995; }
.browser-address { padding: 4px 10px; border: 1px solid #e5e7eb; border-radius: 4px; background: white; font-size: 7px; text-align: center; }
.browser-bar > span { color: #8b5cf6; font-size: 7px; font-weight: 800; text-align: right; text-transform: uppercase; }
.preview-app { height: 520px; display: grid; grid-template-columns: 128px minmax(0,1fr); color: #172033; }
.preview-sidebar { padding: 18px 9px; background: #eee9f7; }
.preview-sidebar > strong { display: block; margin: 0 9px 18px; color: #28203c; font-size: 13px; }
.preview-sidebar button { width: 100%; display: flex; align-items: center; gap: 7px; margin-bottom: 4px; padding: 7px 8px; border: 0; border-radius: 5px; background: transparent; color: #6f6586; font-size: 8px; font-weight: 700; cursor: pointer; text-align: left; }
.preview-sidebar button span { width: 16px; height: 16px; display: grid; place-items: center; border-radius: 4px; background: rgba(255,255,255,.58); font-size: 7px; }
.preview-sidebar button.active { background: rgba(91,33,182,.13); color: #5b21b6; }
.preview-divider { height: 1px; margin: 14px 8px 11px; background: rgba(91,33,182,.12); }
.preview-sidebar small { display: block; margin: 0 9px 5px; color: #968ba8; font-size: 6px; font-weight: 800; text-transform: uppercase; }
.ghost-link { padding: 5px 9px; color: #776d89; font-size: 7px; }
.preview-main { min-width: 0; padding: 23px; background: #f8fafc; }
.preview-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; margin-bottom: 20px; }
.preview-heading small { display: block; margin-bottom: 3px; color: #8b94a5; font-size: 7px; }
.preview-heading h2 { margin: 0; color: #172033; font-size: 17px; }
.status-online { padding: 5px 7px; border-radius: 4px; background: #e6f6ed; color: #17865f; font-size: 7px; font-weight: 800; }
.metric-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 9px; }
.metric-grid > div, .preview-section, .essay-summary > div, .cost-summary > div { border: 1px solid #e5e9ef; border-radius: 6px; background: white; }
.metric-grid > div { display: flex; min-width: 0; flex-direction: column; padding: 12px; }
.metric-grid span, .cost-summary span { color: #818a99; font-size: 7px; font-weight: 700; }
.metric-grid strong { margin: 6px 0 4px; color: #242d3d; font-size: 18px; }
.metric-grid small { overflow: hidden; color: #9aa2af; font-size: 6px; text-overflow: ellipsis; white-space: nowrap; }
.preview-content-grid { display: grid; grid-template-columns: minmax(0,1.65fr) minmax(150px,.6fr); gap: 10px; margin-top: 10px; }
.preview-section { padding: 14px; }
.section-top { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.section-top strong { font-size: 9px; }.section-top span { color: #7c3aed; font-size: 7px; font-weight: 750; }
.deadline-row { display: grid; grid-template-columns: 27px minmax(0,1fr) auto; align-items: center; gap: 8px; padding: 10px 0; border-top: 1px solid #edf0f4; }
.deadline-row > i { width: 25px; height: 25px; display: grid; place-items: center; border-radius: 5px; background: #eef2ff; color: #4f46e5; font-size: 7px; font-style: normal; font-weight: 800; }.deadline-row.urgent > i { background: #fee2e2; color: #dc2626; }
.deadline-row div { display: flex; min-width: 0; flex-direction: column; gap: 2px; }.deadline-row strong { overflow: hidden; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }.deadline-row span { color: #939baa; font-size: 6px; }.deadline-row > b { color: #8a93a3; font-size: 6px; font-weight: 700; }
.progress-section { text-align: center; }.ring { width: 94px; height: 94px; display: grid; place-items: center; margin: 22px auto 14px; border: 9px solid #e8e1fa; border-top-color: #7c3aed; border-right-color: #7c3aed; border-radius: 50%; transform: rotate(18deg); }.ring span { color: #293144; font-size: 22px; font-weight: 800; transform: rotate(-18deg); }.ring small { font-size: 8px; }.progress-section p { color: #8a93a3; font-size: 7px; line-height: 1.5; }
.preview-action { padding: 6px 9px; border: 0; border-radius: 5px; background: #6d28d9; color: white; font-size: 7px; font-weight: 800; }
.essay-summary, .cost-summary { display: grid; grid-template-columns: repeat(3,1fr); gap: 9px; margin-bottom: 11px; }.essay-summary > div, .cost-summary > div { display: flex; flex-direction: column; padding: 11px; }.essay-summary strong, .cost-summary strong { color: #253047; font-size: 16px; }.essay-summary span { margin-top: 2px; color: #8a93a3; font-size: 7px; }
.essay-list { padding: 4px 14px; }.essay-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px 2px; border-bottom: 1px solid #edf0f4; }.essay-row:last-child { border-bottom: 0; }.essay-row > div { display: flex; align-items: center; gap: 9px; }.college-dot { width: 25px; height: 25px; border-radius: 5px; background: #ede9fe; }.college-dot.green { background: #d1fae5; }.college-dot.blue { background: #dbeafe; }.college-dot.gray { background: #e5e7eb; }.essay-row p { display: flex; flex-direction: column; gap: 3px; }.essay-row strong { font-size: 8px; }.essay-row small { color: #929aa8; font-size: 6px; }.essay-row b { padding: 4px 6px; border-radius: 4px; background: #f3f4f6; color: #7b8493; font-size: 6px; }.essay-row b.drafting { background: #fef3c7; color: #a16207; }.essay-row b.done { background: #d1fae5; color: #047857; }
.cost-summary strong { margin-top: 6px; }.cost-table { padding: 0 14px; }.cost-table > div { display: grid; grid-template-columns: 1.5fr repeat(3,1fr); gap: 8px; align-items: center; padding: 14px 2px; border-top: 1px solid #edf0f4; font-size: 7px; }.cost-table .cost-head { border-top: 0; color: #929aa8; font-size: 6px; font-weight: 800; text-transform: uppercase; }.cost-table .aid { color: #059669; }.cost-table b { font-size: 8px; }
.hero-bottom-line { position: absolute; z-index: 7; bottom: 22px; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: 16px; color: rgba(255,255,255,.33); font-size: 8px; font-weight: 800; }.hero-bottom-line i { width: 3px; height: 3px; border-radius: 50%; background: var(--landing-purple); }
.features-band, .workflow-band, .privacy-band { padding: 105px max(42px, calc((100vw - 1240px) / 2)); }
.features-band { display: grid; grid-template-columns: minmax(300px,.75fr) minmax(520px,1.25fr); gap: 90px; background: white; }
.section-label { display: block; margin-bottom: 13px; color: var(--landing-green); font-size: 9px; font-weight: 850; text-transform: uppercase; }
.section-intro h2, .privacy-copy h2, .final-cta h2 { margin: 0; color: var(--landing-ink); font-size: 41px; line-height: 1.08; }
.section-intro > p { max-width: 410px; margin-top: 20px; color: #707583; font-size: 13px; line-height: 1.65; }
.feature-list { border-top: 1px solid #dfe3e8; }
.feature-list article { display: grid; grid-template-columns: 42px 1fr; gap: 14px; padding: 24px 0; border-bottom: 1px solid #dfe3e8; }
.feature-number { color: #a0a6b2; font-size: 9px; font-weight: 750; }.feature-list small { color: var(--landing-purple); font-size: 8px; font-weight: 800; text-transform: uppercase; }.feature-list h3 { margin: 5px 0 7px; font-size: 17px; }.feature-list p { max-width: 580px; color: #707583; font-size: 11px; line-height: 1.55; }
.workflow-band { background: var(--landing-paper); }.section-intro.compact { max-width: 660px; }.workflow-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; margin-top: 50px; border: 1px solid #dfe3e8; background: #dfe3e8; }.workflow-grid article { min-height: 245px; padding: 28px; background: white; }.workflow-grid article > span { width: 29px; height: 29px; display: grid; place-items: center; border-radius: 6px; background: var(--landing-purple-soft); color: #6d28d9; font-size: 10px; font-weight: 850; }.workflow-grid h3 { margin: 54px 0 9px; font-size: 18px; }.workflow-grid p { color: #707583; font-size: 11px; line-height: 1.6; }
.privacy-band { display: grid; grid-template-columns: minmax(340px,.9fr) minmax(460px,1.1fr); gap: 90px; background: var(--landing-green-soft); }.privacy-copy p { max-width: 500px; margin: 20px 0; color: #527168; font-size: 13px; line-height: 1.65; }.privacy-copy a { color: #126c58; font-size: 11px; font-weight: 800; text-decoration: none; }.privacy-copy a span { margin-left: 5px; }.privacy-points { border-top: 1px solid #b9dacf; }.privacy-points div { display: grid; grid-template-columns: 165px 1fr; gap: 20px; padding: 20px 0; border-bottom: 1px solid #b9dacf; }.privacy-points strong { font-size: 11px; }.privacy-points span { color: #527168; font-size: 10px; line-height: 1.5; }
.final-cta { display: flex; min-height: 450px; flex-direction: column; align-items: center; justify-content: center; padding: 80px 30px; background: var(--landing-ink); color: white; text-align: center; }.final-cta .section-label { color: #a78bfa; }.final-cta h2 { color: white; font-size: 48px; }.final-cta p { margin: 14px 0 25px; color: rgba(255,255,255,.62); font-size: 13px; }.final-cta small { margin-top: 12px; color: rgba(255,255,255,.42); font-size: 8px; }
footer { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px; padding: 26px max(30px,calc((100vw - 1240px)/2)); background: #111014; color: white; }footer p { color: rgba(255,255,255,.42); font-size: 9px; }footer > div:last-child { display: flex; justify-content: flex-end; gap: 18px; }footer a { color: rgba(255,255,255,.65); font-size: 9px; text-decoration: none; }
@media (max-width: 1050px) {
    .site-nav { padding: 0 24px; }.site-nav nav { display: none; }.site-nav { grid-template-columns: 1fr 1fr; }
    .hero { min-height: 840px; align-items: flex-start; padding: 120px 28px 70px; }.hero-copy { width: 55%; }.hero h1 { font-size: 61px; }.hero-line { font-size: 25px; }
    .product-scene { top: 280px; right: -190px; width: 760px; opacity: .78; }.preview-browser { transform: rotateY(-3deg); }
    .features-band, .privacy-band { gap: 48px; padding: 82px 30px; }.features-band { grid-template-columns: .8fr 1.2fr; }
}
@media (max-width: 720px) {
    .site-nav { height: 64px; padding: 0 15px; }.brand { font-size: 15px; }.brand-mark { width: 27px; height: 27px; }.nav-actions { gap: 10px; }.nav-actions button { padding: 8px 10px; }.sign-in { font-size: 10px; }
    .hero { min-height: 820px; padding: 104px 18px 65px; }.hero::before { top: 64px; }.hero-copy { width: 100%; padding: 0; }.hero h1 { font-size: 51px; }.hero-line { max-width: 330px; font-size: 23px; }.hero-support { max-width: 420px; font-size: 12px; }.hero-actions { align-items: flex-start; flex-direction: column; gap: 13px; }.hero-facts { gap: 10px; }
    .product-scene { top: 495px; right: -245px; width: 680px; opacity: .52; pointer-events: none; }.preview-app { height: 440px; }.hero-bottom-line { display: none; }
    .features-band, .privacy-band { grid-template-columns: 1fr; gap: 45px; padding: 72px 20px; }.section-intro h2, .privacy-copy h2 { font-size: 34px; }.feature-list article { grid-template-columns: 34px 1fr; }
    .workflow-band { padding: 72px 20px; }.workflow-grid { grid-template-columns: 1fr; }.workflow-grid article { min-height: 200px; }.workflow-grid h3 { margin-top: 36px; }
    .privacy-points div { grid-template-columns: 1fr; gap: 5px; }.final-cta { min-height: 390px; padding: 60px 20px; }.final-cta h2 { font-size: 38px; }
    footer { grid-template-columns: 1fr auto; padding: 22px 18px; }footer p { display: none; }
}
</style>
