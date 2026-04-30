const DEFAULT_SCHEDULE_HOURS = [7, 13];

function parseScheduleHours(value) {
    if (!value || typeof value !== 'string') return DEFAULT_SCHEDULE_HOURS;

    const seen = new Set();
    const hours = [];

    for (const part of value.split(',')) {
        const hour = Number(part.trim());
        if (!Number.isInteger(hour) || hour < 0 || hour > 23 || seen.has(hour)) continue;
        seen.add(hour);
        hours.push(hour);
    }

    return hours.length > 0 ? hours : DEFAULT_SCHEDULE_HOURS;
}

function scheduledSlot(now) {
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}`;
}

function shouldRunScheduledScrape({ now = new Date(), state = {}, scheduleHours, running = false }) {
    if (running) return false;
    if (!scheduleHours.includes(now.getHours())) return false;
    return state.lastScheduledSlot !== scheduledSlot(now);
}

function markScheduledRun({ now = new Date(), state }) {
    state.lastScheduledSlot = scheduledSlot(now);
    state.lastScheduledRunAt = now.toISOString();
    return state;
}

function shouldRunStaleScrape({ now = new Date(), lastUpdatedAt, maxAgeHours, running = false }) {
    if (running) return false;
    if (!(lastUpdatedAt instanceof Date) || Number.isNaN(lastUpdatedAt.getTime())) return true;
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    return now.getTime() - lastUpdatedAt.getTime() >= maxAgeMs;
}

module.exports = {
    DEFAULT_SCHEDULE_HOURS,
    parseScheduleHours,
    shouldRunScheduledScrape,
    shouldRunStaleScrape,
    markScheduledRun,
};
