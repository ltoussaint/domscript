$.Class('core.Game', function (that) {
    var
        stage,
        menu,
        options,
        playerList = {};

    this.__construct = function () {

        this.initGame();
    };

    this.initGame = function () {
        playerList["Player1"] = $.Load("core.Player", "Player1", "#3a5eb7", aMapData.startNbSoliders);
        playerList["Player2"] = $.Load("core.Player", "Player2", "#d181cf", aMapData.startNbSoliders);
        playerList["Player3"] = $.Load("core.Player", "Player3", "#08d129", aMapData.startNbSoliders);
        playerList["Player4"] = $.Load("core.Player", "Player4", "#c91616", aMapData.startNbSoliders);
        playerList["Player5"] = $.Load("core.Player", "Player5", "#e09c39", aMapData.startNbSoliders);
    };

    this.__ready = function () {
        menu = $.Load("core.Menu", playerList);
        stage = $.Load("core.Stage", window.innerWidth - 250, "100%");

        initPlayers.call(this, playerList);

        fakeInit.call(this, playerList);

        options = $.Load("core.Options");
    };

    function initPlayers(playerList) {
        var states = stage.getMap().getStates();
        var nbPlayer = $.getLength(playerList);

        var tmpStateList = [];
        var tmpPlayerList = [];

        $.each(states, function(state){
            tmpStateList.push(state);
        });
        $.each(playerList, function(player){
            tmpPlayerList.push(player);
        });
        tmpPlayerList = $.shuffle(tmpPlayerList);

        var playerIndex = 0;
        while($.getLength(tmpStateList) > 0) {
            var index = Math.floor(tmpStateList.length * Math.random());
            var state = tmpStateList[index];
            tmpPlayerList[playerIndex].addState(state);
            state.setOwnedPlayer(tmpPlayerList[playerIndex]);

            tmpStateList.splice(index, 1);

            playerIndex++;
            if (playerIndex >= nbPlayer) {
                playerIndex = 0;
            }
        }
    }

    function fakeInit(playerList) {
        $.each(playerList, function(player){
            var states = player.getStates();
            var nbStatesToDo = states.length;
            $.each(states, function(state){
                var remainingSoldiers = player.getNbRemainingSoldiers();
                if (nbStatesToDo == 1) {
                    var soldiersToAssign = remainingSoldiers;
                } else {
                    var soldiersToAssign = remainingSoldiers / nbStatesToDo;
                    soldiersToAssign = $.random(Math.floor(soldiersToAssign-1), Math.ceil(soldiersToAssign+1));
                }

                $.triggerEvent(document, 'addSoldiersToState', {
                    player: player,
                    state: state,
                    number: soldiersToAssign
                });

                nbStatesToDo--;
            });
        });
    }

}, true);