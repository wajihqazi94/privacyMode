/**
 * The function is called whenever the Add-In button is clicked.
 *
 * @param {object} event - The event dispatched from the button click.
 * @param {object} api - The GeotabApi object for making calls to MyGeotab.
 * @param {object} state - The page state object allows access to URL, page navigation and global group filter.
 */
geotab.customButtons.myGeotabPrivacyModeButton = function (event, api, state) {
    'use strict';
  
    event.preventDefault();
  
    var msDay = 1000 * 60 * 60 * 24,
        fromDate = new Date(Date.now() - (msDay * 60)),
        deviceId = state.getState().id;
  
    function getCurrentState() {
  
        var lastStateDisplay;
  
        var tripTypeChanges = api.call('Get', {
            'typeName': 'TripTypeChange',
            'search': {
                'deviceSearch': { 'id': deviceId },
                'fromDate': fromDate.toISOString()
            }
        }, function () {
        }, function (error) {
            console.log(error);
        });
  
        if (tripTypeChanges !== undefined && tripTypeChanges.length > 0) {
  
            tripTypeChanges[tripTypeChanges.length - 1].tripType === 'Unknown' ? lastStateDisplay = 'Non-Private' : lastStateDisplay = 'Private';
  
        } else {
            console.log(document.getElementById("device_privateWarning").style.display);
            if (document.getElementById("device_privateWarning").style.display === "none") {
                lastStateDisplay = 'Non-Private';
            } else {
                lastStateDisplay = 'Private';
            }
        }
  
        return lastStateDisplay;
  
    }
  
    function createPrivacySection() {
        var lastStatusDisplay = getCurrentState(),
            privateModeSection = document.getElementById("device_privacy"),
            privateWarning = document.getElementById("device_privateWarning");
  
        if (privateModeSection === null) {
  
            privateModeSection = document.createElement("div");
            privateModeSection.className = "checkmateField notFlexible";
            privateModeSection.id = "device_privacy";
            document.getElementById("device_deviceInfo").insertBefore(privateModeSection, privateWarning);
  
            var sectionContent = '<label class="label">Privacy Mode: </label>';
            sectionContent += '<span class="horizontalButtonSet">';
  
            if (lastStatusDisplay === 'Private') {
  
                sectionContent += '<input type="radio" name="switcher" class="geotabSwitchButton" id="privacyOn" checked>';
                sectionContent += '<label title="Vehicle location related data such as position, speed and trips is restricted and not available in MyGeotab. Access to this data can be requested only in case of an emergency and if allowed by your company policies." class="geotabButton" for="privacyOn">Personal</label>';
                sectionContent += '<input type="radio" name="switcher" id="privacyOff" class="geotabSwitchButton">';
                sectionContent += '<label title="Vehicle location related data such as position, speed and trips is available in MyGeotab and subject to your company policies for access" class="geotabButton" for="privacyOff">Business</label>';
                sectionContent += '</span>';
                sectionContent += '<div id="privacyWarning" class="checkmateField fullWidth extern" style="display: none;"><p class="fieldWithoutLabel alert">Your user does not have the proper Security Clearance to change Privacy Mode status. Please contact your Administrator for more information.</p></div>';
                privateModeSection.innerHTML = sectionContent;
  
            } else if (lastStatusDisplay === 'Non-Private') {
  
                sectionContent += '<input type="radio" name="switcher" class="geotabSwitchButton" id="privacyOn">';
                sectionContent += '<label title="Vehicle location related data such as position, speed and trips is restricted and not available in MyGeotab. Access to this data can be requested only in case of an emergency and if allowed by your company policies." class="geotabButton" for="privacyOn">Personal</label>';
                sectionContent += '<input type="radio" name="switcher" id="privacyOff" class="geotabSwitchButton" checked>';
                sectionContent += '<label title="Vehicle location related data such as position, speed and trips is available in MyGeotab and subject to your company policies for access" class="geotabButton" for="privacyOff">Business</label>';
                sectionContent += '</span>';
                sectionContent += '<div id="privacyWarning" class="checkmateField fullWidth extern" style="display: none;"><p class="fieldWithoutLabel alert">Your user does not have the proper Security Clearance to change Privacy Mode status. Please contact your Administrator for more information.</p></div>';
                privateModeSection.innerHTML = sectionContent;
  
            }
  
            attachEventListeners();
  
        } else if (privateModeSection.style.display === "none") {
  
            lastStatusDisplay === "Private" ? document.getElementById("privacyOn").setAttribute("checked", true) : document.getElementById("privacyOff").setAttribute("checked", true);
            privateModeSection.style.display = "block";
            document.getElementById("privacyWarning").style.display = "none";
  
        } else {
            privateModeSection.style.display = "none";
        }
    }
  
    function attachEventListeners() {
        document.getElementById("device_privacy").addEventListener("change", function (event) {
  
            console.log("Privacy Mode Changed");
  
            event.preventDefault();
            updatePrivacyState();
  
        });
    }
  
    function updatePrivacyState() {
        var newState;
  
        if (document.getElementById("privacyOn").checked) {
            newState = 'Private';
        } else if (document.getElementById("privacyOff").checked) {
            newState = 'Unknown';
        }
  
        api.call('Add', {
            'typeName': 'TripTypeChange',
            'entity': {
                'device': { 'id': deviceId },
                'dateTime': new Date().toISOString(),
                'tripType': newState
            }
        }, function () {
            //Reload after change so UI can update with correct privacy message
            location.reload();
        }, function (error) {
            //If error relates to not having the proper security clearance (i.e: Edit private / non-private trips) show an shortened message about,
            //otherwise, display the error normally. Furthermore, selected status goes back to the actual one, and selection is disabled.
            var errorSubstr = "does not have security clearance for the requested operation: EditTripTypeChangeData";
            if (error.indexOf(errorSubstr) !== -1) {
                document.getElementById("privacyWarning").style.display = "block";
                document.getElementById("privacyOn").checked === true ? document.getElementById("privacyOff").setAttribute("checked", true) : document.getElementById("privacyOn").setAttribute("checked", true);
                document.getElementById("privacyOn").setAttribute("disabled", true);
                document.getElementById("privacyOff").setAttribute("disabled", true);
            } else {
                console.log(error);
            }
        });
    }
  
    createPrivacySection();
  };
  