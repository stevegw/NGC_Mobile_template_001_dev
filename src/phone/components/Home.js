// $scope, $element, $attrs, $injector, $sce, $timeout, $http, $ionicPopup, and $ionicPopover services are available


console.log($scope.app);

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Globals
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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
  let result = state === "visible" ? $scope.setWidgetProp("popupSettingInfo", "visible" , false) : $scope.setWidgetProp("popupSettingInfo", "visible" , true)
  
}


$scope.returnToStart = function () {
  
  $scope.app.params.prefill = [];
  $scope.app.fn.navigate("startPoint");

  
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





















