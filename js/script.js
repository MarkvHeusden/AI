const URL = "https://teachablemachine.withgoogle.com/models/P9pRU8kCS/";
let model, webcam, ctx, labelContainer, maxPredictions;

// function alertLinks() { 
//    alert("Let op je houding! Je zit teveel naar links."); 
//  }
// function alertRechts() { 
//     alert("Let op je houding! Je zit teveel naar rechts.");  
//  }
const statusElement = document.querySelector('#status');
const startButton = document.querySelector('button');

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const size = 200;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    const canvas = document.getElementById("canvas");
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("li"));
    }

    // Verwijder start button als applicatie is geladen
    startButton.remove();
}



async function loop(timestamp) {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}



async function predict() {
    const {
        pose,
        posenetOutput
    } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);



    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(1);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        // Als je niet voor 95% goed zit krijg je een rood bolletje
        if (prediction[0].probability.toFixed(2) >= 0.95) {
            statusElement.className = 'good';
        } else {
            statusElement.className = 'bad';
        }
    }



    // finally draw the poses
    drawPose(pose);
}



function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}