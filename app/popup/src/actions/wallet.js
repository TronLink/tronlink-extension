export const INITIALIZE = "INITIALIZE"; //action when initially setting password.

export const unlockWallet = pass => ({
  type : INITIALIZE,
  pass : pass
});
