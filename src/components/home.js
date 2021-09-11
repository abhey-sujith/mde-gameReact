import {
    useHistory
  } from 'react-router-dom';
import { useEffect,useState } from "react";
import TextField from '@material-ui/core/TextField';
import { useDispatch } from 'react-redux';
import {
    details
  } from '../app/slice/gameSlice';

function Home(props) {
    const dispatch = useDispatch();
    let history = useHistory();

    const [room_id, setRoom_id] = useState("");
    const [name, setName] = useState("");
    const [helperTextName, setHelperTextName] = useState("");
    const [errorNameField, setErrorNameField] = useState(false);
    const [helperTextRoomId, setHelperTextRoomId] = useState("");
    const [errorRoomId, setErrorRoomId] = useState(false);
    const [roomIdlocalStorage, setRoomIdLocalStorage] = useState(null);
    const [localStorageName, setLocalStorageName] = useState("");
    const [sessionidd, setsessionidd] = useState("");


    // used to check if there is a roomid in local storage so that reconnection can be tried
    useEffect(()=>{
        var rId = localStorage.getItem("roomId");
        var n = localStorage.getItem("name");
        var s = localStorage.getItem("sessionId");
        if(rId){
            setRoomIdLocalStorage(rId)
            setLocalStorageName(n)
            setsessionidd(s)
        }
    },[])

    // when the join button is pressed and when the value inside room_id is empty 
    // the set error for the room_id textfield (also if name field is empty set error ) 
    // if all the text field has value then after onJoinButtonPressed function is executed , handleFormSubmit will be executed (as there is no e.preventDefault() to prevent it from going to the "submit" handler function)
    // https://codepen.io/dzello/pen/wgLZYN
    const onJoinButtonPressed = (e) => {
        console.log('You clicked submit.',room_id);
        if(room_id===""){
            setHelperTextRoomId("Enter the room id to join")
            setErrorRoomId(true)
            if(name===""){
                setHelperTextName("")
                setErrorNameField(true)
            }
            e.preventDefault();
        }
      }

    // runs when form is submitted
    const handleFormSubmit =(e) =>{
    e.preventDefault();
    console.log('You clicked submit2.');

    console.log("in home",name,room_id);

    if (name.length > 60) {
        return;
    } else{

        if (room_id){
            if (room_id.length < 4 || room_id.length >=5) {
                return;
            } else{
                dispatch(details({name:name.trim(),roomid:room_id, type:'join' }))
                history.push("/gameroom");
            }
    
            
        }else{
            dispatch(details({name:name.trim(),type:'create' }))
            history.push("/gameroom");
        }
    }
    


    
    }

    // function to try reconnecting to a room
    const onReconnectPressed =(e) => {
    e.preventDefault();
    console.log('You clicked submit3.');
    dispatch(details({name:localStorageName,type:'reconnect' }))
    history.push("/gameroom");
    }


    return (
      <div className="App">
        <div className="App-header">

            {/* form contains 2 buttons and 2 input field
                buttons - create room and join room
                inputs  - Name and roomid (used to join a room)
            */}
            <form autoComplete="off" onSubmit={handleFormSubmit}>
            
            <h1>Enter Name</h1>

            {/* input name */}
            <TextField 
            error ={errorNameField}
            required
            helperText={helperTextName} 
            id="outlined-basic" 
            label="Name" variant="outlined" 
            value={name} 
            onChange={(v)=>{
                // check if value is a alphabet (upper and lower) and a space
                if(!(/[^a-zA-Z ]/).test(v.target.value)){
                // setting name
                setName(v.target.value.toUpperCase())

                // new validation for name can be added here 
                if (v.target.value.length < 60) {
                    setHelperTextName("")
                    setErrorNameField(false)
                } 
                else {
                    setHelperTextName("")
                    setErrorNameField(true)
                }
            }}
            }/>


            <h1>Create Room</h1>
            <button type="submit">Create</button>

            <h1>Join</h1>

            {/* input room id */}
            <TextField 
            error ={errorRoomId}
            helperText={helperTextRoomId} 
            id="outlined-basic" 
            label="Room id" 
            variant="outlined" 
            value={room_id} 
            onChange={(v)=>{
                // check if value is a alphabet (upper and lower)
                if(!(/[^a-zA-Z]/).test(v.target.value)){
                    setRoom_id(v.target.value.toUpperCase())
                    
                    // validation
                    if (v.target.value.length >= 4 && v.target.value.length <5) {
                        setHelperTextRoomId("")
                        setErrorRoomId(false)
                    } 
                    else {
                        setHelperTextRoomId("")
                        setErrorRoomId(true)
                    }
            }
            }}/>

            <button type ='submit' onClick={onJoinButtonPressed}>Join</button>

            </form>

            {/* if room id is in localstorage then try to reconnect */}
            {/* TODO: change it to check based on time instead */}
            {roomIdlocalStorage?<form onSubmit={onReconnectPressed}>
            <h1>{("Reconnect to Room " +roomIdlocalStorage +" as "+localStorageName + 'sid' + sessionidd)}</h1>
            <button type="submit">Create</button>
            </form>:null}
     
        </div>
      </div>
    );
  }

  export default Home;