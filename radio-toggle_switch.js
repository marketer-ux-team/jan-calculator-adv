document.addEventListener('DOMContentLoaded', function() {
    const miflinRadio = document.getElementById('miflin');
    const kfaRadio = document.getElementById('kfa');
    const miflinInput = document.getElementById('input-miflin');
    const kfaInput = document.getElementById('input-kfa');

    // Initialize both divs to be hidden
    miflinInput.style.display = 'block';
    kfaInput.style.display = 'none';

    // Add faster transition for showing/hiding
    miflinInput.style.transition = 'opacity 0.1s ease';
    kfaInput.style.transition = 'opacity 0.1s ease';

    // Function to show the correct input block based on the selected radio button
    function toggleInputs() {
        if (miflinRadio.checked) {
            // Show miflin input, hide kfa input
            kfaInput.style.opacity = '0';
            setTimeout(() => {
                kfaInput.style.display = 'none';
                miflinInput.style.display = 'block';
                setTimeout(() => miflinInput.style.opacity = '1', 10); // Small delay to trigger opacity transition
            }, 200); // Reduced delay for faster animation

        } else if (kfaRadio.checked) {
            // Show kfa input, hide miflin input
            miflinInput.style.opacity = '0';
            setTimeout(() => {
                miflinInput.style.display = 'none';
                kfaInput.style.display = 'block';
                setTimeout(() => kfaInput.style.opacity = '1', 10); // Small delay to trigger opacity transition
            }, 200); // Reduced delay for faster animation
        }
    }

    // Event listeners for radio buttons
    miflinRadio.addEventListener('change', toggleInputs);
    kfaRadio.addEventListener('change', toggleInputs);

    // Initialize to show the selected input on page load
    toggleInputs();
});



document.getElementById("popup_kfa").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent default anchor behavior
    console.log("Popup button clicked");

    // Check which gender is selected
    const selectedGender = document.querySelector('input[name="geschlecht"]:checked');
    console.log("Selected gender:", selectedGender ? selectedGender.value : "None");

    if (selectedGender) {
        const genderValue = selectedGender.value.toLowerCase(); // Ensure lowercase comparison

        // Hide all popups first
        document.querySelectorAll('.kfa-mann, .kfa-woman').forEach(popup => {
            popup.style.display = 'none';
            console.log("Hiding popup:", popup.classList);
        });

        // Show the correct popup based on selected gender
        let popupToShow;
        if (genderValue === "mann") {
            popupToShow = document.querySelector('.kfa-mann');
            console.log("Showing male popup");
        } else if (genderValue === "frau") {
            popupToShow = document.querySelector('.kfa-woman');
            console.log("Showing female popup");
        }
        
        if (popupToShow) {
            popupToShow.style.display = 'block';
            // Now, ensure radio buttons inside the popup are selected properly
            const radioButtons = popupToShow.querySelectorAll('input[type="radio"]');
            console.log("Found radio buttons:", radioButtons.length);

            // Add event listener to each radio button
            radioButtons.forEach(radio => {
                console.log("Adding event listener to radio button with value:", radio.value);
                radio.addEventListener("change", function() {
                    const selectedValue = this.value.replace('%', ''); // Remove the % sign
                    console.log("Radio button selected:", selectedValue);

                    // Update input value
                    const inputField = document.getElementById("kfa-2");
                    inputField.value = selectedValue;
                    console.log("Updated KFA input value to:", selectedValue);

                    // Update the slider handle text and position
                    setHandleText('wrapper-step-range_slider[fs-rangeslider-element="wrapper-6"]', 'kfa-2');
                    
                    // Optionally, close the popup after selection
                    popupToShow.style.display = 'none';
                    console.log("Closing popup after selection");
                });
            });
        }

    } else {
        // No gender selected, show a warning message (optional)
        alert("Bitte wähle dein Geschlecht aus");
        console.log("No gender selected");
    }
});

// Function to update range slider position and handle text
function updateRangeSliderPosition(rangeSliderWrapperClass, value, withTransition) {
    const wrapper = document.querySelector(`.${rangeSliderWrapperClass}`);
    const handle = wrapper.querySelector(".range-slider_handle");
    const fill = wrapper.querySelector(".range-slider_fill");

    const min = parseFloat(wrapper.getAttribute("fs-rangeslider-min"));
    const max = parseFloat(wrapper.getAttribute("fs-rangeslider-max"));

    // Ensure the value stays within the range
    value = Math.max(min, Math.min(value, max));

    // Calculate percentage relative to the slider's range
    const percentage = ((value - min) / (max - min)) * 100;

    // Apply transition if needed
    handle.style.transition = withTransition ? 'left 0.2s ease' : 'none';
    fill.style.transition = withTransition ? 'width 0.2s ease' : 'none';

    // Set handle and fill to a max of 100% and a min of 0%
    handle.style.left = `${Math.min(Math.max(percentage, 0), 100)}%`;
    fill.style.width = `${Math.min(Math.max(percentage, 0), 100)}%`;
}

// Function to update the handle text and position
function setHandleText(rangeSliderWrapperClass, inputId) {
    const inputValue = document.getElementById(inputId).value;
    const handleText = document.querySelector(`.${rangeSliderWrapperClass} .inside-handle-text`);
    handleText.textContent = inputValue;
    updateRangeSliderPosition(rangeSliderWrapperClass, inputValue, true);
}

// Close popup when .exit-intent-popup-close is clicked
document.querySelectorAll('.exit-intent-popup-close').forEach(closeButton => {
    closeButton.addEventListener("click", function() {
        console.log("Exit popup close button clicked");
        document.querySelectorAll('.kfa-mann, .kfa-woman').forEach(popup => {
            popup.style.display = 'none';
            console.log("Popup closed");
        });
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





