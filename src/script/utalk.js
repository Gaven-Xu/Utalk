(function () {

    var set = document.getElementById('set');
    var Box = document.getElementById('message_box');
    var input = document.getElementById('input');
    var shadow = document.getElementById('shadow');
    var isRemote = true;
    var shiftDown = false;
    var wsHandle = {};
    var socket = {};

    /**
     * @param {string} cached_nickname use cached_nickname if is in localstorage. Otherwise use an input nickname
     */
    var cached_nickname = localStorage.getItem('nick');
    if (cached_nickname) {
        var nick = localStorage.getItem('nick');
        document.getElementById('nick').value = nick;
        document.getElementById('nick').focus();
    }
    shadow.addEventListener('click', function () {
        set.nick.focus();
    })
    set.addEventListener('submit', function (e) {
        e.preventDefault();
        var nick = set.nick.value.trim();
        if (nick.length >= 5) {

            // setTimeout(function () {
            //     shadow.style.display = 'none';

            socket = io('http://106.15.91.176:7878/');

            // socket默认事件 连接成功
            socket.on('connect', function () {

                wsHandle = new utalk.wsHandle(socket, nick); // wsHandle can use this socket

                socket.emit('regist', nick, function (data) {
                    switch (data.code) {
                        case 0: {
                            // 用户名存在
                            set.nick.placeholder = data.m;
                            set.nick.value = '';
                            set.nick.focus();
                        } break;
                        case 1: {
                            // 注册成功
                            localStorage.setItem('nick', nick);
                            shadow.style.opacity = 0;
                            input.from.value = nick;
                            input.message.focus();

                            setTimeout(function () {
                                shadow.style.display = 'none';
                            }, 505);

                        } break;
                        default: {

                        } break;
                    }

                })

                wsHandle.getClients(input.to);

                wsHandle.listen('message', function (data) {
                    wsHandle.showMessage(Box, data, isRemote);
                })

                wsHandle.listen('new_user', function () {
                    wsHandle.getClients(input.to);
                })

                wsHandle.listen('user_not_in', function (data) {
                    wsHandle.showMessage(Box, data, isRemote);
                })

                wsHandle.showMessage(Box, {
                    from: 'Utalk',
                    to: 'nick',
                    time: formatTime(new Date(), '-'),
                    m: '欢迎使用Utalk，本软件属于Gaven Xu瞎胡闹产品，没有数据库，没有账号，没有表情包，没有好友记录，没有群组，不会记录任何信息，请放心使用，萍水相逢，能在一起聊天即是缘分，如有问题，请输入help命令查看帮助。',
                    color: '#d04778'
                }, isRemote)
            })

        } else {
            set.nick.placeholder = 'Try 5-20 letter';
            set.nick.value = '';
            set.nick.focus();
        }
    })

    function messageHandle() {
        var data = wsHandle.filterData(input.from, input.to, input.message)

        //command
        if (data.hasOwnProperty('command')) {

            if (data.command == '@' && data.m.trim().length > 0) {
                wsHandle.sendMessage(data, function (data) {
                    wsHandle.showMessage(Box, data, !isRemote)
                    wsHandle.clearInput([input.message], input.message);
                });
            }

            if (data.command == '>') {
                wsHandle.searchBaiduImage(data.m, function (imgArray) {
                    var domSet = wsHandle.formatImageSet(imgArray);
                    data.m = imgArray;
                    wsHandle.sendLocalSearch(data, function (_data) {
                        _data.m = domSet;
                        console.log(_data);
                        wsHandle.showSearchResult(Box, _data);
                        wsHandle.clearInput([input.message], input.message);
                    })
                });
            }

            if (data.command == 'help') {
                wsHandle.showMessage(Box, data, isRemote)
                wsHandle.clearInput([input.message], input.message);
            }

            if (data.command == 'clear') {
                Box.innerHTML = '';
                wsHandle.clearInput([input.message], input.message);
            }

            if (data.command == 'quit') {
                socket.close();
                window.close();
            }

        } else {

            if (data.m.trim().length > 0) {
                wsHandle.sendMessage(data, function (data) {
                    wsHandle.showMessage(Box, data, !isRemote)
                    wsHandle.clearInput([input.message], input.message);
                });
            }

        }
    }

    input.addEventListener('submit', function (e) {

        e.preventDefault();

        messageHandle();

    })

    message.addEventListener('keydown', function (e) {

        if (e.keyCode == "16" && !shiftDown) { // only Shift
            shiftDown = true;
        }

        if (e.keyCode == "13" && !shiftDown) { // only Enter

            e.preventDefault();

            messageHandle();

        }

        if (e.keyCode == "13" && shiftDown) { //Shift + Enter
            e.preventDefault();
            input.message.value += '\n';
            input.message.scrollTop = input.message.scrollHeight;
        }

    })

    message.addEventListener('keyup', function (e) {

        if (e.keyCode == "16") { // Shift

            shiftDown = false;

        }

    })

    function formatTime(date, str) {
        if (typeof str == "string") {
            return date.getHours() + str + date.getMinutes() + str + date.getSeconds();
        } else {
            console.log('the second argument should be string');
        }
    }

    /**
     * 如果已经成功跟某个人私信过，input.to的selected应该为这个人的名字
     *
     * 如果按@符号，则开始监听输入，每次keyup，取@后面的字符串，input.to的selected应该为这个人的名字。如果按space，则停止监听，
     */

})()
