$(function(){
    speechSynthesis.onvoiceschanged = function() {
      var $voicelist = $('#voicelist');
          
      speechSynthesis.getVoices().forEach(function(voice, index) {
        var $voiceOption = $('<option>')
        .val(index)
        .html(voice.name);
        
        $voicelist.append($voiceOption);
      });
    }
    
    $('#speak-btn').click(function(){
      var text = $('#speech-input').val();
      var msg = new SpeechSynthesisUtterance();
      var voices = window.speechSynthesis.getVoices();
      msg.voice = voices[$('#voicelist').val()];
      msg.text = text;
  
      msg.onend = function(e) {
        console.log('Finished in ' + event.elapsedTime + ' seconds.');
      };
  
      speechSynthesis.speak(msg);
    })
  });
  
  