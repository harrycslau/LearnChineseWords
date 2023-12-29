$(function(){
  var correctAnswer;
  var defaultVoice; // This will hold the default voice object
  var soundCorrect = new Audio('sound/correct.mp3'); // Create an audio object for the correct sound
  var soundIncorrect = new Audio('sound/incorrect.mp3'); // Create an audio object for the correct sound
  var soundEnd = new Audio('sound/winfantasia.mp3'); 

  levelSelected = 0;
  nowRound = 0;
  levelRound = [3, 7, 8, 9, 10];
  levelWords =  [
                  ["一", "二", "三", "十", "上", "中", "下", "土", "山", "口", "日", "人", "大", "天", "火", "木", "水", "小", "刀", "石", "牛", "羊", "米", "月", "手", "女", "心", "白", "雨", "力", "車"],
                  ["四", "五", "六", "七", "八", "九", "我", "你", "他", "她", "它", "入", "子", "目", "自", "己", "已", "門", "少", "回", "合", "正", "反", "東", "西", "必", "走", "才", "太", "今", "光"]
                ];

  function setDefaultCantoneseVoice() {
      var voices = speechSynthesis.getVoices();
      var cantoneseVoice = voices.find(voice => voice.lang === 'zh-HK'); // Primary check for Cantonese based on language code
      if (!cantoneseVoice) {
          cantoneseVoice = voices.find(voice => voice.name.includes("Cantonese") || voice.name.includes("粵語"));
      }
      if (!cantoneseVoice) {
          cantoneseVoice = voices.find(voice => voice.lang.startsWith('zh')); // Fallback to any Chinese voice
      }
      if (!cantoneseVoice) {
          cantoneseVoice = voices[0]; // or any other default strategy
      }
      defaultVoice = cantoneseVoice;
  }

  // Load voices and set the default Cantonese voice
  // Also ensure voices are loaded and default is set
  speechSynthesis.onvoiceschanged = function() {
      setDefaultCantoneseVoice();
  };
  if(speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = setDefaultCantoneseVoice;
  }

  function soundPlayAndSpeak(sound, text, callback) {
    sound.play(); 
    sound.onended = function() {
      soundSpeak(text, callback);
    };
  }

  function soundSpeak(text, callback) {
    var msg = new SpeechSynthesisUtterance();
    msg.voice = defaultVoice; 
    msg.text = text;
    msg.pitch = 1.1;
    msg.rate = 1.05;
    msg.onend = function(event) {
      if (typeof callback === "function") {
        callback(); // Call the callback function if provided
      }
    };
    speechSynthesis.speak(msg);
  }


  function newQuestion() {
    var $buttonContainer = $('#button-container');
    $buttonContainer.empty(); // Clear previous buttons

    // Select random correct character from the selected level's words
    correctAnswer = levelWords[levelSelected][Math.floor(Math.random() * levelWords[levelSelected].length)];

    // Create a set to hold wrong characters to ensure uniqueness
    var wrongAnswers = new Set();

    // Randomly select two unique wrong characters
    while(wrongAnswers.size < 2) {
        var wrongAnswer = levelWords[levelSelected][Math.floor(Math.random() * levelWords[levelSelected].length)];
        if(wrongAnswer !== correctAnswer) {
            wrongAnswers.add(wrongAnswer);
        }
    }

    // Combine correct and wrong characters and shuffle
    var allCharacters = [correctAnswer, ...wrongAnswers];
    shuffleArray(allCharacters); // Shuffle the array to mix correct and wrong answers

    // Create a button for each character
    allCharacters.forEach(function(character) {
        var $btn = $('<button class="btnAnswer">').text(character);
        $buttonContainer.append($btn);
    });

    $('#speech-input').text("「"+correctAnswer+"」，係邊個呢？");
    soundSpeak($('#speech-input').text());

  }

  function endRound() {
    soundPlayAndSpeak(soundEnd, "好嘢，全部都完成喇！", function(){
      $('#game-container').hide(); // Show game container   
      $('#level-selection').show(); // Hide level selection container   
    });
  }


  // Utility function to shuffle an array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
  }


  function updateProgressBar() {
    var percentage = (nowRound / levelRound[levelSelected]) * 100; // Calculate percentage
    $('#progress-bar').css('width', percentage + '%'); // Update progress bar width
    var progressBarWidth = $('#progress-bar-container').width(); // Total width of the progress bar container
    var iconLeft = (percentage / 100) * progressBarWidth; // Calculate the left position based on percentage
    $('#progress-icon').css('left', iconLeft + 'px'); // Update the icon's position
  }



  $('#button-container').on('click', '.btnAnswer', function(){
    nowRound++;
    var maxRound = levelRound[levelSelected];
    var answer = $(this).text();
    if(answer === correctAnswer){
      soundPlayAndSpeak(soundCorrect, "答啱喇！", function() {
        updateProgressBar(); // Update progress bar after correct answer
        if(nowRound < maxRound) {
          newQuestion();
        } else {
          endRound();
        }
      });
      } else {
      soundPlayAndSpeak(soundIncorrect, "唔緊要，繼續努力！", function() {
        updateProgressBar(); // Update progress bar after correct answer
        if(nowRound < maxRound) {
          newQuestion();
        } else {
          endRound();
        }
      }); // Incorrect Answer
    }
  });
  
  $('#speak-btn').click(function(){
      var text = $('#speech-input').text();
      soundSpeak(text); // Speak the question or prompt
  });


  $('.level-btn').click(function(){
    // Step 1: Determine the selected level
    levelSelected = parseInt($(this).text()) - 1;

    // Step 2: Hide and Show Containers
    $('#level-selection').hide(); // Hide level selection container
    $('#game-container').show(); // Show game container

    // Step 3: Initialize or Update the Game
//    updateGameForLevel(); // Update the game for the new level
    newQuestion();
});


});
