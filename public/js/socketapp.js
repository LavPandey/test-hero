
var I2P_SOCKET = io();

I2P_SOCKET.on('userinvite', function (data) {
    if (data.to === getLoggedInUser()) {
        modalMgr.userInviteModal.open();
        modalMgr.userInviteModal.inviteData = data;
        $('#userInviteModal .modal-body').html(data.from + ' Calling...');
    }
});

I2P_SOCKET.on('groupinvite', function (data) {
    if (data.users.indexOf(getLoggedInUser()) !== -1) {
        modalMgr.newInviteModal.open();
        modalMgr.newInviteModal.inviteData = data;
        $('#newInviteModal .modal-body').html(data.from + ' Inviting to join group call...');
    }
});