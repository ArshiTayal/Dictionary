const input = document.getElementById("wordInput");
const resultContainer = document.getElementById("resultContainer");
const loader = document.getElementById("loader");
const historyContainer = document.getElementById("historyContainer");

const history = [];

document
  .getElementById("searchBtn")
  .addEventListener("click", () => searchWord());
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchWord();
});

async function searchWord(wordFromClick = null) {
  const word = wordFromClick || input.value.trim();
  if (!word) return;

  input.value = word;
  loader.classList.remove("hidden");
  resultContainer.innerHTML = "";
  document.querySelector(".tip").style.display = "none";

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await res.json();

    if (data.title === "No Definitions Found") {
      loader.classList.add("hidden");
      resultContainer.innerHTML = `<p>❌ No result for "<strong>${word}</strong>".</p>`;
      return;
    }

    addToHistory(word);

    const entry = data[0];
    const phonetic = entry.phonetics.find((p) => p.text || p.audio) || {};
    const meanings = entry.meanings;
    const firstMeaning =
      meanings[0]?.definitions[0]?.definition || "Not available";
    const firstExample = meanings[0]?.definitions[0]?.example || "";

    let allMeanings = "";
    meanings.forEach((m) => {
      allMeanings += `
        <h3>${m.partOfSpeech}</h3>
        <ul>
          ${m.definitions
            .map(
              (def) => `
              <li>
                ${def.definition}
                ${
                  def.example
                    ? `<div class="example-usage">${def.example}</div>`
                    : ""
                }
              </li>
            `
            )
            .join("")}
        </ul>

        ${
          m.synonyms?.length
            ? `<div><strong>Synonyms:</strong> ${m.synonyms
                .slice(0, 5)
                .map((s) => `<span class="syn-tag">${s}</span>`)
                .join("")}</div>`
            : ""
        }
        ${
          m.antonyms?.length
            ? `<div><strong>Antonyms:</strong> ${m.antonyms
                .slice(0, 5)
                .map((a) => `<span class="syn-tag" >${a}</span>`)
                .join("")}</div>`
            : ""
        }
      `;
    });

    resultContainer.innerHTML = `
      <h2>${entry.word}</h2>

      <p class="pronounciation"><i>${phonetic.text || "N/A"}</i>
      ${
        phonetic.audio
          ? `<button class="audio-btn" onclick="playAudio('${phonetic.audio}')">▶</button>`
          : ""
      }</p>
      <p><strong>Meaning:</strong> ${firstMeaning}</p>
      ${
        firstExample
          ? `<div class="example-usage">Example: ${firstExample}</div>`
          : ""
      }

      ${allMeanings}

      <p>🔗 <a href="${entry.sourceUrls[0]}" target="_blank">Source</a></p>
    `;
  } catch (err) {
    console.error(err);
    resultContainer.innerHTML = `<p>⚠️ Error fetching data.</p>`;
  }

  loader.classList.add("hidden");
}

function playAudio(url) {
  new Audio(url).play();
}

document.getElementById("themeToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("dark", e.target.checked);
  document.getElementById("modeLabel").textContent = e.target.checked
    ? ""
    : "";
});
document.getElementById("fontSelect").addEventListener("change", (e) => {
  document.body.style.fontFamily = `'${e.target.value}', sans-serif`;
});
function addToHistory(word) {
  if (history.includes(word)) return;
  if (history.length >= 3) history.shift();
  history.push(word);
  updateHistory();
}

function updateHistory() {
  historyContainer.innerHTML =
    "Recent: " +
    history
      .map((w) => `<span onclick="searchWord('${w}')">${w}</span>`)
      .join("");
}
window.addEventListener("load", () => {
  document.querySelector(".tip").style.display = "block";
});