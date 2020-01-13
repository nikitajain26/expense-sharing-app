module.exports = function (UserExpense) {

  //API to add expense of each individual user for the current month. 
  /*UserExpense table will have one entry per month for one user. This is will keep updating as 
  and when more expenses are being added for/by the same user for a particular month.*/
  UserExpense.addUserExpense = function (data, cb) {
    if (!data.UserID && !data.AmountSpent) {
      return cb(null, {
        success: false,
        msg: 'Please enter all mandatory details',
        data: {}
      });
    } else {
      var currentMonth = moment().format('YYYY-MM');
      UserExpense.findOne({ 
        where: { UserID: data.UserID, ExpenseMonthYear: currentMonth}
      })
      .then(function(result) {
        if (result) {
          return cb(null, {
            success: false,
            msg: 'Expense for this month already exists',
            data: {}
          }); 
        } else {
          var expenseObject = {};
          expenseObject.UserID = data.UserID;
          expenseObject.AmountSpent = data.AmountSpent;
          UserExpense.create(expenseObject, function (error, expenseResult) {
            if (error) {
              return cb(null, {
                success: false,
                msg: 'Please try again later',
                data: {}
              });
            } else {
              return cb(null, {
                success: true,
                msg: 'Expense added',
                data: expenseResult
              });
            }
          });
        }
      });
    }   
  };

  //API to create or update an expense added by the user. This will first create the user if it doesn't exist and will directly update the expense if the user already exists.
  UserExpense.createOrUpdateUserExpense = function (data, cb) {
    async.auto({
      createUserExpense: function(callback) {
        UserExpense.addUserExpense(data, function(error, addResult) {
          if (error) {
            return callback(error);
          }
          return callback(null, addResult);
        });
      }, 
      updateUserExpenseIfExists: ['createUserExpense', function(callback, result) {
        UserExpense.updateUserExpense(data, function (error, updateResult) {
          if (error) {
            return callback(error);
          }
          return callback(null, addResult);
        });
      }]
    }, function(error, autoResult) {
      if (error) {
        return cb(null, {
          success: false,
          msg: 'Please try again later',
          data: {}
        });
      } else {
        return cb(null, autoResult.updateUserExpenseIfExists);
      }
    });
  };

  //API to get pending expenses by a user.
  UserExpense.getUserExpense = function (data, cb) {
    if (!data.UserID) {
      return cb(null, {
        success: false,
        msg: 'Please enter all mandatory details',
        data: {}
      });
    } else {
      UserExpense.find({
        where: {
          UserID: data.UserID,
          SettlementStatus: 0
        }
      })
      .then(function (userExpenseResult) {
        return cb(null, {
          success: true,
          msg: 'Standing Expense found for the User',
          data: userExpenseResult
        });
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

  // API to update user expenses.
  UserExpense.updateUserExpense = function (data, cb) {
    if (!data.UserID && !data.ExpenseMonthYear && !data.UpdateObject) {
      return cb(null, {
        success: false,
        msg: 'Please enter all mandatory details',
        data: {}
      });
    } else {
      UserExpense.findOne({
        where: {
          UserID: data.UserID,
          ExpenseMonthYear: data.ExpenseMonthYear
        }
      })
      .then(function (userExpenseResult) {
        if (userExpenseResult) {
          userExpenseResult.updateAttributes(data.UpdateObject, function(error, updateResult) {
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
            msg: 'User not found',
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

  UserExpense.remoteMethod(
    'addUserExpense', {
    description: 'addUserExpense',
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

  UserExpense.remoteMethod(
    'createOrUpdateUserExpense', {
    description: 'createOrUpdateUserExpense',
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

  UserExpense.remoteMethod(
    'getUserExpense', {
    description: 'getUserExpense',
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

  UserExpense.remoteMethod(
    'updateUserExpense', {
    description: 'updateUserExpense',
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