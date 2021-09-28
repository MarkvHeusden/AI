const URL = "https://teachablemachine.withgoogle.com/models/P9pRU8kCS/";
let model, webcam, ctx, labelContainer, maxPredictions;

// function alertLinks() { 
//    alert("Let op je houding! Je zit teveel naar links."); 
//  }
// function alertRechts() { 
//     alert("Let op je houding! Je zit teveel naar rechts.");  
//  }
const statusElement = document.querySelector('#status');

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";



    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();



    // Convenience function to setup a webcam
    const size = 200;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);



    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("li"));
    }
}



async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}



async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const {
        pose,
        posenetOutput
    } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);



    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        console.log("test");
        if (prediction[0].probability.toFixed(2) >= 0.75) {
            statusElement.classList.remove('bad');
            statusElement.classList.add('good');
        } else {
            statusElement.classList.add('bad');
            statusElement.classList.remove('good');
        }
    }



    // finally draw the poses
    drawPose(pose);
}



function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            // const strokeColor = 'red';
            // tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx, strokeColor);
            // tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx, strokeColor);
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}