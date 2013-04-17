/***
*	Author 			: Rahmathullah M
*	Date created	: 18/3/2013
*	Date Modified	: 18/3/2013
*	Description		: JS for moblile application for Task Force ERP
*	
*	TO DO:-	 
*			-	
*/
	
	
	var BUSINESS_UNITS 	= "BUSINESS_UNITS";
	var LOGIN 			 = "LOGIN";
	//var 

	/** event that fires when document is loaded & ready **/
	document.addEventListener("deviceready", onDeviceReady, false);
		
	function onDeviceReady() {
		console.log("Invoked: onDeviceReady");
		bindEvents();
		if(!checkConnection()){
			disableLogin();
			//return;
		}else {
			enableLogin();
			if(localStorage.isLoggedIn == "true") {
				changePageID("#pageDashboard");
			}		
			showSpinner();
			
			 
			document.addEventListener("searchbutton", onSearchKeyDown, false);
			document.addEventListener("menubutton", onMenuKeyDown, false);
			getBusinessUnits();
						
			/* clear history after log out */ 
			$.mobile.urlHistory.clearForward() 			
			navigator.splashscreen.hide();
		}		
	}
	
	/* search button press */
    function onSearchKeyDown() {
        // do something
    }

    /* menu button press */
    function onMenuKeyDown() {
		//if($.mobile.activePage.attr("id")!= "pageLogin"){
			if ($('.menu-button').css('display') == 'none')
				$('.menu-button').fadeIn();
			else
				$('.menu-button').fadeOut();
		//}
    }
	
	

	
	
	/*************************************************************
	*			EVENTS	
	**************************************************************/	
	var bindEvents = function() {
		/* button login click */
		$("#btnLogin").on("click",login);
		
		$("#btnBalanceSheet").on("click",function() {
			changePage("balance-sheet.html");
		});
		$("#btnProfitLoss").on("click",function() {
			changePage("profit-loss.html");
		});
		$("#btnRetry").on("click",function() {
			console.log("Retrying");
			showSpinner();
			getBusinessUnits();
		});
		
		$("#pageDashboard").on('pagebeforehide', function(e, ui){  
			console.log("Hiding page");
			if(ui.nextPage.attr("id") == "pageLogin"){
				if( localStorage.isLoggedIn == "true" )
				{			
					exitApplication();		
				}
			}
		});
		$("#pageLogin").on('pagebeforeshow', function(e, ui){  
			console.log("login : page before show");
			if(localStorage.isLoggedIn == "true") {
				e.preventDefault();
				e.stopPropagation();			
				changePageID("#pageDashboard");
			}
		});
		
		$(".menuLogout").on('click', function(){  
			console.log("clicked menu>logout");
			showSpinner();
			logout();
		});
		$(".menuExit").on('click', exitApplication);
	};
	$("#pageLogin").on("pageinit",function(event){
		console.log("pageshow : pageLogin");
	});
	
	
	/* disable login controls */
	var disableLogin = function () {
		$("#divLogin").hide();
		$("#divRetry").show();	
	}
	/* enable login controls */
	var enableLogin = function () {
		$("#divLogin").show();
		$("#divRetry").hide();	
	}
	/**
	*	Name	:	login
	*	Desc	:	login to the system
	**/
	var login = function () {
		showSpinner();
		console.log("Method : login");		
		var businessUnit = $("#selLoginBUnit").val();
		var userId = $("#txtUserId").val().trim();
		var password = $("#txtPassword").val().trim();
		if(businessUnit=="NULL") {
			hideSpinner();
			showAlert("Select business unit");
			return;
		} 
		if(userId=="") {
			hideSpinner();
			showAlert("Enter User Id");
			return;
		} 
		if(password=="") {
			hideSpinner();
			showAlert("Enter password");
			return;
		} 
		data = new Object();
		data.module = LOGIN;
		data.buID = businessUnit;
		data.userId = userId;
		data.password = password;
		getResponse(data,parseLogin);
	};
	var parseLogin = function(response) {
		if(response.status == 1) {	
			localStorage.isLoggedIn = "true";		
			changePageID("#pageDashboard");
		} else if(response.status == 2){
			showAlert("Invalid user id or password");
		} else {
			showAlert("Network Error: Please try again.");
		}
		hideSpinner();
	};
	
	/**
	*	Name	:	getBusinessUnits
	*	Desc	:	Fetch the business units from the server
	**/
	var getBusinessUnits = function () {
		console.log("Method : getBusinessUnits");
		data = new Object();
		data.module = BUSINESS_UNITS;
		getResponse(data,parseBusinessUnits);
	};
	var parseBusinessUnits = function(response) {
		if(response.status==1) {
			localStorage.businessUnits = JSON.stringify(response.businessUnits);
			enableLogin();
			bindSelect("#selLoginBUnit",response.businessUnits);
			
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	