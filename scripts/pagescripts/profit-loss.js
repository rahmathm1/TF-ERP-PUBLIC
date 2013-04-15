/***
*	Author 			: Rahmathullah M
*	Date created	: 18/3/2013
*	Date Modified	: 18/3/2013
*	Description		: JS for moblile application for Task Force ERP
*	
*	TO DO:-	 
*			-	
*/
	var ALERT_TITLE	 =	"Taskforces ERP";
	//var API			= 	"http://192.168.1.188/taskforces/api/";
	//var API			 = 	"http://192.168.1.155:88/taskforces/api/";
	var API			= 	"http://192.168.31.17/taskforces/api/";
	
	var BALANCE_SHEET	 = "BALANCE_SHEET";
	var ACC_LEVELS		= "ACC_LEVELS";
	var BRANCHES		  = "BRANCHES";
	var BUSINESS_UNITS	= "BUSINESS_UNITS";
	var COST_CENTERS	= "COST_CENTERS";
	var PROFIT_LOSS	= "PROFIT_LOSS";
	
	var dateToDate = true;
	//var 

	/** event that fires when document is loaded & ready **/
	document.addEventListener("deviceready", onDeviceReady, false);
		
	function onDeviceReady() {
		console.log("Invoked: onDeviceReady");
		
		
		//document.addEventListener("backbutton", onBackKeyDown, false);
		showSpinner();
		document.addEventListener("searchbutton", onSearchKeyDown, false);
        document.addEventListener("menubutton", onMenuKeyDown, false);
		getAccLevels();
		getCostCenters();
		getBraches();
		getBusinessUnits();
		bindEvents();
	}
	
	/* search button press */
    function onSearchKeyDown() {
        // do something
    }
	$("#pageProfitLossDetails").on("pageinit",function(event){
			console.log("pageinit : pageIncHome");			
	});
    /* menu button press */
    function onMenuKeyDown() {
		if ($('.menu-button').css('display') == 'none')
			$('.menu-button').fadeIn();
		else
			$('.menu-button').fadeOut();
    }
	/* back button press */
    function onBackKeyDown() {
		//history.go(-1);
		if ($('.menu-button').css('display') == 'none'){			
			console.log("hidden, goin back");
			history.go(-1);
		}
		else {
			console.log("visible, hiding");
			$('.menu-button').fadeOut();
		}
    }
	
	
	/*************************************************************
	*			EVENTS	
	**************************************************************/	
	var bindEvents = function() {
		
		/* Page : Balance Sheet Home */
		$("#btnDisplay").on("click",displayProfitLoss);

		$(function(){
			$("input[name=datePicker]").mobiscroll().date({
				theme: 'android-ics',
				display: 'top',
				mode: 'scroller'
			}); 
		});
		
		$(".radio-tab").on("click",toggleTabs);
		
		$("#selDisplayBy").change(function(){
			if( $(this).val() == "BRANCH" ){
				$("#selDisplayCriteriaWrapper").show();
				bindSelect("#selDisplayCriteria",JSON.parse(localStorage.branches ));
			}else if( $(this).val() == "BUSINESS_UNIT" ){
				$("#selDisplayCriteriaWrapper").show();
				bindSelect("#selDisplayCriteria",JSON.parse(localStorage.businessUnits ));
			}else if( $(this).val() == "ALL" ){
				$("#selDisplayCriteriaWrapper").hide();
			} 
		});
		
		$("#chkCostCenter").change(function(){
			if($('#chkCostCenter').is(':checked') == true)
			 	$("#selCostCentersWrapper").show();
			else
				$("#selCostCentersWrapper").hide();
			
		});
		
		$("#menuLogout").on('click', function(e, ui){  
			console.log("clicked menu>logout");
			showSpinner();
			logout();
		});
		$("#menuExit").on('click', exitApplication);
		
	};
	
	var toggleTabs = function() {
		$(".radio-tab").removeClass("active");
		$(this).addClass("active");
		
		$(".radio-tab-content").hide();
		var id = $(this).attr("tab");
		$(id).show();
		
		if(dateToDate==true)
			dateToDate = false;
		else
			dateToDate = true;
	}
	/*
	*	Name	:	displayBalanceSheet
	*	Desc	:	to display balance sheet.
	*/
	var displayProfitLoss = function() {
		showSpinner();
		console.log("Method : displayProfitLoss");
		var level = $("#selLevel option:selected").text();
		var displayCriteria = $("#selDisplayCriteria").val().trim();
		var type = $("#selType").val().trim();
		var costCenter = $("#selCostCenters").val().trim();
		var displayBy = $("#selDisplayBy").val().trim();
		
		var withOutZero = $('#chkWithOutZero').is(':checked') + "";
		
		data = new Object();
		data.module = PROFIT_LOSS;
		data.type = type;
		data.level = level;
		
		data.withOutZero = withOutZero;
		if(displayBy != "ALL")
			if(displayCriteria != "NULL") {
				data.displayCriteria = displayCriteria;
				data.displayBy = displayBy;
			}
		getResponse(data,parseProfitLoss);
	}
	var parseProfitLoss = function(response) {
		if(response.status == 1) {			
			var tblProfitLoss = $("#tblProfitLoss");
			tblProfitLoss.html("");
			console.log("here 1");
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
					td3.text(parseFloat(value.Debit).toFixed(2));	
					td4.text(parseFloat(value.Credit).toFixed(2));	
				}
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
			bindSelect("#selLevel",response.accLevels);
		} else {
			ajaxFailed();
		}		
	};
	
	/**
	*	Name	:	getBraches
	*	Desc	:	fetch branches
	**/
	var getBraches = function () {
		console.log("Method : getBraches");
		data = new Object();
		data.module = BRANCHES;
		getResponse(data,parseBranches);
	}; 
	var parseBranches = function(response) {
		if(response.status==1) {
			localStorage.branches = JSON.stringify(response.branches);
			bindSelect("#selDisplayCriteria",response.branches);
		} else {
			ajaxFailed();
		}
	};
	/**
	*	Name	:	getCostCenters
	*	Desc	:	fetch branches
	**/
	var getCostCenters = function () {
		console.log("Method : getBraches");
		data = new Object();
		data.module = COST_CENTERS;
		getResponse(data,parseCostCenters);
	}; 
	var parseCostCenters = function(response) {
		if(response.status==1) {
			localStorage.costCenters = JSON.stringify(response.costCenters);
			bindSelect("#selCostCenters",response.costCenters);
		} else {
			ajaxFailed();
		}
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
			localStorage.businessUnits = JSON.stringify(response.businessUnits);
			//bindSelect("#selDisplayCriteria",response.businessUnits);
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};