/***
*	Author 			: Rahmathullah M
*	Date created	: 4 Feb, 2013
*	Date Modified	: 20/2/2013
*	Description		: JS for moblile application for Task Force ERP
*	
*	TO DO:-	 
*			-	
*/

	document.addEventListener("deviceready", onDeviceReady, false);
	
	function onDeviceReady() {
		console.log("onDeviceReady");
	}
	
	/**
	*	Name	:	checkConnection
	*	Desc	:	Check network connectivity
	**/
	var checkConnection = function () {
		var networkState = navigator.network.connection.type;	
		console.log("Connection type:  " +navigator.network.connection.type);		
		if(networkState == Connection.NONE) {
			navigator.notification.alert("Please check network connection.", exitApplication, "Task Force ERP","OK");					
		}
		
	};