/***
*	Author 			: Rahmathullah M
*	Date created	: 18/3/2013
*	Date Modified	: 18/3/2013
*	Description		: JS for moblile application for Task Force ERP
*	
*	TO DO:-	 
*			-	
*/

	/** event that fires when document is loaded & ready **/
	document.addEventListener("deviceready", onDeviceReady, false);
	//document.addEventListener("searchbutton", onSearchKeyDown, false);
	
		
	function onDeviceReady() {
		console.log("Invoked: onDeviceReady");		
		console.log("-------------------------------------------------");
		
		document.addEventListener("menubutton", onMenuKeyDown, false);
		document.addEventListener("backbutton", onBackKeyDown, false);
		
			
		bindEvents();
		
		
		
		if(!checkConnection()){
			disableLogin();
			//return;
		}else {
			enableLogin();
			if(localStorage.isLoggedIn == "true") {
				if (localStorage.getItem("userInfo") != null) {
					var userInfo = JSON.parse(localStorage.getItem("userInfo"));
					$('.menuUserName').text(userInfo.user_name);
					$('.menuLastLogin').text('Last Login : ' + userInfo.last_logged_in);
				}
				changePageID("#pageHome");								
			}else{
				showSpinner();
				getBusinessUnits();
			}
									
			/* clear history after log out */ 
			$.mobile.urlHistory.clearForward();		
			navigator.splashscreen.hide();
		}		
	}
	
	/* search button press */
   /* function onSearchKeyDown() {
        // do something
    }*/

    /* menu button press */
    function onMenuKeyDown() {
		//if($.mobile.activePage.attr("id")!= "pageLogin"){
			if ($('.menu-button').css('display') == 'none')
				$('.menu-button').show();
			else
				$('.menu-button').hide();
		//}
    }
	function onBackKeyDown() {		
		if($.mobile.activePage.attr('id') == 'pageLogin'){
			if ($.mobile.activePage.find("#popupAbout").parent().hasClass("ui-popup-active")){
			    $( "#popupAbout" ).popup("close");
			}else{
				exitApplication();	
			}
		}else{
			if ($('.menu-button').css('display') == 'none')
				history.go(-1);
			else
				$('.menu-button').hide();			
		}
	}
	
	
	/****************************************************************************************/
	
	
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
			$('#txtUserId').val('');
			$('#txtPassword').val('');
			localStorage.isLoggedIn = "true";		
			localStorage.branchFilter = response.userInfo.branch_filter;
			localStorage.branchCode = response.userInfo.branch_code+"";
			localStorage.userInfo = JSON.stringify(response.userInfo);			
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
	/* */
	
	var genDatePicker = function() {		  
		  var cd = new Date();
		 
		  var d = dateFormat(cd, "dd");
		  var y = dateFormat(cd, "yyyy");
		  localStorage.selectedDate = dateFormat(cd, "mm")+'/'+d+'/'+y;
		  $('#dStr').html(dateFormat(cd, "fullDate"));
		  $('#mon').html(dateFormat(cd, "mmm"));
		  $('#day').html(d);
		  $('#year').html(y);
		  $('#pyear').click(function () {
			  cd.setYear(cd.getFullYear() + 1);
			  updateF();
		  });
		  $('#pmon').click(function () {
			  cd.setMonth(cd.getMonth() + 1);
			  updateF();
		  });
		  $('#pday').click(function () {
			  cd.setDate(cd.getDate() + 1);
			  updateF();
		  });
		  $('#myear').click(function () {
			  cd.setYear(cd.getFullYear() - 1);
			  updateF();
		  });
		  $('#mmon').click(function () {
			  cd.setMonth(cd.getMonth() - 1);
			  updateF();
		  });
		  $('#mday').click(function () {
			  cd.setDate(cd.getDate() - 1);
			  updateF();
		  });
		  function updateF() {
			  var d = dateFormat(cd, "dd");
			  var y = dateFormat(cd, "yyyy");
			  $('#year').html(y);
			  $('#mon').html(dateFormat(cd, "mmm"));
			  $('#day').html(d);
			  $('#dStr').html(dateFormat(cd, "fullDate"));			 
			 localStorage.selectedDate = dateFormat(cd, "mm")+'/'+d+'/'+y;			
		  }
	}
	
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
		changePageID('#pageLogin');
		$.mobile.urlHistory.clearForward();
		showSpinner();
				getBusinessUnits();
		//window.location = "index.html";
	};
	var bindNotificationCategory = function() {
		var sel = $('#selNotificationCategory');		
		var response = JSON.parse(localStorage.notificationsCount);
		sel.html("");
		var option =  $("<option/>")
				.attr("value",'ALL')
				.text('All');
			option.appendTo(sel);
		if($("#selNotificationCategory option").length  <= 1 ) {
			$.each(response.notification_count, function(index,value) {
				var option =  $("<option/>")
					.attr("value",value.category)
					.text(value.name);
				option.appendTo(sel);
			});	
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
			showAlert("Current password required.");
			return;
		}
		if( new_password == "" ) {
			showAlert("New password required.");
			return;
		}
		if( confirm_password != new_password ) {
			showAlert("Password doesn't match.");
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
			showAlert("Incorrect current password");
			$('#txtCurrentPassword').focus();	
			$('#txtCurrentPassword').select();		
		}else if( response.status == 1 ) {
			$( "#popupChangePassword" ).popup("close");
			$('#txtCurrentPassword').val("");
			$('#txtNewPassword').val("");
			$('#txtConfirmPassword').val("");
			showAlert("Password changed");
			
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
		data = new Object();
		data.module = API_BALANCE_SHEET;
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
			showAlert("Select loan type.");			
			return;
		}
		if( loanAmount.trim() == '' ) {
			showAlert("Enter loan amount.");
			$('#txtLoanAmount').focus();
			return;
		}
		if( isNaN(loanAmount.trim()) ) {
			showAlert("Loan amount should be numberic.");
			$('#txtLoanAmount').focus();	
			$('#txtLoanAmount').select();
			return;
		}
		if( monthlyDeduction.trim() != ''  && isNaN(monthlyDeduction.trim()) ) {
			showAlert("Monthly deduction amount should be numberic.");
			$('#txtMonthlyDeduction').focus();	
			$('#txtMonthlyDeduction').select();
			return;
		}
		if( monthlyDeduction.trim() == '' ) {
			showAlert("Please enter deduction monthly amount.");
			return;
		}		
		showSpinner();
		if(deductionStartDate == "")
			deductionStartDate = getDateInFormat(new Date());
		
		
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
			 $('#txtDeductionStartDate').val("Deduction Start Date"); 
			 $('#txtRemarks').val(""); 
			showAlert("Loan request has been placed.");	
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
		if(accReceivables.length < 1) {			
			var parentDiv = $('#divFinance');
			parentDiv.html("");
			var childDiv = $('<div/>')
				.attr('class','inner-list-item')
				.css('text-align','center')
				.html("No entries found!");
			childDiv.appendTo(parentDiv);
		} else {
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
				divBal.html(numberWithCommas(accReceivables[i].CUSTOMER_BALANCE));
				divName.html(accReceivables[i].CUSTOMER_NAME);
				
				divName.appendTo(divItem);
				divBal.appendTo(divItem);	
				
				divItem.appendTo(parent);
			}
			divItem.addClass('last');
		}
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
		if(accPayables.length < 1) {			
			var parentDiv = $('#divFinance');
			parentDiv.html("");
			var childDiv = $('<div/>')
				.attr('class','inner-list-item')
				.css('text-align','center')
				.html("No entries found!");
			childDiv.appendTo(parentDiv);
		} else {
			var parent = $('#divFinance');
			parent.html("");
			var title = $('#pageFinance .pageTitle');
			title.html('Top 10 Account Payables');
			var head1 = $('#pageFinance .head1');
			var head2 = $('#pageFinance .head2');
			head1.html('Supplier');
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
				
				divBal.html(numberWithCommas(accPayables[i].SUPPLIER_BALANCE));
				divName.html(accPayables[i].SUPPLIER_NAME);
				
				divName.appendTo(divItem);
				divBal.appendTo(divItem);	
				
				divItem.appendTo(parent);
			}
			divItem.addClass('last');
		}
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
		if(nonSellingItems.length < 1) {			
			var parentDiv = $('#divSalesItems');
			parentDiv.html("");
			var childDiv = $('<div/>')
				.attr('class','inner-list-item')
				.css('text-align','center')
				.html("No entries found!");
			childDiv.appendTo(parentDiv);
		} else {
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
		}
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
			getResponse(data,parseSellingItems);
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
		if(sellingItems.length < 1) {			
			var parentDiv = $('#divSalesItems');
			parentDiv.html("");
			var childDiv = $('<div/>')
				.attr('class','inner-list-item')
				.css('text-align','center')
				.html("No entries found!");
			childDiv.appendTo(parentDiv);
		} else {
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
							
				divQty.html(numberWithCommas(sellingItems[i].QTY));
				divName.html(sellingItems[i].ITEM_NAME);
				
				divName.appendTo(divItem);
				divQty.appendTo(divItem);	
				
				divItem.appendTo(parent);
			}
			divItem.addClass('last');
		}
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
		if(hrNotifications.length < 1) {			
			var parentDiv = $('#divHRNotifications');
			parentDiv.html("");
			var childDiv = $('<div/>')
				.attr('class','inner-list-item')
				.css('text-align','center')
				.html("No entries found!");
			childDiv.appendTo(parentDiv);
		} else {
			var parent = $('#divHRNotifications');
			parent.html(" ");
			for( i = 0 ; i < hrNotifications.length ; i++ ) {
				var divName = $('<div/>');
				var divDate = $('<div/>');
				var divItem = $('<div/>');
				
				divItem.addClass('inner-list-item');
				divName.addClass('w50');
				divDate.addClass('w50');
				divDate.html(hrNotifications[i].EMP_NAME);
				divName.html(hrNotifications[i].DATE);
				
				divDate.appendTo(divItem);	
				divName.appendTo(divItem);
				
				divItem.appendTo(parent);
			}
			divItem.addClass('last');
		}
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
		if(salarySummary.length < 1) {			
			var parentDiv = $('#divSalarySummary');
			parentDiv.html("");
			var childDiv = $('<div/>')
				.attr('class','inner-list-item')
				.css('text-align','center')
				.html("No entries found!");
			childDiv.appendTo(parentDiv);
		} else {
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
		}
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
	* get the total number of notifications
	*/
	var getNotiTotalCount = function() {
		console.log("Method : getNotiTotalCount");
		if (localStorage.getItem("notiTotalCount") === null) {
			data = new Object();
			data.module = API_TOTALNOTIFICATIONCOUNT;
			data.branch_filter = localStorage.branchFilter;
			getResponse(data,parseNotiTotalCount);
		}else{
			var response = JSON.parse(localStorage.notiTotalCount);
			parseNotiTotalCount(response);	
		}
	}; 
	var parseNotiTotalCount = function(response) {
		if(response.status==1) {
			if(parseInt(response.total_notifications) != 0 ) {
				$('#dashNotiCount').show();
				$('#dashNotiCount').html(response.total_notifications);
			}else{
				$('#dashNotiCount').html('0');
				$('#dashNotiCount').hide();
			}
						
			localStorage.notiTotalCount = JSON.stringify(response);		
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
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
			localStorage.notificationsCount = JSON.stringify(response);
			displayNotificationsCount(response);	
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};
	
	var displayNotificationsCount = function(response) {
		$('#notificationsWrapper .inner-list-item').hide();	
		var parent = $('.notificationsItems');
		parent.html("");
		var counts = response.notification_count;
		
		for( i = 0; i < counts.length ; i++ ) {
			/* Skip notifications with zero */
			if( counts[i].count > 0 ) {
				var div = $('<div/>');
				div.attr('data-cat',counts[i].category);
				//div.attr('data-tag',counts[i].tag);
				div.html( counts[i].name + '<div class="count">'+ counts[i].count + "</div>" );
				div.addClass('inner-list-item');
				div.on('click',loadNotifications);
				div.appendTo(parent);
			}
		}
		changePageID('#pageNotifications');
		var el = $('#selNotificationCategory');		
		// Select the relevant option, de-select any others
		el.val('ALL').attr('selected', true).siblings('option').removeAttr('selected');		
		// jQM refresh
		el.selectmenu("refresh", true);		
	}
	var loadNotifications = function() {
		showSpinner();
		var category = $(this).attr('data-cat');
		getNotifications(category);
	}
	/**
	*	Name	:	getNotifications
	*	Desc	:	Fetch notifications from the server
	**/
	var getNotifications = function(category) {
		console.log("Method : getNotifications");
		if (localStorage.getItem('notifications') == null) {		
			data = new Object();
			data.module = NOTIFICATIONS;
			data.branch_filter = localStorage.branchFilter;
			data.category = category;
			getResponse(data,parseNotifications);
		}else{				
				var response = JSON.parse(localStorage.notifications);
				parseNotifications(response);	
				changePageID('#pageNotifications');
				hideSpinner();
		}
	}; 
	var parseNotifications = function(response) {			
		if( response.status == 1 ) {
			displayNotifications(response);			
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};

	var displayNotifications = function(response){
		$('#notificationsWrapper .inner-list-item').show();		
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
			div1.show();			
			div2.show();				
			/* display count in each module */			
			if( category == 'ABSENT' ) {
				div1.html('Employee');
				div2.html('Doc Date');				
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
			var parentDiv = $('#notificationsWrapper .notificationsItems');
			parentDiv.html("");
			$("#notificationsWrapper #col1").hide();			
			$("#notificationsWrapper #col2").hide();	
			var childDiv = $('<div/>')
				.attr('class','inner-list-item')
				.css('text-align','center')
				.html("No items found!");
			childDiv.appendTo(parentDiv);
		}
		changePageID('#pageNotifications');
		var el = $('#selNotificationCategory');		
		// Select the relevant option, de-select any others
		el.val(category).attr('selected', true).siblings('option').removeAttr('selected');		
		// jQM refresh
		el.selectmenu("refresh", true);
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
	 
	/**
	*	Name	:	getProfileInfo
	*	Desc	:	get profile information for profile page
	**/
	var getProfileInfo = function () {
		console.log("Method : getProfileInfo");
		if (localStorage.getItem("profileInfo") === null) {
			data = new Object();
			data.module = API_PROFILEINFO;
			var userInfo = JSON.parse(localStorage.userInfo);
			data.emp_code = userInfo.emp_code;
			getResponse(data,parseProfileInfo);
		}else{
			var response = JSON.parse(localStorage.profileInfo);
			parseProfileInfo(response);	
		}
	}; 
	var parseProfileInfo = function(response) {
		if(response.status==1 ) {
			displayProfileInfo(response);	
			localStorage.profileInfo = JSON.stringify(response);		
		} else {
			ajaxFailed();
			hideSpinner();
		}
		
	};
	
	var displayProfileInfo = function(response) {
		$('#profileInfoFullName').html(response.profile.FIRST_NAME + ' ' + response.profile.MIDDLE_NAME);
		$('#profileInfoSex').html(response.profile.SEX);
		$('#profileInfoStatus').html(response.profile.DOJ_GRI.date);
		$('#profileInfoReligion').html(response.profile.RELIGION);
		$('#profileInfoMarital').html(response.profile.MARITAL_STATUS);
		
		$('#profileInfoEmail').html(response.profile.EMAIL);
		$('#profileInfoTele').html(response.profile.TELEPHONE_NO);
		$('#profileInfoMobileNo').html(response.profile.MOBILE_NO);
		
		$('#profileInfoJobTitle').html(response.profile.JOB_TITLE);
		$('#profileInfoDept').html(response.profile.DEPARTMENT);
		$('#profileInfoDiv').html(response.profile.DIVISION);
		$('#profileInfoWorkArea').html(response.profile.WORK_AREA);
		$('#profileInfoPosition').html(response.profile.POSITION);
		
		$('#profileInfoBasic').html(response.profile.BASIC);
		$('#profileInfoHousing').html(response.profile.HOUSING);
		$('#profileInfoTrans').html(response.profile.TRANSPORTATION);
		$('#profileInfoMobile').html(response.profile.MOBILE);
		$('#profileInfoFood').html(response.profile.FOOD);
		$('#profileInfoOther1').html(response.profile.OTHER1);
		$('#profileInfoOther2').html(response.profile.OTHER2);
		
		var userInfo = JSON.parse(localStorage.userInfo);
		$('#userInfoPic').attr('src', API + 'getPic.php?emp_code='+userInfo.emp_code);
		
		changePageID('#pageProfile');
		hideSpinner();	
	}
	