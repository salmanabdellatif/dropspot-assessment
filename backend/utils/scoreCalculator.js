const SEED = "beb6e8799096";

// 2. Generate coefficients from seed (as per assessment example)
const A = 7 + (parseInt(SEED.substring(0, 2), 16) % 5);
const B = 13 + (parseInt(SEED.substring(2, 4), 16) % 7);
const C = 3 + (parseInt(SEED.substring(4, 6), 16) % 3);

exports.calculateScore = (userCreatedAt, dropStartsAt) => {
  const now = new Date();
  const userJoinDate = new Date(userCreatedAt);
  const dropStartDate = new Date(dropStartsAt);

  // Calculate account age in days
  const account_age_days = Math.floor((now - userJoinDate) / (1000 * 60 * 60 * 24));

  // METRIC 2: Signup Latency (ms)
  // How fast did they join after it started? Lower latency is better usually,
  // but the formula uses % A, so it acts as a deterministic "shuffler" based on speed.
  // If drop hasn't started, latency is 0.
  let signup_latency_ms = Math.max(0, now - dropStartDate);

  // METRIC 3: Rapid Actions (Simplified for this assessment)
  // In a real app, this tracks clicks per second. Here, we'll use a randomish
  // value based on the current second to simulate 'noise' or 'luck'.
  const rapid_actions = now.getSeconds();

  // --- THE FORMULA (ADAPTED FROM DOC) ---
  // priority_score = base + (latency % A) + (age % B) - (rapid % C)
  const BASE_SCORE = 1000;

  let priority_score = BASE_SCORE + (signup_latency_ms % A) + (account_age_days % B) - (rapid_actions % C);

  return Math.floor(priority_score);
};
