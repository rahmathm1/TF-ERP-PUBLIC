/***
*	Author 			: Rahmathullah M
*	Date created	: 18/3/2013
*	Date Modified	: 18/3/2013
*	Description		: JS for moblile application for Task Force ERP
*	
*	TO DO:-	 
*			-	
*/

	var BALANCE_SHEET = "BALANCE_SHEET";
	var ACC_LEVELS 	= "ACC_LEVELS";
	var BRANCHES = "BRANCHES";
	
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
		getBraches();
		bindEvents();
	}
	
	/* search button press */
    function onSearchKeyDown() {
        // do something
    }
	$("#pageBalanceSheet").on("pageinit",function(event){
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
		history.go(-1);
    }
	
	
	/*************************************************************
	*			EVENTS	
	**************************************************************/	
	var bindEvents = function() {
		
		/* Page : Balance Sheet Home */
		$("#btnDisplay").on("click",getBalanceSheet);

		$(function(){
			$("input[name=datePicker]").mobiscroll().date({
				theme: 'android-ics',
				display: 'top',
				mode: 'scroller'
			}); 
		});
		
		$(".radio-tab").on("click",toggleTabs);
		
		$(".menuLogout").on('click', function(e, ui){  
			console.log("clicked menu>logout");
			showSpinner();
			logout();
		});
		$(".menuExit").on('click', exitApplication);
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
	*	Name	:	getBalanceSheet
	*	Desc	:	to display balance sheet.
	*/
	var getBalanceSheet = function() {
		showSpinner();
		console.log("Method : getBalanceSheet");
		var level = $("#selLevel option:selected").text();
		var branch = $("#selBranch").val().trim();
		var type = $("#selType").val().trim();
		data = new Object();
		data.module = BALANCE_SHEET;
		data.type=type;
		data.level=level;
		if(branch != "NULL") 
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
			localStorage.branches = JSON.stringify(response.business_units);
			bindSelect("#selBranch",response.branches);
		} else {
			ajaxFailed();
		}
		hideSpinner();
	};