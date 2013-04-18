// JavaScript Document

	var ALERT_TITLE	=	"Taskforces ERP";
	//var API			= 	"http://192.168.1.188/taskforces/api/";
	//var API			= 	"http://192.168.1.155:88/taskforces/api/";
	var API			= 	"http://203.124.121.150:88/taskforces/api/";
	
	/**************************************************************
	*			GENERAL FUNCTIONS	
	**************************************************************/
	/**
	*	Name	:	checkConnection
	*	Desc	:	Check network connectivity
	**/
	var checkConnection = function () {
		var networkState = navigator.network.connection.type;	
		console.log("Connection type:  " + navigator.network.connection.type);		
		if(networkState == Connection.NONE) {
			showAlert("Unable to connect to TaskForces™ ERP server");	
			return false;				
		}
		else {
			return true;
		}
	};
	var exitApplication=function() {
		navigator.app.exitApp();
	}
	/* Show the loading spinner */
	var showSpinner = function() { 
		$.mobile.loading( "show", {
			text: "Loading...",
			textVisible: true,
			theme: "a",
			html: ""
		}); 
	}	
	/* Hide the loading spinner */
	var hideSpinner = function() { 
		$.mobile.hidePageLoadingMsg();
	}	
	/* change Page */
	var changePage = function(pageId) { 
		//$.mobile.changePage(pageId,{transition: "fade"});
		showSpinner();
		window.location = pageId;
	}
	/* change Page */
	var changePageID = function(pageId) { 
		showSpinner();
		$.mobile.changePage(pageId,{transition: "none"});
	}		
	
	/* show a alert box */
	var  showAlert  = function(message) {
		navigator.notification.alert(
			message,  				// message
			alertDismissed,        // callback
			ALERT_TITLE,      // title
			"OK"                 // buttonName
		);
	};
	var alertDismissed = function() {}
	/* show a confirm box */
	function showConfirm(question,onConfirm) {
		navigator.notification.confirm(
			question,
			onConfirm,             
			ALERT_TITLE,     
			"Yes,No"         
		);
	}
	/* sends request via ajax */
	var getResponse = function(data,parser) {
		console.log("Method : getResponse");
		console.log("DATA : " + JSON.stringify(data));
		$.getJSON( API,data)
			.done(function(response){ 
					console.log(JSON.stringify(response));
					parser(response);
					
				})
			.fail(ajaxFailed);
	}
	var ajaxFailed = function(res) {		
		console.error("Network error. Please try again. Result : "+JSON.stringify(res));
		showAlert("Network error, please try again.");
		hideSpinner();
	}
		/* bind drop down */
	var bindSelect = function(selectId,data) {
		var sel = $(selectId);	
		sel.html("");	
		$.each(data, function(index,value) {
			var option =  $("<option/>")
				.attr("value",value.id)
				.text(value.text);
			option.appendTo(sel);
		});	
		sel.selectmenu("refresh");
	};
	/*  log out */
	var logout = function() {
		localStorage.clear();
		localStorage.isLoggedIn = "false";	
		
		data = new Object();		
		data.module = "LOGOUT";
		getResponse(data,parseLogout);
	}
	var parseLogout = function(response) {
		showAlert("You've been logged out.");
		window.location = "index.html";
	};
	
