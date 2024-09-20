# GFormPass

**GFormPass** is a JavaScript tool designed to extract and display questions from Google Forms directly on the page. It detects different types of questions and adds a button to each question block, allowing users to view the extracted question details in the browser console. This tool is particularly useful for working with forms that contain input fields like text areas, checkboxes, and radio buttons. If a form contains radio buttons with an "Other" option or a select dropdown, the tool will omit the answer options from the output.

## Features

- **Supports Various Question Types**: 
  - Text inputs (`input`, `textarea`)
  - Checkboxes
  - Radio buttons 
  - Select dropdowns
  
- **Automated Button Creation**: Adds a button to each question block in the form. When clicked, it logs the question's details, including the type of question and its options (if applicable), to the browser console.

- **Question Extraction**: The script extracts the question title, type (text, checkbox, radio, or select), and answer options (except for forms with select fields or radio buttons with an "Other" option).

## How It Works

1. **Extracts Question Titles**: The script identifies elements with specific classes (e.g., `M7eMe` for question titles) on the Google Forms page.
  
2. **Detects Question Types**: It checks for common classes that indicate the type of input (e.g., text, checkbox, radio button, select dropdown).

3. **Adds a Button**: For each question found, it adds a "Show Question" button to the form. When clicked, the button logs the corresponding question's details to the console.

## Installation

To use this script, simply include it in your browser's console on any Google Form page. It will automatically detect the questions and add buttons to the page.

1. Open the Google Form you want to analyze.
2. Open the browser's developer tools (usually F12 or right-click -> Inspect).
3. Go to the **Console** tab.
4. Paste the script and press **Enter**.

## Example Output

After the script is run, each question block on the page will display a "Show Question" button. Clicking the button will log the following information to the console:

```json
{
  "title": "What is your favorite color?",
  "id": "Q-1",
  "type": "radio",
  "options": [
    {
      "text": "Red",
      "id": "O-0"
      "path": "html > body > div > div:nth-of-type(3) > form#mG61Hd > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div > span > div > div:nth-of-type(2) > label > div > div:nth-of-type(0) > div > span"
    },
    {
      "text": "Blue",
      "id": "O-1"
      "path": "html > body > div > div:nth-of-type(3) > form#mG61Hd > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div > span > div > div:nth-of-type(2) > label > div > div:nth-of-type(1) > div > span"
    },
    {
      "text": "Green",
      "id": "O-2"
      "path": "html > body > div > div:nth-of-type(3) > form#mG61Hd > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div > span > div > div:nth-of-type(2) > label > div > div:nth-of-type(2) > div > span"
    }
  ]
}
```

## Form Questions Object

### Description
The object represents all the questions in the form. Each question contains the following properties:

- `title`: The title of the question.
- `id`: The unique identifier of the question.
- `type`: The type of the question. Possible values:
  - `radio`: A multiple-choice question where only one option can be selected.
  - `radio_with_input`: A multiple-choice question with an additional input field (e.g., "Other:").
  - `checkbox`: A question where multiple options can be selected.
  - `select`: A dropdown question where one option can be selected.
  - `text`: A question that requires a single-line text input.
  - `textarea`: A question that requires multi-line text input.
- `options`: An array of answer options for `radio`, `radio_with_input`, `checkbox`, and `select` types. Each option contains:
  - `text`: The display text of the option.
  - `id`: The unique identifier of the option.
  - `path`: The CSS selector used to select the element on the page.

### Example Object

```json
[
    {
        "title": "Simple Radio Button Question",
        "id": "Q-1",
        "type": "radio",
        "options": [
            {
                "text": "Option 1",
                "id": "O-0",
                "path": "html > body > div > div:nth-of-type(3) > form#mG61Hd > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div > span > div > div > label > div > div:nth-of-type(2) > div > span"
            },
            {
                "text": "Option 222",
                "id": "O-1",
                "path": "html > body > div > div:nth-of-type(3) > form#mG61Hd > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div > span > div > div:nth-of-type(2) > label > div > div:nth-of-type(2) > div > span"
            }
        ]
    },
    {
        "title": "Radio Button with Input",
        "id": "Q-2",
        "type": "radio_with_input",
        "options": [
            {
                "text": "Option 1",
                "id": "O-0",
                "path": "html > body > div > div:nth-of-type(3) > form#mG61Hd > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div > span > div > div > label > div > div:nth-of-type(2) > div > span"
            },
            {
                "text": "Other:",
                "id": "O-1",
                "path": "html > body > div > div:nth-of-type(3) > form#mG61Hd > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div > span > div > div:nth-of-type(2) > label > div > div:nth-of-type(2) > div > span"
            }
        ]
    },
    {
        "title": "Checkbox Question",
        "id": "Q-3",
        "type": "checkbox",
        "options": [
            {
                "text": "Option 1",
                "id": "O-0",
                "path": "html > body > div > div:nth-of-type(3) > form#mG61Hd > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div > div > label > div > div:nth-of-type(2) > div > span"
            }
        ]
    },
    {
        "title": "Dropdown Question",
        "id": "Q-4",
        "type": "select",
        "options": [
            {
                "text": "Choose",
                "id": "O-0",
                "path": "html > body > div > div:nth-of-type(3) > form#mG61Hd > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(4) > div > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > span"
            },
            {
                "text": "Option 1",
                "id": "O-1",
                "path": "html > body > div > div:nth-of-type(3) > form#mG61Hd > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(4) > div > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(3) > span"
            },
            {
                "text": "Option 2",
                "id": "O-2",
                "path": "html > body > div > div:nth-of-type(3) > form#mG61Hd > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(4) > div > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(4) > span"
            }
        ]
    },
    {
        "title": "Text Field",
        "id": "Q-6",
        "type": "text",
        "options": []
    },
    {
        "title": "Large Text Field",
        "id": "Q-7",
        "type": "textarea",
        "options": []
    }
]
```

If the question is a text field or textarea, it will omit the options array.

## Example on page

![image](https://github.com/user-attachments/assets/eb7d9fb8-f606-4836-ab08-470d929ec8d6)



## Use Cases

- **Form Data Extraction**: Extract the structure of a Google Form, including questions and available options.
- **Custom Form Analysis**: Easily log or inspect the types of questions and their content without manually interacting with the form interface.
- **Automated QA**: Ensure that all questions and options in a form are present and correctly formatted.

## Code

```js

(function () {
    'use strict';

    function getElementPath(element) {
        const path = [];
        while (element && element.nodeType === Node.ELEMENT_NODE) {
            let selector = element.nodeName.toLowerCase();

            if (element.id) {
                selector += `#${element.id}`;
            } else {
                let sibling = element, nth = 1;
                while (sibling = sibling.previousElementSibling) {
                    if (sibling.nodeName.toLowerCase() === selector) nth++;
                }
                if (nth > 1) {
                    selector += `:nth-of-type(${nth})`;
                }
            }

            path.unshift(selector);
            element = element.parentElement;
        }
        return path.join(' > ');
    }

async function clickAndExtractOptions(container) {
    return new Promise((resolve) => {
        const selector = container.querySelector('div.MocG8c.HZ3kWc');
        if (!selector) {
            console.log('Selector not found.');
            resolve([]);
            return;
        }
        selector.click(); // Натискаємо на селект

        const observer = new MutationObserver(() => {
            // Пошук випадаючого меню з варіантами відповіді, тільки для цього селекту
            const optionsContainer = container.querySelector('div[role="listbox"]');
            if (!optionsContainer) {
                console.log('Options container not found.');
                observer.disconnect();
                resolve([]);
                return;
            }

            const options = Array.from(optionsContainer.querySelectorAll('.vRMGwf.oJeWuf')); // Варіанти відповіді
            const optionData = options.map(option => ({
                text: option.textContent.trim(),
                path: getElementPath(option) // Отримуємо шлях до кожного варіанту
            }));

            observer.disconnect();

            // Імітація закриття випадаючого списку шляхом повторного кліку на селект
            setTimeout(() => {
                selector.click(); // Фейковий клік для закриття випадаючого меню
            }, 100); // Невелика затримка перед повторним кліком

            resolve(optionData);
        });

        // Спостерігаємо за змінами в DOM, але тільки в межах поточного контейнера
        observer.observe(container, { childList: true, subtree: true });

        // Встановлюємо таймаут на випадок, якщо варіанти не з'являться
        setTimeout(() => {
            observer.disconnect();
            resolve([]); // Повертаємо пустий масив, якщо варіанти не знайдені вчасно
        }, 2000);
    });
}



    function findAllQuestions() {
        const questions = [];

        const questionTitles = Array.from(document.getElementsByClassName("M7eMe"));

        const radioClasses = ["aDTYNe", "snByac", "OvPDhc"];
        const checkboxClasses = ["aDTYNe", "snByac", "n5vBHf", "OIC90c"];
        const selectClasses = ['OA0qNb', 'ncFHed', 'QXL7Te'];

        function hasAllClasses(element, classList) {
            return classList.every(className => element.classList.contains(className));
        }

        questionTitles.forEach((titleElement, index) => {
            const container = titleElement.closest('.geS5n');
            if (!container || container.classList.contains('OxAavc')) return;

            const questionTitleElement = container.querySelector('.M4DNQ') || titleElement;
            const questionTitle = Array.from(questionTitleElement.childNodes)
                .map(node => node.textContent.trim())
                .join('\n').trim();

            const textField = container.querySelector('input[type="text"], textarea');
            const answerOptions = container ? Array.from(container.querySelectorAll(".OA0qNb, .aDTYNe.snByac")) : [];




            let questionType = 'input';
            if (answerOptions.length > 0) {
                const isRadio = answerOptions.some(option => hasAllClasses(option, radioClasses));
                const isCheckbox = answerOptions.some(option => hasAllClasses(option, checkboxClasses));
                const isSelect = answerOptions.some(option => hasAllClasses(option, selectClasses));
                if (isRadio) {
                     questionType = 'radio';
                    const radio_with_input = !(answerOptions.every(option => hasAllClasses(option, ["OIC90c"])));
                    if (radio_with_input) questionType = "radio_with_input";
                }
                else if (isCheckbox) questionType = 'checkbox';
                else if (isSelect) questionType = 'select';
            } else if (textField) {
                questionType = 'text';
            }

            console.log(answerOptions, answerOptions.map((option, optionIndex) => ({
                    text: option.textContent.trim(),
                    id: `O-${optionIndex}`,
                    path: getElementPath(option)
                })));

            const question = {
                title: questionTitle,
                id: `Q-${index + 1}`,
                type: questionType,
                options: (textField && !questionType === 'radio_with_input') ? [] : answerOptions.map((option, optionIndex) => ({
                    text: option.textContent.trim(),
                    id: `O-${optionIndex}`,
                    path: getElementPath(option)
                }))
            };

            // Отримання CSS шляху до контейнера питання
            const elementPath = getElementPath(container);
            questions.push(question);
        });

        console.log(questions);
        return { questions };
    }

async function processQuestion(question, container) {
    if (question.type === 'select') {
        const options = await clickAndExtractOptions(container);

        const halfLength = Math.ceil(options.length / 2); // Визначаємо половину
        const filteredOptions = options.slice(halfLength); // Залишаємо тільки другу половину

        // Оновлюємо питання новими варіантами
        question.options = filteredOptions.map((option, index) => ({
            text: option.text,
            id: `O-${index}`,
            path: option.path // Використовуємо правильний шлях до кожного варіанту
        }));
    }
    createButtonForQuestion(question, container);
}


    async function findQuestionsInGoogleForms() {
        const { questions } = findAllQuestions();
        const questionContainers = Array.from(document.getElementsByClassName("geS5n"));

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const container = questionContainers[i];
            if (container) {
                await processQuestion(question, container);
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
    }

    function createButtonForQuestion(question, container) {
        if (!container || container.querySelector('a.show-question-btn')) return;

        const button = document.createElement('a');
        button.textContent = "copy question";
        button.classList.add('show-question-btn');
        button.style.display = 'inline-block';
        button.style.padding = '10px 15px';
        button.style.backgroundColor = '#1a73e8';
        button.style.color = '#fff';
        button.style.textDecoration = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';

        button.addEventListener('click', async () => {
            const questionText = `Питання: ${question.title}\n`;
            const optionsText = question.options.length > 0
                ? `Варіанти відповіді:\n${question.options.map(opt => `- ${opt.text}`).join('\n')}`
                : '';
            const fullText = questionText + optionsText;

            try {
                console.log(question);
                await navigator.clipboard.writeText(fullText);
                console.log('Copied to clipboard:\n', fullText);
            } catch (err) {
                console.error('Error copying to buffer:', err);
            }
        });

        container.appendChild(button);
    }


    function toggleShowQuestionButtons() {
        const buttons = document.querySelectorAll('a.show-question-btn');
        buttons.forEach(button => {
            button.style.display = button.style.display === 'none' ? 'inline-block' : 'none';
        });
    }


    document.addEventListener('keydown', (event) => {
        if (event.code === "KeyH") {
            toggleShowQuestionButtons();
        }
    });

    findQuestionsInGoogleForms();

})();

```

## Contributing

Feel free to fork the repository and make improvements. Contributions are always welcome!

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/my-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature/my-feature`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---
