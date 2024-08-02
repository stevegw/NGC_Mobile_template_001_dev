console.log($scope.app);

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Globals
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const UPLOADPATH = "app/resources/Uploaded/";
const workTrackURLprefix  = '/Thingworx/Things/PTCSC.SOWI.WorkTrack.Manager/Services/'
const appKey = "80d2567c-d0b2-4b72-8bc6-e021f579485a";
const headers = {
  Accept: 'application/json',
  "Content-Type": 'application/json',
  appKey: appKey
};

let SXSLData ;
let ShowStartSplash = true;

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// local helper functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


getJSON = function(data){

  //console.log ("getJSON: Working on Data >>>"+ data);
  SXSLData= JSON.parse(data);

}

showIssue = function (message, systemMessage) {
  
	$scope.setWidgetProp("labelIssueMessage1","text", message);
	$scope.setWidgetProp("labelIssueMessage2","text", systemMessage);
	$scope.setWidgetProp("popupIssue","visible", true); 
  
}




  
showIntroPopup = function () {
  
  $scope.setWidgetProp("labelProcDescription", "text", SXSLData.title.resources[0].text );
  
  $scope.setWidgetProp("labelProcVersion", "text", SXSLData.versionId );
  

  
  let dateStr = SXSLData.publishDate;
  let dateObj = new Date(dateStr);
  let readableDate = dateObj.toLocaleString();
  $scope.setWidgetProp("labelProcPubDate", "text", readableDate );
  try {
    $scope.setWidgetProp("labelProcIntro", "text", SXSLData.introduction.resources[0].text );
  } catch (err) {
    //ignore 
    $scope.setWidgetProp("labelProcIntro", "text", "No introduction found" );
  }
  
  $scope.setWidgetProp("popupIntro", "visible", true);

}


showHideProcButtons = function (showWorkOrder,showHideNewProc, showHideResumeProc) {
  
    $scope.setWidgetProp("buttonScanForWorkOrder", "visible", showWorkOrder);
    $scope.setWidgetProp("buttonStartNewProc", "visible", showHideNewProc);
    $scope.setWidgetProp("buttonResumeProc", "visible", showHideResumeProc);
  
}


lookupProcedure = function (wonum) {
  
  let URL = workTrackURLprefix + "StartProcedureSession";
  
  
  // Check for valid procedure name/id

  $scope.app.params.procedureId  = $rootScope.sxslHelper.getId();
  $scope.app.params.procedureVersionId  = $rootScope.sxslHelper.getVersionId();
  
  let params = {
	appVersion: "iPad6,3; iOS18.1.1",
	procedureLastEditor: "no lonegr used",
	procedureVersion: $rootScope.sxslHelper.getVersionId(),
	procedureDescription: $rootScope.sxslHelper.getDescription(),
	relatedProduct: "Some related Product" /* STRING */,
	relatedAsset: "Some related Asset" /* STRING */,
	workOrderNumber: wonum /* STRING */,
	language: "en-US" /* STRING */,
	devicePlatform: "mobile" /* STRING */,
	//userName: $scope.app.params.username /* STRING */, //no longer needed
	procedureId: $rootScope.sxslHelper.getId() /* STRING */,
	procedureTitle: $rootScope.sxslHelper.getTitle() /* STRING */
    
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
          console.log('Completed THX request' , JSON.stringify(data.config.data));
          
          if(data.data.rows.length > 0) {
            
            let sessionId =data.data.rows[0].sessionId;
            $scope.app.params.sessionId = sessionId;
            let message =data.data.rows[0].message;
            let workOrderProcedureStatus = data.data.rows[0].workOrderProcedureStatus;
            let lastFinishedActionId = data.data.rows[0].lastFinishedActionId;
            
            $rootScope.sxslHelper.setWorkTrackSessionId(sessionId);
            $rootScope.sxslHelper.setWorkTrackMessage(message);

            if (message === "OK" ) {
              
              // now check for new or resume
              if (lastFinishedActionId != undefined && lastFinishedActionId != "" && workOrderProcedureStatus == "started"  ) {
                // Resume
              
                $rootScope.sxslHelper.setLastFinishedActionId(data.data.rows[0].lastFinishedActionId);
                // refresh and resume buttons 
                $scope.setWidgetProp("labelUserMessage", "text", "Procedure has already '" + workOrderProcedureStatus  + "' Click Start New or Resume" ); 
                showHideProcButtons(false, true, true);
                showIntroPopup();     

              } else if ((lastFinishedActionId === undefined || lastFinishedActionId === "") && workOrderProcedureStatus == "started" ) {
                
                $scope.startNewProcedure();
                
              } else {
                // unknown state maybe 
                showIssue("Unexpected Issue workOrderProcedureStatus " + workOrderProcedureStatus , message );
                
              }

          	} else {
              // display possible issue
              showIssue("workOrderProcedureStatus " + workOrderProcedureStatus , message );
              
            }

          } else {
            
            // display possible issue
            showIssue("Unexpected issue no data returned  " , " Connect with Administrator to investigate" );
          }
                        
        }
      },
      function (status) {
        console.log("THX Service " + servicename + " Failure", "Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/'+ servicename +' service failed!"+ "\n" + "The status returned was:  "+ status + "\n");
      }
    )
  } catch (e) {
    console.log("THX Service " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
  }
  
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Exposed Studio Functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

$scope.toggleInfo = function () {
  
  let state = $scope.getWidgetProp("popupHelp", "visible");
  // if (state === "visible") {
  //   $scope.setWidgetProp("popupIntro", "visible" , false);
  // } else {

  //   $scope.setWidgetProp("popupIntro", "visible" , true);
  // }

  let result = state === "visible" ? $scope.setWidgetProp("popupIntro", "visible" , false) : $scope.setWidgetProp("popupIntro", "visible" , true);
  
}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
// Will execute when the STEP STARTS - stepStart
//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

$rootScope.$on('stepStart', function (evt, step) {
	console.log(">>>> stepStart " + new Date() +  " event: " + JSON.stringify(step));   
    if ($scope.app.params.sessionId != undefined){
      let stepTitle =   $rootScope.sxslHelper.getTitle();
      let stepDescription = $rootScope.sxslHelper.getDescription(); // this could be blank
      let stepStartTime = Date.now();
      let si = $rootScope.sxslHelper.getWorkTrackSessionId();
      $rootScope.startStep(si, step.id, step.title, stepDescription , stepStartTime );   
	}
  

});



$rootScope.startStep = function (sessionId, stepId , stepTitle , stepDescription , stepStartTime ) {
  let servicename= "StartStep";
  let URL = workTrackURLprefix + servicename;
  let params = {

	sessionId:  sessionId,
	stepId: stepId,
	stepTitle: stepTitle,
  stepDescription: stepDescription

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
          console.log('Completed THX ' + servicename +' request - response =' , data);

          let startStepData = data.data;

          if (data.statusText ==="OK" && !startStepData.rows[0].result.includes('failed' )) {

            // all ok 

          } else if (startStepData.rows[0].result.includes('failed' )) {

            showIssue("Unexpected StartStep failure Params= " + " sessionId=" + data.config.data.sessionId + " stepId=" + data.config.data.stepId + " stepTitle=" + data.config.data.stepTitle + " stepDescription=" + data.config.data.stepDescription , startStepData.rows[0].result );

          }

        }
      },
      function (status) {
        console.log("THX Service Failure Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/"+ servicename +" service failed!"+ "\n" + "The status returned was:  "+ status + "\n");
        
        showIssue("Unexpected StartStep failure ", "Thingworx/PTCSC.SOWI.WorkTrack.Manager/Services/"+ servicename +" failed!"+ "\n" + "The status returned was:  "+ status + "\n" + "params =" + JSON.stringify(params) );
        
      }
    )
  } catch (e) {
    console.log("THX Service " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
     showIssue("Unexpected THX Service " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
  }
   
}



// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
// Will execute when the ACTION STARTS - actionStart
//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

$rootScope.$on('actionStart', function (evt, action) {
  console.log(">>>> actionStart event:  " + JSON.stringify(action)); 
  
  let actionId = action.id;
  let actionInput = 'test input' ; // place holder
  let inputFileExtension = '';
  let actionDescription = action.instruction;
  let sessionId = $rootScope.sxslHelper.getWorkTrackSessionId();
  let inputImage = " " ; 
  let actionName = action.base.actiontitle;

  
  $rootScope.sxslHelper.setActionStartTime(action.id , new Date().getTime()); 
  let step = $rootScope.sxslHelper.getStepbyID(action.stepid);
  
  
});




// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
// Will execute when the ACTION DELIVERED - actionInputDelivered
//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
$rootScope.$on('actionInputDelivered', function (evt, action) {
  
  $rootScope.actionInputDelivered(action.action);
  
})


$rootScope.actionInputDelivered = function ( action) {
  
  //
  let servicename= "SaveAction";
  let URL = workTrackURLprefix + servicename ;
  
  
  let actionId = action.id;
  let stepId = action.step.id;
  let responseArray = action.details.response[action.details.ID];
  let actionName = action.details.title.resources[0].text;
  let actionInstruction = action.instruction;
  let actionDuration = $rootScope.sxslHelper.setActionEndTime(actionId , responseArray[0].time );
  let inputImage = " ";
	let inputFileExtension= " ";
  let actionInput;

  responseArray.sort(function(a, b) {
  	return a.time - b.time;
  });
  

  console.log(">>>> response array  "+ responseArray);
  
  // for now get the first response 

  if (responseArray[0].response != undefined &&  responseArray[0].type === "CaptureImage" ) {
    $rootScope.actionPending = true;    //Slowing down processing to address the upload of an Image
    inputImage = responseArray[0].response;
    actionInput= "";
    if (responseArray[0].response.startsWith("data:image/png;base64") ) {

      let contentArray = responseArray[0].response.split(",");
      if (contentArray.length > 1) {
        inputImage = contentArray[1];
        inputFileExtension = "png";
      }
    }
  } else {
    $rootScope.actionPending = false;
    actionInput= responseArray[0].response;

  }
  
  let params = {
    actionDuration: actionDuration,
    actionId: actionId,
    actionInput: actionInput,
    inputFileExtension: inputFileExtension,
    actionDescription: actionInstruction,
    sessionId:   $rootScope.sxslHelper.getWorkTrackSessionId(),
    inputImage: inputImage,
    actionName: actionName,
    stepId: stepId 
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
        $rootScope.actionPending = false;
        if (data) {
          console.log('Completed THX '+ servicename+ ' request - response =' , data);

          let saveActionData = data.data;

          if (data.statusText ==="OK" && !saveActionData.rows[0].result.includes('failed' )) {

            // all ok 

          } else if (saveActionData.rows[0].result.includes('failed' )) {
            showIssue("Unexpected Save action failure Params= " + " sessionId=" + data.config.data.sessionId + " stepId=" + data.config.data.stepId + + " actionId=" + data.config.data.actionId + " actionInput=" + data.config.data.actionInput + "  actionName=" + data.config.data.actionName, saveActionData.rows[0].result );
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
     showIssue("Unexpected Thingworx " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
  }
  
  
  
  
  
}




// 
// Will execute when the Action Ends.
//
/*$scope.$on('actionEnd', function (evt, action) {
  console.log(">>>> actionEnd event: " + JSON.stringify(action)); 
  
  let actionInput = 'test input' ; // place holder
  let inputFileExtension = '';
  let actionDescription = action.instruction;
  let sessionId = $rootScope.sxslHelper.getWorkTrackSessionId();
  let inputImage = " " ; 
  let actionName = action.base.actiontitle;
  let step = $rootScope.sxslHelper.getStepbyID(action.stepid); // don't need this 
  
  let actionDuration = $rootScope.sxslHelper.setActionEndTime(action.id , new Date().getTime()); // update the method to return duration 

  //let actionDuration = $rootScope.sxslHelper.getActionDuration(action.id);
  
  saveAction(actionDuration, action.id, actionInput, inputFileExtension , actionDescription , sessionId , inputImage , actionName);

  
});*/




// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
// Will execute when the STEP ENDS - stepEnd
//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
$rootScope.$on('stepEnd', function (evt, step) {
  console.log(">>>> stepEnd event: " + JSON.stringify(step));

  let acknowledgement = "...";
  let sessionId = $rootScope.sxslHelper.getWorkTrackSessionId();
  let acktype = step.ack.type;

  switch (step.ack.type) {

    case "Confirmation":

      acknowledgement = step.ack.response === "y" ? "Yes" : step.ack.response;
      break;

    case "PassFail":

      let resonType = step.ack.hasOwnProperty('reasonType');
      if (!resonType) {
        if (step.ack.response === "y") {
          acknowledgement = "Yes"
        }
        else if (step.ack.response === "f") {
          acknowledgement = "Fail";
        } else if (step.ack.response === "p") {
          acknowledgement = "Pass";
        } else {
          acknowledgement = step.ack.response;
        }
      } else {
        //complex type 
        if (step.ack.reasonType === "Code") {
          let found = false;
          for (let i = 0; i < step.ack.reasonCodes.length; i++) {
            if (step.ack.reasonCodes[i].code === step.ack.response) {
              acknowledgement = step.ack.reasonCodes[i].resources[0].text;
              found = true;
              break;
            }
          }
          if (!found) {
            acknowledgement = step.ack.response;
          }
        }
      }
      break;

    default:
      acknowledgement = step.ack.response;
      break;
  }

  var checkActionPending = setInterval(function () {
    if (!$rootScope.actionPending) {
      console.log("#### -> going to run " + step.id + " for Sesssion = " + sessionId);
      $rootScope.endStep(sessionId, step.id, acknowledgement);
      clearInterval(checkActionPending);
    }
  }, 1000); // checks every 1000 milliseconds (1 second)


});


$rootScope.endStep = function (sessionId, stepId, acknowledgement) {


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
              } else if (endStepData.rows[0].result.includes('failed')) {
                showIssue("Unexpected EndStep failure Params= stepId=" + data.config.data.stepId + " WorkOrderNumber=" +  $scope.app.params.workordernumber  , endStepData.rows[0].result  );
              }
            }
          },
          function (status) {
            console.log("THX Service " + servicename + " Failure Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/" + servicename + " service failed!" + "\n" + "The status returned was:  " + status + "\n");

            showIssue("Unexpected EndStep failure ", "Thingworx/PTCSC.SOWI.WorkTrack.Manager/Services/"+ servicename +" failed!"+ "\n" + "The status returned was:  "+ status + "\n" + "params =" + JSON.stringify(params) );
          }
        )


    } catch (e) {
        console.log("THX Service " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
        showIssue("Unexpected THX Service " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
    }
}



// 
// Will execute when the Procedure is finshed.
//
$rootScope.$on('procEnd', function (evt, procedure) {
  console.log(">>>> procEnd event: " + JSON.stringify(procedure)); 
  
  let sessionId = $rootScope.sxslHelper.getWorkTrackSessionId() ;
  $rootScope.endProcedure(sessionId);

});





// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
// Will execute when the PROCEDURE END - actionInputDelivered
//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

$rootScope.endProcedure = function (sessionId) {
  
      try {
        
        let servicename = "EndProcedureSession";
        let URL = workTrackURLprefix + servicename;
        let params = {
            sessionId: sessionId
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
                showIssue("Unexpected EndProcedureSession failure ", endStepData.rows[0].result);
              }
            }
          },
          function (status) {
            console.log("THX Service " + servicename + " Failure Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/" + servicename + " service failed!" + "\n" + "The status returned was:  " + status + "\n");

            showIssue("Unexpected Save action failure ", "Thingworx/PTCSC.SOWI.WorkTrack.Manager/Services/"+ servicename +" failed!"+ "\n" + "The status returned was:  "+ status + "\n" + "params =" + JSON.stringify(params) );

          }
        )
        
        
        
      }  catch (e) {
        console.log("THX Service " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
        showIssue("Unexpected Save action failure ", "THX Service " + servicename + " Failure", 'Check application key or if server is running or error was ' + e);
    }
  
  
  
}







$scope.scanComplete = function () {

    let wonum =  $scope.getWidgetProp('scanWorkOrder','scannedValue' ); 
  	$scope.app.params.workordernumber = wonum;
    $rootScope.sxslHelper.setWorkOrder(wonum);    // Store the WorkOrder    
    
    lookupProcedure(wonum);
  
}


$scope.checkForScan = function () {

    let scanneeded = $rootScope.sxslHelper.WOScanNeeded();
    if (scanneeded) {
        // set user message
        $scope.setWidgetProp("labelUserMessage", "text", "Procedure Needs a Work Order Number" ); 
    }
    else {
        // No WorkOrder needed.
        $scope.setWidgetProp("labelUserMessage", "text", "Click New to start Procedure" ); 
        //$scope.app.fn.navigate("Home");
    }
  
    showHideProcButtons(true,false,false);
    showIntroPopup();
}



$scope.systemFullyInit = function () {
  
	  $scope.getUserName();              
    $scope.checkForScan();
  	$scope.app.params.prefill =  "";

}


$scope.startNewProcedure = function () {
  
  $rootScope.sxslHelper.setFreshRun(true);
  
  if ($rootScope.sxslHelper.getWorkOrder() !== undefined && $rootScope.sxslHelper.getWorkOrder() !== "") {
    
    let stepId = $rootScope.sxslHelper.getStepIdByNum(2);
    $scope.app.params.prefill = $rootScope.sxslHelper.getWorkTrackResumePreReq(stepId);
    
    let firstStepId = $rootScope.sxslHelper.getStepIdByNum(1);
    $scope.app.params.firstStepID = firstStepId;
    
  } 
  
  $scope.app.fn.navigate("Home");

  
}

$scope.resumeProcedure = function () {
  $rootScope.sxslHelper.setFreshRun(false);
  
  try {
    let lastFinishedActionId =  $rootScope.sxslHelper.getLastFinishedActionId();
    if (lastFinishedActionId != undefined & lastFinishedActionId != "" ) {

      //let stepNumber = $rootScope.sxslHelper.getWorkTrackStepNumberByActionId(lastFinishedActionId);
      //let stepId = $rootScope.sxslHelper.getWorkTrackStepIdByActionId(lastFinishedActionId);
      
      // $scope.app.params.prefill =   {actionId:lastFinishedActionId,status:"hold", reason: "not recorded"};                       //$rootScope.sxslHelper.getWorkTrackResumePreReq(stepId);
      
      $rootScope.getCompletedSteps(lastFinishedActionId);
      
      

    }



  } catch (error) {
    
    showIssue("Unexpected issue. Problem finding the last resume step.", error.message);
  }
}



$rootScope.getCompletedSteps = function (lastFinishedActionId ) {
  
  let completedSteps = [];
  let serviceName = "GetWorkOrderProcedureSteps";
  let URL = workTrackURLprefix + serviceName;
  let params = {
	workOrderNumber: $scope.app.params.workordernumber,
	procedureId: $rootScope.sxslHelper.getId(),
	procedureVersion: $rootScope.sxslHelper.getVersionId()
    
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
          console.log('Completed THX request' , JSON.stringify(data));

          let map = new Map();
          function addEntry(key, value) {
              if (!map.has(key)) {
                  map.set(key, value);
                  console.log(`Added: ${key} -> ${value}`);
              } else {
                  console.log(`Key "${key}" already exists with value "${map.get(key)}". No duplicates allowed.`);
              }
          }
        
          data.data.rows.forEach(function(step) {
            if (step.stepStatus === "finished") {
              addEntry(step.stepId , "done" );
            } 
          });
          
          let workInstructionId = $rootScope.sxslHelper.getWorkOrderStepID();
          if (workInstructionId ) {
            addEntry(workInstructionId , "done" );
          } 

          data.data.rows.forEach(function(step) {
              addEntry(step.stepId , "hold" );
          });

          for (let key of map.keys()) {
            console.log(key);
            completedSteps.push({stepId:key,status:map.get(key)});
          }
          if (lastFinishedActionId) {
            completedSteps.push({actionId:lastFinishedActionId,status:"hold"});
          }
          //$scope.app.params.prefill = completedSteps; 

          $scope.app.params.prefill =  $rootScope.sxslHelper.getWorkTrackResumeList(lastFinishedActionId);
          $scope.app.fn.navigate("Home");

          } else {
            // display possible issue
            showIssue("Unexpected issue no data returned from service " +  serviceName + "with params " + JSON.stringify(params) , " Connect with Administrator to investigate" );
          }

      },
      function (status) {
        console.log("Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/"+ servicename +"  service failed!"+ "\n" + "The status returned was:  "+ status + "\n");
      }
    )
  } catch (e) {
    console.log("Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/"+ servicename +" failed", 'Check application key or if server is running or error was ' + e);
  }
  
  

}





// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Load Libary functions - loadLibrary will launch on loading the experience 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function loadLibrary(src) {
    return new Promise(function (resolve, reject) {
        var head = document.head || document.getElementsByTagName('head')[0],
            script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'app/resources/' + src;
        head.appendChild(script);
        script.onload = resolve; // Resolve when script is loaded
        script.onerror = reject; // Reject if loading fails
    });
}

loadLibrary('Uploaded/sowiplayer/coeSxSLHelper.js')
    .then(function () {
        $rootScope.sxslHelper = new coeSxSLHelper();  
  
        var filepath =  "./app/resources/Uploaded/sowi.json";
        fetch(filepath)
            .then(response => response.text())
            .then(data => getJSON(data))
  			.then(data =>  $rootScope.sxslHelper.setSxSL(SXSLData))
            .then(function() {
               $scope.systemFullyInit();
        		})
  			.finally (function() {
              // Do any clean up
              //console.log (">>>> getJSON: Working on Data >>>"+ JSON.stringify(SXSLData));
          
        })
            .catch(function (error) { 
          	console.log(' #### JSON Fetch Error #### ', error); 
              showIssue("Problem reading sowi.json file. Please check in Uploaded location for sowi.json file.", error.message);
        	});
    })
    .catch(function (error) {
        console.error('Error loading library:', error);
    });

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// This function will execute each time the view is loaded
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

$scope.$on("$ionicView.loaded", function (event) {

    // Code here

});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Archived 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// GETUSER NAME from Thingworx session 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

$scope.getUserName = function () {
  
  
  let URL =   '/Thingworx/Resources/CurrentSessionInfo/Services/GetCurrentUser';

  let headers = {
    Accept: 'application/json',
    "Content-Type": 'application/json',
    appKey: appKey
  };

  
  $http.post(URL, {
    headers: headers,
  })
    .then((data) => {
    if (data.data.rows.length > 0) {
      console.log('Completed THX GetCurrentUser request' , JSON.stringify(data));
      $scope.app.params.username = data.data.rows[0].result;
    } else {
      console.error('THX Service GetCurrentUser Failure No user name returned');
      showIssue("GetCurrentUser Failure No user name returned.", "Make sure the the user was logged in");
    }
  })
    .catch((error) => {
    console.error('Error with request: ${error.message}');
    showIssue("Error with request. The URL used was " +URL, error.message);
  });
      

}



/*

$scope.$on('statusLogger', function (evt, value) {
  
  
  console.log(">>>> statusLogger:" + value);

  // 
  
  if (value.event === "procstart") {

    let PROCEDURE_ID = value.id ;
    let PROCEDURE_START_TIME = value.time;
 
  }
  //$rootScope.thingworxRequest(value , params , 'testrequest');
  
  // if SaveAction  // execute after input
  //   actionId
  //   actionName
  //   actionDescription
  //   actionInput
  //   actionDuration
  
  // if StartStep
  //   sessionId
  //   stepId
  //   stepTitle
  //   stepDescription
  
  // if EndStep
  //   sessionId
  //   stepId
  //   acknowledgement
  //   failReasons
  
  // if EndProcedureSession
  //   workOrderNumber
  //   procedureId
  //   procedureVersion
   
 
  let sessionId = $rootScope.sxslHelper.getWorkTrackSessionId() ;
  switch(value.event) {
      
    case "procstart":
      console.log(">>>> statusLogger event procstart: " + value.event);
      break;
      
    case "stepstart":
      console.log(">>>> statusLogger event stepstart: " + value.event);
     break;
    case "input": 
		console.log(">>>> statusLogger event input: " + value.event);
      	break;
    case "stepend":
	  console.log(">>>> statusLogger event stepend: " + value.event)
     break;      
      
    case "procend":
		console.log(">>>> statusLogger event procend: " + value.event)
		break; 
   default:
     console.log(">>>> statusLogger case default" );
     break;
  }

});

*/











