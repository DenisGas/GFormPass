let areButtonsVisible = true; // Flag to track button visibility
let areOutputBlocksVisible = true; // Flag to track output block visibility

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  document.body.appendChild(overlay);
}


function showOverlay() {
  document.querySelectorAll(".ncFHed").forEach(e => {
    e.style.zIndex = 0;
  });
  document.getElementById('loading-overlay').style.display = 'block';
}

function hideOverlay() {
  document.querySelectorAll(".ncFHed").forEach(e => {
    e.style.zIndex = "";
  });
  document.getElementById('loading-overlay').style.display = 'none';
}


function getElementPath(element) {
  const path = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();

    if (element.id) {
      selector += `#${element.id}`;
    } else {
      let sibling = element,
        nth = 1;
      while ((sibling = sibling.previousElementSibling)) {
        if (sibling.nodeName.toLowerCase() === selector) nth++;
      }
      if (nth > 1) {
        selector += `:nth-of-type(${nth})`;
      }
    }

    path.unshift(selector);
    element = element.parentElement;
  }
  return path.join(" > ");
}

async function clickAndExtractOptions(container) {
  return new Promise((resolve) => {
    const selector = container.querySelector("div.MocG8c.HZ3kWc");
    if (!selector) {
      console.log("Selector not found.");
      resolve([]);
      return;
    }

    selector.click();


    const observer = new MutationObserver(() => {
      const optionsContainer = container.querySelector('div[role="listbox"]');
      if (!optionsContainer) {
        console.log("Options container not found.");
        observer.disconnect();
        resolve([]);
        return;
      }

      const options = Array.from(
        optionsContainer.querySelectorAll(".vRMGwf.oJeWuf")
      );
      if (options.length === 0) {
        console.log("No options found.");
        observer.disconnect();
        resolve([]);
        return;
      }

      const optionData = options.map((option) => ({
        text: option.textContent.trim(),
        path: getElementPath(option),
      }));

      observer.disconnect();

      // Close the dropdown after a slight delay
      setTimeout(() => {
        selector.click(); // Fake click to close the dropdown
      }, 200);

      resolve(optionData);
    });

    observer.observe(container, { childList: true, subtree: true });

    // Increase the timeout to give more time for options to load
    setTimeout(() => {
      observer.disconnect();
      resolve([]); // Resolve with empty array if timeout occurs
    }, 3000); // Increased timeout
  });
}
async function selectCorrectAnswerForSelect(answerPath, containerPath) {
  const container = document.querySelector(containerPath);
  const selector = container.querySelector("div.MocG8c.HZ3kWc");

  if (!selector) {
    console.log("Selector not found.");
    return;
  }

  const answer = document.querySelector(answerPath);
  if (!answer) {
    selector.click();
  }

  const observer = new MutationObserver(() => {
    const optionsContainer = container.querySelector('div[role="listbox"]');
    if (!optionsContainer) {
      console.log("Options container not found.");
      observer.disconnect();
      return;
    }

    const answer = document.querySelector(answerPath);
    if (!answer) {
      console.log("Correct answer not found.");
      observer.disconnect();
      return;
    }

    answer.click(); // Клікаємо на правильну відповідь
    observer.disconnect();
  });

  observer.observe(container, { childList: true, subtree: true });

  // Якщо після 3 секунд опції не з'являються, вимикаємо спостерігач
  setTimeout(() => {
    observer.disconnect();
  }, 3000);
}

function findAllQuestions() {
  const questions = [];
  const questionTitles = Array.from(document.getElementsByClassName("M7eMe"));

  const radioClasses = ["aDTYNe", "snByac", "OvPDhc"];
  const checkboxClasses = ["aDTYNe", "snByac", "n5vBHf", "OIC90c"];
  const selectClasses = ["OA0qNb", "ncFHed", "QXL7Te"];

  function hasAllClasses(element, classList) {
    return classList.every((className) =>
      element.classList.contains(className)
    );
  }

  questionTitles.forEach((titleElement, index) => {
    const container = titleElement.closest(".geS5n");
    if (!container || container.classList.contains("OxAavc")) return;

    const questionTitleElement =
      container.querySelector(".M4DNQ") || titleElement;
    const questionTitle = Array.from(questionTitleElement.childNodes)
      .map((node) => node.textContent.trim())
      .join("\n")
      .trim();

    const textField = container.querySelector('input[type="text"], textarea');
    const answerOptions = container
      ? Array.from(container.querySelectorAll(".OA0qNb, .aDTYNe.snByac"))
      : [];

    let questionType = "input";
    if (answerOptions.length > 0) {
      const isRadio = answerOptions.some((option) =>
        hasAllClasses(option, radioClasses)
      );
      const isCheckbox = answerOptions.some((option) =>
        hasAllClasses(option, checkboxClasses)
      );
      const isSelect = answerOptions.some((option) =>
        hasAllClasses(option, selectClasses)
      );
      if (isRadio) {
        questionType = "radio";
        const radioWithInput = !answerOptions.every((option) =>
          hasAllClasses(option, ["OIC90c"])
        );
        if (radioWithInput) questionType = "radio_with_input";
      } else if (isCheckbox) questionType = "checkbox";
      else if (isSelect) questionType = "select";
    } else if (textField) {
      questionType = "text";
    }

    const question = {
      title: questionTitle,
      id: `Q-${index + 1}`,
      type: questionType,
      options: [],
      path: getElementPath(container),
    };

    questions.push(question);
  });

  console.log(questions);
  return { questions };
}

async function processQuestion(question, container) {
  if (question.type === "select") {
    const options = await clickAndExtractOptions(container);
    const halfLength = Math.ceil(options.length / 2);
    const filteredOptions = options.slice(halfLength);
    // console.log('Answer options:', filteredOptions); // Додайте цю лінію
    addOptionsToQuestion(question, filteredOptions);

  } else {
    const answerOptions = container.querySelectorAll(".OA0qNb, .aDTYNe.snByac");
    const options = Array.from(answerOptions).map((option) => ({
      text: option.textContent.trim(),
      path: getElementPath(option),
    }));

    // console.log('Answer options for non-select:', options); // Додайте цю лінію
    addOptionsToQuestion(question, options);
  }

  createButtonForQuestion(question, container);
  createOutputBlockForQuestion(question, container);
}

function addOptionsToQuestion(question, options) {
  question.options = options.map((option, optionIndex) => {
    if (option && option) {
      return {
        text: option.text,
        id: `O-${optionIndex}`,
        path: option.path,
      };
    } else {
      // console.warn('Undefined option or no textContent found', option);
      return null;
    }
  }).filter(option => option !== null);
}


async function findQuestionsInGoogleForms() {
  showOverlay();

  const { questions } = findAllQuestions();
  const questionContainers = Array.from(
    document.getElementsByClassName("geS5n")
  );

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const container = questionContainers[i];
    if (container) {
      await processQuestion(question, container);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  hideOverlay();
}
async function getCorrectAnswers(question) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([question.options[1]]);
    }, 200);
  });
}


async function markCorrectAnswers(question, correctAnswers) {
  for (const answer of correctAnswers) {
    const option = question.options.find(opt => opt.id === answer.id);

    if (option) {
      if (question.type === "select") {
        await selectCorrectAnswerForSelect(option.path, question.path);
        return
      }

      const element = document.querySelector(option.path);

      if (element) {
        if (question.type === "radio" || question.type === "checkbox" || question.type === "radio_with_input") {
          element.click();
          console.log(`Marked ${question.title} with option ${option.text}`);
        }
      } else {
        console.warn(`Element for ${option.text} not found.`);
      }
    } else {
      console.warn(`Option with id ${answerId} not found in question ${question.title}.`);
    }
  }
}





function createButtonForQuestion(question, container) {
  if (!container || container.querySelector("a.show-question-btn")) return;

  const button = document.createElement("a");
  button.textContent = "copy question";
  button.classList.add("show-question-btn");
  button.style.display = areButtonsVisible ? "inline-block" : "none";

  button.addEventListener("click", async () => {
    const questionText = `Питання: ${question.title}\n`;
    const optionsText =
      question.options.length > 0
        ? `Варіанти відповіді:\n${question.options
          .map((opt) => `- ${opt.text}`)
          .join("\n")}`
        : "";
    const fullText = questionText + optionsText;

    try {
      console.log(question);
      await navigator.clipboard.writeText(fullText);
      console.log("Copied to clipboard:\n", fullText);
      displayCopiedText(fullText, container);
    } catch (err) {
      console.error("Error copying to buffer:", err);
    }
  });

  container.appendChild(button);


  const correctAnswerButton = document.createElement("a");
  correctAnswerButton.textContent = "Отримати правильні відповіді";
  correctAnswerButton.classList.add("show-question-btn");
  correctAnswerButton.classList.add("show-correct-answer-btn");
  correctAnswerButton.style.display = areButtonsVisible ? "inline-block" : "none";

  correctAnswerButton.addEventListener("click", async () => {
    try {
      const correctAnswers = await getCorrectAnswers(question);

      let fullText;
      if (correctAnswers && correctAnswers.length > 0) {
        fullText = "Отримані правильні відповіді:\n" + correctAnswers.map(element => element.text).join(", ");
      } else {
        fullText = "Варіантів відповідей не знайдено.";
      }

      console.log(fullText);
      displayCopiedText(fullText, container);

      await markCorrectAnswers(question, correctAnswers);
    } catch (error) {
      console.error("Помилка при отриманні відповідей:", error);
      displayCopiedText("Помилка при отриманні відповідей.", container);
    }
  });

  container.appendChild(correctAnswerButton);
}


function createOutputBlockForQuestion(question, container) {
  const outputBlock = document.createElement("pre");
  outputBlock.classList.add("output-block");

  container.appendChild(outputBlock);
}

function displayCopiedText(text, container) {
  const outputBlock = container.querySelector(".output-block");
  if (outputBlock) {
    outputBlock.textContent = text;
    outputBlock.style.display = "block";
    outputBlock.classList.add("showed-output-block");
  }
}

function toggleShowQuestionButtons() {
  const buttons = document.querySelectorAll("a.show-question-btn");
  buttons.forEach((button) => {
    button.style.display = areButtonsVisible ? "none" : "inline-block";
  });
  areButtonsVisible = !areButtonsVisible;
}

function toggleShowQuestionOutput() {
  const elements = document.querySelectorAll("pre.showed-output-block");
  elements.forEach((element) => {
    element.style.display = areOutputBlocksVisible ? "none" : "block";
  });
  areOutputBlocksVisible = !areOutputBlocksVisible;
}

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.code === "KeyH") {
    event.preventDefault();
    toggleShowQuestionButtons();
    toggleShowQuestionOutput();
  }
});


// Ініціалізація оверлея
createOverlay();

//findQuestionsInGoogleForms();
setTimeout(() => {
  findQuestionsInGoogleForms();
}, 2000);
