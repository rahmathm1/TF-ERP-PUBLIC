/***
*	Author 			: Rahmathullah M
*	Date created	: 18/3/2013
*	Date Modified	: 18/3/2013
*	Description		: JS for moblile application for Task Force ERP
*	
*	TO DO:-	 
*			-	
*/
	var ALERT_TITLE	=	"Taskforces ERP";
	//var API			= 	"http://192.168.1.188/taskforces/api/";
	var API			= 	"http://192.168.1.155:88/taskforces/api/";
	
	var BUSINESS_UNITS = "BUSINESS_UNITS";
	var LOGIN = "LOGIN";
	var ACC_LEVELS = "ACC_LEVELS";
	//var 

	/** event that fires when document is loaded & ready **/
	document.addEventListener("deviceready", onDeviceReady, false);
		
	function onDeviceReady() {
		console.log("Invoked: onDeviceReady");
		
		document.addEventListener("searchbutton", onSearchKeyDown, false);
        document.addEventListener("menubutton", onMenuKeyDown, false);
		//document.addEventListener("backbutton", onBackKeyDown, false);
		
		bindEvents();
	}
	$("#pageDashboard").on("pageinit",function(event){
		console.log("pageinit : pageDashboard");				
	});
	/* search button press */
    function onSearchKeyDown() {
        // do something
    }

    /* menu button press */
    function onMenuKeyDown() {
		if ($('.menu-button').css('display') == 'none')
			$('.menu-button').fadeIn();
		else
			$('.menu-button').fadeOut();
    }
	
	
	
	/*************************************************************
	*			EVENTS	
	**************************************************************/	
	var bindEvents = function() {
		$("#btnBalanceSheet").on("click",function() {
			changePage("balance-sheet.html");
		});
	};
	
		/* back button press 
    function onBackKeyDown() {
		console.log("onBackKeyDown");
/*		if($.mobile.activePage.attr("id")== "pageDashboard") {
			if(localStorage.isLoggedIn == "true") {
				exitApplication();
			}
		} else {
			history.go(-1);
		}		
		var activePage = $.mobile.activePage.attr("id"); 

		if ( activePage == "pageDashboard" ){		
			e.preventDefault(); 
			navigator.app.exitApp(); 
		} else { 		
			navigator.app.backHistory(); 		
		} 
    }*/
	