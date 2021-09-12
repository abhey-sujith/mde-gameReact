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
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CardActionArea from '@material-ui/core/CardActionArea';
import ReactWordcloud from 'react-wordcloud';

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
    background:'red'
   },
   green: {
    background:'green'
   },
   square:{width:'100%',height:30, background:'green'}
}));

function GameRoom(props) {
  const classes = useStyles();
    const dispatch = useDispatch();
    const history = useHistory();
    const name = useSelector(selectName);
    const roomid = useSelector(selectRoomid);
    const type = useSelector(selectType);
    const [players,setplayers] = useState([])
    const [adjective, setadjective] = useState([]);
    const [adjectiveArray, setadjectiveArray] = useState([]);
    const [isRoomCreator, setRoomCreator] = useState(false);
    const [isReady, setReady] = useState(false);
    const [Question, setQuestion] = useState("");
    const [Questionno, setQuestionno] = useState(null);
    const [playersChoices, setplayersChoices] = useState([]);
    const [WhatOtherPeopleChoseForPlayer, setWhatOtherPeopleChoseForPlayer] = useState([]);
    
    
    const [is_show_jahori_button_pressed, setshow_jahori_button_pressed] = useState(false);
    
    //johariiii
    const [self_others, setself_others] = useState([]);
    const [self_not_others, setself_not_others] = useState([]);
    const [not_self_but_others, setnot_self_but_others] = useState([]);
    const [not_self_not_others, setnot_self_not_others] = useState([]);


    // console.log(name,type,roomid);
    if(!name && !type){
      history.replace('/')
    }

    let room_instance= useRef(null)
    const [value, setValue] = useState("");

    useEffect(()=>{
      console.log("playersChoices---",playersChoices);
      const myselectionindexes = playersChoices.reduce((r, n, i) => {
        n === true && r.push(i);
        
        return r;
      }, []);
      console.log('myselectionindexes',myselectionindexes);
      console.log('WhatOtherPeopleChoseForPlayer',WhatOtherPeopleChoseForPlayer);
      console.log('adjectiveArray',adjectiveArray);

      var not_self_not_others_=[],not_self_but_others_=[],self_others_=[],self_not_others_=[];

      Array.from({length: adjectiveArray.length}, (_,element) => {
      if(myselectionindexes.includes(element)) return;
      else{
          
          if(WhatOtherPeopleChoseForPlayer[element]==0){
              not_self_not_others_.push({text:adjectiveArray[element],value:1})
          }else{
              not_self_but_others_.push({text:adjectiveArray[element],value:WhatOtherPeopleChoseForPlayer[element]})
          }

      }
      })



      myselectionindexes.forEach((element)=>{
      if(WhatOtherPeopleChoseForPlayer[element]>0){
      self_others_.push({text:adjectiveArray[element],value:WhatOtherPeopleChoseForPlayer[element]})
      }else{
      self_not_others_.push({text:adjectiveArray[element],value:1})
      }
      })
      

      setself_not_others(self_not_others_)
      setself_others(self_others_)
      setnot_self_but_others(not_self_but_others_)
      setnot_self_not_others(not_self_not_others_)
      console.log('self_others',self_others_)
      console.log('self_not_others',self_not_others_)
      console.log('not_self_but_others',not_self_but_others_)
      console.log('not_self_not_others',not_self_not_others_)
      },[is_show_jahori_button_pressed])



    useEffect(()=>{ 

      // final endpoint - ws://localhost:2567
      var endpoint = window.location.protocol.replace("http", "ws") + "//" + "mde-server.herokuapp.com";
      if (window.location.port && window.location.port !== "80") { endpoint += ":"  }
      
      console.log(endpoint);
      //connect to endpoint using client
      let client = new Colyseus.Client(endpoint);

      // function runs when connection is established either by create/join/reconnect
      // used also to add additional functions like onMessage/onLeave to the room
      // store the connected session to local storage so that reconnection can be tried
      const onjoin = () => {

        room_instance.current.onStateChange.once(function(state) {
          var arr =[];
          setadjectiveArray([...state.Adjectives]);

          [...state.Adjectives].forEach(element => {
              arr.push({adjective:element,selected:false,count:0})
          });
          setadjective(arr)
       });


        room_instance.current.state.players.onAdd = function (player, sessionId) {
          setplayers(prev => {
            // console.log('setter ,',map);
            return [...prev,{sessionId:sessionId,name:player.playerName,selected:false,playerState:'idle'}]
          });



          player.onChange = function (changes) {
            // console.log('changes-----------',changes);
            if(room_instance.current.sessionId=== sessionId){
            if(player.isRoomCreator){
                setRoomCreator(true)
              }

              setQuestion(player.Question)
              setQuestionno(player.Questionno)

              if(player.choice_of_adj_player){
                setplayersChoices(player.choice_of_adj_player)
              }
              setWhatOtherPeopleChoseForPlayer(player.choice_of_adj_otherplayers)
            }else{

            }


            if(player.playerState==="done"){
              setplayers(obj=>{
                // console.log('obj',obj);
                return obj.map(item => {
                  var temp = Object.assign({}, item);
                  if (temp.sessionId === sessionId) {
                      temp.playerState = "done";
                  }
                  return temp;   
              })
            })
            }
          }

        }
        
        room_instance.current.state.players.onRemove = function (player, sessionId) {

          setplayers(prev => {
            // console.log('setter ,',map);
            const items = prev.filter(item => item.sessionId !== sessionId);
            console.log(items);
            return [...items]
          });
        }

        //   room_instance.current.onStateChange(function(state) {
        //       setReady(state.ready)
        // 
        // });
        room_instance.current.onMessage("readychange", (data) => {
          if(data.value==='endgame'){
            setshow_jahori_button_pressed(true)
          }else{
            setReady(data.value)
          }
        });

        room_instance.current.onMessage("status", (message) => console.log(message));
        room_instance.current.onLeave(() => console.log("Bye, bye!"));

          localStorage.setItem("roomId", room_instance.current.id);
          localStorage.setItem("sessionId", room_instance.current.sessionId);
          localStorage.setItem("name", name);
      }

      const reconnect = () => {

        room_instance.current.onStateChange.once(function(state) {
          console.log('---------------------------in',state.ready,state);
          var arr =[];
          setadjectiveArray([...state.Adjectives]);

          [...state.Adjectives].forEach(element => {
              arr.push({adjective:element,selected:false,count:0})
          });
          setadjective(arr)
          if(state.ready==='start'){
            setReady(state.ready)
          }
          if(state.ready==='endgame'){
            alert('game has ended')
            history.replace('/')
          }
       });


        room_instance.current.state.players.onAdd = function (player, sessionId) {
          setplayers(prev => {
            // console.log('setter ,',map);
            return [...prev,{sessionId:sessionId,name:player.playerName,selected:false,playerState:'idle'}]
          });



          player.onChange = function (changes) {
            // console.log('changes-----------',changes);
            if(room_instance.current.sessionId=== sessionId){
            if(player.isRoomCreator){
                setRoomCreator(true)
              }

              setQuestion(player.Question)
              setQuestionno(player.Questionno)

              if(player.choice_of_adj_player){
                setplayersChoices(player.choice_of_adj_player)
              }
              setWhatOtherPeopleChoseForPlayer(player.choice_of_adj_otherplayers)
            }else{

            }


            if(player.playerState==="done"){
              setplayers(obj=>{
                // console.log('obj',obj);
                return obj.map(item => {
                  var temp = Object.assign({}, item);
                  if (temp.sessionId === sessionId) {
                      temp.playerState = "done";
                  }
                  return temp;   
              })
            })
            }
          }

        }
        
        room_instance.current.state.players.onRemove = function (player, sessionId) {

          setplayers(prev => {
            // console.log('setter ,',map);
            const items = prev.filter(item => item.sessionId !== sessionId);
            console.log(items);
            return [...items]
          });
        }

          room_instance.current.onStateChange(function(state) {
            if(state.ready==='endgame'){
              setshow_jahori_button_pressed(true)
            }else{
              setReady(state.ready)
            }
        
        });
        // room_instance.current.onMessage("readychange", (data) => {
        //   if(data.value==='endgame'){
        //     setshow_jahori_button_pressed(true)
        //   }else{
        //     setReady(data.value)
        //   }
        // });

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
          onjoin();
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
          onjoin();

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
            reconnect();
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




    const onPlayerSubmitClicked = () => {
      var result = Object.values(players).filter(obj => obj.selected===true).map(item => {
        return {sessionId:item.sessionId};   
    })
    console.log("click result---",result);
    setplayers(obj=>{
      // console.log('obj',obj);
          return obj.map(item => {
            var temp = Object.assign({}, item);
            if (temp.selected === true) {
                temp.selected = false;
            }
            return temp;   
        })
      })


    room_instance.current.send("answer", {value:result});
  }




    const showPlayers =()=>{
      return <div>
      <button onClick={onPlayerSubmitClicked}>submit</button>
  
        {players.length?players.map((data)=>{
       return (
        <Card className={[classes.root,data.selected?classes.color:null,data.state==='done'?classes.green:null]} key={data.sessionId} onClick={(e)=>{
          setplayers(obj=>{
            // console.log('obj',obj);
            return obj.map(item => {
              var temp = Object.assign({}, item);
              if (temp.sessionId === data.sessionId) {
                  temp.selected = !data.selected;
              }
              return temp;   
          })
        })
        }}>
          <CardActionArea>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography component="h5" variant="h5">
              {data.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {data.sessionId}
            </Typography>
            <div className={{width:'100%',height:10, background:'green'}}>
            </div>
          </CardContent>
        </div>
        {data.playerState==='done'?<div className={classes.square}>
        </div>:null}
        </CardActionArea>
      </Card>
        )}):null}
      </div>
    }




    const showPlayersWithoutClick =()=>{
      return <div>  
        {players.length?players.map((data)=>{
       return (
        <Card className={[classes.root,data.changebgcolor?classes.color:null,data.state==='done'?classes.green:null]} key={data.sessionId} onClick={(e)=>{
        }}>
          <CardActionArea>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography component="h5" variant="h5">
              {data.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {data.sessionId}
            </Typography>
            
          </CardContent>
        </div>
        </CardActionArea>
      </Card>
        )}):null}
      </div>
    }





    const onReadyClicked = () => {
      if(players.length>1){
        room_instance.current.send("ready", { value: 'start'});
      }else{
        alert('Please add one more player')
      }
    }

    function GameReadyScreen(props) {
      return <div>
      <h1>Game Screen Room</h1>
      <h2>{(room_instance?.current?.id?("Room id :- "+room_instance.current.id):null)}</h2>
      <h2>{name}</h2>
      {isRoomCreator?  <button onClick={onReadyClicked}>Ready</button>:null}
      {showPlayersWithoutClick()}
    
    </div>
    }

    const showResultToAll = () =>{
      room_instance.current.send("endgame", {value:'endgame'});
      setshow_jahori_button_pressed(true)
    }

    function GameWaitingScreen(props) {
    return <div>
    {isRoomCreator? <button onClick={showResultToAll}>submit</button>:null}
    <h2>Waiting for players to finish</h2>
    {showPlayersWithoutClick()}
    </div>
    }




    const callbacks = {
      // getWordColor: word => word.value > 50 ? "blue" : "red",
      // onWordClick: console.log,
      // onWordMouseOver: console.log,
      // getWordTooltip: word => `${word.text} (${word.value}) [${word.value > 50 ? "good" : "bad"}]`,
    }
    const options = {
      colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"],
      enableTooltip: true,
      deterministic: false,
      fontFamily: "impact",
      fontSizes: [5, 60],
      fontStyle: "normal",
      fontWeight: "normal",
      padding: 1,
      rotations: 3,
      rotationAngles: [0, 0],
      scale: "sqrt",
      spiral: "archimedean",
      transitionDuration: 1000
    };
    const size = [600, 400];

    function GameResult(props) {

      return <div>
      <h2>Result</h2>
      <h2>Arena - Known to self and others</h2>
      <ReactWordcloud
      callbacks={callbacks}
      options={options}
      size={size}
      words={self_others}
    />
     <h2>Blind Spot  -Not known to self but known to others</h2>
      <ReactWordcloud
      callbacks={callbacks}
      options={options}
      size={size}
      words={not_self_but_others}
    />
     <h2>Facade - Known to self but not known to others</h2>
      <ReactWordcloud
      callbacks={callbacks}
      options={options}
      size={size}
      words={self_not_others}
    />
     <h2>Arena -Not known to self and others</h2>
      <ReactWordcloud
      callbacks={callbacks}
      options={options}
      size={size}
      words={not_self_not_others}
    />
      </div>
      }




      const onPlayerAdjectivesSubmitClicked = () => {
        var arr=[];
        Object.values(adjective).map(item => {
          arr.push(item.selected);   
      })
      console.log("click result---",arr);

      room_instance.current.send("answerforQ0", {value:arr});



      setplayers(prev => {
        // console.log('setter ,',map);
        const items = prev.filter(item => item.sessionId !== room_instance.current.sessionId);
        console.log(items);
        return [...items]
      });
    }


  
    const showAdjectives =()=>{
      return <div>
      <button onClick={onPlayerAdjectivesSubmitClicked}>submit</button>
  
        {adjective.length?adjective.map((data)=>{
        return (
        <Card className={[classes.root,data.selected?classes.color:null,data.state==='done'?classes.green:null]} key={data.adjective} onClick={(e)=>{
          setadjective(obj=>{
            // console.log('obj',obj);
            return obj.map(item => {
              var temp = Object.assign({}, item);
              if (temp.adjective === data.adjective) {
                  temp.selected = !data.selected;
              }
              return temp;   
          })
        })
        }}>
          <CardActionArea>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography component="h5" variant="h5">
              {data.adjective}
            </Typography>
          </CardContent>
        </div>
        </CardActionArea>
      </Card>
        )}):null}
      </div>
    }




    const showQuestions =() =>{
      return <div>
      <h2>{Questionno+1 + " :- "+ Question}</h2>
      {Questionno===0?showAdjectives():showPlayers()}
      </div>
    }



    function GameStartScreen(props) {
      return <div>
      <h1>StartGame</h1>
      <h2>{(room_instance?.current?.id?("Room id :- "+room_instance.current.id):null)}</h2>
      <h2>{name}</h2>


      {Questionno!==-1? showQuestions(): GameWaitingScreen()}

      </div>;
    }

    return (
      <div className="App">
        <header className="App-header">
        {is_show_jahori_button_pressed?GameResult():isReady==='start'?GameStartScreen():GameReadyScreen()}
        </header>
      </div>
    );
  }

  export default GameRoom;