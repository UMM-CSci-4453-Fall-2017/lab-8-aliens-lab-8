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
  $scope.totalCost = totalCost;
  $scope.changeOne = changeOne;
  $scope.total = 0;
  $scope.truncate = truncate;
  $scope.removeItem = removeItem;

  var loading = false;

  function isLoading(){
    return loading;
  }

  function totalCost() {
    return $scope.current_list.reduce(function(sum, item) {
      return (item.quantity * item.price) + sum;
    }, 0);
  }

  function truncate() {
    if (confirm("Are you sure you want to purge the table?")) {
      buttonApi.truncate().then(function() {
        $scope.current_list = [];
      });
    }
  }

  function changeOne(item, quantity) {
    if (quantity == 0 || (item.quantity <= 0 && quantity < 0)) {
      console.log("You can't have a negative number of items, or remove zero items.");
    } else {
      buttonApi.changeOne(item.invID, quantity).success(function(res) {
        item.quantity = parseInt(item.quantity) + parseInt(res.quantity);
      });
    }
  }

  function refreshButtons(){
    loading=true;
    $scope.errorMessage='';
    buttonApi.getButtons()
    .success(function(data){
      $scope.buttons = data;
      buttonApi.getCurrent().success(function(list) {
        $scope.current_list = list;
        $scope.total = $scope.totalCost().toFixed(2);
        loading = false;
      });
    })
    .error(function () {
      $scope.errorMessage="Unable to load Buttons: Database request failed";
      alert($scope.errorMessage);
      loading=false;
    });
  }

  function removeItem(item) {
    console.log(item);
    buttonApi.removeItem(item.invID).then(function(res) {
      if (res.err) {
        console.log(res.err);
      } else {
        for (var i = 0; i < $scope.current_list.length; i++) {
          if ($scope.current_list[i].invID == item.invID) {
            $scope.current_list.splice(i, 1);
          }
        }
      }
    });
  }

  function buttonClick($event, buttonID, invID){
    $scope.errorMessage='';
    buttonApi.clickButton($event.target.id)
    .success(function(){
      buttonApi.getCurrent().success(function(data) {
        $scope.current_list = data;
        $scope.total = $scope.totalCost().toFixed(2);
      });
    })
    .error(function() {
      $scope.errorMessage="Unable to complete click";
    });
  }
  refreshButtons();

}

function buttonApi($http,apiUrl){
  return{
    getButtons: function() {
      var url = apiUrl + '/buttons';
      return $http.get(url);
    },
    clickButton: function(id) {
      var url = apiUrl+'/click?id=' + id;
      return $http.get(url);
    },
    getCurrent: function() {
      var url = apiUrl + '/current';
      return $http.get(url);
    },
    truncate: function() {
      return $http.get(apiUrl+'/truncate');
    },
    changeOne: function(id, quantity) {
      var url = apiUrl + '/changeOne/'+id+'/'+quantity;
      console.log(url);
      return $http.get(url);
    },
    removeItem: function(id) {
      var url = apiUrl + '/removeItem/'+id;
      return $http.get(url);
    }
  };
}
