import React from 'react'; 
import {
    Route,
    Switch
  } from 'react-router-dom';

// route used to create/join a room
import Home from '../components/home'
// route used for the game logic 
import GameRoom from '../components/gameRoom'

const RouteList=()=>
{
  return  (
            <Switch>
            <Route exact path='/' component={Home}></Route>
            <Route exact path='/gameroom' component={GameRoom}></Route>
            </Switch>
          );
}
  
export default RouteList;