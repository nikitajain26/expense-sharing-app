* Requirements -
    node 10.x

* To Run this project -
    npm install
    node .

* Open http://localhost:3000/explorer to hit the APIs using Loopback API explorer on your browser.

* The structure and models of the project can be described as -
    Models :
      1). User - This stores basic details of the user along with their username and password.
        APIs ->
        * loginWithPassword : API validates user credentials and logs in the user into the app.
        * getUserDetailsByUserID : gets details of a user 
      
      2). Group - This model contains details of all the groups that are created in the ExpenseSharing app.
        APIs ->
        * createNewGroup : API creates a new group in the system.
        * addMembersToGroup : API adds members to a group. A number of Users can belong to one group. 
      
      3). UserExpense - This model contains the sum total of all the expenses that are associated to a user month vise. It also store the settlement status for that particular expense, meaning if and when the complete AmountSpent gets settled for the user, SettlementStatus gets 1.
        APIs ->
        * addUserExpense : API adds AmountSpent by a user for that month.
        * createOrUpdateUserExpense : API creates a user_expense if it does not already exists in the system. This API is called whenever any new expenditure is added by a user in any group that he is a part of,so that the particular expense can be added to user's individual expense as well.
        * getUserExpense : API gets unsettled expense for a user.
        * updateUserExpense : API updates expense of a user for a particular month.

      4). UserExpenseGroup - This model contains complete expense done in a group. The GroupAmount is added by the user along with basic description of the expenditure for other participants of the group to know about the expense.
        APIs ->
        * addUserExpenseGroup : API will first add the total expense for a group and will then add the total amount to the existing AmountSpent of the User who adds the expenditure on his/her name.
        * getUserExpenseGroup : API to return outstanding and unsettled Total expenditure done by a particular User against all groups the user is associated to.
        * addGroupExpense : This will first add the expense of the group and then will subsequently divide the expense according to the given ratio among each group member
        * updateUserExpenseGroup : API to update the details of an expense added by an user.

      5). UserExpenseGroupDetails - This model contains complete expense done in a group. All the UserIDs involved in an expense that are associated to a UserExpenseGroupID, are each specified in this entry. The total amount is divided according to SplitRatio entered by the user who is entering the amount. UserShareAmount i.e. amount that each user owes, is calculated based on the SplitRatio.
        APIs ->
        * addUserExpenseGroupDetails : API to add the share of each user towards an expense added for a group of users. 
        * getUserExpenseHistory : API to show the total money to be received from the friends and total money to be paid by the person tp his friends. This API can also return user's summary of money he/she owes to his/her friends. If an additional parameter - "getMoneyToBeReceived" is sent as false in the request then the API will only return total money that a User owes to his friends.
        * updateUserExpenseGroupDetails : API to update the expense details of a group. 