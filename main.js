"use strict";
(function(global) {
    var encryptor = new EncryptionSuite();
    var inputs = getPasswordInputs();
    var encryptionOn = false;
    var oldVals = {};
    var autoFillDetected = false;
    var autoFillAttempts = 0;

   /*
    * Returns all of the input elements that as of type password
    *
    * return passwordInputs | all of the input elements on the page that are of type password
    */
    function getPasswordInputs() {
        //Get all of the inputs, then all of the inputs whose type is password
        var inputs = document.getElementsByTagName('input');
        var passwordInputs = [];
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type.toLowerCase() == "password") passwordInputs.push(inputs[i]);
        }
        return passwordInputs;
    }

   /* 
    * Detects changes to the input to the function this is called on. 
    * Since this is always called as as callback, the caller is expected 
    * to bind the element to the function so it can be referenced using this.
    */
    function detectInputChange() {
        var autoFillDetected = true;
        var elem = $(this);
        console.log("elem is:");
        console.log(elem);
        console.log("elem id:");
        console.log(elem.attr('id'));
        if (oldVals[elem.attr('id')] != elem.val()) {
            autoFillDetected = true;
            //Start comparing
            var oldValIndex = 0, newValIndex = 0, oldVal = oldVals[elem.attr('id')], newVal = elem.val();
            var commonSequence = "";
            //We have either 1 or 2 common sequences, so return
            var commonSequences = [];
            var sameIndex = [];
            /*
             *  The are three cases: either the value is appended, the value was prepended, or the value was inserted in the middle
             *  If the value as appended or prepended, there is exactly 1 common sequence between the two strings, which occurs at
             *  either the front or the back, followed by a sequence of different characters. If the value was inserted, then there are
             *  2 common sequences which occur before and after the inserted value. We use this method to find the common sequences and
             *  then insert them in the correct location.
             */
            console.log("starting loop with oldVal:" + oldVal + "newVal: " + newVal+"\n");
            while(oldValIndex < oldVal.length && newValIndex < newVal.length) {
                if( oldVal[oldValIndex] == newVal[newValIndex]) {
                    commonSequence += oldVal[oldValIndex];
                    sameIndex.push(newValIndex >= oldValIndex ? newValIndex : oldValIndex);
                    oldValIndex++;
                    newValIndex++;
                    console.log("they were the same so same sequence is now: " + commonSequence);
                }
                //If they both have the same amount remaining towards the end, increment both
                else if(oldVal.length - oldValIndex == newVal.length - newValIndex) {
                    //if I was at a common sequence before reaching this, increment that
                    if(commonSequence != "") {
                        commonSequences.push(commonSequence);
                        commonSequence = "";
                    }
                    oldValIndex++;
                    newValIndex++;
                }
                //if old val is longer, then ignore that character
                else if(oldVal.length - oldValIndex > newVal.length - newValIndex) {
                    if (commonSequence != "") {
                        commonSequences.push(commonSequence);
                        commonSequence = "";
                    }
                    oldValIndex++;
                }
                //Do the symmetric thing for newval
                else if(oldVal.length - oldValIndex < newVal.length - newValIndex) {
                    if(commonSequence != "") {
                        commonSequences.push(commonSequence);
                        commonSequence = "";
                    }
                    newValIndex++;
                }
                else {
                    alert("we reached the while in the loop something went wrong");
                }
            }
            if(commonSequence != "") commonSequences.push(commonSequence);
            var newPassword = "";
            console.log("old val:" + oldVal);
            console.log("new val:" + newVal);
            console.log(commonSequences);
            console.log(sameIndex);
            //If there are no common sequences, one is empty, so just set the password to be encrypted newVal
            if(commonSequences.length == 0) {
               newPassword = encryptor.encrypt(newVal);
            }
            //If we only have one common sequence, it goes at either the start or the end
            else if(commonSequences.length == 1) {
                //If our common sequence begins at the start and there's only one, that means we appended something
                if(sameIndex[0] == 0) {
                    console.log("length one, same index 0");
                    console.log(commonSequences[0].length);
                    newPassword = commonSequences[0] + encryptor.encrypt(newVal.substr(commonSequences[0].length));
                }
                //If our common sequence does not begin at the start, that means we prepended something
                else newPassword = encryptor.encrypt(newVal.substr(0, sameIndex[0])) + commonSequences[0];
            }
            //Now if there are 2 common sequences, that means it was changed in the middle, so adjust for that
            else if(commonSequences.length == 2) {
                var firstDifferent = -1;
                var differentLength = 1;
                for(var i = 0; i < sameIndex.length-1; i++) {
                    if(i != sameIndex[i]) {
                        firstDifferent = i;
                        differentLength = sameIndex[i] - sameIndex[i-1] - 1;
                        console.log("different length: " + differentLength + " i: " + i);
                        break;
                    }
                }
                if(firstDifferent == -1) alert("first different is -1 something went wrong");
                if(newVal.length > oldVal.length) newPassword = commonSequences[0] + encryptor.encrypt(newVal.substr(firstDifferent, differentLength)) + commonSequences[1];
                else newPassword = commonSequences[0] + commonSequences[1];
            }
            else {
                console.log(commonSequences);
                alert("common sequence length more than two something went wrong\n");
            }
            // Updated stored value and value
            console.log("new password: " + newPassword);
            elem.val(newPassword);
            oldVals[elem.attr('id')] = newPassword;
        }
        //Ensure that we can detect autofill by running this function every 
        //second until something changes, or we have run it ten times.
        if(autoFillDetected == false) {
            autoFillAttempts++;
            if(autoFillAttempts >= 10) autoFillDetected = true;
            console.log("set that timeout");
            setTimeout(detectInputChange.bind(elem), 500);
        }
    };

   /*
    * Event handler to be called when the form is submitted
    * For every input, it hides the input and then changes the password back
    * Note: the inputs are bound to the function call be the caller
    */
    function formSubmission() {
        var inputs = $(this);
        console.log("on submit function called");
        $(inputs).each(function () {
            //console.log("current password: " + $(this).val());
            var encryptedText = $(this).val();
            var decryptedText = encryptor.decrypt($(this).val());
            //if someone has changed this to text, hide it
            console.log($(this));
            console.log($(this).prop("type"));
            if($(this).prop("type").toLowerCase() === "text") {
                $(this).hide();
            }
            $(this).val(encryptor.decrypt($(this).val()));
            console.log("resetting password to: " + $(this).val());
            //Give two seconds for the password to be unencrypted, then reset it back
            setTimeout(function() {
                console.log("changing back");
                $(this).val(encryptedText);
            }, 2000);
        });
    }


   /*
    * Binds the encryption daemon to all of the input elements specified.
    * The encryption daemon ensures that the text in the input is always
    * encrypted until the page is submitted.
    *
    * param inputs | the input elements on the page that should be encrypted
    */
    function turnEncryptionOn(inputs) {
        var host = window.location.host;
        if(host.includes("bankofamerica")) return;
        //This won't work on bank of america because of how they handle passwords
        console.log(inputs);
        //For every password input bind our change function to them to change the letters
        $(inputs).each(function (index, elem) {
            var elem = $(elem);
            oldVals[elem.attr('id')] = "";
            console.log("id: " + elem.attr('id'));
            // Look for changes in the value
            elem.bind("propertychange change click keyup input paste", detectInputChange.bind(elem));
            setTimeout(detectInputChange.bind(elem), 500);
        });
        //Now add the listener for the form submitting
        $("form").each(function() {
            console.log("adding to form: ");
            console.log($(this));
            $(this).bind("submit", formSubmission.bind(inputs));
        });

        //If the form doesn't have a submit button, bind the events to the anchor tags and buttons
        if($("form").find('input[type="submit"]').length == 0) {
            ($("form").find('a')).each(function() {
                console.log("binding click on");
                console.log($(this));
                $(this).bind("click", formSubmission.bind(inputs));
            });
        }
        //Listen for events on all buttons with login or sign in in their id
        $("button").each(function() {
            console.log("button");
            console.log($(this).prop("id"));
            if($(this).prop("id") && ( $(this).prop("id").toLowerCase().includes("signin") || $(this).prop("id").toLowerCase().includes("login") ) ) {
                $(this).bind("click", formSubmission.bind(inputs));
            }
        });
    }

   /*
    * Turns the encryption process off by unbinding all of the event 
    * handlers and resetting the global variables
    *
    * param inputs | the input elements on the page that should be encrypted
    */
    function turnEncryptionOff(inputs) {
        oldVals = {};
        autoFillDetected = false;
        autoFillAttempts = 0;
        //Unbind from all of the input elements
        $(inputs).each(function(index, elem) {
            var decryptedText = encryptor.decrypt($(this).val());
            $(this).val(decryptedText);
            var elem = $(elem);
            elem.unbind("propertychange change click keyup input paste");
        });

        //Now unbind the listener for the form submitting
        $("form").each(function() {
            $(this).unbind("submit");
        });

        //unbind anchor tags and butttons
        if($("form").find('input[type="submit"]').length == 0) {
            ($("form").find('a')).each(function() {
                $(this).unbind("click");
            });
        }
        //Listen for events on all buttons with login or sign in in their id
        $("button").each(function() {
            if($(this).prop("id") && ( $(this).prop("id").toLowerCase().includes("signin") || $(this).prop("id").toLowerCase().includes("login") ) ) {
                $(this).unbind("click");
            }
        });
    }

   /*
    * Toggles the state of encryption
    */
    function toggleEncryption() {
        console.log("toggling");
        if(encryptionOn) {
            encryptionOn = false;
            turnEncryptionOff(inputs);
        }
        else {
            encryptionOn = true;
            turnEncryptionOn(inputs);
        }
    }

    //Set the encryption initally and make it available globally
    toggleEncryption();
    global.toggleEncryption = toggleEncryption;
})(window);
