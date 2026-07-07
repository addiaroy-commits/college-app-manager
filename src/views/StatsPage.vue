<script setup lang="ts">
import { computed } from "vue";
import { useCollegeStore } from "../stores/collegeStore";
import { useEssayStore } from "../stores/essayStore";
import { useDocumentStore } from "../stores/documentStore";
import { useScholarshipStore } from "../stores/scholarshipStore";

import { getUserKey } from "../stores/userKey";

const collegeStore = useCollegeStore();
const essayStore = useEssayStore();
const docStore = useDocumentStore();
const scholarshipStore = useScholarshipStore();

const collegeStats = computed(() => {
    const all = collegeStore.colleges;
    return {
        total: all.length,
        reach: all.filter((c) => c.category === "Reach").length,
        target: all.filter((c) => c.category === "Target").length,
        safety: all.filter((c) => c.category === "Safety").length,
    };
});

const essayStats = computed(() => {
    const all = essayStore.essays;
    return {
        total: all.length,
        notStarted: all.filter((e) => e.status === "Not Started").length,
        drafting: all.filter((e) => e.status === "Drafting").length,
        done: all.filter((e) => e.status === "Done").length,
        donePercent:
            all.length > 0
                ? Math.round(
                      (all.filter((e) => e.status === "Done").length /
                          all.length) *
                          100,
                  )
                : 0,
    };
});

const totalFees = computed(() =>
    collegeStore.colleges.reduce((sum, c) => sum + c.applicationFee, 0),
);

const totalWords = computed(() =>
    essayStore.essays.reduce((sum, e) => sum + e.currentWordCount, 0),
);

const docsByType = computed(() => {
    const types: Record<string, number> = {};
    docStore.documents.forEach((d) => {
        types[d.type] = (types[d.type] || 0) + 1;
    });
    return types;
});

const reachWidth = computed(() =>
    collegeStats.value.total > 0
        ? (collegeStats.value.reach / collegeStats.value.total) * 100
        : 0,
);
const targetWidth = computed(() =>
    collegeStats.value.total > 0
        ? (collegeStats.value.target / collegeStats.value.total) * 100
        : 0,
);
const safetyWidth = computed(() =>
    collegeStats.value.total > 0
        ? (collegeStats.value.safety / collegeStats.value.total) * 100
        : 0,
);

const scholarshipStats = computed(() => {
    const all = scholarshipStore.scholarships;
    const byStatus: Record<string, number> = {};
    all.forEach((s) => {
        byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    });
    return {
        total: all.length,
        won: all.filter((s) => s.status === "Won"),
        wonAmount: all
            .filter((s) => s.status === "Won")
            .reduce((sum, s) => sum + s.awardAmount, 0),
        totalPossible: all.reduce((sum, s) => sum + s.awardAmount, 0),
        submitted: all.filter((s) => s.status === "Submitted").length,
        byStatus,
    };
});

const doneDeg = computed(() => (essayStats.value.donePercent / 100) * 360);

// SAT/ACT Stats
const satActStats = computed(() => {
    try {
        const saved = localStorage.getItem(getUserKey("sat-act"));
        if (!saved) return null;
        const data = JSON.parse(saved);
        const satAttempts = (data.attempts || []).filter(
            (a: any) => a.type === "SAT" && a.superscoreEligible,
        );
        const actAttempts = (data.attempts || []).filter(
            (a: any) => a.type === "ACT",
        );
        let superscore = null;
        if (satAttempts.length > 0) {
            const bestMath = Math.max(
                ...satAttempts.map((a: any) => a.sections?.math || 0),
            );
            const bestReading = Math.max(
                ...satAttempts.map((a: any) => a.sections?.reading || 0),
            );
            superscore = {
                total: bestMath + bestReading,
                math: bestMath,
                reading: bestReading,
            };
        }
        const highestAct =
            actAttempts.length > 0
                ? Math.max(...actAttempts.map((a: any) => a.totalScore || 0))
                : null;
        const currentSat =
            superscore?.total ||
            satAttempts.reduce(
                (max: number, a: any) => Math.max(max, a.totalScore || 0),
                0,
            ) ||
            null;
        return {
            highestSat: currentSat,
            superscore,
            highestAct,
            attempts: (data.attempts || []).length,
            targetSat: data.targetSat || 0,
            targetAct: data.targetAct || 0,
            satGoalPercent:
                data.targetSat > 0
                    ? Math.min(
                          Math.round(
                              ((currentSat || 0) / data.targetSat) * 100,
                          ),
                          100,
                      )
                    : 0,
            actGoalPercent:
                data.targetAct > 0
                    ? Math.min(
                          Math.round(
                              ((highestAct || 0) / data.targetAct) * 100,
                          ),
                          100,
                      )
                    : 0,
        };
    } catch {
        return null;
    }
});
</script>

<template>
    <div>
        <h2>📊 Stats & Charts</h2>
        <p class="welcome">Your application journey by the numbers.</p>

        <!-- Top Stats Row -->
        <div class="stat-row">
            <div class="stat-box">
                <div class="stat-number">{{ collegeStats.total }}</div>
                <div class="stat-label">Total Colleges</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">{{ essayStats.total }}</div>
                <div class="stat-label">Total Essays</div>
            </div>
            <div class="stat-box">
                <div class="stat-number">{{ docStore.documents.length }}</div>
                <div class="stat-label">Documents</div>
            </div>
            <div class="stat-box highlight">
                <div class="stat-number">${{ totalFees.toLocaleString() }}</div>
                <div class="stat-label">Total Fees</div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="chart-grid">
            <!-- College Breakdown -->
            <div class="panel">
                <h3>🏫 Colleges by Category</h3>
                <div v-if="collegeStats.total === 0" class="panel-empty">
                    Add colleges to see stats!
                </div>
                <div v-else>
                    <div class="bar-row">
                        <span class="bar-label">Reach</span>
                        <div class="bar-track">
                            <div
                                class="bar-fill reach"
                                :style="{ width: reachWidth + '%' }"
                            ></div>
                        </div>
                        <span class="bar-num">{{ collegeStats.reach }}</span>
                    </div>
                    <div class="bar-row">
                        <span class="bar-label">Target</span>
                        <div class="bar-track">
                            <div
                                class="bar-fill target"
                                :style="{ width: targetWidth + '%' }"
                            ></div>
                        </div>
                        <span class="bar-num">{{ collegeStats.target }}</span>
                    </div>
                    <div class="bar-row">
                        <span class="bar-label">Safety</span>
                        <div class="bar-track">
                            <div
                                class="bar-fill safety"
                                :style="{ width: safetyWidth + '%' }"
                            ></div>
                        </div>
                        <span class="bar-num">{{ collegeStats.safety }}</span>
                    </div>
                </div>
            </div>

            <!-- Essay Progress Ring -->
            <div class="panel center-panel">
                <h3>✍️ Essay Progress</h3>
                <div v-if="essayStats.total === 0" class="panel-empty">
                    Add essays to see progress!
                </div>
                <div v-else class="ring-container">
                    <svg viewBox="0 0 120 120" class="ring-svg">
                        <circle cx="60" cy="60" r="50" class="ring-bg" />
                        <circle
                            cx="60"
                            cy="60"
                            r="50"
                            class="ring-fill"
                            :style="{
                                strokeDasharray:
                                    (doneDeg * 3.14 * 50) / 180 +
                                    ' ' +
                                    3.14 * 100,
                            }"
                        />
                    </svg>
                    <div class="ring-text">
                        <div class="ring-percent">
                            {{ essayStats.donePercent }}%
                        </div>
                        <div class="ring-sub">
                            {{ essayStats.done }}/{{ essayStats.total }} done
                        </div>
                    </div>
                </div>
                <div class="essay-legend">
                    <span class="legend-dot not-started"></span>
                    {{ essayStats.notStarted }} Not Started
                    <span class="legend-dot drafting"></span>
                    {{ essayStats.drafting }} Drafting
                    <span class="legend-dot done"></span>
                    {{ essayStats.done }} Done
                </div>
            </div>
        </div>

        <!-- Bottom Row -->
        <div class="chart-grid">
            <!-- Documents by Type -->
            <div class="panel">
                <h3>📁 Documents by Type</h3>
                <div v-if="docStore.documents.length === 0" class="panel-empty">
                    Upload documents to see stats!
                </div>
                <div v-else class="doc-type-list">
                    <div
                        v-for="(count, type) in docsByType"
                        :key="type"
                        class="doc-type-row"
                    >
                        <span>{{ type }}</span>
                        <span class="doc-type-count">{{ count }}</span>
                    </div>
                </div>
            </div>

            <!-- Quick Facts -->
            <div class="panel">
                <h3>💡 Quick Facts</h3>
                <div class="fact-row">
                    <span>📝 Total Words Written</span>
                    <strong>{{ totalWords.toLocaleString() }}</strong>
                </div>
                <div class="fact-row">
                    <span>🏫 Colleges Applied To</span>
                    <strong>{{ collegeStats.total }}</strong>
                </div>
                <div class="fact-row">
                    <span>💰 Avg Fee Per College</span>
                    <strong
                        >${{
                            collegeStats.total > 0
                                ? Math.round(
                                      totalFees / collegeStats.total,
                                  ).toLocaleString()
                                : 0
                        }}</strong
                    >
                </div>
                <div class="fact-row">
                    <span>📅 Deadlines Set</span>
                    <strong>{{
                        collegeStore.colleges.filter((c) => c.deadline).length
                    }}</strong>
                </div>
            </div>
        </div>

        <!-- SAT / ACT -->
        <div v-if="satActStats" class="stat-row" style="margin-top: 24px">
            <div class="stat-card">
                <div class="stat-num">{{ satActStats.highestSat || "—" }}</div>
                <div class="stat-label">Highest SAT</div>
            </div>
            <div class="stat-card">
                <div class="stat-num">
                    {{ satActStats.superscore?.total || "—" }}
                </div>
                <div class="stat-label">SAT Superscore</div>
            </div>
            <div class="stat-card">
                <div class="stat-num">{{ satActStats.highestAct || "—" }}</div>
                <div class="stat-label">Highest ACT</div>
            </div>
            <div class="stat-card">
                <div class="stat-num">{{ satActStats.attempts }}</div>
                <div class="stat-label">Attempts</div>
            </div>
            <div class="stat-card" v-if="satActStats.targetSat > 0">
                <div class="stat-num">{{ satActStats.satGoalPercent }}%</div>
                <div class="stat-label">
                    SAT Goal ({{ satActStats.targetSat }})
                </div>
            </div>
            <div class="stat-card" v-if="satActStats.targetAct > 0">
                <div class="stat-num">{{ satActStats.actGoalPercent }}%</div>
                <div class="stat-label">
                    ACT Goal ({{ satActStats.targetAct }})
                </div>
            </div>
        </div>

        <!-- Scholarships -->
        <div class="stat-row" style="margin-top: 24px">
            <div class="stat-card">
                <div class="stat-num">{{ scholarshipStats.total }}</div>
                <div class="stat-label">Scholarships</div>
            </div>
            <div class="stat-card">
                <div class="stat-num green">
                    {{ scholarshipStats.submitted }}
                </div>
                <div class="stat-label">Submitted</div>
            </div>
            <div class="stat-card">
                <div class="stat-num gold">
                    ${{
                        scholarshipStats.wonAmount >= 1000
                            ? (scholarshipStats.wonAmount / 1000).toFixed(0) +
                              "k"
                            : scholarshipStats.wonAmount
                    }}
                </div>
                <div class="stat-label">Award Won</div>
            </div>
            <div class="stat-card">
                <div class="stat-num purple">
                    ${{
                        scholarshipStats.totalPossible >= 1000
                            ? (scholarshipStats.totalPossible / 1000).toFixed(
                                  0,
                              ) + "k"
                            : scholarshipStats.totalPossible
                    }}
                </div>
                <div class="stat-label">Total Possible</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.welcome {
    color: var(--text-secondary);
    margin-bottom: 24px;
}

.stat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

.stat-box {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 20px;
    text-align: center;
}

.stat-box.highlight {
    background: rgba(30, 27, 75, 0.05);
    border-color: #1e1b4b;
}

.stat-number {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
}

.stat-label {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
}

/* Charts */
.chart-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
}

.panel {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 24px;
}

.panel h3 {
    margin: 0 0 20px;
    font-size: 16px;
    color: var(--text-primary);
}

.panel-empty {
    color: var(--text-secondary);
    font-size: 14px;
    text-align: center;
    padding: 30px 0;
}

/* Bar Chart */
.bar-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
}

.bar-label {
    width: 50px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
}

.bar-track {
    flex: 1;
    height: 22px;
    background: var(--border-light);
    border-radius: 11px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    border-radius: 11px;
    transition: width 0.5s ease;
}

.bar-fill.reach {
    background: #dc2626;
}
.bar-fill.target {
    background: #d97706;
}
.bar-fill.safety {
    background: #059669;
}

.bar-num {
    width: 24px;
    text-align: right;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
}

/* Ring Chart */
.center-panel {
    text-align: center;
}

.ring-container {
    position: relative;
    width: 140px;
    height: 140px;
    margin: 0 auto 16px;
}

.ring-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.ring-bg {
    fill: none;
    stroke: var(--border-light);
    stroke-width: 12;
}

.ring-fill {
    fill: none;
    stroke: #059669;
    stroke-width: 12;
    stroke-linecap: round;
    transition: stroke-dasharray 0.5s ease;
}

.ring-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.ring-percent {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
}

.ring-sub {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
}

.essay-legend {
    font-size: 13px;
    color: var(--text-secondary);
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
}

.legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

.legend-dot.not-started {
    background: #6b7280;
}
.legend-dot.drafting {
    background: #2563eb;
}
.legend-dot.done {
    background: #059669;
}

/* Doc Types */
.doc-type-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.doc-type-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: var(--text-primary);
    padding: 8px 0;
    border-bottom: 1px solid var(--border-light);
}

.doc-type-row:last-child {
    border-bottom: none;
}

.doc-type-count {
    font-weight: 600;
}

/* Quick Facts */
.fact-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-light);
    font-size: 14px;
    color: var(--text-secondary);
}

.fact-row:last-child {
    border-bottom: none;
}

.fact-row strong {
    color: var(--text-primary);
}
</style>
