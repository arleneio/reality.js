/*
	RealityScript - Reality.js JavaScript Library v1 
	Documentation source: https://realityscript.io 
	@author jason.io - Created on 25/04/2020 
	Released under the MIT license 
*/

// String variables (default: English)
const realityTitle = "Tap <strong>image</strong> icon for <strong>AR</strong>";
const realityTitle_noAr = "Use a mobile device for <strong>AR</strong>";
const realitySubtitle_ios = "ARKit required";
const realitySubtitle_android = "ARCore or ARKit required";
const realitySubtitle_noAr = "ARKit or ARCore required";
const realityEditorialCopy = "Editorial usage only";

// Set an empty reality object 
const realityObject = {
	title: "",
	subtitle: "",
	modelTitle: "",
	modelImageUrl: "",
	modelUrl: ""
};

// Some global vars
let oS;

// An array for storing the names (strings) of any scripts that were needed and imported 
let scripts = [];

// Get the mobile OS
function getMobileOperatingSystem() {

	// Get user agent 
	var userAgent = navigator.userAgent || navigator.vendor || window.opera;

	// Windows Phone must come first because its UA also contains "Android"
	if (/windows phone/i.test(userAgent)) {
		return "Windows Phone";
	}

	// Android detection
	if (/android/i.test(userAgent)) {
		return "Android";
	}

	// iOS detection from: http://stackoverflow.com/a/9039885/177710
	if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
		return "iOS";
	}

	return "unknown";
}

// Get other scripts
function getScripts(scriptName){
	
	if(scriptName === "Model-Viewer"){
		
		// Current Model-Viewer version supported 
		var modelViewerVersion = '1.1.0';

		// Get Model-Viewer/Scene-Viewer (needed for access to Android's ARCore web API)
		if(scripts.indexOf(scriptName) < 0){

			// Import Model-Viewer script
			var modelViewerImport = document.createElement('script');
			modelViewerImport.type = 'module';
			modelViewerImport.src = 'https://unpkg.com/@google/model-viewer@'+modelViewerVersion+'/dist/model-viewer.min.js';
			document.head.appendChild(modelViewerImport);

			// Import Model-Viewer legacy script
			var modelViewerImport_noModule = document.createElement('script');
			modelViewerImport_noModule.setAttribute('nomodule', true);
			modelViewerImport_noModule.src = 'https://unpkg.com/@google/model-viewer@'+modelViewerVersion+'/dist/model-viewer-legacy.js';
			document.head.appendChild(modelViewerImport_noModule);

			scripts.push(scriptName);

		} else {
			// Already have Model-Viewer
		}
	}
}

function checkScriptRequirementsForElement(realityElement){
	
	// Get other scripts for Android 
	// (And iOS only if user wants to display a 3D preview before entering AR
	if(oS === "Android"){
		getScripts('Model-Viewer');
	} else if(oS === "unknown" || (oS === "iOS" && realityElement.getAttribute('display-image')) && realityElement.getAttribute('display-image') === "no"){
		getScripts('Model-Viewer');
	} else {
		// Model-Viewer is not needed in this instance so no need to import it
	}
}

// Setup the components
var realityStarted = false;
function realitySetup(){
	if (realityStarted) {
		return;
	}
	realityStarted = true
	
	// Detect the device OS
	oS = getMobileOperatingSystem();

	// Get the reality-tags 
	const realityElements = document.getElementsByTagName("reality");

	
	// Loop through the reality-tag elements
	for(let i = 0; i < realityElements.length; i++){
		
		// Get the reality-tag element
		const realityElement = realityElements[i];
		
		// Check if the element requires any other scripts 
		checkScriptRequirementsForElement(realityElement);
		
		// Set some style options for the HTML preview box
		let boxWidth = '300px';
		let boxHeight = '300px';
		let boxBorderRadius = '20px';
		let boxBackgroundColor = 'transparent'; // '#222';
		let boxMargin = "20px";
		
		// Configure some quick-sizing defaults
		if(realityElement.getAttribute('size') && realityElement.getAttribute('size') === "small"){
			boxWidth = '300px';
			boxHeight = '300px';
			boxBorderRadius = '20px';
			boxMargin = "20px";
		} 
		
		if(realityElement.getAttribute('size') && realityElement.getAttribute('size') === "medium"){
			
			if(window.innerWidth >= 1160){
				boxWidth = (window.innerWidth/4) + 'px';
				boxHeight = (window.innerWidth/4) + 'px';
				boxBorderRadius = '0px';
				boxMargin = "0px";
			} else if(window.innerWidth >= 860){
				boxWidth = (window.innerWidth/3) + 'px';
				boxHeight = (window.innerWidth/3) + 'px';
				boxBorderRadius = '0px';
				boxMargin = "0px";
			} else if(window.innerWidth >= 580){
				boxWidth = (window.innerWidth/2) + 'px';
				boxHeight = (window.innerWidth/2) + 'px';
				boxBorderRadius = '0px';
				boxMargin = "0px";
			} else {
				boxWidth = (window.innerWidth) + 'px';
				boxHeight = (window.innerWidth) + 'px';
				boxBorderRadius = '0px';
				boxMargin = "0px";
			}
		} 
		
		if(realityElement.getAttribute('size') && realityElement.getAttribute('size') === "large"){
			
			if(window.innerWidth < window.innerHeight){
				boxWidth = (window.innerWidth) + 'px';
				boxHeight = (window.innerWidth) + 'px';
				boxBorderRadius = '0px';
				boxMargin = "0px";
			} else {
				boxWidth = (window.innerHeight) + 'px';
				boxHeight = (window.innerHeight) + 'px';
				boxBorderRadius = '0px';
				boxMargin = "0px";
			}
		} 
		
		// Capture any user defined box-style attributes 
		if(realityElement.getAttribute('box-width')){
			boxWidth = realityElement.getAttribute('box-width') + 'px';
		}
		if(realityElement.getAttribute('box-height')){
			boxHeight = realityElement.getAttribute('box-height') + 'px';
		}
		if(realityElement.getAttribute('box-radius')){
			boxBorderRadius = realityElement.getAttribute('box-radius') + 'px';
		}
		if(realityElement.getAttribute('box-margin')){
			boxMargin = realityElement.getAttribute('box-margin') + 'px';
		}
		if(realityElement.getAttribute('box-background-color')){
			boxBackgroundColor = realityElement.getAttribute('box-background-color');
		}
		
		// Adjust for margin use
		boxWidth = ( ((parseInt(boxWidth, 10)) - ( parseInt(boxMargin, 10) * 2)) ) + 'px';
		boxHeight = ( ((parseInt(boxHeight, 10)) - ( parseInt(boxMargin, 10) * 2)) ) + 'px';
		
		// Create a reality-preview element
		const realityPreviewElement = document.createElement('reality-preview');

		const slotsElements = Array.from(realityElement.children).filter(child => child.getAttribute('slot'));
		// console.log('Slots', slotsElements);

		// Display the relevant AR component
		if (oS === "iOS") {

			// Construct reality object
			realityObject.title = realityTitle;
			realityObject.subtitle = realitySubtitle_ios;
			realityObject.modelTitle = realityElement.getAttribute('title');
			realityObject.modelImageUrl = realityElement.getAttribute('image');
			realityObject.modelUrl = realityElement.getAttribute('model-ios');
			
			// If 'reality dev' wants to display a 3D preview on iOS before entering AR
			// Note: Expecting support for a native 3D preview by default on iOS in the near future 
			let previewModelUrl;
			
			// If the folder-path convention is used
			if(realityElement.getAttribute('src') && realityElement.getAttribute('src') !== ""){
				
				// Get the src path
				var path = realityElement.getAttribute('src');
				
				// Get the last char of the path 
				var lastChar = path.charAt(path.length-1);
				
				// Check to see if the dev added a slash and remove it if so
				if(lastChar === '/'){
					path = path.slice(0, path.length-1) + path.slice(path.length);
				}
				
				var assetName = path.split("/").pop();
				
				if(realityElement.getAttribute('model-ios') && realityElement.getAttribute('model-ios') !== ""){
					realityObject.modelUrl = realityElement.getAttribute('model-ios');
				} else {
					realityObject.modelUrl = path + '/ios/' + assetName + '.usdz';
				}
				
				if(realityElement.getAttribute('image') && realityElement.getAttribute('image') !== ""){
					realityObject.modelImageUrl = realityElement.getAttribute('image');
				} else {
					realityObject.modelImageUrl = path + '/image/' + assetName + '.jpg';
				}
				
				if(!realityObject.modelTitle || realityObject.modelTitle === null || realityObject.modelTitle === ""){
					var nameCapitalized = assetName.charAt(0).toUpperCase() + assetName.slice(1);
					realityObject.modelTitle = nameCapitalized;
				}
				
				// If 'reality dev' wants to display a 3D preview on iOS before entering AR
				// Note: Expecting support for a native 3D preview by default on iOS in the near future
				if(realityElement.getAttribute('display-image') && realityElement.getAttribute('display-image') === "no"){
					if(realityElement.getAttribute('model-android') && realityElement.getAttribute('model-android') !== ""){
						previewModelUrl = realityElement.getAttribute('model-android');
					} else {
						previewModelUrl = path + '/android/' + assetName + '.gltf';
					}
				}
				
			}  else {
				
				// If 'reality dev' wants to display a 3D preview on iOS before entering AR
				// Note: Expecting support for a native 3D preview by default on iOS in the near future
				if(realityElement.getAttribute('display-image') && realityElement.getAttribute('display-image') === "no"){
					previewModelUrl = realityElement.getAttribute('model-android');
				}
			}
			
			if(previewModelUrl && previewModelUrl !== ""){

				// Use Model-Viewer for iOS only if the 'reality dev' has set the 'display-image' attribute to 'no' as we'll need to display something and can assume a 3D preview would be fine 
				// Note: Expecting support for a native 3D preview by default on iOS in the near future 
				
				// Create a model-viewer component
				var mvTag = document.createElement('model-viewer');
				mvTag.setAttribute('style', "width:100%; height:100%; border:0; border-radius: "+boxBorderRadius+"; overflow: hidden;background-color: transparent;");
				mvTag.setAttribute('src', previewModelUrl);
				mvTag.setAttribute('alt', realityObject.modelTitle);
				mvTag.setAttribute('ar', true);
				mvTag.setAttribute('shadow-intensity', "1");
				mvTag.setAttribute('camera-controls', true);
				mvTag.setAttribute('magic-leap', true);
				mvTag.setAttribute('autoplay', true);
				// mvTag.setAttribute('background-color',"#ececec");
				mvTag.setAttribute('reveal', "auto");
				mvTag.setAttribute('ar-modes', "quick-look");
				mvTag.setAttribute('quick-look-browsers', "safari chrome");
				mvTag.setAttribute('ios-src', realityObject.modelUrl);

				// TODO: Validate this work?
				if (realityObject.modelImageUrl && realityObject.modelImageUrl.length>0) {
					mvTag.setAttribute('poster', realityObject.modelImageUrl);
					mvTag.setAttribute('reveal', "auto");
				}
				

				if (realityElement.getAttribute('environment-image')) {
					mvTag.setAttribute('environment-image', realityElement.getAttribute('environment-image'))
				}

				if (realityElement.getAttribute('skybox-image')) {
					mvTag.setAttribute('skybox-image', realityElement.getAttribute('skybox-image'))
				}
				if (realityElement.getAttribute('shadow-intensity')) {
					mvTag.setAttribute('shadow-intensity', realityElement.getAttribute('shadow-intensity'))
				}
				if (realityElement.getAttribute('camera-orbit')) {
					mvTag.setAttribute('camera-orbit', realityElement.getAttribute('camera-orbit'))
				}
				if (realityElement.getAttribute('max-camera-orbit')) {
					mvTag.setAttribute('max-camera-orbit', realityElement.getAttribute('max-camera-orbit'))
				}
				if (realityElement.getAttribute('min-camera-orbit')) {
					mvTag.setAttribute('min-camera-orbit', realityElement.getAttribute('min-camera-orbit'))
				}
				


				if (slotsElements.length>0) {
					slotsElements.forEach(slot => {mvTag.appendChild(slot);});
				}

				realityPreviewElement.appendChild(mvTag);
				
			} else {
				
				// Create a link
				var aTag = document.createElement('a');
				aTag.setAttribute('href', realityObject.modelUrl);
				aTag.setAttribute('rel', "ar");
				aTag.setAttribute('style', "width:100%; height:100%; display:block; border-radius: "+boxBorderRadius+"; overflow: hidden;");
				aTag.innerText = "";
				realityPreviewElement.appendChild(aTag);

				// Create a preview image
				if(realityObject.modelImageUrl){ 
					var imgTag = document.createElement('img');
					imgTag.setAttribute('width', boxWidth);
					imgTag.setAttribute('height', boxHeight);
					if(realityObject.modelTitle){ 
						imgTag.setAttribute('alt', realityObject.modelTitle);
						imgTag.setAttribute('title', realityObject.modelTitle);
					}
					imgTag.setAttribute('style', "border:0; border-radius: "+boxBorderRadius+";");
					if(realityObject.modelImageUrl){ 
						imgTag.src = realityObject.modelImageUrl; 
					}
					aTag.appendChild(imgTag);
				}
			}
			
		} else if(oS === "Android") {

			// Construct reality object
			realityObject.title = realityTitle;
			realityObject.subtitle = realitySubtitle_android;
			realityObject.modelTitle = realityElement.getAttribute('title');
			realityObject.modelImageUrl = realityElement.getAttribute('image');
			realityObject.modelUrl = realityElement.getAttribute('model-android');
			
			// If the folder-path convention is used
			if(realityElement.getAttribute('src') && realityElement.getAttribute('src') !== ""){
				var path = realityElement.getAttribute('src');
				
				// Get the last char of the path 
				var lastChar = path.charAt(path.length-1);
				
				// Check to see if the dev added a slash and remove it if so
				if(lastChar === '/'){
					path = path.slice(0, path.length-1) + path.slice(path.length);
				}
				
				var assetName = path.split("/").pop();
				
				if(realityElement.getAttribute('model-android') && realityElement.getAttribute('model-android') !== ""){
					realityObject.modelUrl = realityElement.getAttribute('model-android');
				} else {
					realityObject.modelUrl = path + '/android/' + assetName + '.gltf';
				}
				
				if(realityElement.getAttribute('image') && realityElement.getAttribute('image') !== ""){
					realityObject.modelImageUrl = realityElement.getAttribute('image');
				} else {
					realityObject.modelImageUrl = path + '/image/' + assetName + '.jpg';
				}
				
				if(!realityObject.modelTitle || realityObject.modelTitle === null || realityObject.modelTitle === ""){
					var nameCapitalized = assetName.charAt(0).toUpperCase() + assetName.slice(1);
					realityObject.modelTitle = nameCapitalized;
				}
			} 
			
			// Create a model-viewer component
			var mvTag = document.createElement('model-viewer');
			mvTag.setAttribute('style', "width:100%; height:100%; border:0; border-radius: "+boxBorderRadius+"; overflow: hidden;");
			mvTag.setAttribute('src', realityObject.modelUrl);
			mvTag.setAttribute('alt', realityObject.modelTitle);
			mvTag.setAttribute('ar', true);
			mvTag.setAttribute('shadow-intensity', "1");
			mvTag.setAttribute('camera-controls', true);
			mvTag.setAttribute('magic-leap', true);
			mvTag.setAttribute('autoplay', true);
			// mvTag.setAttribute('background-color',"#ececec");
			
			if (realityObject.modelImageUrl && realityObject.modelImageUrl.length>0) {
				mvTag.setAttribute('poster', realityObject.modelImageUrl);
				mvTag.setAttribute('reveal', "auto");
			}

			if (realityElement.getAttribute('environment-image')) {
				mvTag.setAttribute('environment-image', realityElement.getAttribute('environment-image'))
			}

			if (realityElement.getAttribute('skybox-image')) {
				mvTag.setAttribute('skybox-image', realityElement.getAttribute('skybox-image'))
			}
			if (realityElement.getAttribute('shadow-intensity')) {
				mvTag.setAttribute('shadow-intensity', realityElement.getAttribute('shadow-intensity'))
			}
			if (realityElement.getAttribute('camera-orbit')) {
				mvTag.setAttribute('camera-orbit', realityElement.getAttribute('camera-orbit'))
			}
			if (realityElement.getAttribute('max-camera-orbit')) {
				mvTag.setAttribute('max-camera-orbit', realityElement.getAttribute('max-camera-orbit'))
			}
			if (realityElement.getAttribute('min-camera-orbit')) {
				mvTag.setAttribute('min-camera-orbit', realityElement.getAttribute('min-camera-orbit'))
			}

			if (slotsElements.length>0) {
				console.log('adding slots...');
				slotsElements.forEach(slot => {mvTag.appendChild(slot);});
			}
			
			realityPreviewElement.appendChild(mvTag);

		} else {

			// Construct reality object
			realityObject.title = realityTitle_noAr;
			realityObject.subtitle = realitySubtitle_noAr;
			realityObject.modelTitle = realityElement.getAttribute('title');
			realityObject.modelImageUrl = realityElement.getAttribute('image');
			realityObject.modelUrl = realityElement.getAttribute('model-android');
			
			// If the folder-path convention is used
			if(realityElement.getAttribute('src') && realityElement.getAttribute('src') !== ""){
				var path = realityElement.getAttribute('src');
				
				// Get the last char of the path 
				var lastChar = path.charAt(path.length-1);
				
				// Check to see if the dev added a slash and remove it if so
				if(lastChar === '/'){
					path = path.slice(0, path.length-1) + path.slice(path.length);
				}
				
				var assetName = path.split("/").pop();
				
				if(realityElement.getAttribute('model-android') && realityElement.getAttribute('model-android') !== ""){
					realityObject.modelUrl = realityElement.getAttribute('model-android');
				} else {
					realityObject.modelUrl = path + '/android/' + assetName + '.gltf';
				}
				
				if(realityElement.getAttribute('image') && realityElement.getAttribute('image') !== ""){
					realityObject.modelImageUrl = realityElement.getAttribute('image');
				} else {
					realityObject.modelImageUrl = path + '/image/' + assetName + '.jpg';
				}
				
				if(!realityObject.modelTitle || realityObject.modelTitle === null || realityObject.modelTitle === ""){
					var nameCapitalized = assetName.charAt(0).toUpperCase() + assetName.slice(1);
					realityObject.modelTitle = nameCapitalized;
				}
			} 
			
			if (realityElement.getAttribute('display-image') && realityElement.getAttribute('display-image') !== "no"){
			
				// Create a preview image
				if(realityObject.modelImageUrl){ 
					var imgTag = document.createElement('img');
					imgTag.setAttribute('width', boxWidth);
					imgTag.setAttribute('height', boxHeight);
					if(realityObject.modelTitle){ 
						imgTag.setAttribute('alt', realityObject.modelTitle);
						imgTag.setAttribute('title', realityObject.modelTitle);
					}
					imgTag.setAttribute('style', "border:0; border-radius: "+boxBorderRadius+";");
					imgTag.src = realityObject.modelImageUrl; 
					realityPreviewElement.appendChild(imgTag);
				} else {
					// Create a spacer div tag
					var divTag = document.createElement('div');
					divTag.setAttribute('style', "width:100%; height:100%; display:block; border-radius: "+boxBorderRadius+"; overflow: hidden;");
					realityPreviewElement.appendChild(divTag);
				}
			
			} else {
				
				// Create a model-viewer component
				var mvTag = document.createElement('model-viewer');
				mvTag.setAttribute('style', "width:100%; height:100%; border:0; border-radius: "+boxBorderRadius+"; overflow: hidden;");
				mvTag.setAttribute('src', realityObject.modelUrl);
				mvTag.setAttribute('alt', realityObject.modelTitle);
				mvTag.setAttribute('reveal', "auto");
				mvTag.setAttribute('shadow-intensity', "1");
				mvTag.setAttribute('camera-controls', true);
				mvTag.setAttribute('autoplay', true);
				// mvTag.setAttribute('background-color',"#ececec");

				if (realityObject.modelImageUrl && realityObject.modelImageUrl.length>0) {
					mvTag.setAttribute('poster', realityObject.modelImageUrl);
					mvTag.setAttribute('reveal', "auto");
				}
				
				/* if(realityElement.getAttribute('display-image') && realityElement.getAttribute('display-image') !== "no"){
					mvTag.setAttribute('poster', realityObject.modelImageUrl);
					mvTag.setAttribute('reveal', "interaction");
				} else {
					mvTag.setAttribute('reveal', "auto");
				} */

				if (realityElement.getAttribute('environment-image')) {
					mvTag.setAttribute('environment-image', realityElement.getAttribute('environment-image'))
				}
				if (realityElement.getAttribute('skybox-image')) {
					mvTag.setAttribute('skybox-image', realityElement.getAttribute('skybox-image'))
				}
				if (realityElement.getAttribute('shadow-intensity')) {
					mvTag.setAttribute('shadow-intensity', realityElement.getAttribute('shadow-intensity'))
				}
				if (realityElement.getAttribute('camera-orbit')) {
					mvTag.setAttribute('camera-orbit', realityElement.getAttribute('camera-orbit'))
				}
				if (realityElement.getAttribute('max-camera-orbit')) {
					mvTag.setAttribute('max-camera-orbit', realityElement.getAttribute('max-camera-orbit'))
				}
				if (realityElement.getAttribute('min-camera-orbit')) {
					mvTag.setAttribute('min-camera-orbit', realityElement.getAttribute('min-camera-orbit'))
				}

				if (slotsElements.length>0) {
					console.log('adding slots...');
					slotsElements.forEach(slot => {mvTag.appendChild(slot);});
				}
				
				realityPreviewElement.appendChild(mvTag);
			}
		}
		
		// Set the style for the HTML main element and the overlay optionals
		realityElement.setAttribute('style', "margin:"+boxMargin+";  width: "+boxWidth+"; height: "+boxHeight+"; border-radius: "+boxBorderRadius+"; background-color: transparent; display: inline-block; overflow: hidden; box-sizing: border-box;");
		
		realityPreviewElement.setAttribute('style', "position: absolute; width: "+boxWidth+"; height: "+boxHeight+"; display: block; overflow: hidden; background-color: "+boxBackgroundColor+";  border-radius: "+boxBorderRadius+";");
		
		// Clear and reappend the element
		realityElement.innerHTML = "";
		realityElement.appendChild(realityPreviewElement);
		
		// Configure overlay optionals
		var realityElementEditorialContainer = document.createElement('div');
		realityElementEditorialContainer.setAttribute('style', "position: relative; width: calc(100%); height:calc("+boxHeight+" - 66px); overflow: hidden; margin-top:0px; display: block; user-select: none; pointer-events: none; background-color:rgba(0,0,0,0.0)");
		if(realityElement.getAttribute('display-editorial') && realityElement.getAttribute('display-editorial') !== "no"){

			var realityElementEditorialLabel = document.createElement('div');
			realityElementEditorialLabel.setAttribute('style', "width:70px; border:0px solid white; margin-top:20px; margin-left:20px; display: block; border-radius:10px; padding:4px; font-size:7px; line-height:11px; background-color:rgba(0,0,0,0.3); font-family: Arial, Helvetica, sans-serif;");
			realityElementEditorialLabel.innerText = realityEditorialCopy;

			realityElementEditorialContainer.appendChild(realityElementEditorialLabel);
		}
		realityElement.appendChild(realityElementEditorialContainer);
		
		// console.log('OS:', oS);
		if(oS==='iOS' && realityElement.getAttribute('display-instructions') && realityElement.getAttribute('display-instructions') !== "no"){
			var realityElementTitleContainer = document.createElement('div');
			realityElementTitleContainer.setAttribute('style', "position: relative; width: calc(100%); height:200px; overflow: hidden; margin-top:0px; display: block; user-select: none; pointer-events: none; background-color:rgba(0,0,0,0.0)");

			var realityElementTitleLabel = document.createElement('div');
			realityElementTitleLabel.setAttribute('id', 'ar-instructions');
			realityElementTitleLabel.setAttribute('style', "border:0px solid white; margin-top:0px; margin-left:0px; display: block; border-radius:0px; padding-top:8px; padding-bottom:4px; font-size:15px; background-color:rgba(0,0,0,0.0); text-shadow: 0 0 4px #000; color:white; font-family: Arial, Helvetica, sans-serif;");
			realityElementTitleLabel.innerHTML = realityObject.title;

			var realityElementSubtitleLabel = document.createElement('div');
			realityElementSubtitleLabel.setAttribute('style', "border:0px solid white; margin-top:0px; margin-left:0px; display: block; border-radius:0px; padding-top:4px; padding-bottom:8px; font-size:11px; background-color:rgba(0,0,0,0.0); text-shadow: 0 0 4px #000; color:white; font-family: Arial, Helvetica, sans-serif;");
			realityElementSubtitleLabel.innerHTML = realityObject.subtitle;

			realityElementTitleContainer.appendChild(realityElementTitleLabel);
			realityElementTitleContainer.appendChild(realityElementSubtitleLabel);
			realityElement.appendChild(realityElementTitleContainer);
		}

		// Remove blue line when user interact with the model
		const mv = realityElement.querySelector('model-viewer');
		if (mv) {
			mv.addEventListener('scene-graph-ready', function() {
				const ui = document.querySelector('model-viewer').shadowRoot.querySelector('.userInput');
				ui.style.outline = 'none'
			})
		}
	
	}	// end loop for all reality elements available

	window.dispatchEvent( new CustomEvent('reality-loaded') );
}

// Let's go!
window.onload = function () {
	// console.log('Loading reality script!');
	// Begin setup:
	realitySetup();
};