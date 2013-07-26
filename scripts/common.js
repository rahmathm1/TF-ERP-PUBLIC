// JavaScript Document

	var ALERT_TITLE	=	"Taskforces ERP";
	//var API			= 	"http://192.168.2.29:88/taskforces/api/";
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
	/*var changePage = function(pageId) { 
		//$.mobile.changePage(pageId,{transition: "fade"});
		showSpinner();
		window.location = pageId;
	}*/
	/* change Page */
	var changePageID = function(pageId) { 
		//showSpinner();
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
	/*function showConfirm(question,onConfirm) {
		navigator.notification.confirm(
			question,
			onConfirm,             
			ALERT_TITLE,     
			"Yes,No"         
		);
	}*/
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
	/*var getResponseV2 = function(data,parser) {
		console.log("Method : getResponse");
		console.log("DATA : " + JSON.stringify(data));
		$.ajax({
            beforeSend: function() { $.mobile.showPageLoadingMsg(); }, //Show spinner
            complete: function() { $.mobile.hidePageLoadingMsg() }, //Hide spinner
            url: API,
            dataType: 'json',
            data:  data
        })
		.done(function(response){ 
					console.log(JSON.stringify(response));
					parser(response);					
				})
		.fail(ajaxFailed)
		.always(function(){});
	}*/
	var ajaxFailed = function(res) {		
		console.error("Network error. Please try again. Result : "+JSON.stringify(res));
		showAlert("Network error, please try again.");
		hideSpinner();
	}
	function numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
		/* bind drop down */
	var bindSelect = function(selectId,data) {
		var sel = $(selectId);	
		//alert($('select'+selectId+' option').length);
		//;
		if($(selectId +" option").length  <= 1 ) {
			//sel.html("");	
			$.each(data, function(index,value) {
				var option =  $("<option/>")
					.attr("value",value.id)
					.text(value.text);
				option.appendTo(sel);
			});	
			sel.selectmenu("refresh");
		}else{
			console.log('select, ' + selectId + ' already generated');
		}
	};
	
	
	
	
	/****************************************************************************************
	*						EVENTS	
	*****************************************************************************************/	
	var bindEvents = function() {
		/* button login click */
		
		
		$("#btnLogin").on("click",login);
	
		$("#btnRetry").on("click",function() {
			console.log("Retrying");
			showSpinner();
			getBusinessUnits();
		});
		$("#selLoginBUnit").on("focus",function() {
			console.log("Checking select business units length");
			if($("#selLoginBUnit option").length  <= 1 ) {
				console.log("Loading business units");
				showSpinner();
				getBusinessUnits();
			}
		});
		
		$("#aboutTaskforces").on("click",function() {						
			$( "#popupAbout" ).popup("open");
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
			getNotiTotalCount();
		});		
		$("#pageHome").on('pagecreate', function(e, ui){
			$("#homeIconProfile").on("click",function() {
					showSpinner();
					getProfileInfo();
					//changePageID('#pageProfile');		
			}); 			
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
			
			$("#tabs li").click(function() {
				//	First remove class "active" from currently active tab
				$("#tabs li").removeClass('active');
		
				//	Now add class "active" to the selected/clicked tab
				$(this).addClass("active");
		
				//	Hide all tab content
				$(".tab_content").hide();
		
				//	Here we get the href value of the selected tab
				var selected_tab = $(this).find("a").attr("href");
		
				//	Show the selected tab content
				$(selected_tab).show();
		
				//	At the end, we add return false so that the click on the link is not executed
				return false;
			});		
		});
		
		$("#pageNotifications").on('pagecreate', function(e, ui){
			$("#selNotificationCategory").on("change",function() {
				showSpinner();
				var category = $('#selNotificationCategory').val();
				if(category == 'ALL') {
					showSpinner();
					$('#notificationsWrapper .inner-list-item').hide();
					getNotificationsCount();
				}else{
					localStorage.lastClickedCategory = category;
					getNotifications(category);
				}
			});
			bindNotificationCategory();			
		});
		
		
		/*$("#pageLogin").on('pagecreate', function(e, ui){  
			alert();
		});*/
		
		
		$(".log-out").on('click', function(){  
			console.log("clicked menu>logout");
			showSpinner();
			logout();
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
			}	
			$('#myDatePicker').hide();
			$( "#popupLoanReq" ).popup("close");						
		});
		$("#pageServiceRequest").on("pagecreate",function(event){		
			genDatePicker();	
			$("#txtDeductionStartDate").on("click",function(){
				$( "#popupLoanReq" ).popup("close");				
				$('#myDatePicker').show();
			});
			$("#btnDateSet").on("click",function(){	
			$( "#popupLoanReq" ).popup("open");
				var cd = localStorage.selectedDate;
				var cdd = Date.parse(cd);
				var today = new Date();
				if(cdd < today ) {
					showAlert('Select a date after today');
					$("#btnDateSet").focus();
				}
				else {
					$("#txtDeductionStartDate").val(cd);							
					$('#myDatePicker').hide();
				}
			});
			$("#btnDateClear").on("click",function(){
				$( "#popupLoanReq" ).popup("open");				
				//$("#txtDeductionStartDate").val('');
				$('#myDatePicker').hide();
				$("#txtDeductionStartDate").blur();
				
			});			
		});
		/* TO HIDE MENU BUTTON LOGGED IN AS */		
		$(document).on('pagebeforechange', function(e, data){  
			$('.menu-button').hide();
		});		
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
		$("#homeIconNotifications").on("click",function() {
			showSpinner();
			//localStorage.lastClickedCategory = 'ALL';
			//getNotifications('ALL');
			getNotificationsCount();
		});		
		
		
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
			//localStorage.lastClickedCategory = 'ALL';
			getNotificationsCount();
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
		
		$(".sideMenuSales").on("click",function() {
			showSpinner();
			getSellingItems();
		});
		$(".sideMenuFinance").on("click",function() {
			showSpinner();
			getAccReceivables();
		});
		
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
				
	}
	
	
