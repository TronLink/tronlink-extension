import TronUtils from 'tronutils';
const algorithm = "aes-256-ctr";
const WALLET_LOCALSTORAGE_KEY = "TW_WALLET";

function encrypt(text, password) {
  let cipher = crypto.createCipher(algorithm, password);
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

function decrypt(text, password) {
  let decipher = crypto.createDecipher(algorithm, password);
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

export default class Wallet {
  constructor(){
    this.loadStorage();
  }

  loadStorage(){
    try{
      this.storage = JSON.parse(window.localStorage.getItem(WALLET_LOCALSTORAGE_KEY));
    }catch (e) {
      this.storage = {}
    }
  }

  saveStorage(pass = null){
    if(pass === null)
      throw "Storage can't be saved without a password.";

    /*THIS MUST NEVER CONTAIN UNENCRYPTED INFORMATION*/
    let toStore = {
      encrypted : encrypt(JSON.stringify(this.storage.decrypted), pass)
    };

    window.localStorage.setItem(WALLET_LOCALSTORAGE_KEY, JSON.stringify(toStore));
  }

  initWallet(pass = null){
    if(this.storage.encrypted !== null)
      throw "Wallet cannot be initialized while another wallet already exists.";
    if(pass === null)
      throw "Wallet cannot be initialized without passing a password.";

    this.storage.decrypted = {
      wallet : TronUtils.accounts.generateRandomBip39()
    };
    this.saveStorage(pass);
  }

  unlockWallet(pass = null){
    try{
      this.storage.decrypted = JSON.parse(decrypt(this.storage.encrypted, pass));
      return true;
    }catch (e) {
      console.log("error unlocking wallet");
      console.log(e);
      return false;
    }
  }
}