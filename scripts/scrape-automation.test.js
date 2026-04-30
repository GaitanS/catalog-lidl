const test = require('node:test');
const assert = require('node:assert/strict');

const {
    parseScheduleHours,
    shouldRunStaleScrape,
    shouldRunScheduledScrape,
    markScheduledRun,
} = require('./scrape-automation');

test('parseScheduleHours keeps valid unique hours in order', () => {
    assert.deepEqual(parseScheduleHours('7, 13, 25, nope, 7, 0'), [7, 13, 0]);
    assert.deepEqual(parseScheduleHours(''), [7, 13]);
});

test('shouldRunScheduledScrape runs once per configured hour', () => {
    const now = new Date(2026, 4, 1, 7, 15, 0);
    const state = {};
    const scheduleHours = [7, 13];

    assert.equal(shouldRunScheduledScrape({ now, state, scheduleHours, running: false }), true);

    markScheduledRun({ now, state });

    assert.equal(shouldRunScheduledScrape({ now, state, scheduleHours, running: false }), false);
    assert.equal(shouldRunScheduledScrape({
        now: new Date(2026, 4, 1, 13, 0, 0),
        state,
        scheduleHours,
        running: false,
    }), true);
});

test('shouldRunScheduledScrape does not overlap running jobs', () => {
    assert.equal(shouldRunScheduledScrape({
        now: new Date(2026, 4, 1, 7, 0, 0),
        state: {},
        scheduleHours: [7],
        running: true,
    }), false);
});

test('shouldRunStaleScrape runs when catalog data is older than max age', () => {
    assert.equal(shouldRunStaleScrape({
        now: new Date('2026-05-02T12:00:00.000Z'),
        lastUpdatedAt: new Date('2026-05-01T08:00:00.000Z'),
        maxAgeHours: 26,
        running: false,
    }), true);

    assert.equal(shouldRunStaleScrape({
        now: new Date('2026-05-02T12:00:00.000Z'),
        lastUpdatedAt: new Date('2026-05-01T12:30:00.000Z'),
        maxAgeHours: 26,
        running: false,
    }), false);
});
