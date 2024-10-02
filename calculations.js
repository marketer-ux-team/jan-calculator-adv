document.addEventListener('DOMContentLoaded', function () { //Stelle für Änderung //Ich füge was hinzu
    // Select necessary DOM elements

    const genderInputs = document.querySelectorAll('input[name="geschlecht"]');
    const calcTypeInputs = document.querySelectorAll('input[name="kfa-or-miflin"]');
    const ageInput = document.getElementById('age-2');
    const heightInput = document.getElementById('height-2');
    const weightInput = document.getElementById('weight-2');
    const weightKfaInput = document.getElementById('weight-3-kfa'); // KFA weight input
    const kfaInput = document.getElementById('kfa-2');
    const stepsInput = document.getElementById('steps-4'); // Steps input
    const grundumsatzElement = document.getElementById('grund-right'); // Grundumsatz result element
    const altagElement = document.getElementById('altag-right'); // Alltagsbewegung result element
    const stepsResultElement = document.querySelector('.wrapper-steps_kcals .steps_result-text');
    const stepsWrapperResult = document.querySelector('.wrapper-steps_kcals'); // Steps kcal wrapper

    let gender = '';
    let calcType = 'miflin'; // Default to Miflin
    let age = null;
    let height = null;
    let weight = null;
    let kfa = null; // Body Fat Percentage for KFA calculation
    let dailySteps = null;

    // Hide steps result by default if value is 0
    stepsWrapperResult.style.display = 'none';

    // Gender selection
    genderInputs.forEach(input => {
        input.addEventListener('change', () => {
            gender = input.value;

            calculateResult();
        });
    });

    // Calculation type selection
    calcTypeInputs.forEach(input => {
        input.addEventListener('change', () => {
            calcType = input.value;

            toggleCalcType();
            calculateResult();
        });
    });

    // Input change listeners for Miflin inputs
    ageInput.addEventListener('input', () => {
        age = parseInt(ageInput.value, 10) || 0;

        calculateResult();
    });

    heightInput.addEventListener('input', () => {
        height = parseInt(heightInput.value, 10) || 0;
        calculateResult();
    });

    weightInput.addEventListener('input', () => {
        weight = parseInt(weightInput.value, 10) || 0;
        calculateResult();
    });

    // Input change listeners for KFA inputs
    weightKfaInput.addEventListener('input', () => {
        weight = parseInt(weightKfaInput.value, 10) || 0;
        calculateResult();
    });

    kfaInput.addEventListener('input', () => {
        kfa = parseInt(kfaInput.value, 10) || 0;
        calculateResult();
    });

    // Input change listener for Steps input
    stepsInput.addEventListener('input', () => {
        dailySteps = parseInt(stepsInput.value.replace(/\./g, ''), 10) || 0; // Removing periods and converting to integer
        calculateStepsCalories();
    });

    // Function to toggle between Miflin and KFA input fields
    function toggleCalcType() {
        const miflinInputs = document.getElementById('input-miflin');
        const kfaInputs = document.getElementById('input-kfa');
        if (calcType === 'miflin') {
            miflinInputs.style.display = 'block';
            kfaInputs.style.display = 'none';
        } else {
            miflinInputs.style.display = 'none';
            kfaInputs.style.display = 'block';
        }
    }

    // Calculation function for BMR
    function calculateResult() {
        // Fetch values from sliders' handle text if available
        age = getSliderValue('wrapper-step-range_slider', 'age-2');
        height = getSliderValue('wrapper-step-range_slider[fs-rangeslider-element="wrapper-2"]', 'height-2');
        weight = calcType === 'miflin' ? getSliderValue('wrapper-step-range_slider[fs-rangeslider-element="wrapper-3"]', 'weight-2') : getSliderValue('wrapper-step-range_slider[fs-rangeslider-element="wrapper-5"]', 'weight-3-kfa');
        kfa = calcType === 'kfa' ? getSliderValue('wrapper-step-range_slider[fs-rangeslider-element="wrapper-6"]', 'kfa-2') : 0;
    
    
        let result = 0;
    
        if (calcType === 'miflin') {
            // Miflin St. Jeor formula (using height, weight, age)
            if (gender === 'Mann') {
                result = 10 * weight + 6.25 * height - 5 * age + 5; // For males
            } else if (gender === 'frau') {
                result = 10 * weight + 6.25 * height - 5 * age - 161; // For females
            }
        } else if (calcType === 'kfa') {
            // Calculate BMR with KFA (only using weight and body fat percentage)
            if (weight > 0 && kfa > 0) {
                result = 864 + 13.8 * (weight * (1 - kfa / 100)); // KFA formula
            }
        }
    
    
        // Select the wrapper for Grundumsatz result
        const grundumsatzWrapper = document.querySelector('.wrapper-result_grundumsatz');
    
        // Update both elements with the calculated Grundumsatz
        if ((calcType === 'miflin' && weight && height && age && gender) || (calcType === 'kfa' && weight && kfa && gender)) {
            const roundedResult = Math.round(result);
    
            // Update the Grundumsatz element in the first section
            grundumsatzElement.textContent = `${roundedResult} kcal`;
    
            // Update the other element with the Grundumsatz result
            const grundumsatzResultElement = document.querySelector('.wrapper-result_grundumsatz .steps_result-text');
            if (grundumsatzResultElement) {
                grundumsatzResultElement.textContent = `${roundedResult} kcal`;
            }
    
            // Set wrapper display to flex if result is greater than 0
            if (roundedResult > 0 && grundumsatzWrapper) {
                grundumsatzWrapper.style.display = 'flex';
            }
    
        } else {
            // Reset both elements to 0 kcal if inputs are incomplete
            grundumsatzElement.textContent = '0 kcal';
    
            const grundumsatzResultElement = document.querySelector('.wrapper-result_grundumsatz .steps_result-text');
            if (grundumsatzResultElement) {
                grundumsatzResultElement.textContent = '0 kcal';
            }
    
            // Set wrapper display to none if result is 0
            if (grundumsatzWrapper) {
                grundumsatzWrapper.style.display = 'none';
            }
    
        }
    }
    
    

    // New function to calculate calories burned from daily steps
    function calculateStepsCalories() {
    const stepsCalories = dailySteps * 0.04; // On average, walking burns 0.04 kcal per step

    if (dailySteps > 0) {
        stepsWrapperResult.style.display = 'flex';
        stepsResultElement.textContent = `${Math.round(stepsCalories).toLocaleString('de-DE')} kcal`; // Format with comma for thousands
        altagElement.textContent = `${Math.round(stepsCalories).toLocaleString('de-DE')} kcal`; // Update Alltagsbewegung
    } else {
        stepsWrapperResult.style.display = 'none'; // Hide if steps are 0
        altagElement.textContent = '0 kcal'; // Reset Alltagsbewegung if steps are 0
    }
}


    // Get the value from the slider handle or the input field
    function getSliderValue(wrapperClass, inputId) {
        const handleText = document.querySelector(`.${wrapperClass} .inside-handle-text`);
        const inputElement = document.getElementById(inputId);

        // Use the handle text value if available, else fall back to the input value
        const valueFromHandle = handleText ? parseInt(handleText.textContent, 10) || 0 : 0;
        const valueFromInput = parseInt(inputElement.value, 10) || 0;


        return valueFromHandle || valueFromInput;
    }

    // Add listeners for custom sliders
    function addSliderListeners() {
        // Observe age, height, weight, weight-KFA, and KFA sliders
        observeSliderChange('wrapper-step-range_slider', 'age-2');
        observeSliderChange('wrapper-step-range_slider[fs-rangeslider-element="wrapper-2"]', 'height-2');
        observeSliderChange('wrapper-step-range_slider[fs-rangeslider-element="wrapper-3"]', 'weight-2');
        observeSliderChange('wrapper-step-range_slider[fs-rangeslider-element="wrapper-5"]', 'weight-3-kfa');
        observeSliderChange('wrapper-step-range_slider[fs-rangeslider-element="wrapper-6"]', 'kfa-2');
        observeSliderChange('wrapper-step-range_slider[fs-rangeslider-element="wrapper-4"]', 'steps-4'); // Steps slider
        observeSliderChange('wrapper-step-range_slider[fs-rangeslider-element="wrapper-7"]', 'wunschgewicht');
    }

    // Function to observe slider changes
    function observeSliderChange(wrapperClass, inputId) {
        const handleTextElement = document.querySelector(`.${wrapperClass} .inside-handle-text`);
        const inputElement = document.getElementById(inputId);


        // Observe changes in slider handle text
        const observer = new MutationObserver(() => {
            const value = handleTextElement.textContent;
            inputElement.value = value;

            if (inputId === 'steps-4') {
                dailySteps = parseInt(value, 10);
                calculateStepsCalories();
            } else {
                calculateResult(); // Trigger result calculation when the slider handle moves
            }
        });

        observer.observe(handleTextElement, { childList: true });

        // Also listen to direct input changes
        inputElement.addEventListener('input', () => {
            handleTextElement.textContent = inputElement.value;
            if (inputId === 'steps-4') {
                dailySteps = parseInt(inputElement.value, 10);
                calculateStepsCalories();
            } else {
                calculateResult();
            }
        });
    }

    // Initial setup
    toggleCalcType();
    addSliderListeners(); // Attach slider listeners
});

document.addEventListener('DOMContentLoaded', function () {
    const MET_VALUES = {
        'Krafttraining': 5.72, 
        'cardio-liss': 6.66,
        'cardio-hiit': 9.52
    };

    let weight = 0;

    // Function to dynamically fetch the correct weight based on the selected calculation type (Miflin or KFA)
    function getWeightFromGrundumsatz() {
        const calcType = document.querySelector('input[name="kfa-or-miflin"]:checked').value;
        if (calcType === 'miflin') {
            weight = parseInt(document.getElementById('weight-2').value, 10) || 0;
        } else {
            weight = parseInt(document.getElementById('weight-3-kfa').value, 10) || 0;
        }
    }

    // Add event listener to toggle between Miflin and KFA
    const calcTypeInputs = document.querySelectorAll('input[name="kfa-or-miflin"]');
    calcTypeInputs.forEach(input => {
        input.addEventListener('change', () => {
            getWeightFromGrundumsatz();
            updateTotalCalories(); // Recalculate after changing the weight source
        });
    });

    // Function to observe changes in sliders and input fields
    function observeWeightInputChange(wrapperClass, inputId) {
        const handleTextElement = document.querySelector(`.${wrapperClass} .inside-handle-text`);
        const inputElement = document.getElementById(inputId);

        // Observe changes in slider handle text
        if (handleTextElement) {
            const observer = new MutationObserver(() => {
                const value = parseInt(handleTextElement.textContent, 10) || 0;
                inputElement.value = value;
                getWeightFromGrundumsatz(); // Trigger weight fetch
                updateTotalCalories(); // Update total calories after weight change
            });

            observer.observe(handleTextElement, { childList: true });
        }

        // Add input event listener to handle manual input changes
        inputElement.addEventListener('input', () => {
            const value = parseInt(inputElement.value, 10) || 0;
            handleTextElement.textContent = value;
            getWeightFromGrundumsatz();
            updateTotalCalories();
        });
    }

    // Attach the observer to weight sliders and inputs
    observeWeightInputChange('wrapper-step-range_slider[fs-rangeslider-element="wrapper-3"]', 'weight-2');  // Miflin weight slider
    observeWeightInputChange('wrapper-step-range_slider[fs-rangeslider-element="wrapper-5"]', 'weight-3-kfa');  // KFA weight slider

    // Function to calculate calories for each training session
    function calculateTrainingCalories(activityType, minutesInputId, sessionsInputId) {
        const minutesInput = document.getElementById(minutesInputId);
        const sessionsInput = document.getElementById(sessionsInputId);

        let minutes = parseInt(minutesInput.value, 10) || 0;
        let sessions = parseInt(sessionsInput.value, 10) || 0;


        let MET = MET_VALUES[activityType] || 0;
        if (!activityType || minutes === 0 || sessions === 0 || weight === 0 || MET === 0) {
            return 0;
        }

        // Calculate calories per minute based on the activity's MET, weight, and time
        const caloriesPerMinute = (MET * 3.5 * weight) / 200;
        const totalCalories = caloriesPerMinute * minutes * sessions;
        return Math.round(totalCalories);
    }

    // Function to update the total calories for all sessions
    function updateTotalCalories() {
        getWeightFromGrundumsatz(); // Ensure weight is fetched each time a change is made
    
        const totalCaloriesSession1 = calculateTrainingCalories($('#drop-down-1').val(), 'training-minuten', 'training-woche');
        const totalCaloriesSession2 = calculateTrainingCalories($('#drop-down-2').val(), 'training-minuten-2', 'training-woche-2');
        const totalCaloriesSession3 = calculateTrainingCalories($('#drop-down-3').val(), 'training-minuten-3', 'training-woche-3');
    
        const totalCalories = totalCaloriesSession1 + totalCaloriesSession2 + totalCaloriesSession3;
    
        const totalCaloriesElement = document.getElementById('total-calories');
        const activeCaloriesElement = document.getElementById('active-right'); 
    
        if (totalCalories > 0) {
            const dailyCalories = Math.round(totalCalories / 7); // Divide by 7 to get daily calories
    
            totalCaloriesElement.textContent = `${dailyCalories} kcal`; // Update with daily calories
            activeCaloriesElement.textContent = `${dailyCalories} kcal`; // Update with daily calories in active-right
    
            totalCaloriesElement.style.display = 'flex';
        } else {
            totalCaloriesElement.style.display = 'none';
            activeCaloriesElement.textContent = '0 kcal'; // Reset active calories if total is 0
        }
    }
    

    // Function to set up training sessions
    function setupTrainingSession(dropdownId, minutesInputId, sessionsInputId) {
        const activityDropdown = $(`#${dropdownId}`);
        const minutesInput = document.getElementById(minutesInputId);
        const sessionsInput = document.getElementById(sessionsInputId);

        // Remove any previous event listeners to avoid multiple triggers
        activityDropdown.off('change');

        // Event for detecting dropdown changes
        activityDropdown.on('change', function () {
            const selectedActivity = $(this).val();  // Capture the value on change
            if (selectedActivity) {  // Check if the selected activity is valid
                updateTotalCalories();  // Update total calories for all sessions
            } else {
            }
        });

        // Input events
        minutesInput.addEventListener('input', function () {
            updateTotalCalories();  // Update total calories for all sessions
        });

        sessionsInput.addEventListener('input', function () {
            updateTotalCalories();  // Update total calories for all sessions
        });
    }

    // Initialize nice-select and training sessions
    $(document).ready(function () {
        $('select').niceSelect();  // Initialize nice-select for all select elements
        setupTrainingSession('drop-down-1', 'training-minuten', 'training-woche');
        setupTrainingSession('drop-down-2', 'training-minuten-2', 'training-woche-2');
        setupTrainingSession('drop-down-3', 'training-minuten-3', 'training-woche-3');
    });
});


document.addEventListener('DOMContentLoaded', function () {
    // Select necessary DOM elements
    const grundumsatzElement = document.getElementById('grund-right');
    const alltagsbewegungElement = document.getElementById('altag-right');
    const aktivesTrainingElement = document.getElementById('active-right');
    const totalCaloriesElement = document.querySelector('.result-tats-chlich');
    const nahrungsverbrennungElement = document.getElementById('nahrungsburn');

    const fallbackCalories = 1280; // Fallback if no Grundumsatz is provided yet

    // Function to update the total actual calorie burn
    function updateActualCalories() {
        const grundumsatz = parseInt(grundumsatzElement.textContent, 10) || 0;
        const alltagsbewegung = parseInt(alltagsbewegungElement.textContent, 10) || 0;
        const aktivesTraining = parseInt(aktivesTrainingElement.textContent, 10) || 0;

        // If Grundumsatz is available, use it; otherwise, use fallback (1280 kcal)
        const baseCalories = grundumsatz || fallbackCalories;

        // Calculate the total calories (excluding Nahrungsburn)
        let totalCalories = baseCalories + alltagsbewegung + aktivesTraining;

        // After total calories are calculated, calculate nahrungsburn (8% of total calories)
        const nahrungsverbrennung = totalCalories * 0.08;

        // Add nahrungsburn to the total calories
        totalCalories += nahrungsverbrennung;

        // Update the totalCaloriesElement and nahrungsburn elements
        totalCaloriesElement.textContent = `${Math.round(totalCalories)}`;
        nahrungsverbrennungElement.textContent = `${Math.round(nahrungsverbrennung)} kcal`;
    }

    // Set initial value of totalCaloriesElement to the fallback value (1280 kcal) on page load
    totalCaloriesElement.textContent = `${fallbackCalories}`;

    // Add listeners to the text fields for changes
    [grundumsatzElement, alltagsbewegungElement, aktivesTrainingElement].forEach(element => {
        const observer = new MutationObserver(updateActualCalories);
        observer.observe(element, { childList: true, subtree: true }); // Observe changes to the text content
    });

    // Trigger the update on page load
    updateActualCalories();
});


// Helper function to scroll smoothly with an offset
function smoothScrollWithOffset(id, offset) {
    const element = document.getElementById(id);
    const yOffset = offset || 0;
    const y = element.getBoundingClientRect().top + window.pageYOffset - yOffset;

    window.scrollTo({
        top: y,
        behavior: 'smooth'
    });
}

let chartInstance = null; // Declare chartInstance globally

window.onload = function() {
    setTimeout(function() {
        // Cross-browser event creation function
        function createNewEvent(eventName) {
            var event;
            if (typeof(Event) === 'function') {
                event = new Event(eventName, { bubbles: true });
            } else {
                event = document.createEvent('Event');
                event.initEvent(eventName, true, true);
            }
            return event;
        }

        // Utility function to debounce the event handler
        function debounce(fn, delay) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(context, args), delay);
            };
        }

        // Select necessary DOM elements
        var totalCaloriesElement = document.querySelector('.result-tats-chlich'); 
        var weightInputElementMiflin = document.getElementById('weight-2'); 
        var weightInputElementKfa = document.getElementById('weight-3-kfa'); 
        var warningMessageElement = document.querySelector('.warning-message_wrapper'); 
        var zielKalorienElement = document.querySelector('.result_zielkalorien'); 
        var zielKcalElement = document.querySelector('.span-result.ziel-kcal'); 
        var startWeightElement = document.querySelector('.span-result.start-weight');
        var radios = document.getElementsByName('Gewichtverlust'); 
        var targetWeightElement = document.getElementById('wunschgewicht'); 
        var weeksElement = document.querySelector('.span-result.weeks'); 
        var monthsElement = document.querySelector('.span-result.months'); 
        var targetWeightResultElement = document.querySelector('.span-result.target-weight'); 
        var defizitElement = document.querySelector('.result-defizit'); 
        var fettAbnahmeElement = document.querySelector('.result-fettabhnahme'); 

        // Select gender buttons
        var womanButton = document.querySelector('.woman-button.right');
        var manButton = document.querySelector('.woman-button.man');
        var genderWarning = document.querySelector('.text-warning.gender');

        // Function to hide the gender warning on selection
        function hideGenderWarning() {
            if (genderWarning) {
                genderWarning.style.display = 'none'; // Hide the warning when a gender is selected
            }
        }

        // Add event listeners to gender buttons if they exist
        if (womanButton) {
            womanButton.addEventListener('click', hideGenderWarning);
        }
        if (manButton) {
            manButton.addEventListener('click', hideGenderWarning);
        }

        // Function to get the selected calculation method
        function getSelectedCalculationMethod() {
            var methodRadios = document.getElementsByName('kfa-or-miflin');
            for (var i = 0; i < methodRadios.length; i++) {
                if (methodRadios[i].checked) {
                    return methodRadios[i].value;
                }
            }
            return null;
        }

        // Function to handle live validation on input fields
        function hideWarningOnInput(inputElement, warningElement) {
            if (!inputElement || !warningElement) return;
            var handler = function() {
                if (inputElement.value.trim() !== '' && parseFloat(inputElement.value) > 0) {
                    warningElement.style.display = 'none'; // Hide the warning if the input is valid
                }
            };
            inputElement.addEventListener('input', handler);
            inputElement.addEventListener('change', handler); 
        }

        // Function to handle live validation on slider changes using MutationObserver
        function hideWarningOnSliderInput(sliderElement, inputElement, warningElement) {
            if (!sliderElement || !inputElement || !warningElement) return;
            var handleTextElement = sliderElement.querySelector('.inside-handle-text');
            if (handleTextElement) {
                var observer = new MutationObserver(debounce(function() {
                    var sliderValue = parseFloat(handleTextElement.textContent) || 0;
                    inputElement.value = sliderValue;
                    if (sliderValue > 0) {
                        warningElement.style.display = 'none'; 
                    }
                    var event = createNewEvent('input');
                    inputElement.dispatchEvent(event);
                }, 100)); // Add 100ms debounce to avoid too many updates

                observer.observe(handleTextElement, { childList: true, characterData: true, subtree: true });
            }
        }

        // Attach validation to inputs and sliders
        function attachValidation(inputId, sliderSelector) {
            var inputElement = document.getElementById(inputId);
            if (!inputElement) return;
            var closestWrapper = inputElement.closest('.input-wrapper-calc');
            var warningElement = null;
            if (closestWrapper) {
                warningElement = closestWrapper.querySelector('.text-warning');
            }
            hideWarningOnInput(inputElement, warningElement);
            var sliderElement = document.querySelector(sliderSelector);
            if (sliderElement) {
                hideWarningOnSliderInput(sliderElement, inputElement, warningElement);
            }
        }

        // Add event listener specifically for age-2 handle text
        var ageHandleTextElement = document.getElementById('age-2_handle-text');
        var ageInputElement = document.getElementById('age-2');
        var ageWarningElement = null;
        if (ageInputElement) {
            var ageClosestWrapper = ageInputElement.closest('.input-wrapper-calc');
            if (ageClosestWrapper) {
                ageWarningElement = ageClosestWrapper.querySelector('.text-warning');
            }
        }

        if (ageHandleTextElement && ageInputElement) {
            var observer = new MutationObserver(debounce(function() {
                var sliderValue = parseFloat(ageHandleTextElement.textContent) || 0;
                ageInputElement.value = sliderValue;

                // Hide the warning if the input is valid
                if (sliderValue > 0 && ageWarningElement) {
                    ageWarningElement.style.display = 'none';
                }

                var event = createNewEvent('input');
                ageInputElement.dispatchEvent(event);
            }, 100)); // 100ms debounce

            observer.observe(ageHandleTextElement, { childList: true, characterData: true, subtree: true });
        }

        // Add live validation for Wunschgewicht (since it may not have a slider)
        var wunschgewichtInput = document.getElementById('wunschgewicht');
        var wunschgewichtWarning = null;
        if (wunschgewichtInput) {
            var wunschgewichtClosestWrapper = wunschgewichtInput.closest('.input-wrapper-calc');
            if (wunschgewichtClosestWrapper) {
                wunschgewichtWarning = wunschgewichtClosestWrapper.querySelector('.text-warning');
            }
            hideWarningOnInput(wunschgewichtInput, wunschgewichtWarning);
        }

        // Attach validation to inputs and sliders
        attachValidation('age-2', '.wrapper-step-range_slider[fs-rangeslider-element="wrapper-1"]');
        attachValidation('height-2', '.wrapper-step-range_slider[fs-rangeslider-element="wrapper-2"]');
        attachValidation('weight-2', '.wrapper-step-range_slider[fs-rangeslider-element="wrapper-3"]');
        attachValidation('weight-3-kfa', '.wrapper-step-range_slider[fs-rangeslider-element="wrapper-5"]');
        attachValidation('kfa-2', '.wrapper-step-range_slider[fs-rangeslider-element="wrapper-6"]');
        attachValidation('wunschgewicht', '.wrapper-step-range_slider[fs-rangeslider-element="wrapper-7"]');

        // Function to validate inputs and show warnings if any are missing or invalid
        var isBerechnenClicked = false;
        function validateInputs() {
            var isValid = true;
            if (!isBerechnenClicked) return; // Only validate if "Berechnen" button has been clicked

            // Helper function to scroll smoothly with an offset
            function smoothScrollWithOffset(id, offset) {
                const element = document.getElementById(id);
                const yOffset = offset || 0;
                const y = element.getBoundingClientRect().top + window.pageYOffset - yOffset;

                window.scrollTo({
                    top: y,
                    behavior: 'smooth'
                });
            }

            // Validate gender selection or check if one of the buttons has the 'active' class
            var selectedGender = document.querySelector('input[name="geschlecht"]:checked');
            var hasActiveClass = womanButton && womanButton.classList.contains('active') || manButton && manButton.classList.contains('active');

            // Flags to track missing inputs
            var isGenderMissing = false;
            var isWunschgewichtMissing = false;

            // Validate Gender
            if (!selectedGender && !hasActiveClass) {
                isGenderMissing = true;
                isValid = false;
                smoothScrollWithOffset('scroll-if-gender-missing', 64); // 64px offset for navbar
                if (genderWarning) {
                    genderWarning.textContent = 'Bitte wähle oben dein Geschlecht aus.';
                    genderWarning.style.display = 'block';
                }
            } else {
                if (genderWarning) {
                    genderWarning.style.display = 'none';
                }
            }

            var calculationMethod = getSelectedCalculationMethod();
            // Additional input validation logic for miflin and kfa
            if (calculationMethod === 'miflin') {
                // Validate Age
                var ageInput = document.getElementById('age-2');
                var ageWarning = null;
                if (ageInput) {
                    var ageClosestWrapper = ageInput.closest('.input-wrapper-calc');
                    if (ageClosestWrapper) {
                        ageWarning = ageClosestWrapper.querySelector('.text-warning');
                    }
                }
                if (!ageInput || ageInput.value.trim() === '' || parseFloat(ageInput.value) <= 0) {
                    if (ageWarning) {
                        ageWarning.style.display = 'block';
                        ageWarning.textContent = 'Bitte gib dein Alter ein.';
                    }
                    isValid = false;
                } else {
                    if (ageWarning) {
                        ageWarning.style.display = 'none';
                    }
                }

                // Validate Height
                var heightInput = document.getElementById('height-2');
                var heightWarning = null;
                if (heightInput) {
                    var heightClosestWrapper = heightInput.closest('.input-wrapper-calc');
                    if (heightClosestWrapper) {
                        heightWarning = heightClosestWrapper.querySelector('.text-warning');
                    }
                }
                if (!heightInput || heightInput.value.trim() === '' || parseFloat(heightInput.value) <= 0) {
                    if (heightWarning) {
                        heightWarning.style.display = 'block';
                        heightWarning.textContent = 'Bitte gib deine Größe ein.';
                    }
                    isValid = false;
                } else {
                    if (heightWarning) {
                        heightWarning.style.display = 'none';
                    }
                }

                // Validate Weight (Miflin)
                var weightWarning = null;
                if (weightInputElementMiflin) {
                    var weightClosestWrapper = weightInputElementMiflin.closest('.input-wrapper-calc');
                    if (weightClosestWrapper) {
                        weightWarning = weightClosestWrapper.querySelector('.text-warning');
                    }
                }
                if (!weightInputElementMiflin || weightInputElementMiflin.value.trim() === '' || parseFloat(weightInputElementMiflin.value) <= 0) {
                    if (weightWarning) {
                        weightWarning.style.display = 'block';
                        weightWarning.textContent = 'Bitte gib dein Gewicht ein.';
                    }
                    isValid = false;
                } else {
                    if (weightWarning) {
                        weightWarning.style.display = 'none';
                    }
                }
            } else if (calculationMethod === 'kfa') {
                // Validate Weight (KFA)
                var weightWarningKfa = null;
                if (weightInputElementKfa) {
                    var weightClosestWrapperKfa = weightInputElementKfa.closest('.input-wrapper-calc');
                    if (weightClosestWrapperKfa) {
                        weightWarningKfa = weightClosestWrapperKfa.querySelector('.text-warning');
                    }
                }
                if (!weightInputElementKfa || weightInputElementKfa.value.trim() === '' || parseFloat(weightInputElementKfa.value) <= 0) {
                    if (weightWarningKfa) {
                        weightWarningKfa.style.display = 'block';
                        weightWarningKfa.textContent = 'Bitte gib dein Gewicht ein.';
                    }
                    isValid = false;
                } else {
                    if (weightWarningKfa) {
                        weightWarningKfa.style.display = 'none';
                    }
                }

                // Validate KFA
                var kfaInput = document.getElementById('kfa-2');
                var kfaWarning = null;
                if (kfaInput) {
                    var kfaClosestWrapper = kfaInput.closest('.input-wrapper-calc');
                    if (kfaClosestWrapper) {
                        kfaWarning = kfaClosestWrapper.querySelector('.text-warning');
                    }
                }
                if (!kfaInput || kfaInput.value.trim() === '' || parseFloat(kfaInput.value) <= 0) {
                    if (kfaWarning) {
                        kfaWarning.style.display = 'block';
                        kfaWarning.textContent = 'Bitte gib deinen KFA-Wert ein.';
                    }
                    isValid = false;
                } else {
                    if (kfaWarning) {
                        kfaWarning.style.display = 'none';
                    }
                }
            }

            // Validate Wunschgewicht
            if (!wunschgewichtInput || wunschgewichtInput.value.trim() === '' || parseFloat(wunschgewichtInput.value) <= 0) {
                isWunschgewichtMissing = true;
                isValid = false;
                if (wunschgewichtWarning) {
                    wunschgewichtWarning.textContent = 'Bitte gib dein Wunschgewicht ein.';
                    wunschgewichtWarning.style.display = 'block';
                }
            } else {
                if (wunschgewichtWarning) {
                    wunschgewichtWarning.style.display = 'none';
                }
            }

            // Validate weight loss goal selection (Abnehmziel)
            var selectedValue = null;
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    selectedValue = radios[i].value;
                    break;
                }
            }
            var abnehmzielWarning = document.querySelector('.wrapper-abnehmziel .text-warning.here');
            if (!selectedValue) {
                isValid = false;
                if (abnehmzielWarning) {
                    abnehmzielWarning.style.display = 'block';
                    abnehmzielWarning.textContent = 'Bitte wähle dein Abnehmziel aus.';
                }
            } else {
                if (abnehmzielWarning) {
                    abnehmzielWarning.style.display = 'none';
                }
            }

            return isValid;
        }

        // Add event listeners for gender selection
        var genderRadios = document.querySelectorAll('input[name="geschlecht"]');
        genderRadios.forEach(function(radio) {
            radio.addEventListener('change', function() {
                validateInputs(); // Revalidate when gender is selected
            });
        });

        // Add event listener for wunschgewicht input
        wunschgewichtInput.addEventListener('input', function() {
            validateInputs(); // Revalidate when wunschgewicht is provided
        });

        // Function to initialize event listeners and updates
        function initializeListeners() {
            if (totalCaloriesElement) {
                var observer = new MutationObserver(debounce(updateResults, 100)); // Throttling results update
                observer.observe(totalCaloriesElement, { childList: true, subtree: true });
            }

            if (radios.length > 0) {
                for (var i = 0; i < radios.length; i++) {
                    radios[i].addEventListener('change', function() {
                        updateResults();

                        var abnehmzielWarning = document.querySelector('.wrapper-abnehmziel .text-warning.here');
                        if (abnehmzielWarning) {
                            abnehmzielWarning.style.display = 'none';
                        }
                    });
                }
            }

            var methodRadios = document.getElementsByName('kfa-or-miflin');
            if (methodRadios.length > 0) {
                for (var i = 0; i < methodRadios.length; i++) {
                    methodRadios[i].addEventListener('change', function() {
                        updateResults();
                    });
                }
            }

            var berechnenButton = document.getElementById('check-inputs');
            if (berechnenButton) {
                berechnenButton.addEventListener('click', function (event) {
                    event.preventDefault();
                    isBerechnenClicked = true; // Mark that the button has been clicked
                    if (validateInputs()) {
                        updateResults();
                        if (window.innerWidth >= 1024) { // Adjust the breakpoint as needed
                            smoothScrollWithOffset('scroll-if-gender-missing', 64); // 64px offset for navbar
                        }
                    }
                });
            }

            updateResults();
        }

        // Function to calculate weeks to reach the goal using compound weight loss formula
        function calculateWeeksToGoal(currentWeight, targetWeight, weeklyWeightLossPercentage) {
            let weeks = 0;
            while (currentWeight > targetWeight) {
                currentWeight -= currentWeight * weeklyWeightLossPercentage; // Compound weight loss
                weeks++;
                if (weeks > 1000) { // Safety to prevent infinite loops
                    break;
                }
            }
            return weeks;
        }

        function updateResults() {
            var calculationMethod = getSelectedCalculationMethod();
            
            // Get the current weight based on the selected calculation method
            var currentWeight = 0;
            if (calculationMethod === 'miflin') {
                currentWeight = parseFloat(weightInputElementMiflin && weightInputElementMiflin.value) || 0;
            } else if (calculationMethod === 'kfa') {
                currentWeight = parseFloat(weightInputElementKfa && weightInputElementKfa.value) || 0;
            }
        
            var targetWeight = parseFloat(targetWeightElement && targetWeightElement.value) || 0;
            var totalCalories = totalCaloriesElement ? totalCaloriesElement.textContent : '';
            var totalCaloriesValue = parseInt(totalCalories.replace(/\D/g, '')) || 0;
        
            if (startWeightElement) startWeightElement.textContent = currentWeight.toString();
        
            // Calculate grundUmsatzValue based on the selected method
            var grundUmsatzValue = 0;
            var grundUmsatzCap = 0; // Cap using optimal weight logic for both methods
        
            if (calculationMethod === 'miflin') {
                var heightInput = document.getElementById('height-2');
                var height = parseFloat(heightInput && heightInput.value) || 0;
        
                var optimalWeight = height - 100;
        
                // Get age and gender
                var ageInput = document.getElementById('age-2');
                var age = parseFloat(ageInput && ageInput.value) || 0;
        
                var gender = document.querySelector('input[name="geschlecht"]:checked')?.value;
                var genderFactor = (gender === 'man') ? 5 : -161;
        
                // Calculate Grundumsatz using Mifflin-St Jeor equation with optimal weight
                grundUmsatzValue = 10 * optimalWeight + 6.25 * height - 5 * age + genderFactor;
                grundUmsatzValue = Math.round(grundUmsatzValue);
        
            } else if (calculationMethod === 'kfa') {
                var kfaInput = document.getElementById('kfa-2'); // User's body fat percentage input
                var kfa = parseFloat(kfaInput && kfaInput.value) / 100 || 0; // Convert percentage input to decimal (e.g., 40% = 0.40)
        
                // Step 1: Calculate lean body mass (LBM) based on the user's current weight and actual KFA
                var LBM = currentWeight * (1 - kfa); // Example: 132kg * (1 - 0.40) = 79.2kg
                
                // Step 2: Calculate optimal weight assuming 15% body fat
                var optimalWeight = LBM / 0.85; // Example: 79.2kg / 0.85 = 93.18kg
                
                // Step 3: Now calculate Grundumsatz using the new **optimal weight** but with the user's **actual KFA** input.
                grundUmsatzValue = 864 + 13.8 * (optimalWeight * (1 - kfa)); // Using optimal weight with actual KFA
                
                grundUmsatzValue = Math.round(grundUmsatzValue);
            }
        
            var selectedValue = null;
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    selectedValue = radios[i].value;
                    break;
                }
            }
        
            // Check for invalid inputs
            if (
                isNaN(totalCaloriesValue) || totalCaloriesValue <= 0 ||
                isNaN(currentWeight) || currentWeight <= 0 ||
                isNaN(grundUmsatzValue) || grundUmsatzValue <= 0 ||
                isNaN(targetWeight) || targetWeight <= 0 ||
                !selectedValue
            ) {
                resetResults(); // Reset if inputs are invalid
                return;
            }
        
            // Set the weekly weight loss percentage based on selected value
            var weeklyWeightLossPercentage = 0;
            if (selectedValue === 'Langsames Abnehmen') {
                weeklyWeightLossPercentage = 0.005;
            } else if (selectedValue === 'Moderates Abnehmen') {
                weeklyWeightLossPercentage = 0.0075;
            } else if (selectedValue === 'Schnelles Abnehmen') {
                weeklyWeightLossPercentage = 0.01;
            }
        
            // Calculate the calorie deficit based on the last week's weight loss
            var lastWeekWeightLossKg = currentWeight * weeklyWeightLossPercentage;
            var calorieDeficitPerDay = Math.round((lastWeekWeightLossKg * 7700) / 7);
            var targetCalories = Math.max(0, totalCaloriesValue - calorieDeficitPerDay);
        
            // Cap targetCalories to grundUmsatzValue only if it falls below the calculated Grundumsatz
            if (targetCalories < grundUmsatzValue) {
                targetCalories = grundUmsatzValue; // Apply capping here
                // Recalculate calorieDeficitPerDay based on capped targetCalories
                calorieDeficitPerDay = totalCaloriesValue - targetCalories;
                // Recalculate lastWeekWeightLossKg based on new calorieDeficitPerDay
                lastWeekWeightLossKg = (calorieDeficitPerDay * 7) / 7700;
                lastWeekWeightLossKg = Number(lastWeekWeightLossKg.toFixed(2));
                // Recalculate weeklyWeightLossPercentage
                weeklyWeightLossPercentage = lastWeekWeightLossKg / currentWeight;
            } else {
                lastWeekWeightLossKg = Number(lastWeekWeightLossKg.toFixed(2));
            }
        
            // Calculate weeks to reach the goal using compound weight loss
            var weeksToReachGoal = 0;
            if (weeklyWeightLossPercentage > 0) {
                weeksToReachGoal = calculateWeeksToGoal(currentWeight, targetWeight, weeklyWeightLossPercentage);
            }
            var monthsToReachGoal = Math.round(weeksToReachGoal / 4.345);
        
            if (weeksElement) weeksElement.textContent = weeksToReachGoal.toString();
            if (monthsElement) monthsElement.textContent = monthsToReachGoal.toString();
        
            if (targetWeightResultElement) targetWeightResultElement.textContent = targetWeight.toString();
        
            // Update the target calories element
            if (zielKalorienElement) zielKalorienElement.textContent = targetCalories > 0 ? Math.round(targetCalories) : '0';
            if (zielKcalElement) zielKcalElement.textContent = targetCalories > 0 ? Math.round(targetCalories) : '0';
        
            // Handle warnings if target calories fall below Grundumsatz
            if (warningMessageElement) {
                if (targetCalories <= grundUmsatzValue) {
                    warningMessageElement.style.display = 'flex';
                    var warningMessage = warningMessageElement.querySelector('.warning-message');
                    if (warningMessage) {
                        warningMessage.textContent = 'Warnhinweis: Du solltest nicht weniger als ' + grundUmsatzValue + ' kcal essen, um deine Gesundheit nicht zu gefährden.';
                    }
                } else {
                    warningMessageElement.style.display = 'none';
                }
            }
        
            // Update defizit and fettAbnahme with rounded values
            if (defizitElement) defizitElement.textContent = Math.round(calorieDeficitPerDay).toString();
            if (fettAbnahmeElement) fettAbnahmeElement.textContent = lastWeekWeightLossKg.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
            // Generate weight data points based on calculated weeks and weight loss percentage
            const { weightData, timeIntervals } = calculateWeightDataPoints(currentWeight, targetWeight, weeksToReachGoal, weeklyWeightLossPercentage);
        
            // Generate the chart with calculated weight data and time intervals
            generateResultChart(weightData, timeIntervals);
        }
        

        
        
        // Function to calculate weight data points (for the chart)
        function calculateWeightDataPoints(currentWeight, targetWeight, totalWeeks, weeklyWeightLossPercentage) {
            const weightData = [];
            const timeIntervals = [];
            const numberOfPoints = 10; // Number of data points (dots)

            // Calculate evenly spaced time intervals
            for (let i = 0; i <= numberOfPoints; i++) {
                let t = (totalWeeks / numberOfPoints) * i;
                timeIntervals.push(t);
            }

            // Generate weight data using compound weight loss formula
            for (let i = 0; i <= numberOfPoints; i++) {
                let weeksPassed = timeIntervals[i];

                // Using compound interest formula for weight loss
                // weight = initialWeight * (1 - weeklyWeightLossPercentage)^(weeksPassed)
                let weight = currentWeight * Math.pow(1 - weeklyWeightLossPercentage, weeksPassed);

                // Ensure the last weight is exactly the target weight
                if (i === numberOfPoints) {
                    weight = targetWeight;
                }

                weightData.push(parseFloat(weight.toFixed(1)));
            }

            return { weightData, timeIntervals };
        }

        // Function to generate the chart
        function generateResultChart(weightData, timeIntervals) {
            // Set wrapper-canvas display to block if it isn't already
            const wrapperCanvas = document.querySelector('.wrapper-canvas');
            const textUnderCanvas = document.querySelector('.text-under_canvas'); // Select the text element

            if (wrapperCanvas && getComputedStyle(wrapperCanvas).display !== 'block') {
                wrapperCanvas.style.display = 'block';
            }

            // Show the text under the canvas
            if (textUnderCanvas && getComputedStyle(textUnderCanvas).display !== 'block') {
                textUnderCanvas.style.display = 'block';
            }

            const chartCanvas = document.getElementById('resultChart');
            const ctx = chartCanvas.getContext('2d');

            if (chartInstance) {
                chartInstance.destroy(); // Destroy old chart instance if it exists
            }

            const gradientFill = ctx.createLinearGradient(0, 0, 0, chartCanvas.height);
            gradientFill.addColorStop(0, 'rgba(233, 62, 45, 0.3)');
            gradientFill.addColorStop(1, 'rgba(26, 183, 0, 0.3)');

            const dates = generateKeyDates(timeIntervals); // Generate dates based on time intervals
            const pointColors = weightData.map((_, index) => index === 0 ? 'rgba(233, 62, 45, 1)' : 'rgba(26, 183, 0, 1)');
            const pointSizes = Array(weightData.length).fill(6); // Consistent point size

            setTimeout(() => {
                chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates, // X-axis: dates
                        datasets: [{
                            data: weightData, // Y-axis: weight data
                            backgroundColor: gradientFill,
                            borderColor: 'rgba(0, 150, 0, 1)',
                            borderWidth: 2,
                            fill: true,
                            pointBackgroundColor: pointColors,
                            pointBorderColor: '#fff',
                            pointHoverRadius: 8,
                            pointHoverBackgroundColor: 'rgba(0, 150, 0, 1)',
                            pointRadius: pointSizes,
                            pointHitRadius: 10,
                            lineTension: 0.3, // For a smooth curve
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(tooltipItem) {
                                        return 'Gewicht: ' + tooltipItem.raw + ' Kg';
                                    }
                                },
                                backgroundColor: 'rgba(0, 150, 0, 0.8)',
                                titleColor: '#fff',
                                bodyColor: '#fff'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                ticks: { stepSize: 5, color: '#333' },
                                grid: { color: 'rgba(200, 200, 200, 0.2)' }
                            },
                            x: {
                                ticks: {
                                    callback: function(value, index) {
                                        return index === 0 ? 'Heute' : dates[index];
                                    },
                                    color: '#333',
                                    maxRotation: 45,
                                    minRotation: 45,
                                    autoSkip: true,
                                    maxTicksLimit: 10,
                                },
                                grid: { display: false }
                            }
                        }
                    }
                });

                console.log("Final Chart Data: ", chartInstance.data.datasets[0].data); // Debugging log

                // **Added smooth scroll functionality here**
                // Scroll to the chart element only on desktop devices
              
            }, 100);
        }

        // Helper function to generate dates for the chart
        function generateKeyDates(timeIntervals) {
            const dates = [];
            let currentDate = new Date();

            for (let i = 0; i < timeIntervals.length; i++) {
                let date = new Date(currentDate.getTime());
                date.setDate(currentDate.getDate() + Math.round(timeIntervals[i] * 7)); // Convert weeks to days
                dates.push(date.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' }));
            }

            return dates;
        }

        // Helper function to reset results when inputs are invalid
        function resetResults() {
            if (defizitElement) defizitElement.textContent = '0';
            if (fettAbnahmeElement) fettAbnahmeElement.textContent = '0';
            if (weeksElement) weeksElement.textContent = '0';
            if (monthsElement) monthsElement.textContent = '0';
            if (targetWeightResultElement) targetWeightResultElement.textContent = '0';
            if (zielKcalElement) zielKcalElement.textContent = '0';
            if (zielKalorienElement) zielKalorienElement.textContent = '0';
            if (warningMessageElement) warningMessageElement.style.display = 'none';
        
            // Hide the text-under_canvas when resetting results
            const textUnderCanvas = document.querySelector('.text-under_canvas');
            if (textUnderCanvas && getComputedStyle(textUnderCanvas).display !== 'none') {
                textUnderCanvas.style.display = 'none';
            }
        
            // Hide the canvas when resetting results
            const wrapperCanvas = document.querySelector('.wrapper-canvas');
            if (wrapperCanvas && getComputedStyle(wrapperCanvas).display !== 'none') {
                wrapperCanvas.style.display = 'none';
            }
            
            // Destroy the chart if it exists
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
        }
        

        initializeListeners();
    }, 2); // 2 milliseconds delay
};





document.addEventListener('DOMContentLoaded', function () {
    // Function to hide all CTAs
    function hideAllCTAs() {
        const ctas = document.querySelectorAll('.cta_card-wrapper.cta-calculator');
        ctas.forEach(cta => {
            cta.style.display = 'none'; // Hide all CTAs
        });
    }

    // Function to get slider value from either the handle text or input field
    function getSliderValue(wrapperClass, inputId) {
        const handleText = document.querySelector(`.${wrapperClass} .inside-handle-text`);
        const inputElement = document.getElementById(inputId);
        const valueFromHandle = handleText ? parseInt(handleText.textContent, 10) : 0;
        const valueFromInput = inputElement ? parseInt(inputElement.value, 10) || 0 : 0;

        // Prioritize value from input field, otherwise use the slider handle value
        return valueFromInput || valueFromHandle;
    }

    // Function to calculate weight loss based on current weight and goal weight
    function calculateWeightLoss() {
        // Determine calculation type (Miflin or KFA)
        const calcType = document.querySelector('input[name="kfa-or-miflin"]:checked').value;

        // Fetch current weight depending on the calculation type
        const currentWeight = calcType === 'miflin'
            ? getSliderValue('wrapper-step-range_slider[fs-rangeslider-element="wrapper-3"]', 'weight-2')
            : getSliderValue('wrapper-step-range_slider[fs-rangeslider-element="wrapper-5"]', 'weight-3-kfa');

        const goalWeight = parseInt(document.querySelector('.target-weight').textContent) || 0;
        const weightLoss = currentWeight - goalWeight;

        return weightLoss > 0 ? weightLoss : 0;
    }

    // Function to show the correct CTA based on weight loss and gender
    function showCTA(gender, weightLoss) {
        // Hide all previous CTAs
        hideAllCTAs();

        let element;

        if (gender === 'frau') {
            if (weightLoss >= 1 && weightLoss <= 15) {
                element = document.querySelector('._1-15.woman');
            } else if (weightLoss >= 16 && weightLoss <= 25) {
                element = document.querySelector('._16-25.woman');
            } else if (weightLoss >= 26 && weightLoss <= 35) {
                element = document.querySelector('._26-35.woman');
            } else if (weightLoss > 35) {
                element = document.querySelector('._36-more.woman');
            }
        } else if (gender === 'mann') {
            if (weightLoss >= 1 && weightLoss <= 15) {
                element = document.querySelector('._1-15.man');
            } else if (weightLoss >= 16 && weightLoss <= 25) {
                element = document.querySelector('._16-25.man');
            } else if (weightLoss >= 26 && weightLoss <= 35) {
                element = document.querySelector('._26-35.man');
            } else if (weightLoss > 35) {
                element = document.querySelector('._36-more.man');
            }
        }

        if (element) {
            element.style.display = 'block';
        } else {
            console.log(`No matching CTA found for ${gender} with weight loss: ${weightLoss}`);
        }
    }

    // Function to display the correct CTA based on weight loss and gender
    function checkValuesAndDisplay() {
        const zielKcal = parseInt(document.querySelector('.ziel-kcal').textContent);
        const weeks = parseInt(document.querySelector('.weeks').textContent);
        const months = parseInt(document.querySelector('.months').textContent);

        // Check for current weight based on the selected calculation type
        const calcType = document.querySelector('input[name="kfa-or-miflin"]:checked').value;
        const currentWeight = calcType === 'miflin'
            ? getSliderValue('wrapper-step-range_slider[fs-rangeslider-element="wrapper-3"]', 'weight-2')
            : getSliderValue('wrapper-step-range_slider[fs-rangeslider-element="wrapper-5"]', 'weight-3-kfa');

        if (currentWeight <= 0) {
            hideAllCTAs(); // Hide CTA if weight is 0
            return;
        }

        const weightLoss = calculateWeightLoss();

        if (zielKcal > 1 && weeks > 1 && months > 1 && weightLoss > 1) {
            let gender = null;
            const radioButtons = document.querySelectorAll('input[name="geschlecht"]');
            radioButtons.forEach(radio => {
                if (radio.checked) {
                    gender = radio.value.toLowerCase();
                }
            });

            if (gender) {
                showCTA(gender, weightLoss);
            }
        } else {
            hideAllCTAs(); // Hide CTA if any of the key values are missing or invalid
        }
    }

    // Function to handle calculation type change and recheck inputs
    function onCalculationTypeChange() {
        console.log('Calculation type changed, checking relevant inputs.');
        // When switching between KFA and Miflin, recheck the inputs
        checkValuesAndDisplay();
    }

    // Function to set up the MutationObserver
    function observeValueChanges() {
        const targetElements = [
            document.querySelector('.ziel-kcal'),
            document.querySelector('.weeks'),
            document.querySelector('.months')
        ];

        const observer = new MutationObserver(() => {
            checkValuesAndDisplay();
        });

        targetElements.forEach(el => {
            observer.observe(el, { childList: true, subtree: true });
        });

        // Add input listener for weight and gender
        const currentWeightInput = document.getElementById('weight-2');
        const weightKfaInput = document.getElementById('weight-3-kfa');

        currentWeightInput.addEventListener('input', checkValuesAndDisplay);
        weightKfaInput.addEventListener('input', checkValuesAndDisplay);

        document.querySelectorAll('input[name="geschlecht"]').forEach(radio => {
            radio.addEventListener('change', checkValuesAndDisplay);
        });

        document.querySelectorAll('input[name="kfa-or-miflin"]').forEach(radio => {
            radio.addEventListener('change', () => {
                onCalculationTypeChange(); // Call this when the calculation type changes
            });
        });
    }

    console.log('DOM fully loaded. Starting observation.');
    observeValueChanges();
});
