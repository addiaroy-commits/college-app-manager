<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { getUserKey } from "../stores/userKey";

const router = useRouter();
const step = ref(0);

const steps = [
    {
        emoji: "🎓",
        title: "Welcome to CogApp",
        desc: "Your all-in-one college application organizer. Every college, every essay, every deadline, every document — all in one  place. No more spreadsheets, sticky notes, or forgotten deadlines.",
        detail: false,
    },
    {
        emoji: "🏫",
        title: "1. Build Your College List",
        desc: "Search 7,000+ real US colleges and add them to your list with one click. Each college gets a category (Reach, Target, Safety), a deadline, and application type (ED, EA, RD). Filter, search, and organize your dream schools.",
        hint: "Tip: Use the 'Search Database' button to auto-fill college info from the US Department of Education!",
    },
    {
        emoji: "🔎",
        title: "2. Research, Compare & Rank",
        desc: "Compare colleges side by side, score academic and personal fit, save research notes, and record visits or interviews. CogApp turns your priorities into a ranked list without duplicating deadlines or cost data.",
        hint: "Tip: Choose your fit priorities first, then rate each college from 1 to 5!",
    },
    {
        emoji: "🗂️",
        title: "3. Run Your Application Command Center",
        desc: "Turn every college into a complete application plan. Track statuses and requirements, manage tasks and reminders, organize recommendation letters, and see every important date on one calendar.",
        hint: "Tip: Add colleges first and CogApp will automatically build a checklist for each application!",
    },
    {
        emoji: "🎓",
        title: "4. Explore Majors & Minors",
        desc: "Browse 100+ majors across categories like Engineering, Business, Arts, and Sciences. Set your top 3 major and minor picks, rank them, and add notes about career goals. Add your own custom majors with any category.",
        hint: "Tip: Use the category filters to quickly find majors in your field of interest!",
    },
    {
        emoji: "🌟",
        title: "5. The Brag Sheet",
        desc: "Everything colleges want to know about you — GPA, courses, AP scores, clubs, sports, awards, volunteering, skills, and more. Each category has its own tab with custom forms. Attach files, track years, and build your complete profile.",
        hint: "Tip: Use the '+' button next to tabs to create your own custom categories!",
    },
    {
        emoji: "✍️",
        title: "6. Track Every Essay",
        desc: "Click any college to add essays — unlimited per school. Set essay targets and watch your progress bar fill up. Write directly in the app with a live word counter, or attach documents. Mark essays 'Done' and get a confetti celebration!",
        hint: "Tip: Use the Common App card at the top to track all 7 Common App prompts!",
    },
    {
        emoji: "💰",
        title: "7. Track Costs & Budget",
        desc: "Add cost data for every college — tuition auto-fills from real government data. Set a tuition budget in Goals and see which colleges fit and which exceed. Track aid, loans, and your family contribution.",
        hint: "Tip: Pick a college from the dropdown and tuition fills automatically!",
    },
    {
        emoji: "🎯",
        title: "8. Set Goals & Track Stats",
        desc: "Set goals for how many colleges to apply to, how many essays to write, and your budget. The Stats page shows charts and progress rings. Watch your numbers grow as you complete each milestone.",
        hint: "Tip: The Tuition Budget goal automatically checks your cost tracker data!",
    },
    {
        emoji: "📁",
        title: "9. Document Vault",
        desc: "Upload transcripts, resumes, and portfolios. Every attachment from essays and the Brag Sheet automatically appears here. Search, preview, download — one unified place for every file in your application.",
        hint: "Tip: Use the search bar to find any document by name, type, or source!",
    },
    {
        emoji: "🎓",
        title: "10. Explore Scholarships",
        desc: "Find, organize, and complete scholarship applications. Track deadlines, required materials, and award amounts. Use the AI assistant to check eligibility and get essay outlines. Every dollar counts!",
        hint: "Tip: Use the match score to find scholarships that best fit your profile!",
    },
    {
        emoji: "💾",
        title: "11. Protect Your Account",
        desc: "Your work is tied to your unique account and saved locally first, then synced to the cloud. The Backup & Restore buttons on the Dashboard create a personal copy of your app data and uploaded documents.",
        hint: "Tip: Export a fresh backup after major application milestones.",
    },
    {
        emoji: "🔔",
        title: "12. Use AI Studio",
        desc: "Compare prompts with the Essay Reuse Mapper, get a focused revision plan from the Essay Coach, and use the Application Advisor to identify the most important next action across your entire college plan.",
        hint: "Tip: Your essay text stays on this device while the built-in analysis runs.",
    },
    {
        emoji: "🔔",
        title: "13. Stay Connected",
        desc: "Use notifications to catch upcoming deadlines, open Demo Mode to explore safely, and open the read-only Parent & Counselor View when you want feedback without sharing private essay or portal details.",
        hint: "Tip: Manage reminders, review privacy, appearance, and Demo Mode from Settings.",
    },
    {
        emoji: "🚀",
        title: "You're Ready!",
        desc: "Your entire college application journey — organized, tracked, and stress-free. Explore each tab in the sidebar. Add data, track progress, and take control of your future.",
        hint: "Start with the Dashboard to see your calendar and summary!",
    },
];

const isLast = computed(() => step.value === steps.length - 1);
const isFirst = computed(() => step.value === 0);

function next() {
    if (step.value < steps.length - 1) {
        step.value++;
    } else {
        finish();
    }
}
function prev() {
    if (step.value > 0) step.value--;
}
function skip() {
    finish();
}
function finish() {
    localStorage.setItem(getUserKey("onboarded"), "true");
    router.push("/");
}
</script>

<template>
    <div class="onboard-screen">
        <button class="skip-btn" @click="skip">Skip Tutorial →</button>

        <div class="onboard-body">
            <div class="onboard-emoji" :key="'e' + step">
                {{ steps[step].emoji }}
            </div>
            <h1 class="onboard-title" :key="'t' + step">
                {{ steps[step].title }}
            </h1>
            <p class="onboard-desc" :key="'d' + step">{{ steps[step].desc }}</p>
            <p v-if="steps[step].hint" class="onboard-hint" :key="'h' + step">
                💡 {{ steps[step].hint }}
            </p>
        </div>

        <div class="onboard-bottom">
            <div class="onboard-dots">
                <span
                    v-for="(_, i) in steps"
                    :key="i"
                    class="dot"
                    :class="{ active: i === step, done: i < step }"
                ></span>
            </div>
            <div class="onboard-buttons">
                <button v-if="!isFirst" class="nav-btn prev" @click="prev">
                    ← Back
                </button>
                <button class="nav-btn next" @click="next">
                    {{ isLast ? "🎉 Let's Go!" : "Next →" }}
                </button>
            </div>
            <p class="step-counter">{{ step + 1 }} of {{ steps.length }}</p>
        </div>
    </div>
</template>

<style scoped>
* {
    box-sizing: border-box;
}

.onboard-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(160deg, #1e1b4b 0%, #2d1b69 40%, #1e1b4b 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 40px;
    overflow-y: auto;
}

.skip-btn {
    position: absolute;
    top: 24px;
    right: 32px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 14px;
    cursor: pointer;
    z-index: 10;
    font-family: inherit;
}
.skip-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.onboard-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    max-width: 640px;
    width: 100%;
}

.onboard-emoji {
    font-size: 80px;
    margin-bottom: 24px;
    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
    0% {
        transform: scale(0.3);
        opacity: 0;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.onboard-title {
    font-size: 32px;
    font-weight: 800;
    color: white;
    margin-bottom: 16px;
    animation: fadeSlide 0.4s ease;
    line-height: 1.2;
}

.onboard-desc {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.7;
    animation: fadeSlide 0.45s ease;
    max-width: 540px;
}

.onboard-hint {
    margin-top: 20px;
    font-size: 15px;
    color: #c4b5fd;
    font-weight: 500;
    background: rgba(196, 181, 253, 0.12);
    padding: 12px 20px;
    border-radius: 12px;
    animation: fadeSlide 0.5s ease;
}

@keyframes fadeSlide {
    0% {
        opacity: 0;
        transform: translateY(16px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.onboard-bottom {
    padding-top: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: 400px;
}

.onboard-dots {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
}
.dot.active {
    background: #c4b5fd;
    width: 28px;
    border-radius: 5px;
}
.dot.done {
    background: rgba(196, 181, 253, 0.4);
}

.onboard-buttons {
    display: flex;
    gap: 12px;
    width: 100%;
}

.nav-btn {
    padding: 14px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
}

.nav-btn.next {
    background: #c4b5fd;
    color: #1e1b4b;
    border: none;
    flex: 1;
}
.nav-btn.next:hover {
    background: #ddd6fe;
    transform: translateY(-1px);
}

.nav-btn.prev {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 14px 24px;
}
.nav-btn.prev:hover {
    background: rgba(255, 255, 255, 0.2);
}

.step-counter {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
}
</style>
