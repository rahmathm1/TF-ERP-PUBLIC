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
	var API_SELLING			= "TOP10SELLING";
	var API_NONSELLING			= "TOP10NONSELLING";
	var API_ACCPAYABLES			= "TOP10ACCPAYABLES";
	var API_ACCRECEIVABLES			= "TOP10ACCRECEIVABLES";
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
		/*$("#pageSalarySummary").on('pagecreate', function(e, ui){  
			
		});
		$("#pageHRNotifications").on('pagecreate', function(e, ui){  
			
		});*/
		$("#pageLogin").on('pagebeforeshow', function(e, ui){  
			console.log("login : page before show");
			if(localStorage.isLoggedIn == "true") {
				e.preventDefault();
				e.stopPropagation();			
				changePageID("#pageDashboard");
			}
		});
		
		$(".log-out").on('click', function(){  
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
		$("#subMenuSalarySummary").on("click",function() {
			showSpinner();
			getSalarySummary();
		});
		$("#subMenuHRNotifications").on("click",function() {
			showSpinner();
			getHRNotifications();
		});
		$("#subMenuAccReceibales").on("click",function() {
			showSpinner();
			getAccReceivables();
		});
		$("#subMenuAccPayables").on("click",function() {
			showSpinner();
			getAccPayables();
		});
		
		
		$("#subMenuSelling").on("click",function() {
			showSpinner();
			getSellingItems();
		});
		$("#subMenuNonSelling").on("click",function() {
			showSpinner();
			getNonSellingItems();
		});
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
			showSpinner();
			getNotifications();
		});
		$(".sideMenuSales").on("click",function() {
			showSpinner();
			getSellingItems();
		});
		$(".sideMenuFinance").on("click",function() {
			showSpinner();
			getAccReceivables();
		});
		$(".sideMenuPurchase").on("click",function() {
			alert('Page is under construction');
		});
		$(".sideMenuHR").on("click",function() {
			showSpinner();
			getSalarySummary();
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
	/******************************************************************
	*	Name	:	getAccReceivables
	*	Desc	:	Fetch HR notifications count from the server
	**/
	var getAccReceivables = function () {
		console.log("Method : getAccReceivables");
		if (localStorage.getItem("accReceivables") === null) {
			data = new Object();
			data.module = API_ACCRECEIVABLES;
			data.branchFilter = localStorage.branchFilter;
			getResponseV2(data,parseAccReceivables);
		}else{
			var response = JSON.parse(localStorage.accReceivables);
			parseAccReceivables(response);	
		}
	}; 
	var parseAccReceivables = function(response) {
		if(response.status==1) {
			displayAccReceivables(response);	
			localStorage.accReceivables = JSON.stringify(response);		
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	
	var displayAccReceivables = function(response) {
		var accReceivables = response.acc_receivables;
		var parent = $('#divFinance');
		parent.html("");
		var title = $('#pageFinance .pageTitle');
		title.html('TOP 10 Account Receivables');
		var head1 = $('#pageFinance .head1');
		var head2 = $('#pageFinance .head2');
		head1.html('Customer');
		head2.html('Balance');
		head2.css('text-align','right');
		for( i = 0 ; i < accReceivables.length ; i++ ) {
			var divName = $('<div/>');
			var divBal = $('<div/>');
			var divItem = $('<div/>');
			
			divItem.addClass('inner-list-item');
			divName.addClass('w60');
			divBal.addClass('w40');
			divBal.css('text-align','right');
			
			divBal.html(accReceivables[i].CUSTOMER_BALANCE);
			divName.html(accReceivables[i].CUSTOMER_NAME);
			
			divName.appendTo(divItem);
			divBal.appendTo(divItem);	
			
			divItem.appendTo(parent);
		}
		divItem.addClass('last');
		changePageID('#pageFinance');
	}
	/******************************************************************
	*	Name	:	getAccPayables
	*	Desc	:	Fetch HR notifications count from the server
	**/
	var getAccPayables = function () {
		console.log("Method : getAccPayables");
		if (localStorage.getItem("accPayables") === null) {
			data = new Object();
			data.module = API_ACCPAYABLES;
			data.branchFilter = localStorage.branchFilter;
			getResponseV2(data,parseAccPayables);
		}else{
			var response = JSON.parse(localStorage.accPayables);
			parseAccPayables(response);	
		}
	}; 
	var parseAccPayables = function(response) {
		if(response.status==1) {
			displayAccPayables(response);	
			localStorage.accPayables = JSON.stringify(response);		
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	
	var displayAccPayables = function(response) {
		var accPayables = response.acc_payables;
		var parent = $('#divFinance');
		parent.html("");
		var title = $('#pageFinance .pageTitle');
		title.html('TOP 10 Account Payables');
		var head1 = $('#pageFinance .head1');
		var head2 = $('#pageFinance .head2');
		head1.html('Suppplier');
		head2.html('Balance');
		head2.css('text-align','right');
		for( i = 0 ; i < accPayables.length ; i++ ) {
			var divName = $('<div/>');
			var divBal = $('<div/>');
			var divItem = $('<div/>');
			
			divItem.addClass('inner-list-item');
			divName.addClass('w60');
			divBal.addClass('w40');
			divBal.css('text-align','right');
			
			divBal.html(accPayables[i].SUPPLIER_BALANCE);
			divName.html(accPayables[i].SUPPLIER_NAME);
			
			divName.appendTo(divItem);
			divBal.appendTo(divItem);	
			
			divItem.appendTo(parent);
		}
		divItem.addClass('last');
		changePageID('#pageFinance');
	}
	/***********************************************	
	*	Name	:	getNonSellingItems
	*	Desc	:	Fetch HR notifications count from the server
	**/
	var getNonSellingItems = function () {
		console.log("Method : getNonSellingItems");
		if (localStorage.getItem("nonSellingItems") === null) {
			data = new Object();
			data.module = API_NONSELLING;
			data.branchFilter = localStorage.branchFilter;
			getResponseV2(data,parseNonSellingItems);
		}else{
			var response = JSON.parse(localStorage.nonSellingItems);
			parseNonSellingItems(response);	
		}
	}; 
	var parseNonSellingItems = function(response) {
		if(response.status==1) {
			displayNonSellingItems(response);	
			localStorage.nonSellingItems = JSON.stringify(response);		
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	
	var displayNonSellingItems = function(response) {
		var nonSellingItems = response.non_selling;
		var parent = $('#divSalesItems');
		parent.html("");
		var title = $('#pageSales .pageTitle');
		var head1 = $('#pageSales .head1');
		var head2 = $('#pageSales .head2');
		head1.html('Item Code');
		head2.html('Item Name');
		head2.css('text-align','left');
		title.html('TOP 10 Non-selling items');
		for( i = 0 ; i < nonSellingItems.length ; i++ ) {
			var divName = $('<div/>');
			var divCode = $('<div/>');
			var divItem = $('<div/>');
			
			divItem.addClass('inner-list-item');
			divName.addClass('w50');
			divCode.addClass('w50');
			
			divCode.html(nonSellingItems[i].ITEM_CODE);
			divName.html(nonSellingItems[i].ITEM_NAME);
			
			divCode.appendTo(divItem);	
			divName.appendTo(divItem);
			
			divItem.appendTo(parent);
		}
		divItem.addClass('last');
		changePageID('#pageSales');
	}	
	/*****************************************************************
	*	Name	:	getSellingItems
	*	Desc	:	Fetch HR notifications count from the server
	**/
	var getSellingItems = function () {
		console.log("Method : getSellingItems");
		if (localStorage.getItem("sellingItems") === null) {
			data = new Object();
			data.module = API_SELLING;
			data.branchFilter = localStorage.branchFilter;
			getResponseV2(data,parseSellingItems);
		}else{
			var response = JSON.parse(localStorage.sellingItems);
			parseSellingItems(response);	
		}
	}; 
	var parseSellingItems = function(response) {
		if(response.status==1) {
			displaySellingItems(response);	
			localStorage.sellingItems = JSON.stringify(response);		
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	
	var displaySellingItems = function(response) {
		var sellingItems = response.selling;
		var parent = $('#divSalesItems');
		parent.html("");
		var title = $('#pageSales .pageTitle');
		title.html('TOP 10 Selling items');
		var head1 = $('#pageSales .head1');
		var head2 = $('#pageSales .head2');
		head1.html('Name');
		head2.html('Quantity');
		head2.css('text-align','right');
		for( i = 0 ; i < sellingItems.length ; i++ ) {
			var divName = $('<div/>');
			var divQty = $('<div/>');
			var divItem = $('<div/>');
			
			divItem.addClass('inner-list-item');
			divName.addClass('w70');
			divQty.addClass('w30');
			divQty.css('text-align','right');
			
			divQty.html(sellingItems[i].QTY);
			divName.html(sellingItems[i].ITEM_NAME);
			
			divName.appendTo(divItem);
			divQty.appendTo(divItem);	
			
			divItem.appendTo(parent);
		}
		divItem.addClass('last');
		changePageID('#pageSales');
	}
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
		parent.html(" ");
		for( i = 0 ; i < hrNotifications.length ; i++ ) {
			var divName = $('<div/>');
			var divDate = $('<div/>');
			var divItem = $('<div/>');
			
			divItem.addClass('inner-list-item');
			divName.addClass('w50');
			divDate.addClass('w50');
			//divDate.css('text-align','right');
			
			divDate.html(hrNotifications[i].EMP_NAME);
			divName.html(hrNotifications[i].DATE);
			
			divDate.appendTo(divItem);	
			divName.appendTo(divItem);
			
			divItem.appendTo(parent);
		}
		divItem.addClass('last');
		changePageID('#pageHRNotifications');
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
		parent.html("");
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
		changePageID('#pageSalarySummary');
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
				hideSpinner();
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
		hideSpinner();
	};
	
	var displayNotifications = function(response) {
		
		absent_notifications = response.absent_notifications;
		delivery_notifications = response.delivery_notifications;
		glvoucher_notifications = response.glvoucher_notifications;
		gosi_notifications = response.gosi_notifications;
		increment_notifications = response.increment_notifications;
		iqama_notifications = response.iqama_notifications;
		loan_notifications = response.loan_notifications;
		shipment_notifications = response.shipment_notifications;
		vacation_notifications = response.vacation_notifications;
		vacation_request_notifications = response.vacation_request_notifications;
		invoice_notifications = response.invoice_notifications;
			
		displayOneSetNotification(absent_notifications,'#divNotiAbsent');
		displayOneSetNotification(delivery_notifications,'#divNotiDeli');
		displayOneSetNotification(glvoucher_notifications,'#divNotiVoucher');
		displayOneSetNotification(gosi_notifications,'#divNotiGosi');
		displayOneSetNotification(increment_notifications,'#divNotiInc');
		displayOneSetNotification(iqama_notifications,'#divNotiIqama');
		displayOneSetNotification(loan_notifications,'#divNotiLoan');
		displayOneSetNotification(vacation_notifications,'#divNotiVac');
		displayOneSetNotification(vacation_request_notifications,'#divNotiVacReq');
		displayOneSetNotification(shipment_notifications,'#divNotiShip');
		displayOneSetNotification(invoice_notifications,'#divNotiInv');
		
		NOTIFICATIONS_LOADED = true;
		changePageID('#pageNotifications');
		hideSpinner();
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
	