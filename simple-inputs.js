document.addEventListener('DOMContentLoaded', function() {
    const numericInputs = document.querySelectorAll('.input-calculator');

    // List of input IDs that should allow commas
    const allowCommaFields = ['wunschgewicht', 'weight-2', 'weight-3-kfa'];

    console.log('Initializing input restrictions...');
    console.log('Allow Comma Fields:', allowCommaFields);

    // Restrict input based on whether commas are allowed
    numericInputs.forEach(input => {
        // Initialize the flag to prevent recursive input events
        input.isProgrammaticChange = false;

        console.log(`Setting up input restrictions for: ${input.id}`);
        if (allowCommaFields.includes(input.id)) {
            console.log(`${input.id} is allowed to have commas and periods.`);

            // Allow numbers, commas, and periods for specific fields
            input.addEventListener('input', () => {
                if (input.isProgrammaticChange) {
                    console.log(`Programmatic change detected on ${input.id}. Skipping input event.`);
                    return;
                }

                console.log(`Input event triggered on ${input.id}. Current value: "${input.value}"`);
                const originalValue = input.value;

                // Replace any character that is not a digit, comma, or period
                let sanitizedValue = input.value.replace(/[^0-9,\.]/g, '')
                                               .replace(/,{2,}/g, ',') // Replace multiple commas with single comma
                                               .replace(/\.{2,}/g, '.') // Replace multiple periods with single period
                                               .replace(/,\./g, '.') // Replace comma followed by period with period
                                               .replace(/\.,/g, ','); // Replace period followed by comma with comma

                // Remove only leading commas or periods
                sanitizedValue = sanitizedValue.replace(/^[,\.]+/g, '');

                if (originalValue !== sanitizedValue) {
                    console.log(`Sanitized value for ${input.id}: "${sanitizedValue}"`);
                    // Update the flag to indicate a programmatic change
                    input.isProgrammaticChange = true;
                    input.value = sanitizedValue;
                    input.isProgrammaticChange = false;
                }

                // Convert commas to periods for processing by the slider
                const valueForSlider = sanitizedValue.replace(/,/g, '.');
                updateRangeSliderPosition(`wrapper-step-range_slider[fs-rangeslider-element="${input.id}"]`, valueForSlider, true);
            });
        } else {
            console.log(`${input.id} is restricted to numbers only.`);

            // Allow only numbers for other fields
            input.addEventListener('input', () => {
                if (input.isProgrammaticChange) {
                    console.log(`Programmatic change detected on ${input.id}. Skipping input event.`);
                    return;
                }

                console.log(`Input event triggered on ${input.id}. Current value: "${input.value}"`);
                const originalValue = input.value;
                const sanitizedValue = input.value.replace(/[^0-9]/g, '');

                if (originalValue !== sanitizedValue) {
                    console.log(`Sanitized value for ${input.id}: "${sanitizedValue}"`);
                    // Update the flag to indicate a programmatic change
                    input.isProgrammaticChange = true;
                    input.value = sanitizedValue;
                    input.isProgrammaticChange = false;
                }

                // Update the slider position even if the input is empty
                updateRangeSliderPosition(`wrapper-step-range_slider[fs-rangeslider-element="${input.id}"]`, sanitizedValue, true);
            });
        }
    });

    // Function to update range slider position and value
    function updateRangeSliderPosition(rangeSliderSelector, value, withTransition) {
        console.log(`Updating range slider position for "${rangeSliderSelector}" with value: ${value}, transition: ${withTransition}`);
        const wrapper = document.querySelector(`.${rangeSliderSelector}`);
        if (!wrapper) {
            console.log(`Wrapper with selector "${rangeSliderSelector}" not found.`);
            return;
        }

        const handle = wrapper.querySelector(".range-slider_handle");
        const fill = wrapper.querySelector(".range-slider_fill");

        const min = parseFloat(wrapper.getAttribute("fs-rangeslider-min"));
        const max = parseFloat(wrapper.getAttribute("fs-rangeslider-max"));

        console.log(`Range slider min: ${min}, max: ${max}`);

        // Replace comma with period and parse the value
        let numericValue = parseFloat(value.replace(',', '.'));
        console.log(`Parsed numeric value: ${numericValue}`);

        if (isNaN(numericValue)) {
            console.log(`Invalid numeric value for "${rangeSliderSelector}": "${value}"`);
            numericValue = min; // Set to minimum value when input is invalid
        }

        // Ensure the value stays within the range
        const adjustedValue = Math.max(min, Math.min(numericValue, max));
        console.log(`Adjusted value within range: ${adjustedValue}`);

        // Calculate percentage relative to the slider's range
        const percentage = ((adjustedValue - min) / (max - min)) * 100;
        console.log(`Calculated percentage: ${percentage}%`);

        // Apply transition if needed
        handle.style.transition = withTransition ? 'left 0.3s ease' : 'none';
        fill.style.transition = withTransition ? 'width 0.3s ease' : 'none';

        // Set handle and fill to a max of 100% and a min of 0%
        const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
        handle.style.left = `${clampedPercentage}%`;
        fill.style.width = `${clampedPercentage}%`;

        console.log(`Set handle left to ${handle.style.left} and fill width to ${fill.style.width}`);
    }

    // Sync input field value with slider handle text
    function setInputValue(rangeSliderSelector, inputId) {
        console.log(`Setting input value for "${inputId}" based on slider "${rangeSliderSelector}"`);
        const handleText = document.querySelector(`.${rangeSliderSelector} .inside-handle-text`);
        if (!handleText) {
            console.log(`Handle text element not found for "${rangeSliderSelector}".`);
            return;
        }

        const inputElement = document.getElementById(inputId);
        if (!inputElement) {
            console.log(`Input element with ID "${inputId}" not found.`);
            return;
        }

        // Use the flag to prevent the 'input' event listener from modifying the value
        inputElement.isProgrammaticChange = true;
        inputElement.value = handleText.textContent;
        console.log(`Updated input "${inputId}" value to "${handleText.textContent}"`);
        inputElement.isProgrammaticChange = false;
        handleInputChange();
    }

    // Update handle text based on input value
    function setHandleText(rangeSliderSelector, inputId) {
        console.log(`Setting handle text for slider "${rangeSliderSelector}" based on input "${inputId}"`);
        const inputElement = document.getElementById(inputId);
        if (!inputElement) {
            console.log(`Input element with ID "${inputId}" not found.`);
            return;
        }

        const inputValue = inputElement.value;
        const handleText = document.querySelector(`.${rangeSliderSelector} .inside-handle-text`);
        if (!handleText) {
            console.log(`Handle text element not found for "${rangeSliderSelector}".`);
            return;
        }

        handleText.textContent = inputValue;
        console.log(`Updated handle text to "${inputValue}"`);
        updateRangeSliderPosition(rangeSliderSelector, inputValue, true);
        handleInputChange();
    }

    // Function to handle input changes
    function handleInputChange() {
        console.log('Handling input changes.');
        // Implement your logic here
    }

    // Function to observe changes and sync input and slider
    function observeChanges(rangeSliderSelector, inputId) {
        console.log(`Setting up MutationObserver for "${inputId}" with slider "${rangeSliderSelector}"`);
        
        const handleTextElement = document.querySelector(`.${rangeSliderSelector} .inside-handle-text`);
        const inputElement = document.getElementById(inputId);

        if (!handleTextElement || !inputElement) {
            console.log(`Handle text element or input element not found for "${rangeSliderSelector}" and "${inputId}".`);
            return;
        }

        const observer = new MutationObserver(() => {
            console.log(`MutationObserver detected a change in "${rangeSliderSelector}".`);

            // Update input value regardless of whether handle text is empty
            if (inputElement.value !== handleTextElement.textContent) {
                inputElement.isProgrammaticChange = true;
                inputElement.value = handleTextElement.textContent;
                inputElement.isProgrammaticChange = false;
                handleInputChange();
            }
        });

        observer.observe(handleTextElement, { childList: true });

        inputElement.addEventListener('input', () => {
            if (inputElement.isProgrammaticChange) {
                console.log(`Programmatic change detected on "${inputId}". Skipping input event.`);
                return;
            }

            console.log(`Input event detected on "${inputId}". Value: "${inputElement.value}"`);
            
            // Allow updating handle text even if the input is empty
            console.log(`Updating handle text for "${rangeSliderSelector}" to "${inputElement.value}"`);
            // Use the flag to prevent recursive input event triggering
            inputElement.isProgrammaticChange = true;
            handleTextElement.textContent = inputElement.value;
            inputElement.isProgrammaticChange = false;
            updateRangeSliderPosition(rangeSliderSelector, inputElement.value, true);
        });
    }

    // Add listeners for slider handle movement
    function addHandleMovementListener(rangeSliderSelector, inputId) {
        console.log(`Adding handle movement listeners for "${rangeSliderSelector}" and input "${inputId}"`);
        const handle = document.querySelector(`.${rangeSliderSelector} .range-slider_handle`);
        const slider = document.querySelector(`.${rangeSliderSelector} .track-range-slider`);

        if (!handle || !slider) {
            console.log(`Handle or slider element not found for "${rangeSliderSelector}".`);
            return;
        }

        handle.addEventListener('mousedown', () => {
            console.log(`Mouse down on handle of "${rangeSliderSelector}".`);
            const inputElement = document.getElementById(inputId);
            if (!inputElement) {
                console.log(`Input element with ID "${inputId}" not found.`);
                return;
            }
            updateRangeSliderPosition(rangeSliderSelector, inputElement.value, false);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        slider.addEventListener('click', (event) => {
            console.log(`Slider "${rangeSliderSelector}" clicked at position: (${event.clientX}, ${event.clientY})`);
            const rect = slider.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const percentage = (offsetX / slider.clientWidth) * 100;

            const wrapper = document.querySelector(`.${rangeSliderSelector}`);
            const min = parseFloat(wrapper.getAttribute("fs-rangeslider-min"));
            const max = parseFloat(wrapper.getAttribute("fs-rangeslider-max"));
            const value = Math.round(min + (percentage / 100) * (max - min));

            console.log(`Calculated value from click: ${value}`);
            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.isProgrammaticChange = true;
                inputElement.value = value;
                inputElement.isProgrammaticChange = false;
                console.log(`Updated input "${inputId}" value to "${value}" from slider click.`);
                setHandleText(rangeSliderSelector, inputId);
            } else {
                console.log(`Input element with ID "${inputId}" not found.`);
            }
        });

        function onMouseMove(event) {
            console.log(`Mouse move detected on "${rangeSliderSelector}".`);
            setInputValue(rangeSliderSelector, inputId);
        }

        function onMouseUp(event) {
            console.log(`Mouse up detected on "${rangeSliderSelector}". Removing mousemove and mouseup listeners.`);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    // Initialize sliders and inputs
    console.log('Initializing range sliders and input synchronization.');

    // Define the range slider selectors and corresponding input IDs
    const slidersAndInputs = [
        { selector: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-5"]', input: 'weight-3-kfa' },
        { selector: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-6"]', input: 'kfa-2' },
        { selector: 'wrapper-step-range_slider', input: 'age-2' },
        { selector: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-2"]', input: 'height-2' },
        { selector: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-3"]', input: 'weight-2' },
        { selector: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-4"]', input: 'steps-4' },
        { selector: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-7"]', input: 'wunschgewicht' }
    ];

    slidersAndInputs.forEach(({ selector, input }) => {
        setInputValue(selector, input);
        addHandleMovementListener(selector, input);
        observeChanges(selector, input);
    });

    console.log('Range sliders and input synchronization setup complete.');
});
