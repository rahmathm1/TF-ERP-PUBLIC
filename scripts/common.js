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
	var changePage = function(pageId) { 
		//$.mobile.changePage(pageId,{transition: "fade"});
		showSpinner();
		window.location = pageId;
	}
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
	var getResponseV2 = function(data,parser) {
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
	}
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
		if($("selectId option").length  <= 1 ) {
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
	
	
