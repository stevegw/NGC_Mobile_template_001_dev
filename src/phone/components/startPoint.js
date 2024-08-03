
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Globals
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const UPLOADPATH = "app/resources/Uploaded/";
const workTrackURLprefix = '/Thingworx/Things/PTCSC.SOWI.WorkTrack.Manager/Services/';


let SXSLData;
let ShowStartSplash = true;
//JH start 8/2
const DEBUG = JSON.parse($scope.app.params.jloggerdebug);

if (!$rootScope.logger) {
  console.log($scope.app);
  twx.app.fn.loadResourceScript('Uploaded/sowiplayer/jlogger.js');
  $timeout(function () {
    $rootScope.logger = new Jlogger("SOWI NGC Player", "GLOBAL");
    $timeout(function () {
      $rootScope.logger.setShowOutput(DEBUG);
      $rootScope.logger.output("Logger is initializated and ready", "Start.js - loadLibary");
      //Custom Logger
      //Sample
      // $rootScope.logger.output("Scan is finished, VIN = " + scaninfo, "scanfinshed")
      // $rootScope.logger.output(<message>, <location -OPTIONAl>, <depth -OPTIONAL>)
    }, 1000)
  }, 750)
}
//JH end


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// local helper functions
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
getJSON = function (data) {
  SXSLData = JSON.parse(data);
}

showIssue = function (message, systemMessage) {

  $scope.setWidgetProp("labelIssueMessage1", "text", message);
  $scope.setWidgetProp("labelIssueMessage2", "text", systemMessage);
  $scope.setWidgetProp("popupIssue", "visible", true);

}


showIntroPopup = function () {

  $scope.setWidgetProp("labelProcDescription", "text", SXSLData.title.resources[0].text);
  $scope.setWidgetProp("labelProcVersion", "text", SXSLData.versionId);


  let dateStr = SXSLData.publishDate;
  let dateObj = new Date(dateStr);
  let readableDate = dateObj.toLocaleString();
  $scope.setWidgetProp("labelProcPubDate", "text", readableDate);
  try {
    $scope.setWidgetProp("labelProcIntro", "text", SXSLData.introduction.resources[0].text);
  } catch (err) {
    //ignore 
    $scope.setWidgetProp("labelProcIntro", "text", "No introduction found");
  }

  $scope.setWidgetProp("popupIntro", "visible", true);

}


showHideProcButtons = function (showWorkOrder, showHideNewProc, showHideResumeProc, showHideInputWO, showHideEnterButton) {

  $scope.setWidgetProp("buttonScanForWorkOrder", "visible", showWorkOrder);
  $scope.setWidgetProp("buttonStartNewProc", "visible", showHideNewProc);
  $scope.setWidgetProp("buttonResumeProc", "visible", showHideResumeProc);

  $scope.setWidgetProp("textInputWorkOrder", "visible", showHideInputWO);
  $scope.setWidgetProp("buttonEnter", "visible", showHideEnterButton);



}


lookupProcedure = function (wonum) {
  let servicename = "StartProcedureSession";
  let URL = workTrackURLprefix + servicename;
  // Check for valid procedure name/id
  let procedureId = $rootScope.sxslHelper.getId();

  $scope.app.params.procedureId = $rootScope.sxslHelper.getId();
  $scope.app.params.procedureVersionId = $rootScope.sxslHelper.getVersionId();

  let params = {
    appVersion: "iPad6,3; iOS18.1.1",
    procedureLastEditor: "no lonegr used",
    procedureVersion: $rootScope.sxslHelper.getVersionId(),
    procedureDescription: $rootScope.sxslHelper.getDescription(),
    relatedProduct: "Future feature - Some related Product" /* STRING */,
    relatedAsset: "Future feature - Some related Asset" /* STRING */,
    workOrderNumber: wonum /* STRING */,
    language: "en-US" /* STRING */,
    devicePlatform: "mobile" /* STRING */,
    procedureId: procedureId /* STRING */,
    procedureTitle: $rootScope.sxslHelper.getTitle() /* STRING */
  };

  try {
    let headers = {
      Accept: 'application/json',
      "Content-Type": 'application/json'
    };
    // Body
    $http.post(URL, params, {
      headers: headers,
    })
      .then(
        function (data) {
          if (data) {
            $rootScope.logger.output('Completed THX request', JSON.stringify(data.config.data), "startPoint.js - lookupProcedure", 2);
            if (data.data.rows.length > 0) {

              let sessionId = data.data.rows[0].sessionId;
              $scope.app.params.sessionId = sessionId;
              let message = data.data.rows[0].message;
              let workOrderProcedureStatus = data.data.rows[0].workOrderProcedureStatus;
              let lastFinishedActionId = data.data.rows[0].lastFinishedActionId;

              $rootScope.sxslHelper.setWorkTrackSessionId(sessionId);
              $rootScope.sxslHelper.setWorkTrackMessage(message);

              if (message === "OK") {

                // now check for new or resume
                if (lastFinishedActionId != undefined && lastFinishedActionId != "" && workOrderProcedureStatus == "started") {
                  // Resume

                  $rootScope.sxslHelper.setLastFinishedActionId(data.data.rows[0].lastFinishedActionId);
                  // refresh and resume buttons 
                  $scope.setWidgetProp("labelUserMessage", "text", "Procedure with #" + wonum + " has already '" + workOrderProcedureStatus + "' Click Start New  WorkOrder or Resume");
                  showHideProcButtons(false, true, true, false, false);
                  showIntroPopup();

                } else if ((lastFinishedActionId === undefined || lastFinishedActionId === "") && workOrderProcedureStatus == "started") {

                  $scope.startNewProcedure();

                } else {
                  // unknown state maybe 
                  showIssue("Unexpected Issue workOrderProcedureStatus request failed", message);

                }

              } else {
                // display possible issue
                showIssue("Unexpected Issue workOrderProcedureStatus request failed", message);

              }

            } else {

              // display possible issue
              showIssue("Unexpected issue no data returned  ", " Connect with Administrator to investigate");
            }

          }
        },
        function (status) {
          console.log("THX Service StartProcedureSession Failure", "Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/StartProcedureSession service failed!" + "\n" + "The status returned was:  " + status + "\n");
        }
      )
  } catch (e) {
    console.log("THX Service StartProcedureSession Failure", 'Check application key or if server is running or error was ' + e);
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

  let result = state === "visible" ? $scope.setWidgetProp("popupIntro", "visible", false) : $scope.setWidgetProp("popupIntro", "visible", true);

}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// EVENTS
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
// Will execute when the STEP STARTS - stepStart
//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

$rootScope.$on('stepStart', function (evt, step) {
  $rootScope.logger.output("Step Start", "startPoint.js - stepStart Listener")
  if ($scope.app.params.sessionId != undefined) {
    let stepTitle = $rootScope.sxslHelper.getTitle();
    let stepDescription = $rootScope.sxslHelper.getDescription(); // this could be blank
    let stepStartTime = Date.now();
    let si = $rootScope.sxslHelper.getWorkTrackSessionId();
    $rootScope.startStep(si, step.id, step.title, stepDescription, stepStartTime);
  }


});



$rootScope.startStep = function (sessionId, stepId, stepTitle, stepDescription, stepStartTime) {
  let servicename = "StartStep";
  let URL = workTrackURLprefix + servicename;
  let params = {

    sessionId: sessionId,
    stepId: stepId,
    stepTitle: stepTitle,
    stepDescription: stepDescription

  };

  try {
    let headers = {
      Accept: 'application/json',
      "Content-Type": 'application/json'
    };
    // Body
    $http.post(URL, params, {
      headers: headers,
    })
      .then(
        function (data) {
          if (data) {
            $rootScope.logger.output('Completed THX StartStep request - response =' + JSON.stringify(data), "startPoint.js - stepStart", 2);
            let startStepData = data.data;

            if (data.statusText === "OK" && !startStepData.rows[0].result.includes('failed')) {

              // all ok 
            }
            else if (startStepData.rows[0].result.includes('started already')) {
              // all ignore 
              $rootScope.logger.output('Start Step -  Ignoring failure ' + startStepData.rows[0].result, "startPoint.js - stepStart", 2);
            } else if (startStepData.rows[0].result.includes('failed')) {

              showIssue("Unexpected StartStep failure Params= " + " sessionId=" + data.config.data.sessionId + " stepId=" + data.config.data.stepId + " stepTitle=" + data.config.data.stepTitle + " stepDescription=" + data.config.data.stepDescription, startStepData.rows[0].result);

            }

          }
        },
        function (status) {
          console.log("THX Service Failure Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/StartStep service failed!" + "\n" + "The status returned was:  " + status + "\n");

          showIssue("Unexpected StartStep failure ", "Thingworx/PTCSC.SOWI.WorkTrack.Manager/Services/StartStep failed!" + "\n" + "The status returned was:  " + status + "\n" + "params =" + JSON.stringify(params));

        }
      )
  } catch (e) {
    console.log("THX Service StartStep Failure", 'Check application key or if server is running or error was ' + e);
    showIssue("Unexpected THX Service StartStep Failure", 'Check application key or if server is running or error was ' + e);
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
  let actionId = action.id;
  let actionInput = 'test input'; // place holder
  let inputFileExtension = '';
  let actionDescription = action.instruction;
  let sessionId = $rootScope.sxslHelper.getWorkTrackSessionId();
  let inputImage = " ";
  let actionName = action.base.actiontitle;
  $rootScope.sxslHelper.setActionStartTime(action.id, new Date().getTime());
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


$rootScope.actionInputDelivered = function (action) {
  $rootScope.logger.output("Action INPUT DELIVERED", "startPoint.js - actionInputDelivered")
  $rootScope.logger.output("Step ID: " + action.stepid, "startPoint.js - actionInputDelivered", 2)
  $rootScope.logger.output("Action ID: " + JSON.stringify(action.id), "startPoint.js - actionInputDelivered", 4)

  $rootScope.sxslHelper.setActionRecordedValue(action.stepid, action.id, 'pending');
  $rootScope.logger.output("Marked Status as PENDING", "startPoint.js - actionInputDelivered", 4);

  x = $rootScope.sxslHelper.getActionRecordedByIds(action.stepid, action.id);
  $rootScope.logger.output("getActionRecordedByIds Test: " + x, "startPoint.js - actionInputDelivered", 4);

  //
  let servicename = "SaveAction";
  let URL = workTrackURLprefix + servicename;


  let actionId = action.id;
  let stepId = action.step.id;
  let responseArray = action.details.response[action.details.ID];
  let actionName = action.base.actiontitle;
  let actionInstruction = action.instruction;
  let actionDuration = $rootScope.sxslHelper.setActionEndTime(actionId, responseArray[0].time);
  let inputImage = " ";
  let inputFileExtension = " ";
  let actionInput;

  responseArray.sort(function (a, b) {
    return a.time - b.time;
  });
  // for now get the first response 
  if (responseArray[0].response != undefined && responseArray[0].type === "CaptureImage") {
    $rootScope.actionPending = true;    //Slowing down processing to address the upload of an Image

    inputImage = responseArray[0].response;
    actionInput = "";
    if (responseArray[0].response.startsWith("data:image/png;base64")) {

      let contentArray = responseArray[0].response.split(",");
      if (contentArray.length > 1) {
        inputImage = contentArray[1];
        inputFileExtension = "png";
      }
    }
  } else {
    $rootScope.actionPending = false;
    actionInput = responseArray[0].response;

  }

  let params = {
    actionDuration: actionDuration,
    actionId: actionId,
    actionInput: actionInput,
    inputFileExtension: inputFileExtension,
    actionDescription: actionInstruction,
    sessionId: $rootScope.sxslHelper.getWorkTrackSessionId(),
    inputImage: inputImage,
    actionName: actionName,
    stepId: stepId
  };



  try {
    let headers = {
      Accept: 'application/json',
      "Content-Type": 'application/json'
    };
    // Body
    $http.post(URL, params, {
      headers: headers,
    })
      .then(
        function (data) {
          $rootScope.actionPending = false;
          if (data) {
            $rootScope.logger.output('Completed THX SaveAction request - response =' + JSON.stringify(data), "startPoint.js - actionInputDelivered", 2);
            let saveActionData = data.data;

            if (data.statusText === "OK" && !saveActionData.rows[0].result.includes('failed')) {

              // all ok 
              //JH Start 8/2

              $rootScope.sxslHelper.setActionRecordedValue(action.stepid, action.id, true);
              $rootScope.logger.output("Marked Status as written to TWX", "startPoint.js - actionInputDelivered", 6);
              y = $rootScope.sxslHelper.getActionRecordedByIds(action.stepid, action.id);
              $rootScope.logger.output("getActionRecordedByIds Test: " + y, "startPoint.js - actionInputDelivered", 6);



              //JH End 8/2


            } else if (saveActionData.rows[0].result.includes('failed')) {
              showIssue("Unexpected Save action failure Params= " + " sessionId=" + data.config.data.sessionId + " stepId=" + data.config.data.stepId + + " actionId=" + data.config.data.actionId + " actionInput=" + data.config.data.actionInput + "  actionName=" + data.config.data.actionName, saveActionData.rows[0].result);
            }

          }
        },
        function (status) {
          console.log("THX Service Failure Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/SaveAction service failed!" + "\n" + "The status returned was:  " + status + "\n");

          showIssue("Unexpected Save action failure ", "Thingworx/PTCSC.SOWI.WorkTrack.Manager/Services/SaveAction failed!" + "\n" + "The status returned was:  " + status + "\n" + "params =" + JSON.stringify(params));

        }
      )
  } catch (e) {
    console.log("THX Service SaveAction Failure", 'Check application key or if server is running or error was ' + e);
    showIssue("Unexpected Thingworx SaveAction Failure", 'Check application key or if server is running or error was ' + e);
  }





}






// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
// Will execute when the STEP ENDS - stepEnd
//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
$rootScope.$on('stepEnd', function (evt, step) {
  $rootScope.logger.output("Step End", "startPoint.js - stepEnd Listener")

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
      "Content-Type": 'application/json'
    };
    // Body
    $http.post(URL, params, {
      headers: headers,
    })
      .then(
        function (data) {
          if (data) {
            $rootScope.logger.output('Completed THX EndStep request - response =' + JSON.stringify(data), "startPoint.js - endStep", 2);
            let endStepData = data.data;
            if (data.statusText === "OK" && !endStepData.rows[0].result.includes('failed')) {
              // all ok 
            } else if (endStepData.rows[0].result.includes('failed')) {
              showIssue("Unexpected EndStep failure Params= stepId=" + data.config.data.stepId + " WorkOrderNumber=" + $scope.app.params.workordernumber, endStepData.rows[0].result);
            }
          }
        },
        function (status) {
          console.log("THX Service EndStep Failure Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/EndStep service failed!" + "\n" + "The status returned was:  " + status + "\n");

          showIssue("Unexpected EndStep failure ", "Thingworx/PTCSC.SOWI.WorkTrack.Manager/Services/EndStep failed!" + "\n" + "The status returned was:  " + status + "\n" + "params =" + JSON.stringify(params));
        }
      )


  } catch (e) {
    console.log("THX Service EndStep Failure", 'Check application key or if server is running or error was ' + e);
    showIssue("Unexpected THX Service EndStep Failure", 'Check application key or if server is running or error was ' + e);
  }
}



// 
// Will execute when the Procedure is finshed.
//
$rootScope.$on('procEnd', function (evt, procedure) {
  $rootScope.logger.output("Procedure End:", "startPoint.js - procEnd Listener")
  let sessionId = $rootScope.sxslHelper.getWorkTrackSessionId();
  $rootScope.endProcedure(sessionId);
});





// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//
// Will execute when the PROCEDURE END - EndProcedureSession
//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

$rootScope.endProcedure = function (sessionId) {
  $rootScope.logger.output("Procedure End:", "startPoint.js - endProcedure", 2);
  let servicename = "EndProcedureSession";
  let URL = workTrackURLprefix + servicename;
  try {


    let params = {
      sessionId: sessionId
    };
    let headers = {
      Accept: 'application/json',
      "Content-Type": 'application/json'
    };

    // Body
    $http.post(URL, params, {
      headers: headers,
    })
      .then(
        function (data) {
          if (data) {
            $rootScope.logger.output('Completed THX EndProcedureSession request - response =' + data, 'startPoint.js - endProcedure', 2);
            let endProcData = data.data;
            if (data.statusText === "OK" && !endProcData.rows[0].result.includes('failed')) {
              // all ok 
            } else if (endProcData.rows[0].result.includes('failed')) {
              showIssue("Unexpected EndProcedureSession failure " + endProcData.rows[0].result);
            }
          }
        },
        function (status) {
          console.log("THX Service EndProcedureSession Failure Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/EndProcedureSession service failed!" + "\n" + "The status returned was:  " + status + "\n");

          showIssue("Unexpected EndProcedureSession failure ", "Thingworx/PTCSC.SOWI.WorkTrack.Manager/Services/EndProcedureSession failed!" + "\n" + "The status returned was:  " + status + "\n" + "params =" + JSON.stringify(params));

        }
      )



  } catch (e) {
    console.log("THX Service EndProcedureSession Failure", 'Check application key or if server is running or error was ' + e);
    showIssue("Unexpected Save action failure ", "THX Service EndProcedureSession Failure", 'Check application key or if server is running or error was ' + e);
  }



}







$scope.scanComplete = function () {

  let wonum = $scope.getWidgetProp('scanWorkOrder', 'scannedValue');
  $scope.app.params.workordernumber = wonum;
  $rootScope.sxslHelper.setWorkOrder(wonum);    // Store the WorkOrder    

  // below is repeat piece of code should create a function

  let procedureId = $rootScope.sxslHelper.getId();

  if (procedureId != undefined && procedureId != "") {
    lookupProcedure(wonum);
  } else {

    showIssue("Unexpected issue. Problem getting the ProcedureId from sowi .", "The sowi.json is located in " + UPLOADPATH);
  }

}



$scope.checkForScan = function () {

  let scanneeded = $rootScope.sxslHelper.WOScanNeeded();
  if (scanneeded) {
    $scope.setWidgetProp("labelUserMessage", "text", "Procedure Needs a Work Order Number");
  }
  else {
    // No WorkOrder needed.
    $scope.setWidgetProp("labelUserMessage", "text", "Click New to start Procedure");
  }

  showHideProcButtons(true, false, false, true, true);
  showIntroPopup();
}


$scope.manualWorkOrderEntry = function () {

  let wonum = $scope.getWidgetProp("textInputWorkOrder", "text");
  if (wonum != undefined && wonum != "") {

    $scope.app.params.workordernumber = wonum;
    $rootScope.sxslHelper.setWorkOrder(wonum);    // Store the WorkOrder   

    // below is repeat piece of code should create a function
    let procedureId = $rootScope.sxslHelper.getId();
    if (procedureId != undefined && procedureId != "") {
      lookupProcedure(wonum);
    } else {
      showIssue("Unexpected issue. Problem getting the ProcedureId from sowi .", "The sowi.json is located in " + UPLOADPATH);
    }


  } else {
    showIssue("Empty value found!", "Please enter a non blank value");

  }

}

$scope.systemFullyInit = function () {
  $scope.checkForScan();
  $scope.app.params.prefill = "";
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

$scope.resetForNewProcedure = function () {
  $rootScope.sxslHelper.setFreshRun(true);
  $scope.setWidgetProp("labelUserMessage", "text", "Click New to start Procedure");
  showHideProcButtons(true, false, false, true, true);
  showIntroPopup();
}

$scope.resumeProcedure = function () {
  $rootScope.sxslHelper.setFreshRun(false);

  try {
    let lastFinishedActionId = $rootScope.sxslHelper.getLastFinishedActionId();
    if (lastFinishedActionId != undefined & lastFinishedActionId != "") {

      $rootScope.getCompletedSteps(lastFinishedActionId);

    }

  } catch (error) {

    showIssue("Unexpected issue. Problem finding the last resume step.", error.message);
  }
}



$rootScope.getCompletedSteps = function (lastFinishedActionId) {

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
      "Content-Type": 'application/json'
    };
    // Body
    $http.post(URL, params, {
      headers: headers,
    })
      .then(
        function (data) {
          if (data) {            
            $rootScope.logger.output('Completed THX GetWorkOrderProcedureSteps GetWorkOrderProcedureSteps request - response =' + JSON.stringify(data), "startPoint.js - getCompletedSteps", 2);
            let map = new Map();
            function addEntry(key, value) {
              if (!map.has(key)) {
                map.set(key, value);
                console.log(`Added: ${key} -> ${value}`);
              } else {
                console.log(`Key "${key}" already exists with value "${map.get(key)}". No duplicates allowed.`);
              }
            }

            data.data.rows.forEach(function (step) {
              if (step.stepStatus === "finished") {
                addEntry(step.stepId, "done");
              }
            });

            let workInstructionId = $rootScope.sxslHelper.getWorkOrderStepID();
            if (workInstructionId) {
              addEntry(workInstructionId, "done");
            }

            data.data.rows.forEach(function (step) {
              addEntry(step.stepId, "hold");
            });

            for (let key of map.keys()) {
              console.log(key);
              completedSteps.push({ stepId: key, status: map.get(key) });
            }
            if (lastFinishedActionId) {
              completedSteps.push({ actionId: lastFinishedActionId, status: "hold" });
            }

            $scope.app.params.prefill = $rootScope.sxslHelper.getWorkTrackResumeList(lastFinishedActionId);
            $scope.app.fn.navigate("Home");

          } else {
            // display possible issue
            showIssue("Unexpected issue no data returned from service GetWorkOrderProcedureSteps with params " + JSON.stringify(params), " Connect with Administrator to investigate");
          }

        },
        function (status) {
          console.log("Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/GetWorkOrderProcedureSteps  service failed!" + "\n" + "The status returned was:  " + status + "\n");
        }
      )
  } catch (e) {
    console.log("Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/GetWorkOrderProcedureSteps failed", 'Check application key or if server is running or error was ' + e);
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

if (!$rootScope.sxslHelper) {
  loadLibrary('Uploaded/sowiplayer/coeSxSLHelper.js')
    .then(function () {
      $rootScope.sxslHelper = new coeSxSLHelper();

      var filepath = "./app/resources/Uploaded/sowi.json";
      fetch(filepath)
        .then(response => response.text())
        .then(data => getJSON(data))
        .then(data => $rootScope.sxslHelper.setSxSL(SXSLData))
        .then(function () {
          $scope.systemFullyInit();
        })
        .finally(function () {
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
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// This function will execute each time the view is loaded
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

$scope.$on("$ionicView.loaded", function (event) {
 
  // Code here

});

//JH Start 8/2
// 
// Will execute when the Action Ends.
//
$rootScope.$on('actionEnd', function (evt, action) {
  $rootScope.logger.output("Action End event", "startPoint.js - actionEnd")
  $rootScope.logger.output("Step ID: " + action.stepid, "startPoint.js - actionEnd", 2)
  $rootScope.logger.output("Action ID: " + JSON.stringify(action.id), "startPoint.js - actionEnd", 4)
  x = $rootScope.sxslHelper.getActionRecordedByIds(action.stepid, action.id);
  $rootScope.logger.output("getActionRecordedByIds Test: " + x, "startPoint.js - actionEnd", 4)

  if (x != "pending" && x != true) {
    $rootScope.logger.output("Here we go, recording Action no Input", "startPoint.js - actionEnd", 6)
    let servicename = "SaveAction";
    let URL = workTrackURLprefix + servicename;

    let actionId = action.id;
    let stepId = action.step.id;
    let actionName = action.base.actiontitle;
    let actionInstruction = action.instruction;
    let actionDuration = 1;     //TO-DO: FIX THIS :)
    let inputImage = " ";
    let inputFileExtension = " ";
    let actionInput = "No Input for Action";
    let params = {
      actionDuration: actionDuration,
      actionId: actionId,
      actionInput: actionInput,
      inputFileExtension: inputFileExtension,
      actionDescription: actionInstruction,
      sessionId: $rootScope.sxslHelper.getWorkTrackSessionId(),
      inputImage: inputImage,
      actionName: actionName,
      stepId: stepId
    };

    try {
      let headers = {
        Accept: 'application/json',
        "Content-Type": 'application/json'
      };
      // Body
      $http.post(URL, params, {
        headers: headers,
      })
        .then(
          function (data) {
            $rootScope.actionPending = false;
            if (data) {              
              $rootScope.logger.output('Completed THX SaveAction request - response =' + JSON.stringify(data), "startPoint.js - actionEnd", 2);
              let saveActionData = data.data;
              if (data.statusText === "OK" && !saveActionData.rows[0].result.includes('failed')) {
                // all ok 
                //JH Start 8/2
                $rootScope.sxslHelper.setActionRecordedValue(action.stepid, action.id, true);
                $rootScope.logger.output("Marked Status as written to TWX", "startPoint.js - actionEnd", 6);
                y = $rootScope.sxslHelper.getActionRecordedByIds(action.stepid, action.id);
                $rootScope.logger.output("getActionRecordedByIds Test: " + y, "startPoint.js - actionEnd", 6);
                //JH End 8/2
              } else if (saveActionData.rows[0].result.includes('failed')) {
                showIssue("Unexpected Save action failure Params= " + " sessionId=" + data.config.data.sessionId + " stepId=" + data.config.data.stepId + + " actionId=" + data.config.data.actionId + " actionInput=" + data.config.data.actionInput + "  actionName=" + data.config.data.actionName, saveActionData.rows[0].result);
              }
            }
          },
          function (status) {
            console.log("THX Service Failure Thingworx /PTCSC.SOWI.WorkTrack.Manager/Services/SaveAction service failed!" + "\n" + "The status returned was:  " + status + "\n");
            showIssue("Unexpected Save action failure ", "Thingworx/PTCSC.SOWI.WorkTrack.Manager/Services/SaveAction failed!" + "\n" + "The status returned was:  " + status + "\n" + "params =" + JSON.stringify(params));
          }
        )
    } catch (e) {
      console.log("THX Service SaveAction Failure", 'Check application key or if server is running or error was ' + e);
      showIssue("Unexpected Thingworx SaveAction Failure", 'Check application key or if server is running or error was ' + e);
    }


  }



});










