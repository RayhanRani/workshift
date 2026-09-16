/**
 * SCU WorkShift: app logic.
 * One linear flow, five screens, shared by every school:
 * landing -> task -> simulator -> reality -> career
 */

const SCREENS = ["landing", "task", "simulator", "reality", "career"];

const state = {
  screen: "landing",
  schoolId: null,
  verticalId: null,
  sliders: null, // { volume, hourlyValue, aiAccuracy }
};

function findVertical(schoolId, verticalId) {
  const school = WORKSHIFT_DATA.schools.find((s) => s.id === schoolId);
  if (!school) return null;
  return school.verticals.find((v) => v.id === verticalId) || null;
}

function currentSchool() {
  return WORKSHIFT_DATA.schools.find((s) => s.id === state.schoolId) || null;
}

function currentVertical() {
  return findVertical(state.schoolId, state.verticalId);
}

function goTo(screen) {
  state.screen = screen;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectSchool(schoolId) {
  const school = WORKSHIFT_DATA.schools.find((s) => s.id === schoolId);
  const vertical = school.verticals[0];
  state.schoolId = schoolId;
  state.verticalId = vertical.id;
  state.sliders = { ...vertical.lenses.productivity.defaults };
  goTo("task");
}

function resetToLanding() {
  state.schoolId = null;
  state.verticalId = null;
  state.sliders = null;
  goTo("landing");
}

/* ---------- Simulator math ---------- */

function computeSimResults(vertical, sliders) {
  const { manual, ai } = vertical;
  const { volume, hourlyValue, aiAccuracy } = sliders;

  const manualTotalCost = (manual.timeMin / 60) * hourlyValue + manual.toolCost;
  const aiTotalCost = (ai.timeMin / 60) * hourlyValue + ai.toolCost;

  const manualCostPerUsable = manualTotalCost / manual.usableRate;
  const aiCostPerUsable = aiTotalCost / aiAccuracy;

  const breakEvenAccuracy = aiTotalCost / manualCostPerUsable;

  const manualMonthlyTime = (manual.timeMin / 60) * volume;
  const aiMonthlyTime = (ai.timeMin / 60) * volume;
  const timeSavedHours = manualMonthlyTime - aiMonthlyTime;

  const aiWins = aiCostPerUsable < manualCostPerUsable;

  const env = vertical.lenses.environment;
  const aiFootprint = {
    carbonG: env.ai.carbonG * volume,
    waterMl: env.ai.waterMl * volume,
  };
  const manualFootprint = {
    carbonG: env.manual.carbonG * volume,
    waterMl: env.manual.waterMl * volume,
  };

  return {
    manualTotalCost,
    aiTotalCost,
    manualCostPerUsable,
    aiCostPerUsable,
    breakEvenAccuracy,
    timeSavedHours,
    aiWins,
    aiFootprint,
    manualFootprint,
  };
}

/* ---------- Render helpers ---------- */

function fmtMoney(n) {
  return `$${n.toFixed(2)}`;
}
function fmtPct(n) {
  return `${Math.round(n * 100)}%`;
}

function progressDots() {
  const idx = SCREENS.indexOf(state.screen);
  return `<div class="progress-dots">${SCREENS.map((s, i) => {
    let cls = "dot";
    if (i === idx) cls += " active";
    else if (i < idx) cls += " done";
    return `<div class="${cls}"></div>`;
  }).join("")}</div>`;
}

function topbar() {
  return `
    <div class="topbar">
      <div class="brand">
        <span class="bronco">🐴</span>
        <div>SCU WorkShift<br/><small>Know before you go pro</small></div>
      </div>
      ${state.screen !== "landing" ? progressDots() : ""}
    </div>
  `;
}

function verticalChip(vertical, school) {
  return `
    <div class="vertical-chip">
      <span class="chip-icon">${school.icon}</span>
      ${school.short} · ${vertical.name}
    </div>
  `;
}

/* ---------- Screens ---------- */

function renderLanding() {
  return `
    <div class="screen">
      <h1 class="headline">Pick your school. <span class="headline-break">See the future of your field.</span></h1>
      <p class="subhead">One real task, done by hand and by AI. Five minutes. Find out what to actually study.</p>
      <div class="school-grid">
        ${WORKSHIFT_DATA.schools.map((school) => `
          <button class="school-card ${school.color}" data-school="${school.id}">
            <div class="icon-tile">${school.icon}</div>
            <div class="school-body">
              <div class="school-name">${school.name}</div>
              <div class="school-vertical">${school.verticals[0].name}</div>
              <span class="school-task-chip">${school.verticals[0].task}</span>
            </div>
            <div class="arrow">→</div>
          </button>
        `).join("")}
      </div>
      <p class="landing-footer-note">Every claim here is backed by a real study. We show you the vendor pitch too, so you can tell the difference.</p>
    </div>
  `;
}

function renderTask(vertical, school) {
  return `
    <div class="screen">
      ${verticalChip(vertical, school)}
      <div class="task-title">${vertical.task}</div>
      <p class="tile-note">${vertical.tagline}</p>
      <div class="mosaic">
        <div class="tile manual">
          <div class="tile-label">Manual</div>
          <div class="tile-tool">${vertical.manual.tool}</div>
          <div class="tile-blurb">${vertical.manual.blurb}</div>
          <div class="tile-stats">
            <div class="stat">Time<b>${vertical.manual.timeMin} min</b></div>
            <div class="stat">Usable<b>${fmtPct(vertical.manual.usableRate)}</b></div>
          </div>
        </div>
        <div class="vs-badge">VS</div>
        <div class="tile ai">
          <div class="tile-label">With AI</div>
          <div class="tile-tool">${vertical.ai.tool}</div>
          <div class="tile-blurb">${vertical.ai.blurb}</div>
          <div class="tile-stats">
            <div class="stat">Time<b>${vertical.ai.timeMin} min</b></div>
            <div class="stat">Usable<b>${fmtPct(vertical.ai.usableRate)}</b></div>
          </div>
        </div>
      </div>
      <div class="nav-row">
        <button class="back-link" data-action="back-to-landing">← Choose a different school</button>
        <button class="btn btn-primary" data-action="go-simulator">Play the simulator →</button>
      </div>
    </div>
  `;
}

function renderSimulator(vertical, school) {
  const sliders = state.sliders;
  const results = computeSimResults(vertical, sliders);
  const winnerClass = results.aiWins ? "ai-wins" : "manual-wins";
  const winnerText = results.aiWins ? "🤖 AI wins right now" : "🙋 Manual wins right now";
  const winnerSub = results.aiWins
    ? `At ${fmtPct(sliders.aiAccuracy)} accuracy, AI is cheaper per usable output.`
    : `At ${fmtPct(sliders.aiAccuracy)} accuracy, AI costs more per usable output than doing it yourself.`;

  return `
    <div class="screen">
      ${verticalChip(vertical, school)}
      <h1 class="headline">Drag the sliders. Watch it flip.</h1>
      <p class="subhead">This is the real math behind "AI is faster." Move accuracy down toward what studies actually found, and see when the tradeoff flips.</p>

      <div class="sim-panel">
        <div class="slider-group">
          <label>Volume per month <span class="value" id="label-volume">${sliders.volume}</span></label>
          <input type="range" min="1" max="200" value="${sliders.volume}" data-slider="volume" />
          <div class="slider-caption">How many of these tasks you'd do in a month.</div>
        </div>
        <div class="slider-group">
          <label>Value of your time ($/hr) <span class="value" id="label-hourlyValue">$${sliders.hourlyValue}</span></label>
          <input type="range" min="10" max="150" value="${sliders.hourlyValue}" data-slider="hourlyValue" />
          <div class="slider-caption">What an hour of your work is worth.</div>
        </div>
        <div class="slider-group">
          <label>AI accuracy / usable rate <span class="value" id="label-aiAccuracy">${fmtPct(sliders.aiAccuracy)}</span></label>
          <input type="range" min="1" max="100" value="${Math.round(sliders.aiAccuracy * 100)}" data-slider="aiAccuracy" />
          <div class="slider-caption" id="accuracy-caption">Break-even is ${fmtPct(results.breakEvenAccuracy)}, drag below it and watch the banner flip.</div>
        </div>
      </div>

      <div class="result-banner ${winnerClass}" id="result-banner">
        <span id="banner-text">${winnerText}</span>
        <span class="sub" id="banner-sub">${winnerSub}</span>
      </div>

      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">Cost per usable output</div>
          <div class="metric-value ${results.aiWins ? "green" : ""}" id="metric-cost-ai">${fmtMoney(results.aiCostPerUsable)}<span style="font-size:0.6em;color:#93897f;font-weight:600;"> AI</span></div>
          <div class="metric-value cardinal" style="font-size:0.95rem;margin-top:2px;" id="metric-cost-manual">${fmtMoney(results.manualCostPerUsable)} <span style="font-size:0.7em;color:#93897f;font-weight:600;">manual</span></div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Time saved / month</div>
          <div class="metric-value ${results.timeSavedHours >= 0 ? "green" : "cardinal"}" id="metric-time-saved">${results.timeSavedHours.toFixed(1)} hrs</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Break-even accuracy</div>
          <div class="metric-value" id="metric-breakeven">${fmtPct(results.breakEvenAccuracy)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Footprint / month (AI)</div>
          <div class="metric-value" style="font-size:1.05rem;" id="metric-footprint-ai">${(results.aiFootprint.carbonG / 1000).toFixed(2)} kg CO₂e</div>
        </div>
      </div>
      <p class="footprint-note" id="footprint-note">Manual footprint at this volume: ${(results.manualFootprint.carbonG / 1000).toFixed(2)} kg CO₂e · ${(results.manualFootprint.waterMl / 1000).toFixed(2)} L water</p>

      <div class="nav-row">
        <button class="back-link" data-action="go-task">← Back to the task</button>
        <button class="btn btn-primary" data-action="go-reality">See the reality check →</button>
      </div>
    </div>
  `;
}

/**
 * Patches only the numbers/banner during a slider drag, leaving the
 * <input> elements themselves untouched so the browser's own drag
 * gesture never gets interrupted by a DOM replacement mid-drag.
 */
function updateSimulatorDisplay(vertical) {
  const sliders = state.sliders;
  const results = computeSimResults(vertical, sliders);

  document.getElementById("label-volume").textContent = sliders.volume;
  document.getElementById("label-hourlyValue").textContent = `$${sliders.hourlyValue}`;
  document.getElementById("label-aiAccuracy").textContent = fmtPct(sliders.aiAccuracy);
  document.getElementById("accuracy-caption").textContent =
    `Break-even is ${fmtPct(results.breakEvenAccuracy)}, drag below it and watch the banner flip.`;

  const winnerClass = results.aiWins ? "ai-wins" : "manual-wins";
  const winnerText = results.aiWins ? "🤖 AI wins right now" : "🙋 Manual wins right now";
  const winnerSub = results.aiWins
    ? `At ${fmtPct(sliders.aiAccuracy)} accuracy, AI is cheaper per usable output.`
    : `At ${fmtPct(sliders.aiAccuracy)} accuracy, AI costs more per usable output than doing it yourself.`;

  const banner = document.getElementById("result-banner");
  banner.className = `result-banner ${winnerClass}`;
  document.getElementById("banner-text").textContent = winnerText;
  document.getElementById("banner-sub").textContent = winnerSub;

  const costAi = document.getElementById("metric-cost-ai");
  costAi.className = `metric-value ${results.aiWins ? "green" : ""}`;
  costAi.innerHTML = `${fmtMoney(results.aiCostPerUsable)}<span style="font-size:0.6em;color:#93897f;font-weight:600;"> AI</span>`;
  document.getElementById("metric-cost-manual").innerHTML =
    `${fmtMoney(results.manualCostPerUsable)} <span style="font-size:0.7em;color:#93897f;font-weight:600;">manual</span>`;

  const timeSaved = document.getElementById("metric-time-saved");
  timeSaved.className = `metric-value ${results.timeSavedHours >= 0 ? "green" : "cardinal"}`;
  timeSaved.textContent = `${results.timeSavedHours.toFixed(1)} hrs`;

  document.getElementById("metric-breakeven").textContent = fmtPct(results.breakEvenAccuracy);
  document.getElementById("metric-footprint-ai").textContent = `${(results.aiFootprint.carbonG / 1000).toFixed(2)} kg CO₂e`;
  document.getElementById("footprint-note").textContent =
    `Manual footprint at this volume: ${(results.manualFootprint.carbonG / 1000).toFixed(2)} kg CO₂e · ${(results.manualFootprint.waterMl / 1000).toFixed(2)} L water`;
}

function renderReality(vertical, school) {
  return `
    <div class="screen">
      ${verticalChip(vertical, school)}
      <h1 class="headline">The pitch vs. the evidence</h1>
      <p class="subhead">Marketing says one thing. Researchers found another. Here's both, side by side.</p>

      <div class="reality-card">
        <div class="reality-row pitch">
          <span class="reality-tag">The pitch</span>
          <div class="reality-text">${vertical.realityCheck.pitch}</div>
        </div>
        <div class="reality-row evidence">
          <span class="reality-tag">What the research found</span>
          <div class="reality-text">${vertical.realityCheck.evidence}</div>
        </div>
      </div>

      <div class="sources-list">
        ${vertical.sources.map((s) => `<span class="source-tag">${s.date}: <a href="${s.url}" target="_blank" rel="noopener">${s.name}</a></span>`).join("")}
      </div>

      <div class="nav-row">
        <button class="back-link" data-action="go-simulator">← Back to simulator</button>
        <button class="btn btn-primary" data-action="go-career">What should I learn? →</button>
      </div>
    </div>
  `;
}

function renderCareer(vertical, school) {
  const otherSchools = WORKSHIFT_DATA.schools.filter((s) => s.id !== school.id);
  return `
    <div class="screen">
      ${verticalChip(vertical, school)}
      <h1 class="headline">What this means for you</h1>

      <div class="shift-narrative">${vertical.lenses.career.shift}</div>

      <div class="skills-cols">
        <div class="skills-col rising">
          <div class="col-title">📈 Skills rising</div>
          <ul>${vertical.lenses.career.skillsRising.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
        <div class="skills-col fading">
          <div class="col-title">📉 Skills fading</div>
          <ul>${vertical.lenses.career.skillsFading.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
      </div>

      <div class="screenshot-card">
        <span class="tag">📸 Screenshot this</span>
        <div class="learn-text">${vertical.lenses.career.whatToLearn}</div>
      </div>

      <div class="explore-again">
        <p>Curious how this plays out somewhere else?</p>
        <div class="explore-chips">
          ${otherSchools.map((s) => `<button class="explore-chip" data-school="${s.id}">${s.icon} Try ${s.short}</button>`).join("")}
          <button class="explore-chip" data-action="restart">🔁 Start over</button>
        </div>
      </div>
    </div>
  `;
}

/* ---------- Main render ---------- */

function render() {
  const app = document.getElementById("app");
  let body = "";

  if (state.screen === "landing") {
    body = renderLanding();
  } else {
    const vertical = currentVertical();
    const school = currentSchool();
    if (!vertical || !school) {
      state.screen = "landing";
      body = renderLanding();
    } else if (state.screen === "task") {
      body = renderTask(vertical, school);
    } else if (state.screen === "simulator") {
      body = renderSimulator(vertical, school);
    } else if (state.screen === "reality") {
      body = renderReality(vertical, school);
    } else if (state.screen === "career") {
      body = renderCareer(vertical, school);
    }
  }

  app.innerHTML = topbar() + body;
  attachHandlers();
}

function attachHandlers() {
  document.querySelectorAll("[data-school]").forEach((el) => {
    el.addEventListener("click", () => selectSchool(el.dataset.school));
  });
  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", () => {
      const action = el.dataset.action;
      if (action === "go-simulator") goTo("simulator");
      else if (action === "go-task") goTo("task");
      else if (action === "go-reality") goTo("reality");
      else if (action === "go-career") goTo("career");
      else if (action === "back-to-landing") resetToLanding();
      else if (action === "restart") resetToLanding();
    });
  });
  document.querySelectorAll("[data-slider]").forEach((el) => {
    el.addEventListener("input", () => {
      const key = el.dataset.slider;
      const raw = Number(el.value);
      state.sliders[key] = key === "aiAccuracy" ? raw / 100 : raw;
      updateSimulatorDisplay(currentVertical());
    });
  });
}

render();
