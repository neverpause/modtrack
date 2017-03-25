// ==UserScript==
// @name         [Dubtrack] Modtrack
// @namespace    neverpause/Dubtrack
// @version      0.3.1
// @description  easy explain script
// @author       Unknown
// @match        https://www.dubtrack.fm/join/nightblue3
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.Modtrack = (function (Dubtrack) {
        var self = {};

        var settings = {
            downdub_notifications: true,
            downdub_thresholds : {
                501: 20, 251: 15, 101: 10, 0: 5
            },
            messages: {
                stream_starting: '@djs *Stream is starting* :laceno: Queue songs at your own risk of getting skipped/removed. ~Nightcore/Nightstep, AMVs and songs that are too chill will be removed from the queue!~',
                stream_ending: '@djs The *stream is ending* :pogchamp: now, please stick to ~off stream rules for songs~. The queue will be purged in a few minutes. :seemsgood:',
                song_rules: {
                    off_stream: '> *RULES for songs (off stream)*: ~EDM | Trap | Chill~, No NSFW, No ear rape, No Hardstyle, ~No Nightcore/Nightstep~, ~No AMVs~, No troll songs, ~Only English~, ~No same songs within 4 hours~',
                    on_stream: '> *RULES for songs (on stream)*: No NSFW, No ear rape, No Hardstyle, ~No Nightcore/Nightstep~, ~No AMVs~'
                },
                queue_locked: '> *The queue is locked now*, so ~only Resident DJs and above~ can play songs. It\'s probably locked because Rabia wasn\'t happy with the music.',
                sub_sunday: 'It\'s *Resident-dj Sunday* :mioshype: Queue will be locked as long as stream is live.',
                read_rules: 'Rules: https://git.io/vWJnY ',
                language: 'Keep the chat in English. You can PM users if you wanna speak another language. ',
                no_spam: 'Don\'t spam the chat or you will be muted. ',
                skips_explained: '> We don\'t ask for *skips* in this room. Songs get skipped at a certain ~downvote threshold~ (off stream). Just mute if you don\'t wanna listen to it.',
                props_explained: '> *Props* can be given to the current DJ via the `!props` command (one per song). You can join the occasional roulette and brag with them.',
                dubs_explained: '>  You get *Dubs* by playing songs and voting on songs. At 10.000 Dubs you\'ll become Resident DJ in this room.',
                dubplus: '> *Dub+* adds some useful features to Dubtrack. Get it at http://dub.plus Tutorial: https://git.io/vyd7r',
                gde: '> *gde* adds ~emotes~ to Dubtrack (even more than Dub+ does). Get it at https://gde.netux.ml/ Tutorial: https://git.io/vyd4p',
                roulette_open: '@djs Roulette is open now :lacehype: Type `!join` for a chance of a random spot in the queue!'
            }
        };

        var menuElements = {
            stream: {
                label: 'Stream',
                elements: {
                    stream_starting: {
                        type: 'command',
                        label: 'Stream starting',
                        handler: chatMessage,
                        arguments: [settings.messages.stream_starting, true, true]
                    },
                    stream_ending: {
                        type: 'command',
                        label: 'Stream ending',
                        handler: chatMessage,
                        arguments: [settings.messages.stream_ending, true, true]
                    },
                    song_rules_off_stream: {
                        type: 'command',
                        label: 'Song Rules off stream',
                        handler: chatMessage,
                        arguments: [settings.messages.song_rules.off_stream, true]
                    },
                    song_rules_on_stream: {
                        type: 'command',
                        label: 'Song Rules on stream',
                        handler: chatMessage,
                        arguments: [settings.messages.song_rules.on_stream, true]
                    },
                    queue_locked: {
                        type: 'command',
                        label: 'Queue locked',
                        handler: chatMessage,
                        arguments: [settings.messages.queue_locked, true]
                    },
                    sub_sunday: {
                        type: 'command',
                        label: 'Sub Sunday',
                        handler: chatMessage,
                        arguments: [settings.messages.sub_sunday, true]
                    }
                }
            },
            warnings: {
                label: 'Warnings',
                elements: {
                    read_rules: {
                        type: 'command',
                        label: 'Read Rules!',
                        handler: chatMessage,
                        arguments: [settings.messages.read_rules, false]
                    },
                    language: {
                        type: 'command',
                        label: 'English Only',
                        handler: chatMessage,
                        arguments: [settings.messages.language, false]
                    },
                    spam: {
                        type: 'command',
                        label: 'Don\'t Spam',
                        handler: chatMessage,
                        arguments: [settings.messages.no_spam, false]
                    }
                }
            },
            explanations: {
                label: 'Explanations',
                elements: {
                    skips_explained: {
                        type: 'command',
                        label: 'Skips explained',
                        handler: chatMessage,
                        arguments: [settings.messages.skips_explained, true]
                    },
                    props_explained: {
                        type: 'command',
                        label: 'Props explained',
                        handler: chatMessage,
                        arguments: [settings.messages.props_explained, true]
                    },
                    dubs_explained: {
                        type: 'command',
                        label: 'Dubs explained',
                        handler: chatMessage,
                        arguments: [settings.messages.dubs_explained, true]
                    },
                    dubplus: {
                        type: 'command',
                        label: 'Dub+',
                        handler: chatMessage,
                        arguments: [settings.messages.dubplus, true]
                    },
                    gde: {
                        type: 'command',
                        label: 'gde',
                        handler: chatMessage,
                        arguments: [settings.messages.gde, true]
                    }
                }
            },
            commands: {
                label: 'Commands',
                elements: {
                    props: {
                        type: 'command',
                        label: '!props',
                        handler: chatMessage,
                        arguments: ['!props', true, true]
                    },
                    history: {
                        type: 'command',
                        label: '!history (with ID)',
                        handler: safeHistoryCheck,
                        arguments: null
                    },
                    roulette_open: {
                        type: 'command',
                        label: 'Roulette open',
                        handler: chatMessage,
                        arguments: [settings.messages.roulette_open, true, true]
                    }
                }
            },
            settings: {
                label: 'Settings',
                elements: {
                    downdub_notifications: {
                        type: 'setting',
                        label: 'Downdub Notifications',
                        var: settings.downdub_notifications
                    }
                }
            }
        };

        function chatMessage (message, send, clear) {
            var element = $('#chat-txt-message');
            element.val((clear === true ? '' : element.val()) + message);
            if (send === true) {
                $('.pusher-chat-widget-send-btn').click();
            }
            element.focus();
        }

        function safeHistoryCheck () {
            var songInfo = Dubtrack.room.player.activeSong.get('songInfo');
            chatMessage('!history ' + songInfo.fkid + ' **', true, true);
        }

        self.executeCommand = function (groupIndex, elementIndex) {
            var command = menuElements[groupIndex].elements[elementIndex];
            command.handler.apply(self, command.arguments);
        };

        var UI = (function (parent) {
            var self = {};

            function buildUI () {
                var container = $('<div class="modtrack-container"><h2>Modtrack</h2></div>');
                var menuContainer = $('<div class="menu-container"></div>').appendTo(container);
                for (var groupIndex in menuElements) {
                    var elementGroup = menuElements[groupIndex];
                    menuContainer.append('<h3>' + elementGroup.label + '</h3>');
                    for (var elementIndex in elementGroup.elements) {
                        var element = elementGroup.elements[elementIndex];
                        if (element.type == 'command') {
                            menuContainer.append('<button type="button" onclick="Modtrack.executeCommand(\'' + groupIndex + '\', \'' + elementIndex + '\')">' + element.label + '</button>');
                        } else if (element.type == 'setting') {
                            menuContainer.append('<button type="button" onclick="" disabled><i class="fi-' + (element.var === true ? 'check' : 'x') + '"></i> ' + element.label + '</button>');
                        }
                    }
                }
                menuContainer.perfectScrollbar();
                return container;
            }

            self.init = function () {
                $('head').append('<link rel="stylesheet" type="text/css" href="https://cdn.rawgit.com/neverpause/modtrack/45dd3182/modtrack.css" />');
                buildUI().appendTo('#main-room .right_section');
            };

            self.showSystemMessage = function (message) {
                $('.chat-main').append('<li class="system"><span>' + message + '</span></li>');
            };

            return self;
        })(self);

        var util = (function (parent) {
            var self = {};

            self.listenToDowndubs = function () {
                var thresholds = {
                    users: [],
                    downdubs: []
                };
                var lastNotified = null;

                for (var index in settings.downdub_thresholds) {
                    thresholds.users.push(parseInt(index));
                    thresholds.downdubs.push(settings.downdub_thresholds[index]);
                }
                if (thresholds.users[0] < thresholds.users[thresholds.users.length - 1]) {
                    thresholds.users.reverse();
                    thresholds.downdubs.reverse();
                }

                Dubtrack.Events.bind('realtime:room_playlist-dub', function (event) {
                    if (event.dubtype == 'downdub') {
                        var userCount = Dubtrack.room.users.rt_users.length;
                        for (var i = 0; i < thresholds.users.length; i++) {
                            if (userCount >= thresholds.users[i]) {
                                var downdubs = Dubtrack.room.player.activeSong.get('song').downdubs + 1; // add the downvote causing the event
                                var songId = Dubtrack.room.player.activeSong.get('song').songid;
                                if (downdubs >= thresholds.downdubs[i] && lastNotified != songId) {
                                    UI.showSystemMessage('Song has reached the downdub threshold!');
                                    Dubtrack.room.chat.mentionChatSound.play();
                                    lastNotified = songId;
                                }
                                return;
                            }
                        }
                    }
                });
            };

            return self;
        })(self);

        (function init () {
            $(document).ready(UI.init);
            if (settings.downdub_notifications === true) {
                util.listenToDowndubs();
            }
        })();

        return self;
    })(Dubtrack);
})();
