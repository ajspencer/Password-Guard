"use strict";
(function(global) {

    /*
        Encryption suite is used to handle the encryption and decryption of characters. 
        It does this by remapping every ascii character to another one. A process that is 
        done in the constructor
    */
    function EncryptionSuite() {
        Math.seedrandom();
        //Make an array of every printable ascii character
        var asciiValues = [];
        for(var i = 32; i < 256; i++) {
            //Don't do anything for ascii values that are blank or not printable
            asciiValues.push(String.fromCharCode(i));
        }
        this.vals = {};
        //Now set every ascii value to map to a random, different ascii value
        for(var i = 32; i < 254; i++) {
            //Don't do anything for ascii values that are blank or not printable
            var index = Math.floor(Math.random()*asciiValues.length);
            this.vals[String.fromCharCode(i)] = asciiValues[index];
            asciiValues.splice(index,1);
        }
        console.log("the mappings are: ");
        console.log(this.vals);
    }

    /*
        Encrypt takes a message and uses the key set by EncryptionSuite to call
        the library encryption function and return the encrypted message

        param message | the message we are encrypting

        return cipherText | the encrypted message
    */
    EncryptionSuite.prototype.encrypt = function (message) {
        var returnMessage = "";
        for(var i = 0; i < message.length; i++) { 
            returnMessage += this.vals[message.charAt(i)];
        }
        return returnMessage;
    };

    /*
         Decrypt takes a character and returns our corresponding representation of it

         param cipherText | the character the decrypt

         return returnMessage | the decrypted character
     */
    EncryptionSuite.prototype.decrypt = function(cipherMessage) {
        var returnMessage = "";
        for(var i = 0; i < cipherMessage.length; i++) {
            var cipherChar = cipherMessage.charAt(i);
            //Iterate through all of our properties and find the one we remapped charater to
            for (var key in this.vals) {
                //Filter through all the built in properties
                if (this.vals.hasOwnProperty(key)) {
                    if (this.vals[key] == cipherChar) returnMessage += key;
                }
            }
        }
        return returnMessage;
    };
    global.EncryptionSuite = EncryptionSuite;
})(window);
