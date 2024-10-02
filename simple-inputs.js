document.addEventListener('DOMContentLoaded', function() {
    const numericInputs = document.querySelectorAll('.input-calculator');

    // List of input IDs that should allow commas
    const allowCommaFields = ['wunschgewicht', 'weight-2', 'weight-3-kfa'];

    // Restrict input based on whether commas are allowed
    numericInputs.forEach(input => {
        // Initialize the flag to prevent recursive input events
        input.isProgrammaticChange = false;

        if (allowCommaFields.includes(input.id)) {
            // Allow numbers, commas, and periods for specific fields
            input.addEventListener('input', () => {
                if (input.isProgrammaticChange) return;

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
            // Allow only numbers for other fields
            input.addEventListener('input', () => {
                if (input.isProgrammaticChange) return;

                const originalValue = input.value;
                const sanitizedValue = input.value.replace(/[^0-9]/g, '');

                if (originalValue !== sanitizedValue) {
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
        const wrapper = document.querySelector(`.${rangeSliderSelector}`);
        if (!wrapper) return;

        const handle = wrapper.querySelector(".range-slider_handle");
        const fill = wrapper.querySelector(".range-slider_fill");

        const min = parseFloat(wrapper.getAttribute("fs-rangeslider-min"));
        const max = parseFloat(wrapper.getAttribute("fs-rangeslider-max"));

        // Replace comma with period and parse the value
        let numericValue = parseFloat(value.replace(',', '.'));

        if (isNaN(numericValue)) {
            numericValue = min; // Set to minimum value when input is invalid
        }

        // Ensure the value stays within the range
        const adjustedValue = Math.max(min, Math.min(numericValue, max));

        // Calculate percentage relative to the slider's range
        const percentage = ((adjustedValue - min) / (max - min)) * 100;

        // Apply transition if needed
        if (withTransition) {
            handle.style.transition = 'left 0.3s ease';
            fill.style.transition = 'width 0.3s ease';
        } else {
            handle.style.transition = 'none';
            fill.style.transition = 'none';
        }

        // Set handle and fill to a max of 100% and a min of 0%
        const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
        handle.style.left = `${clampedPercentage}%`;
        fill.style.width = `${clampedPercentage}%`;
    }

    // Sync input field value with slider handle text
    function setInputValue(rangeSliderSelector, inputId) {
        const handleText = document.querySelector(`.${rangeSliderSelector} .inside-handle-text`);
        if (!handleText) return;

        const inputElement = document.getElementById(inputId);
        if (!inputElement) return;

        // Use the flag to prevent the 'input' event listener from modifying the value
        inputElement.isProgrammaticChange = true;
        inputElement.value = handleText.textContent;
        inputElement.isProgrammaticChange = false;
        handleInputChange();
    }

    // Update handle text based on input value
    function setHandleText(rangeSliderSelector, inputId, withTransition) {
        const inputElement = document.getElementById(inputId);
        if (!inputElement) return;

        const inputValue = inputElement.value;
        const handleText = document.querySelector(`.${rangeSliderSelector} .inside-handle-text`);
        if (!handleText) return;

        handleText.textContent = inputValue;
        updateRangeSliderPosition(rangeSliderSelector, inputValue, withTransition);
        handleInputChange();
    }

    // Function to handle input changes
    function handleInputChange() {
        // Implement your logic here, e.g., calculate BMI or update other UI elements
    }

    // Function to observe changes and sync input and slider
    function observeChanges(rangeSliderSelector, inputId) {
        const handleTextElement = document.querySelector(`.${rangeSliderSelector} .inside-handle-text`);
        const inputElement = document.getElementById(inputId);

        if (!handleTextElement || !inputElement) return;

        const observer = new MutationObserver(() => {
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
            if (inputElement.isProgrammaticChange) return;

            // Allow updating handle text even if the input is empty
            // Use the flag to prevent recursive input event triggering
            inputElement.isProgrammaticChange = true;
            handleTextElement.textContent = inputElement.value;
            inputElement.isProgrammaticChange = false;
            updateRangeSliderPosition(rangeSliderSelector, inputElement.value, true);
        });
    }

    // Add listeners for slider handle movement, including touch events
    function addHandleMovementListener(rangeSliderSelector, inputId) {
        const handle = document.querySelector(`.${rangeSliderSelector} .range-slider_handle`);
        const slider = document.querySelector(`.${rangeSliderSelector} .track-range-slider`);

        if (!handle || !slider) return;

        // Variables to track dragging state
        let isDragging = false;

        // Handle both mouse and touch events for the handle
        handle.addEventListener('mousedown', startHandleMovement);
        handle.addEventListener('touchstart', startHandleMovement, { passive: false });

        function startHandleMovement(event) {
            event.preventDefault(); // Prevent default touch scrolling behavior
            isDragging = true;

            document.addEventListener('mousemove', onHandleMove);
            document.addEventListener('touchmove', onHandleMove, { passive: false });
            document.addEventListener('mouseup', endHandleMovement);
            document.addEventListener('touchend', endHandleMovement);
        }

        function onHandleMove(event) {
            if (!isDragging) return;
            event.preventDefault(); // Prevent default touch scrolling behavior

            // Determine the current position based on touch or mouse event
            let clientX;
            if (event.touches) {
                clientX = event.touches[0].clientX;
            } else {
                clientX = event.clientX;
            }

            const rect = slider.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const percentage = (offsetX / slider.clientWidth) * 100;

            const wrapper = document.querySelector(`.${rangeSliderSelector}`);
            const min = parseFloat(wrapper.getAttribute("fs-rangeslider-min"));
            const max = parseFloat(wrapper.getAttribute("fs-rangeslider-max"));
            const value = Math.round(min + (percentage / 100) * (max - min));

            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.isProgrammaticChange = true;
                inputElement.value = value;
                inputElement.isProgrammaticChange = false;

                // Use requestAnimationFrame for smoother updates
                requestAnimationFrame(() => {
                    setHandleText(rangeSliderSelector, inputId, false); // Disable transition during drag
                });
            }
        }

        function endHandleMovement() {
            isDragging = false;
            document.removeEventListener('mousemove', onHandleMove);
            document.removeEventListener('touchmove', onHandleMove);
            document.removeEventListener('mouseup', endHandleMovement);
            document.removeEventListener('touchend', endHandleMovement);
        }

        // Handle slider clicks for both mouse and touch events
        slider.addEventListener('click', onSliderClick);
        slider.addEventListener('touchstart', onSliderClick, { passive: false });

        function onSliderClick(event) {
            event.preventDefault();

            let clientX;
            if (event.touches) {
                clientX = event.touches[0].clientX;
            } else {
                clientX = event.clientX;
            }

            const rect = slider.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const percentage = (offsetX / slider.clientWidth) * 100;

            const wrapper = document.querySelector(`.${rangeSliderSelector}`);
            const min = parseFloat(wrapper.getAttribute("fs-rangeslider-min"));
            const max = parseFloat(wrapper.getAttribute("fs-rangeslider-max"));
            const value = Math.round(min + (percentage / 100) * (max - min));

            const inputElement = document.getElementById(inputId);
            if (inputElement) {
                inputElement.isProgrammaticChange = true;
                inputElement.value = value;
                inputElement.isProgrammaticChange = false;
                setHandleText(rangeSliderSelector, inputId, true); // Enable transition for click events
            }
        }
    }

    // Initialize sliders and inputs
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
        // Set handle text to empty string
        const handleText = document.querySelector(`.${selector} .inside-handle-text`);
        if (handleText) {
            handleText.textContent = '';
        }

        // Set handle position to minimum value
        const wrapper = document.querySelector(`.${selector}`);
        if (wrapper) {
            const handle = wrapper.querySelector(".range-slider_handle");
            const fill = wrapper.querySelector(".range-slider_fill");
            handle.style.left = `0%`;
            fill.style.width = `0%`;
        }

        // Now add event listeners
        addHandleMovementListener(selector, input);
        observeChanges(selector, input);
    });
});
