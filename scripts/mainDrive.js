geotab.addin.authoritySwitcher = function(api, state) {
    let save = document.getElementById("saveMe"),
        storedData = [],
        currentUser,
		current = document.getElementById("current"),
        addInId = "aMO4bMooow0KlW2WdaT2suw",
		
		errorHandler = function(msg) {
			alertError.textContent = msg;
			alertError.classList.remove("hidden");
			clearTimeout(errorMessageTimer);
			errorMessageTimer = setTimeout(() => {
				alertError.classList.add("hidden");
			}, 3500);
		},
		
        saveNewInfo = function() {
			grabUser().then(function(activeUser) {
				let selectedAuthority = document.getElementById("importauthorities").value;
				for (let i = 0; i < storedData.length; i++) {
					if (storedData[i].authorityName === selectedAuthority) {
						console.log(storedData[i]);

						activeUser.authorityName = storedData[i].authorityName;
						activeUser.companyName = storedData[i].companyName;
						activeUser.companyAddress = storedData[i].companyAddress;
						activeUser.authorityAddress = storedData[i].authorityAddress;
						activeUser.carrierNumber = storedData[i].carrierNumber;
						activeUser.driverGroups = [];
						activeUser.companyGroups = [];
						for (let groupIndex = 0; groupIndex < storedData[i].groups.length; groupIndex++) {
							activeUser.driverGroups.push({"id":storedData[i].groups[groupIndex]});
							activeUser.companyGroups.push({"id":storedData[i].groups[groupIndex]});
						}
						
						api.call("Set", {
							typeName: "User",
							entity: activeUser
						}, function(result) {
							window.location.reload(true);
						});
					}
				}
			});
        },
		
		grabUser = function () {
			return new Promise(function(resolve, reject) { 
				api.call("Get", {"typeName": "User",
					"search": {
						"name": currentUser
					}
				}, function(result) {
					resolve(result[0]);
				})
			});
		},

        grabAddInData = function(activeUser) {
            api.call("Get", {
                    "typeName": "AddInData",
                    "search": {
                        "addInId": addInId
                    }
			}, function(results) {
				for (let i = 0; i < results.length; i++) {

					let myData = JSON.parse(results[i].data);
					if (myData.hasOwnProperty('authorities')) {

						for (let auth = 0; auth < myData.authorities.length; auth++) {
							storedData.push(myData.authorities[auth]);
						}

					}

				}
				//Checked if new Data to add
				if (storedData.length > 0) {

					//Grab All Data and display
					for (let i = 0; i < storedData.length; i++) {
						let select = document.getElementById("importauthorities");

						storedData.sort(function(a, b) {
							if (a.authorityName.toLowerCase() < b.authorityName.toLowerCase()) {
								return -1;
							}
							if (a.authorityName.toLowerCase() > b.authorityName.toLowerCase()) {
								return 1;
							}
							return 0;
						});
						for (i = 0; i < storedData.length; i++) {
							if (storedData[i].authorityName !== activeUser.authorityName) {
								let option = new Option();
								option.text = storedData[i].authorityName;
								option.value = storedData[i].authorityName;
								select.add(option);
							}
						}
					}
				}
			}, function(error) {
				alert("error");
			});
        };


    return {
        /**
         * initialize() is called only once when the Add-In is first loaded. Use this function to initialize the
         * Add-In's state such as default values or make API requests (MyGeotab or external) to ensure interface
         * is ready for the user.
         * @param {object} api - The GeotabApi object for making calls to MyGeotab.
         * @param {object} state - The page state object allows access to URL, page navigation and global group filter.
         * @param {function} addInReady - Call this when your initialize route is complete. Since your initialize routine
         *        might be doing asynchronous operations, you must call this method when the Add-In is ready
         *        for display to the user.
         */
        initialize: function(api, state, addInReady) {

            api.getSession(function(session) {
                currentUser = session.userName;
				grabUser().then(function(activeUser) {
					current.innerHTML = activeUser.authorityName;
					grabAddInData(activeUser);
				});
                
            });
			
			save.addEventListener("click", function() {
                saveNewInfo();
            }, false);
            // MUST call addInReady when done any setup
			addInReady();
        },

        /**
         * focus() is called whenever the Add-In receives focus.
         *
         * The first time the user clicks on the Add-In menu, initialize() will be called and when completed, focus().
         * focus() will be called again when the Add-In is revisited. Note that focus() will also be called whenever
         * the global state of the MyGeotab application changes, for example, if the user changes the global group
         * filter in the UI.
         *
         * @param {object} api - The GeotabApi object for making calls to MyGeotab.
         * @param {object} state - The page state object allows access to URL, page navigation and global group filter.
         */
        focus: function(api, state) {
            
        },
        /**
         * blur() is called whenever the user navigates away from the Add-In.
         *
         * Use this function to save the page state or commit changes to a data store or release memory.
         *
         * @param {object} api - The GeotabApi object for making calls to MyGeotab.
         * @param {object} state - The page state object allows access to URL, page navigation and global group filter.
         */
        blur: function(api, state) {


        }
    };
};
