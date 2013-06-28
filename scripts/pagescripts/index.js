/***
*	Author 			: Rahmathullah M
*	Date created	: 18/3/2013
*	Date Modified	: 18/3/2013
*	Description		: JS for moblile application for Task Force ERP
*	
*	TO DO:-	 
*			-	
*/
	
	
	var BUSINESS_UNITS		= "BUSINESS_UNITS";
	var NOTIFICATIONS		= "NOTIFICATIONS";
	var API_NOTIFICATIONS		= "NOTIFICATIONCOUNT";
	var API_SALARYSUMMARY		= "SALARYSUMMARY";
	var API_HRNOTIFICATIONS		= "HRNOTIFICATIONS";
	var LOGIN				= "LOGIN";
	
	var NOTIFICATIONS_LOADED = false;
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
				$('.menu-button').show();
			else
				$('.menu-button').hide();
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
		$("#pageDashboard").on('pagecreate', function(e, ui){  
			showSpinner();
			getNotificationsCount();
		});
		$("#pageSalarySummary").on('pagecreate', function(e, ui){  
			showSpinner();
			getSalarySummary();
		});
		$("#pageHRNotifications").on('pagecreate', function(e, ui){  
			showSpinner();
			getHRNotifications();
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
		$("#viewAllNotifications").on("click",function() {
			showSpinner();
			getNotifications();			
		});
		$(".tabNoti").on("click",function() {
			showSpinner();
			getNotifications();
		});
		$(".sideMenuNotificaitons").on("click",function() {
			showSpinner();
			getNotifications();
		});
		$(".tabDash").on("click",function() {
			changePageID('#pageDashboard');
		});
		$(".notificaiton-head").on("click",function() {
			$(".notificaiton-sub").slideUp();			
			var parent = $(this).parent();
			var block = parent.children('.notificaiton-sub');
			if(block.css("display") == "none" )
				block.slideDown();
		});
		$(".sideMenuNotificaitons").on("click",function() {
			changePageID("#pageNotifications");
		});
		$(".sideMenuSales").on("click",function() {
			changePageID("#pageSales");
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
	*	Name	:	getHRNotifications
	*	Desc	:	Fetch HR notifications count from the server
	**/
	var getHRNotifications = function () {
		console.log("Method : getHRNotifications");
		if (localStorage.getItem("hrNotifications") === null) {
			data = new Object();
			data.module = API_HRNOTIFICATIONS;
			data.branchFilter = localStorage.branchFilter;
			getResponseV2(data,parseHRNotifications);
		}else{
			var response = JSON.parse(localStorage.hrNotifications);
			parseHRNotifications(response);	
		}
	}; 
	var parseHRNotifications = function(response) {
		if(response.status==1) {
			displayHRNotifications(response);	
			localStorage.hrNotifications = JSON.stringify(response);		
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	
	var displayHRNotifications = function(response) {
		var hrNotifications = response.hr_notifications;
		var parent = $('#divHRNotifications');
		for( i = 0 ; i < hrNotifications.length ; i++ ) {
			var divName = $('<div/>');
			var divDate = $('<div/>');
			var divItem = $('<div/>');
			
			divItem.addClass('inner-list-item');
			divName.addClass('w50');
			divDate.addClass('w50');
			//divDate.css('text-align','right');
			
			divDate.html(hrNotifications[i].EMP_NAME);
			divName.html(hrNotifications[i].START_DATE);
			
			divDate.appendTo(divItem);	
			divName.appendTo(divItem);
			
			divItem.appendTo(parent);
		}
		divItem.addClass('last');
	}
	/**
	*	Name	:	getSalarySummary
	*	Desc	:	Fetch salary summary 
	**/
	var getSalarySummary = function () {
		console.log("Method : getSalarySummary");
		if (localStorage.getItem("salarySummary") === null) {
			data = new Object();
			data.module = API_SALARYSUMMARY;
			data.branchFilter = localStorage.branchFilter;
			getResponseV2(data,parseSalarySummary);
		}else{
			var response = JSON.parse(localStorage.salarySummary);
			parseSalarySummary(response);	
		}
	}; 
	var parseSalarySummary = function(response) {
		if(response.status==1) {
			displaySalarySummary(response);	
			localStorage.salarySummary = JSON.stringify(response);		
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	
	var displaySalarySummary = function(response) {
		var salarySummary = response.salary_summary;
		var parent = $('#divSalarySummary');
		for( i = 0 ; i < salarySummary.length ; i++ ) {
			var divMonth = $('<div/>');
			var divSalary = $('<div/>');
			var divItem = $('<div/>');
			divItem.addClass('inner-list-item');
			divMonth.addClass('w60');
			divSalary.addClass('w40');
			divSalary.css('text-align','right');
			divMonth.html(salarySummary[i].MONTH);
			divSalary.html(salarySummary[i].SALARY);
			divMonth.appendTo(divItem);
			divSalary.appendTo(divItem);	
			divItem.appendTo(parent);
		}
		divItem.addClass('last');
	}
	
	/**
	*	Name	:	getNotificationsCount
	*	Desc	:	Fetch notifications count from the server
	**/
	var getNotificationsCount = function () {
		console.log("Method : getNotificationsCount");
		if (localStorage.getItem("notificationsCount") === null) {
			data = new Object();
			data.module = API_NOTIFICATIONS;
			data.branchFilter = localStorage.branchFilter;
			getResponse(data,parseNotificationsCount);
		}else{
			var response = JSON.parse(localStorage.notificationsCount);
			parseNotificationsCount(response);	
		}
	}; 
	var parseNotificationsCount = function(response) {
		if(response.status==1) {
			displayNotificationsCount(response);	
			localStorage.notificationsCount = JSON.stringify(response);		
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	
	var displayNotificationsCount = function(response) {
		var parent = $('.dash-notifications');
		var counts = response.notification_count;
		for( i = 0; i < counts.length ; i++ ) {
			/* Skip notifications with zero */
			if( counts[i].count > 0 ) {
				var div = $('<div/>');
				div.html( counts[i].name + '<div class="count">'+ counts[i].count + "</div>" );
				div.addClass('dash-noti-sub-head');
				div.appendTo(parent);
			}
		}
		div.addClass('last');
	}
	/**
	*	Name	:	getNotifications
	*	Desc	:	Fetch notifications from the server
	**/
	var getNotifications = function () {
		console.log("Method : getNotifications");
		if (localStorage.getItem("notification") === null) {
			data = new Object();
			data.module = NOTIFICATIONS;
			data.branchFilter = localStorage.branchFilter;
			getResponse(data,parseNotifications);
		}else{
			if(NOTIFICATIONS_LOADED == false) {
				var response = JSON.parse(localStorage.notification);
				parseNotifications(response);	
			}else{
				changePageID('#pageNotifications');
			}
		}
	}; 
	var parseNotifications = function(response) {
		if(response.status==1) {
			displayNotifications(response);	
			localStorage.notification = JSON.stringify(response);		
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
			
		displayOneSetNotification(absent_notifications,'#divNotiAbsent');
		displayOneSetNotification(delivery_notifications,'#divNotiDeli');
		displayOneSetNotification(glvoucher_notifications,'#divNotiVoucher');
		displayOneSetNotification(gosi_notifications,'#divNotiGosi');
		displayOneSetNotification(increment_notifications,'#divNotiInc');
		displayOneSetNotification(iqama_notifications,'#divNotiIqama');
		displayOneSetNotification(loan_notifications,'#divNotiLoan');
		displayOneSetNotification(vacation_notifications,'#divNotiVac');
		displayOneSetNotification(vacation_request_notifications,'#divNotiVacReq');
		
		NOTIFICATIONS_LOADED = true;
		changePageID('#pageNotifications');
	}
	var displayOneSetNotification = function(notifications,id){
		if(notifications.length > 0) {
			if(notifications.length == 1) {
				if(notifications[0].data == "0" )
					return true;
			}
			var parentDiv = $(id);
			parentDiv.show();
			/* display count in each module */
			var countDiv = $("<div/>")
				.attr("class","count")
				.html(notifications.length);
			
			/* append the COUNT div to HEAD div */
			var divHead = parentDiv.children('.notificaiton-head');
			countDiv.appendTo(divHead);
			
			var childDiv = $(id + "-sub");
			childDiv.html("");
			$.each(notifications, function(index,value) {				
				var div =  $("<div/>")
					.attr('class','notificaiton-rows')
					.text(value.data);
				div.appendTo(childDiv);			
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
	