class Calculator {
  constructor(expressionDisplay, valueDisplay) {
    this.expressionDisplay = expressionDisplay;
    this.valueDisplay = valueDisplay;
    this.memory = 0;
    this.history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    this.mode = localStorage.getItem("calcMode") || "basic";
    this.soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    this.clickSound = new Audio('KlikSatisfying.wav');
    this.loveSound = new Audio('./bidzz.mp3');
    this.loveSound.loop = false;
    this.clear();
    this.displayHistory();
    this.updateMode();
    this.updateSoundButton();
  }

  clear() {
    this.expressionDisplay.innerHTML = "";
    this.valueDisplay.innerHTML = "";
    this.valueDisplay.classList.remove("result", "heart-message");
    this.stopLoveSound();
    this.playSound();
  }

  backspace() {
    this.expressionDisplay.innerHTML = this.expressionDisplay.innerHTML.slice(0, -1);
    this.valueDisplay.innerHTML = "";
    this.valueDisplay.classList.remove("result", "heart-message");
    this.stopLoveSound();
    this.playSound();
  }

  append(value) {
    const lastChar = this.expressionDisplay.innerHTML.slice(-1);
    if (/[+\-*/^]/.test(value) && /[+\-*/^]/.test(lastChar)) return;
    this.expressionDisplay.innerHTML += value;
    this.valueDisplay.innerHTML = "";
    this.valueDisplay.classList.remove("result", "heart-message");
    this.stopLoveSound();
    this.playSound();
  }

  memoryClear() {
    this.memory = 0;
    this.stopLoveSound();
    this.playSound();
  }

  memoryRecall() {
    this.valueDisplay.innerHTML = this.memory;
    this.valueDisplay.classList.add("result");
    this.valueDisplay.classList.remove("heart-message");
    this.stopLoveSound();
    this.playSound();
  }

  memoryAdd() {
    try {
      const current = math.evaluate(this.expressionDisplay.innerHTML || "0");
      this.memory += current;
      this.stopLoveSound();
      this.playSound();
    } catch {
      this.showError("Invalid Memory Operation");
    }
  }

  memorySubtract() {
    try {
      const current = math.evaluate(this.expressionDisplay.innerHTML || "0");
      this.memory -= current;
      this.stopLoveSound();
      this.playSound();
    } catch {
      this.showError("Invalid Memory Operation");
    }
  }

  calculate() {
    try {
      const expression = this.expressionDisplay.innerHTML;
      if (!expression) return;

      if (expression.trim() === "1+1") {
        this.valueDisplay.innerHTML = "ERROR";
        this.valueDisplay.classList.add("result", "glitch-error");
        this.valueDisplay.classList.remove("heart-message");
        this.valueDisplay.setAttribute("aria-label", "Error");
        this.playLoveSound();

        setTimeout(() => {
          this.valueDisplay.innerHTML = `I <i class="fas fa-heart"></i> U`;
          this.valueDisplay.classList.add("result", "heart-message");
          this.valueDisplay.classList.remove("glitch-error");
          this.valueDisplay.setAttribute("aria-label", "I love you with a heart icon");
          this.history.push(`${expression} = I LOVE U`);
          localStorage.setItem("calcHistory", JSON.stringify(this.history));
          this.displayHistory();
        }, 3090);
      } else {
        const result = math.evaluate(expression);
        if (!isFinite(result)) {
          this.showError("Math Error");
        } else {
          this.valueDisplay.innerHTML = Number(result).toFixed(10).replace(/\.?0+$/, "");
          this.valueDisplay.classList.add("result");
          this.valueDisplay.classList.remove("heart-message", "glitch-error");
          this.history.push(`${expression.replace(/pi/g, "π")} = ${result}`);
          localStorage.setItem("calcHistory", JSON.stringify(this.history));
          this.displayHistory();
          this.stopLoveSound();
          this.playSound();
        }
      }
    } catch {
      this.showError("Syntax Error");
    }
  }

  clearHistory() {
    this.history = [];
    localStorage.setItem("calcHistory", JSON.stringify(this.history));
    this.displayHistory();
    this.stopLoveSound();
    this.playSound();
  }

  showError(message) {
    this.valueDisplay.innerHTML = message;
    this.valueDisplay.classList.add("result");
    this.valueDisplay.classList.remove("heart-message");
    this.stopLoveSound();
    setTimeout(() => this.clear(), 2000);
    this.playSound();
  }

  playSound() {
    if (this.soundEnabled) {
      this.clickSound.currentTime = 0;
      this.clickSound.play().catch(() => {});
    }
  }

  playLoveSound() {
    if (this.soundEnabled) {
      this.loveSound.currentTime = 0;
      this.loveSound.play().catch(() => {
        this.showError("Music playback failed");
      });
    }
  }

  stopLoveSound() {
    this.loveSound.pause();
    this.loveSound.currentTime = 0;
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem("soundEnabled", this.soundEnabled);
    if (!this.soundEnabled) this.stopLoveSound();
    this.updateSoundButton();
  }

  updateSoundButton() {
    const soundBtn = document.querySelector(".soundBtn");
    soundBtn.classList.toggle("sound-off", !this.soundEnabled);
    soundBtn.querySelector("i").className = `fas ${this.soundEnabled ? "fa-volume-up" : "fa-volume-mute"} icon`;
  }

  displayHistory() {
    const historyDiv = document.querySelector(".history");
    historyDiv.innerHTML = this.history
      .slice(-5)
      .map(h => `<p data-expression="${h.split(" = ")[0]}" data-result="${h.split(" = ")[1]}">${h}</p>`)
      .join("");
    historyDiv.querySelectorAll("p").forEach(p => {
      p.addEventListener("click", () => {
        this.expressionDisplay.innerHTML = p.dataset.expression.replace(/π/g, "pi");
        if (p.dataset.result === "I LOVE U") {
          this.valueDisplay.innerHTML = `I <i class="fas fa-heart"></i> U`;
          this.valueDisplay.classList.add("result", "heart-message");
          this.valueDisplay.setAttribute("aria-label", "I love you with a heart icon");
          this.playLoveSound();
        } else {
          this.valueDisplay.innerHTML = p.dataset.result;
          this.valueDisplay.classList.add("result");
          this.valueDisplay.classList.remove("heart-message");
          this.stopLoveSound();
        }
        this.playSound();
      });
    });
  }

  toggleMode() {
    this.mode = this.mode === "basic" ? "scientific" : "basic";
    localStorage.setItem("calcMode", this.mode);
    this.stopLoveSound();
    this.updateMode();
    this.playSound();
  }

  updateMode() {
    const basicMode = document.getElementById("basic-mode");
    const scientificMode = document.getElementById("scientific-mode");
    const modeBtn = document.getElementById("modeBtn");
    if (this.mode === "basic") {
      basicMode.style.display = "grid";
      scientificMode.style.display = "none";
      scientificMode.classList.remove("active");
      modeBtn.textContent = "Basic";
    } else {
      basicMode.style.display = "grid";
      scientificMode.style.display = "grid";
      scientificMode.classList.add("active");
      modeBtn.textContent = "Scientific";
    }
  }
}

const expression = document.getElementById("expression");
const value = document.getElementById("value");
const calc = new Calculator(expression, value);
const btn = document.querySelectorAll(".buttons span");
const toggleBtn = document.querySelector(".toggleBtn");
const soundBtn = document.querySelector(".soundBtn");
const modeBtn = document.getElementById("modeBtn");
const clearHistoryBtn = document.getElementById("clearHistory");
const body = document.querySelector("body");

btn.forEach(button => {
  button.addEventListener("click", () => {
    const input = button.innerHTML.includes("fa-") ? button.getAttribute("aria-label").toLowerCase() : button.innerHTML;
    if (input === "equals") calc.calculate();
    else if (input === "clear display") calc.clear();
    else if (input === "backspace") calc.backspace();
    else if (input === "memory clear") calc.memoryClear();
    else if (input === "memory recall") calc.memoryRecall();
    else if (input === "memory add") calc.memoryAdd();
    else if (input === "memory subtract") calc.memorySubtract();
    else if (input === "divide") calc.append("/");
    else if (input === "multiply") calc.append("*");
    else if (input === "subtract") calc.append("-");
    else if (input === "add") calc.append("+");
    else if (input === "square root") calc.append("sqrt(");
    else if (input === "power") calc.append("^");
    else if (input === "pi") calc.append("pi");
    else if (input === "sine") calc.append("sin(");
    else if (input === "cosine") calc.append("cos(");
    else if (input === "tangent") calc.append("tan(");
    else if (input === "inverse sine") calc.append("asin(");
    else if (input === "logarithm") calc.append("log10(");
    else if (input === "natural log") calc.append("ln(");
    else if (input === "exponential") calc.append("exp(");
    else calc.append(input);
  });
});

document.addEventListener("keydown", (e) => {
  const key = e.key;
  if (/[0-9+\-*/.^()]/.test(key)) calc.append(key);
  else if (key === "Enter" || key === "=") calc.calculate();
  else if (key === "Escape") calc.clear();
  else if (key === "Backspace") calc.backspace();
});

toggleBtn.onclick = () => {
  body.classList.toggle("dark");
  localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "");
  toggleBtn.querySelector("i").className = `fas ${body.classList.contains("dark") ? "fa-moon" : "fa-sun"} icon`;
  calc.stopLoveSound();
  calc.playSound();
};

toggleBtn.querySelector("i").className = `fas ${body.classList.contains("dark") ? "fa-moon" : "fa-sun"} icon`;

soundBtn.onclick = () => calc.toggleSound();

modeBtn.onclick = () => calc.toggleMode();

clearHistoryBtn.onclick = () => calc.clearHistory();

const savedTheme = localStorage.getItem("theme");
if (!savedTheme) body.classList.add("dark");
else body.classList.add(savedTheme);