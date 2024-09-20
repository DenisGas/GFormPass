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
