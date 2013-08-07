$(function() {
	$('.error').hide();
    $(".button").click(function() {
      $('.error').hide();
      // First, fetch the values entered into the form
      var question = $("textarea#question").val();
      var name = $("input#name").val();
      var email = $("input#email").val();
      var telephone = $("input#phone").val();
      var company = $("input#company").val();
      var size = $("select#size").val();

      var entry = {
        'question': $("textarea#question").val(),
        'name': $("input#name").val(), 
        'email': $("input#email").val(),
        'telephone': $("input#phone").val(),
        'company': $("input#company").val(),
        'size': $("select#size").val()
      };

      // alert("Question is " + question + " name: " + name + " email: " + email + " telephone: " + phone + " company: " + company + " domain: " + domain + " size: " + size);
      
    	// validate the form
      if(inputIsValid(entry)) {
        // Process the form
        $.ajax({
          type: 'POST',
          url: 'http://ping.snowplowanalytics.com',
          dataType: 'json',
          async: false,
          data: JSON.stringify({ Entry: entry }),
          success: function () {
            $('#contact_form').html("<div_id='message'></div>");
            $('#message').html("<h2>Contact Form Submitted!</h2>")
            .append("<p>Many thanks. We will be in touch soon.</p>")
            .hide();
          },
          error: function (msg, url, line) {
            alert('Not submitted');
          }
        });
        return false;
      }
  		return false;
    });

  /* 
   * Validate the fields inputted
   */ 
  function inputIsValid(entry) {
    if (entry.question == "") {
      $("label#question_error").show();
      $("textarea#question").focus();
      return false;
    }

    if (entry.name == "") {
      $("label#name_error").show();
      $("input#name").focus();
      return false;
      }

    if (isRFC822ValidEmail(entry.email) == false) {
      $("label#email_error").show();
      $("input#email").focus();
      return false;
    }
    return true;
  }

  /*
   * Following email validation function taken from http://rosskendall.com/blog/web/javascript-function-to-check-an-email-address-conforms-to-rfc822
   */
  function isRFC822ValidEmail(sEmail) {

    var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
    var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
    var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
    var sQuotedPair = '\\x5c[\\x00-\\x7f]';
    var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
    var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
    var sDomain_ref = sAtom;
    var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
    var sWord = '(' + sAtom + '|' + sQuotedString + ')';
    var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
    var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
    var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
    var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
    
    var reValidEmail = new RegExp(sValidEmail);
    
    if (reValidEmail.test(sEmail)) {
      return true;
    }
    
    return false;
  }
});