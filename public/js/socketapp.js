
var I2P_SOCKET = io();

I2P_SOCKET.on('userinvite', function (data) {
    if (data.to === getLoggedInUser()) {
        modalMgr.userInviteModal.open();
        modalMgr.userInviteModal.inviteData = data;
        $('#userInviteModal .modal-body').html(data.from + ' Calling...');
    }
});

I2P_SOCKET.on('newmeet', function (data) {
    debugger;
});