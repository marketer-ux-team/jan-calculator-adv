document.addEventListener('DOMContentLoaded', function() {
    const numericInputs = document.querySelectorAll('.input-calculator');

    // List of input IDs that should allow commas
    const allowCommaFields = ['wunschgewicht', 'weight-2', 'weight-3-kfa'];

    console.log('Initializing input restrictions...');
    console.log('Allow Comma Fields:', allowCommaFields);

    // Restrict input based on whether commas are allowed
    // Debounce function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Restrict input based on whether commas are allowed
numericInputs.forEach(input => {
    // Initialize the flag to prevent recursive input events
    input.isProgrammaticChange = false;

    console.log(`Setting up input restrictions for: ${input.id}`);
    if (allowCommaFields.includes(input.id)) {
        console.log(`${input.id} is allowed to have commas and periods.`);

        // Allow numbers, commas, and periods for specific fields
        input.addEventListener('input', debounce(() => {
            if (input.isProgrammaticChange) return;

            console.log(`Input event triggered on ${input.id}. Current value: "${input.value}"`);
            const originalValue = input.value;

            // Replace any character that is not a digit, comma, or period
            let sanitizedValue = originalValue.replace(/[^0-9,\.]/g, '')
                                              .replace(/,{2,}/g, ',')  // Replace multiple commas with a single comma
                                              .replace(/\.{2,}/g, '.') // Replace multiple periods with a single period
                                              .replace(/,\./g, '.')    // Replace comma followed by period with period
                                              .replace(/\.,/g, ',');    // Replace period followed by comma with comma

            // Remove leading commas or periods
            sanitizedValue = sanitizedValue.replace(/^[,\.]+/g, '');

            if (originalValue !== sanitizedValue) {
                console.log(`Sanitized value for ${input.id}: "${sanitizedValue}"`);
                input.isProgrammaticChange = true;
                input.value = sanitizedValue;
                input.isProgrammaticChange = false;
            }

            // Convert commas to periods for slider processing
            const valueForSlider = sanitizedValue.replace(/,/g, '.');
            updateRangeSliderPosition(`wrapper-step-range_slider[fs-rangeslider-element="${input.id}"]`, valueForSlider, true);
        }, 300)); // Debounce with a 300ms delay

        // Keydown event for handling input restrictions
        input.addEventListener('keydown', (event) => {
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'];
            if (allowedKeys.includes(event.key) || (['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()) && (event.ctrlKey || event.metaKey))) {
                return; // Allow common control keys
            }

            // Prevent multiple commas or periods
            if ((event.key === ',' && input.value.includes(',')) || (event.key === '.' && input.value.includes('.'))) {
                event.preventDefault();
                return;
            }

            // Allow only numbers, commas, or periods
            const isNumberKey = (!event.shiftKey && ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105))); // Numeric keys
            if (!isNumberKey && event.key !== ',' && event.key !== '.') {
                event.preventDefault();
            }
        });

    } else {
        console.log(`${input.id} is restricted to numbers only.`);

        // Allow only numbers for other fields
        input.addEventListener('input', debounce(() => {
            if (input.isProgrammaticChange) return;

            console.log(`Input event triggered on ${input.id}. Current value: "${input.value}"`);
            const originalValue = input.value;
            const sanitizedValue = originalValue.replace(/[^0-9]/g, '');

            if (originalValue !== sanitizedValue) {
                console.log(`Sanitized value for ${input.id}: "${sanitizedValue}"`);
                input.isProgrammaticChange = true;
                input.value = sanitizedValue;
                input.isProgrammaticChange = false;
            }
        }, 300)); // Debounce with a 300ms delay

        // Keydown event for handling numeric input
        input.addEventListener('keydown', (event) => {
            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'];
            if (allowedKeys.includes(event.key) || (['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()) && (event.ctrlKey || event.metaKey))) {
                return; // Allow control keys
            }

            // Allow only numbers
            const isNumberKey = (!event.shiftKey && ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)));
            if (!isNumberKey) {
                event.preventDefault();
            }
        });
    }
});


    // Function to update range slider position and value for weight and KFA
    function updateRangeSliderPosition(rangeSliderWrapperClass, value, withTransition) {
        console.log(`Updating range slider position for "${rangeSliderWrapperClass}" with value: ${value}, transition: ${withTransition}`);
        const wrapper = document.querySelector(`.${rangeSliderWrapperClass}`);
        if (!wrapper) {
            console.log(`Wrapper with class "${rangeSliderWrapperClass}" not found.`);
            return;
        }

        const handle = wrapper.querySelector(".range-slider_handle");
        const fill = wrapper.querySelector(".range-slider_fill");

        const min = parseFloat(wrapper.getAttribute("fs-rangeslider-min"));
        const max = parseFloat(wrapper.getAttribute("fs-rangeslider-max"));

        console.log(`Range slider min: ${min}, max: ${max}`);

        let stepSize = 1;
        if (wrapper.getAttribute("fs-rangeslider-element") === 'wrapper-4') {
            const totalSteps = 500;
            stepSize = (max - min) / totalSteps;
            console.log(`Special case for "wrapper-4": Total steps = ${totalSteps}, step size = ${stepSize}`);
        } else {
            console.log(`Normal step size of 1 applied.`);
        }

        // Remove commas and periods for numerical processing
        const numericValue = parseFloat(value.replace(/,/g, '.'));
        console.log(`Parsed numeric value: ${numericValue}`);

        if (isNaN(numericValue)) {
            console.log(`Invalid numeric value for "${rangeSliderWrapperClass}": "${value}"`);
            return;
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


    // Sync input field value with slider handle text for weight and KFA
    function setInputValue(rangeSliderWrapperClass, inputId) {
        console.log(`Setting input value for "${inputId}" based on slider "${rangeSliderWrapperClass}"`);
        const handleText = document.querySelector(`.${rangeSliderWrapperClass} .inside-handle-text`);
        if (!handleText) {
            console.log(`Handle text element not found for "${rangeSliderWrapperClass}".`);
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

    // Update handle text based on input value for weight and KFA
    function setHandleText(rangeSliderWrapperClass, inputId) {
        console.log(`Setting handle text for slider "${rangeSliderWrapperClass}" based on input "${inputId}"`);
        const inputElement = document.getElementById(inputId);
        if (!inputElement) {
            console.log(`Input element with ID "${inputId}" not found.`);
            return;
        }

        const inputValue = inputElement.value;
        const handleText = document.querySelector(`.${rangeSliderWrapperClass} .inside-handle-text`);
        if (!handleText) {
            console.log(`Handle text element not found for "${rangeSliderWrapperClass}".`);
            return;
        }

        handleText.textContent = inputValue;
        console.log(`Updated handle text to "${inputValue}"`);
        updateRangeSliderPosition(rangeSliderWrapperClass, inputValue, true);
        handleInputChange();
    }

    // Function to handle input changes for weight and KFA
    function handleInputChange() {
        console.log('Handling input changes for weight and KFA.');
        const weight = document.getElementById("weight-3-kfa") ? document.getElementById("weight-3-kfa").value : 'N/A';
        const kfa = document.getElementById("kfa-2") ? document.getElementById("kfa-2").value : 'N/A';
        console.log(`Current weight-3-kfa: "${weight}", kfa-2: "${kfa}"`);
        // Additional logic can be added here as needed
    }

// Function to handle input changes and slider sync for weight and KFA
// Function to handle input changes and slider sync for weight and KFA
function observeChanges(rangeSliderWrapperClass, inputId) {
    console.log(`Setting up MutationObserver for "${inputId}" with slider "${rangeSliderWrapperClass}"`);
    
    const handleTextElement = document.querySelector(`.${rangeSliderWrapperClass} .inside-handle-text`);
    const inputElement = document.getElementById(inputId);

    if (!handleTextElement || !inputElement) {
        console.log(`Handle text element or input element not found for "${rangeSliderWrapperClass}" and "${inputId}".`);
        return;
    }

    const observer = new MutationObserver(() => {
        console.log(`MutationObserver detected a change in "${rangeSliderWrapperClass}".`);

        // Only update input if handle text is not empty, not "0", and if the user has interacted
        if (handleTextElement.textContent !== "" && handleTextElement.textContent !== "0" && inputElement.value !== handleTextElement.textContent) {
            if (inputElement.value === "") {
                console.log(`Skipping update because input "${inputId}" is still empty.`);
                return;
            }
            console.log(`Updating input "${inputId}" value from "${inputElement.value}" to "${handleTextElement.textContent}"`);
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
        
        // Do not update handle text if the input is empty
        if (inputElement.value.trim() === "") {
            console.log(`Input is empty for "${inputId}". No changes made.`);
            return;
        }

        if (inputElement.value !== handleTextElement.textContent) {
            console.log(`Updating handle text for "${rangeSliderWrapperClass}" to "${inputElement.value}"`);
            // Use the flag to prevent recursive input event triggering
            inputElement.isProgrammaticChange = true;
            handleTextElement.textContent = inputElement.value;
            inputElement.isProgrammaticChange = false;
            updateRangeSliderPosition(rangeSliderWrapperClass, inputElement.value, true);
        }
    });
}

// Initialization of range sliders and input synchronization
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
        }
    });

    // Initialize values and add listeners for weight and KFA
    console.log('Initializing range sliders and input synchronization.');

    // Define the range slider wrappers and corresponding input IDs
    const slidersAndInputs = [
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-5"]', input: 'weight-3-kfa' },
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-6"]', input: 'kfa-2' },
        { wrapper: 'wrapper-step-range_slider', input: 'age-2' },
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-2"]', input: 'height-2' },
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-3"]', input: 'weight-2' },
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-4"]', input: 'steps-4' },
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-7"]', input: 'wunschgewicht' }
    ];

    slidersAndInputs.forEach(({ wrapper, input }) => {
        observeChanges(wrapper, input);
    });

    console.log('Range sliders and input synchronization setup complete.');
});



    // Add listeners for slider handle movement for weight and KFA
    function addHandleMovementListener(rangeSliderWrapperClass, inputId) {
        console.log(`Adding handle movement listeners for "${rangeSliderWrapperClass}" and input "${inputId}"`);
        const handle = document.querySelector(`.${rangeSliderWrapperClass} .range-slider_handle`);
        const slider = document.querySelector(`.${rangeSliderWrapperClass} .track-range-slider`);

        if (!handle || !slider) {
            console.log(`Handle or slider element not found for "${rangeSliderWrapperClass}".`);
            return;
        }

        handle.addEventListener('mousedown', () => {
            console.log(`Mouse down on handle of "${rangeSliderWrapperClass}".`);
            const inputElement = document.getElementById(inputId);
            if (!inputElement) {
                console.log(`Input element with ID "${inputId}" not found.`);
                return;
            }
            updateRangeSliderPosition(rangeSliderWrapperClass, inputElement.value, false);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        slider.addEventListener('click', (event) => {
            console.log(`Slider "${rangeSliderWrapperClass}" clicked at position: (${event.clientX}, ${event.clientY})`);
            const rect = slider.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const percentage = (offsetX / slider.clientWidth) * 100;

            const wrapper = document.querySelector(`.${rangeSliderWrapperClass}`);
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
                setHandleText(rangeSliderWrapperClass, inputId);
            } else {
                console.log(`Input element with ID "${inputId}" not found.`);
            }
        });

        function onMouseMove(event) {
            console.log(`Mouse move detected on "${rangeSliderWrapperClass}".`);
            setInputValue(rangeSliderWrapperClass, inputId);
        }

        function onMouseUp(event) {
            console.log(`Mouse up detected on "${rangeSliderWrapperClass}". Removing mousemove and mouseup listeners.`);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    // Initialize values and add listeners for weight and KFA
    console.log('Initializing range sliders and input synchronization.');

    // Define the range slider wrappers and corresponding input IDs
    const slidersAndInputs = [
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-5"]', input: 'weight-3-kfa' },
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-6"]', input: 'kfa-2' },
        { wrapper: 'wrapper-step-range_slider', input: 'age-2' },
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-2"]', input: 'height-2' },
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-3"]', input: 'weight-2' },
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-4"]', input: 'steps-4' }, // New steps slider
        { wrapper: 'wrapper-step-range_slider[fs-rangeslider-element="wrapper-7"]', input: 'wunschgewicht' } // New steps slider

    ];

    slidersAndInputs.forEach(({ wrapper, input }) => {
        setInputValue(wrapper, input);
        addHandleMovementListener(wrapper, input);
        observeChanges(wrapper, input);
    });

    console.log('Range sliders and input synchronization setup complete.');
});

// Additional DOMContentLoaded listener for buttons
document.addEventListener("DOMContentLoaded", function() {
    console.log('Setting up button click listeners...');
    // Function to look for elements until they are found
    function waitForElement(selector, callback) {
        const elements = document.querySelectorAll(selector);
        if (elements.length) {
            console.log(`Elements found for selector "${selector}".`);
            callback(elements); // Run the callback once the elements are found
        } else {
            console.log(`Elements not found for selector "${selector}". Waiting...`);
            requestAnimationFrame(() => waitForElement(selector, callback)); // Keep checking
        }
    }

    // Use the function to wait for the buttons to be present in the DOM
    waitForElement('.woman-button', function(buttons) {
        console.log(`Found ${buttons.length} ".woman-button" elements.`);
        // Add click event listener to each button
        buttons.forEach(function(button, index) {
            console.log(`Adding click listener to button ${index + 1}.`);
            button.addEventListener('click', function() {
                console.log(`Button ${index + 1} clicked. Toggling 'active' class.`);
                // Remove 'active' class from all buttons
                buttons.forEach(btn => btn.classList.remove('active'));
                // Add 'active' class to the clicked button
                this.classList.add('active');
                console.log(`Button ${index + 1} is now active.`);
            });
        });
    });
});

// Additional DOMContentLoaded listener for dropdowns
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up dropdown toggle functionality...');
    const addMoreLink = document.querySelector('.link-more_training');
    const dropDown2 = document.getElementById('drop-down-2-wrapper');
    const dropDown3 = document.getElementById('drop-down-3-wrapper');

    if (!addMoreLink || !dropDown2 || !dropDown3) {
        console.log('One or more dropdown elements not found. Aborting dropdown setup.');
        return;
    }

    // Initially hide dropdowns 2 and 3
    dropDown2.style.display = 'none';
    dropDown3.style.display = 'none';
    console.log('Initially hid dropDown2 and dropDown3.');

    // Smooth transition
    dropDown2.style.transition = 'opacity 0.5s ease, height 0.5s ease';
    dropDown3.style.transition = 'opacity 0.5s ease, height 0.5s ease';
    console.log('Applied transition styles to dropDown2 and dropDown3.');

    // Handler for clicking "Weitere hinzufügen"
    addMoreLink.addEventListener('click', function(event) {
        console.log('"Weitere hinzufügen" link clicked.');
        event.preventDefault(); // Prevent default link behavior

        if (dropDown2.style.display === 'none') {
            dropDown2.style.display = 'flex'; // Show second dropdown
            dropDown2.style.opacity = 1; // Add transition
            console.log('Displayed dropDown2.');
        } else if (dropDown3.style.display === 'none') {
            dropDown3.style.display = 'flex'; // Show third dropdown
            dropDown3.style.opacity = 1; // Add transition
            addMoreLink.style.display = 'none'; // Hide the link after the third dropdown is shown
            console.log('Displayed dropDown3 and hid the "Weitere hinzufügen" link.');
        }
    });
});

// Radio Button Handler
document.body.addEventListener('click', function(event) {
    console.log('Body click event detected.');
    const wrapper = event.target.closest('.radio-field_wrapper');
    if (wrapper) {
        console.log('Radio field wrapper clicked:', wrapper);
        const block = wrapper.closest('.radios-abnehmziel');
        if (block) {
            console.log('Found parent block ".radios-abnehmziel".');
            const wrappers = block.querySelectorAll('.radio-field_wrapper');
            wrappers.forEach(wrap => {
                console.log(`Resetting radio wrapper: ${wrap}`);
                resetRadio(wrap);
            });

            // Add 'checked' class to the clicked wrapper and change SVG fill to white
            setRadio(wrapper, true);
        }
    }
});

function resetRadio(wrapper) {
    console.log('Resetting radio:', wrapper);
    wrapper.classList.remove('checked');
    const paths = wrapper.querySelectorAll('.ms-tooltip svg path');
    paths.forEach(path => {
        path.setAttribute('fill', '#303030'); // Reset fill to original color
        console.log('Reset SVG path fill to #303030.');
    });
}

function setRadio(wrapper, isChecked) {
    if (isChecked) {
        console.log('Setting radio as checked:', wrapper);
        wrapper.classList.add('checked');
        const paths = wrapper.querySelectorAll('.ms-tooltip svg path');
        paths.forEach(path => {
            path.setAttribute('fill', 'white'); // Set the SVG path color to white when checked
            console.log('Set SVG path fill to white.');
        });
    }
}


document.addEventListener('DOMContentLoaded', function () {
    // Select all elements with the class 'woman-button'
    const womanButtons = document.querySelectorAll('.radio-button-man');

    // Iterate over each element and apply the inline style for the pointer cursor
    womanButtons.forEach(button => {
        button.style.cursor = 'pointer';
    });

    console.log('Pointer cursor added to woman buttons.');
});


