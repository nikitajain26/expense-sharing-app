var moment = require('moment');
var async = require('async');

module.exports = function (UserExpenseGroup) {

  //API to add expense for a group by a user.
  /* This will first add the total expense for a group and will 
  then add the total amount to the existing AmountSpent of the User who adds the expenditure on his/her name. */
  UserExpenseGroup.addUserExpenseGroup = function (data, cb) {
    if (!data.SpentByUserID && !data.GroupAmount && !data.ExpenseDescription) {
      return cb(null, {
        success: false,
        msg: 'Please enter all mandatory details',
        data: {}
      });
    } else {
      async.auto({
        addUserExpenseGroup: function (callback) {
          var requestObject = {
            GroupID: data.GroupID,
            SpentByUserID: data.SpentByUserID,
            GroupAmount: data.GroupAmount,
            ExpenseDescription: data.ExpenseDescription
          };
          UserExpenseGroup.create(requestObject, function (error, createResult) {
            if (error) {
              return callback({
                success: false,
                msg: 'Something went wrong',
                data: {}
              });
            } else {
              return callback(null, createResult);
            }
          });
        },
        updateIndividulaUserExpense: ['addUserExpenseGroup', function (callback, result) {
          var currentMonth = moment().format('YYYY-MM');
          var requestObj = {
            UserID: data.SpentByUserID,
            ExpenseMonthYear: currentMonth,
            UpdateObject: {
              AmountSpent: data.GroupAmount,
              SettlementStatus: 0
            }
          };
          UserExpenseGroup.app.models.UserExpense.createOrUpdateUserExpense(requestObj, function(error, result) {
            if (error) {
              return callback({
                success: false,
                msg: 'Please try again later',
                data: {}
              });
            } else {
              return callback(null, result.addUserExpenseGroup);
            }
          });
        }]
      }, function(error, autoResult) {
        if (error) {
          return cb(null, error);
        } else {
          return cb(null, autoResult.updateIndividulaUserExpense);
        }
      });
    }
  };

  /*API to return outstanding and unsettled Total expenditure done by a particular User 
  against all groups the user is associated to.*/
  UserExpenseGroup.getUserExpenseGroup = function (data, cb) {
    UserExpenseGroup.find({
      where: {
        SpentByUserID: data.UserID,
        Active: 1
      }
    })
    .then(function (expenseDetails) {
      if (expenseDetails && expenseDetails.length) {
        var totalExpenditure = _.sum(expenseDetails, 'GroupAmount');
        var userExpenditure = {
          EachExpenseDetail: expenseDetails,
          TotalExpenditure: totalExpenditure
        };
        return cb(null, {
          success: true,
          msg: 'User expenses found',
          data: userExpenditure 
        });
      } else {
        return cb(null, {
          success: false,
          msg: 'No such user found',
          data: {}
        });
      }
    })
    .catch(function(error) {
      return cb(null, {
        success: false,
        msg: 'Please try again later',
        data: {}
      });
    });
  };
  
  //API to update the details of an expense added by an user.
  UserExpenseGroup.updateUserExpenseGroup = function (data, cb) {
    if (!data.UserExpenseGroupID && !data.UpdateObject) {
      return cb(null, {
        success: false,
        msg: 'Please enter all mandatory details',
        data: {}
      });
    } else {
      UserExpenseGroup.findByID(data.UserExpenseGroupID)
      .then(function (result) {
        if (result) {
          result.updateAttributes(data.UpdateObject, function (error, updateResult) {
            if (error) {
              return cb(null, {
                success: false,
                msg: 'Please try again later',
                data: {}
              });
            } else {
              return cb(null, {
                success: true,
                msg: 'Expense updated',
                data: updateResult
              });
            }
          });
        } else {
          return cb(null, {
            success: false,
            msg: 'Details not found',
            data: {}
          });
        }
      })
      .catch(function (error) {
        return cb(null, {
          success: false,
          msg: 'Please try again later',
          data: {}
        });
      });
    }
  };

  //API to add an expense. 
  /*This will first add the expense of the group and 
  then will subsequently divide the expense according to the given ratio among each group member*/
  UserExpenseGroup.addGroupExpense = function (data, cb) {
    async.auto({
      addUserExpenseGroup: function (callback) {
        var requestObject = {
          GroupID: data.GroupID,
          SpentByUserID: data.SpentByUserID,
          GroupAmount: data.GroupAmount,
          ExpenseDescription: data.ExpenseDescription
        };
        UserExpenseGroup.addUserGroupExpense(requestObject, function (error, expenseResult) {
          if (error) {
            return callback({
              success: false,
              msg: 'Please try later',
              data: {}
            });
          } else {
            return callback(null, expenseResult.data);
          }
        });
      },
      addUserExpenseGroupDetails: ['addUserExpenseGroup', function (error, result) {
        if (!_.isEmpty(result.addUserExpenseGroup)) {
          if (!data.GroupParticipantsArray) {
            return callback(null, result.addUserExpenseGroup);
          } else {
            _.forEach(data.GroupParticipantsArray, function (eachObj) {
              var eachDetailReq = {
                UserExpenseGroupID: result.addUserExpenseGroup.UserExpenseGroupID,
                SplitPercentage: data.SplitPercentage,
                SourceUserID: data.SpentByUserID,
                DestinationUserID: data.DestinationUserID,
                TotalAmount: data.GroupAmount
              };
              UserExpenseGroup.app.models.UserExpenseGroupDetails.addUserExpenseGroupDetails(eachDetailReq);
            });
          }
        } else {
          return callback(null, result.addUserExpenseGroup);
        }
      }]
    }, function (error, autoResult) {
      if (error) {
        return cb(null, error);
      } else {
        return cb(null, autoResult.addUserExpenseGroupDetails);
      }
    });
  };

  UserExpenseGroup.remoteMethod(
    'addUserExpenseGroup', {
    description: 'addUserExpenseGroup',
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

  UserExpenseGroup.remoteMethod(
    'getUserExpenseGroup', {
    description: 'getUserExpenseGroup',
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
  
  UserExpenseGroup.remoteMethod(
    'updateUserExpenseGroup', {
    description: 'updateUserExpenseGroup',
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

  UserExpenseGroup.remoteMethod(
    'addGroupExpense', {
    description: 'addGroupExpense',
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