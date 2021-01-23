function getMobileOperatingSystem() {

	// Get user agent 
	const userAgent = navigator.userAgent || navigator.vendor || window.opera;

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

// Setup the components
function realitySetup() {
	console.log('Starting arlene-vto.js')

	const scripts = Array.from(document.getElementsByTagName('script'));
	const mvScript = scripts.find(script => script.src.search('/model-viewer')>0)
	if (!mvScript) {
		// Import Model-Viewer script
		const modelViewerVersion = '1.4.0';

		const modelViewerImport = document.createElement('script');
		modelViewerImport.type = 'module';
		modelViewerImport.src = 'https://unpkg.com/@google/model-viewer@'+modelViewerVersion+'/dist/model-viewer.min.js';
		document.head.appendChild(modelViewerImport);

		// Import Model-Viewer legacy script
		const modelViewerImport_noModule = document.createElement('script');
		modelViewerImport_noModule.setAttribute('nomodule', true);
		modelViewerImport_noModule.src = 'https://unpkg.com/@google/model-viewer@'+modelViewerVersion+'/dist/model-viewer-legacy.js';
		document.head.appendChild(modelViewerImport_noModule);
	}

	// extract attribute from element
	function getLocalAttribute(el, attr) {
		return el.getAttribute(attr) || null;
	}
	
	// Detect the device OS
	const oS = getMobileOperatingSystem();

	

	// Get the reality-tags 
	const realityElements = document.getElementsByTagName("reality");

	if (realityElements.length===0) {
		console.info('tags not processed yet... please use realitySetup() later')
		return false;
	}


	// Loop through the reality-tag elements
	for(let i = 0; i < realityElements.length; i++) {

		let boxWidth = null;
		let boxHeight = null;
		let boxBorderRadius = '0';
		let boxBackgroundColor = 'transparent'; // '#222';
		let boxMargin = "auto";

		const realityElement = realityElements[i];

		// avoid double init from tags already created
		if (realityElement.querySelector('model-viewer')) { continue; }

		// Extract slots to pass them to model-viewer
		const slotsElements = Array.from(realityElement.children).filter(child => child.getAttribute('slot'));

		// Capture any user defined box-style attributes 

		if (getLocalAttribute(realityElement, 'box-width')) {
			boxWidth = getLocalAttribute(realityElement, 'box-width') + 'px';
		}
		if (getLocalAttribute(realityElement, 'box-height')) {
			boxHeight = getLocalAttribute(realityElement, 'box-height') + 'px';
		}
		if (getLocalAttribute(realityElement, 'box-radius')) {
			boxBorderRadius = getLocalAttribute(realityElement, 'box-radius') + 'px';
		}

		const margin = getLocalAttribute(realityElement, 'box-margin');
		if (margin && parseInt(margin)>0) {
			boxMargin = getLocalAttribute(realityElement, 'box-margin') + 'px';
		}
		if (getLocalAttribute(realityElement, 'box-background-color')) {
			boxBackgroundColor = getLocalAttribute(realityElement, 'box-background-color');
		}

		realityElement.setAttribute('style', `
			margin: ${boxMargin};
			width: ${boxWidth}; height: ${boxHeight};
			border-radius: ${boxBorderRadius};
			overflow: hidden; display: block;
			box-sizing: border-box;
			background-color: ${boxBackgroundColor}
			`);

		const glbModelURL = getLocalAttribute(realityElement, 'model-android');
		const iosModelURL = getLocalAttribute(realityElement, 'model-ios');
		const modelTitle = getLocalAttribute(realityElement, 'title');

		const mvTag = document.createElement('model-viewer');
		mvTag.setAttribute('style', "width:100%; height:100%; border-radius: "+boxBorderRadius+"; overflow: hidden;");
		mvTag.setAttribute('src', glbModelURL);
		mvTag.setAttribute('alt', modelTitle);
		mvTag.setAttribute('ar', true);
		mvTag.setAttribute('shadow-intensity', "1");
		mvTag.setAttribute('camera-controls', true);
		mvTag.setAttribute('magic-leap', true);
		mvTag.setAttribute('autoplay', true);
		// mvTag.setAttribute('background-color',"#ececec");
		mvTag.setAttribute('reveal', "auto");
		
		if (oS==='iOS') {
			mvTag.setAttribute('ar-modes', "quick-look");
			mvTag.setAttribute('quick-look-browsers', "safari chrome");
			iosModelURL && mvTag.setAttribute('ios-src', iosModelURL);
		}

		// Optional Attributes
		mvTag.setAttribute('poster', getLocalAttribute(realityElement, 'image'));
		mvTag.setAttribute('environment-image', getLocalAttribute(realityElement, 'environment-image'))
		mvTag.setAttribute('skybox-image', getLocalAttribute(realityElement, 'skybox-image'))
		mvTag.setAttribute('shadow-intensity', getLocalAttribute(realityElement, 'shadow-intensity'))
		mvTag.setAttribute('camera-orbit', getLocalAttribute(realityElement, 'camera-orbit'))
		mvTag.setAttribute('max-camera-orbit', getLocalAttribute(realityElement, 'max-camera-orbit'))
		mvTag.setAttribute('min-camera-orbit', getLocalAttribute(realityElement, 'min-camera-orbit'))
		
		if (slotsElements.length>0) {
			slotsElements.forEach(slot => {mvTag.appendChild(slot);});
		}

		realityElement.appendChild(mvTag);
	}

	window.dispatchEvent( new CustomEvent('reality-loaded') );
}

// Let's go!
realitySetup()
// document.addEventListener('DOMContentLoaded', realitySetup);
