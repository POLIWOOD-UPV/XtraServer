const square = document.getElementById('square');
const text = document.getElementById('information');

const squareAnimation = square.animate([{
	transform: 'scaleY(0)'

},{
	transform: 'scaleY(1)'
}],{
	duration: 1000,
	fill:"forwards",
	easing:'ease-out'
});
squareAnimation.pause()

const textAnimation = text.animate([{
	transform: 'translateX(-500px)',
	opacity:0
},{
	transform: 'translateX(0)',
	opacity:1
}],{
	duration: 1500,
	fill:"forwards",
	easing:'ease-out'
});
textAnimation.pause()

const screen = document.getElementById("screen");
var played = false;

screen.addEventListener("click", () => {
	var information = document.getElementById("information");
	var square = document.getElementById("square");

	if (played){
		console.log(squareAnimation)
		squareAnimation.reverse();
		squareAnimation.onfinish = (event) =>{
			textAnimation.reverse();
		}
		played = false;
	} else{ 
		squareAnimation.playbackRate = 1;
		squareAnimation.play();
		squareAnimation.commitStyles();
		played = true;
		squareAnimation.onfinish = (event) =>{
			textAnimation.playbackRate = 1;
			textAnimation.play();
			textAnimation.commitStyles();
       }
		}
});
