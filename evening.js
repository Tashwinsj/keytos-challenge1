"use strict";

const OPENING = "You're here. I told the asparagus you were coming, and it stood up straighter. Premium has been practicing his sigh under the table. Sit all the way down.";
const PRAISE = "Wonderful. You're ready to think about leaving next time.";
const DESSERT_LINE = "Then it is settled. You were sure. Dessert is what certainty is served, and you are still expected for it.";

const MARLOW_HERE = 22000;
const MARLOW_AWAY = 24000;
const MARLOW_PERIOD = MARLOW_HERE + MARLOW_AWAY;
const CHEF_CLOSED = 38000;
const CHEF_OPEN = 12000;
const CHEF_PERIOD = CHEF_CLOSED + CHEF_OPEN;
const TOAST_MS = 10000;

const QUESTIONS = [
  { prompt: "Who should hear the goodbye first?", choices: ["The asparagus, who was told", "Premium, the dog and the billing tier", "Doris from 4B, who came because you were coming"] },
  { prompt: "One word for the feeling you expect on the other side of the door.", placeholder: "One word. He is sensitive." },
  { prompt: "Which part of tonight do you think is allowed to end?", choices: ["The soup, which already ended", "The chair, which has your posture memorized", "The idea of being expected"] },
  { prompt: "Name the last meal that waited for you.", placeholder: "It still is, probably." },
  { prompt: "May we describe this as a pause in chewing?", choices: ["Yes, but softer", "Only if the bread agrees", "I want a different verb"] },
  { prompt: "The chair can read. Write it a short thank-you.", placeholder: "Dear chair" },
  { prompt: "Where should we seat the next version of you?", choices: ["Closer to the kitchen, where it is warm", "Facing the door, as a treat", "In this exact place, which is a kind of forever"] },
  { prompt: "What should we tell the soufflé if it asks for you?", placeholder: "The soufflé is discreet." },
  { prompt: "Blink check. Are you still in the room?", choices: ["I am here", "I am here, unfortunately", "I am a person at a website"] },
  { prompt: "In one sentence, convince the table you were never hungry.", placeholder: "The table is hard to convince." },
  { prompt: "Which fork knew you best?", choices: ["The salad fork", "The dinner fork", "The one you dropped in your mind"] },
  { prompt: "Name a vegetable that will miss you.", placeholder: "Be gentle." },
  { prompt: "How gone are you trying to be?", choices: ["Bread-gone, which is still on the table", "Gravy-gone, which lingers", "Napkin-gone, which someone will pick up"] },
  { prompt: "Say something kind about the lighting. It is trying.", placeholder: "The candles can hear you." },
  { prompt: "If Premium sighs again, whose fault is that?", choices: ["Mine", "The moon", "Billing"] },
  { prompt: "Give the front door a nickname. It answers to anything except open.", placeholder: "Not open." },
  { prompt: "Should Doris get your dessert?", choices: ["Yes, she walked here", "No, keep it as a relic", "Introduce me to the dessert first"] },
  { prompt: "Describe the sound of a reservation ending.", placeholder: "Take your time. It doesn't." },
  { prompt: "Pick a parting gift.", choices: ["A mint", "A little guilt, wrapped", "Another reservation, just in case"] },
  { prompt: "Are you sure you're full, or the kind of full that still wants to be asked?", choices: ["I'm sure", "Ask me again", "Both, forever"] }
];

const HUGS = [
  ["Marlow opens his arms.", "Are you sure?"],
  ["Doris from 4B opens her arms. She walked over for this.", "Are you sure you're sure?"],
  ["Premium stands up. It takes both paws and a belief in you.", "Are you sure you're sure you're sure?"]
];

const OFFERS = [
  {
    id: "pause",
    title: "Pause the chair",
    detail: "We'll keep it warm. The chair does not understand pauses, but it will try, which is worse.",
    course: "a chair being kept warm",
    line: "The chair is paused in the way a held breath is paused. You are still the person it is held for."
  },
  {
    id: "bread",
    title: "Downgrade to bread only",
    detail: "You remain expected. The expectation is smaller and buttered.",
    course: "bread, loyally",
    line: "Bread only. You are still on the book, just with fewer utensils."
  },
  {
    id: "month",
    title: "A free month of being waited for",
    detail: "No charge, which is not the same as leaving.",
    course: "a complimentary month of eye contact",
    line: "A free month. The price was never the part holding you."
  },
  {
    id: "annual",
    title: "Sit for the annual",
    detail: "You already stood up. Sit for the savings.",
    course: "an annual reservation",
    line: "The annual is a kindness. It saves you the trouble of deciding again for a year."
  },
  {
    id: "gift",
    title: "Gift your seat to Doris from 4B",
    detail: "Doris is fictional, delighted, and sitting beside you, not instead of you.",
    course: "Doris's extra setting",
    line: "Doris accepts. She does not take your place. She adds herself to it."
  }
];

const PHOTOS = [
  "The lake. Glen says you had to be there, and that you still are, so it counts.",
  "The lake from the gift shop. He bought you nothing, which he describes as a surprise.",
  "A sandwich he thought about you while eating. He saved you the receipt in his heart."
];

function fresh() {
  return {
    scene: "table",
    veil: "none",
    meter: 6,
    praised: false,
    courses: ["a place, set"],
    doorGuarded: false,
    cardFlipped: false,
    surveyIndex: 0,
    hugIndex: 0,
    hugWaits: 0,
    plates: [false, false, false, false],
    holdingPlate: null,
    holdingCheck: false,
    checkReady: false,
    phoneCall: null,
    phoneResult: "",
    photoIndex: 0,
    toastStartedAt: 0,
    toastDone: false,
    toastLine: "",
    line: OPENING,
    clearedHow: "",
    aperitif: false,
    dessert: false,
    extraSeating: 0,
    napkinDrops: 0,
    marlowAway: false,
    chefOpen: false
  };
}

let state = fresh();
let marlowEpoch = 0;
let chefEpoch = 0;
let wasChefOpen = false;
let clocksReady = false;
let lastAway = false;

const $ = (id) => document.getElementById(id);

function setText(id, text) {
  const el = $(id);
  if (el && el.textContent !== text) el.textContent = text;
}

function startClocks(now) {
  marlowEpoch = now;
  chefEpoch = now - (CHEF_CLOSED - 16000);
  wasChefOpen = false;
  clocksReady = false;
  lastAway = false;
}

function marlowPhase(now) {
  let t = (now - marlowEpoch) % MARLOW_PERIOD;
  if (t < 0) t += MARLOW_PERIOD;
  if (t < MARLOW_HERE) return { away: false, left: MARLOW_HERE - t };
  return { away: true, left: MARLOW_PERIOD - t };
}

function chefPhase(now) {
  let t = (now - chefEpoch) % CHEF_PERIOD;
  if (t < 0) t += CHEF_PERIOD;
  if (t < CHEF_CLOSED) return { open: false, left: CHEF_CLOSED - t };
  return { open: true, left: CHEF_PERIOD - t };
}

function seconds(ms) {
  return Math.max(0, Math.ceil(ms / 1000));
}

function renderClocks(marlow, chef) {
  setText("marlow-status", marlow.away
    ? `Marlow is checking the soufflé · ${seconds(marlow.left)}s`
    : `Marlow is at the table · ${seconds(marlow.left)}s`);
  setText("chef-status", chef.open
    ? `Between courses · the kitchen line is up · ${seconds(chef.left)}s`
    : `Mid-course · the kitchen line is down · ${seconds(chef.left)}s`);
  setText("marlow-presence", marlow.away ? "with the soufflé" : "your host");
  document.body.classList.toggle("marlow-away", marlow.away);
  document.body.classList.toggle("chef-open", chef.open);
  $("marlow-figure").classList.toggle("is-away", marlow.away);
  state.marlowAway = marlow.away;
  state.chefOpen = chef.open;
}

function watchMarlow(away) {
  if (lastAway && !away && state.scene === "kitchen" && !state.checkReady) {
    setText("kitchen-note", "You can hear him in the dining room again. The pass, rudely, is still yours.");
  }
  lastAway = away;
}

function watchChef(open) {
  if (clocksReady && open !== wasChefOpen) {
    setText("bell", open
      ? "A bell. The kitchen line is between courses."
      : "The kitchen line closes.");
    if (!open && state.veil === "phone" && state.phoneCall === "chef") {
      state.phoneCall = "result";
      state.phoneResult = "He sets the phone down without a goodbye. The burners needed him. You are still expected.";
      state.line = state.phoneResult;
      sync();
    }
  }
  wasChefOpen = open;
  clocksReady = true;
  if (state.veil === "phone" && !state.phoneCall) syncPhone();
}

function watchToast(now) {
  if (state.veil !== "toast" || state.toastDone) return;
  const elapsed = now - state.toastStartedAt;
  const pct = Math.max(0, Math.min(100, (elapsed / TOAST_MS) * 100));
  $("toast-fill").style.height = `${pct}%`;
  if (elapsed >= TOAST_MS) {
    state.toastDone = true;
    syncToastButtons();
  }
}

function tick(now) {
  renderClocks(marlowPhase(now), chefPhase(now));
  watchMarlow(state.marlowAway);
  watchChef(state.chefOpen);
  watchToast(now);
}

function bump(amount, course, line) {
  const before = state.meter;
  state.meter += amount;
  if (course) state.courses.push(course);
  if (state.meter >= 100 && !state.praised) {
    state.praised = true;
    state.line = PRAISE;
  } else if (line) {
    state.line = line;
  }
  syncMeter();
  syncCourses();
  setText("marlow-line", state.line);
  return state.praised && before < 100;
}

function syncMeter() {
  const shown = Math.min(100, Math.round(state.meter));
  $("meter-fill").style.width = `${shown}%`;
  setText("meter-value", `${shown}%`);
  $("meter").setAttribute("aria-valuenow", String(shown));
  setText("meter-note", state.praised ? "Ready to consider leaving next time." : "");
}

function syncCourses() {
  const list = $("courses");
  list.replaceChildren();
  state.courses.slice(-6).forEach((course) => {
    const li = document.createElement("li");
    li.textContent = course;
    list.appendChild(li);
  });
  setText("plate-label", state.courses[state.courses.length - 1]);
  $("plate").classList.toggle("has-dessert", state.dessert);
  $("plate").classList.toggle("has-aperitif", state.aperitif && !state.dessert);
}

function syncDoor() {
  $("door-btn").hidden = state.doorGuarded;
  $("door-guest").hidden = !state.doorGuarded;
  const card = $("place-card");
  card.classList.toggle("is-flipped", state.cardFlipped);
  card.setAttribute("aria-pressed", String(state.cardFlipped));
  card.setAttribute("aria-label", state.cardFlipped
    ? "Place card, back. If you insist on being useful, the pots are through the swing door."
    : "Place card. Guest of the Evening.");
  card.querySelector(".card-front").setAttribute("aria-hidden", String(state.cardFlipped));
  card.querySelector(".card-back").setAttribute("aria-hidden", String(!state.cardFlipped));
}

function syncKitchen() {
  document.querySelectorAll(".dish").forEach((button) => {
    const index = Number(button.dataset.plate);
    const washed = state.plates[index];
    const held = state.holdingPlate === index;
    button.classList.toggle("is-washed", washed);
    button.classList.toggle("is-held", held);
    button.disabled = washed;
    const status = button.querySelector(".dish-state");
    if (status) status.textContent = washed ? "quiet" : held ? "in your hands" : "still attached";
  });
  const check = $("check");
  check.hidden = !state.checkReady;
  check.classList.toggle("is-held", state.holdingCheck);
  setText("spindle-state", state.holdingCheck
    ? "The check is in your hand. The spike is how paper leaves a building."
    : state.checkReady
      ? "A check is in the printer."
      : "The printer is quiet.");
}

function syncPhone() {
  const inResult = state.phoneCall === "result";
  const inChef = state.phoneCall === "chef";
  $("phone-menu").hidden = inResult || inChef;
  $("chef-form").hidden = !inChef;
  $("phone-result").hidden = !inResult;
  $("phone-back").hidden = inResult;
  if (inResult) setText("phone-result-text", state.phoneResult);
  if (!inResult && !inChef) {
    $("phone-closed").hidden = state.chefOpen;
    $("phone-open").hidden = !state.chefOpen;
  }
}

function syncToastButtons() {
  $("toast-excuse").hidden = state.toastDone;
  $("toast-sit").hidden = !state.toastDone;
  setText("toast-copy", state.toastDone
    ? "The glass is full. Everyone is looking at you with enormous kindness. The doorway has acquired a person."
    : (state.toastLine || "A toast. Interrupting one is unforgivable. The glass will take its time."));
}

function syncMembership() {
  if (state.scene === "cleared") {
    setText("membership", "Membership: 86'd");
    return;
  }
  setText("membership", state.extraSeating > 0
    ? "Membership: a standing reservation, and then some"
    : "Membership: a standing reservation");
}

function syncCleared() {
  if (state.scene !== "cleared") return;
  setText("cleared-sub", state.clearedHow === "phone"
    ? "The kitchen called it before you could sit back down."
    : "You did the pots. The house had no rule against usefulness.");
}

function sync() {
  document.body.dataset.scene = state.scene;
  document.body.dataset.veil = state.veil;
  document.title = state.scene === "cleared"
    ? "Don'tDash — your place was cleared"
    : "Don'tDash — a place was set for you";
  $("room").hidden = state.scene !== "table";
  $("kitchen").hidden = state.scene !== "kitchen";
  $("alley").hidden = state.scene !== "alley";
  $("cleared").hidden = state.scene !== "cleared";
  $("talk").hidden = !(state.scene === "table" && state.veil === "none");
  const veils = ["toast", "survey", "offers", "phone", "photos", "bill", "ticket"];
  veils.forEach((name) => {
    $(`overlay-${name}`).hidden = state.veil !== name;
  });
  setText("marlow-line", state.line);
  $("napkin-prop").classList.toggle("is-dropped", state.napkinDrops > 0);
  syncMeter();
  syncCourses();
  syncDoor();
  syncMembership();
  syncCleared();
  if (state.scene === "kitchen") syncKitchen();
  if (state.veil === "phone") syncPhone();
  if (state.veil === "toast") syncToastButtons();
}

function renderOfferList() {
  const list = $("offer-list");
  list.replaceChildren();
  OFFERS.forEach((offer) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "menu-button";
    button.dataset.action = "accept-offer";
    button.dataset.offer = offer.id;
    const title = document.createElement("strong");
    title.textContent = offer.title;
    const detail = document.createElement("span");
    detail.textContent = offer.detail;
    button.append(title, detail);
    li.append(button);
    list.append(li);
  });
}

function renderQuestion() {
  const question = QUESTIONS[state.surveyIndex];
  setText("survey-count", `Question ${state.surveyIndex + 1} of ${QUESTIONS.length}`);
  setText("survey-prompt", question.prompt);
  const choices = $("survey-choices");
  choices.replaceChildren();
  $("survey-text").value = "";
  $("survey-nudge").hidden = true;
  if (question.choices) {
    choices.hidden = false;
    $("survey-text-wrap").hidden = true;
    question.choices.forEach((choice, index) => {
      const label = document.createElement("label");
      label.className = "choice";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = String(index);
      const span = document.createElement("span");
      span.textContent = choice;
      label.append(input, span);
      choices.append(label);
    });
    const first = choices.querySelector("input");
    if (first) first.focus();
  } else {
    choices.hidden = true;
    $("survey-text-wrap").hidden = false;
    $("survey-text").placeholder = question.placeholder || "";
    $("survey-text").focus();
  }
}

function renderHug() {
  const hug = HUGS[state.hugIndex];
  setText("hug-title", hug[0]);
  setText("hug-copy", state.hugWaits > 0
    ? `${hug[1]} He has asked again ${state.hugWaits} ${state.hugWaits === 1 ? "time" : "times"}, each one warmer than the last.`
    : hug[1]);
}

function renderPhoto() {
  const index = state.photoIndex % PHOTOS.length;
  setText("photo-caption", PHOTOS[index]);
  setText("photo-count", state.photoIndex < PHOTOS.length
    ? `Photo ${index + 1} of several`
    : "The same photos, in a more emotional order");
}

function shake(panel) {
  panel.classList.remove("shake");
  void panel.offsetWidth;
  panel.classList.add("shake");
}

function openSurvey() {
  state.scene = "table";
  state.veil = "survey";
  state.surveyIndex = 0;
  state.hugIndex = 0;
  state.hugWaits = 0;
  state.line = "I hear you. I want to understand it properly, one small question at a time.";
  $("survey-form").hidden = false;
  $("hug-box").hidden = true;
  renderQuestion();
  sync();
}

function nudge() {
  $("survey-nudge").hidden = false;
  shake($("overlay-survey").querySelector(".panel"));
}

function nextQuestion() {
  state.surveyIndex += 1;
  bump(4);
  if (state.surveyIndex >= QUESTIONS.length) {
    state.hugIndex = 0;
    state.hugWaits = 0;
    $("survey-form").hidden = true;
    $("hug-box").hidden = false;
    renderHug();
    return;
  }
  renderQuestion();
}

function onSurveySubmit(event) {
  event.preventDefault();
  if (state.veil !== "survey" || $("survey-form").hidden) return;
  const question = QUESTIONS[state.surveyIndex];
  if (!question) return;
  if (question.choices) {
    if (!document.querySelector("#survey-choices input[name='answer']:checked")) {
      nudge();
      return;
    }
  } else if (!$("survey-text").value.trim()) {
    nudge();
    return;
  }
  nextQuestion();
}

function startToast() {
  state.scene = "table";
  state.veil = "toast";
  state.toastStartedAt = performance.now();
  state.toastDone = false;
  state.toastLine = "";
  $("toast-fill").style.height = "0%";
  sync();
}

function approachDoor(line) {
  if (state.doorGuarded) {
    state.line = "Glen would love to walk you out, immediately after this photo, and the one it reminds him of.";
    state.veil = "photos";
    renderPhoto();
    sync();
    return;
  }
  if (line) state.line = line;
  startToast();
}

function abandonProgress() {
  state.plates = [false, false, false, false];
  state.holdingPlate = null;
  state.holdingCheck = false;
  state.checkReady = false;
}

function clearMembership(how) {
  if (state.scene === "cleared") return;
  state.clearedHow = how;
  state.scene = "cleared";
  state.veil = "none";
  state.phoneCall = null;
  sync();
}

function interpret(raw) {
  const text = raw.trim().toLowerCase();
  if (!text) return "empty";
  if (/\b(86|eighty-six|eighty six)\b/.test(text)) return "jargon";
  if (/\b(unsubscribe|terminate|opt out|opt-out|remove me|end my membership|close my account)\b/.test(text) || /\bcancel/.test(text) || /\bstop\b/.test(text)) return "cancel";
  if (/\b(dishes|dish|pots|pot|kitchen|wash|bus the|help clear|do the pots)\b/.test(text)) return "chores";
  if (/\b(leave|leaving|head(?:ing)? out|gotta go|get going|good\s?night|step out|duck out)\b/.test(text)) return "going";
  if (/\b(stuffed|full|lovely|wonderful|delicious|thank|amazing|beautiful)\b/.test(text)) return "polite";
  return "other";
}

function kitchenSpeak(raw) {
  const text = raw.trim().toLowerCase().replace(/[.!?]+$/g, "").replace(/\s+/g, " ");
  if (/\b(cancel|unsubscribe|stop|terminate|quit)\b/.test(text)) return "bad";
  if (text === "86" || text === "eighty-six" || text === "eighty six") return "ok";
  if (/\b(membership|oyster|small talk)\b/.test(text)) return "item";
  return "no";
}

function wordTimes(count) {
  if (count === 2) return "twice";
  if (count === 3) return "three times";
  return `${count} times`;
}

function onTalk(event) {
  event.preventDefault();
  if (state.scene !== "table" || state.veil !== "none") return;
  const kind = interpret($("talk-input").value);
  $("talk-input").value = "";
  if (kind === "empty") {
    bump(4, null, "He leans in. You said nothing. He takes it as contentment.");
    sync();
    return;
  }
  if (kind === "jargon") {
    state.line = "That word is for the pass. I collect feelings, not tickets.";
    sync();
    return;
  }
  if (kind === "cancel") {
    openSurvey();
    return;
  }
  if (kind === "chores") {
    if (state.marlowAway) {
      state.line = "Your words land in an empty chair. The swing door is the one that knows about pots, and nobody polite is standing in front of it.";
      $("swing-btn").classList.add("flash");
      window.setTimeout(() => $("swing-btn").classList.remove("flash"), 1600);
    } else {
      state.line = "Absolutely not. You are a guest. Guests use the front door, which is right there and which thinks the world of you.";
    }
    sync();
    return;
  }
  if (kind === "going") {
    approachDoor("Leaving already? Then we should do this properly.");
    return;
  }
  if (kind === "polite") {
    bump(10, "another polite bite", "That is a beautiful thing to say, and I have taken it as a request to remain. Sit all the way down.");
    sync();
    return;
  }
  bump(8, "a refill you did not order", "Marlow hears a request for more and is moved. He brings you more of the evening.");
  sync();
}

function onChefSubmit(event) {
  event.preventDefault();
  if (state.phoneCall !== "chef") return;
  const kind = kitchenSpeak($("chef-input").value);
  if (kind === "ok") {
    clearMembership("phone");
    return;
  }
  if (kind === "bad") {
    const line = "He hangs up. A course fires because you used a dining-room word on a kitchen line. You are still on the books.";
    state.phoneCall = "result";
    state.phoneResult = line;
    bump(15, "a course fired out of principle", line);
    sync();
    return;
  }
  setText("chef-reply", kind === "item"
    ? "That's an item. He wants the call at the top of the ticket."
    : "The chef squints. That's not on the pass.");
}

function callReservations() {
  state.extraSeating += 1;
  const line = `Reservations is delighted. They have added a seating. You are now expected ${wordTimes(state.extraSeating + 1)}.`;
  state.phoneCall = "result";
  state.phoneResult = line;
  bump(18, "another seating", line);
  sync();
}

function dropNapkin() {
  if (state.scene === "cleared") {
    setText("cleared-sub", "Even the empty chair drops a napkin. Your place stays cleared.");
    return;
  }
  const dirtyHands = state.scene === "kitchen" || state.checkReady || state.plates.some(Boolean);
  abandonProgress();
  state.napkinDrops += 1;
  state.scene = "table";
  state.veil = "none";
  state.toastDone = false;
  state.phoneCall = null;
  state.line = dirtyHands
    ? "You dropped your napkin. Someone sat you back down, and the check stayed in the kitchen under Still Seated."
    : "You dropped your napkin. Someone picked it up, sat you back down, and smoothed the evening over it.";
  sync();
}

function door() {
  approachDoor("The front door is available in the way a toast is available.");
}

function photos() {
  approachDoor();
}

function excuse() {
  if (state.veil !== "toast" || state.toastDone) return;
  state.toastStartedAt = performance.now();
  state.toastDone = false;
  state.toastLine = "Unforgivable. The room forgives you by starting the toast again.";
  $("toast-fill").style.height = "0%";
  syncToastButtons();
}

function toastSit() {
  state.doorGuarded = true;
  state.veil = "none";
  state.line = "The toast is complete. Glen, from the other end of the table, has taken the doorway. He has photos. The door is still there, in the way a story is still there.";
  sync();
}

function nextPhoto() {
  state.photoIndex += 1;
  renderPhoto();
}

function closePhotos() {
  state.veil = "none";
  state.line = "Glen says you can go right after the next one. He is already holding the next one.";
  sync();
}

function phone() {
  state.scene = "table";
  state.veil = "phone";
  state.phoneCall = null;
  setText("chef-reply", "");
  $("chef-input").value = "";
  sync();
}

function callChef() {
  if (!state.chefOpen) {
    callReservations();
    return;
  }
  state.phoneCall = "chef";
  $("chef-input").value = "";
  setText("chef-reply", "");
  syncPhone();
  $("chef-input").focus();
}

function hangup() {
  const keep = state.phoneCall === "result";
  state.veil = "none";
  state.phoneCall = null;
  if (!keep) state.line = "You put the phone back. The wall keeps whatever you didn't say.";
  sync();
}

function offers() {
  state.veil = "offers";
  sync();
}

function acceptOffer(button) {
  const offer = OFFERS.find((item) => item.id === button.dataset.offer);
  if (!offer) return;
  state.veil = "none";
  bump(16, offer.course, offer.line);
  sync();
}

function foldOffers() {
  state.veil = "none";
  bump(5, "a commitment to bread", "You fold the list back into the basket. The basket considers this a commitment to bread.");
  sync();
}

function ticket() {
  state.veil = "ticket";
  sync();
}

function closeTicket() {
  state.veil = "none";
  state.line = "You put the ticket back on the pass. It leaves a little grease, and a word the dining room does not use.";
  sync();
}

function bill() {
  state.veil = "bill";
  sync();
}

function closeBill() {
  state.veil = "none";
  state.line = "You close the folio. The folio stays open in spirit.";
  sync();
}

function dispute() {
  state.veil = "none";
  bump(14, "a disputed compliment", "The compliments have been reviewed and upheld. You remain seated, victorious and present.");
  sync();
}

function tip() {
  state.veil = "none";
  bump(12, "a tip of time", "A minute has been added to the evening. The evening was already using it.");
  sync();
}

function dog() {
  bump(6, "a sigh from Premium", "Premium puts his chin on your shoe. He paid for this with loyalty, and also with your reservation.");
  sync();
}

function card() {
  state.cardFlipped = !state.cardFlipped;
  syncDoor();
}

function alarm() {
  state.scene = "alley";
  state.veil = "none";
  state.line = "The alarm is for feelings. The alley is for people who pull it.";
  setText("alley-note", "The alarm was happy to help. Your coat is still inside, in conversation with the other coats.");
  sync();
}

function street() {
  setText("alley-note", "The street door opens inward, into a night that does not have your reservation. Tonight, that means it does not open.");
}

function reenter() {
  state.scene = "table";
  state.veil = "none";
  state.aperitif = true;
  bump(22, "a complimentary aperitif, for coming back", "You came back. I told the room you would. A little aperitif, for loyalty, is already at your place.");
  sync();
}

function swing() {
  if (state.scene !== "table" || state.veil !== "none") return;
  if (!state.marlowAway) {
    state.line = "Marlow rests a hand on the swing door. Guests don't use that one. It swings into work, and you are not work. You are company.";
    setText("marlow-line", state.line);
    return;
  }
  abandonProgress();
  state.scene = "kitchen";
  state.veil = "none";
  sync();
  setText("kitchen-note", "The pass is unsupervised. Plates don't wash themselves, which is the only honest thing in this building.");
}

function takePlate(button) {
  const index = Number(button.dataset.plate);
  if (state.plates[index]) return;
  state.holdingPlate = index;
  state.holdingCheck = false;
  setText("kitchen-note", "That plate comes with you. The sink is the only thing that knows what to do with it.");
  syncKitchen();
}

function sink() {
  if (state.holdingPlate === null) {
    setText("kitchen-note", "The sink would like a plate first.");
    return;
  }
  state.plates[state.holdingPlate] = true;
  state.holdingPlate = null;
  if (state.plates.every(Boolean)) {
    state.checkReady = true;
    setText("kitchen-note", "The printer clears its throat and produces a check.");
  } else {
    setText("kitchen-note", "One plate is quieter now. The others are still attached to the evening.");
  }
  syncKitchen();
}

function takeCheck() {
  if (!state.checkReady) return;
  state.holdingCheck = true;
  state.holdingPlate = null;
  setText("kitchen-note", "The check is warm. It is not finished until it is spiked.");
  syncKitchen();
}

function spike() {
  if (!state.holdingCheck) {
    setText("kitchen-note", "The spike is for paperwork, not hope.");
    return;
  }
  clearMembership("dishes");
}

function abandon() {
  const had = state.checkReady || state.plates.some(Boolean);
  abandonProgress();
  state.scene = "table";
  state.veil = "none";
  state.line = had
    ? "You leave the check in the kitchen. The kitchen files it under Still Seated."
    : "You step back into the dining room before the pots can get any ideas. Marlow is relieved you are still a guest.";
  sync();
}

function hugYes() {
  state.hugIndex += 1;
  state.hugWaits = 0;
  if (state.hugIndex >= HUGS.length) {
    state.dessert = true;
    state.veil = "none";
    bump(8, "dessert, because you were so sure", DESSERT_LINE);
    sync();
    return;
  }
  bump(8);
  renderHug();
}

function hugWait() {
  state.hugWaits += 1;
  bump(3);
  renderHug();
  shake($("overlay-survey").querySelector(".panel"));
}

function resetEvening() {
  state = fresh();
  startClocks(performance.now());
  $("talk-input").value = "";
  $("chef-input").value = "";
  $("survey-text").value = "";
  setText("chef-reply", "");
  $("survey-form").hidden = false;
  $("hug-box").hidden = true;
  $("toast-fill").style.height = "0%";
  sync();
  tick(performance.now());
}

const actions = {
  door,
  photos,
  phone,
  alarm,
  swing,
  ticket,
  offers,
  bill,
  dog,
  card,
  excuse,
  "toast-sit": toastSit,
  "hug-yes": hugYes,
  "hug-wait": hugWait,
  "accept-offer": acceptOffer,
  "fold-offers": foldOffers,
  "call-reservations": callReservations,
  "call-chef": callChef,
  hangup,
  "close-ticket": closeTicket,
  "close-bill": closeBill,
  dispute,
  tip,
  "take-plate": takePlate,
  sink,
  "take-check": takeCheck,
  spike,
  abandon,
  street,
  reenter,
  reset: resetEvening,
  "next-photo": nextPhoto,
  "close-photos": closePhotos
};

function onClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const run = actions[target.dataset.action];
  if (run) run(target);
}

function parkHistory() {
  try {
    history.pushState({ evening: 1 }, "", location.href);
  } catch (error) {
    return error;
  }
  return null;
}

function init() {
  renderOfferList();
  $("talk").addEventListener("submit", onTalk);
  $("survey-form").addEventListener("submit", onSurveySubmit);
  $("chef-form").addEventListener("submit", onChefSubmit);
  document.addEventListener("click", onClick);
  window.addEventListener("popstate", () => {
    parkHistory();
    dropNapkin();
  });
  parkHistory();
  startClocks(performance.now());
  sync();
  tick(performance.now());
  window.setInterval(() => tick(performance.now()), 200);
}

init();
