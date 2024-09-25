Dropzone.autoDiscover = false;

function init() {
    // Initialize Dropzone for the file upload element
    let dz = new Dropzone("#dropzone", {
        url: "/", // Dummy URL, no need for server-side processing here
        maxFiles: 1, // Limit to only 1 file upload at a time
        addRemoveLinks: true, // Add a button to remove files
        dictDefaultMessage: "Drop image here or click to upload", // Display message for the dropzone
        autoProcessQueue: false // Disable auto-processing, as we handle it manually on submit
    });

    // Event triggered when a new file is added
    dz.on("addedfile", function() {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]); // Keep only one file uploaded
        }
    });

    // Event triggered when file upload is complete
    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        var url = "http://127.0.0.1:5000/classify_image"; // Server URL to send the image

        // Send the image data as a POST request to the backend
        $.post(url, {
            image_data: imageData
        }, function(data, status) {
            console.log(data);

            // If no data received or an error occurred, show error message
            if (!data || data.length == 0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();
                $("#error").show();
                return;
            }

            // Hide error section
            $("#error").hide();
            
            let players = ["beyonce", "kamala", "maria", "messi", "putin"];
            let match = null;
            let bestScore = -1;

            // Loop through the results and find the best match based on classification probabilities
            for (let i = 0; i < data.length; ++i) {
                let maxScoreForThisClass = Math.max(...data[i].classification_probability);
                if (maxScoreForThisClass > bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }

            // If a match is found, display the result and update the probability scores
            if (match) {
                $("#resultHolder").show();
                $("#divClassTable").show();

                // Display the corresponding player result
                $("#resultHolder").html($(`[data-player="${match.class}"`).html());

                // Update the scores in the table
                let classDictionary = match.classification_dictionary;
                for (let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let probabilityScore = match.classification_probability[index];
                    let elementName = "#score_" + personName;
                    $(elementName).html(probabilityScore);
                }
            }
        });
    });

    // Trigger file processing on button click
    $("#submitBtn").on('click', function (e) {
        dz.processQueue();
    });
}

$(document).ready(function() {
    console.log("ready!");
    $("#error").hide(); // Hide error section on page load
    $("#resultHolder").hide(); // Hide result section on page load
    $("#divClassTable").hide(); // Hide score table on page load

    init(); // Initialize the Dropzone and related functions
});
