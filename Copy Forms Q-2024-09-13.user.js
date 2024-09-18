// ==UserScript==
// @name         Copy Forms Q
// @namespace    http://tampermonkey.net/
// @version      2024-09-13
// @description  try to take over the world!
// @author       DenisGasilo
// @match        https://docs.google.com/forms/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


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

        let questionType = 'input';// Default if nothing is found

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
function createButtonForQuestion(question, container) {
    if (!container.querySelector('button.show-question-btn')) {
        const button = document.createElement('button');
        button.textContent = "copy question";
        button.classList.add('show-question-btn');

        button.addEventListener('click', () => {
            const questionText = `Питання: ${question.title}\n`;
            const optionsText = question.options.length > 0
                ? `Варіанти відповіді:\n${question.options.map(opt => `- ${opt.text}`).join('\n')}`
                : '';
            const fullText = questionText + optionsText;

            navigator.clipboard.writeText(fullText).then(() => {
                console.log('Copied to clipboard:\n', fullText);
            }).catch(err => {
                console.error('Error copying to buffer:', err);
            });
        });

        container.appendChild(button);
    }
}


// Main function: finds questions and adds buttons
function findQuestionsInGoogleForms() {
    console.log(findAllQuestions());
    const { questions } = findAllQuestions();

    // Looking for blocks of questions
    const questionConteiners = Array.from(document.getElementsByClassName("geS5n"));

    // Add a button for each question
    questions.forEach((question, index) => {
        const conteiner = questionConteiners[index];
        createButtonForQuestion(question, conteiner);
    });
}

// Function for hiding/showing "Show question" buttons
function toggleShowQuestionButtons() {
    const buttons = document.querySelectorAll('button.show-question-btn');
    buttons.forEach(button => {
        if (button.style.display === 'none') {
            button.style.display = 'inline-block';
        } else {
            button.style.display = 'none';
        }
    });
}

// Add event handler for the "H" key
document.addEventListener('keydown', (event) => {
    if (event.key === 'H' || event.key === 'h') {
        toggleShowQuestionButtons();
    }
});

findQuestionsInGoogleForms();

})();