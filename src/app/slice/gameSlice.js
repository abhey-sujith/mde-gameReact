import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  name:null,
  roomid:null,
  type:null,
};


export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    details: (state, action)  => {
      console.log("in state----------",action.payload.type);
      state.name = action.payload.name;
      state.type=action.payload.type;
      if(action.payload.roomid){
      state.roomid=action.payload.roomid;
      }
    },
    clear: (state)  => {
      state.name = null;
      state.type=null;
      state.roomid=null;
    },
   
  },

  extraReducers: (builder) => {

  },
});

export const { details ,clear} = gameSlice.actions;

export const selectName = (state) => state.game.name;
export const selectRoomid = (state) => state.game.roomid;
export const selectType = (state) => state.game.type;

export default gameSlice.reducer;
