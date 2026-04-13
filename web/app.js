// ── About modal ───────────────────────────────────────────────
const aboutBtn = document.getElementById('aboutBtn');
const aboutModal = document.getElementById('aboutModal');
const aboutClose = document.getElementById('aboutClose');
aboutBtn.addEventListener('click', () => aboutModal.classList.add('open'));
aboutClose.addEventListener('click', () => aboutModal.classList.remove('open'));
aboutModal.addEventListener('click', e => { if (e.target === aboutModal) aboutModal.classList.remove('open'); });

// ── DOM refs ──────────────────────────────────────────────────
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const page3 = document.getElementById('page3');
const planContent = document.getElementById('planContent');
const targetWeightBubble = document.getElementById('targetWeightBubble');

// ── Goals that require a target weight ───────────────────────
const WEIGHT_GOALS = new Set(['Build Muscle / Gain Weight', 'Lose Weight / Burn Fat']);

// ── Input sanitization ────────────────────────────────────────
const ageInput          = document.getElementById('age');
const heightFeetInput   = document.getElementById('heightFeet');
const heightInchesInput = document.getElementById('heightInches');
const monthInput        = document.getElementById('month');
const dayInput          = document.getElementById('day');
const yearInput         = document.getElementById('year');
const targetWeightInput = document.getElementById('targetWeight');
const sleepHoursInput   = document.getElementById('sleepHours');

ageInput.addEventListener('input',          () => sanitizeDigits(ageInput, 3));
heightFeetInput.addEventListener('input',   () => sanitizeDigits(heightFeetInput, 1));
heightInchesInput.addEventListener('input', () => sanitizeDigits(heightInchesInput, 2));
monthInput.addEventListener('input',        () => validateMonth(monthInput));
dayInput.addEventListener('input',          () => validateDay(dayInput));
yearInput.addEventListener('input',         () => sanitizeDigits(yearInput, 4));
targetWeightInput.addEventListener('input', () => sanitizeDigits(targetWeightInput, 3));
sleepHoursInput.addEventListener('input',   () => sanitizeDigits(sleepHoursInput, 2));

function sanitizeDigits(input, maxLength) {
  input.value = input.value.replace(/\D/g, '').slice(0, maxLength);
}
function validateMonth(input) {
  sanitizeDigits(input, 2);
  if (input.value && Number(input.value) > 12) input.value = '12';
}
function validateDay(input) {
  sanitizeDigits(input, 2);
  if (input.value && Number(input.value) > 31) input.value = '31';
}

// ── Inline error helpers ──────────────────────────────────────
const ERROR_IDS = ['err-height','err-weight','err-age','err-gender','err-date','err-targetWeight','err-sleepHours'];

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('visible');
}
function clearError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.classList.remove('visible');
}
function clearAllErrors() {
  ERROR_IDS.forEach(clearError);
}

// ── Conditional target weight visibility ──────────────────────
const goalSelect = document.getElementById('goal');

function updateTargetWeightVisibility() {
  if (WEIGHT_GOALS.has(goalSelect.value)) {
    targetWeightBubble.classList.remove('hidden');
  } else {
    targetWeightBubble.classList.add('hidden');
    clearError('err-targetWeight');
  }
}

goalSelect.addEventListener('change', updateTargetWeightVisibility);

// ── localStorage persistence ──────────────────────────────────
const LS_FIELDS = ['heightFeet','heightInches','weight','age','gender','goal','diet','activityLevel','month','day','year','targetWeight','sleepHours'];

function saveToStorage() {
  LS_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) localStorage.setItem('ft_' + id, el.value);
  });
}
function loadFromStorage() {
  LS_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    const val = localStorage.getItem('ft_' + id);
    if (el && val !== null) el.value = val;
  });
  updateTargetWeightVisibility();
}
function clearStorage() {
  LS_FIELDS.forEach(id => localStorage.removeItem('ft_' + id));
}

LS_FIELDS.forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('change', saveToStorage);
  if (el.tagName === 'INPUT') el.addEventListener('input', saveToStorage);
});

loadFromStorage();

// ── Page navigation ───────────────────────────────────────────
function showPage(page) {
  [page1, page2, page3].forEach(p => p.classList.remove('active'));
  page.classList.add('active');
}

// Page 1 → just navigate, no validation
document.getElementById('next1').addEventListener('click', () => showPage(page2));

document.getElementById('clear1').addEventListener('click', () => {
  ['heightFeet','heightInches','weight','age'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('gender').selectedIndex = 0;
  clearAllErrors();
});

document.getElementById('back2').addEventListener('click', () => showPage(page1));

document.getElementById('clear2').addEventListener('click', () => {
  document.getElementById('goal').selectedIndex = 0;
  document.getElementById('diet').selectedIndex = 0;
  document.getElementById('activityLevel').value = '1.55';
  ['month','day','year','targetWeight','sleepHours'].forEach(id => { document.getElementById(id).value = ''; });
  clearAllErrors();
  updateTargetWeightVisibility();
});

// Generate Plan → validate all fields across both pages
document.getElementById('next2').addEventListener('click', () => {
  clearAllErrors();
  let valid = true;

  // ── Page 1 fields ─────────────────────────────────────────
  const feet   = document.getElementById('heightFeet').value.trim();
  const inches = document.getElementById('heightInches').value.trim();
  if (
    !/^[1-7]$/.test(feet) ||
    !/^\d{1,2}$/.test(inches) ||
    Number(inches) > 11 ||
    (Number(feet) === 1 && Number(inches) === 0)
  ) {
    showError('err-height', 'Enter a valid height (e.g. 5 ft 9 in). Inches must be 0–11.');
    valid = false;
  }

  const weight = Number(document.getElementById('weight').value);
  if (!weight || weight < 1 || weight > 500) {
    showError('err-weight', 'Enter a valid weight between 1 and 500 lbs.');
    valid = false;
  }

  const age = Number(document.getElementById('age').value);
  if (!age || age < 10 || age > 100) {
    showError('err-age', 'Enter a valid age between 10 and 100.');
    valid = false;
  }

  const gender = document.getElementById('gender').value;
  if (!gender) {
    showError('err-gender', 'Please select a gender.');
    valid = false;
  }

  // If page 1 has errors, go back and show them there
  if (!valid) {
    showPage(page1);
    return;
  }

  // ── Page 2 fields ─────────────────────────────────────────
  const goal          = document.getElementById('goal').value;
  const diet          = document.getElementById('diet').value;
  const activityLevel = Number(document.getElementById('activityLevel').value);
  const monthText     = monthInput.value.trim();
  const dayText       = dayInput.value.trim();
  const yearText      = yearInput.value.trim();
  const sleepHours    = Number(sleepHoursInput.value);
  const currentWeight = weight;
  const heightFeet    = Number(document.getElementById('heightFeet').value.trim());
  const heightInches  = Number(document.getElementById('heightInches').value.trim());
  const height        = heightFeet * 12 + heightInches;

  // Validate date
  let targetDate = null;
  if (!monthText || !dayText || !yearText) {
    showError('err-date', 'Please enter a complete target date (MM / DD / YYYY).');
    valid = false;
  } else {
    const month = Number(monthText);
    const day   = Number(dayText);
    const year  = Number(yearText);
    const currentYear = new Date().getFullYear();

    if (!/^\d{1,2}$/.test(monthText) || month < 1 || month > 12) {
      showError('err-date', 'Month must be between 1 and 12.');
      valid = false;
    } else if (!/^\d{1,2}$/.test(dayText) || day < 1 || day > 31) {
      showError('err-date', 'Day must be between 1 and 31.');
      valid = false;
    } else if (!/^\d{4}$/.test(yearText) || year < currentYear) {
      showError('err-date', 'Year must be the current year or later.');
      valid = false;
    } else if (year > currentYear + 100) {
      showError('err-date', `Year must be no more than ${currentYear + 100}.`);
      valid = false;
    } else {
      const candidate = new Date(year, month - 1, day);
      if (candidate.getMonth() !== month - 1 || candidate.getDate() !== day) {
        showError('err-date', 'That date does not exist. Please check the day and month.');
        valid = false;
      } else {
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);
        if (candidate < todayMidnight) {
          showError('err-date', 'Target date must be today or in the future.');
          valid = false;
        } else {
          targetDate = candidate;
        }
      }
    }
  }

  // Validate target weight (only for weight-based goals)
  let targetWeight = null;
  if (WEIGHT_GOALS.has(goal)) {
    targetWeight = Number(targetWeightInput.value);
    if (!targetWeight || targetWeight < 1 || targetWeight > 500) {
      showError('err-targetWeight', 'Enter a valid target weight between 1 and 500 lbs.');
      valid = false;
    } else if (goal === 'Build Muscle / Gain Weight' && targetWeight <= currentWeight + 1) {
      showError('err-targetWeight', 'For this goal, target weight must be at least 1 lb higher than your current weight.');
      valid = false;
    } else if (goal === 'Lose Weight / Burn Fat' && targetWeight >= currentWeight - 1) {
      showError('err-targetWeight', 'For this goal, target weight must be at least 1 lb lower than your current weight.');
      valid = false;
    }
  }

  // Validate sleep
  if (!sleepHours || sleepHours < 1 || sleepHours > 23) {
    showError('err-sleepHours', 'Enter hours of sleep between 1 and 23.');
    valid = false;
  }

  if (!valid) return;

  planContent.innerHTML = generatePlan({ height, currentWeight, age, gender, goal, diet, activityLevel, targetDate, targetWeight, sleepHours });
  showPage(page3);
});

// ── Restart / Copy / Print ────────────────────────────────────
document.getElementById('restartBtn').addEventListener('click', () => {
  ['heightFeet','heightInches','weight','age','month','day','year','targetWeight','sleepHours']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('gender').selectedIndex = 0;
  document.getElementById('goal').selectedIndex = 0;
  document.getElementById('diet').selectedIndex = 0;
  document.getElementById('activityLevel').value = '1.55';
  planContent.innerHTML = '';
  clearAllErrors();
  clearStorage();
  updateTargetWeightVisibility();
  showPage(page1);
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const text = planContent.innerText || planContent.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy Plan'; }, 2000);
  });
});

document.getElementById('printBtn').addEventListener('click', () => window.print());

// ── Plan generation ───────────────────────────────────────────
function generatePlan(data) {
  const maintenance = estimateMaintenance(data.currentWeight, data.height, data.age, data.gender, data.activityLevel);
  const days = Math.max(1, Math.round((data.targetDate - new Date()) / 86400000));

  const absDelta = data.targetWeight !== null ? Math.abs(data.targetWeight - data.currentWeight) : 0;
  const dailyCalorieDelta = absDelta > 0 ? Math.round((absDelta * 3500) / days) : 0;

  let goalAdvice = '';
  let calorieNote = '';
  let calorieTarget = maintenance;

  if (data.goal === 'Build Muscle / Gain Weight') {
    goalAdvice = `Focus on progressive resistance training 3–5 days per week, prioritising compound lifts (squat, deadlift, bench press, rows). Eat in a caloric surplus and hit your protein target daily. For a ${data.diet.toLowerCase()} diet, prioritise ${dietDetails(data.diet, 'muscle')}.`;
    calorieTarget = maintenance + dailyCalorieDelta;
    calorieNote = `Aim for roughly <strong>${calorieTarget.toLocaleString()}</strong> calories/day to reach your target by ${formatDate(data.targetDate)}.`;

  } else if (data.goal === 'Lose Weight / Burn Fat') {
    goalAdvice = `Create a caloric deficit through a combination of diet and cardio. Include strength training 2–3 days per week to preserve muscle mass. For a ${data.diet.toLowerCase()} diet, focus on ${dietDetails(data.diet, 'lose')}.`;
    calorieTarget = Math.max(1200, maintenance - dailyCalorieDelta);
    calorieNote = `Aim for roughly <strong>${calorieTarget.toLocaleString()}</strong> calories/day to reach your target by ${formatDate(data.targetDate)}.`;

  } else if (data.goal === 'Maintain Weight') {
    goalAdvice = `Focus on consistency — balanced meals, regular exercise, and stable habits. Mix strength training and cardio to sustain your current body composition. For a ${data.diet.toLowerCase()} diet, include a variety of ${dietDetails(data.diet, 'maintain')}.`;
    calorieNote = `Eat close to your maintenance of <strong>${maintenance.toLocaleString()}</strong> calories/day to stay at your current weight.`;

  } else if (data.goal === 'Body Recomposition') {
    goalAdvice = `Body recomposition — losing fat while gaining muscle simultaneously — requires eating near maintenance with high protein intake (0.7–1 g per lb of body weight). Do resistance training 3–5 days per week and keep cardio moderate. For a ${data.diet.toLowerCase()} diet, emphasise ${dietDetails(data.diet, 'muscle')}.`;
    calorieNote = `Eat close to your maintenance of <strong>${maintenance.toLocaleString()}</strong> calories/day. Track protein closely — aim for <strong>${Math.round(data.currentWeight * 0.8)}–${Math.round(data.currentWeight * 1.0)} g</strong> per day.`;

  } else if (data.goal === 'Increase Strength') {
    goalAdvice = `Strength gains come from progressive overload on compound movements (squat, deadlift, bench press, overhead press). Train 3–4 days per week with lower rep ranges (3–6 reps) and longer rest periods (2–4 min). Eat at or slightly above maintenance and keep protein high. For a ${data.diet.toLowerCase()} diet, focus on ${dietDetails(data.diet, 'muscle')}.`;
    calorieNote = `Eat around <strong>${(maintenance + 150).toLocaleString()}–${(maintenance + 300).toLocaleString()}</strong> calories/day. A modest surplus supports strength adaptations without excessive fat gain.`;

  } else if (data.goal === 'Improve Endurance / Cardio') {
    goalAdvice = `Build aerobic capacity with progressive cardio — start at a comfortable pace and add no more than 10% volume per week. Mix steady-state sessions (runs, cycling) with interval work (HIIT). Stay well-hydrated and prioritise carbohydrates as your primary fuel source. For a ${data.diet.toLowerCase()} diet, include ${dietDetails(data.diet, 'endurance')}.`;
    calorieNote = `Eat around your maintenance of <strong>${maintenance.toLocaleString()}</strong> calories/day, increasing slightly on high-volume training days. Prioritise carbohydrates for sustained energy.`;

  } else if (data.goal === 'Improve Flexibility / Mobility') {
    goalAdvice = `Dedicate 15–30 minutes daily to stretching, yoga, or mobility work. Focus on joint mobility for hips, thoracic spine, and shoulders. Dynamic warm-ups before workouts and static stretching afterward give the best results. Include active recovery days with gentle movement. For a ${data.diet.toLowerCase()} diet, prioritise ${dietDetails(data.diet, 'maintain')} to support tissue recovery.`;
    calorieNote = `Eat around your maintenance of <strong>${maintenance.toLocaleString()}</strong> calories/day. Anti-inflammatory foods (leafy greens, berries, omega-3s) can further support joint health and flexibility.`;

  } else {
    goalAdvice = `Move consistently, eat whole foods, stay hydrated, manage stress, and build a sustainable routine. Small, repeatable habits beat extreme short-term approaches every time.`;
    calorieNote = `Your estimated maintenance is <strong>${maintenance.toLocaleString()}</strong> calories/day — use this as your nutritional baseline.`;
  }

  // Sleep
  let sleepAdvice = '';
  if (data.sleepHours < 7) {
    sleepAdvice = `You are averaging <strong>${data.sleepHours} hours</strong> of sleep — below the recommended 7–9 hours. Poor sleep elevates cortisol, impairs muscle recovery, and increases cravings. Prioritise getting more rest.`;
  } else if (data.sleepHours > 9) {
    sleepAdvice = `You are averaging <strong>${data.sleepHours} hours</strong> of sleep — above the typical range. While rest is important, consistently oversleeping can reduce daily activity and may indicate poor sleep quality. Aim for 7–9 hours.`;
  } else {
    sleepAdvice = `Your <strong>${data.sleepHours} hours</strong> of sleep falls within the healthy 7–9 hour range — great for recovery and performance.`;
  }

  // Warnings
  const warnings = [];
  if (absDelta > 0) {
    const weeklyRate = absDelta / Math.max(1, days / 7);
    if (days < 14 && absDelta > 4) {
      warnings.push('Your goal is very aggressive for the available timeline. A safe pace is 1–2 lbs per week to preserve muscle and avoid health risks.');
    } else if (weeklyRate > 2.5) {
      warnings.push(`At this pace you would need to change ~${weeklyRate.toFixed(1)} lbs per week, which exceeds the recommended 1–2 lbs/week. Consider extending your target date for a healthier approach.`);
    }
    if (data.goal === 'Lose Weight / Burn Fat' && calorieTarget <= 1200) {
      warnings.push('Your calculated calorie target is at or below 1,200 calories/day, which is generally unsafe. Extend your target date or set a less aggressive goal.');
    }
  }

  // Assemble output
  let html = '<div class="plan-output">';
  html += planSection('Goal Strategy', goalAdvice);
  html += planSection('Calorie Target', `Estimated maintenance: <strong>${maintenance.toLocaleString()}</strong> cal/day (based on your stats and activity level).<br>${calorieNote}`);
  html += planSection('Sleep', sleepAdvice);
  if (warnings.length > 0) {
    html += planSection('Warning', warnings.join('<br><br>'), 'plan-warning');
  }
  html += '</div>';
  return html;
}

function planSection(label, content, extraClass = '') {
  return `<div class="plan-section ${extraClass}"><div class="plan-section-label">${label}</div><p>${content}</p></div>`;
}

function dietDetails(diet, type) {
  const map = {
    'Non-vegetarian': {
      muscle:   'chicken, fish, eggs, lean beef, and dairy',
      lose:     'lean poultry, fish, vegetables, and whole grains',
      maintain: 'lean proteins, vegetables, whole grains, and healthy fats',
      endurance:'complex carbs (rice, oats, whole-grain bread), lean proteins, and fruit',
    },
    'Vegetarian': {
      muscle:   'eggs, dairy, legumes, tofu, and tempeh',
      lose:     'beans, lentils, vegetables, and whole grains',
      maintain: 'eggs, dairy, legumes, whole grains, and vegetables',
      endurance:'complex carbs (oats, quinoa, whole grains), eggs, dairy, and legumes',
    },
    'Vegan': {
      muscle:   'tofu, tempeh, edamame, legumes, and seitan',
      lose:     'legumes, vegetables, whole grains, and healthy fats',
      maintain: 'tofu, legumes, whole grains, nuts, seeds, and vegetables',
      endurance:'complex carbs (oats, quinoa, sweet potato), legumes, and nut butters',
    },
  };
  return (map[diet] && map[diet][type]) || 'a balanced variety of whole foods';
}

function estimateMaintenance(weight, height, age, gender, activityLevel) {
  const weightKg  = weight / 2.20462;
  const heightCm  = height * 2.54;
  let bmr;
  if (gender === 'Male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else if (gender === 'Female') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    // Average of male and female Mifflin-St Jeor formulas
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
  }
  return Math.round(bmr * activityLevel);
}

function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}
