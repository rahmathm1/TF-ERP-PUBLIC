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
	var NOTIFICATIONS 	= "NOTIFICATIONS";
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
		
		$("#menuLogout").on('click', function(){  
			console.log("clicked menu>logout");
			showSpinner();
			logout();
		});
		$(".menuExit").on('click', exitApplication);
		
		/* dashboard buttons */
		$(".buttons").on("click",function() {
			var id = $(this).attr("id");
			if($("#subOptions"+id).css("display") == "none" ) {
				$(".sub-button-wrapper").slideUp();
				$("#subOptions"+id).slideToggle();
			} else {
				$("#subOptions"+id).slideUp();
			}
		});
		/*$("#pageNotifications").on("pageshow",function(event){
			showSpinner();
		});*/
		$("#subMenuAllNotifications").on("click",function() {
			showSpinner();
			getNotifications();
		});
		$("#subMenuPendingNotifications").on("click",function() {
			showSpinner();
			getNotifications();
			
		});
		
		
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
			localStorage.branchFilter = response.userInfo.branch_filter;
			changePageID("#pageDashboard");
		} else if(response.status == 2){
			showAlert("Invalid user id or password");
		} else {
			showAlert("Network Error: Please try again.");
		}
		hideSpinner();
	};
	/**
	*	Name	:	getNotifications
	*	Desc	:	Fetch notifications from the server
	**/
	var getNotifications = function () {
		console.log("Method : getNotifications");
		data = new Object();
		data.module = NOTIFICATIONS;
		data.branchFilter = localStorage.branchFilter;
		getResponse(data,parseNotifications);
	};
	var parseNotifications = function(response) {
		if(response.status==1) {
			displayNotifications(response);			
		} else {
			ajaxFailed();
		}
	};
	
	var displayNotifications = function(response) {
		
		absent_notifications = response.absent_notifications;
		delivery_notifications = response.delivery_notifications;
		glvoucher_notifications = response.glvoucher_notifications;
		gosi_notifications = response.gosi_notifications;
		increment_notifications = response.increment_notifications;
		iqama_notifications = response.iqama_notifications;
		loan_notifications = response.loan_notifications;
		vacation_notifications = response.vacation_notifications;
		vacation_request_notifications = response.vacation_request_notifications;
			
		displayOneSetNotification(absent_notifications,'#tblNotiAbsent');
		displayOneSetNotification(delivery_notifications,'#tblNotiDeli');
		displayOneSetNotification(glvoucher_notifications,'#tblNotiGosi');
		displayOneSetNotification(gosi_notifications,'#tblNotiInc');
		displayOneSetNotification(increment_notifications,'#tblNotiIqama');
		displayOneSetNotification(iqama_notifications,'#tblNotiLoan');
		displayOneSetNotification(loan_notifications,'#tblNotiVac');
		displayOneSetNotification(vacation_notifications,'#tblNotiVacReq');
		displayOneSetNotification(vacation_request_notifications,'#tblNotiVoucher');
		
		changePageID('#pageNotifications');
	}
	var displayOneSetNotification = function(notifications,id){
		if(notifications.length > 0) {
			$(id).show();
			var tbody = $(id+' tbody');
			$.each(notifications, function(index,value) {
				var tr =  $("<tr/>");
				var td =  $("<td/>")
					.text(value.data);
				td.appendTo(tr);
				tr.appendTo(tbody);				
			});	
		}
	}
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
	