"use strict";
(function() {
    /*
        Returns all of the input elements that as of type password

        return passwordInputs | all of the input elements on the page that are of type password
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
        Binds the encryption daemon to all of the input elements specified.
        The encryption daemon ensures that the text in the input is always
        encrypted until the page is submitted or exited.

        param inputs | the input elements on the page that should be encrypted
    */
    function bindEncryptionDaemon(inputs) {
        var encryptor = new EncryptionSuite();
        //Key: elementId, value: old value of element
        var oldVals = {};
        console.log(inputs);
        //For every password input bind our change function to them to change the letters
        $(inputs).each(function () {
            var elem = $(this);
            var autoFillDetected = false;
            oldVals[elem.id] = "";

            // Look for changes in the value
            var changeProperty = function (event) {
                if (oldVals[elem.id] != elem.val()) {
                    autoFillDetected = true;
                    //Start comparing
                    var oldValIndex = 0, newValIndex = 0, oldVal = oldVals[elem.id], newVal = elem.val();
                    var commonSequence = "";
                    //We have either 1 or 2 common sequences, so return
                    var commonSequences = [];
                    var sameIndex = [];
                    /*
                        The are three cases: either the value is appended, the value was prepended, or the value was inserted in the middle
                        If the value as appended or prepended, there is exactly 1 common sequence between the two strings, which occurs at
                        either the front or the back, followed by a sequence of different characters. If the value was inserted, then there are
                        2 common sequences which occur before and after the inserted value. We use this method to find the common sequences and
                        then insert them in the correct location.
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
                    oldVals[elem.id] = newPassword;
                }
                if(autoFillDetected == false) {
                    console.log("set that timeout");
                    setTimeout(changeProperty, 100);
                }
            };
            elem.bind("propertychange change click keyup input paste", changeProperty);
            setTimeout(changeProperty, 100);
        });
        //Now add the listener for the form submitting
        $("form").on('submit', function (e) {
            console.log("on submit function called");
            var decryptedText = "";
            $(inputs).each(function () {
                //console.log("current password: " + $(this).val());
                decryptedText = encryptor.decrypt($(this).val());
                $(this).val(encryptor.decrypt($(this).val()));
                console.log("resetting password to: " + $(this).val());
            });
        });
    }

    //Get the password inputs, pass that to the bind encryption daemon function
    //TODO: figure out issue with bank of america changing the input type to text right before the form submits
    //TODO: figure out dropbox issue
    var host = window.location.host;
    if(! host.includes("bankofamerica") ) {
        var inputs = getPasswordInputs();
        bindEncryptionDaemon(inputs);
    }
})();
