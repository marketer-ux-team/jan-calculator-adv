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
