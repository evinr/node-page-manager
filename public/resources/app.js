var DATE = getDate(); //needs to be globally defined to avoid the wrong keys being used when updating a description on different days than the page was loaded on.
var myFirebaseRef = new Firebase("https://holidays.firebaseio.com/");

function loadData() {
	//when this data is updated, the socket fires this vvv function
	myFirebaseRef.child(DATE).on("value", function(data) {
		if (document.getElementsByClassName('card')[0]) { //Does not execute on first render
			document.body.removeChild(child);		//need to clean the dom to prep for repopulation
			var section = document.createElement('section');
			section.className = 'container';
			document.body.appendChild(section);
		}
		else { // Removes the loading animation from the dom
			var child = document.getElementsByClassName('loader')[0];
			document.body.removeChild(child);
		}
		renderData(data.val());
	});
}

function updateListener (targetId) {
	var targetElementNumber = targetId.split('-')[1]
	var targetField = targetId.split('-')[0];

	if (targetField === 'menu') {
		//launch the modal
		var modal = document.getElementsByClassName('modalDialog')[0];
		modal.className += ' modalDialog-active';

		//update the form on the modal to match the data element that will be modified.
		var button = document.getElementsByClassName('form-button')[0];
		button.id = 'button-' + targetElementNumber;
		//update the values of the form with what is in firebase

		myFirebaseRef.child(DATE + '/' + targetElementNumber).on("value", function(data) {
			document.getElementById('holiday').value = data.val().name;
			document.getElementById('description').value = data.val().description;
			document.getElementById('image').value = data.val().image;
			document.getElementById('conditional').checked = data.val().conditional;
		});

	}
	
	if (targetField === 'close') {
		resetForm();
	}

	if (targetField === 'button') {
		//grab the contents of the form
		var holidayRef = myFirebaseRef.child(DATE + '/' + targetElementNumber);
		var holObj = {};

		//shove all the contents up into the object
		holObj['name'] = document.getElementById('holiday').value;
		holObj['description'] = document.getElementById('description').value;
		holObj['image'] = document.getElementById('image').value;
		holObj['conditional'] = document.getElementById('conditional').checked;
		holObj['fake'] = document.getElementById('fake').checked;
		holidayRef.update(holObj);
		resetForm();
		setTimeout(loadData(), 1000);
	}

	if (targetField === 'learn') {
		var queryParam = encodeURI(document.getElementById('menu-' + targetElementNumber).nextSibling.innerHTML);
		window.open('https://www.google.com/search?q=' + queryParam)
	}

}

//This function is used to determine if the title on a card is hanging off the bottom
function adjustTitles(){
		//determine how many elements are on the page
	var elementsNumber = document.getElementsByClassName('card').length;
	for (var i = 0; i < elementsNumber; i++) {
		var titleElement = document.getElementById('menu-' + i).nextSibling;
		this.applyAdjustedTileStyles(titleElement);
	}
}

function applyAdjustedTileStyles(titleElement) {
	//four lines @ ~ 99
	if (titleElement.clientHeight > 95) {
		titleElement.style.margin = '-108px 15px';
	}

	//three lines @ ~ 74
	else if (titleElement.clientHeight > 70) {
		titleElement.style.margin = '-83px 15px';
	}

	// two lines @ ~ 49
	else if (titleElement.clientHeight > 45) {
		titleElement.style.margin = '-58px 15px';
	}

	//one line @ ~ 25
	else if(titleElement.clientHeight < 30) {
		titleElement.style.margin = '-33px 15px';
	}
}

function resetForm () {
	var modal = document.getElementsByClassName('modalDialog')[0];
	modal.className = 'modalDialog';
}

function getDate () {
	var today = new Date();
    var day = today.getDate();
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var month = months[today.getMonth()];
    // var yyyy = today.getFullYear();
    day<10 ? day='0'+ day : ''
    return month + '/' + day;
}



function renderData (data) {
	for (i = 0; i < data.length; i++) {

		var card = document.createElement('div');
		card.className = 'card';

			var image = document.createElement('div');
			if (data[i].image !== '') {
				//update the background image
				image.style.backgroundImage = 'url("' + data[i].image + '")';
			}
			image.className = 'image';

				var scrim = document.createElement('div');
				scrim.className = 'scrim';
				image.appendChild(scrim);

				var menu = document.createElement('button');
				menu.id = 'menu-' + i;
				menu.className = 'menu';

					for (n = 0; n < 3; n++) {
						var dot = document.createElement('div');
						dot.className = 'menu-dot';
						menu.appendChild(dot);
					}

				image.appendChild(menu);

				var title = document.createElement('h2');
				title.appendChild(document.createTextNode(data[i].name));
				image.appendChild(title);

			card.appendChild(image);

			var content = document.createElement('div');
			content.className = 'content';

				var description = document.createElement('p')
					var text = data[i].description !== '' ? data[i].description : 'This holiday does not have a description yet. Please feel free to contribute by adding one!';
				description.appendChild(document.createTextNode(text));

				content.appendChild(description)

			card.appendChild(content);

				var button = document.createElement('button');
				button.className = 'flat-button';
				button.id = 'learn-' + i;
				button.appendChild(document.createTextNode('Learn More'));

			card.appendChild(button);
			
		var target = document.getElementsByClassName('container')[0];
		target.appendChild(card);
		//check for sloppy titles
		this.adjustTitles();
	};
}

loadData();

document.body.addEventListener("click", function(event){
	updateListener(event.srcElement.id || event.srcElement.parentNode.id)
});

// this listener gets fired off once per browser resize or device orientation change
window.addEventListener("resize", function() {
	this.adjustTitles();
});

// this listener gets fired off once per element transistion finishing, ensuring the style clean up is always ran when something changes
window.addEventListener("transitionend", function(event) {
	// console.log(event.srcElement.children[0].children[2].id)
	if (!event.srcElement.children[0].children[2].id) {
		this.applyAdjustedTileStyles(event.srcElement.children[0].children[2]);
	}
});

//TODO's

// Style the form in material UI

// Description and Image selector tools

// 