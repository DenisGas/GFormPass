# GFormPass

**GFormPass** is a JavaScript tool designed to extract and display questions from Google Forms directly on the page. It detects different types of questions and adds a button to each question block, allowing users to view the extracted question details in the browser console. This tool is particularly useful for working with forms that contain input fields like text areas, checkboxes, and radio buttons. If a form contains radio buttons with an "Other" option or a select dropdown, the tool will omit the answer options from the output.

## Features

- **Supports Various Question Types**: 
  - Text inputs (`input`, `textarea`)
  - Checkboxes
  - Radio buttons (excluding "Other" option)
  - Select dropdowns (option detection omitted)
  
- **Automated Button Creation**: Adds a button to each question block in the form. When clicked, it logs the question's details, including the type of question and its options (if applicable), to the browser console.

- **Question Extraction**: The script extracts the question title, type (text, checkbox, radio, or select), and answer options (except for forms with select fields or radio buttons with an "Other" option).

## How It Works

1. **Extracts Question Titles**: The script identifies elements with specific classes (e.g., `M7eMe` for question titles) on the Google Forms page.
  
2. **Detects Question Types**: It checks for common classes that indicate the type of input (e.g., text, checkbox, radio button, select dropdown).

3. **Adds a Button**: For each question found, it adds a "Show Question" button to the form. When clicked, the button logs the corresponding question's details to the console.

4. **Handles Edge Cases**: If a question has radio buttons with an "Other" option or is a select dropdown, the options are omitted from the output to keep the response cleaner.

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
    },
    {
      "text": "Blue",
      "id": "O-1"
    },
    {
      "text": "Green",
      "id": "O-2"
    }
  ]
}
```

If the question is a text field or textarea, it will omit the options array.

## Example on page

![image](https://github.com/user-attachments/assets/6bcd02c8-d9c9-44ef-b46f-eac54725e9a8)


## Use Cases

- **Form Data Extraction**: Extract the structure of a Google Form, including questions and available options.
- **Custom Form Analysis**: Easily log or inspect the types of questions and their content without manually interacting with the form interface.
- **Automated QA**: Ensure that all questions and options in a form are present and correctly formatted.

## Limitations

- **Radio Buttons with "Other"**: If a question contains radio buttons with an "Other" option, the answer options will be omitted from the log.
- **Select Dropdowns**: The script identifies select dropdowns but does not display the individual options.


## Code

```js

// Function to find all questions
function findAllQuestions() {
    const questions = [];
    const questionElementsMap = new Map();

    // Look for elements with class "M7eMe" for question titles
    const questionTitles = Array.from(document.getElementsByClassName("M7eMe"));

    // Classes to check
    const radioClasses = ["aDTYNe", "snByac", "OvPDhc", "OIC90c"];
    const checkboxClasses = ["aDTYNe", "snByac", "n5vBHf", "OIC90c"];
    const selectClasses = ['OA0qNb', 'ncFHed', 'QXL7Te'];

    // Function to check if all classes are present in the element
    function hasAllClasses(element, classList) {
        return classList.every(className => element.classList.contains(className));
    }

    questionTitles.forEach((titleElement, index) => {
        // Find the closest container associated with the question
        const container = titleElement.closest('.geS5n');

        // Check if the container has a text field
        const textField = container ? container.querySelector('input[type="text"], textarea') : null;
        // Get all possible answers (if any)
        const answerOptions = container ? Array.from(container.querySelectorAll(".OA0qNb, .aDTYNe.snByac")) : [];

        let questionType = 'input';  // Default if nothing is found

        if (answerOptions.length > 0) {
            // Check if there are variants that match the classes
            const isRadio = answerOptions.some(option => hasAllClasses(option, radioClasses));
            const isCheckbox = answerOptions.some(option => hasAllClasses(option, checkboxClasses));
            const isSelect = answerOptions.some(option => hasAllClasses(option, selectClasses));

            if (isRadio) {
                questionType = 'radio';
            } else if (isCheckbox) {
                questionType = 'checkbox';
            } else if (isSelect) {
                questionType = 'select';
            }
        } else if (textField) {
            questionType = 'text';
        }

        const question = {
            title: titleElement.textContent.trim(),
            id: `Q-${index + 1}`,
            type: questionType,
            options: textField ? [] : answerOptions.map((option, optionIndex) => ({
                text: option.textContent.trim(),
                id: `O-${optionIndex}`,
            }))
        };

        questionElementsMap.set(question.id, textField ? { textField } : answerOptions);
        questions.push(question);
    });

    return { questions, questionElementsMap };
}

// Function for creating buttons and adding them to the DOM
function createButtonForQuestion(question, conteiner) {

    if (!conteiner.querySelector('button.show-question-btn')) {

        const button = document.createElement('button');
        button.textContent = "Show question";
        button.classList.add('show-question-btn');

        button.addEventListener('click', () => {
            console.log(question);
        });

        conteiner.appendChild(button);
    }
}

// Main function: finds questions and adds buttons
function findQuestionsInGoogleForms() {
    const { questions } = findAllQuestions();  

    // Looking for blocks of questions
    const questionConteiners = Array.from(document.getElementsByClassName("geS5n"));

    // Add a button for each question
    questions.forEach((question, index) => {
        const conteiner = questionConteiners[index];
        createButtonForQuestion(question, conteiner);
    });
}

findQuestionsInGoogleForms();

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
