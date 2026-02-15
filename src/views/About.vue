<template>
  <div class="about-page">
    <!-- 1. Info & Highlights Section -->
    <section class="section-container info-highlights">
      <!-- Profile Hero -->
      <div class="profile-hero">
        <div class="avatar-wrapper">
          <img src="https://github.com/TallMessiWu.png" alt="Avatar" class="avatar" />
        </div>
        <div class="profile-content">
           <h1 class="name">{{ t('about.profile.name') }}</h1>
           <p class="title">{{ t('about.profile.title') }}</p>
           <p class="bio">{{ t('about.profile.bio') }}</p>
           <div class="social-links">
             <a href="https://github.com/TallMessiWu" target="_blank" class="social-btn">
               <img src="https://cdn.simpleicons.org/github/var(--color-text-primary)" alt="GitHub" />
             </a>
             <a href="mailto:Junlin-Wu@foxmail.com" class="social-btn">
               <el-icon :size="20"><Message /></el-icon>
             </a>
           </div>
        </div>
      </div>

      <!-- Highlights Grid -->
      <div class="highlights-grid">
        <!-- Education Card -->
        <div class="highlight-card education-card">
          <div class="card-header">
            <el-icon><School /></el-icon>
             <h3>{{ t('about.sections.education') }}</h3>
          </div>
          <div class="card-content">
             <div v-for="(edu, index) in educationList" :key="index" class="list-item">
               <div class="item-main">{{ edu.school }}</div>
               <div class="item-sub">{{ edu.degree }}</div>
               <div class="item-meta">{{ edu.year }}</div>
             </div>
          </div>
        </div>

        <!-- Work Experience Card -->
        <div class="highlight-card work-card">
          <div class="card-header">
            <el-icon><Briefcase /></el-icon>
             <h3>{{ t('about.sections.experience') }}</h3>
          </div>
          <div class="card-content">
             <div v-for="(job, index) in workList" :key="index" class="list-item">
               <div class="item-main">{{ job.company }}</div>
               <div class="item-sub">{{ job.role }}</div>
               <div class="item-desc">{{ job.desc }}</div>
             </div>
          </div>
        </div>

        <!-- Projects Card -->
        <div class="highlight-card projects-card">
          <div class="card-header">
            <el-icon><Folder /></el-icon>
             <h3>{{ t('about.sections.projects') }}</h3>
          </div>
          <div class="card-content">
             <a v-for="(proj, index) in projectList" :key="index" :href="proj.link" target="_blank" class="list-item project-link">
               <div class="item-main">
                 {{ proj.name }}
                 <el-icon class="link-icon"><TopRight /></el-icon>
               </div>
               <div class="item-desc">{{ proj.desc }}</div>
             </a>
          </div>
        </div>

        <!-- Skills Card -->
        <div class="highlight-card skills-card">
          <div class="card-header">
            <el-icon><Cpu /></el-icon>
             <h3>{{ t('about.sections.skills') }}</h3>
          </div>
          <div class="card-content tags-content">
             <span v-for="skill in skillsList" :key="skill" class="skill-pill">{{ skill }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Timeline Section -->
    <section class="section-container timeline-section">
       <h2 class="section-title">{{ t('about.sections.timeline') }}</h2>

      <div class="timeline-container">
        <!-- Left: Fixed Year Axis -->
        <div class="timeline-axis">
            <div class="axis-line"></div>
            <div
                v-for="tick in yearTicks"
                :key="tick.year"
                class="axis-year"
                :style="{ top: tick.top + 'px' }"
            >
                {{ tick.year }}
            </div>

            <!-- Event Month Markers -->
            <div
                v-for="(marker, idx) in eventMarkers"
                :key="'marker-'+idx"
                class="axis-month"
                :style="{ top: marker.top + 'px' }"
            >
                {{ marker.label }}
            </div>
        </div>

        <!-- Right: Events Area -->
        <div class="timeline-events" :style="{ height: containerHeight + 'px' }">
            <div
              v-for="(event, index) in processedEvents"
              :key="index"
              class="geo-event-block"
              :style="getGeoEventStyle(event, index)"
            >
               <div class="geo-content" :style="{ '--desc-lines': event.descLines }">
                 <div class="geo-time" :class="{ 'is-hidden': !event.showTime }">
                    <span class="time-range">{{ formatEventDate(event.startDate) }} - {{ formatEventDate(event.endDate) }}</span>
                 </div>
                 <h4 class="geo-title">{{ event.raw.title }}</h4>
                 <p class="geo-desc" :class="{ 'is-hidden': !event.showDesc }">{{ event.raw.description }}</p>
               </div>
            </div>
        </div>
      </div>
    </section>

    <!-- 3. Hobbies Section -->
     <section class="section-container hobbies-section">
      <h2 class="section-title">{{ t('about.sections.hobbies') }}</h2>
      <div class="hobbies-grid">
        <div v-for="(hobby, index) in hobbiesList" :key="index" class="hobby-item">
            <div class="hobby-icon-wrapper">
                <component :is="getIcon(hobby.icon)" />
            </div>
            <span class="hobby-name">{{ hobby.name }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';
import {
  Message, School, Briefcase, Folder, Cpu, TopRight,
  Monitor, Headset, Microphone, Basketball, Mouse, Trophy
} from '@element-plus/icons-vue';

const { t, tm } = useI18n();

useHead({
  title: computed(() => `${t('nav.about')} | ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: 'Learn more about TallMessiwu, my background, skills, and journey as a developer.'
    }
  ]
})

// Data Helpers
const educationList = computed(() => tm('about.highlights.education') || []);
const workList = computed(() => tm('about.highlights.work') || []);
const projectList = computed(() => tm('about.highlights.projects') || []);
const skillsList = computed(() => tm('about.highlights.skills') || []);
const timelineList = computed(() => (tm('about.timeline') as any[]) || []);
const hobbiesList = computed(() => tm('about.hobbies') || []);


// --- Geometric Timeline Logic ---

const PIXELS_PER_MONTH = 20; // Increase scale for better visibility
const MIN_EVENT_HEIGHT = 80;
const GAP = 15;

interface GeoEvent {
    raw: any;
    startDate: Date;
    endDate: Date;
    top: number;
    bottom: number;
    height: number;

    // Layout Props
    laneIndex: number;
    renderTop: number;
    renderHeight: number;
    left: string;
    width: string;
    borderRadius: string;
    showTime: boolean;
    showDesc: boolean;
    descLines: number;
}

interface YearTick {
    year: number;
    top: number;
}

const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    if (dateStr.match(/(Present|至今|Current|在读)/i)) {
        return new Date();
    }
    const cleanStr = dateStr.trim();
    const zhMatch = cleanStr.match(/(\d{4})年(\d{1,2})月/);
    if (zhMatch) return new Date(parseInt(zhMatch[1]), parseInt(zhMatch[2]) - 1, 1);
    const dotMatch = cleanStr.match(/^(\d{4})\.(\d{1,2})$/);
    if (dotMatch) return new Date(parseInt(dotMatch[1]), parseInt(dotMatch[2]) - 1, 1);
    const enMatch = Date.parse(cleanStr);
    if (!isNaN(enMatch)) return new Date(enMatch);
    if (/^\d{4}$/.test(cleanStr)) return new Date(parseInt(cleanStr), 0, 1);
    return new Date(); // Fallback
};

const formatEventDate = (date: Date) => {
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

// Global Time Range for Scaling
const timeRange = computed(() => {
    const rawEvents = [...timelineList.value];
    if (rawEvents.length === 0) return { min: new Date(), max: new Date() };

    let min = new Date();
    let max = new Date(0); // Epoch

    rawEvents.forEach(e => {
        const s = parseDate(e.start);
        const end = parseDate(e.end);
        if (s < min) min = s;
        if (end > max) max = end;
    });

    const paddedMax = new Date(max);
    paddedMax.setMonth(paddedMax.getMonth() + 3);
    const paddedMin = new Date(min);
    paddedMin.setMonth(paddedMin.getMonth() - 3);

    return { min: paddedMin, max: paddedMax };
});

const getTopFromDate = (date: Date, maxDate: Date) => {
    const diffMonths = (maxDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    return diffMonths * PIXELS_PER_MONTH;
}

const yearTicks = computed(() => {
    const { min, max } = timeRange.value;
    const ticks: YearTick[] = [];

    const startYear = max.getFullYear();
    const endYear = min.getFullYear() - 1;

    for (let y = startYear; y >= endYear; y--) {
        const d = new Date(y + 1, 0, 1);
        ticks.push({
            year: y,
            top: getTopFromDate(d, max)
        });
    }
    return ticks;
});

const eventMarkers = computed(() => {
    const markers: { top: number, label: string }[] = [];

    processedEvents.value.forEach(e => {
        markers.push({
            top: e.top,
            label: (e.endDate.getMonth() + 1).toString().padStart(2, '0')
        });
        markers.push({
            top: e.bottom,
            label: (e.startDate.getMonth() + 1).toString().padStart(2, '0')
        });
    });

    const unique: { top: number, label: string }[] = [];
    markers.sort((a,b) => a.top - b.top).forEach(m => {
        if (unique.length === 0 || Math.abs(unique[unique.length-1].top - m.top) > 10) {
            unique.push(m);
        }
    });

    return unique;
});

const GAP_PERCENT = 2; // Gap between lanes in percent

const processedEvents = computed(() => {
    const rawEvents = [...timelineList.value];
    if (rawEvents.length === 0) return [];
    const { max } = timeRange.value;

    // 1. Parse & sort by endDate desc
    const events: GeoEvent[] = rawEvents.map(e => ({
        raw: e,
        startDate: parseDate(e.start),
        endDate: parseDate(e.end),
        top: 0, bottom: 0, height: 0,
        laneIndex: 0,
        renderTop: 0, renderHeight: 0, left: '0%', width: '100%', borderRadius: '16px',
        showTime: true, showDesc: true, descLines: 3
    })).sort((a, b) => b.endDate.getTime() - a.endDate.getTime());

    if (events.length === 0) return [];

    // 2. Vertical position from time
    events.forEach(e => {
        e.top = getTopFromDate(e.endDate, max);
        const bottom = getTopFromDate(e.startDate, max);
        e.height = Math.max(bottom - e.top, MIN_EVENT_HEIGHT);
        e.bottom = e.top + e.height;
    });

    // 3. Greedy lane assignment (dynamic N lanes)
    const sortedForLayout = [...events].sort((a, b) => a.top - b.top);
    const lanes: GeoEvent[][] = [];

    sortedForLayout.forEach(e => {
        let placed = false;
        for (let i = 0; i < lanes.length; i++) {
            const lastInLane = lanes[i][lanes[i].length - 1];
            if (e.top >= lastInLane.bottom) {
                lanes[i].push(e);
                e.laneIndex = i;
                placed = true;
                break;
            }
        }
        if (!placed) {
            e.laneIndex = lanes.length;
            lanes.push([e]);
        }
    });

    // 4. For each event, find max concurrent lanes in its time range
    sortedForLayout.forEach(e => {
        // Find all events overlapping with this event
        const overlapping = sortedForLayout.filter(other =>
            !(other.bottom <= e.top || other.top >= e.bottom)
        );
        // Count distinct lanes used by overlapping events
        const usedLanes = new Set(overlapping.map(o => o.laneIndex));
        const concurrentCount = usedLanes.size;

        const widthPercent = (100 - (concurrentCount - 1) * GAP_PERCENT) / concurrentCount;
        const leftPercent = e.laneIndex * (widthPercent + GAP_PERCENT);

        e.width = `${widthPercent}%`;
        e.left = `${leftPercent}%`;
    });

    // 5. Render Props & content visibility
    const DESC_LINE_HEIGHT = 16; // 0.8rem * 1.3 line-height ≈ 16px
    events.forEach(e => {
        e.renderTop = e.top;
        e.renderHeight = Math.max(e.height - GAP, 60);
        // padding(8*2=16) + title(~18) + gap(2) = 36px baseline
        // + time(~20 + gap 2) = 58px
        const baseUsed = 36 + (e.renderHeight >= 55 ? 22 : 0); // title + optional time
        const availForDesc = e.renderHeight - baseUsed;
        e.descLines = Math.max(0, Math.floor(availForDesc / DESC_LINE_HEIGHT));
        e.showDesc = e.descLines > 0;
        e.showTime = e.renderHeight >= 55;
    });

    return events;
});

const containerHeight = computed(() => {
    // Max of (Last Tick Position) vs (Last Event Bottom)
    if (yearTicks.value.length === 0) return 500;
    const lastTick = yearTicks.value[yearTicks.value.length-1].top;

    let maxEventBottom = 0;
    processedEvents.value.forEach(e => {
        if (e.bottom > maxEventBottom) maxEventBottom = e.bottom;
    });

    return Math.max(lastTick, maxEventBottom) + 100; // Padding
});


const getGeoEventStyle = (event: GeoEvent, index: number) => {
    const colors = ['#007acc', '#fb7299', '#4ec9b0', '#ce9178', '#dcdcaa'];
    const c1 = colors[index % colors.length];

    return {
        top: `${event.renderTop}px`,
        height: `${event.renderHeight}px`,
        left: event.left,
        width: event.width,
        borderRadius: event.borderRadius,
        '--event-bg': `linear-gradient(135deg, ${c1}, ${c1})`,
        background: `linear-gradient(135deg, ${c1}, ${c1})`
    };
};

// Icons
const iconMap: Record<string, any> = {
    Monitor, Headset, Microphone, Basketball, Mouse, Trophy
};
const getIcon = (name: string) => iconMap[name] || Monitor;
</script>

<style scoped lang="less">
.about-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 20px;
}

.section-container {
  margin-bottom: 100px;
}

.section-title {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 50px;
  color: var(--color-text-primary);
  font-weight: 700;
  letter-spacing: 1px;
  position: relative;

  &::after {
    content: '';
    display: block;
    width: 40px;
    height: 3px;
    background: var(--color-accent-primary);
    margin: 15px auto 0;
    border-radius: 2px;
  }
}

/* 1. Info & Highlights */
.profile-hero {
  text-align: center;
  margin-bottom: 60px;

  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 25px;
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3);
    border: 3px solid var(--color-surface);
  }

  .name {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 10px;
    background: linear-gradient(120deg, var(--color-text-primary), var(--color-accent-primary));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .title {
    font-size: 1.1rem;
    color: var(--color-text-primary);
    margin-bottom: 15px;
    opacity: 0.8;
  }

  .bio {
    max-width: 600px;
    margin: 0 auto 25px;
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .social-links {
    display: flex;
    justify-content: center;
    gap: 15px;

    .social-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        border-color: var(--color-accent-secondary);
      }

      img { width: 20px; height: 20px; opacity: 0.8; }
      .el-icon { color: var(--color-text-primary); opacity: 0.8; }
    }
  }
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.highlight-card {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 30px;
  border: 1px solid var(--color-border);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 25px;
    color: var(--color-accent-tertiary);

    .el-icon { font-size: 1.4rem; }
    h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .list-item {
    margin-bottom: 20px;
    &:last-child { margin-bottom: 0; }

    .item-main {
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }

    .item-sub {
      font-size: 0.9rem;
      color: var(--color-text-primary);
      opacity: 0.8;
    }

    .item-desc {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      margin-top: 6px;
      line-height: 1.5;
    }

    .item-meta {
      font-size: 0.8rem;
      color: var(--color-accent-secondary);
      margin-top: 4px;
      font-family: var(--font-family-code);
    }
  }

  .project-link { // specific for project links
     display: block;
     text-decoration: none;
     padding: 10px;
     margin: 0 -10px 10px;
     border-radius: 8px;
     transition: background 0.2s;

     &:hover {
       background: var(--color-background);
       .link-icon { opacity: 1; transform: translate(2px, -2px); }
     }

     .link-icon {
       opacity: 0;
       transition: all 0.2s;
       font-size: 0.9em;
     }
  }
}

.tags-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .skill-pill {
    font-size: 0.85rem;
    padding: 6px 14px;
    background: var(--color-background);
    border-radius: 20px;
    color: var(--color-text-secondary);
    font-weight: 500;
  }
}

/* 2. Timeline - Geometric */
/* .timeline-geometric removed */

.timeline-container {
    display: flex;
    max-width: 700px; // Slightly wider to accommodate axis
    margin: 0 auto;
    position: relative;
    padding: 0 10px;
}

// Fixed Axis
.timeline-axis {
    width: 60px; // Fixed width for axis
    flex-shrink: 0;
    position: relative;
    margin-right: 20px;

    .axis-line {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0; // Line on right edge of axis col
        width: 2px;
        background: var(--color-border);
    }
}
// Ensure no overlap: timeline-events starts AFTER axis due to flex
// But let's add a small gap via padding if needed.
// margin-right: 20px on axis handles the gap.

.axis-year {
    position: absolute;
    right: 15px; // Left of line
    transform: translateY(-50%);
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--color-text-primary);
    font-family: var(--font-family-code);
    opacity: 0.8;

    &::after {
        content: '';
        position: absolute;
        right: -17px; // Touch the line
        top: 50%;
        width: 10px;
        height: 2px;
        background: var(--color-border);
    }
}

.axis-month {
    position: absolute;
    right: 15px;
    transform: translateY(-50%);
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    font-family: var(--font-family-code);
    opacity: 0.7;

    &::after {
        content: '';
        position: absolute;
        right: -15px; // Touch the line (shorter than year)
        top: 50%;
        width: 6px;
        height: 1px;
        background: var(--color-border);
    }
}

// Events Area
.timeline-events {
    flex-grow: 1;
    position: relative;
    // Events are absolutely positioned inside here
}

.geo-event-block {
    position: absolute;
    // Top/Height/Left/Width set via inline style

    color: #fff;
    transition: transform 0.3s ease, filter 0.3s ease, z-index 0s;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    overflow: hidden;
    cursor: pointer;

    &:hover {
        z-index: 100;
        transform: scale(1.05);
        filter: drop-shadow(0 12px 20px rgba(0,0,0,0.2));
        overflow: visible;
        background: transparent !important;

        .geo-content {
            position: absolute;
            top: 0;
            left: 0;
            min-width: 100%;
            width: max-content;
            max-width: 280px;
            min-height: 100%;
            height: auto;
            padding: 14px 16px;
            background: var(--event-bg);
            border-radius: inherit;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        .geo-title {
            white-space: normal;
            overflow: visible;
            text-overflow: unset;
        }

        .geo-desc {
            display: block;
            white-space: normal;
            -webkit-line-clamp: unset;
            line-clamp: unset;
            overflow: visible;
            &.is-hidden { display: block; }
        }

        .geo-time {
            display: block;
            &.is-hidden { display: block; }
        }
    }

    .geo-content {
        padding: 8px 10px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        overflow: hidden;
    }

    .geo-time {
        font-size: 0.85rem;
        opacity: 0.9;
        margin-bottom: 0;
        font-family: var(--font-family-code);
        font-weight: 600;
        letter-spacing: 0.3px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;

        &.is-hidden { display: none; }
    }

    .geo-title {
        font-size: 0.9rem;
        font-weight: 700;
        margin-bottom: 0;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .geo-desc {
        font-size: 0.8rem;
        opacity: 0.95;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: var(--desc-lines, 3);
        line-clamp: var(--desc-lines, 3);
        -webkit-box-orient: vertical;
        overflow: hidden;

        &.is-hidden { display: none; }
    }
}

/* 3. Hobbies */
.hobbies-grid {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 40px;
}

.hobby-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;

  .hobby-icon-wrapper {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: var(--color-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid var(--color-border);

    :deep(svg) {
      width: 32px;
      height: 32px;
    }

    &:hover {
      transform: scale(1.1) rotate(5deg);
      border-color: var(--color-accent-tertiary);
      color: var(--color-accent-tertiary);
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
    }
  }

  .hobby-name {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }
}
</style>
