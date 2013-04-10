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
		
		getBusinessUnits();
		getAccLevels();
		bindEvents();
	}
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
			navigator.notification.alert("Please check network connection.", exitApplication, "Task Force ERP","OK");					
		}		
	};
	
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
		$.mobile.changePage(pageId,{transition: "fade"});
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
		console.log("Network error. Please try again. Result : "+JSON.stringify(res));
	}
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
	
	
	/* bind drop down */
	var bindSelect = function(selectId,data) {
		var sel = $(selectId);		
		$.each(data, function(index,value) {
			var option =  $("<option/>")
				.attr("value",value.id)
				.text(value.text);
			option.appendTo(sel);
		});	
		sel.selectmenu("refresh");
	};
	
	
	
	
	/*************************************************************
	*			EVENTS	
	**************************************************************/	
	var bindEvents = function() {
		/* Home : button login click */
		$("#btnLogin").on("click",function() {
				//showSpinner();
				changePage("notification.html");
				//login();
		});
		/* Page : Income & Expence Home */
		$(".radio-tab").on("click",function() {
			$(".radio-tab").removeClass("active");
			$(this).addClass("active");
			
			$(".radio-tab-content").hide();
			var id = $(this).attr("tab");
			$(id).show();
		});
		/* Page : Home */
		$("#btnHomeBS").on("click",function() {
			changePage("#pageBSHome");
		});
		/* Page : Balance Sheet Home */
		$("#btnBSDisplay").on("click",function() {
			displayBalanceSheet();
		});
		$("#pageIncHome").on("pageinit",function(event){
			console.log("pageinit : pageIncHome");
			$(function(){
	/*			$("#dateFrom").mobiscroll().date({
					theme: 'android-ics',
					display: 'top',
			        mode: 'scroller'
				}); 				
				$("#dateTo").mobiscroll().date({
					theme: 'android-ics',
					display: 'top',
			        mode: 'scroller'
				}); */
			});
		});
		$("#pageBSHome").on("pageinit",function(event){
			console.log("pageinit : pageIncHome");
			$(function(){
				$("input[name=datePicker]").mobiscroll().date({
					theme: 'android-ics',
					display: 'top',
			        mode: 'scroller'
				}); 
			});
		});

	};
	$("#pageLogin").on("pageinit",function(event){
		console.log("pageshow : pageLogin");
	});
	
	/**
	*	Name	:	login
	*	Desc	:	login to the system
	**/
	var login = function () {
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
			changePage("#pageHome");
		} else if(response.status == 2){
			showAlert("Invalid user id or password");
		} else {
			showAlert("Network Error: Please try again.");
		}
		hideSpinner();
	};
	
	/**
	*	Name	:	getBusinessUnits
	*	Desc	:	Check network connectivity
	**/
	var getBusinessUnits = function () {
		console.log("Method : getBusinessUnits");
		data = new Object();
		data.module = BUSINESS_UNITS;
		getResponse(data,parseBusinessUnits);
	};
	var parseBusinessUnits = function(response) {
		if(response.status==1) {
			localStorage.branches = JSON.stringify(response.business_units);
			bindSelect("select[name=branches]",response.business_units);
		} else {
			ajaxFailed();
		}
	};
	/**
	*	Name	:	getAccLevels
	*	Desc	:	Check network connectivity
	**/
	var getAccLevels = function () {
		console.log("Method : getAccLevels");
		data = new Object();
		data.module = ACC_LEVELS;
		getResponse(data,parseAccLevels);
	};
	var parseAccLevels = function(response) {
		if(response.status==1) {
			localStorage.accLevels = JSON.stringify(response.accLevels);
			bindSelect("select[name=acclevels]",response.accLevels);
		} else {
			ajaxFailed();
		}
	};
	
	/**
	*	Name	:	displayBalanceSheet
	*	Desc	:	to display balance sheet.
	**/
	var displayBalanceSheet = function() {
		
	}