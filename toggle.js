"use strict";
/*
 * This script contains the logic for allowing the client to turn the 
 * encryption process on and off using their master password.
 */
$(function() {
    //Bind event handler to toggle the visibility of the password field
    $("#showPassword").bind("click", function() {
       $("#passwordField").toggle(300);
    });
    //When the toggle button is clicked, all the toggle encryption function on every tab in chrome
    $("#toggle").bind("click", function() {
        if($(this).html() == "Turn off") {
            $(this).html("Turn on");
            $("#showPassword").html("Turn encryption on");
        }
        else {
            $(this).html("Turn off");
            $("#showPassword").html("Turn encryption off");
        }
       $("#passwordField").toggle(300);
        chrome.tabs.executeScript( null, {code:"toggleEncryption();"});
    });
});
