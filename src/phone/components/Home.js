// $scope, $element, $attrs, $injector, $sce, $timeout, $http, $ionicPopup, and $ionicPopover services are available


// Notes: 
// If the sxsl player does not load as expected
// Check that the class on the 2D Overlay has been set to sxslroot
//

console.log($scope.app);

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Globals
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const workTrackURLprefix  = '/Thingworx/Things/PTCSC.SOWI.WorkTrack.Manager/Services/'
const appKey = "80d2567c-d0b2-4b72-8bc6-e021f579485a";
const headers = {
  Accept: 'application/json',
  "Content-Type": 'application/json',
  appKey: appKey
};

let SESSION_ID ;   				// This copmes from THX service and probbaly bested add to an app param
let PROCEDURE_ID;  				// This will come from the sxsl procedure 
let PROCEDURE_START_TIME; 		// This will come from the event procstart 

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// local helper functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

showIssue = function (message, systemMessage) {
  
	$scope.setWidgetProp("labelHomeIssueMessage1","text", message);
	$scope.setWidgetProp("labelHomeIssueMessage2","text", systemMessage);
	$scope.setWidgetProp("popupHomeIssues","visible", true); 
}



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Exposed Studio Functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

$scope.showHideSteps = function () {
  
  let state = $scope.getWidgetProp("popupSteps" , "visible");
  if (state === true) {
    $scope.setWidgetProp("popupSteps" , "visible" , false);
  } else {
    $scope.setWidgetProp("popupSteps" , "visible", true);
  }
  
}

$scope.toggleInfo = function () {
  
  let state = $scope.getWidgetProp("popupSettingInfo", "visible");
  // if (state === "visible") {
  //   $scope.setWidgetProp("popupSettingInfo", "visible" , false);
  // } else {

  //   $scope.setWidgetProp("popupSettingInfo", "visible" , true);
  // }

  let result = state === "visible" ? $scope.setWidgetProp("popupSettingInfo", "visible" , false) : $scope.setWidgetProp("popupSettingInfo", "visible" , true)
  
}


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Events
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//










//This function will execute each time the view is loaded
$scope.$on("$ionicView.loaded", function (event) {
    // Check we have coeSxSLHelper
    
  if (typeof $rootScope.sxslHelper === 'object' && $rootScope.sxslHelper !== null ) {
    console.log(">>>> $rootScope.sxslHelper is a valid object");

  } else {
    
    console.log(">>>> $rootScope.sxslHelper is NOT a valid object !!!!!!!!!!!!!");
        
    showIssue("$rootScope.sxslHelper is NOT a valid object this is unexpected!" , "Failed to create a useable object from the json data");
  }

});





















