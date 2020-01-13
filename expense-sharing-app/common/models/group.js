module.exports = function (Group) {

  //API to create a group.
  Group.createNewGroup =  function (data, cb) {
    if (!data.MemberUsers && !data.GroupName) {
      return cb(null, {
        success: false,
        msg: 'Please enter all mandatory details',
        data: {}
      });
    } else {
      var requestObj = {
        GroupName: data.GroupName      
      };
      Group.create(requestObj, function (error, createResult) {
        if (error) {
          return cb(null, {
            success: false,
            msg: 'Please try again later',
            data: {}
          });
        } else {
          return cb(null, {
            success: true,
            msg: 'Group created',
            data: createResult
          });
        }
      });
    }
  };

  //An API to add members to a group. 
  /*These members are users who are already registered in the app, hence they have their UserIDs.*/
  Group.addMembersToGroup = function (data, cb) {
    if (!data.GroupID && !data.UserArray) {
      return cb(null, {
        success: false,
        msg: 'Please enter all mandatory details',
        data: {}
      });
    } else {
      var membersArray = [];
      for (var i = 0; i < data.UserArray.length; i++) {
        var eachMember = {};
        eachMember.GroupID = data.GroupID;
        eachMember.UserID = data.UserArray[i];
        membersArray.push(eachMember);
      }  
      Group.app.models.GroupDetails.create(membersArray, function (error, createResult) {
        if (error) {
          return cb(null, {
            success: false,
            msg: 'Please try again later',
            data: {}
          });
        } else {
          return cb(null, {
            success: true,
            msg: 'Members added',
            data: createResult
          });
        }
      });
    }
  };
};