//console.log($'hello');
const signature = document.getElementById("signature");
const context = signature.getContext("2d");
const hidden = document.getElementById("hiddenSignature"); //hidden is where we will store the value of the signature
var dataURL;
/*const clear = document.getElementById("clear");*/
//const submit = document.getElementById("submit");

let moving = false;
let x = 0;
let y = 0;

signature.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;

    moving = true;
});

signature.addEventListener("mousemove", (e) => {
    if (moving === true) {
        drawLine(context, x, y, e.offsetX, e.offsetY);
        x = e.offsetX;
        y = e.offsetY;
    }
});

window.addEventListener("mouseup", (e) => {
    if (moving === true) {
        drawLine(context, x, y, e.offsetX, e.offsetY);
        x = 0;
        y = 0;

        moving = false;
        var dataURL = signature.toDataURL();
        hidden.value = dataURL; 
        console.log("this is my dataURL", dataURL);
    }
});

function drawLine(context, x1, y1, x2, y2) {
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}

/*submit.addEventListener("click", function post(event) {
    if (signature.isEmpty()) {
        alert("Please provide signature first.");
    } else {
        document.body.innerHTML +=
            '<form id="form" action="newpage.php" method="post"><input type="hidden" name="image" value="' +
            signature.toDataURL() +
            '"></form>';
        document.getElementById("form").submit();
    }
});*/
/*clear.addEventListener("click", function (e) {
    console.log("i clicked cledar");
    signature.clear();
});
submit.addEventListener("click", function (e) {
    console.log("i clicked submit");
    if (signature.isEmpty()) {
        alert("Please provide signature first.");
    } else {
        window.open(signature.toDataURL());
    }
});*/
