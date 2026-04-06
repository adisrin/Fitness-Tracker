const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const page3 = document.getElementById('page3');
const next1 = document.getElementById('next1');
const next2 = document.getElementById('next2');
const clear1 = document.getElementById('clear1');
const clear2 = document.getElementById('clear2');
const back2 = document.getElementById('back2');
const restartBtn = document.getElementById('restartBtn');
const planContent = document.getElementById('planContent');
const ageInput = document.getElementById('age');
const heightFeetInput = document.getElementById('heightFeet');
const heightInchesInput = document.getElementById('heightInches');
const monthInput = document.getElementById('month');
const dayInput = document.getElementById('day');
const yearInput = document.getElementById('year');
const targetWeightInput = document.getElementById('targetWeight');
const sleepHoursInput = document.getElementById('sleepHours');
ageInput.addEventListener('input', () => sanitizeDigits(ageInput, 3));
heightFeetInput.addEventListener('input', () => sanitizeDigits(heightFeetInput, 1));
heightInchesInput.addEventListener('input', () => sanitizeDigits(heightInchesInput, 2));
monthInput.addEventListener('input', () => validateMonth(monthInput));
dayInput.addEventListener('input', () => validateDay(dayInput));
yearInput.addEventListener('input', () => sanitizeDigits(yearInput, 4));
targetWeightInput.addEventListener('input', () => sanitizeDigits(targetWeightInput, 3));
sleepHoursInput.addEventListener('input', () => sanitizeDigits(sleepHoursInput, 2));

function sanitizeDigits(input, maxLength) {
  input.value = input.value.replace(/\D/g, '').slice(0, maxLength);
}

function validateMonth(input) {
  sanitizeDigits(input, 2);
  if (input.value && Number(input.value) > 12) {
    input.value = '12';
  }
}

function validateDay(input) {
  sanitizeDigits(input, 2);
  if (input.value && Number(input.value) > 31) {
    input.value = '31';
  }
}

function showPage(page) {
  [page1, page2, page3].forEach(p => p.classList.remove('active'));
  page.classList.add('active');
}

function clampNumber(value, min, max) {
  return Number(value) >= min && Number(value) <= max;
}

next1.addEventListener('click', () => {
  showPage(page2);
});

clear1.addEventListener('click', () => {
  document.getElementById('heightFeet').value = '';
  document.getElementById('heightInches').value = '';
  document.getElementById('weight').value = '';
  document.getElementById('age').value = '';
  document.getElementById('gender').selectedIndex = 0;
});

clear2.addEventListener('click', () => {
  document.getElementById('goal').selectedIndex = 0;
  document.getElementById('diet').selectedIndex = 0;
  document.getElementById('month').value = '';
  document.getElementById('day').value = '';
  document.getElementById('year').value = '';
  document.getElementById('targetWeight').value = '';
  document.getElementById('sleepHours').value = '';
});

back2.addEventListener('click', () => {
  showPage(page1);
});

next2.addEventListener('click', () => {
  const goal = document.getElementById('goal').value;
  const diet = document.getElementById('diet').value;
  const monthText = document.getElementById('month').value.trim();
  const dayText = document.getElementById('day').value.trim();
  const yearText = document.getElementById('year').value.trim();
  const targetWeight = Number(document.getElementById('targetWeight').value);
  const sleepHours = Number(document.getElementById('sleepHours').value);
  const currentWeight = Number(document.getElementById('weight').value);
  const age = Number(document.getElementById('age').value);

  const heightFeet = Number(document.getElementById('heightFeet').value.trim());
  const heightInches = Number(document.getElementById('heightInches').value.trim());
  const height = heightFeet * 12 + heightInches;

  // Validate page 1 fields
  if (!/^[1-7]$/.test(document.getElementById('heightFeet').value.trim()) || !/^[0-9]{1,2}$/.test(document.getElementById('heightInches').value.trim())) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }
  const feet = Number(document.getElementById('heightFeet').value.trim());
  const inches = Number(document.getElementById('heightInches').value.trim());
  if (inches < 0 || inches > 11) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }
  if (feet === 0 || (feet === 1 && inches === 0)) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }

  const weight = Number(document.getElementById('weight').value);
  const gender = document.getElementById('gender').value;
  if (!weight || !age || !gender) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }
  if (weight < 1 || weight > 500) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }
  if (age > 100) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }

  // Validate page 2 fields
  if (!goal || !diet || !monthText || !dayText || !yearText || !targetWeight || !sleepHours) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }

  if (!/^\d{1,2}$/.test(monthText)) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }
  if (!/^\d{1,2}$/.test(dayText)) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }
  if (!/^\d{4}$/.test(yearText)) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }

  const month = Number(monthText);
  const day = Number(dayText);
  const year = Number(yearText);
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 100;

  if (year < currentYear) {
    alert('Year must be the current year or later.');
    return;
  }
  if (year > maxYear) {
    alert(`Year must be no more than ${maxYear}.`);
    return;
  }
  if (month < 1 || month > 12) {
    alert('Month must be between 1 and 12.');
    return;
  }
  if (day < 1 || day > 31) {
    alert('Day must be between 1 and 31.');
    return;
  }

  const targetDate = new Date(year, month - 1, day);
  if (targetDate.getFullYear() !== year || targetDate.getMonth() !== month - 1 || targetDate.getDate() !== day) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (targetDate < todayMidnight) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }

  if (sleepHours < 1 || sleepHours > 23) {
    alert('Average Hours of Sleep must be between 1 and 23.');
    return;
  }

  if (targetWeight <= 0) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }
  if (targetWeight > 350) {
    alert('Please fill out ALL fields on both pages to continue.');
    return;
  }

  const targetWeightLbs = targetWeight; // assuming lbs
  const currentWeightLbs = currentWeight;
  if (['Gaining Weight', 'Gaining Muscle'].includes(goal) && targetWeightLbs <= currentWeightLbs + 1) {
    alert('For this goal, the target weight must be at least 1 pound higher than your current weight.');
    return;
  }
  if (['Losing Weight', 'Losing Fat'].includes(goal) && targetWeightLbs >= currentWeightLbs - 1) {
    alert('For this goal, the target weight must be at least 1 pound lower than your current weight.');
    return;
  }

  planContent.innerHTML = generatePlan({
    height,
    currentWeight: currentWeightLbs,
    age,
    goal,
    diet,
    targetDate,
    targetWeight: targetWeightLbs,
    sleepHours,
  });
  showPage(page3);
});

restartBtn.addEventListener('click', () => {
  document.getElementById('heightFeet').value = '';
  document.getElementById('heightInches').value = '';
  document.getElementById('weight').value = '';
  document.getElementById('age').value = '';
  document.getElementById('gender').selectedIndex = 0;
  document.getElementById('goal').selectedIndex = 0;
  document.getElementById('diet').selectedIndex = 0;
  document.getElementById('month').value = '';
  document.getElementById('day').value = '';
  document.getElementById('year').value = '';
  document.getElementById('targetWeight').value = '';
  document.getElementById('sleepHours').value = '';
  planContent.textContent = '';
  showPage(page1);
});

function generatePlan(data) {
  const maintenance = estimateMaintenance(data.currentWeight, data.height, data.age);
  const days = Math.max(1, Math.round((data.targetDate - new Date()) / 86400000));
  const weightDelta = Number((data.targetWeight - data.currentWeight).toFixed(1));
  const absDelta = Math.abs(weightDelta);
  const dailyCalorieDelta = Math.round((absDelta * 3500) / days);
  let goalAdvice = '';

  if (data.goal === 'Gaining Weight') {
    goalAdvice = `To gain weight healthily, choose nutrient-dense meals and prioritize balanced proteins, carbs, and fats. For ${data.diet.toLowerCase()} diets, focus on ${dietDetails(data.diet, 'gain')}.`;
  } else if (data.goal === 'Gaining Muscle') {
    goalAdvice = `To build muscle, do strength training 3–5 times per week and eat protein-rich meals each day. Keep a calorie surplus and choose quality protein sources such as ${dietDetails(data.diet, 'muscle')}.`;
  } else if (data.goal === 'Losing Weight') {
    goalAdvice = `To lose weight, focus on whole foods, portion control, and a moderate calorie deficit. For ${data.diet.toLowerCase()} diets, prefer ${dietDetails(data.diet, 'lose')}.`;
  } else if (data.goal === 'Losing Fat') {
    goalAdvice = `To lose fat, combine strength training with cardio, cut sugar and processed foods, and stay in a mild calorie deficit. Eat protein-rich meals and clean carbs, especially from ${dietDetails(data.diet, 'fat')}.`;
  } else if (data.goal === 'Proper Diet') {
    goalAdvice = `Track calories, protein, carbs, and fat daily. A balanced diet typically includes lean protein, vegetables, whole grains, and healthy fats. A surplus supports gains, and a deficit supports fat loss.`;
  } else {
    goalAdvice = `General advice: move consistently, eat whole foods, sleep 7-9 hours, hydrate, and manage stress.`;
  }

  let sleepAdvice = '';
  if (data.sleepHours < 7) {
    sleepAdvice = 'You are likely getting too little sleep; aim for 7-9 hours each night to support recovery and fitness progress.';
  } else if (data.sleepHours > 9) {
    sleepAdvice = 'Your sleep is above the typical healthy range; too much sleep can reduce daily activity and may indicate poor sleep quality.';
  } else {
    sleepAdvice = 'Your sleep duration is within the healthy 7-9 hour range for fitness recovery and performance.';
  }

  let calorieMessage = '';
  if (['Gaining Weight', 'Gaining Muscle'].includes(data.goal)) {
    calorieMessage = `Estimated maintenance: ${maintenance} calories/day. Aim for about ${maintenance + dailyCalorieDelta} calories/day to reach your goal by ${formatDate(data.targetDate)}.`;
  } else if (['Losing Weight', 'Losing Fat'].includes(data.goal)) {
    calorieMessage = `Estimated maintenance: ${maintenance} calories/day. Aim for about ${maintenance - dailyCalorieDelta} calories/day to reach your goal by ${formatDate(data.targetDate)}.`;
  } else {
    calorieMessage = `Estimated maintenance: ${maintenance} calories/day. Use this as your baseline for your nutritional plan.`;
  }

  const paceWarning = days < 14 && absDelta > 4 ? '\nWarning: That goal is aggressive for the available timeline. Aim for 1–2 lbs per week.' : '';
  const rangeWarning = absDelta / Math.max(1, days / 7) > 2.5 ? '\nNote: This pace may be unhealthy. A safer pace is 1–2 lbs per week.' : '';

  return `Here is your plan:\n\n${goalAdvice}\n\n${sleepAdvice}\n\n${calorieMessage}${paceWarning}${rangeWarning}`;
}

function dietDetails(diet, type) {
  if (diet === 'Non-vegetarian') {
    if (type === 'gain') return 'lean meats, eggs, dairy, nuts, and whole grains';
    if (type === 'muscle') return 'chicken, fish, eggs, and lean beef';
    if (type === 'lose') return 'lean poultry, fish, vegetables, and whole grains';
    if (type === 'fat') return 'lean protein, vegetables, and fiber-rich carbs';
  }
  if (diet === 'Vegetarian') {
    if (type === 'gain') return 'dairy, eggs, legumes, nuts, and whole grains';
    if (type === 'muscle') return 'eggs, dairy, legumes, and tofu';
    if (type === 'lose') return 'beans, lentils, vegetables, and whole grains';
    if (type === 'fat') return 'plant proteins, vegetables, and whole grains';
  }
  if (diet === 'Vegan') {
    if (type === 'gain') return 'tofu, tempeh, legumes, nuts, seeds, and whole grains';
    if (type === 'muscle') return 'tofu, tempeh, legumes, and seitan';
    if (type === 'lose') return 'legumes, vegetables, whole grains, and healthy fats';
    if (type === 'fat') return 'plant proteins, vegetables, and fiber-rich carbs';
  }
  return 'a balanced variety of whole foods';
}

function estimateMaintenance(weight, height, age) {
  const weightKg = weight / 2.20462;
  const heightCm = height * 2.54;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  return Math.round(bmr * 1.4);
}

function formatDate(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}/${date.getFullYear()}`;
}
