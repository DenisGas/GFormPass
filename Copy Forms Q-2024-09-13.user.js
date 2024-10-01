// ==UserScript==
// @name         Copy Forms Q
// @namespace    http://tampermonkey.net/
// @version      2024-09-20
// @description  try to take over the world!
// @author       DenisGasilo
// @match        https://docs.google.com/forms/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let areButtonsVisible = true; // Flag to track button visibility
    let areOutputBlocksVisible = true; // Flag to track output block visibility

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
        selector.click(); // Click to open the dropdown

        const observer = new MutationObserver(() => {
            const optionsContainer = container.querySelector('div[role="listbox"]');
            if (!optionsContainer) {
                console.log('Options container not found.');
                observer.disconnect();
                resolve([]);
                return;
            }

            const options = Array.from(optionsContainer.querySelectorAll('.vRMGwf.oJeWuf'));
            if (options.length === 0) {
                console.log('No options found.');
                observer.disconnect();
                resolve([]);
                return;
            }

            const optionData = options.map(option => ({
                text: option.textContent.trim(),
                path: getElementPath(option)
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
                    const radioWithInput = !(answerOptions.every(option => hasAllClasses(option, ["OIC90c"])));
                    if (radioWithInput) questionType = "radio_with_input";
                } else if (isCheckbox) questionType = 'checkbox';
                else if (isSelect) questionType = 'select';
            } else if (textField) {
                questionType = 'text';
            }

            const question = {
                title: questionTitle,
                id: `Q-${index + 1}`,
                type: questionType,
                options: (textField && !questionType === 'radio_with_input') ? [] : answerOptions.map((option, optionIndex) => ({
                    text: option.textContent.trim(),
                    id: `O-${optionIndex}`,
                    path: getElementPath(option)
                })),
                path: getElementPath(container)
            };
            questions.push(question);
        });

        console.log(questions);
        return { questions };
    }

    async function processQuestion(question, container) {
        if (question.type === 'select') {
            const options = await clickAndExtractOptions(container);

            const halfLength = Math.ceil(options.length / 2);
            const filteredOptions = options.slice(halfLength);

            question.options = filteredOptions.map((option, index) => ({
                text: option.text,
                id: `O-${index}`,
                path: option.path
            }));
        }
        createButtonForQuestion(question, container);
        createOutputBlockForQuestion(question, container);
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
        button.style.display = areButtonsVisible ? 'inline-block' : 'none';
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
                displayCopiedText(fullText, container);
            } catch (err) {
                console.error('Error copying to buffer:', err);
            }
        });

        container.appendChild(button);
    }

    function createOutputBlockForQuestion(question, container) {
        const outputBlock = document.createElement('pre');
        outputBlock.style.backgroundColor = '#d4edda'; // Light green background
        outputBlock.style.border = '1px solid #c3e6cb';
        outputBlock.style.borderRadius = '5px';
        outputBlock.style.padding = '10px';
        outputBlock.style.marginTop = '10px';
        outputBlock.style.display = 'none'; // Initially hidden
        outputBlock.classList.add('output-block');

        container.appendChild(outputBlock);
    }

    function displayCopiedText(text, container) {
        const outputBlock = container.querySelector('.output-block');
        if (outputBlock) {
            outputBlock.textContent = text;
            outputBlock.style.display = 'block'; // Show the block
            outputBlock.classList.add('showed-output-block');
        }
    }

    function toggleShowQuestionButtons() {
        const buttons = document.querySelectorAll('a.show-question-btn');
        buttons.forEach(button => {
            button.style.display = areButtonsVisible ? 'none' : 'inline-block';
        });
        areButtonsVisible = !areButtonsVisible; // Toggle flag
    }

    function toggleShowQuestionOutput() {
        const elements = document.querySelectorAll('pre.showed-output-block');
        elements.forEach(element => {
            element.style.display = areOutputBlocksVisible ? 'none' : 'block';
        });
        areOutputBlocksVisible = !areOutputBlocksVisible; // Toggle flag
    }

    document.addEventListener('keydown', (event) => {
        if (event.code === "KeyH") {
            toggleShowQuestionButtons();
            toggleShowQuestionOutput();
        }
    });

  //findQuestionsInGoogleForms();
   setTimeout(() => {
findQuestionsInGoogleForms();
}, 2000);


})();
