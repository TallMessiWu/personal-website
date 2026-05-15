<template>
  <div class="about-page">
    <!-- 1. Profile Hero Section (Full Width) -->
    <div class="profile-hero-wrapper">
      <div class="profile-hero-content">
        <div class="avatar-wrapper">
          <img src="@/assets/avatar.png" alt="Avatar" class="avatar" />
        </div>
        <div class="profile-info">
           <h1 class="name">{{ t('about.profile.name') }}</h1>
           <p class="title">{{ t('about.profile.title') }}</p>
           <p class="bio">{{ t('about.profile.bio') }}</p>
           <div class="resume-wrapper">
             <el-button type="primary" round plain class="resume-btn" @click="openResume">
               <el-icon class="el-icon--left"><Document /></el-icon>
               {{ t('about.profile.resume') }}
             </el-button>
           </div>
           <div class="social-links">
             <a href="https://gitee.com/tallmessiwu" target="_blank" class="social-btn">
               <img src="@/assets/social_media_icons/gitee.svg" alt="Gitee" class="gitee-style" />
             </a>
             <a href="https://github.com/TallMessiWu" target="_blank" class="social-btn">
               <img src="@/assets/social_media_icons/github.svg" alt="GitHub" class="github-style" />
             </a>
             <a href="mailto:Junlin-Wu@foxmail.com" class="social-btn">
               <el-icon :size="20"><Message /></el-icon>
             </a>
           </div>
        </div>
      </div>
    </div>

    <!-- Main Content Container (Centered) -->
    <div class="content-container">
      <!-- Info & Highlights Section -->
      <section class="section-container info-highlights">
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
                  <div class="item-sub">{{ t(`about.highlights.work[${index}].role`) }}</div>
                  <div class="item-meta">{{ job.year }}</div>
                  <div class="item-desc">
                   <template v-if="Array.isArray(job.desc)">
                     <div v-for="(line, i) in job.desc" :key="i" class="desc-line">{{ line }}</div>
                   </template>
                   <template v-else>
                     {{ job.desc }}
                   </template>
                 </div>
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
                 <div class="item-desc">
                   <template v-if="Array.isArray(proj.desc)">
                     <div v-for="(line, i) in proj.desc" :key="i" class="desc-line">{{ line }}</div>
                   </template>
                   <template v-else>
                     {{ proj.desc }}
                   </template>
                 </div>
               </a>
            </div>
          </div>

          <!-- Skills Card (内含 3 个独立 panel) -->
          <div class="highlight-card skills-card">
            <div class="card-header">
              <el-icon><Cpu /></el-icon>
               <h3>{{ t('about.sections.skills') }}</h3>
            </div>
            <div class="skills-panels">
              <div
                v-for="(group, key) in skillsGroups"
                :key="key"
                class="skill-panel"
                :class="`tier-${key}`"
              >
                <div class="panel-header">
                  <span class="panel-dot"></span>
                  <span class="panel-label">{{ group.label }}</span>
                  <span class="panel-count">{{ group.items.length }}</span>
                </div>
                <div class="panel-items">
                  <span v-for="skill in group.items" :key="skill" class="skill-pill">{{ skill }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Timeline Section -->
      <section class="section-container timeline-section">
         <h2 class="section-title">{{ t('about.sections.timeline') }}</h2>

        <div class="timeline-container">
          <!-- Left: Fixed Year Axis -->
          <div class="timeline-axis" :style="{ height: containerHeight + 'px' }">
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
                @click="openEvent(event, $event)"
              >
                 <div class="geo-content" :style="{ '--desc-lines': event.descLines }">
                   <div class="geo-time" :class="{ 'is-hidden': !event.showTime }">
                      <span class="time-range">{{ formatEventDate(event.startDate) }} - {{ event.isCurrent ? event.raw.end : formatEventDate(event.endDate) }}</span>
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
                  <img :src="getHobbyIcon(hobby.icon)" :alt="hobby.name" class="hobby-icon" :class="{ 'invert-dark': ['chess', 'football'].includes(hobby.icon) }" />
              </div>
              <span class="hobby-name">{{ hobby.name }}</span>
          </div>
        </div>
      </section>
    </div>
    <!-- Mobile Event Modal Overlay -->
    <Teleport to="body">
       <transition name="fade">
          <div v-if="activeEvent" class="timeline-backdrop" @click="closeEvent"></div>
       </transition>

       <div v-if="activeEvent" class="geo-event-modal" :style="modalStyle" @click="closeEvent">
           <div class="geo-content modal-content">
              <div class="geo-time">
                  <span class="time-range">{{ formatEventDate(activeEvent.startDate) }} - {{ activeEvent.isCurrent ? activeEvent.raw.end : formatEventDate(activeEvent.endDate) }}</span>
              </div>
              <h4 class="geo-title modal-title">{{ activeEvent.raw.title }}</h4>
              <p class="geo-desc modal-desc">{{ activeEvent.raw.description }}</p>
           </div>
       </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@vueuse/head';
import {
  Message, School, Briefcase, Folder, Cpu, TopRight, Document
} from '@element-plus/icons-vue';

const { t, tm, locale } = useI18n();

// Resume Download Logic
const openResume = () => {
  const resumeFile = locale.value === 'zh' ? '吴俊霖_数据科学.pdf' : 'Junlin Wu_Data Scientist.pdf';
  window.open(`/${resumeFile}`, '_blank');
};

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
// 分档技能（精通 / 熟练 / 了解）
const SKILL_TIERS = ['expert', 'proficient', 'familiar'] as const;
type SkillTier = typeof SKILL_TIERS[number];
type SkillGroup = { label: string; items: string[] };
const skillsGroups = computed(() => {
  const raw = tm('about.highlights.skills') as Record<string, SkillGroup> | undefined;
  if (!raw) return {} as Record<SkillTier, SkillGroup>;
  return SKILL_TIERS.reduce((acc, tier) => {
    if (raw[tier]) acc[tier] = raw[tier];
    return acc;
  }, {} as Record<SkillTier, SkillGroup>);
});
const timelineList = computed(() => (tm('about.timeline') as any[]) || []);
const hobbiesList = computed(() => tm('about.hobbies') || []);


// --- Geometric Timeline Logic ---

const PIXELS_PER_MONTH = 30; // Increase scale for better visibility
const MIN_EVENT_HEIGHT = 120;
const GAP = 15;

interface GeoEvent {
    raw: any;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
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
    const endYear = min.getFullYear();

    for (let y = startYear; y >= endYear; y--) {
        const d = new Date(y, 0, 1);
        ticks.push({
            year: y,
            top: getTopFromDate(d, max)
        });
    }
    return ticks;
});

const eventMarkers = computed(() => {
    const markers: { top: number, label: string }[] = [];
    const { max } = timeRange.value;

    // 使用 getTopFromDate 计算每个月份在时间轴上的真实比例位置
    processedEvents.value.forEach(e => {
        markers.push({
            top: getTopFromDate(e.endDate, max),
            label: (e.endDate.getMonth() + 1).toString().padStart(2, '0')
        });
        markers.push({
            top: getTopFromDate(e.startDate, max),
            label: (e.startDate.getMonth() + 1).toString().padStart(2, '0')
        });
    });

    // 先获取所有年份标记的位置，用于碰撞检测
    const yearPositions = yearTicks.value.map(t => t.top);
    const MIN_DISTANCE_FROM_YEAR = 25; // 月份标记与年份标记的最小距离（px）
    const MIN_DISTANCE_BETWEEN = 15; // 月份标记之间的最小距离（px）

    const unique: { top: number, label: string }[] = [];
    markers.sort((a,b) => a.top - b.top).forEach(m => {
        // 检查是否与年份标记过近
        const tooCloseToYear = yearPositions.some(yp => Math.abs(yp - m.top) < MIN_DISTANCE_FROM_YEAR);
        if (tooCloseToYear) return;

        // 检查是否与已有月份标记过近
        if (unique.length === 0 || Math.abs(unique[unique.length-1].top - m.top) > MIN_DISTANCE_BETWEEN) {
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
        isCurrent: !!(e.end && /(Present|至今|Current|在读)/i.test(e.end)),
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
    const sortedForLayout = [...events].sort((a, b) => {
        const diff = b.bottom - a.bottom;
        if (Math.abs(diff) > 1) return diff;
        return a.top - b.top; // 如果底端一致，顶端靠上的排前面
    });
    const lanes: GeoEvent[][] = [];

    sortedForLayout.forEach(e => {
        let placed = false;
        for (let i = 0; i < lanes.length; i++) {
            const lastInLane = lanes[i][lanes[i].length - 1];
            // 改为自底朝上，新事件的底部不能超过轨道已有最后一个事件的顶部
            if (e.bottom <= lastInLane.top + 0.5) {
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
const getHobbyIcon = (name: string) => {
    return new URL(`../assets/hobbies/${name}.svg`, import.meta.url).href;
};

// --- Mobile Event Modal Logic (Bubble Animation) ---
import { ref as vueRef, nextTick as vueNextTick, onUnmounted as vueOnUnmounted } from 'vue';

const activeEvent = vueRef<GeoEvent | null>(null);
const modalStyle = vueRef<any>({});
const isClosing = vueRef(false);
const originRect = vueRef<DOMRect | null>(null);

const openEvent = (event: GeoEvent, e: MouseEvent) => {
    // Only activate on mobile (check width or strictly user agent, but width is safer)
    if (window.innerWidth > 767) return;

    if (isClosing.value) return;

    const target = e.currentTarget as HTMLElement;
    originRect.value = target.getBoundingClientRect();

    modalStyle.value = {
        position: 'fixed',
        top: `${originRect.value.top}px`,
        left: `${originRect.value.left}px`,
        width: `${originRect.value.width}px`,
        height: `${originRect.value.height}px`,
        zIndex: 2005,
        transition: 'none',
        borderRadius: '16px',
        background: target.style.background,
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        transformOrigin: 'center center',
        willChange: 'top, left, width, height, transform'
    };

    activeEvent.value = event;

    vueNextTick(() => {
        // Force reflow
        void document.body.offsetHeight;

        // Calculate target geometry in Pixels for smoother transition
        const targetWidth = window.innerWidth * 0.85;
        const targetHeight = Math.min(window.innerHeight * 0.6, 500); // Max 60% height or 500px
        const targetTop = (window.innerHeight - targetHeight) / 2;
        const targetLeft = (window.innerWidth - targetWidth) / 2;

        modalStyle.value = {
            position: 'fixed',
            top: `${targetTop}px`,
            left: `${targetLeft}px`,
            width: `${targetWidth}px`,
            height: `${targetHeight}px`,
            transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smooth Quartic Ease
            zIndex: 2005,
            borderRadius: '20px',
            background: modalStyle.value.background,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflow: 'hidden',
            willChange: 'top, left, width, height'
        };
    });
};

const closeEvent = () => {
    if (isClosing.value || !originRect.value) {
        activeEvent.value = null; // Fallback
        return;
    }
    isClosing.value = true;

    modalStyle.value = {
        position: 'fixed',
        top: `${originRect.value.top}px`,
        left: `${originRect.value.left}px`,
        width: `${originRect.value.width}px`,
        height: `${originRect.value.height}px`,
        zIndex: 2005,
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        borderRadius: '16px',
        background: modalStyle.value.background,
        overflow: 'hidden',
        padding: '14px 16px' // RESET padding to match original
    };

    setTimeout(() => {
        activeEvent.value = null;
        isClosing.value = false;
        originRect.value = null;
    }, 300);
};
</script>

<style scoped lang="less">
.about-page {
  /* Removed global max-width/padding to allow full-width hero */
  width: 100%;
}

.content-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px 20px;
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

/* 1. Profile Hero (Full Width Background) */
.profile-hero-wrapper {
  position: relative;
  width: 100%;
  padding: 80px 20px 60px; /* Adjust padding as needed */
  margin-bottom: 60px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  /* Premium Background Image */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('@/assets/background.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.15; /* Transparency for subtle effect */
    z-index: 0;
    filter: blur(2px) grayscale(30%); /* Optional: Add blur/grayscale for premium feel */
  }

  /* Gradient Overlay for better text contrast (optional but recommended) */
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30%;
    background: linear-gradient(to bottom, transparent, var(--color-background));
    z-index: 1;
    opacity: 0.8;
  }
}

.profile-hero-content {
  position: relative;
  z-index: 2; /* Ensure content is above background */
  text-align: center;
  max-width: 800px;

  .avatar-wrapper {
      margin-bottom: 25px;
  }

  .avatar {
    width: 140px; /* Slightly larger avatar */
    height: 140px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 15px 35px -10px rgba(0,0,0,0.4);
    border: 4px solid var(--color-surface);
    transition: transform 0.3s ease;

    @media (hover: hover) and (min-width: 768px) {
      &:hover {
          transform: scale(1.05);
      }
    }
  }

  .profile-info {
    .name {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 10px;
      background: linear-gradient(120deg, var(--color-text-primary), var(--color-accent-primary));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .title {
      font-size: 1.2rem;
      color: var(--color-text-primary);
      margin-bottom: 15px;
      opacity: 0.9;
      font-weight: 500;
    }

    .bio {
      max-width: 600px;
      margin: 0 auto 20px;
      color: var(--color-text-secondary);
      line-height: 1.7;
      font-size: 1.05rem;
    }

    .resume-wrapper {
      margin-bottom: 25px;

      .resume-btn {
        padding: 12px 24px;
        font-size: 1rem;
        font-weight: 600;
        border-color: var(--color-accent-primary);
        color: var(--color-accent-primary);
        background: transparent;
        transition: all 0.3s ease;

        &:hover {
          background: var(--color-accent-primary);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(var(--color-accent-primary-rgb), 0.3);
        }
      }
    }
  }

  .social-links {
    display: flex;
    justify-content: center;
    gap: 15px;

    .social-btn {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);

      @media (hover: hover) and (min-width: 768px) {
        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          border-color: rgba(255, 255, 255, 0.8);
        }
      }

      &:active {
        transform: scale(0.95);
      }

      img { width: 22px; height: 22px; opacity: 0.9; }
      .el-icon { color: var(--color-text-primary); opacity: 0.9; }

      .gitee-style {
        background: radial-gradient(circle closest-side, #ffffff 85%, transparent 85%);
        border-radius: 50%;
      }

      .github-style {
        width: 27px;
        height: 27px;
        background: radial-gradient(circle closest-side, #ffffff 88%, transparent 85%);
        border-radius: 50%;
        filter: invert(1);
      }
    }
  }
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
}

.highlight-card {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 30px;
  border: 1px solid var(--color-border);
  transition: transform 0.3s ease;

  @media (hover: hover) and (min-width: 768px) {
    &:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md);
    }
  }

  @media (min-width: 768px) {
    &:active {
      transform: scale(0.98);
    }
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

      .desc-line {
        position: relative;
        padding-left: 12px;
        margin-bottom: 4px;

        &::before {
          content: '·';
          position: absolute;
          left: 0;
          top: 0;
          font-weight: 1000;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
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

     @media (hover: hover) and (min-width: 768px) {
       &:hover {
         background: var(--color-background);
         .link-icon { opacity: 1; transform: translate(2px, -2px); }
       }
     }

     &:active {
       opacity: 0.7;
       background: var(--color-background);
     }

     .link-icon {
       opacity: 0;
       transition: all 0.2s;
       font-size: 0.9em;
     }
  }
}

/* 技能区：与项目展示同行（保持 2x2 网格），内部纵向 3 panel */
.skills-panels {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skill-panel {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 14px 16px 14px 18px;
  position: relative;
  transition: var(--transition-normal);
  --panel-accent: var(--color-text-secondary);

  /* 左侧彩色条作为档位识别 */
  &::before {
    content: '';
    position: absolute;
    top: 14px;
    bottom: 14px;
    left: 0;
    width: 3px;
    background: var(--panel-accent);
    border-radius: 0 3px 3px 0;
    opacity: 0.9;
  }

  @media (hover: hover) and (min-width: 768px) {
    &:hover {
      transform: translateX(2px);
      border-color: var(--panel-accent);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }
  }

  /* 三档配色：呼应 VSCode 关键字 / Type / 注释色 */
  &.tier-expert {
    --panel-accent: var(--color-accent-primary);
  }
  &.tier-proficient {
    --panel-accent: var(--color-accent-tertiary);
  }
  &.tier-familiar {
    --panel-accent: var(--color-text-secondary);
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px dashed var(--color-border);
  }

  .panel-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--panel-accent);
    flex-shrink: 0;
  }

  .panel-label {
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--panel-accent);
    font-family: var(--font-family-code);
  }

  .panel-count {
    margin-left: auto;
    font-size: 0.72rem;
    color: var(--color-text-secondary);
    font-family: var(--font-family-code);
    background: var(--color-surface);
    padding: 2px 8px;
    border-radius: 10px;
  }

  .panel-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .skill-pill {
    font-size: 0.82rem;
    padding: 5px 12px;
    background: var(--color-surface);
    border-radius: 16px;
    color: var(--color-text-primary);
    font-weight: 500;
    border: 1px solid transparent;
    cursor: default;
    transition: all 0.25s ease;

    @media (hover: hover) and (min-width: 768px) {
      &:hover {
        color: var(--panel-accent);
        border-color: var(--panel-accent);
        transform: translateY(-2px);
      }
    }

    &:active {
      color: var(--panel-accent);
      border-color: var(--panel-accent);
    }
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
    z-index: 2; // 确保年份在月份之上
    background: var(--color-background); // 给年份加背景色防止与月份视觉重叠
    padding: 2px 4px;
    border-radius: 3px;

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
    transform-origin: center center;
    transition: transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), filter 0.8s cubic-bezier(0.25, 0.1, 0.25, 1), z-index 0s;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    overflow: hidden;
    cursor: pointer;

    @media (hover: hover) {
        &:hover {
            z-index: 100;
            transform: scale(1.05);
            filter: drop-shadow(0 12px 20px rgba(0,0,0,0.2));
            overflow: visible;
            background: transparent !important;

            .geo-content {
                min-width: 100%;
                width: max-content;
                max-width: 280px;
                min-height: 100%;
                height: auto;
                padding: 14px 16px;
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
    }

    &:active {
        transform: scale(0.98);
    }

    .geo-content {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        height: 100%;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        overflow: hidden;
        background: var(--event-bg);
        border-radius: inherit;
        transition: width 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),
                    height 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),
                    min-height 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),
                    padding 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),
                    box-shadow 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
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

    .hobby-icon {
      width: 32px;
      height: 32px;
      object-fit: contain;
      filter: grayscale(0.1) brightness(0.9);
      transition: filter 0.3s ease;
    }

    @media (hover: hover) and (min-width: 768px) {
      &:hover {
        transform: scale(1.1) rotate(5deg);
        border-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);

        .hobby-icon {
          filter: grayscale(0) brightness(1);
        }
      }
    }

    &:active {
       transform: scale(0.95);
    }
  }

  .hobby-name {
    font-size: 0.9rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }
}


@media (max-width: 768px) {
  .profile-hero-wrapper {
    padding: 60px 20px 40px;

    .profile-info {
      .name { font-size: 2rem; }
      .title { font-size: 1rem; }
      .bio { font-size: 0.95rem; }
    }

    .avatar {
      width: 120px;
      height: 120px;
    }
  }

  .highlights-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .timeline-container {
    padding: 0;
    overflow-x: auto;
    /* Enhance scroll experience */
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--color-border);
      border-radius: 4px;
    }
  }

  /* Adjust timeline height calculation visualization if needed or just let it scroll */

  .hobbies-grid {
    gap: 20px;

    .hobby-item {
       gap: 10px;
       .hobby-icon-wrapper {
         width: 60px;
         height: 60px;
       }
    }
  }
}

/* Mobile Timeline Modal Styles */
.timeline-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  z-index: 2000;
  transition: opacity 0.3s ease;
}

.geo-event-modal {
  /* Position/Size handled by JS inline styles */
  color: #fff;
  overflow: hidden;

  .modal-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 15px;
    white-space: normal;
    line-height: 1.3;
  }

  .modal-desc {
    font-size: 1rem;
    line-height: 1.6;
    white-space: normal;
    opacity: 0.95;
    -webkit-line-clamp: unset;
    line-clamp: unset;
    overflow-y: auto;
  }

  .time-range {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 5px;
    display: block;
    font-family: var(--font-family-code);
  }
}

/* 针对工作经验模块收窄显示宽度 */
.highlight-card.work-card .item-desc {
  padding-right: 10%;
}
</style>

<style lang="less">
/* 全局样式覆盖，确保优先级 - 浅色模式下移除 About 页面图标的特殊背景 */
[data-theme='light'] .profile-hero-content .social-links .gitee-style {
  background: none !important;
}

[data-theme='light'] .profile-hero-content .social-links .github-style {
  background: none !important;
  filter: none !important;
}

/* Dark mode: Invert colors for specific hobby icons */
.hobbies-section .hobby-icon.invert-dark {
  filter: invert(1) grayscale(1) !important;
}

/* Light mode: Reset filter */
[data-theme='light'] .hobbies-section .hobby-icon.invert-dark {
  filter: none !important;
}
</style>
