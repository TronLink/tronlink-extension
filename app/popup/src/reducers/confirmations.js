const initialState = {
    confirmations : [
        {
            id : 1,
            type : "send",
            to : "T11111111111111111111111111111111",
            from : "T2222222222222222222222222222222",
            amount : "1234"
        }
    ]
};

export function confirmationsReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

