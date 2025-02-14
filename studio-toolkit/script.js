//turn DEBUG_MODE to TRUE to access a custom-built console.log
//use showDebugModal("text message like this")
//logs will append until panel reset
const DEBUG_MODE = false;

const VERSION = "version 1.0"; //Current version of the panel

// Debugging Variables
let messageQueue = []; // Tracks queued debug messages
let totalMessages = 0; // Total number of messages in the queue
let isModalVisible = false; // Tracks visibility of the debug modal

/**
 * Toggles the visibility of the debug icon in the UI.
 * - If DEBUG_MODE is true, the icon will be shown.
 * - If DEBUG_MODE is false, the icon will be hidden.
 */
function toggleDebugIcon() {
    const debugIcon = document.getElementById("bug-btn"); // Locate the debug icon by ID
    if (DEBUG_MODE) {
        debugIcon.style.display = "block"; // Show the icon
    } else {
        debugIcon.style.display = "none"; // Hide the icon
    }
}

/**
 * Scrolls the panel to the top by focusing on the top-anchor element.
 */
function scrollToTop() {
    const topAnchor = document.getElementById("top-anchor"); // Locate the top-anchor element
    topAnchor.focus(); // Bring the anchor into focus to force scrolling
}

/**
 * Plays a short error sound using the Web Audio API.
 * - The sound is generated using an oscillator with a triangle wave.
 * - Frequency: 660 Hz, Duration: 0.25 seconds.
 */
function playErrorSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Create an audio context
    const gainNode = audioContext.createGain(); // Control the volume

    const oscillator = audioContext.createOscillator(); // Generate sound waves
    oscillator.type = 'triangle'; // Set wave type to triangle for a simple sound
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime); // Set the frequency to 660 Hz
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Set the volume to 30%

    oscillator.connect(gainNode).connect(audioContext.destination); // Route the sound to the speakers
    oscillator.start(audioContext.currentTime); // Start the oscillator
    oscillator.stop(audioContext.currentTime + 0.25); // Stop after 0.25 seconds
}

/**
 * Retrieves all tab buttons in the panel.
 */
function getTabButtons() {
    return document.querySelectorAll('.tab-button'); // Select all elements with the "tab-button" HTML class
    }

/**
 * Initializes event listeners for all tab buttons to handle toggling visibility.
 * - Ensures all tabs are collapsed initially.
 * - Adds click events to toggle the visibility of corresponding tab content.
 */
function initializeTabListeners() {
    const tabButtons = document.querySelectorAll(".tab-button"); // Select all tab buttons
    const tabContents = document.querySelectorAll(".tab-content"); // Select all tab contents

    // Step 1: Collapse all tab contents initially
    tabContents.forEach((content) => {
        content.style.display = "none"; // Ensure all tab contents are hidden
    });

    // Step 2: Attach event listeners to toggle visibility
    tabButtons.forEach((button) => {
        const tabId = button.getAttribute("data-tab"); // Get the associated tab ID
        const tabContent = document.querySelector(`#${tabId}`); // Find the corresponding tab content

        if (tabContent) {
            // Step 2.1: Initialize tabs as collapsed
            tabContent.style.display = "none"; // Ensure tab content starts as hidden

            // Step 2.2: Add event listener for toggling visibility
            button.addEventListener("click", () => {
                const isVisible = tabContent.style.display === "block"; // Check current visibility
                tabContent.style.display = isVisible ? "none" : "block"; // Toggle visibility

                    // Toggle caret
                    const caret = button.querySelector(".caret");
                    if (caret) {
                        caret.textContent = isVisible ? "▶" : "▼"}
            });
        }
    });
}

/**Prettifies the script names if they don't exist in the descriptions.json file */
function prettifyFilename(filename) {
    return filename
        .replace(/-/g, " ")
        .replace(/_/g, " ")
        .replace(/\.jsx$/, "")
        .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Dynamically updates the tabs and their contents based on the saved directory.
 * - Removes existing tabs and contents (excluding the favourites tab).
 * - Fetches subfolders and creates a tab for each.
 * - Fetches script files within each subfolder and creates buttons with favourite toggling.
 * 
 * @param {string} savedDirectory - The path to the directory being used to populate the tabs.
 */
let friendlyNameMapping = {}; // Declare a global variable to hold the mapping

function updateTabs(savedDirectory) {
    const tabsContainer = document.querySelector("#tabs"); // Container for tab buttons
    const tabsContent = document.querySelector("#tab-contents"); // Container for tab contents

    // Step 1: Remove old tabs and contents
    tabsContainer.querySelectorAll(".tab-button:not(#favourites-tab)").forEach((tab) => tab.remove());
    tabsContent.querySelectorAll(".tab-content:not(#favourites)").forEach((content) => content.remove());

    // Explicitly clear out tab content
    tabsContainer.innerHTML = "";
    tabsContent.innerHTML = "";

    // Step 2: Handle missing directory
    if (!savedDirectory) {
        tabsContainer.innerHTML = `
            <div class="empty-folder-message">
                Set your scripts folder in the settings to display tabs.
            </div>`;
        return;
    }

    // Load Prettify JSON
    const jsonFilePath = `${savedDirectory}/descriptions.json`.replace(/\\/g, "\\\\"); // Path to JSON file
    new CSInterface().evalScript(
        `readJSONFile("${jsonFilePath}")`, // Call the ExtendScript function to read the file
        (result) => {
            try {
                friendlyNameMapping = JSON.parse(result); // Parse and store the mapping globally
                console.log("Friendly Name Mapping Loaded:", friendlyNameMapping);
            } catch (error) {
                console.warn("Invalid descriptions.json format. Falling back to prettified names.");
                friendlyNameMapping = {}; // Reset mapping if JSON is invalid
            }

            // After loading the mapping, proceed with the rest of updateTabs()
            fetchSubfolders(savedDirectory);
        }
    );

    // Step 3: Fetch subfolder names
    function fetchSubfolders(savedDirectory) {
        new CSInterface().evalScript(
            `getSubfolderNames("${savedDirectory.replace(/\\/g, "\\\\")}")`,
            (result) => {
                const subfolders = JSON.parse(result).map((folder) => decodeURIComponent(folder)); // Decode folder names

                // Filter out unwanted folders
                const filteredSubfolders = subfolders.filter((folder) => {
                    return !(
                        folder.startsWith(".") || // Exclude hidden/system folders
                        (folder.startsWith("[") && folder.endsWith("]")) // Exclude user-defined folders
                    );
                });

                    // Step 3: Dynamically create tabs for each subfolder
                    filteredSubfolders.forEach((folder, index) => {
                    const tabId = `tab${index + 1}`;
                    const folderPath = `${savedDirectory}/${folder}`;

                    // Create the tab button
                    const tabButton = document.createElement("button");
                    tabButton.className = "tab-button";
                    tabButton.setAttribute("data-tab", tabId);
                    tabButton.textContent = folder;
                    tabsContainer.insertBefore(tabButton, document.querySelector("#favourites-tab"));
                    const caretSpan = document.createElement("span");
                    caretSpan.className = "caret";
                    caretSpan.textContent = "▶"; // Default collapsed state
                    tabButton.prepend(caretSpan); // Add the caret to the button

                    // Create the tab content container
                    const tabContent = document.createElement("div");
                    tabContent.className = "tab-content";
                    tabContent.id = tabId;

                    // Step 4: Fetch and create buttons for script files
                    new CSInterface().evalScript(
                        `getPlaceholderFiles("${folderPath.replace(/\\/g, "\\\\")}")`,
                        (filesResult) => {
                            if (filesResult && filesResult !== "[]") {
                                try {
                                const files = filesResult
                                    .slice(1, -1) // Remove square brackets
                                    .split(",") // Split into individual file entries
                                    .map((file) => decodeURIComponent(file.trim().replace(/^"|"$|'/g, "")));

                                // Create a button for each script file
                                files.forEach((file) => {
                                    const filename = file.split("/").pop(); // Extract the actual filename
                                    const friendlyName = friendlyNameMapping[filename] || prettifyFilename(filename); // Get the friendly name to display

                                    // Create the script button
                                    const fileButton = document.createElement("button");
                                    fileButton.className = "tab-content-button";
                                    fileButton.textContent = friendlyName; // Set the friendly name as the button text
                                    fileButton.setAttribute("data-filename", filename); // Store the real filename

                                    // Add click event
                                    fileButton.addEventListener("click", () => {
                                        const scriptName = fileButton.getAttribute("data-filename"); // Get the real filename
                                        const fullPath = `${folderPath}/${scriptName}`.replace(/\\/g, "\\\\");
                                        new CSInterface().evalScript(`$.evalFile("${fullPath}")`, (result) => {
                                            console.log(result || "Script executed successfully.");
                                        });
                                    });

                                        
                                    // Create favourite SVG icon
                                    const favIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                                    favIcon.classList.add("non-fav-icon");

                                    const useElement = document.createElementNS("http://www.w3.org/2000/svg", "use");
                                    useElement.setAttribute("href", "#non-fav-icon");
                                    favIcon.appendChild(useElement);

                                        // Add click event to toggle favourite state
                                        favIcon.addEventListener("click", () => {
                                            const isFav = useElement.getAttribute("href") === "#fav-icon";
                                            //const scriptName = fileButton.textContent;
                                            const filename = fileButton.getAttribute("data-filename") || fileButton.textContent; // Store actual filename, fallback to text if needed

                                            // Toggle favourite state
                                            useElement.setAttribute("href", isFav ? "#non-fav-icon" : "#fav-icon");
                                            favIcon.classList.toggle("fav-icon", !isFav);
                                            favIcon.classList.toggle("non-fav-icon", isFav);

                                        // Update favourites in localStorage
                                        let favourites = (localStorage.getItem("favourites") || "")
                                        .split(",")
                                        .filter((item) => item);

                                        if (!isFav) {
                                                favourites.push(filename);
                                        } else {
                                                favourites = favourites.filter((fav) => fav !== filename);
                                        }

                                        localStorage.setItem("favourites", favourites.join(","));
                                            updateFavouritesTab(); // Refresh the favourites tab
                                    });

                                    // Wrap button and icon in a container
                                    const wrapper = document.createElement("div");
                                    wrapper.className = "file-button-wrapper";
                                    wrapper.appendChild(fileButton);
                                    wrapper.appendChild(favIcon);
                                    tabContent.appendChild(wrapper);
                                });
                                } catch (error) {
                                    console.error("Error processing files:", error);
                                }
                            } else {
                                tabContent.textContent = "No files found in this folder.";
                            }
                        }
                    );

                    tabButton.after(tabContent); // Append the content after the tab button
                });
                

                // Step 5: Reapply event listeners and refresh tabs
                initializeTabListeners();
                updateFavouritesTab();
            }
        );
}
}

/**
 * Updates the favourites tab by dynamically populating its contents.
 * - Clears the previous contents of the favourites tab.
 * - Retrieves, sorts, and displays all favourites from localStorage.
 * - Adds functionality to toggle favourite status.
 */
function updateFavouritesTab() {

    const favouritesContainer = document.querySelector(".favourites-contents"); // Locate the favourites container
    favouritesContainer.innerHTML = ""; // Clear previous contents

    // Retrieve raw favourites from localStorage
    const rawFavourites = localStorage.getItem("favourites") || "";

    const favourites = rawFavourites
        .split(",")
        .filter((item) => item) // Remove empty entries
        .sort((a, b) => a.localeCompare(b)); // Sort in ascending order

    favourites.forEach((fileName) => {
        
        // Create a button for the favourite item
        const favouriteActionButton = document.createElement("button");
        favouriteActionButton.className = "favourite-content-button";
        favouriteActionButton.textContent = friendlyNameMapping[fileName] || prettifyFilename(fileName);

        favouriteActionButton.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevents bubbling up
            event.preventDefault();  // Stops accidental extra triggers

            const matchingButton = document.querySelector(`.tab-content-button[data-filename="${fileName.trim()}"]`);
        
            if (matchingButton) {
                matchingButton.click(); // This executes the script
            } else {
                new CSInterface().evalScript(`$.evalFile("${savedDirectory}/${fileName}")`);
            }
        });

        // Create an SVG icon for the favourite
        const favoriteIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        favoriteIcon.classList.add("fav-icon"); // Add class for styling
        const iconReference = document.createElementNS("http://www.w3.org/2000/svg", "use");
        iconReference.setAttribute("href", "#fav-icon"); // Reference the "fav-icon" symbol
        favoriteIcon.appendChild(iconReference);

        // Add click event to toggle favourite state
        favoriteIcon.addEventListener("click", () => {
            unfavouriteItem(fileName); // Remove the item from favourites
            updateFavouritesTab(); // Refresh the favourites tab
            restoreFavIconStates(); // Sync the state in the main tab
        });

        // Wrap the button and icon in a container
        const favouriteItemWrapper = document.createElement("div");
        favouriteItemWrapper.className = "favourites-item";
        favouriteItemWrapper.appendChild(favouriteActionButton);
        favouriteItemWrapper.appendChild(favoriteIcon);

        // Add the wrapper to the favourites container
        favouritesContainer.appendChild(favouriteItemWrapper);
    });
}

/**
 * Restores the state of favourite icons in the main tab based on localStorage.
 * - Iterates through all file button wrappers.
 * - Updates the icon and styling to reflect the current favourite state.
 */
function restoreFavIconStates() {
    // Retrieve the list of favourites from localStorage
    const favourites = (localStorage.getItem("favourites") || "")
        .split(",")
        .filter((item) => item); // Filter out empty values

    // Select all file wrappers in the main tab
    const fileWrappers = document.querySelectorAll(".file-button-wrapper");

    fileWrappers.forEach((wrapper) => {
        const button = wrapper.querySelector(".tab-content-button"); // Locate the file name button
        const favIcon = wrapper.querySelector("svg"); // Locate the SVG icon
        const useElement = favIcon?.querySelector("use"); // Locate the <use> element within the SVG

        if (button && favIcon && useElement) {
            const fileName = button.getAttribute("data-filename") || button.textContent.trim(); // Use actual filename
            const isFavourite = favourites.some(fav => fav.trim().toLowerCase() === fileName.trim().toLowerCase()); // Check if it's in the favourites list

            // Update the icon and its classes based on the favourite state
            useElement.setAttribute("href", isFavourite ? "#fav-icon" : "#non-fav-icon");
            favIcon.classList.toggle("fav-icon", isFavourite); // Add/remove "fav-icon" class
            favIcon.classList.toggle("non-fav-icon", !isFavourite); // Add/remove "non-fav-icon" class
        }
    });
}

/**
 * Attaches a click event listener to the tab contents container.
 * - Detects clicks on favourite or non-favourite icons.
 * - Delegates handling to the `handleFavouriteToggle` function.
 */
function attachFavouriteListeners() {
    const tabContents = document.querySelector("#tab-contents"); // Select the tab contents container

    tabContents.addEventListener("click", (event) => {
        const clickedElement = event.target; // Get the clicked element

        // Check if the clicked element is or contains a favourite or non-favourite icon
        const icon = clickedElement.closest("svg.non-fav-icon, svg.fav-icon");

        if (icon) {
            handleFavouriteToggle(icon); // Process the icon click
        }
    });
}

/**
 * Removes a script from the favourites list in localStorage.
 * - Ensures the specified script is removed if it exists.
 * 
 * @param {string} scriptName - The name of the script to remove from favourites.
 */
function unfavouriteItem(scriptName) {
    // Retrieve the current favourites from localStorage
    let favourites = (localStorage.getItem("favourites") || "")
        .split(",")
        .filter((item) => item); // Remove any empty entries

    // Remove the specified script from the favourites
    favourites = favourites.filter((fav) => fav !== scriptName);

    // Save the updated list back to localStorage
    localStorage.setItem("favourites", favourites.join(","));
}

/**
 * Initializes the panel by setting up event listeners and refreshing tabs and favourites.
 * - Handles tab toggling and favourites tab interactions.
 * - Initializes settings, help, and overlay modals.
 * - Refreshes the tabs and restores favourite icon states.
 */
function initPanel() {
    const tabButtons = getTabButtons(); // Retrieve all tab buttons
    const tabContents = document.querySelectorAll(".tab-content"); // Retrieve all tab contents

    // Event listener for all tab buttons
    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const tabId = button.getAttribute("data-tab"); // Get the associated tab ID
            const tabContent = document.querySelector(`#${tabId}`); // Find the corresponding tab content

            if (tabContent) {
                const isActive = tabContent.classList.contains("active");

                // Deactivate all tabs and contents
                tabButtons.forEach((btn) => btn.classList.remove("active"));
                tabContents.forEach((content) => content.classList.remove("active"));

                // Activate the clicked tab if it wasn't already active
                if (!isActive) {
                    button.classList.add("active");
                    tabContent.classList.add("active");
                }
            }

            // Update the favourites icon state
            updateFavouritesIconState();
        });
    });

    // Event listener for the favourites button
    document.querySelector("#favourites-btn").addEventListener("click", () => {
        const favouritesTab = document.querySelector(".favourites-container"); // Locate the favourites tab
        const favouritesBtn = document.querySelector("#favourites-btn"); // Locate the favourites button
        const topAnchor = document.getElementById("top-anchor"); // Locate the top anchor for scrolling

        // Deselect all other tabs
        const tabButtons = getTabButtons();
        const tabContents = document.querySelectorAll(".tab-content");
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        tabContents.forEach((content) => content.classList.remove("active"));

        // Toggle the favourites tab
        favouritesTab.classList.toggle("active");

        // Update the favourites button active state
        if (favouritesTab.classList.contains("active")) {
            favouritesBtn.classList.add("active");
            topAnchor.focus(); // Focus on the top anchor to force a scroll
        } else {
            favouritesBtn.classList.remove("active");
        }
    });

    // Initialize other buttons and modals
    document.querySelector("#settings-btn").addEventListener("click", openSettingsModal);
    document.querySelector("#help-btn").addEventListener("click", openHelpModal);
    document.querySelector("#overlay").addEventListener("click", closeAllModals);

    initSettingsModal(); // Initialize settings modal
    initHelpModal(); // Initialize help modal

    // Refresh tabs and restore favourite icon states
    const savedDirectory = localStorage.getItem("savedDirectory") || "";
    updateTabs(savedDirectory);

    setTimeout(() => {
        restoreFavIconStates(); // Ensure icons are updated after tabs are created
    }, 100);

    // Initial state check for the favourites icon
    updateFavouritesIconState();
}

/**
 * Opens the settings modal and displays the overlay.
 * - Ensures any other open modals are closed first.
 * - Updates validation icons based on the current directory input.
 */
function openSettingsModal() {
    closeAllModals(); // Close any other open modals
    document.querySelector("#settings-modal").style.display = "block"; // Show the settings modal
    document.querySelector("#overlay").style.display = "block"; // Show the overlay

    // Update validation icons when the settings modal is opened
    const directoryInput = document.querySelector("#settings-directory").value; // Get the current directory input
    updateIcons(directoryInput); // Update validation icons
}

/**
 * Initializes the settings modal by attaching event listeners and validation logic.
 * - Handles directory input validation and icon updates.
 * - Sets up logic for browsing, saving, and loading the saved directory.
 */
function initSettingsModal() {
    const browseBtn = document.querySelector("#settings-browse-btn");
    const saveBtn = document.querySelector("#settings-save-btn");
    const directoryInput = document.querySelector("#settings-directory");
    const modal = document.querySelector("#settings-modal");
    const successIcon = document.getElementById("success-icon");
    const errorIcon = document.getElementById("error-icon");
    const warningIcon = document.getElementById("warning-icon");
    const notificationDot = document.getElementById("settings-notification-dot");

    /**
     * Updates the validation icons and notification dot based on the directory path.
     * - Red for invalid paths.
     * - Green for valid and matching the saved directory.
     * - Yellow for valid but not matching the saved directory.
     * 
     * @param {string} path - The directory path to validate.
     */
    const updateIcons = (path) => {
        validateFilepath(path, (isValid) => {
            const savedDirectory = localStorage.getItem("savedDirectory");

            if (!isValid) {
                successIcon.style.display = "none";
                warningIcon.style.display = "none";
                errorIcon.style.display = "flex";
                notificationDot.style.backgroundColor = "red";
            } else if (path === savedDirectory) {
                successIcon.style.display = "flex";
                warningIcon.style.display = "none";
                errorIcon.style.display = "none";
                notificationDot.style.backgroundColor = "green";
            } else {
                successIcon.style.display = "none";
                warningIcon.style.display = "flex";
                errorIcon.style.display = "none";
                notificationDot.style.backgroundColor = "orange";
            }
        });
    };

    /**
     * Validates a directory path using ExtendScript.
     * - Sanitizes the path locally.
     * - Checks for invalid characters and folder existence.
     * 
     * @param {string} path - The directory path to validate.
     * @param {function} callback - Callback to handle validation results.
     */
    const validateFilepath = (path, callback) => {
        const invalidChars = /[*?"<>|]/;
        if (!path || path.trim() === "" || invalidChars.test(path)) {
            callback(false);
            return;
        }

        const sanitizedPath = path.replace(/\\/g, "/").trim();

        new CSInterface().evalScript(
            `Folder("${sanitizedPath.replace(/\\/g, "\\\\")}").exists`,
            (result) => {
                callback(result === "true");
            }
        );
    };

    // Validate and update icons on directory input changes
    directoryInput.addEventListener("input", () => {
        const value = directoryInput.value.trim();
        updateIcons(value);
    });

    // Logic for the "Browse" button
    const handleBrowseClick = () => {
        window.__adobe_cep__.evalScript(
            `selectFolder()`,
            (result) => {
                if (result && result !== "undefined") {
                    directoryInput.value = result;
                    updateIcons(result);
                }
            }
        );
    };

    browseBtn.removeEventListener("click", handleBrowseClick);
    browseBtn.addEventListener("click", handleBrowseClick);

    // Logic for the "Save" button
    saveBtn.addEventListener("click", () => {
        const directoryValue = directoryInput.value.trim();
        if (!directoryValue) {
            playErrorSound();
            alert("No directory input provided. Please enter a valid directory.");
            return;
        }

        const sanitizedPath = directoryValue.replace(/\\/g, "/").trim();
        localStorage.setItem("savedDirectory", sanitizedPath);
        updateIcons(sanitizedPath);
        updateTabs(sanitizedPath);
    });

    // Load the saved directory on modal open
    const savedDirectory = localStorage.getItem("savedDirectory");
    if (savedDirectory) {
        directoryInput.value = savedDirectory;
        updateIcons(savedDirectory);
    }
}

/**
 * Initializes the help modal by attaching an event listener to the help button.
 * - Clicking the help button opens the help modal.
 */
function initHelpModal() {
    document.querySelector("#help-btn").addEventListener("click", openHelpModal); // Attach click event

    // Dynamically set the version in the help modal
    const versionInfo = document.getElementById("version-info");
    if (versionInfo) {
        versionInfo.textContent = `${VERSION}`;
    }

    
    // Select the link
    const supportLink = document.querySelector("#support-link");
    if (supportLink) {
        supportLink.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default in-panel navigation

            // Get the URL from the `href` attribute
            const url = supportLink.getAttribute("href");
            if (url) {
                new CSInterface().openURLInDefaultBrowser(url); // Open in default browser
            }
        });}
}

/**
 * Opens the help modal and displays the overlay.
 * - Closes any other open modals first.
 */
function openHelpModal() {
    closeAllModals(); // Ensure no other modals are open
    document.querySelector("#help-modal").style.display = "block"; // Show the help modal
    document.querySelector("#overlay").style.display = "block"; // Show the overlay
}

/**
 * Closes all modals and hides the overlay.
 * - Resets the display of the settings and help modals.
 */
function closeAllModals() {
    document.querySelector("#settings-modal").style.display = "none"; // Hide settings modal
    document.querySelector("#help-modal").style.display = "none"; // Hide help modal
    document.querySelector("#overlay").style.display = "none"; // Hide overlay
}

/**
 * Displays the debug modal and optionally adds a new message to it.
 * - Messages are appended to the debug message container.
 * - Adds a close button to hide the modal.
 * 
 * @param {string} message - The message to add to the debug modal (optional).
 */
function showDebugModal(message) {

    if (!DEBUG_MODE) return; // Exit the function if DEBUG_MODE is false
    
    const debugModal = document.getElementById("debug-modal"); // Locate the debug modal
    const debugMessagesContainer = document.getElementById("debug-messages"); // Locate the message container
    const closeDebug = document.getElementById("debug-close-button"); // Locate the close button

    // Add the new message if provided
    if (message) {
        const messageDiv = document.createElement("div");
        messageDiv.textContent = message; // Set the message content
        debugMessagesContainer.appendChild(messageDiv); // Add to the container

        // Add a line break after the message
        const lineBreak = document.createElement("br");
        debugMessagesContainer.appendChild(lineBreak);
    }

    // Show the modal
    debugModal.style.display = "flex"; // Make the modal visible

    // Close button behavior
    closeDebug.onclick = () => {
        debugModal.style.display = "none"; // Hide the modal
    };
}

/**
 * Updates the content of the debug modal with the first message in the queue.
 * - Displays a placeholder if the queue is empty.
 */
function updateDebugModalContent() {
    const debugMessage = document.getElementById("debug-message"); // Locate the debug message element

    if (messageQueue.length > 0) {
        // Show the first message in the queue
        debugMessage.textContent = messageQueue[0];
    } else {
        // Show a placeholder if no messages remain
        debugMessage.textContent = "No more messages.";
    }
}

//-------------------
//-------------------
//-------------------

/**
 * Initializes the panel when the window is loaded.
 * - Manages debug mode visibility.
 * - Restores favourites and tabs.
 * - Displays an initial debug message if DEBUG_MODE is enabled.
 */
window.onload = function () {
    const debugModal = document.getElementById("debug-modal"); // Debug modal element
    const bugIcon = document.getElementById("bug-btn"); // Bug icon element

    // Ensure modal and icon are hidden if DEBUG_MODE is false
    if (!DEBUG_MODE) {
        if (debugModal) {
            debugModal.style.display = "none"; // Hide the debug modal
            messageQueue.length = 0; // Clear the debug message queue
            isModalVisible = false; // Reset modal visibility
            totalMessages = 0; // Reset total message count
        }

        if (bugIcon) {
            bugIcon.style.display = "none"; // Hide the bug icon
        }
    } else {
        if (bugIcon) {
            bugIcon.style.display = "inline-flex"; // Show the bug icon
        }
    }

    const savedDirectory = localStorage.getItem("savedDirectory") || ""; // Retrieve the saved directory
    updateTabs(savedDirectory); // Refresh tabs based on the saved directory

    setTimeout(() => {
        restoreFavIconStates(); // Restore the state of favourite icons
        attachFavouriteListeners(); // Attach listeners for favourite toggling
        updateFavouritesTab(); // Populate the favourites tab
        initPanel(); // Initialize the panel
    }, 200); // Adjust delay as necessary

    toggleDebugIcon(); // Update the debug icon state

    // Log a confirmation message in debug mode
    showDebugModal(
        "Debug Mode is active. Initialising debug logs will be above. Debug logs triggered by action events will trigger upon that action and append below."
    );

    // Add event listener to the favourites button
    document.querySelector("#favourites-btn").addEventListener("click", () => {
        scrollToTop(); // Call scrollToTop when the button is clicked
});

};