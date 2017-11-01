angular.module('buttons',[])
.controller('buttonCtrl',ButtonCtrl)
.factory('buttonApi',buttonApi)
.constant('apiUrl','http://localhost:1337'); // CHANGED for the lab 2017!

function ButtonCtrl($scope,buttonApi){
  $scope.buttons = []; //Initially all was still
  $scope.current_list = [];
  $scope.errorMessage = '';
  $scope.isLoading = isLoading;
  $scope.refreshButtons = refreshButtons;
  $scope.buttonClick = buttonClick;

  var loading = false;

  function isLoading(){
    return loading;
  }

  function totalCost() {
    return $scope.current_list.reduce(function(sum, item) {
      return (item.quantity * item.price) + sum;
    }, 0);
  }

  function refreshButtons(){
    loading=true;
    $scope.errorMessage='';
    buttonApi.getButtons()
    .success(function(data){
      $scope.buttons=data;
      loading=false;
    })
    .error(function () {
      $scope.errorMessage="Unable to load Buttons:  Database request failed";
      loading=false;
    });
  }
  function buttonClick($event, buttonID, invID){
    console.log("Inventory ID for button: " + invID);
    $scope.errorMessage='';
    buttonApi.clickButton($event.target.id)
    .success(function(){
      buttonApi.getCurrent().success(function(data) {
        $scope.current_list = data;
        console.log("Got a list of the current transaction:");
        console.log(data);
      });
    })
    .error(function(){$scope.errorMessage="Unable to complete click";});
  }
  refreshButtons();  //make sure the buttons are loaded

}

function buttonApi($http,apiUrl){
  return{
    getButtons: function(){
      var url = apiUrl + '/buttons';
      return $http.get(url);
    },
    clickButton: function(id){
      var url = apiUrl+'/click?id='+id;
      //      console.log("Attempting with "+url);
      return $http.get(url); // Easy enough to do this way
    },
    getCurrent: function() {
      var url = apiUrl + '/current';
      return $http.get(url);
    }
  };
}
