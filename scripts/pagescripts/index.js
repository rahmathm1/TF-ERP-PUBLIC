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
	var NOTIFICATIONS		 = "NOTIFICATIONS";
	var API_NOTIFICATIONSCOUNT= "NOTIFICATIONCOUNT";
	var API_SALARYSUMMARY	 = "SALARYSUMMARY";
	var API_HRNOTIFICATIONS   = "HRNOTIFICATIONS";
	var API_SELLING		   = "TOP10SELLING";
	var API_NONSELLING	    = "TOP10NONSELLING";
	var API_ACCPAYABLES	   = "TOP10ACCPAYABLES";
	var API_ACCRECEIVABLES    = "TOP10ACCRECEIVABLES";
	var LOGIN				 = "LOGIN";
	var API_DASHSUMMARY	   = "DASHSUMMARY";
	var API_LOANTYPES	   	 = "LOANTYPES";
	var API_LOANREQUEST	   = "LOANREQUEST";
	var API_BALANCE_SHEET 	 = "BALANCESHEET";
	var API_PROFIT_LOSS 	   = "PROFIT_LOSS";
	var API_BRANCHES 		  = "BRANCHES";
	var API_CHANGEPASSWORD 	= "CHANGEPASSWORD";
	
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
				if (localStorage.getItem("userInfo") === null) {
					var userInfo = JSON.parse(localStorage.getItem("userInfo"));
					$('.menuUserName').text(userInfo.user_name);
					$('.menuLastLogin').text('Last Login : ' + userInfo.last_logged_in);
				}
				changePageID("#pageHome");								
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
	
		$("#btnRetry").on("click",function() {
			console.log("Retrying");
			showSpinner();
			getBusinessUnits();
		});
		
		$("#pageHome").on('pagebeforehide', function(e, ui){  
			console.log("Hiding page");
			if(ui.nextPage.attr("id") == "pageLogin"){
				if( localStorage.isLoggedIn == "true" )
				{			
					exitApplication();		
				}
			}
		});
		$("#pageHome").on('pageshow', function(e, ui){  
			showSpinner();
			getNotificationsCount();
		});
		$("#pageBalanceSheetDetails").on('pageshow', function(e, ui){  
			showSpinner();
			getBraches();
		});
		$("#pageBalanceSheetDetails").on('pagecreate', function(e, ui){  
			$("#selLevelBL").on("change",function() {
				showSpinner();
				var level = $('#selLevelBL').val();
				var branch = $("#selBranchBL").val().trim();
				getBalanceSheet(level,branch);
			});
			$("#selBranchBL").on("change",function() {
				showSpinner();				
				var level = $('#selLevelBL').val();
				var branch = $("#selBranchBL").val().trim();
				getBalanceSheet(level,branch);
			});
		});
		$("#pageProfitLossDetails").on('pageshow', function(e, ui){  
			showSpinner();
			getBraches();
		});
		$("#pageProfitLossDetails").on('pagecreate', function(e, ui){  
			$("#selLevelPL").on("change",function() {
				showSpinner();
				var level = $('#selLevelPL').val();
				var branch = $("#selBranchPL").val().trim();
				getProfitLoss(level,branch);
			});
			$("#selBranchPL").on("change",function() {
				showSpinner();				
				var level = $('#selLevelPL').val();
				var branch = $("#selBranchPL").val().trim();
				getProfitLoss(level,branch);
			});
		});
		$("#pageProfile").on('pagecreate', function(e, ui){  
			$("#btnSavePassword").on("click",changePassword);	
			
			var userInfo = JSON.parse(localStorage.userInfo);
			
			$('#userInfoName').text(userInfo.user_name);
			$('#userInfoBranch').text('Branch : ' + userInfo.branch_name);
			$('#userInfoLogin').text(userInfo.last_logged_in);
			$('#userInfoLogout').text(userInfo.last_logged_out);
			
					
		});
		
		$("#pageNotifications").on('pagecreate', function(e, ui){  
			$("#selNotificationCategory").on("change",function() {
				showSpinner();
				var category = $('#selNotificationCategory').val();
				//alert(category);
				localStorage.lastClickedCategory = category;
				getNotifications(category);
			});
			
			bindNotificationCategory();			
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
				changePageID("#pageHome");
			}
		});
		
		$(".log-out").on('click', function(){  
			console.log("clicked menu>logout");
			showSpinner();
			logout();
		});
		/*$(".menuExit").on('click', exitApplication);*/
		
		/* dashboard buttons */
		$(".buttons").on("click",function() {
			var id = $(this).attr("id");
			/*if($("#subOptions"+id).css("display") == "none" ) {
				$(".sub-button-wrapper").slideUp();
				$("#subOptions"+id).slideToggle();
			} else {
				$("#subOptions"+id).slideUp();
			}*/
		});
		/* Load dashboard summary */
		$("#pageDashboard").on("pageshow",function(event){
			showSpinner();
			getDashSummary();
		});
		$("#pageServiceRequest").on("pageshow",function(event){
			if($("#selLoanTypes").length == 1) {
				showSpinner();
				getLoanTypes();
				$("input[name=datePicker]").mobiscroll().date({
					theme: 'android-ics',
					display: 'top',
					mode: 'scroller'
				}); 
			}
				
		});
		/*$("#pageNotifications").on("pageshow",function(event){
			showSpinner();
		});*/
		$(".popMenuSalarySummary").on("click",function() {
			showSpinner();
			getSalarySummary();
		});
		$(".popMenuHRNotifications").on("click",function() {
			showSpinner();
			getHRNotifications();
		});
		$(".popMenuAccReceibales").on("click",function() {
			showSpinner();
			getAccReceivables();
		});
		$(".popMenuAccPayables").on("click",function() {
			showSpinner();
			getAccPayables();
		});
		
		
		$(".popMenuSelling").on("click",function() {
			showSpinner();
			getSellingItems();
		});
		$(".popMenuNonSelling").on("click",function() {
			showSpinner();
			getNonSellingItems();
		});
		$(".notifications").on("click",function() {
			showSpinner();
			localStorage.lastClickedCategory = 'ABSENT';
			getNotifications('ABSENT');
		});
		/*$(".popMenuPendingNotifications").on("click",function() {
			showSpinner();
			getNotifications();			
		});*/
		$(".filter-tabs").on("click",function() {
			$('.dash-noti-sub-head-big').hide();
			$(".filter-tabs").removeClass('selected');
			$(this).addClass('selected');
			var tag = $(this).attr('data-tag');
			if( tag == 'all')
				$('.dash-noti-sub-head-big').show();
			else {
				$('.dash-noti-sub-head-big[data-tag='+tag+']').show();
			}
		});
		
		/*$("#viewAllNotifications").on("click",function() {
			showSpinner();
			getNotifications();			
		});*/
		$(".tabDash").on("click",function() {
			showSpinner();
			changePageID('#pageDashboard');
			//getNotifications();
		});
		$(".tabHome").on("click",function() {
			showSpinner();
			changePageID('#pageHome');
		});
		$(".sideMenuNotificaitons").on("click",function() {
			showSpinner();
			localStorage.lastClickedCategory = 'ABSENT';
			getNotifications('ABSENT');
		});
		$(".sideMenuBalanceSheet").on("click",function() {
			showSpinner();
			getBalanceSheet('FIRST LEVEL','');
		});
		$(".sideMenuProfitLoss").on("click",function() {
			showSpinner();
			getProfitLoss('FIRST LEVEL','');
		});
		$(".notificaiton-head").on("click",function() {
			$(".notificaiton-sub").hide();			
			var parent = $(this).parent();
			var block = parent.children('.notificaiton-sub');
			if(block.css("display") == "none" )
				block.show();
		});
		/*$(".sideMenuNotificaitons").on("click",function() {
			showSpinner();
			getNotifications();
		});*/
		$(".sideMenuSales").on("click",function() {
			showSpinner();
			getSellingItems();
		});
		$(".sideMenuFinance").on("click",function() {
			showSpinner();
			getAccReceivables();
		});
		/*$(".sideMenuPurchase").on("click",function() {
			alert('Page is under construction');
		});*/
		$(".sideMenuHR").on("click",function() {
			showSpinner();
			getSalarySummary();
		});
		
		$("#selTenure").on("change",function() {
			showSpinner();
			var index = $("#selTenure option:selected").val();
			var response = JSON.parse(localStorage.dashSummary);
			displayDashSummary(response,index);	
			hideSpinner();
		});
		$(".tabReq").on("click",function() {
			showSpinner();
			changePageID('#pageServiceRequest');
		});
		$("#btnRequestLoan").on("click",requestLoan);
		
	};
	$("#pageLogin").on("pageinit",function(event){
		console.log("pageinit : pageLogin");
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
			localStorage.branchCode = response.userInfo.branch_code+"";
			localStorage.userInfo = JSON.stringify(response.userInfo);
			/*localStorage.lastLogin = response.userInfo.last_logged_in;
			localStorage.lastLogout = response.userInfo.last_logged_out;
			localStorage.userName = response.userInfo.user_name;
			localStorage.branchName = response.userInfo.branch_name;*/
			//alert(localStorage.branchCode);
			localStorage.userCode = response.userInfo.user_code;
			$('.menuUserName').text(response.userInfo.user_name);
			$('.menuLastLogin').text('Last Login : ' + response.userInfo.last_logged_in);
			changePageID("#pageHome");
		} else if(response.status == 2){
			showAlert("Invalid user id or password");
		} else {
			showAlert("Network Error: Please try again.");
		} 
		hideSpinner();
	};
	
	/*  log out */
	var logout = function() {
		data = new Object();		
		data.module = "LOGOUT";		
		data.user_code = localStorage.userCode;
		localStorage.clear();
		localStorage.isLoggedIn = "false";
		getResponse(data,parseLogout);
	}
	var parseLogout = function(response) {
		showAlert("You've been logged out.");
		window.location = "index.html";
	};
	var bindNotificationCategory = function() {
		var sel = $('#selNotificationCategory');
		var response = JSON.parse(localStorage.notificationsCount);
		sel.html("");	
		if($("selectId option").length  <= 1 ) {
			$.each(response.notification_count, function(index,value) {
				var option =  $("<option/>")
					.attr("value",value.category)
					.text(value.name);
				option.appendTo(sel);
			});	
			//sel.selectmenu("refresh");
		}else{
			console.log('select, ' + selectId + ' already generated');
		}
	};
	/*
	*	Name	:	getProfitLoss
	*	Desc	:	to display balance sheet.
	*/
	var getProfitLoss = function(level,branch) {
		console.log("Method : getProfitLoss");
		data = new Object();
		data.module = API_PROFIT_LOSS;
		data.type='POSTED';
		data.level=level;
		data.withOutZero='false';
		if(branch != '') {
			data.displayCriteria=branch;
			data.displayBy='BRANCH';
		}
		/*if(branch != '') 
			data.branch=branch;*/
		getResponse(data,parseProfitLoss);
	}
	var parseProfitLoss = function(response) {
		if(response.status == 1) {			
			var tblProfitLoss = $("#tblProfitLoss");
			tblProfitLoss.html("");
			$.each(response.profitAndLoss,function(index,value){
				var tr = $("<tr/>");
				var td1 = $("<td/>");
				var td2 = $("<td/>");
				var td3 = $("<td/>");
				var td4 = $("<td/>");
				var td5 = $("<td/>");
					console.log("here 2");
				td1.text(value.Accode);		
				td2.text(value.DESC_ENG);	
				if(value.Accode != "Income" && value.Accode != "Expense")	{					
					var amnt = parseFloat(value.Debit).toFixed(2)+"";
					amnt = numberWithCommas(amnt)					
					td3.text(amnt);	
					amnt = parseFloat(value.Credit).toFixed(2)+"";
					amnt = numberWithCommas(amnt)					
					td4.text(amnt);		
				}
				
				td3.css('text-align','right');
				td4.css('text-align','right');
				
				
				if(td3.text() == "0.00") 
					td3.text("0");
				if(td4.text() == "0.00") 
					td4.text("0");
					
				td1.appendTo(tr);
				td2.appendTo(tr);
				td3.appendTo(tr);
				td4.appendTo(tr);
				//td5.appendTo(tr);		
				
				if(value.Accode == "Income" || value.Accode == "Expense")
					tr.addClass("highlighted1");
				else if(value.DESC_ENG == "Income Total" || value.DESC_ENG == "Expense Total")
					tr.addClass("highlighted2");
				else  if(value.DESC_ENG == "Profit")
					tr.addClass("profit");
				else  if( value.DESC_ENG == "Loss")
					tr.addClass("loss");
						
				tr.appendTo(tblProfitLoss);				
			});
			changePageID("#pageProfitLossDetails");
			hideSpinner();
		} else {
			hideSpinner();
			showAlert("Network Error: Please try again.");
		}
	}
	/*
	*	Name	:	changePassword
	*	Desc	:	change user password.
	*/
	var changePassword = function() {
		var current_password = $('#txtCurrentPassword').val();
		var new_password 	 = $('#txtNewPassword').val();
		var confirm_password = $('#txtConfirmPassword').val();
		if( current_password == "" ) {
			alert("Current password required.");
			return;
		}
		if( new_password == "" ) {
			alert("New password required.");
			return;
		}
		if( confirm_password != new_password ) {
			alert("Password doesn't match.");
			return;
		}
		showSpinner();
		data = new Object();
		data.module = API_CHANGEPASSWORD;
		data.current_password = current_password;
		data.new_password = new_password;
		data.user_code = localStorage.userCode;
		getResponse(data,parseChangePassword);
	}
	var parseChangePassword = function(response) {
		if( response.status == 2 ) {
			alert("Incorrect current password");
			$('#txtCurrentPassword').focus();	
			$('#txtCurrentPassword').select();		
		}else if( response.status == 1 ) {
			$( "#popupChangePassword" ).popup("close");
			$('#txtCurrentPassword').val("");
			$('#txtNewPassword').val("");
			$('#txtConfirmPassword').val("");
			alert("Password changed");
			
		}  else {
			ajaxFailed();
		}
		hideSpinner();
	}
	/*
	*	Name	:	displayBalanceSheet
	*	Desc	:	to display balance sheet.
	*/
	var getBalanceSheet = function(level,branch) {
		console.log("Method : displayBalanceSheet");
		//var level = $("#selLevel option:selected").text();
		//var branch = $("#selBranch").val().trim();
		//var type = $("#selType").val().trim();
		data = new Object();
		data.module = API_BALANCE_SHEET;
		//data.type=type;
		data.level=level;
		if(branch != '') 
			data.branch=branch;
		getResponse(data,parseBalanceSheet);
	}
	var parseBalanceSheet = function(response) {
		if(response.status == 1) {			
			var tblBalanceSheet = $("#tblBalanceSheet");
			tblBalanceSheet.html(" ");
			$.each(response.balanceSheet,function(index,value){
				var tr = $("<tr/>");
				var td1 = $("<td/>");
				var td2 = $("<td/>");
				var td3 = $("<td/>");
				var td4 = $("<td/>");
				var td5 = $("<td/>");
					
				td1.text(value.Accode);		
				td2.text(value.DESC_ENG);	
				if(value.Accode != "Asset" && value.Accode != "Liability")	{
					var amnt = parseFloat(value.Debit).toFixed(2)+"";
					amnt = numberWithCommas(amnt)					
					td3.text(amnt);	
					amnt = parseFloat(value.Credit).toFixed(2)+"";
					amnt = numberWithCommas(amnt)					
					td4.text(amnt);					
				}
				if(td3.text() == "0.00") 
					td3.text("0");
				if(td4.text() == "0.00") 
					td4.text("0");
					
				td3.css('text-align','right');
				td4.css('text-align','right');
				
				td1.appendTo(tr);
				td2.appendTo(tr);
				td3.appendTo(tr);
				td4.appendTo(tr);
				//td5.appendTo(tr);		
				
				if(value.Accode == "Asset" || value.Accode == "Liability")
					tr.addClass("highlighted1");
				else if(value.DESC_ENG == "Asset Total" || value.DESC_ENG == "Liability Total")
					tr.addClass("highlighted2");
				else  if(value.DESC_ENG == "Profit")
					tr.addClass("profit");
				else  if( value.DESC_ENG == "Loss")
					tr.addClass("loss");
						
				tr.appendTo(tblBalanceSheet);				
			});
			changePageID("#pageBalanceSheetDetails");
			hideSpinner();
		} else {
			hideSpinner();
			showAlert("Network Error: Please try again.");
		}
	}
	
	/**
	*	Name	:	getBraches
	*	Desc	:	fetch branches
	**/
	var getBraches = function () {
		console.log("Method : getBraches");
		data = new Object();
		data.module = API_BRANCHES;
		getResponse(data,parseBranches);
	}; 
	var parseBranches = function(response) {
		if(response.status==1) {
			localStorage.branches = JSON.stringify(response.business_units);
			bindSelect(".selBranch",response.branches);
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	/******************************************************************
	*	Name	:	requestLoan
	*	Desc	:	send loand request
	**/
	var requestLoan = function () {
		var loanType = $('#selLoanTypes').val();
		var loanAmount = $('#txtLoanAmount').val();
		var monthlyDeduction = $('#txtMonthlyDeduction').val();
		var deductionStartDate = $('#txtDeductionStartDate').val();
		var remarks = $('#txtRemarks').val();
		var empCode = localStorage.userCode;
		if( loanType == '' ) {
			alert("Please enter loan type.");
			return;
		}
		if( loanAmount.trim() == '' ) {
			alert("Please enter loan amount.");
			return;
		}
		if( monthlyDeduction.trim() == '' ) {
			alert("Please enter deduction monthly amount.");
			return;
		}		
		showSpinner();
		if(deductionStartDate == "")
			deductionStartDate = getDateInFormat(new Date());
		else {
			//var dedDate = Date.parse(deductionStartDate);
			deductionStartDate = getDateInFormatFromString(deductionStartDate);
			/*alert(deductionStartDate);
			return;*/
		}	
		params = new Object();
		params.emp_code = localStorage.userCode;
		params.branch_code = localStorage.branchCode;
		params.loan_type = loanType;
		params.loan_amount = loanAmount;
		params.monthly_deduction = monthlyDeduction;
		params.remarks = remarks;
		params.deduction_start_date = deductionStartDate;
		
		data = new Object();		
		data.module = API_LOANREQUEST;
		data.data = params;
		getResponse(data,parseLoanRequest);
	}
	var parseLoanRequest = function(response) {
		if(response.status==1) {
			$( "#popupLoanReq" ).popup("close");
			 $('#selLoanTypes').blur(); 
			 $('#txtLoanAmount').blur(); 
			 $('#txtMonthlyDeduction').blur(); 
			 $('#txtDeductionStartDate').blur(); 
			 $('#txtRemarks').blur(); 
			 // $('#selLoanTypes').val(""); 
			 $('#txtLoanAmount').val(""); 
			 $('#txtMonthlyDeduction').val(""); 
			 $('#txtDeductionStartDate').val(""); 
			 $('#txtRemarks').val(""); 
			alert("Loan request has been placed.");	
			localStorage.loanRequestTime = Date.now();			
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	var getDateInFormat = function(date) {	
		var dd = date.getDate();
		var mm = date.getMonth()+1; //January is 0!		
		var yyyy = date.getFullYear();
		if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = mm+'/'+dd+'/'+yyyy;
		return today;
	}
	var getDateInFormatFromString = function(date) {	
		var s = date.split("-")
		var dd = s[2];
		var mm = s[1];
		var yyyy = s[0];
		today = mm+'/'+dd+'/'+yyyy;
		return today;
	}
	/******************************************************************
	*	Name	:	getAccReceivables
	*	Desc	:	get account receivables
	**/
	var getAccReceivables = function () {
		console.log("Method : getAccReceivables");
		showSpinner();
		if (localStorage.getItem("accReceivables") === null) {
			data = new Object();
			data.module = API_ACCRECEIVABLES;
			data.branch_filter = localStorage.branchFilter;
			getResponse(data,parseAccReceivables);
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
		title.html('Top 10 Account Receivables');
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
	*	Desc	:	get account payables
	**/
	var getAccPayables = function () {
		showSpinner();
		console.log("Method : getAccPayables");
		if (localStorage.getItem("accPayables") === null) {
			data = new Object();
			data.module = API_ACCPAYABLES;
			data.branch_filter = localStorage.branchFilter;
			getResponse(data,parseAccPayables);
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
		title.html('Top 10 Account Payables');
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
		showSpinner();
		console.log("Method : getNonSellingItems");
		if (localStorage.getItem("nonSellingItems") === null) {
			data = new Object();
			data.module = API_NONSELLING;
			data.branch_filter = localStorage.branchFilter;
			getResponse(data,parseNonSellingItems);
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
		title.html('Top 10 Non-selling items');
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
	*	Desc	:	Fetch top 10 Selling Items count from the server
	**/
	var getSellingItems = function () {
		console.log("Method : getSellingItems");
		if (localStorage.getItem("sellingItems") === null) {
			data = new Object();
			data.module = API_SELLING;
			data.branch_filter = localStorage.branchFilter;
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
		title.html('Top 10 Selling items');
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
		showSpinner();
		console.log("Method : getHRNotifications");
		if (localStorage.getItem("hrNotifications") === null) {
			data = new Object();
			data.module = API_HRNOTIFICATIONS;
			data.branch_filter = localStorage.branchFilter;
			getResponse(data,parseHRNotifications);
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
		showSpinner();
		console.log("Method : getSalarySummary");
		if (localStorage.getItem("salarySummary") === null) {
			data = new Object();
			data.module = API_SALARYSUMMARY;
			data.branch_filter = localStorage.branchFilter;
			getResponse(data,parseSalarySummary);
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
	*	Name	:	getLoanTypes
	*	Desc	:	Fetch salary summary 
	**/
	var getLoanTypes = function () {
		showSpinner();
		console.log("Method : getLoanTypes");
		if (localStorage.getItem("loanTypes") === null) {
			data = new Object();
			data.module = API_LOANTYPES;
			getResponse(data,parseLoanTypes);
		}else{
			var response = JSON.parse(localStorage.loanTypes);
			parseLoanTypes(response);	
		}
	}; 
	var parseLoanTypes = function(response) {
		if(response.status==1) {
			displayLoanTypes(response);	
			localStorage.loanTypes = JSON.stringify(response);		
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	
	var displayLoanTypes = function(response) {
		var loanTypes = response.loan_types;
		var parent = $('#selLoanTypes');
		$.each(loanTypes,function(index,val) {
			var option = $('<option/>');
			option.attr('value',val.CODE);
			option.text(val.TYPE);
			option.appendTo(parent);
		});
	}
	/**
	*	Name	:	getDashSummary
	*	Desc	:	Fetch notifications count from the server
	**/
	var getDashSummary = function () {
		console.log("Method : getDashSummary");
		if (localStorage.getItem("dashSummary") === null) {
			data = new Object();
			data.module = API_DASHSUMMARY;
			data.branch_filter = localStorage.branchFilter;
			getResponse(data,parseDashSummary);
		}else{
			var response = JSON.parse(localStorage.dashSummary);
			parseDashSummary(response);	
		}
	}; 
	var parseDashSummary = function(response) {
		if(response.status==1) {
			displayDashSummary(response,0);	
			localStorage.dashSummary = JSON.stringify(response);		
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	
	var displayDashSummary = function(response,index) {
		var parent = $('#dashSummaryParent');
		parent.html("");
		/* dummy for bugetted */
		var divW50 = $('<div/>');
		divW50.addClass('w50');			
		var divBlocks = $('<div/>');
		divBlocks.addClass('blocks');		
		var divTitle = $('<div/>');
		divTitle.addClass('title');		
		var divValue = $('<div/>');
		divValue.addClass('value');
		divValue.html('3,000');
		divTitle.html('Budgeted Sales');		
		divTitle.appendTo(divBlocks);
		divValue.appendTo(divBlocks);		
		divBlocks.appendTo(divW50);		
		divW50.appendTo(parent);
		
		var tenure = response.summary[index].values;
		changeSummaryTenure(parent,tenure);
	}
	var  changeSummaryTenure = function(parent,tenure) {
		$.each( tenure, function(index,val) {
			var divW50 = $('<div/>');
			divW50.addClass('w50');			
			var divBlocks = $('<div/>');
			divBlocks.addClass('blocks');			
			var divTitle = $('<div/>');
			divTitle.addClass('title');			
			var divValue = $('<div/>');
			divValue.addClass('value');
			divValue.html(val.value);
			divTitle.html(val.name);			
			divTitle.appendTo(divBlocks);
			divValue.appendTo(divBlocks);			
			divBlocks.appendTo(divW50);			
			divW50.appendTo(parent);			
		});	
	}
	/**
	*	Name	:	getNotificationsCount
	*	Desc	:	Fetch notifications count from the server
	**/
	var getNotificationsCount = function () {
		console.log("Method : getNotificationsCount");
		if (localStorage.getItem("notificationsCount") === null) {
			data = new Object();
			data.module = API_NOTIFICATIONSCOUNT;
			data.branch_filter = localStorage.branchFilter;
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
		var parent = $('.home-notification-count');
		parent.html("");
		var counts = response.notification_count;
		for( i = 0; i < counts.length ; i++ ) {
			/* Skip notifications with zero */
			if( counts[i].count > 0 ) {
				var div = $('<div/>');
				div.attr('data-cat',counts[i].category);
				div.attr('data-tag',counts[i].tag);
				div.html( counts[i].name + '<div class="count">'+ counts[i].count + "</div>" );
				div.addClass('dash-noti-sub-head-big');
				div.on('click',loadNotifications);				
				div.appendTo(parent);
			}
		}
		div.addClass('last');
	}
	var loadNotifications  = function(){
		showSpinner();
		var category = $(this).attr('data-cat');
		//alert(category);
		localStorage.lastClickedCategory = category;
		getNotifications(category);
	}
	/**
	*	Name	:	getNotifications
	*	Desc	:	Fetch notifications from the server
	**/
	var getNotifications = function(category) {
		console.log("Method : getNotifications");
		//var t = 'notifications_'+category;
		//localStorage.setItem(t,null);
		//alert(t);
		if (localStorage.getItem('notifications') == null) {		
			data = new Object();
			data.module = NOTIFICATIONS;
			data.branch_filter = localStorage.branchFilter;
			data.category = category;
			getResponse(data,parseNotifications);
		}else{
			//if(NOTIFICATIONS_LOADED == false) {				
				var response = JSON.parse(localStorage.notifications);
				//alert('here');	
				parseNotifications(response);	
				//alert('here');	
			//}else{
				changePageID('#pageNotifications');
				//alert('here');	
				hideSpinner();
			//}
		}
	}; 
	var parseNotifications = function(response) {			
		if( response.status == 1 ) {
			displayNotifications(response);	
			//localStorage.setItem('notifications_'+response.category, JSON.stringify(response));		
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};

	var displayNotifications = function(response){
						
		var notifications = response.notifications;
		var category = response.category;
		if(notifications.length > 0) {
			if(notifications.length == 1) {
				if(notifications[0].data == "0" )
					return true;
			}
			var parentDiv = $('#notificationsWrapper .notificationsItems');
			parentDiv.html('');
			var div1 = $("#notificationsWrapper #col1");			
			var div2 = $("#notificationsWrapper #col2");			
			//.show();
			/* display count in each module */
			if( category == 'ABSENT' ) {
				div1.html('Employee');
				div2.html('Absent Date');				
			} else if( category == 'DELIVERY' ){				
				div1.html('Supplier');
				div2.html('Doc Date');
			} else if( category == 'GLVOUCHER' ){
				div1.html('Voucher');
				div2.html('Doc Date');
			} else if( category == 'GOSI' ){
				div1.html('Employee');
				div2.html('Data');
			} else if( category == 'INCREMENT' ){
				div1.html('Employee');
				div2.html('Doc Date');
			} else if( category == 'INVOICE' ){
				div1.html('Customer');
				div2.html('Doc Date');
			} else if( category == 'IQAMA' ){
				div1.html('Employee');
				div2.html('Doc Date');
			} else if( category == 'LOAN' ){
				div1.html('Employee');
				div2.html('Doc Date');
			} else if( category == 'SHIPMENT' ){
				div1.html('Supplier');
				div2.html('Doc Date');
			} else if( category == 'VACATION' ){
				div1.html('Employee');
				div2.html('Doc Date');
			} else if( category == 'VACATION_REQUEST' ){
				div1.html('Employee');
				div2.html('Doc Date');
			} 			
			
			
			$.each(notifications, function(index,value) {
				var childDiv = $('<div/>')
						.attr('class','inner-list-item');
				var div1	 = $("<div/>")
						.attr('class','w40');
				var div2	 = $("<div/>")
						.attr('class','w60');
				if( category == 'GOSI' ) {
					div1.html(value.data);
				}else{
					div1.html(value.date);
				}	
				div1.css('text-align','right');
				if(value.name == '' || value.name == null)
					div2.html('&nbsp;');
				else
					div2.html(value.name);
				
				div2.appendTo(childDiv);
				div1.appendTo(childDiv);	
				childDiv.appendTo(parentDiv);		
			});			
		}
		else {
			var parentDiv = $('#notificationsWrapper #notificationsItems');
			$("#notificationsWrapper #col1").hide();			
			$("#notificationsWrapper #col2").hide();	
			var childDiv = $('<div/>')
				.attr('class','inner-list-item')
				.html("No items found");
		}
		changePageID('#pageNotifications');		
		//alert(localStorage.lastClickedCategory);
		$('#selNotificationCategory option[value='+localStorage.lastClickedCategory+']').attr('selected', 'selected');
		//alert($('#selNotificationCategory').val());
		$("#selNotificationCategory").selectmenu("refresh");
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
	