import { useEffect,useState ,useRef} from "react";
import * as Colyseus from 'colyseus.js'
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import {
  selectName,
  selectRoomid,
  selectType,
  clear
} from '../app/slice/gameSlice';
import { makeStyles, useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    margin:10,
    width:250
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  cover: {
   width:"100%",
    height:"100px",
  },
  color: {
    background:'black'
   },
   green: {
    background:'green'
   },
}));

function GameRoom(props) {
  const classes = useStyles();
    const dispatch = useDispatch();
    const history = useHistory();
    const name = useSelector(selectName);
    const roomid = useSelector(selectRoomid);
    const type = useSelector(selectType);




    // console.log(name,type,roomid);
    if(!name && !type){
      history.replace('/')
    }

    let room_instance= useRef(null)
    const [value, setValue] = useState("");

    
    useEffect(()=>{ 

      // final endpoint - ws://localhost:2567
      var endpoint = window.location.protocol.replace("http", "ws") + "//" + window.location.hostname;
      if (window.location.port && window.location.port !== "80") { endpoint += ":2567" }
      
      // console.log(endpoint);
      //connect to endpoint using client
      let client = new Colyseus.Client(endpoint);

      // function runs when connection is established either by create/join/reconnect
      // used also to add additional functions like onMessage/onLeave to the room
      // store the connected session to local storage so that reconnection can be tried
      const onjoin = () => {

        room_instance.current.onStateChange.once(function(state) {

       });


        room_instance.current.state.players.onAdd = function (player, sessionId) {

          player.onChange = function (changes) {
            // console.log('changes-----------',changes);
            if(room_instance.current.sessionId=== sessionId){

            }else{
            }
          }

        }
        
        // room.state.players.onRemove = function (player, sessionId) {
        // }

          room_instance.current.onStateChange(function(state) {
        });

        room_instance.current.onMessage("status", (message) => console.log(message));
        room_instance.current.onLeave(() => console.log("Bye, bye!"));

          localStorage.setItem("roomId", room_instance.current.id);
          localStorage.setItem("sessionId", room_instance.current.sessionId);
          localStorage.setItem("name", name);
      }

      const clearStorage = () => {
        localStorage.removeItem("roomId");
        localStorage.removeItem("sessionId");
        localStorage.removeItem("name");

        dispatch(clear())
      }

      // type can contain 3 things (create/join/reconnect)
      if(type==='create'){

        // create a new room 
        client.create("my_room",{name:name}).then(room => {
          room_instance.current=room;
          onjoin('create');
          room.send('roomcreator',{value:true})

          // console.log("created room");
          
    

          
    
          // listen to patches coming from the server
          room.onMessage("messages", (message) =>{
            setValue(message);
          });
         
        }).catch((e)=>{
          console.log('error');
          console.log(e);
          clearStorage();
          alert('could not create');
          history.goBack();
        });
      }
      else if(type==='join'){

      // join a room by id
        client.joinById(roomid,{name:name}).then(room => {
          room_instance.current=room;
          onjoin('join');

          console.log("joined room");
       

          // listen to patches coming from the server
          room.onMessage("messages", (message) =>{
            setValue(message);

          });
         
        }).catch((e)=>{
          //todo: redirect
          console.log('error');
          console.log(e);
          clearStorage();
          alert(e);
          history.goBack();
        });
      }      
      else if(type==='reconnect'){
        var roomId = localStorage.getItem("roomId");
        var sessionId = localStorage.getItem("sessionId");

        console.log('in reconnnnnect',roomId);
  
        if(roomId && sessionId){
          //try reconnecting to the room
          client.reconnect(roomId, sessionId).then(room => {
            room_instance.current = room;
            console.log(room);
            onjoin('reconnect');
            console.log("Reconnected successfully!");

        // listen to patches coming from the server
        room.onMessage("messages", (message) =>{
          setValue(message);
        });
        }).catch(e => {
            console.error("Error", e);

            clearStorage();
          alert('could not reconnect');
            history.replace('/',{});
        });
        }else{
          clearStorage();
          alert('could not reconnect');
          history.replace('/',{});
        }
      }
      else{
        //redirect to home
        history.replace('/');
      }
    },[])

    // if reload is pressed the pop up is shown to cancel
    useEffect(() => {
      window.addEventListener("beforeunload", alertUser);
      window.onpopstate = (e) =>{
        localStorage.setItem("roomId", room_instance.current.id);
          localStorage.setItem("sessionId", room_instance.current.sessionId);
          localStorage.setItem("name", name);
        alert("You are leaving the page");
      };
      return () => {
        window.removeEventListener("beforeunload", alertUser);
        window.onpopstate = () => {}
        room_instance?.current?.leave(false);
      };
    }, []);

    const alertUser = (e) => {
      e.preventDefault();
      e.returnValue = '';
      // console.log(e);
      // console.log(room_instance.current.id,room_instance.current.sessionId);
      // history.replace('/',{})

      localStorage.setItem("roomId", room_instance.current.id);
      localStorage.setItem("sessionId", room_instance.current.sessionId);
      localStorage.setItem("name", name);

    };

    // functiion to leave the room
    const leave = () => {
      if (room_instance.current) {
        room_instance.current.connection.close();

      } else {
        console.warn("Not connected.");
      }
    }





    function GameReadyScreen(props) {
      return <div>
      <h1>Game Screen Room</h1>
      <h2>{(room_instance?.current?.id?("Room id :- "+room_instance.current.id):null)}</h2>
      <h2>{name}</h2>
    
    </div>
    }


    function GameOverScreen(props) {
    return <div>
    <h2>Waiting for players to finish</h2>

    </div>
    }

    function GameResult(props) {

      return <div>
      <h2>show result</h2>
      
      </div>
      }

    function GameStartScreen(props) {
      return <div>
      <h1>StartGame</h1>
      <h2>{(room_instance?.current?.id?("Room id :- "+room_instance.current.id):null)}</h2>
      <h2>{name}</h2>


      </div>;
    }
    return (
      <div className="App">
        <header className="App-header">
        {GameReadyScreen()}
      {/* {isready==='end'?GameResult():(isready==='start'?GameStartScreen():GameReadyScreen())} */}

        </header>
      </div>
    );
  }

  export default GameRoom;