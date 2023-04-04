function uploadPlatesData() {
    let data = ['นย7768', 'อว2446', 'ตม6547']
    // Convert the data object to a JSON string
    let jsonData = JSON.stringify(data);

    // Create a file reference for the current date
    let dataRef = ref(storageRef, "plates.json");

    // Check if a file with this name already exists
    getMetadata(dataRef)
        .then((metadata) => {
            // If the file exists, overwrite it with the new data
            uploadString(dataRef, jsonData)
                .then(() => {
                    alert('Data uploaded successfully!');
                })
                .catch((error) => {
                    alert('Error uploading data:', error);
                });
        })
        .catch((error) => {
            // If the file does not exist, create a new file with the data
            uploadString(dataRef, jsonData)
                .then(() => {
                    alert('Data uploaded successfully!');
                })
                .catch((error) => {
                    alert('Error uploading data:', error);
                });
        });
}


function downloadPlatesData() {
    let platesRef = ref(storage, `plates.json`);
    const fileSnapshot = await getDownloadURL(platesRef);
    const fileURL = fileSnapshot.toString();
    const response = await fetch(fileURL);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder();
    const jsonString = textDecoder.decode(uint8Array);
    return JSON.parse(jsonString);
}