/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Based on the original SuperMemo SM-2 algorithm by Piotr Woźniak.
 * Reference: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 *
 * Grade scale (0–5):
 *   5 – Perfect response
 *   4 – Correct response after a hesitation
 *   3 – Correct response recalled with serious difficulty
 *   2 – Incorrect response; where the correct one seemed easy to recall
 *   1 – Incorrect response; the correct one was remembered
 *   0 – Complete blackout
 *
 * This module is a pure function — no side effects, no DB calls.
 * The caller is responsible for persisting the returned state.
 */

export interface SRSState {
  /** Ease factor: difficulty multiplier. Defaults to 2.5, min 1.3. */
  easeFactor: number;
  /** Interval in days until the next review. */
  interval: number;
  /** Number of consecutive successful reviews (grade >= 3). */
  repetitions: number;
  /** Scheduled date for the next review. */
  nextReviewDate: Date;
}

export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Calculates the next SRS state after a review.
 *
 * @param state  - Current SRS state for the concept.
 * @param grade  - Student's self-assessed grade (0–5).
 * @returns      - Updated SRS state to be persisted.
 */
export function calculateNextReview(state: SRSState, grade: ReviewGrade): SRSState {
  if (grade < 0 || grade > 5) {
    throw new RangeError(`Grade must be 0–5, received: ${grade}`);
  }

  let { easeFactor, interval, repetitions } = state;

  if (grade < 3) {
    // Incorrect response — reset streak, restart with short interval
    repetitions = 0;
    interval = 1;
    // EF is NOT changed on failure (original SM-2 spec)
  } else {
    // Correct response — advance the schedule
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;

    // Update ease factor based on grade quality
    // EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
    const delta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + delta);
  }

  // Schedule next review from now
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  nextReviewDate.setHours(0, 0, 0, 0); // Normalize to start of day

  return { easeFactor, interval, repetitions, nextReviewDate };
}

/**
 * Returns a default SRS state for a brand-new concept.
 */
export function defaultSRSState(): SRSState {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 1,
    repetitions: 0,
    nextReviewDate: tomorrow,
  };
}

/**
 * Returns true if a concept is due for review today or overdue.
 */
export function isDueForReview(nextReviewDate: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return nextReviewDate <= today;
}
