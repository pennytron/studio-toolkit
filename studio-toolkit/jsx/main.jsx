//Allows "Browse" button to display file directory
function selectFolder() {
    var folder = Folder.selectDialog("Select a directory");
    if (folder) {
        return folder.fsName; // Return folder path
    }
    return "undefined"; // Handle user canceling the dialog
}

//Validates folder path
function isPathValid(path) {
    if (!path || path.trim() === "") {
        return false; // Empty or invalid path
    }

    var file = new File(path);
    var folder = new Folder(path);
    return file.exists || folder.exists; // Valid if either a file or folder exists
}

function validateFilePath(path) {
    if (isPathValid(path)) {
        return "valid";
    } else {
        return "invalid";
    }
}

function loadFoldersFromPath(path) {
    if (!isPathValid(path)) {
        return "invalid";
    }

    var folder = new Folder(path);
    if (folder.exists && folder.getFiles) {
        return folder.getFiles().toString(); // Example of folder handling
    }
}
//....end of validating folder paths

//Finds subfolders in chosen folder
function getSubfolderNames(path) {
    var folder = new Folder(path);
    if (!folder.exists) {
        return "[]"; // Return an empty array if the folder doesn't exist
    }

    var subfolders = folder.getFiles(function (file) {
        return file instanceof Folder; // Only include folders
    });

    var sanitizedSubfolders = [];
    for (var i = 0; i < subfolders.length; i++) {
        var name = subfolders[i].name;

        // Escape quotes and backslashes
        var sanitized = name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        sanitizedSubfolders.push('"' + sanitized + '"'); // Wrap in quotes
    }

    return "[" + sanitizedSubfolders.join(",") + "]"; // Create JSON-like string
}

function getPlaceholderFiles(folderPath) {
    var folder = Folder(folderPath);
    if (folder.exists) {
        var txtFiles = folder.getFiles("*.jsx");
        var fileNames = []; // Create an array to store file names

        // Use a `for` loop instead of `map`
        for (var i = 0; i < txtFiles.length; i++) {    $.writeln("Test");
            fileNames.push(decodeURIComponent(txtFiles[i].name)); // Decode file name
        }

        // Return as a JSON-like string (ExtendScript compatible)
        return "[" + fileNames.join(",") + "]";
    }

}

function readJSONFile(filePath) {
    var file = new File(filePath);
    if (!file.exists) {
        return "{}"; // Return an empty JSON object string if the file doesn't exist
    }

    file.open("r"); // Open the file for reading
    var content = file.read(); // Read the file as a string
    file.close(); // Close the file

    // Parse the JSON manually using eval
    try {
        var parsed = eval("(" + content + ")"); // Safely parse JSON
        var jsonString = "{";
        for (var key in parsed) {
            if (parsed.hasOwnProperty(key)) {
                jsonString += '"' + key + '":"' + parsed[key].toString().replace(/"/g, '\\"') + '",';
            }
        }
        if (jsonString.charAt(jsonString.length - 1) === ",") {
            jsonString = jsonString.slice(0, -1);
        }        
        jsonString += "}";

        return jsonString; // Return the manually created JSON string
    } catch (e) {
        $.writeln("Error parsing JSON: " + e.toString()); // Log parsing error
        return "{}"; // Return an empty JSON object string if parsing fails
    }
}
