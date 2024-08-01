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






/*saveAction = function (actionDuration, actionId, actionInput, inputFileExtension , actionDescription , sessionId , inputImage , actionName) {
  
  let servicename= "SaveAction";
  let URL = workTrackURLprefix + servicename ;
  let params = {
	actionDuration: actionDuration,
	actionId: actionId,
	actionInput: actionInput,
	inputFileExtension: inputFileExtension,
	actionDescription: actionDescription,
	sessionId:  sessionId,
	inputImage: inputImage,
	actionName: actionName
    
  };
  

  try {
    let headers = {
      Accept: 'application/json',
      "Content-Type": 'application/json',
      appKey: appKey
    };
    // Body
    $http.post(URL, params, {
      headers: headers,
    })
      .then(
      function (data) {
        if (data) {
          console.log('Completed THX '+ servicename+ ' request - response =' , data);

          let saveActionData = data.data;

          if (data.statusText ==="OK" && !saveActionData.rows[0].result.includes('failed' )) {

            // all ok 

          } else if (saveActionData.rows[0].result.includes('failed' )) {

            showIssue("Unexpected Save action failure ", saveActionData.rows[0].result + "  sessionId=" +sessionId + " actionName=" + actionName + " actionInput=" + actionInput  );
          }

        }
      },
      function (status) {
        console.log("THX Service Failure Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/"+ servicename +" service failed!"+ "\n" + "The status returned was:  "+ status + "\n");
        
        showIssue("Unexpected Save action failure ", "Thingworx/PTCSC.SOWI.WorkTrack.Manager/Services/"+ servicename +" failed!"+ "\n" + "The status returned was:  "+ status + "\n" + "params =" + JSON.stringify(params) );
        
      }
    )
  } catch (e) {
    console.log("THX Service " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
     showIssue("Unexpected Save action failure THX Service " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
  }
  

  
}*/

/*endStep = function (sessionId, stepId, acknowledgement) {


    try {

        let servicename = "EndStep";
        let URL = workTrackURLprefix + servicename;
        let params = {
            sessionId: sessionId,
            stepId: stepId,
            acknowledgement: acknowledgement

        };


        let headers = {
            Accept: 'application/json',
            "Content-Type": 'application/json',
            appKey: appKey
        };
        // Body
        $http.post(URL, params, {
            headers: headers,
        })
          .then(
          function (data) {
            if (data) {
              console.log('Completed THX ' + servicename + ' request - response =', data);

              let endStepData = data.data;
              if (data.statusText === "OK" && !endStepData.rows[0].result.includes('failed')) {
                // all ok 
              } else if (saveActionData.rows[0].result.includes('failed')) {
                showIssue("Unexpected end step failure ", endStepData.rows[0].result);
              }
            }
          },
          function (status) {
            console.log("THX Service " + servicename + " Failure Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/" + servicename + " service failed!" + "\n" + "The status returned was:  " + status + "\n");

            showIssue("Unexpected Save action failure ", "Thingworx/PTCSC.SOWI.WorkTrack.Manager/Services/"+ servicename +" failed!"+ "\n" + "The status returned was:  "+ status + "\n" + "params =" + JSON.stringify(params) );
          }
        )


    } catch (e) {
        console.log("THX Service " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
        showIssue("Unexpected THX Service " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
    }
}
*/



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





















