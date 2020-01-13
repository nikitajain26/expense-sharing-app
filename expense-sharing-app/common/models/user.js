module.exports = function (User) {

  // API to login after verification of user credentials.
  User.loginWithPassword = function (data, cb) {
    if ((!data.UserNickName || !data.UserEmailID || !data.UserMobileNo) && !data.Password) {
      return cb(null, {
        success: false,
        msg: 'Please provide all necessary details to login',
        data: {}
      });
    }
    var whereFilter = {};
    if (data.UserNickName) {
      whereFilter.UserNickName = data.UserNickName;
    }
    if (data.UserEmailID) {
      whereFilter.UserEmailID = data.UserEmailID;
    }
    if (data.UserMobileNo) {
      whereFilter.UserMobileNo = data.UserMobileNo;
    }
    User.findOne({
      where: whereFilter
    })
    .then(function (userResult) {
      if (userResult) {
        if (decrypted(userResult.Password) === data.Password) { // decrypted function will decrypt the password which will be stored in encrypted format in the database.
          var userDetails = { ...userResult };
          delete userDetails[Password];
          return cb(null, {
            success: false,
            msg: 'Logged In successfully',
            data: userDetails
          });
        }
      } else {
        return cb(null, {
          success: false,
          msg: 'Please enter valid login credentials',
          data: {}
        });
      }
    })
    .catch(function (error) {
      return cb(null, {
        success: false,
        msg: 'Please try logging in again later',
        data: {}
      });
    });
  };

  User.getUserDetailsByUserID = function (data, cb) {
    if (!data.UserID) {
      return cb(null, {
        success: false,
        msg: 'Please try again later',
        data: {}
      });
    } else {
      User.findOne({
        where: {
          UserID: data.UserID
        }
      })
      .then(function (userDetails) {
        if (userDetails) {
          delete userDetails[Password];
          return cb(null, {
            success: true,
            msg: 'User details found',
            data: userDetails
          });
        } else {
          return cb(null, {
            success: false,
            msg: 'User does not exist',
            data: {}
          });
        }
      })
      .catch(function (error) {
        log.info('Error ', error);
        return cb(null, {
          success: false,
          msg: 'Please try again later',
          data: {}
        });
      });
    }
  }; 
  
  User.remoteMethod(
  'loginWithPassword', {
    description: 'loginWithPassword',
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
  
  User.remoteMethod(
    'getUserDetailsByUserID', {
    description: 'getUserDetailsByUserID',
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