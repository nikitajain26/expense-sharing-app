module.exports = function (UserExpenseGroupDetails) {

    //API to add the share of each user towards an expense added for a group of users. 
    /*UserShareAmount is calculated on the basis of SplitPercentage added by the user who is adding the expense.*/
    UserExpenseGroupDetails.addUserExpenseGroupDetails = function (data, cb) {
      if (!data.UserExpenseGroupID && !data.SplitPercentage && !data.SourceUserID && !data.DestinationUserID && !data.TotalAmount) {
        return cb(null, {
          success: false,
          msg: 'Please enter all mandatory fields',
          data: {}
        });
      } else {
        var requestObj = {
          UserExpenseGroupID: data.UserExpenseGroupID,
          SplitPercentage: data.SplitPercentage,
          SourceUserID: data.SourceUserID,
          DestinationUserID: data.DestinationUserID
        };
        requestObj.UserShareAmount = data.TotalAmount * (data.SplitPercentage / 100);
        UserExpenseGroupDetails.create(requestObj, function (error, result) {
          if (error) {
            return cb(null, {
              success: false,
              msg: 'Please try again later',
              data: {}
            });
          } else {
            return cb(null, {
              success: true,
              msg: 'Details added',
              data: {}
            });
          }
        });
      }
    };

    
    UserExpenseGroupDetails.updateUserExpenseGroupDetails = function (data, cb) {
      if ((!data.UserExpenseGroupDetailsID || !data.UserExpenseGroupID) && !data.UpdateObject) {
        return cb(null, {
          success: false,
          msg: 'Please enter all mandatory fields',
          data: {}
        });
      } else {
        var whereFilter = {};
        if (data.UserExpenseGroupDetailsID) {
          whereFilter.UserExpenseGroupDetailsID = data.UserExpenseGroupDetailsID;
        }
        else if (data.UserExpenseGroupID) {
          whereFilter.UserExpenseGroupID = data.UserExpenseGroupID;
        }
        UserExpenseGroupDetails.find({
          where: whereFilter,
          Active: 1
        })
        .then(function (detailsResult) {
          if (detailsResult && detailsResult.length) {
            _.forEach(detailsResult, function (eachObj) {
              eachObj.updateAttributes(data.UpdateObject);
            });
            return cb(null, {
              success: true,
              msg: 'User Expense Group Details updated',
              data: {}
            });
          } else {
            return cb(null, {
              success: false,
              msg: 'No such expense found',
              data: {}
            });
          }
        })
        .catch(function(error) {
          return cb(null, {
            success: false,
            msg: 'Please try later',
            data: {}
          });
        });
      }
    };

    //API to show the total money to be received and total money to be paid by the person.
    //API to see users summary of money he owes to his friends. -- can be handled by sending getMoneyToBeReceived = false in the same API
    UserExpenseGroupDetails.getUserExpenseHistory = function (data, cb) {
      if (!data.UserID) {
        return cb(null, {
          success: false,
          msg: 'Please try later',
          data: {}
        });
      } else {
        async.auto({
          getMoneyOwed: function (callback) {
            UserExpenseGroup.find({
              where: {
                SourceUserID : data.UserID,
                Active: 1
              }
            })
            .then(function (owedResult) {
              if (owedResult && owedResult.length) {
                var totalSum = _.sum(owedResult, 'UserShareAmount');
                return callback(null, {
                  UserOwedMoney: totalSum
                });
              } else {
                return callback(null, {
                  UserOwedMoney: 0
                });
              }
            })
            .catch(function (error) {
              return callback({
                success: false,
                msg: 'Please try later',
                data: {}
              });
            });
          },
          getMoneyToBeReceived: function (callback) {
            if (data.getMoneyToBeReceived) {
              UserExpenseGroup.find({
                where: {
                  DestinationUserID: data.UserID,
                  Active: 1
                }
              })
              .then(function (moneyResult) {
                if (moneyResult && moneyResult.length) {
                  var totalSum = _.sum(moneyResult, 'UserShareAmount');
                  return callback(null, {
                    MoneyToBeReceived: totalSum
                  });
                } else {
                  return callback(null, {
                    MoneyToBeReceived: 0
                  });
                }
              })
              .catch(function (error) {
                return callback({
                  success: false,
                  msg: 'Please try later',
                  data: {}
                });
              });
            } else {
              return callback(null);
            }
          }
        }, function (error, autoResult) {
          if (error) {
            return cb(null, error);
          } else {
            return cb(null, {
              success: true,
              msg: 'Expense history fetched',
              data: {
                MoneyToBeReceived: autoResult.getMoneyToBeReceived ? autoResult.getMoneyToBeReceived.MoneyToBeReceived : null,
                UserOwedMoney: autoResult.getMoneyOwed.UserOwedMoney,
                UserID: data.UserID
              }
            });
          }
        });
      }
    };

    UserExpenseGroupDetails.remoteMethod(
      'addUserExpenseGroupDetails', {
      description: 'addUserExpenseGroupDetails',
      accepts: {
        arg: 'data',
        type: 'object',
        default: '{}',
        required: true,
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'result',
        type: 'object',
        root: true,
        description: '{success: true, msg: "message", data: result}'
      },
      http: {
        verb: 'post'
      }
    });

    UserExpenseGroupDetails.remoteMethod(
      'updateUserExpenseGroupDetails', {
      description: 'updateUserExpenseGroupDetails',
      accepts: {
        arg: 'data',
        type: 'object',
        default: '{}',
        required: true,
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'result',
        type: 'object',
        root: true,
        description: '{success: true, msg: "message", data: result}'
      },
      http: {
        verb: 'post'
      }
    });

    UserExpenseGroupDetails.remoteMethod(
      'getUserExpenseHistory', {
      description: 'getUserExpenseHistory',
      accepts: {
        arg: 'data',
        type: 'object',
        default: '{}',
        required: true,
        http: {
          source: 'body'
        }
      },
      returns: {
        arg: 'result',
        type: 'object',
        root: true,
        description: '{success: true, msg: "message", data: result}'
      },
      http: {
        verb: 'post'
      }
    });
    
};