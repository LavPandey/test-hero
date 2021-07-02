var modalMgr = {},
    defaultMeetName = 'i2pdemomeet',
    domain = 'meet.jit.si',
    meetURL, JAPI, defaultOption, enumerables,
    interfaceConfigOverwrite, configOverwrite;

enumerables = [
    'valueOf', 'toLocaleString', 'toString', 'constructor'
];

interfaceConfigOverwrite = {
    SHOW_CHROME_EXTENSION_BANNER: false,
    SHOW_JITSI_WATERMARK: false,
    SHOW_DEEP_LINKING_IMAGE: false,
    SHOW_POWERED_BY: false,
    SHOW_PROMOTIONAL_CLOSE_PAGE: false,
    MOBILE_APP_PROMO: false,
    DEFAULT_LOGO_URL: 'https://idea2product.tech/wp-content/themes/idea2product/assets/images/logo.png',
    DEFAULT_REMOTE_DISPLAY_NAME: 'I2P',
    DEFAULT_WELCOME_PAGE_LOGO_URL: 'https://idea2product.tech/wp-content/themes/idea2product/assets/images/logo.png',
    JITSI_WATERMARK_LINK: 'https://idea2product.tech/',
};

configOverwrite = {
    subject: 'I2P Demo',
    enableClosePage: true
};

defaultOption = {
    width: '100%',
    height: '100%',
    parentNode: document.querySelector('#meet')
};

function getLoggedInUser() {
    return localStorage.getItem('i2p-demo-user-name');
}

function prepareUserRoom(from, to) {
    return (+(new Date())) + '-' + (from + '-' + to)
}

function apply(object, config, defaults) {
    var i, j, k;

    if (object) {
        if (defaults) {
            apply(object, defaults);
        }

        if (config && typeof config === 'object') {
            for (i in config) {
                object[i] = config[i];
            }

            if (enumerables) {
                for (j = enumerables.length; j--;) {
                    k = enumerables[j];

                    if (config.hasOwnProperty(k)) {
                        object[k] = config[k];
                    }
                }
            }
        }
    }

    return object;
};

function prepareOption(roomName, option, config, interfaceConfig) {
    var opt = {
        roomName: roomName || defaultMeetName
    };

    option = apply(defaultOption, option);
    config = {
        configOverwrite: apply(configOverwrite, config)
    };
    interfaceConfig = {
        interfaceConfigOverwrite: apply(interfaceConfigOverwrite, interfaceConfig)
    };

    opt = apply(opt, option);
    opt = apply(opt, config);
    opt = apply(opt, interfaceConfig);

    opt.userInfo = {
        displayName: getLoggedInUser()
    };

    return opt;
}

function getRoomName() {
    var search = location.search.substring(1),
        data;

    if (!data) {
        return defaultMeetName;
    }

    data = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');

    return data.meet || defaultMeetName;
}

function toggleClass(selector, cls, addClass) {
    $(selector)[addClass ? 'addClass' : 'removeClass'](cls);
}

function endCall() {
    if (JAPI && JAPI.execCommand) {
        JAPI.executeCommand('hangup');
        JAPI = null;
    }

    $('#meet iframe').remove();
}
function initJitsiFrame(meetOption) {
    endCall();

    for (var key in modalMgr) {
        modalMgr[key].close();
    }

    JAPI = new JitsiMeetExternalAPI(domain, meetOption);

    JAPI.addListener('readyToClose', function () { debugger });
};

function prepareUrl(val) {
    return (location.origin + location.pathname + '?meet=' + (val || defaultMeetName));
}


function isValidUser() {
    var user = getLoggedInUser();

    if (!user) {
        return showAuthPopUp();
    }

    showInitialSetup()
}

function showAuthPopUp() {
    modalMgr.authModal.open();
}

function showInitialSetup(hidden) {
    toggleClass('.host-meeting', 'cust-hidden', hidden);
    toggleClass('.welcome-page', 'cust-hidden', hidden);
    toggleClass('#nav-mobile', 'cust-hidden', hidden);
    updateUserList();
}

function initPopModal() {
    modalMgr.authModal = M.Modal.init($('#authModal'), {
        dismissible: false
    })[0];

    modalMgr.hostMeetModal = M.Modal.init($('#hostMeetModal'), {
        dismissible: true,
        top: '30%'
    })[0];

    modalMgr.usersModal = M.Modal.init($('#usersModal'), {
        dismissible: true,
        top: '30%'
    })[0];

    modalMgr.userInviteModal = M.Modal.init($('#userInviteModal'), {
        dismissible: false,
        top: '30%'
    })[0];

    modalMgr.newInviteModal = M.Modal.init($('#newInviteModal'), {
        dismissible: false,
        top: '30%'
    })[0];
}

function onAddUserClick() {
    var userName = $('#authUserName').val()

    if (!userName) {
        return;
    }

    localStorage.setItem('i2p-demo-user-name', userName);

    modalMgr.authModal.close();

    showInitialSetup();
}

function hostMeeting() {
    modalMgr.hostMeetModal.open();
}

function startMeet() {
    var val = $('#meetName').val(),
        inviteUser = [],
        option;
    meetURL = prepareUrl(val);

    copyMeetToClipboard();

    $('#meetName').val('');

    $('.invitee-list .chip .invite-list-name').each(function (a, el) {
        inviteUser.push(el.innerText)
    });

    option = prepareOption(val, defaultOption, configOverwrite, interfaceConfigOverwrite);

    showInitialSetup(true);
    toggleClass('#meet', 'cust-hidden');

    I2P_SOCKET.emit('groupinvite', {
        users: inviteUser,
        from: getLoggedInUser(),
        roomName: option.roomName
    });

    initJitsiFrame(option);

    modalMgr.hostMeetModal.close();
}

function copyMeetToClipboard() {
    var val = $('#meetName').val(),
        txt;

    meetURL = prepareUrl(val);

    txt = $('<textarea />');
    txt.val(meetURL).css({ width: "1px", height: "1px" }).appendTo('body');
    txt.select();
    if (document.execCommand('copy')) {
        txt.remove();
    }
}

function showUsersPopup() {
    modalMgr.usersModal.open();
}

function callUser(e) {
    var targetEl = e.currentTarget || e.target,
        userId, currentUser, roomName, option;

    if (!targetEl) {
        console.log('User id not available');
        return;
    }

    userId = $(targetEl).attr('data-id');

    if (!userId && targetEl.parentElement) {
        targetEl = targetEl.parentElement;
    }

    userId = $(targetEl).attr('data-id');

    if (!targetEl) {
        console.log('User id not available');
        return;
    }

    // call user
    currentUser = getLoggedInUser();

    roomName = prepareUserRoom(currentUser, userId);

    option = prepareOption(roomName, null, {
        prejoinPageEnabled: false
    });

    showInitialSetup(true);
    toggleClass('#meet', 'cust-hidden');

    I2P_SOCKET.emit('userinvite', {
        to: userId,
        from: currentUser,
        roomName: roomName
    });

    initJitsiFrame(option);

    modalMgr.usersModal.close();
}

function cancelUserInvite() {
    modalMgr.userInviteModal.close();
    modalMgr.userInviteModal.inviteData = data;
}

function acceptUserInvite() {
    var data = modalMgr.userInviteModal.inviteData;

    option = prepareOption(data.roomName, null, {
        prejoinPageEnabled: false
    });

    showInitialSetup(true);
    toggleClass('#meet', 'cust-hidden');

    I2P_SOCKET.emit('userinviteaccepted', {
        to: data.currentUser,
        from: data.userId,
        roomName: data.roomName
    });

    initJitsiFrame(option);

    cancelUserInvite();
    modalMgr.usersModal.close();

}

function cancelNewInvite() {
    modalMgr.newInviteModal.close();
    modalMgr.newInviteModal.inviteData = data;
}

function acceptNewInvite() {
    var data = modalMgr.newInviteModal.inviteData;

    option = prepareOption(data.roomName);

    showInitialSetup(true);
    toggleClass('#meet', 'cust-hidden');

    initJitsiFrame(option);

    modalMgr.newInviteModal.close();
}

function initListeners() {
    $('#submitUserBtn').on('click', onAddUserClick);
    $('.host-meeting').on('click', hostMeeting);
    $('#meetBtn').on('click', startMeet);
    $('.copy-meet').on('click', copyMeetToClipboard);
    $('.team-call-btn').on('click', showUsersPopup);
    $('#usersModal .collection').delegate('.user-call', 'click', callUser);
    $('#userInviteCancel').on('click', cancelUserInvite);
    $('#userInviteAccept').on('click', acceptUserInvite);
    $('#newInviteCancel').on('click', cancelNewInvite);
    $('#newInviteAccept').on('click', acceptNewInvite);
}

function updateUserList() {
    var values = [
        {
            name: 'Iron Man', id: 'user1'
        }, {
            name: 'Spider-Man', id: 'user2'
        }, {
            name: 'The Hulk', id: 'user3'
        }, {
            name: 'Doctor Strange', id: 'user4'
        }, {
            name: 'Black Panther', id: 'user5'
        }
    ],
        str = '',
        currentUser = getLoggedInUser(),
        i, data;

    for (i = 0; i < values.length; i++) {
        data = values[i];

        if (currentUser === data.name) {
            continue;
        }

        str += [
            '<li class="collection-item avatar">',
            '<i class="material-icons circle red">face</i>',
            '<span class="title">', data.name, '</span>',
            '<a href="#!" class="secondary-content user-call" data-id="', data.name, '"><i class="material-icons">call</i></a>',
            '</li>'
        ].join('');
    }

    $('#usersModal .collection').html(str);

}

$(function () {
    initPopModal();
    initListeners();
    isValidUser();
    updateUserList();
});


