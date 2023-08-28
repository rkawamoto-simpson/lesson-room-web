function AudioManager() {
    this.audioTimeUp = undefined;
    this.audioFanFare = undefined;
    this.audioHandClap = undefined;
    this.audioRegretFully = undefined;
    this.audioBell = undefined;
    this.audioTel = undefined;
    this.audioCorrect = undefined;
    this.audioIncorrect = undefined;
    this.audioSound = undefined;
    this.__construct = function () {
        this.audioTimeUp = new Audio(BoardConfig.AUDIO_SRC_TIME_UP);
        this.audioBell = new Audio(BoardConfig.AUDIO_SRC_BELL);
        this.audioCorrect = new Audio(BoardConfig.AUDIO_SRC_CORRECT);
        this.audioFanFare = new Audio(BoardConfig.AUDIO_SRC_FANFARE);
        this.audioHandClap = new Audio(BoardConfig.AUDIO_SRC_HANDCLAP);
        this.audioIncorrect = new Audio(BoardConfig.AUDIO_SRC_INCORRECT);
        this.audioTel = new Audio(BoardConfig.AUDIO_SRC_TEL);
        this.audioRegretFully = new Audio(BoardConfig.AUDIO_SRC_REGRET_FULLY);
        this.audioSound = new Audio(BoardConfig.AUDIO_SRC_SOUND_1);
    };

    this.playTimeUp = function () {
        this.audioTimeUp.play();
    }
    
    this.playBell = function () {
        this.audioBell.play();
    }
    
    this.playCorrect = function () {
        this.audioCorrect.play();
    }
    
    this.playFanfare = function () {
        this.audioFanFare.play();
    }
    
    this.playHandClap = function () {
        this.audioHandClap.play();
    }
    
    this.playIncorrect = function () {
        this.audioIncorrect.play();
    }
    
    this.playTel = function () {
        this.audioTel.play();
    }
    
    this.playRegretFully = function () {
        this.audioRegretFully.play();
    }
    
    this.playSound = function () {
        this.audioSound.play();
    }



    this.__construct();
}