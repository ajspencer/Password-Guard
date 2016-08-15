# Password Guard
Password Guard is a chrome extension that guards against client side theft of password by encrypting the value of password input fields. If a user tries to access the value of the password field, or change the display type to text, they won't be able to learn the password because only the encrypted version will be displayed. 

## Encryption Process
Each time a page is loaded, a unique encryption process is created by the EncryptionSuite contained in encryptor.js by randomly mapping every ASCII character to another one. EncryptionSuite has two methods encrypt and decrypt which both take a sting and encrypt and decrypt, respectively, according to the mapping generated when the page was loaded. When the page is submitted, the password is decrypted and sent along with the form. To ensure that a malicious user can not stop the submission
process and view the password, the password is encrypted again after a couple seconds. 

##Contributing
There are currently several issues in the project, as described in the issues page. I'm not sure of the best solution to these issues, so I'd love advice or patches.
